import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/chat';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, data } = await req.json(); // type: 'csv' | 'json', data: string (raw)

    let parsedData: any[] = [];

    if (type === 'json') {
      parsedData = JSON.parse(data);
    } else if (type === 'csv') {
      // Very basic CSV parser: source,content,title
      const lines = data.split('\n');
      const headers = lines[0].split(',').map((h: string) => h.trim());
      parsedData = lines.slice(1).filter((l: string) => l.trim()).map((line: string) => {
        const values = line.split(',');
        return {
          source: values[0]?.trim(),
          content: values[1]?.trim(),
          metadata: { title: values[2]?.trim() }
        };
      });
    }

    if (!parsedData.length) {
      return NextResponse.json({ error: 'No data to process' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Process and generate embeddings
    const processed = await Promise.all(
      parsedData.map(async (item) => {
        if (!item.content) return null;
        const fullEmbedding = await generateEmbedding(item.content);
        // Ensure 768 dimension
        const embedding = fullEmbedding ? fullEmbedding.slice(0, 768) : null;
        return {
          source: item.source,
          content: item.content,
          metadata: item.metadata || { title: item.source },
          embedding
        };
      })
    );

    const validItems = processed.filter(item => item !== null && item.embedding !== null);

    if (validItems.length === 0) {
      return NextResponse.json({ error: 'Failed to generate embeddings for any items' }, { status: 500 });
    }

    const { error } = await supabase
      .from('scriptures')
      .insert(validItems);

    if (error) throw error;

    return NextResponse.json({ success: true, count: validItems.length });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
