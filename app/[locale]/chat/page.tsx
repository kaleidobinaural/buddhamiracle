'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CharacterAvatar from '@/components/CharacterAvatar';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  sources?: string[];
}

export default function ChatPage() {
  const t = useTranslations('Guru');
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isWaitingReply, setIsWaitingReply] = useState(false);
  const [guruAvatar, setGuruAvatar] = useState<string | null>('/images/guru/guru_idle.png');
  const [lotusCount, setLotusCount] = useState<number | null>(null);
  const [isGeneratingEbook, setIsGeneratingEbook] = useState(false);
  const [ebookError, setEbookError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();

  // Fetch Guru Avatar on load
  useEffect(() => {
    fetch('/api/settings?key=guru_image_url')
      .then(res => res.json())
      .then(data => { if (data.value) setGuruAvatar(data.value); })
      .catch(() => {});
  }, []);

  // Fetch and listen for live lotus count updates
  useEffect(() => {
    const fetchLotuses = () => {
      if (status === 'authenticated') {
        fetch('/api/user/lotus')
          .then(res => res.json())
          .then(data => { if (typeof data.lotus_count === 'number') setLotusCount(data.lotus_count); })
          .catch(() => {});
      }
    };
    fetchLotuses();

    const handleLotusEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ lotus_count?: number }>;
      if (typeof customEvent.detail?.lotus_count === 'number') {
        setLotusCount(customEvent.detail.lotus_count);
      } else {
        fetchLotuses();
      }
    };

    window.addEventListener('lotus-updated', handleLotusEvent);
    window.addEventListener('focus', fetchLotuses);
    return () => {
      window.removeEventListener('lotus-updated', handleLotusEvent);
      window.removeEventListener('focus', fetchLotuses);
    };
  }, [status]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isWaitingReply]);

  // Typewriter effect directly inside the model message (no unmount/flicker)
  const typeReply = (text: string, sources: string[] = []) => {
    const modelMsgId = 'model-' + Date.now();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', content: '', sources }]);
    setIsTyping(true);

    let currIndex = 0;
    let audioCtx: AudioContext | null = null;
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch (e) {}

    const playWoodenTap = () => {
      if (!audioCtx) return;
      try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.04);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
      } catch (e) {}
    };

    const interval = setInterval(() => {
      currIndex++;
      const partial = text.slice(0, currIndex);
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === modelMsgId);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], content: partial };
        return copy;
      });
      if (currIndex % 2 === 0) playWoodenTap();
      if (currIndex >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { id: 'usr-' + Date.now(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setIsWaitingReply(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], locale }),
      });

      const data = await response.json();

      // Update lotus count from response & sync across all tabs
      if (typeof data.lotus_count === 'number') {
        setLotusCount(data.lotus_count);
        window.dispatchEvent(new CustomEvent('lotus-updated', { detail: { lotus_count: data.lotus_count } }));
      }

      setIsWaitingReply(false);

      if (response.status === 401) {
        throw new Error('Unauthorized');
      } else if (response.status === 402) {
        setShowUpgradeModal(true);
        setMessages(prev => prev.slice(0, -1));
        setInput(userMessage.content);
        setIsTyping(false);
        return;
      } else if (response.status === 429) {
        typeReply(t('rateLimitMsg') || 'The temple asks for stillness. Please wait a moment before speaking again.', []);
        return;
      }

      if (data.fallback) {
        // Gemini returned no content — show localized fallback, no lotus deducted
        typeReply(t('fallbackMsg') || 'In stillness, the answer will come. Please try again.', []);
        return;
      }

      if (data.reply) {
        typeReply(data.reply, data.sources || []);
      } else if (data.error) {
        typeReply(data.error, []);
      } else {
        throw new Error(t('unexpectedError') || 'Unexpected response from the Guru.');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setIsWaitingReply(false);
      typeReply(err.message || 'The temple is silent for a moment. Please share your thoughts again.', []);
    }
  };

  // #17: Warn user not to leave during story generation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGeneratingEbook) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGeneratingEbook]);

  const handleGenerateEbook = async () => {
    if (messages.length === 0) {
      setEbookError(t('ebookNoMessages') || 'Please have a conversation with the Guru first.');
      return;
    }
    if (isGeneratingEbook) return;

    setEbookError(null);
    setIsGeneratingEbook(true);
    try {
      const response = await fetch('/api/ebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, locale }),
      });

      const data = await response.json();

      if (typeof data.lotus_count === 'number') {
        setLotusCount(data.lotus_count);
        window.dispatchEvent(new CustomEvent('lotus-updated', { detail: { lotus_count: data.lotus_count } }));
      }

      if (response.status === 402) {
        setShowUpgradeModal(true);
        return;
      }

      if (!response.ok || !data.html) {
        // Server returns errorKey for localized messages, or falls back to raw error string
        const msg = data.errorKey
          ? (t(data.errorKey as any) || data.errorKey)
          : (data.error || 'Could not generate the Wisdom Story at this time.');
        setEbookError(msg);
        return;
      }

      // Build a meaningful, collision-free filename in user's language
      const firstUserMsg = messages.find(m => m.role === 'user')?.content || '';
      const isKorean = locale === 'ko';
      const topic = (data.title || firstUserMsg)
        .replace(/[^\w\s가-힣-]/g, '')
        .trim()
        .split(/\s+/)
        .slice(0, 4)
        .join('-')
        .slice(0, 30);
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
      const prefix = isKorean ? '빛의사원-지혜이야기' : 'wisdom-story';
      const filename = topic ? `${prefix}-${topic}-${ts}.html` : `${prefix}-${ts}.html`;

      // data.html already contains the standalone, localized print button from api/ebook/route.ts
      const blob = new Blob([data.html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('eBook error:', err);
      setEbookError('An unexpected error occurred. Please try again.');
    } finally {
      setIsGeneratingEbook(false);
    }
  };

  return (
    <main className="chat-page">
      {/* Dynamic Background Glow */}
      <div className={`chat-outer-glow ${isTyping ? 'active' : ''}`} aria-hidden="true" />

      <div className={`chat-container glass-card animate-fade-up ${isTyping ? 'guru-active-glow' : ''}`}>
        {/* Chat Header */}
        <header className="chat-header">
          <div className="guru-avatar" aria-hidden="true">
            {guruAvatar ? (
              <img src={guruAvatar} alt="Guru Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="avatar-icon">☸</div>
            )}
            <div className="avatar-status-dot" />
          </div>
          <div className="guru-info">
            <h1 className="guru-name text-gradient-gold-v2">{t('title')}</h1>
            <p className="guru-status">{t('status')}</p>
          </div>

          {/* 🪷 Lotus Count Badge */}
          {status === 'authenticated' && lotusCount !== null && (
            <div className="lotus-badge" title="Remaining lotus petals">
              🪷 × {lotusCount}
            </div>
          )}
        </header>

        {/* Message Area */}
        <div className="message-area custom-scrollbar" ref={scrollRef}>
          {/* Welcome Message */}
          <div className="message-wrapper model chat-bubble-animated">
            <div className="message-bubble">{t('welcome')}</div>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role} chat-bubble-animated flex flex-col`}>
              <div className={`message-bubble ${msg.role === 'model' ? 'guru-font' : ''}`}>{msg.content}</div>
              {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                <div className="message-sources mt-2 text-xs text-[#d4af37]/60 flex flex-col items-end self-end mr-4">
                  <details className="cursor-pointer group">
                    <summary className="hover:text-[#d4af37] transition-colors list-none outline-none">
                      <span className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        {t('sourcesLabel')}
                      </span>
                    </summary>
                    <ul className="mt-2 text-right italic border-r-2 border-[#d4af37]/30 pr-3">
                      {msg.sources.map((src, idx) => <li key={idx} className="mb-1">{src}</li>)}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          ))}

          {isWaitingReply && (
            <div className="message-wrapper model">
              <div className="guru-breathing-loader mt-2 ml-4">
                <div className="breathing-orb"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {status === 'unauthenticated' ? (
          <div className="chat-input-area unauth-state">
            <p>{t('unauthMessage')}</p>
            <Link href="/api/auth/signin" className="btn-gold-glow-v2 mt-4 inline-block px-6 py-2">
              {t('signIn')}
            </Link>
          </div>
        ) : (
          <>
            <form className="chat-input-area" onSubmit={handleSubmit}>
              <input
                type="text"
                className="chat-input"
                placeholder={t('inputPlaceholder')}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isTyping}
              />
              <button type="submit" className="btn-send" disabled={!input.trim() || isTyping}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>

            {/* eBook Button + AI Disclaimer */}
            <div className="chat-footer-actions">
              {messages.length >= 2 && (
                <button
                  className="btn-ebook"
                  onClick={handleGenerateEbook}
                  disabled={isGeneratingEbook}
                  title="Transform this conversation into a Wisdom Story (costs 5 🪷)"
                >
                  {isGeneratingEbook ? (
                    <span>✨ {t('ebookGenerating') || 'Weaving your story…'}</span>
                  ) : (
                    <span>🪷 × 5 — {t('ebookButton') || 'Create Wisdom Story'}</span>
                  )}
                </button>
              )}
              {/* #17: warn user not to leave during generation */}
              {isGeneratingEbook ? (
                <p style={{
                  fontSize: '0.78rem', color: '#FFD700', textAlign: 'center',
                  padding: '6px 12px', background: 'rgba(212,160,23,0.1)',
                  borderRadius: '8px', border: '1px solid rgba(212,160,23,0.25)',
                  marginTop: '8px', lineHeight: 1.5,
                }}>
                  ⚠️ {t('ebookDontLeave') || '생성 중에는 이 화면을 끄거나 벗어나지 마세요. 연꽃이 소모됩니다.'}
                </p>
              ) : (
                messages.length >= 2 && (
                  <p style={{ fontSize: '0.72rem', color: 'rgba(212,160,23,0.45)', textAlign: 'center', marginTop: '6px' }}>
                    {t('ebookTip') || '※ 생성 중에는 화면을 벗어나지 마세요'}
                  </p>
                )
              )}
              <p className="ai-disclaimer">
                {t('aiDisclaimer') || '이 대화는 AI 에이전트와의 대화입니다. 전문적 의료·법률·금융 상담을 대체하지 않습니다.'}
              </p>
            </div>
          </>
        )}
      </div>

      <CharacterAvatar
        src="/images/bori/bori_greeting.png"
        message={t('boriMessage')}
        position="bottom-left"
        delay={1500}
      />

      {/* ── eBook Loading Overlay ── */}
      {isGeneratingEbook && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(8,6,4,0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '28px',
        }}>
          {/* Animated lotus spinner */}
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <svg viewBox="0 0 120 120" width="80" height="80"
              style={{ animation: 'spin 6s linear infinite' }}
              xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="og" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E4CC7A"/>
                  <stop offset="100%" stopColor="#8B6914"/>
                </radialGradient>
              </defs>
              {[0,45,90,135,180,225,270,315].map(a => (
                <ellipse key={a} cx="60" cy="28" rx="7" ry="18"
                  fill="url(#og)" opacity="0.65"
                  transform={`rotate(${a} 60 60)`}/>
              ))}
              {[0,60,120,180,240,300].map(a => (
                <ellipse key={a} cx="60" cy="42" rx="5" ry="12"
                  fill="url(#og)" opacity="0.85"
                  transform={`rotate(${a} 60 60)`}/>
              ))}
              <circle cx="60" cy="60" r="10" fill="url(#og)" opacity="0.95"/>
              <circle cx="60" cy="60" r="5" fill="#FAF0CC" opacity="0.9"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.5rem', fontStyle: 'italic',
              color: '#E4CC7A', marginBottom: '8px', letterSpacing: '0.04em',
            }}>
              {t('ebookGenerating') || 'Weaving your Wisdom Story…'}
            </p>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '0.95rem', color: 'rgba(228,204,122,0.55)',
              letterSpacing: '0.08em',
            }}>
              {t('ebookWait') || 'The Guru is distilling your conversation into sacred narrative…'}
            </p>
            <p style={{
              marginTop: '16px',
              fontSize: '0.85rem',
              color: '#FFD700',
              padding: '8px 18px',
              background: 'rgba(212,160,23,0.12)',
              borderRadius: '8px',
              border: '1px solid rgba(212,160,23,0.3)',
              maxWidth: '360px',
              margin: '16px auto 0',
              lineHeight: 1.5,
            }}>
              ⚠️ {t('ebookDontLeave') || '생성 중에는 이 화면을 끄거나 벗어나지 마세요. 연꽃이 소모됩니다.'}
            </p>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── eBook Error Modal ── */}
      {ebookError && (
        <div className="ritual-modal-overlay" onClick={() => setEbookError(null)}>
          <div className="modal-content glass-card animate-fade-up text-center" onClick={e => e.stopPropagation()}>
            <div className="modal-inner">
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem', marginBottom: '12px' }}>
                {t('ebookErrorTitle') || 'Story Could Not Be Completed'}
              </h2>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1rem', color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.7, marginBottom: '24px',
              }}>
                {ebookError}
              </p>
              <button className="btn-upgrade-secondary" onClick={() => setEbookError(null)}>
                {t('returnToSilence') || 'Return to Silence'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upgrade Modal ── */}
      {showUpgradeModal && (
        <div className="ritual-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content glass-card animate-fade-up text-center" onClick={e => e.stopPropagation()}>
            <div className="modal-inner">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🪷</div>
              <h2 className="modal-title">
                {t('upgradeTitle') || 'Lotus Petals Depleted'}
              </h2>
              <p className="modal-body-text">
                {t('upgradeBody') || 'Your lotus petals have blossomed fully for now.\nOffer a new lotus to continue your journey of wisdom.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '24px' }}>
                <a
                  href="/store#lotus-section"
                  className="btn-gold-glow-v2"
                  style={{ flex: 1, padding: '10px 12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem', whiteSpace: 'nowrap', textAlign: 'center', textDecoration: 'none' }}
                >
                  🪷 {t('buyLotus') || 'Offer Lotus Petals'}
                </a>
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  style={{
                    flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '10px 12px', color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', fontFamily: 'var(--font-serif)', fontSize: '0.9rem', whiteSpace: 'nowrap', textAlign: 'center'
                  }}
                >
                  {t('returnToSilence') || 'Return to Silence'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
