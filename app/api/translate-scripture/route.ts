import { NextRequest, NextResponse } from 'next/server';
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
    
    // We use gemini-3.6-flash for cost efficiency and speed
    const modelId = 'gemini-3.6-flash';
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

    // 2. Cache it in Supabase using the admin key so it bypasses RLS
    const supabaseAdmin = getSupabaseAdmin();
    
    // Fetch current translations first to merge
    const { data: currentData, error: fetchError } = await supabaseAdmin
      .from('scriptures')
      .select('translations')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Supabase Fetch Error:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const currentTranslations = currentData.translations || {};
    const updatedTranslations = { ...currentTranslations, [targetLocale]: translatedText };

    // Update with new merged JSON
    const { error: updateError } = await supabaseAdmin
      .from('scriptures')
      .update({ translations: updatedTranslations })
      .eq('id', id);

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
      return NextResponse.json({ error: 'Failed to cache translation' }, { status: 500 });
    }

    // Return the successfully translated text
    return NextResponse.json({ translation: translatedText });

  } catch (error: any) {
    console.error('Translate API Exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
