import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

// ============================================================
// eBook API — Temple of Light
// ============================================================
// Cost  : 5 🪷 lotus petals (deducted ONLY after confirmed complete story)
// Lang  : Universal — all languages via Unicode script detection
// Done? : [STORY_COMPLETE] marker (English, language-agnostic) +
//         min-char count + sentence-ender — triple check
// Safety: One continuation retry before error; no charge on failure
// ============================================================

const EBOOK_COST = 5;

// ─────────────────────────────────────────────────────────
// SCRIPT / LANGUAGE DETECTION
// Returns: script family (for char-target lookup) + langHint (for prompt)
// ─────────────────────────────────────────────────────────
type ScriptFamily = 'cjk' | 'rtl' | 'indic' | 'southeast_asian' | 'latin';

interface LangDetectResult {
  family: ScriptFamily;
  langHint: string; // e.g. "Korean (한국어)" — passed verbatim to Gemini
  isRtl: boolean;
}

function detectScriptFamily(messages: { role: string; content: string }[]): LangDetectResult {
  const text = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');

  const total = text.replace(/\s/g, '').length || 1;

  const counts = {
    korean:     (text.match(/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/g) || []).length,
    chinese:    (text.match(/[\u4E00-\u9FFF\u3400-\u4DBF]/g) || []).length,
    japanese:   (text.match(/[\u3040-\u30FF\u31F0-\u31FF]/g) || []).length,
    arabic:     (text.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length,
    hebrew:     (text.match(/[\u0590-\u05FF]/g) || []).length,
    devanagari: (text.match(/[\u0900-\u097F]/g) || []).length,
    bengali:    (text.match(/[\u0980-\u09FF]/g) || []).length,
    thai:       (text.match(/[\u0E00-\u0E7F]/g) || []).length,
    khmer:      (text.match(/[\u1780-\u17FF]/g) || []).length,
    myanmar:    (text.match(/[\u1000-\u109F]/g) || []).length,
    tibetan:    (text.match(/[\u0F00-\u0FFF]/g) || []).length,
  };

  // CJK
  if ((counts.korean + counts.chinese + counts.japanese) / total > 0.2) {
    if (counts.korean >= counts.chinese && counts.korean >= counts.japanese)
      return { family: 'cjk', langHint: 'Korean (한국어)', isRtl: false };
    if (counts.japanese > counts.chinese)
      return { family: 'cjk', langHint: 'Japanese (日本語)', isRtl: false };
    return { family: 'cjk', langHint: 'Chinese (中文)', isRtl: false };
  }

  // RTL
  if ((counts.arabic + counts.hebrew) / total > 0.15) {
    return counts.arabic >= counts.hebrew
      ? { family: 'rtl', langHint: 'Arabic (العربية)', isRtl: true }
      : { family: 'rtl', langHint: 'Hebrew (עברית)', isRtl: true };
  }

  // Indic
  if ((counts.devanagari + counts.bengali) / total > 0.1) {
    return counts.devanagari >= counts.bengali
      ? { family: 'indic', langHint: 'Hindi (हिन्दी)', isRtl: false }
      : { family: 'indic', langHint: 'Bengali (বাংলা)', isRtl: false };
  }

  // Southeast Asian
  const seaTotal = counts.thai + counts.khmer + counts.myanmar + counts.tibetan;
  if (seaTotal / total > 0.1) {
    if (counts.thai > 0)    return { family: 'southeast_asian', langHint: 'Thai (ภาษาไทย)', isRtl: false };
    if (counts.khmer > 0)   return { family: 'southeast_asian', langHint: 'Khmer (ភាសាខ្មែរ)', isRtl: false };
    if (counts.myanmar > 0) return { family: 'southeast_asian', langHint: 'Burmese (မြန်မာဘာသာ)', isRtl: false };
    return { family: 'southeast_asian', langHint: 'Southeast Asian language', isRtl: false };
  }

  // Default: Latin / everything else (Spanish, French, German, Portuguese, etc.)
  return { family: 'latin', langHint: 'the same language as the conversation above', isRtl: false };
}

// ─────────────────────────────────────────────────────────
// CHARACTER TARGETS  (reading-value equivalent across scripts)
// Calibrated so each language family delivers roughly the same
// reading experience per 5-lotus cost.
// ─────────────────────────────────────────────────────────
const CHAR_TARGETS: Record<ScriptFamily, { min: number; max: number }> = {
  latin:           { min: 4500, max: 5500 }, // ~1,400–1,700 English words
  cjk:             { min: 1800, max: 2200 }, // dense semantic content
  rtl:             { min: 3000, max: 4000 },
  indic:           { min: 2500, max: 3500 },
  southeast_asian: { min: 3000, max: 4000 },
};

// ─────────────────────────────────────────────────────────
// COMPLETION CHECK  (triple-layer)
//
// [STORY_COMPLETE] is a LANGUAGE-AGNOSTIC technical marker — always
// written in English regardless of the story language. The model is
// explicitly told in the prompt that it must appear exactly as-is.
//
// Three conditions, any failure → retry:
//   1. [STORY_COMPLETE] marker present   (structural / content signal)
//   2. Minimum character count reached   (value guarantee)
//   3. Ends with a sentence-ender        (not cut mid-sentence)
//
// Fallback: if no marker but length + punctuation are OK, accept anyway.
// This handles edge cases where the model writes a correct story but
// forgets the marker (rare but possible for very long stories).
// ─────────────────────────────────────────────────────────
const SENTENCE_ENDERS = new Set([
  '.', '!', '?',             // Latin (includes Korean .!? endings)
  '\u3002', '\uff01', '\uff1f', '\u2026', // CJK 。！？…
  '\u061f',                  // Arabic ؟
  '\u0964', '\u0965',        // Devanagari । ॥
  '\u201d', '\u2019',        // Closing quotes
  '\u300d', '\u300f',        // Japanese 」』
  // NOTE: Korean formal prose ALWAYS ends with 다./다!/다? —
  // a story ending with a bare Hangul syllable is cut-off, not complete.
  // Do NOT accept bare Hangul syllables as valid endings.
]);

interface CompletionResult {
  complete: boolean;
  strippedText: string; // [STORY_COMPLETE] already removed — safe for HTML
  reason?: string;
  errorKey?: string;
}

function checkCompletion(raw: string, minChars: number): CompletionResult {
  const hasMarker   = raw.includes('[STORY_COMPLETE]');
  const stripped    = raw.replace(/\[STORY_COMPLETE\]/g, '').trim();
  const lastChar    = stripped.at(-1) ?? '';
  const goodEnding  = SENTENCE_ENDERS.has(lastChar);
  const longEnough  = stripped.length >= minChars;

  // Primary path: all three checks pass
  if (hasMarker && longEnough && goodEnding)
    return { complete: true, strippedText: stripped };

  // Fallback: marker absent but story is long + properly ended
  if (!hasMarker && longEnough && goodEnding) {
    console.info('[eBook] No marker but length+punctuation OK — accepting.');
    return { complete: true, strippedText: stripped };
  }

  const reason = !goodEnding
    ? `Improper ending: "${lastChar}" (code ${lastChar.charCodeAt(0)})`
    : !longEnough
      ? `Too short: ${stripped.length} < ${minChars} chars`
      : 'Marker missing and fallback also failed';

  return { complete: false, strippedText: stripped, reason };
}

// ─────────────────────────────────────────────────────────
// PROMPT BUILDERS
//
// KEY DESIGN: [STORY_COMPLETE] is an English technical marker that
// must appear verbatim regardless of the story's language.
// The prompt makes this crystal-clear without any language-specific
// hinting — so Spanish, French, Swahili, etc. all work equally.
// ─────────────────────────────────────────────────────────
function buildEbookPrompt(
  messages: { role: string; content: string }[],
  langHint: string,
  charMin: number,
  charMax: number,
): string {
  const conversationText = messages
    .map(m => `${m.role === 'user' ? 'Seeker' : 'Guru'}: ${m.content}`)
    .join('\n\n');

  return `You are a master storyteller and spiritual writer.

Transform the raw conversation below into a beautifully written, self-contained Wisdom Story.

LANGUAGE: Write entirely in ${langHint}.
TARGET LENGTH: ${charMin}–${charMax} characters (count every character including spaces).

CHARACTERS:
- The Guru: Ancient, serene. Speaks in Dharma metaphors and calm wisdom.
- Bori (young novice monk): The Guru's companion. Warm, curious, represents the reader's inner child.

STORY STRUCTURE:
1. OPENING SCENE (1–2 paragraphs) — Temple at dusk: candlelight, incense, Bori nearby. Seeker arrives.
2. THE ENCOUNTER (main body) — Retell the conversation's essence as flowing narrative. Distill to core wisdom.
3. CLOSING VERSE (1 paragraph) — A Dharma insight, final and warm, as if carved in stone.

RULES:
- Never copy the conversation word-for-word. Always retell and transform.
- Do NOT invent scripture quotes. Use paraphrase: "The teachings whisper..."
- Maintain literary elegance and spiritual authenticity.

━━━ TECHNICAL COMPLETION MARKER (READ CAREFULLY) ━━━
After the very last sentence of the CLOSING VERSE, you MUST write the following marker
on its own line, exactly as shown, in English, regardless of the story language:

[STORY_COMPLETE]

This marker is NOT part of the story. It is a technical signal that the story is finished.
Rules for the marker:
  ✓ Place it ONLY after the final sentence of the closing verse.
  ✗ Do NOT place it mid-story or before the closing verse.
  ✗ Do NOT translate it or modify it — always write [STORY_COMPLETE] in English.
  ✓ If you are running low on space, compress the encounter section and jump to the
    closing verse — but always end with [STORY_COMPLETE].
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RAW CONVERSATION:
---
${conversationText}
---

Now write the complete Wisdom Story in ${langHint}, ending with [STORY_COMPLETE]:`;
}

function buildContinuationPrompt(
  partialStory: string,
  langHint: string,
  charsNeeded: number,
): string {
  return `A wisdom story was cut off before completion. Continue from exactly where it ended and write a proper closing verse to finish it.

Write in ${langHint}. Add approximately ${charsNeeded} more characters.
Do NOT repeat what is already written. Continue from the last word.

After the very last sentence of the closing verse, write this marker on its own line:
[STORY_COMPLETE]
(Write it exactly in English, do not translate it.)

UNFINISHED STORY:
---
${partialStory}
---

[Continue and conclude, ending with [STORY_COMPLETE]:]`;
}

// ─────────────────────────────────────────────────────────
// GEMINI CALLER
// ─────────────────────────────────────────────────────────
async function callGemini(
  apiKey: string,
  prompt: string,
  maxOutputTokens: number,
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, topK: 40, topP: 0.95, maxOutputTokens },
    }),
  });

  if (!res.ok) {
    console.error('[eBook Gemini]', res.status, (await res.text()).slice(0, 400));
    return null;
  }
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) console.error('[eBook Gemini] Empty response:', JSON.stringify(data).slice(0, 400));
  return text ?? null;
}

