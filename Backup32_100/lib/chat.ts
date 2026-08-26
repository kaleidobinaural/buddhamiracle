import { getSupabaseAdmin } from './supabase';

/**
 * Generates an embedding for a given text using Gemini's embedding model.
 *
 * ★ DIMENSION NOTE:
 * - Model: gemini-embedding-001
 * - Raw output: 3072 dimensions
 * - Sliced to: 1536 dimensions to match the Supabase 'scriptures' table schema (vector(1536))
 * - The seed scripts (seed_full.py, seed_sample.py) also slice to [:1536] for consistency.
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text }] }
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini Embedding API Error:', response.status, errBody);
      return null;
    }

    const data = await response.json();
    return data?.embedding?.values ?? null;
  } catch (err) {
    console.error('Embedding generation failed:', err);
    return null;
  }
}

// Synonym Map for Query Expansion (Bridging modern terms to classic translation terms)
const SYNONYM_MAP: Record<string, string[]> = {
  stress: ['suffering', 'pain', 'adversity', 'sorrow', 'distress'],
  ego: ['self', 'individuality', 'personality', 'pride', 'attachment'],
  anxiety: ['fear', 'worry', 'restlessness', 'agitation'],
  depression: ['despair', 'gloom', 'heaviness', 'sorrow'],
  anger: ['hatred', 'rage', 'resentment', 'wrath', 'ill-will'],
  desire: ['craving', 'thirst', 'attachment', 'lust', 'greed'],
  peace: ['nibbana', 'nirvana', 'quiescence', 'stillness', 'extinguishment', 'unbinding']
};

/**
 * Expands the user query with synonyms to ensure better matching across different translation styles.
 */
function expandQuery(query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const expandedWords = new Set<string>(words);

  for (const word of words) {
    // Basic stripping of punctuation for matching
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (SYNONYM_MAP[cleanWord]) {
      SYNONYM_MAP[cleanWord].forEach(syn => expandedWords.add(syn));
    }
  }

  return Array.from(expandedWords).join(' ');
}

/**
 * Performs a vector search in Supabase to find relevant Buddhist scriptures.
 * Grounding AI responses in authentic texts to prevent hallucinations.
 */
export async function performVectorSearch(query: string) {
  const supabase = getSupabaseAdmin();
  
  // 1. Query Expansion (Synonym Map)
  const expandedQuery = expandQuery(query);
  console.log(`[RAG] Original Query: "${query}"`);
  console.log(`[RAG] Expanded Query: "${expandedQuery}"`);

  // 2. Generate Embedding
  // gemini-embedding-001 returns 3072 dims. Slice to 1536 to match DB schema (vector(1536)).
  const fullEmbedding = await generateEmbedding(expandedQuery);
  const query_embedding = fullEmbedding ? fullEmbedding.slice(0, 1536) : null;

  if (!query_embedding) {
    console.warn('Could not generate embedding for query. Falling back to general wisdom.');
    return null;
  }

  try {
    // 3. Call the RPC function defined in our schema
    const { data, error } = await supabase.rpc('match_scriptures', {
      query_embedding,
      match_threshold: 0.45, // Slightly lowered to accommodate synonym spread
      match_count: 3       // Top 3 relevant passages
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      return null;
    }

    // 4. Format the retrieved passages for the system prompt
    const sources: string[] = [];
    const contextString = data
      .map((item: any) => {
        const source = item.metadata?.source || 'Unknown Scripture';
        // 사용자의 피드백에 따라, 챕터를 제외하고 책 이름(source)만 표시하도록 간소화
        const sourceStr = source.trim();
        if (!sources.includes(sourceStr)) sources.push(sourceStr);

        const emotions = item.metadata?.target_emotions?.length 
          ? ` (Target Emotions: ${item.metadata.target_emotions.join(', ')})`
          : '';
        const notes = item.metadata?.translator_notes?.length 
          ? `\n[Translator Notes: ${item.metadata.translator_notes.join(' ')}]` 
          : '';
        return `[Source: ${sourceStr}${emotions}]\n${item.content}${notes}`;
      })
      .join('\n\n---\n\n');

    return { contextString, sources };
  } catch (err) {
    console.error('Vector search failed:', err);
    return null;
  }
}

/**
 * Exporting generateEmbedding for use in seeding as well.
 */
export { generateEmbedding };
