import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/chat';

const INITIAL_SCRIPTURES = [
  {
    content: "Mind precedes all mental states. Mind is their chief; they are all mind-wrought. If with an impure mind a person speaks or acts, suffering follows him like the wheel that follows the foot of the ox."
  },
  {
    content: "All conditioned things are impermanent — when one sees this with wisdom, one turns away from suffering. This is the path to purification."
  },
  {
    content: "Do not believe in anything simply because you have heard it. Do not believe in anything simply because it is spoken and rumored by many... But after observation and analysis, when you find that anything agrees with reason and is conducive to the good and benefit of one and all, then accept it and live up to it."
  },
  {
    content: "Radiate boundless love towards the entire world — above, below, and across — unhindered, without ill will, without enmity."
  },
  {
    content: "Form is emptiness, emptiness is form. Form is not different from emptiness, emptiness is not different from form."
  }
];




export async function GET() {
  const supabase = getSupabaseAdmin();
  
  try {
    console.log('Starting scripture seeding with embeddings...');
    
    // Process each scripture to add embeddings
    const scripturesWithEmbeddings = await Promise.all(
      INITIAL_SCRIPTURES.map(async (item) => {
        const fullEmbedding = await generateEmbedding(item.content);
        // Force the dimension to 1536 to match the existing DB column
        const embedding = fullEmbedding ? fullEmbedding.slice(0, 1536) : null;
        return {
          ...item,
          embedding
        };
      })
    );


    // Filter out items where embedding failed
    const validScriptures = scripturesWithEmbeddings.filter(s => s.embedding !== null);

    if (validScriptures.length === 0) {
      throw new Error('Failed to generate embeddings for any scriptures. Check your API key.');
    }

    const { data, error } = await supabase
      .from('scriptures')
      .insert(validScriptures)
      .select();


    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Initial scriptures with embeddings seeded successfully!',
      count: data?.length
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