// ─────────────────────────────────────────────────────────
// PREMIUM HTML BUILDER
// [STORY_COMPLETE] is stripped in checkCompletion — never reaches HTML.
// RTL layout supported for Arabic / Hebrew.
// Pure CSS + inline SVG — no external image dependencies.
// ─────────────────────────────────────────────────────────
function buildEbookHtml(story: string, date: string, isRtl: boolean): string {
  const storyHtml = story
    .split(/\n{2,}/)
    .filter(p => p.trim())
    .map(p => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
    .join('\n        ');

  const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const innerAngles = [0, 60, 120, 180, 240, 300];
  const lotusOuter = petalAngles
    .map(a => `<ellipse cx="60" cy="28" rx="7" ry="18" fill="url(#lg)" opacity="0.55" transform="rotate(${a} 60 60)"/>`)
    .join('');
  const lotusInner = innerAngles
    .map(a => `<ellipse cx="60" cy="42" rx="5" ry="12" fill="url(#lg)" opacity="0.75" transform="rotate(${a} 60 60)"/>`)
    .join('');
  const cornerSvg = `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L4 56" stroke="#B8952A" stroke-width="1.5"/><path d="M4 4L56 4" stroke="#B8952A" stroke-width="1.5"/><path d="M4 4 Q28 4 28 28" stroke="#B8952A" stroke-width="1" stroke-dasharray="3 4"/><circle cx="4" cy="4" r="3" fill="#B8952A"/></svg>`;
  const dropCapFloat  = isRtl ? 'right' : 'left';
  const dropCapMargin = isRtl ? '0.06em 0 0 0.09em' : '0.06em 0.09em 0 0';

  return `<!DOCTYPE html>
<html${isRtl ? ' dir="rtl"' : ''}>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Wisdom Story — Temple of Light</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,300;0,400;1,300&family=Noto+Serif+KR:wght@300;400&family=Noto+Serif+SC:wght@300;400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet"/>
  <style>
    :root{--gold:#B8952A;--gold-mid:#C9A84C;--gold-light:#E4CC7A;--ink:#0E0C0A;--parchment:#F8F4EC;--parchment-bg:#EDE7D9;--text:#241E18;--text-muted:#7A6E62;--border:#C8BCAA;--border-light:#DDD4C4}
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    @media print{body{background:#fff!important}.no-print{display:none!important}.page{margin:0!important;box-shadow:none!important;border:none!important}}
    body{background:var(--parchment-bg);color:var(--text);font-family:'Cormorant Garamond','Noto Serif KR','Noto Serif SC','Noto Serif',Georgia,serif;line-height:1.95;font-size:19px}
    .page{max-width:700px;margin:48px auto 80px;background:var(--parchment);border:1px solid var(--border);box-shadow:0 2px 4px rgba(0,0,0,.04),0 12px 40px rgba(0,0,0,.10),0 40px 100px rgba(0,0,0,.06);position:relative}
    .gold-bar{height:6px;background:linear-gradient(90deg,#8B6914 0%,#C9A84C 25%,#F0D97A 50%,#C9A84C 75%,#8B6914 100%)}
    .corner{position:absolute;width:52px;height:52px;opacity:.3;pointer-events:none}.corner svg{width:100%;height:100%}
    .c-tl{top:20px;left:20px}.c-tr{top:20px;right:20px;transform:scaleX(-1)}.c-bl{bottom:20px;left:20px;transform:scaleY(-1)}.c-br{bottom:20px;right:20px;transform:scale(-1)}
    .inner{padding:52px 64px 72px}
    .header{text-align:center;margin-bottom:52px}
    .brand{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:36px}
    .brand-icon{color:var(--gold);font-size:1.3rem;opacity:.75}
    .brand-name{font-size:.7rem;letter-spacing:.28em;text-transform:uppercase;color:var(--text-muted)}
    .mandala{display:flex;justify-content:center;margin-bottom:28px}.mandala svg{width:92px;height:92px}
    .title{font-size:2.75rem;font-weight:300;color:var(--ink);line-height:1.2;margin-bottom:16px;font-style:italic}
    .rule{display:flex;align-items:center;justify-content:center;gap:14px;margin:14px 0}
    .rule-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent)}
    .rule-gem{color:var(--gold-mid);font-size:.85rem;opacity:.65}
    .subtitle{font-size:.88rem;color:var(--text-muted);letter-spacing:.15em;text-transform:uppercase;margin-bottom:8px}
    .date{font-size:.76rem;color:var(--text-muted);letter-spacing:.08em;font-style:italic}
    .story-wrap{border-top:1px solid var(--border-light);padding-top:44px}
    .story{font-size:1.07rem;font-weight:300}
    .story p{margin-bottom:1.55em;text-align:justify;hyphens:auto}
    .story p:first-child::first-letter{float:${dropCapFloat};font-size:4.6em;line-height:.72;margin:${dropCapMargin};color:var(--gold);font-weight:600;font-style:normal}
    .ornament{text-align:center;margin:44px 0 40px;position:relative}
    .ornament::before,.ornament::after{content:'';position:absolute;top:50%;height:1px;width:calc(50% - 72px);background:linear-gradient(90deg,transparent,var(--border))}
    .ornament::before{left:0}.ornament::after{right:0;background:linear-gradient(90deg,var(--border),transparent)}
    .orn-inner{display:inline-flex;gap:10px;align-items:center;color:var(--gold-mid);font-size:.95rem;opacity:.6;letter-spacing:.25em}
    .footer{border-top:1px solid var(--border-light);padding-top:26px;margin-top:8px;text-align:center}
    .footer-sym{color:var(--gold);font-size:1.2rem;opacity:.35;margin-bottom:10px}
    .disclaimer{font-size:.7rem;color:var(--text-muted);line-height:1.7;font-style:italic;max-width:400px;margin:0 auto}
    .print-btn{position:fixed;bottom:28px;right:28px;background:linear-gradient(135deg,#B8952A,#8B6914);color:#FAF6EC;border:none;border-radius:10px;padding:11px 22px;font-family:'Cormorant Garamond',serif;font-size:.9rem;font-style:italic;letter-spacing:.04em;cursor:pointer;box-shadow:0 4px 24px rgba(184,149,42,.45);transition:all .25s ease}
    .print-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(184,149,42,.55)}
    @media(max-width:720px){.page{margin:0;border:none;box-shadow:none}.inner{padding:36px 24px 56px}.title{font-size:2rem}.corner{display:none}}
  </style>
</head>
<body>
  <div class="page">
    <div class="gold-bar"></div>
    <div class="corner c-tl">${cornerSvg}</div>
    <div class="corner c-tr">${cornerSvg}</div>
    <div class="corner c-bl">${cornerSvg}</div>
    <div class="corner c-br">${cornerSvg}</div>
    <div class="inner">
      <header class="header">
        <div class="brand">
          <span class="brand-icon">☸</span>
          <span class="brand-name">Temple of Light</span>
          <span class="brand-icon">☸</span>
        </div>
        <div class="mandala">
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="lg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#E4CC7A"/>
                <stop offset="100%" stop-color="#8B6914"/>
              </radialGradient>
            </defs>
            <circle cx="60" cy="60" r="56" fill="none" stroke="#C9A84C" stroke-width=".7" opacity=".4"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#C9A84C" stroke-width=".35" opacity=".25"/>
            <g opacity=".65">${lotusOuter}</g>
            <g opacity=".85">${lotusInner}</g>
            <circle cx="60" cy="60" r="10" fill="url(#lg)" opacity=".9"/>
            <circle cx="60" cy="60" r="5" fill="#FAF0CC" opacity=".85"/>
          </svg>
        </div>
        <h1 class="title">Wisdom Story</h1>
        <div class="rule">
          <div class="rule-line"></div>
          <span class="rule-gem">✦</span>
          <div class="rule-line"></div>
        </div>
        <p class="subtitle">From the Temple of Light</p>
        <p class="date">${date}</p>
      </header>
      <div class="story-wrap">
        <main class="story">
          ${storyHtml}
        </main>
        <div class="ornament">
          <span class="orn-inner"><span>☸</span><span>✦</span><span>🪷</span><span>✦</span><span>☸</span></span>
        </div>
        <footer class="footer">
          <div class="footer-sym">☸</div>
          <p class="disclaimer">This story was woven from a conversation with an AI Guru and is a creative retelling. It does not replace professional medical, legal, or financial advice.</p>
        </footer>
      </div>
    </div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: 'API not configured.' }, { status: 503 });
    }

    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { messages } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No conversation to transform.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: limitData, error: fetchError } = await supabase
      .from('user_limits')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Could not verify your lotus balance.' }, { status: 500 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',').map(e => e.trim()).filter(Boolean);
    const isAdmin =
      session?.user?.role === 'admin' ||
      limitData.membership_tier === 'admin' ||
      adminEmails.includes(userEmail);

    if (!isAdmin && (limitData.lotus_count ?? 0) < EBOOK_COST) {
      return NextResponse.json(
        {
          error: `You need ${EBOOK_COST} 🪷 lotus petals. You have ${limitData.lotus_count ?? 0}.`,
          lotus_count: limitData.lotus_count ?? 0,
        },
        { status: 402 },
      );
    }

    // ── Detect language & character target
    const { family, langHint, isRtl } = detectScriptFamily(messages);
    const charTarget = CHAR_TARGETS[family];

    // ── 1st generation (8,192 tokens — vastly exceeds any story length)
    const prompt = buildEbookPrompt(messages, langHint, charTarget.min, charTarget.max);
    const raw1 = await callGemini(apiKey, prompt, 8192);

    if (!raw1) {
      return NextResponse.json(
        { error: 'The Guru is meditating. Please try again in a moment.' },
        { status: 503 },
      );
    }

    let check = checkCompletion(raw1, charTarget.min);

    // ── Continuation attempt if 1st gen is incomplete
    if (!check.complete) {
      console.warn('[eBook] 1st gen incomplete:', check.reason, '— attempting continuation');
      const charsNeeded = Math.max(charTarget.min - check.strippedText.length, 600);
      const raw2 = await callGemini(
        apiKey,
        buildContinuationPrompt(check.strippedText, langHint, charsNeeded),
        3072,
      );
      if (raw2) {
        check = checkCompletion(check.strippedText + '\n\n' + raw2, charTarget.min);
      }
    }

    // ── Still incomplete → abort without charge
    if (!check.complete) {
      console.error('[eBook] Incomplete after retry:', check.reason, '— no charge applied');
      return NextResponse.json(
        { errorKey: 'ebookFailed' },
        { status: 500 },
      );
    }

    // ── Deduct lotus ONLY after confirmed complete story
    if (!isAdmin) {
      await supabase
        .from('user_limits')
        .update({ lotus_count: limitData.lotus_count - EBOOK_COST })
        .eq('email', userEmail);
    }

    const newLotusCount = isAdmin ? limitData.lotus_count : limitData.lotus_count - EBOOK_COST;
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // check.strippedText has [STORY_COMPLETE] already removed — safe for HTML
    const htmlContent = buildEbookHtml(check.strippedText, date, isRtl);

    return NextResponse.json({ html: htmlContent, lotus_count: newLotusCount });

  } catch (err) {
    console.error('[eBook API Error]', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
