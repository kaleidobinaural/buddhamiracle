'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase';
import CharacterAvatar from '@/components/CharacterAvatar';

const PAGE_SIZE = 10;

// Strip any existing outer quotation marks so we don't get ""double quotes""
const cleanContent = (text: string) =>
  text.replace(/^[\u201C\u201D\u2018\u2019"']+|[\u201C\u201D\u2018\u2019"']+$/g, '').trim();

interface Scripture {
  id: string;
  source: string;
  content: string;
  translations?: Record<string, string>;
  metadata?: {
    source?: string;
    chapter?: string;
    [key: string]: any;
  };
}

export default function DharmaPage() {
  const t = useTranslations('Dharma');
  const locale = useLocale();
  const [scriptures, setScriptures] = useState<Scripture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [todayQuote, setTodayQuote] = useState<Scripture | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showFab, setShowFab] = useState(false);
  const [readingScripture, setReadingScripture] = useState<Scripture | null>(null);
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const topRef = useRef<HTMLDivElement>(null);

  // Scroll listener for FAB
  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReadingScripture(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (readingScripture) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [readingScripture]);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadData() {
      try {
        let { data, error } = await supabase!
          .from('scriptures')
          .select('id, content, metadata, translations');

        // Fallback: If translations column doesn't exist yet, fetch without it
        if (error && error.message.includes('translations')) {
          console.warn('translations column missing, falling back to original schema');
          const fallback = await supabase!
            .from('scriptures')
            .select('id, content, metadata');
          data = fallback.data;
          error = fallback.error;
        }

        if (error) throw error;
        if (data) {
          // ★ BUG FIX: use metadata?.source (not metadata?.title)
          const formattedData = data.map((item: any) => ({
            ...item,
            source: item.metadata?.source || 'Eternal Dharma',
          }));
          setScriptures(formattedData);
          // ★ DATE-BASED QUOTE: same quote for ALL users on the same day
          // Uses day-of-year as deterministic seed — no randomness per user
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 0);
          const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
          const dailyIndex = dayOfYear % formattedData.length;
          const random = formattedData[dailyIndex];
          setTodayQuote(random);
        }
      } catch (err) {
        console.error('Failed to load scriptures:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Reset pagination when tab or search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setExpandedId(null);
  }, [selectedSource, searchTerm]);

  const filteredScriptures = useMemo(() => {
    return scriptures.filter(s => {
      const matchSearch =
        (s?.source || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s?.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchSource = selectedSource === 'all' || s.source === selectedSource;
      return matchSearch && matchSource;
    });
  }, [scriptures, searchTerm, selectedSource]);

  const allSources = useMemo(() => {
    const sources = scriptures.map(s => s.source).filter(Boolean);
    const uniqueSources = Array.from(new Set(sources)).sort();
    return ['all', ...uniqueSources];
  }, [scriptures]);

  const visibleScriptures = filteredScriptures.slice(0, visibleCount);
  const hasMore = visibleCount < filteredScriptures.length;

  // Background Translation logic — todayQuote is ALWAYS translated first
  useEffect(() => {
    if (locale === 'en' || scriptures.length === 0) return;

    // ★ PRIORITY: todayQuote goes to the FRONT of the translation queue
    const itemsToCheck: Scripture[] = [];
    if (todayQuote && !todayQuote.translations?.[locale] && !translatingIds.has(todayQuote.id)) {
      itemsToCheck.push(todayQuote); // highest priority
    }
    // Then visible scriptures (excluding todayQuote to avoid duplicate)
    visibleScriptures.forEach(item => {
      if (item.id !== todayQuote?.id) itemsToCheck.push(item);
    });

    // Filter items that don't have the current locale translation and are not currently translating or failed
    const missing = itemsToCheck.filter(
      (item) => !item.translations?.[locale] && !translatingIds.has(item.id) && !failedIds.has(item.id)
    );

    if (missing.length === 0) return;

    const missingIds = missing.map(m => m.id);
    setTranslatingIds(prev => new Set([...prev, ...missingIds]));

    // Translate sequentially (not all at once) to avoid overwhelming the API
    // todayQuote is first in the array so it always resolves first
    missing.forEach(async (item) => {
      try {
        const res = await fetch('/api/translate-scripture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, content: item.content, targetLocale: locale }),
        });
        const data = await res.json();

        if (data.translation) {
          setScriptures(prev => prev.map(s => 
            s.id === item.id ? { ...s, translations: { ...(s.translations || {}), [locale]: data.translation } } : s
          ));
          setTodayQuote(prev => 
            prev?.id === item.id ? { ...prev, translations: { ...(prev.translations || {}), [locale]: data.translation } } : prev
          );
        }
      } catch (e) {
        console.error('Translation failed for', item.id, e);
        // Mark as failed so we don't retry endlessly
        setFailedIds(prev => new Set([...prev, item.id]));
      } finally {
        setTranslatingIds(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    });
  }, [visibleScriptures, todayQuote, locale, scriptures.length, failedIds]);

  const getLocalizedContent = (scripture: Scripture | null) => {
    if (!scripture) return { text: '', isTranslating: false };
    if (locale === 'en') return { text: scripture.content, isTranslating: false };
    const translated = scripture.translations?.[locale];
    if (translated) return { text: translated, isTranslating: false };
    // If failed, show English without spinner
    if (failedIds.has(scripture.id)) return { text: scripture.content, isTranslating: false };
    return { text: scripture.content, isTranslating: translatingIds.has(scripture.id) };
  };

  const handleAccordion = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const openModal = (e: React.MouseEvent, scripture: Scripture) => {
    e.stopPropagation(); // prevent accordion toggle
    setReadingScripture(scripture);
  };

  return (
    <main className="dharma-page relative min-h-screen overflow-hidden">
      <div ref={topRef} />
      <div className="dharma-bg-glow" aria-hidden="true" />

      <div className="dharma-container animate-fade-up relative z-10">

        {/* ── Header ── */}
        <header className="dharma-header mb-[60px] flex flex-col items-center justify-center w-full text-center">
          <div className="guru-portrait-wrap">
            <img
              src="/images/guru/guru_meditating.png"
              alt="Guru Meditating"
              className="guru-portrait-img"
            />
          </div>
          <h1 className="dharma-title text-gradient-gold-v2 mb-[30px] text-center w-full">{t('title')}</h1>
          <p className="dharma-subtitle max-w-2xl mx-auto text-center">{t('subtitle')}</p>
        </header>

        {/* ── Sacred Scroll: Today's Wisdom ── */}
        {todayQuote && (
          <div className="scroll-wrapper mb-[200px]">
            <div className="scroll-top" />
            <div className="scroll-body glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="quote-accent-icon">☸</div>
              <h2 className="quote-label" style={{ marginBottom: 'clamp(40px, 8vh, 80px)' }}>{t('todayQuote')}</h2>
              <cite style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', color: '#d4a017', fontFamily: 'var(--font-serif)', marginBottom: 'clamp(20px, 4vh, 40px)', display: 'block' }}>
                — {todayQuote.source} —
              </cite>
              <blockquote 
                className={`relative transition-opacity duration-300 ${getLocalizedContent(todayQuote).isTranslating ? 'opacity-30' : 'opacity-100'}`}
                style={{ 
                  fontFamily: 'var(--font-serif)', 
                  fontStyle: 'italic', 
                  fontSize: 'clamp(1rem, 2.5vw, 1.6rem)', 
                  color: 'rgba(255,255,255,0.85)', 
                  lineHeight: '1.9', 
                  maxWidth: '800px', 
                  padding: '0 20px', 
                  marginBottom: 'clamp(24px, 4vh, 40px)', 
                  textAlign: 'center' 
                }}
              >
                {getLocalizedContent(todayQuote).isTranslating && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-primary-gold opacity-80 not-italic tracking-widest whitespace-nowrap animate-pulse">
                    {t('translating')}
                  </span>
                )}
                &ldquo;{cleanContent(
                  getLocalizedContent(todayQuote).text.length > 300
                    ? getLocalizedContent(todayQuote).text.substring(0, 300) + '…'
                    : getLocalizedContent(todayQuote).text
                )}&rdquo;
              </blockquote>
              <button
                className="btn-premium-gold"
                onClick={(e) => openModal(e, todayQuote)}
              >
                {t('readMore')}
              </button>
            </div>
            <div className="scroll-bottom" />
          </div>
        )}

        {/* ── Explore Section ── */}
        <section className="explore-section mt-[80px] w-full">
          <div className="explore-header mb-8">
            <h2 className="section-title font-serif text-3xl mb-[40px] text-white/90 text-left">{t('explore')}</h2>

            {/* ── Source Tabs ── */}
            <div className="source-tabs-container mb-10">
              <div className="source-tabs">
                {allSources.length > 0 ? allSources.map(src => (
                  <button
                    key={src}
                    className={`source-tab ${selectedSource === src ? 'active' : ''}`}
                    onClick={() => setSelectedSource(src)}
                  >
                    {src === 'all' ? t('allWisdom') : src}
                  </button>
                )) : (
                  <button className="source-tab active">{t('allWisdom')}</button>
                )}
              </div>
            </div>

            {/* ── Search ── */}
            <div className="search-wrap mb-6">
              <input
                type="text"
                className="dharma-search-input"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {!loading && (
              <p className="result-count">
                {t('passagesFound', { count: filteredScriptures.length })}
                {selectedSource !== 'all' ? ` · ${selectedSource}` : ''}
              </p>
            )}
          </div>

          {/* ── Scripture List ── */}
          {loading ? (
            <div className="loading-state py-40 text-center opacity-30 font-serif text-2xl italic tracking-[0.2em]">
              Illuminating the archives…
            </div>
          ) : filteredScriptures.length === 0 ? (
            <div className="empty-state py-20 text-center opacity-40 font-serif text-xl italic">
              No passages found. Try a different search.
            </div>
          ) : (
            <>
              <div className="scripture-list">
                {visibleScriptures.map((scripture, idx) => {
                  const isOpen = expandedId === scripture.id;
                  const preview = scripture.content.length > 200
                    ? scripture.content.substring(0, 200) + '…'
                    : scripture.content;

                  return (
                    <article
                      key={scripture.id}
                      className={`scripture-accordion ${isOpen ? 'open' : ''}`}
                      onClick={() => handleAccordion(scripture.id)}
                    >
                      {/* ── Accordion Header ── */}
                      <div className="accordion-header">
                        <div className="accordion-meta">
                          <span className="accordion-index">{String(idx + 1).padStart(2, '0')}</span>
                          <span className="accordion-source">{scripture.source}</span>
                          {scripture.metadata?.chapter && (
                            <span className="accordion-chapter">{scripture.metadata.chapter}</span>
                          )}
                        </div>
                        <span className={`accordion-chevron ${isOpen ? 'rotated' : ''}`}>›</span>
                      </div>

                      {/* ── Preview (always visible) ── */}
                      <div className={`accordion-preview relative transition-opacity duration-300 ${getLocalizedContent(scripture).isTranslating ? 'opacity-30' : 'opacity-100'}`}>
                        {getLocalizedContent(scripture).isTranslating && (
                           <span className="absolute -top-5 left-0 text-[10px] text-primary-gold opacity-80 tracking-widest uppercase animate-pulse">
                             {t('translating')}
                           </span>
                        )}
                        &ldquo;{cleanContent(
                          getLocalizedContent(scripture).text.length > 200
                            ? getLocalizedContent(scripture).text.substring(0, 200) + '…'
                            : getLocalizedContent(scripture).text
                        )}&rdquo;
                      </div>

                      {/* ── Expanded Content ── */}
                      {isOpen && (
                        <div className="accordion-full animate-fade-up">
                          <div className="accordion-divider" />
                          <p className={`accordion-full-text transition-opacity duration-300 ${getLocalizedContent(scripture).isTranslating ? 'opacity-30' : 'opacity-100'}`}>
                            &ldquo;{cleanContent(getLocalizedContent(scripture).text)}&rdquo;
                          </p>
                          {/* ── READ MORE → opens parchment modal ── */}
                          <div className="accordion-actions">
                            <button
                              className="btn-parchment-read"
                              onClick={(e) => openModal(e, scripture)}
                            >
                              <span className="btn-parchment-icon">📜</span>
                              {t('readMore')}
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {/* ── Load More ── */}
              {hasMore && (
                <div className="load-more-wrap">
                  <button
                    className="btn-load-more"
                    onClick={e => { e.stopPropagation(); setVisibleCount(v => v + PAGE_SIZE); }}
                  >
                    <span>✦</span>&nbsp;{t('loadMore')}&nbsp;<span>✦</span>
                    <small>{t('passagesRemaining', { count: filteredScriptures.length - visibleCount })}</small>
                  </button>
                </div>
              )}

              {!hasMore && filteredScriptures.length > PAGE_SIZE && (
                <p className="all-loaded-msg">— {t('allLoaded', { count: filteredScriptures.length })} —</p>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Scroll-to-Top FAB ── */}
      <button
        className={`fab-top ${showFab ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        ↑
      </button>

      <CharacterAvatar
        src="/images/bori/bori_tablet.png"
        message={t('boriMessage')}
        position="bottom-right"
        delay={1000}
      />

      {/* ══════════════════════════════════════════ */}
      {/* ★ PARCHMENT MODAL — Ancient scroll design ★ */}
      {/* ══════════════════════════════════════════ */}
      {readingScripture && (
        <div
          className="parchment-overlay"
          onClick={() => setReadingScripture(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Reading: ${readingScripture.source}`}
        >
          <div
            className="parchment-modal animate-fade-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Scroll rod top */}
            <div className="scroll-top" />

            {/* Parchment body */}
            <div className="parchment-body custom-scrollbar">
              <button
                className="parchment-close"
                onClick={() => setReadingScripture(null)}
                aria-label="Close"
              >
                ×
              </button>

              {/* Dharma wheel watermark */}
              <div className="parchment-watermark" aria-hidden="true">☸</div>

              <div className="parchment-inner">
                {/* Source + chapter */}
                <div className="parchment-eyebrow">
                  {readingScripture.source}
                </div>
                <p className="parchment-chapter text-center">
                  {readingScripture.metadata?.chapter || 'VIRTUAL TEMPLE'}
                </p>
                <div className="parchment-divider" />
                
                {/* Full text */}
                <div className={`relative transition-opacity duration-300 ${getLocalizedContent(readingScripture).isTranslating ? 'opacity-30' : 'opacity-100'}`}>
                  {getLocalizedContent(readingScripture).isTranslating && (
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-primary-gold font-sans font-medium tracking-widest animate-pulse">
                       {t('translating')}
                     </div>
                  )}
                  <p className="parchment-text">
                    &ldquo;{cleanContent(getLocalizedContent(readingScripture).text)}&rdquo;
                  </p>
                </div>

                {/* Footer */}
                <div className="parchment-footer">
                  <div className="parchment-ornament">— ✦ —</div>
                  <p className="parchment-footer-text">{t('mayWisdomLight')}</p>
                </div>
              </div>
            </div>

            {/* Scroll rod bottom */}
            <div className="scroll-bottom" />
          </div>
        </div>
      )}

      <style>{`
        /* ── Base ── */
        .dharma-page { min-height: 100vh; padding: calc(var(--nav-height) + 40px) 0 120px; background: #080807; position: relative; overflow-x: hidden; }
        .dharma-bg-glow { position: absolute; top: 0; right: 0; width: 100%; height: 1200px; background: radial-gradient(circle at 50% -10%, rgba(212,160,23,0.15) 0%, transparent 70%); pointer-events: none; }
        .dharma-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; padding: 0 24px; box-sizing: border-box; width: 100%; }

        /* ── Guru Portrait ── */
        .guru-portrait-wrap { width: 180px; height: 180px; border-radius: 50%; overflow: hidden; border: 3px solid rgba(212,160,23,0.4); box-shadow: 0 0 60px rgba(212,160,23,0.2), 0 0 120px rgba(212,160,23,0.1); margin: 0 auto 32px auto; }
        .guru-portrait-img { width: 100%; height: 100%; object-fit: cover; object-position: center top; filter: grayscale(20%) brightness(0.85); }
        @media (max-width: 768px) { .guru-portrait-wrap { width: 120px; height: 120px; } }

        /* ── Typography ── */
        .dharma-title { font-family: var(--font-serif); font-size: clamp(2rem, 8vw, 4.5rem); line-height: 1.2; padding-bottom: 10px; background-clip: text; -webkit-background-clip: text; margin-bottom: 20px !important; }
        .dharma-subtitle { color: #888; font-style: italic; letter-spacing: 0.1em; line-height: 2.0; font-size: clamp(0.85rem, 2vw, 1.2rem); opacity: 0.7; margin-bottom: 60px !important; }
        .result-count { font-size: 0.78rem; letter-spacing: 0.15em; color: rgba(212,160,23,0.4); text-transform: uppercase; margin-bottom: 24px; }

        /* ── Sacred Scroll (Today's Wisdom) ── */
        .scroll-wrapper { position: relative; max-width: 1100px; width: 100%; margin: 0 auto 200px auto; padding: 0 60px; box-sizing: border-box; }
        .scroll-top, .scroll-bottom { height: 64px; background: #1a1a1a; border: 6px solid #252525; border-radius: 100px; position: relative; z-index: 5; box-shadow: 0 20px 50px rgba(0,0,0,0.9); }
        .scroll-top::before, .scroll-bottom::before { content: ''; position: absolute; top: 50%; left: -40px; right: -40px; height: 32px; background: linear-gradient(to right, #8a6d1a, #d4a017, #8a6d1a); transform: translateY(-50%); border-radius: 20px; border: 1px solid rgba(0,0,0,0.5); box-shadow: inset 0 0 25px rgba(0,0,0,0.8); }
        .scroll-body { background: linear-gradient(to bottom, #111, #050505); border-left: 2px solid #1a1a1a; border-right: 2px solid #1a1a1a; padding: 60px 60px; margin: -18px 0; position: relative; box-shadow: 0 70px 140px rgba(0,0,0,0.8); box-sizing: border-box; overflow: hidden; animation: scroll-breathing-glow 8s ease-in-out infinite; }
        @keyframes scroll-breathing-glow { 0%, 100% { border-color: #1a1a1a; } 50% { border-color: rgba(212,160,23,0.15); box-shadow: 0 70px 140px rgba(0,0,0,0.8), 0 0 40px rgba(212,160,23,0.05) inset; } }
        .quote-accent-icon { position: absolute; top: 40px; left: 50%; transform: translateX(-50%); font-size: 12rem; opacity: 0.03; color: #d4a017; pointer-events: none; }
        .quote-label { text-transform: uppercase; letter-spacing: 0.4em; font-size: 0.85rem; color: #d4a017; opacity: 0.9; font-weight: 900; text-align: center; }
        @media (max-width: 768px) { .scroll-wrapper { padding: 0 8px; } .scroll-body { padding: 40px 20px; } .scroll-top::before, .scroll-bottom::before { left: -8px; right: -8px; } }

        /* ── Tabs ── */
        .source-tabs-container { border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; width: 100%; }
        .source-tabs { display: flex; gap: 24px; overflow-x: auto; padding: 12px 4px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .source-tabs::-webkit-scrollbar { display: none; }
        .source-tab { font-family: var(--font-serif); font-size: 0.85rem; color: #444; background: none; border: none; cursor: pointer; transition: 0.4s; padding: 10px 0; border-bottom: 3px solid transparent; letter-spacing: 0.08em; text-transform: uppercase; flex-shrink: 0; white-space: nowrap; }
        .source-tab.active { color: #d4a017; border-bottom-color: #d4a017; font-weight: 800; }
        .source-tab:hover:not(.active) { color: rgba(212,160,23,0.55); }

        /* ── Search ── */
        .dharma-search-input { width: 100%; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.08); border-radius: 40px; padding: 18px 32px; color: #fff; font-size: 1rem; outline: none; transition: 0.4s; box-sizing: border-box; }
        .dharma-search-input:focus { border-color: rgba(212,160,23,0.3); background: rgba(255,255,255,0.03); }

        /* ── Accordion Cards ── */
        .scripture-list { display: flex; flex-direction: column; gap: 12px; width: 100%; }
        .scripture-accordion { border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; background: rgba(255,255,255,0.02); padding: 24px 28px; cursor: pointer; transition: background 0.4s, border-color 0.4s, transform 0.3s; width: 100%; box-sizing: border-box; user-select: none; }
        .scripture-accordion:hover { background: rgba(255,255,255,0.04); border-color: rgba(212,160,23,0.2); transform: translateX(4px); }
        .scripture-accordion.open { border-color: rgba(212,160,23,0.35); background: rgba(212,160,23,0.04); transform: none; }

        .accordion-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .accordion-meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; min-width: 0; }
        .accordion-index { font-family: var(--font-serif); font-size: 0.75rem; color: rgba(212,160,23,0.4); letter-spacing: 0.15em; flex-shrink: 0; }
        .accordion-source { font-family: var(--font-serif); font-size: 1rem; color: #d4a017; font-weight: 700; letter-spacing: 0.05em; }
        .accordion-chapter { font-size: 0.75rem; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; padding: 3px 10px; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; }
        .accordion-chevron { font-size: 1.6rem; color: rgba(212,160,23,0.4); transition: transform 0.4s var(--ease-expo), color 0.3s; flex-shrink: 0; line-height: 1; }
        .accordion-chevron.rotated { transform: rotate(90deg); color: #d4a017; }

        .accordion-preview { margin-top: 14px; font-family: var(--font-serif); font-style: italic; font-size: clamp(0.85rem, 1.8vw, 1.05rem); color: rgba(255,255,255,0.45); line-height: 1.9; }

        .accordion-divider { height: 1px; background: linear-gradient(to right, transparent, rgba(212,160,23,0.2), transparent); margin: 20px 0; }
        .accordion-full-text { font-family: var(--font-serif); font-style: italic; font-size: clamp(0.9rem, 2vw, 1.1rem); color: rgba(255,255,255,0.78); line-height: 2.1; white-space: pre-wrap; word-break: break-word; }

        /* ── Read More (parchment trigger) button ── */
        .accordion-actions { display: flex; justify-content: flex-end; margin-top: 24px; }
        .btn-parchment-read {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-serif); font-size: 0.85rem; letter-spacing: 0.15em; text-transform: uppercase;
          color: #d4a017; background: none;
          border: 1px solid rgba(212,160,23,0.3); border-radius: 100px;
          padding: 10px 24px; cursor: pointer;
          transition: 0.4s var(--ease-expo);
        }
        .btn-parchment-read:hover { background: rgba(212,160,23,0.1); border-color: rgba(212,160,23,0.7); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,160,23,0.15); }
        .btn-parchment-icon { font-size: 1rem; }

        /* ── Gold button (Today's Wisdom) ── */
        .btn-premium-gold { background: var(--primary-gold); color: #000; padding: 14px 36px; border-radius: 100px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em; font-size: 0.85rem; border: none; cursor: pointer; transition: 0.6s var(--ease-expo); box-shadow: 0 10px 30px rgba(212,160,23,0.2); }
        .btn-premium-gold:hover { background: #fff; transform: translateY(-4px) scale(1.05); box-shadow: 0 20px 60px rgba(212,160,23,0.5); }

        /* ── Load More ── */
        .load-more-wrap { display: flex; justify-content: center; margin-top: 60px; }
        .btn-load-more { display: flex; flex-direction: column; align-items: center; gap: 6px; font-family: var(--font-serif); font-size: 1rem; color: #d4a017; background: none; border: 1px solid rgba(212,160,23,0.25); border-radius: 100px; padding: 18px 48px; cursor: pointer; letter-spacing: 0.15em; transition: 0.5s var(--ease-expo); }
        .btn-load-more small { font-size: 0.7rem; color: rgba(212,160,23,0.4); letter-spacing: 0.15em; font-style: italic; }
        .btn-load-more:hover { background: rgba(212,160,23,0.08); border-color: rgba(212,160,23,0.6); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(212,160,23,0.15); }
        .all-loaded-msg { text-align: center; margin-top: 60px; font-family: var(--font-serif); font-style: italic; font-size: 0.85rem; color: rgba(255,255,255,0.2); letter-spacing: 0.2em; }
        .empty-state { color: rgba(255,255,255,0.3); }

        /* ── FAB ── */
        .fab-top { position: fixed; bottom: 100px; right: 28px; z-index: 500; width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #d4a017, #8a6d1a); color: #000; font-size: 1.4rem; font-weight: 900; border: none; cursor: pointer; box-shadow: 0 8px 32px rgba(212,160,23,0.35); transition: opacity 0.4s, transform 0.4s; opacity: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; }
        .fab-top.visible { opacity: 1; pointer-events: all; }
        .fab-top:hover { transform: translateY(-6px) scale(1.08); box-shadow: 0 16px 48px rgba(212,160,23,0.5); }

        /* ══════════════════════════════════════ */
        /* ★ PARCHMENT MODAL                    */
        /* ══════════════════════════════════════ */
        .parchment-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(20px);
          display: flex; align-items: flex-start; justify-content: center;
          padding: calc(var(--nav-height, 80px) + 20px) 16px 60px;
          overflow-y: auto; box-sizing: border-box;
          animation: fade-in-overlay 0.35s ease;
        }
        @keyframes fade-in-overlay { from { opacity: 0; } to { opacity: 1; } }

        .parchment-modal {
          width: 100%; max-width: 820px;
          padding: 0 20px; box-sizing: border-box;
        }

        /* Reuse scroll rod styles */
        .parchment-modal .scroll-top,
        .parchment-modal .scroll-bottom { height: 56px; }
        .parchment-modal .scroll-top::before,
        .parchment-modal .scroll-bottom::before { left: -24px; right: -24px; height: 28px; }

        .parchment-body {
          position: relative;
          background:
            linear-gradient(to bottom, #f5e6c3 0%, #eeddb0 40%, #e8d4a0 100%);
          border-left: 3px solid rgba(100,70,20,0.15);
          border-right: 3px solid rgba(100,70,20,0.15);
          padding: 64px 56px 56px;
          margin: -16px 0;
          box-shadow:
            inset 0 0 80px rgba(120,80,20,0.12),
            inset 0 0 200px rgba(0,0,0,0.06),
            0 60px 120px rgba(0,0,0,0.8);
          box-sizing: border-box;
          overflow-y: auto;
          max-height: 70vh;
          /* Aged paper texture */
          background-image:
            linear-gradient(to bottom, #f5e6c3 0%, #eeddb0 40%, #e8d4a0 100%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-blend-mode: multiply;
        }

        .parchment-close {
          position: absolute; top: 16px; right: 20px;
          font-size: 28px; color: #5a3e10; opacity: 0.3;
          background: none; border: none; cursor: pointer;
          transition: opacity 0.3s, transform 0.4s;
          z-index: 10; line-height: 1;
        }
        .parchment-close:hover { opacity: 0.7; transform: rotate(90deg); }

        .parchment-watermark {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 18rem; color: rgba(120,80,20,0.04);
          pointer-events: none; user-select: none;
          line-height: 1;
        }

        .parchment-inner {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
        }

        .parchment-eyebrow {
          font-family: var(--font-serif);
          font-size: 0.78rem; letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #7a5010; font-weight: 700;
          margin-bottom: 12px;
        }
        .parchment-chapter { opacity: 0.6; font-weight: 400; letter-spacing: 0.2em; }

        .parchment-ornament {
          font-family: var(--font-serif);
          color: rgba(120,80,20,0.4);
          font-size: 1.1rem; letter-spacing: 0.3em;
          margin: 20px 0;
        }

        .parchment-text {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(0.95rem, 2.2vw, 1.3rem);
          color: #2a1800;
          line-height: 2.2;
          white-space: pre-wrap;
          word-break: break-word;
          max-width: 680px;
          text-align: center;
        }

        .parchment-footer { margin-top: 32px; opacity: 0.55; }
        .parchment-footer-text {
          font-size: 0.78rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: #5a3e10;
          font-family: var(--font-serif); margin-top: 12px;
        }

        /* ── Explore Section ── */
        .explore-section { width: 100%; box-sizing: border-box; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .dharma-page { padding-top: calc(var(--nav-height) + 20px); }
          .dharma-container { padding: 0 16px; }
          .scripture-accordion { padding: 20px 18px; }
          .accordion-source { font-size: 0.9rem; }
          .btn-load-more { padding: 16px 32px; font-size: 0.9rem; }
          .fab-top { bottom: 80px; right: 16px; width: 46px; height: 46px; font-size: 1.2rem; }
          .parchment-body { padding: 48px 28px 40px; }
          .parchment-watermark { font-size: 10rem; }
          .parchment-modal .scroll-top::before,
          .parchment-modal .scroll-bottom::before { left: -8px; right: -8px; }
        }
        @media (max-width: 480px) {
          .parchment-body { padding: 40px 18px 32px; max-height: 65vh; }
        }
      `}</style>
    </main>
  );
}
