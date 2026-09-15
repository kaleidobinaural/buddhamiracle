import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase';

// Helper to sanitize quotes, just in case
const cleanContent = (text: string) =>
  text.replace(/^[\u201C\u201D\u2018\u2019"']+|[\u201C\u201D\u2018\u2019"']+$/g, '').trim();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, content, targetLocale } = body;

    if (!id || !content || !targetLocale) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (targetLocale === 'en') {
       return NextResponse.json({ translation: content });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
    }

    // 1. Translate via Gemini
    const systemInstruction = "You are a professional Buddhist translator. Translate the given scripture accurately and poetically. Respond ONLY with the translated text, no markdown, no quotes, no conversational filler.";
    
    const modelId = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const geminiBody = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{
        role: 'user',
        parts: [{ text: `Translate the following to language code '${targetLocale}':\n\n${content}` }],
      }],
      generationConfig: { temperature: 0.3, topK: 10, topP: 0.95 },
    };

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
    }

    const data = await res.json();
    let translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    translatedText = cleanContent(translatedText);

    if (!translatedText) {
       return NextResponse.json({ error: 'Empty translation returned' }, { status: 500 });
    }

    // 2. Cache it in Supabase atomically via RPC to avoid race conditions
    const supabaseAdmin = getSupabaseAdmin();
    
    // Attempt atomic RPC merge first
    const { error: rpcError } = await supabaseAdmin.rpc('save_scripture_translation', {
      p_id: id,
      p_locale: targetLocale,
      p_translation: translatedText,
    });

    if (rpcError) {
      // Fallback: If RPC function hasn't been run yet in Supabase SQL editor
      console.warn('RPC save_scripture_translation fallback:', rpcError.message);
      const { data: currentData } = await supabaseAdmin
        .from('scriptures')
        .select('translations')
        .eq('id', id)
        .single();
      const currentTranslations = currentData?.translations || {};
      const updatedTranslations = { ...currentTranslations, [targetLocale]: translatedText };
      await supabaseAdmin
        .from('scriptures')
        .update({ translations: updatedTranslations })
        .eq('id', id);
    }

    // Refresh Edge CDN cache for /api/scriptures
    try {
      revalidatePath('/api/scriptures');
    } catch {
      // Non-fatal if revalidatePath is unavailable
    }

    // Return the successfully translated text
    return NextResponse.json({ translation: translatedText });

  } catch (error: any) {
    console.error('Translate API Exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
