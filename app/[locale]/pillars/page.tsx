'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Keyboard, Mousewheel } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useTranslations } from 'next-intl';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

interface Pillar {
  id: string;
  name: string;
  amount: number;
  message: string;
  user_email: string;
  is_public: boolean;
  pillar_type: string;
  created_at: string;
}

export default function PillarsPage() {
  const { data: session } = useSession();
  const t = useTranslations('Pillars');
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [role, setRole] = useState<'founder' | 'supporter'>('founder');
  const [viewMode, setViewMode] = useState<'hall' | 'grid'>('hall');
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'oldest'>('amount');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [mounted, setMounted] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const pillarsTopRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (pillarsTopRef.current) {
      pillarsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Split pillars into Founders and Supporters
  const founderPillars = pillars.filter(p => ['gold', 'marble', 'stone'].includes(p.pillar_type));
  const supporterPillars = pillars.filter(p => p.pillar_type === 'donor');

  useEffect(() => {
    setMounted(true);
    fetchPillars(searchQuery, sortBy, role);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [sortBy, role]);

  // Reactive search reset
  useEffect(() => {
    if (searchQuery === '') {
      fetchPillars('', sortBy, role);
    }
  }, [searchQuery]);

  const fetchPillars = async (query = '', sort = sortBy, currentRole = role) => {
    setIsLoading(true);
    try {
      const pillarType = currentRole === 'founder' ? 'founder' : 'supporter';
      let url = `/api/pillars?sort=${sort}&type=${pillarType}`;
      if (query) url += `&search=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.error) setPillars(data);
    } catch (err) {
      console.error('Error fetching pillars:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPillars(searchQuery, sortBy, role);
    // After a short delay (data load) scroll to result banner
    setTimeout(() => {
      if (searchResultsRef.current) {
        searchResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 400);
  };

  const handleDonateClick = () => {
    if (!session?.user) {
      setShowLoginModal(true);
      return;
    }
    window.location.href = '/donate';
  };

  return (
    <main className="pillars-page">
      <div className="hall-atmosphere" />
      <div className="hall-fog-top" />
      <div className="hall-fog-bottom" />
      
      <div className="pillars-container" ref={pillarsTopRef}>
        <header className="page-header animate-fade-up">
          <div className="header-eyebrow">{t('eyebrow')}</div>
          <h1 className="page-title text-gradient-gold-v2">{t('title')}</h1>
          <p className="page-subtitle">
            {t('subtitle')}
          </p>
        </header>

        <div className="pillars-top-actions animate-fade-up animate-delay-200">
          <div className="control-group multi-toggles">
            {/* Role Toggle */}
            <div className="view-selector role-selector">
              <button 
                className={`btn-view ${role === 'founder' ? 'active' : ''}`}
                onClick={() => setRole('founder')}
              >🏛️ {t('viewFounders')}</button>
              <button 
                className={`btn-view ${role === 'supporter' ? 'active' : ''}`}
                onClick={() => setRole('supporter')}
              >📿 {t('viewSupporters')}</button>
            </div>

            {/* View Mode Toggle */}
            <div className="view-selector">
              <button 
                className={`btn-view ${viewMode === 'hall' ? 'active' : ''}`}
                onClick={() => setViewMode('hall')}
              >👁️‍🗨️ {t('viewHall')}</button>
              <button 
                className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >🔲 {t('viewGrid')}</button>
            </div>

            {/* Sort Toggle */}
            <div className="sort-selector">
              <button 
                className={`btn-sort ${sortBy === 'amount' ? 'active' : ''}`}
                onClick={() => setSortBy('amount')}
              >💎 {t('sortAmount')}</button>
              <button 
                className={`btn-sort ${sortBy === 'date' ? 'active' : ''}`}
                onClick={() => setSortBy('date')}
              >⬇️ {t('sortNewest')}</button>
              <button 
                className={`btn-sort ${sortBy === 'oldest' ? 'active' : ''}`}
                onClick={() => setSortBy('oldest')}
              >⬆️ {t('sortOldest')}</button>
            </div>
          </div>

          <form className="search-box-v2" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="btn-clear-search" 
                onClick={() => setSearchQuery('')}
              >✕</button>
            )}
            <button type="submit" className="btn-search-glow">{t('btnSearch')}</button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button
              className="btn-gold-glow-v2"
              style={{ padding: '12px 32px' }}
              onClick={handleDonateClick}
            >
              ♥ {t('donate')}
            </button>
          </div>

        </div>

        {/* Search result count banner — placed ABOVE results, auto-scroll target */}
        <div ref={searchResultsRef} style={{ scrollMarginTop: 'calc(var(--nav-height, 80px) + 16px)' }}>
          {searchQuery && (
            <div className="search-status-banner animate-fade-up">
              <div className="search-status-chip">
                <span className="search-status-icon">🔍</span>
                <span className="search-status-text">
                  &ldquo;{searchQuery}&rdquo;{' '}
                  {t('searchResultCount', { count: pillars.length }) || `— 검색 결과 ${pillars.length}개`}
                </span>
              </div>
            </div>
          )}
        </div>

        <section className={`pillars-display ${viewMode}-mode`}>
          {isLoading ? (
            <div className="loading-state">{t('loading')}</div>
          ) : pillars.length === 0 ? (
            <div className="empty-state">{t('empty')}</div>
          ) : viewMode === 'hall' ? (
            <>
              {/* ─── Founders' Hall ─── */}
              {role === 'founder' && founderPillars.length > 0 && (
                <>
                  <div className="pillar-section-header founder">
                    <span className="pillar-section-icon">🏛️</span>
                    <h2 className="pillar-section-title">{t('foundersHall')}</h2>
                    <p className="pillar-section-desc">{t('foundersDesc')}</p>
                  </div>
                  <Swiper
                    effect={'coverflow'}
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView={'auto'}
                    speed={280}
                    touchRatio={1.3}
                    resistanceRatio={0.85}
                    touchAngle={50}
                    shortSwipes={true}
                    longSwipes={true}
                    longSwipesRatio={0.15}
                    touchReleaseOnEdges={true}
                    nested={true}
                    coverflowEffect={{
                      rotate: 0,
                      stretch: 150,
                      depth: 300,
                      modifier: 1.2,
                      slideShadows: false,
                    }}
                    breakpoints={{
                      0: {
                        coverflowEffect: {
                          rotate: 0,
                          stretch: 50,
                          depth: 160,
                          modifier: 1.0,
                          slideShadows: false,
                        },
                      },
                      768: {
                        coverflowEffect: {
                          rotate: 0,
                          stretch: 150,
                          depth: 300,
                          modifier: 1.2,
                          slideShadows: false,
                        },
                      },
                    }}
                    keyboard={{ enabled: true }}
                    mousewheel={{ forceToAxis: true, sensitivity: 1, thresholdDelta: 20, releaseOnEdges: true }}
                    modules={[EffectCoverflow, Keyboard, Mousewheel]}
                    onSwiper={setSwiperInstance}
                    className="pillars-swiper"
                  >
                    {founderPillars.map((pillar) => (
                      <SwiperSlide key={pillar.id} className="pillar-slide">
                        <div
                          className="pillar-wrapper"
                          onClick={() => setSelectedPillar(pillar)}
                        >
                          <article className={`pillar-monument founder-pillar ${pillar.pillar_type} ${pillar.user_email === session?.user?.email ? 'is-mine' : ''}`}>
                            <div className="pillar-cap" />
                            <div className="pillar-body">
                              <div className="pillar-texture" />
                              <div className="pillar-content">
                                <h3 className="donor-name">{pillar.name}</h3>
                                <p className="donor-rank">{pillar.amount >= 5000 ? t('rankCelestial') : t('rankDevout')}</p>
                              </div>
                              <div className="pillar-engraving-glow" />
                            </div>
                            <div className="pillar-base" />
                            <div className="pillar-aura" />
                          </article>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </>
              )}
              {role === 'founder' && founderPillars.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontStyle: 'italic' }}>
                  {t('empty')}
                </div>
              )}

              {/* ─── Supporter's Wall ─── */}
              {role === 'supporter' && (
                <>
                  <div className="pillar-section-header supporter" style={{ marginTop: '0' }}>
                    <span className="pillar-section-icon">📿</span>
                    <h2 className="pillar-section-title">{t('supportersWall')}</h2>
                    <p className="pillar-section-desc">{t('supportersDesc')}</p>
                  </div>
                  {supporterPillars.length > 0 ? (
                    <Swiper
                      effect={'coverflow'}
                      grabCursor={true}
                      centeredSlides={true}
                      slidesPerView={'auto'}
                      speed={280}
                      touchRatio={1.3}
                      resistanceRatio={0.85}
                      touchAngle={50}
                      shortSwipes={true}
                      longSwipes={true}
                      longSwipesRatio={0.15}
                      touchReleaseOnEdges={true}
                      nested={true}
                      coverflowEffect={{
                        rotate: 0,
                        stretch: 120,
                        depth: 250,
                        modifier: 1.0,
                        slideShadows: false,
                      }}
                      breakpoints={{
                        0: {
                          coverflowEffect: {
                            rotate: 0,
                            stretch: 50,
                            depth: 160,
                            modifier: 1.0,
                            slideShadows: false,
                          },
                        },
                        768: {
                          coverflowEffect: {
                            rotate: 0,
                            stretch: 120,
                            depth: 250,
                            modifier: 1.0,
                            slideShadows: false,
                          },
                        },
                      }}
                      keyboard={{ enabled: true }}
                      mousewheel={{ forceToAxis: true, sensitivity: 1, thresholdDelta: 20, releaseOnEdges: true }}
                      modules={[EffectCoverflow, Keyboard, Mousewheel]}
                      className="pillars-swiper supporters-swiper"
                    >
                        {supporterPillars.map((pillar) => (
                          <SwiperSlide key={pillar.id} className="pillar-slide">
                            <div
                              className="pillar-wrapper"
                              onClick={() => setSelectedPillar(pillar)}
                            >
                              <article className={`pillar-monument donor-pillar ${pillar.user_email === session?.user?.email ? 'is-mine' : ''}`}>
                                <div className="pillar-cap" />
                                <div className="pillar-body">
                                  <div className="pillar-texture" />
                                  <div className="pillar-content">
                                    <h3 className="donor-name">{pillar.name}</h3>
                                    <p className="donor-rank">{t('rankSupporter')}</p>
                                  </div>
                                  <div className="pillar-engraving-glow" />
                                </div>
                                <div className="pillar-base" />
                                <div className="pillar-aura" />
                              </article>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontStyle: 'italic' }}>
                      {t('emptySupporter')}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* ─── Bounded Box Grid View with Golden Plaques ─── */
            <div className="sacred-hall-frame animate-fade-up">
              <div className="hall-frame-fade-top" aria-hidden="true" />
              <div className="sacred-hall-scroll-area custom-scrollbar" ref={scrollAreaRef}>
                {role === 'founder' && (
                  <>
                    <div className="pillar-section-header founder">
                      <span className="pillar-section-icon">🏛️</span>
                      <h2 className="pillar-section-title">{t('foundersHall')}</h2>
                      <p className="pillar-section-desc">{t('foundersDesc')}</p>
                    </div>
                    {founderPillars.length > 0 ? (
                      <div className="golden-plaques-grid">
                        {founderPillars.map((pillar) => {
                          const isMine = pillar.user_email === session?.user?.email;
                          const rankLabel = pillar.amount >= 5000 ? t('rankCelestial') : t('rankDevout');
                          return (
                            <div
                              key={pillar.id}
                              className="plaque-wrapper"
                              onClick={() => setSelectedPillar(pillar)}
                            >
                              <article className={`golden-plaque founder-plaque ${pillar.pillar_type} ${isMine ? 'is-mine' : ''}`}>
                                <div className="plaque-corner-ornament tl" />
                                <div className="plaque-corner-ornament tr" />
                                <div className="plaque-corner-ornament bl" />
                                <div className="plaque-corner-ornament br" />
                                <div className="plaque-header">
                                  <span className="plaque-badge">🏛️ {rankLabel}</span>
                                  {isMine && <span className="plaque-mine-tag">MY PILLAR</span>}
                                </div>
                                <h3 className="plaque-name">{pillar.name}</h3>
                                {pillar.message && (
                                  <p className="plaque-message-preview">“{pillar.message}”</p>
                                )}
                                <div className="plaque-footer">
                                  <span className="plaque-devotion">✨ {Number(pillar.amount).toLocaleString()} P</span>
                                </div>
                                <div className="plaque-glow" />
                              </article>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="empty-state">{t('empty')}</div>
                    )}
                  </>
                )}

                {role === 'supporter' && (
                  <>
                    <div className="pillar-section-header supporter" style={{ marginTop: '0' }}>
                      <span className="pillar-section-icon">📿</span>
                      <h2 className="pillar-section-title">{t('supportersWall')}</h2>
                      <p className="pillar-section-desc">{t('supportersDesc')}</p>
                    </div>
                    {supporterPillars.length > 0 ? (
                      <div className="golden-plaques-grid">
                        {supporterPillars.map((pillar) => {
                          const isMine = pillar.user_email === session?.user?.email;
                          return (
                            <div
                              key={pillar.id}
                              className="plaque-wrapper"
                              onClick={() => setSelectedPillar(pillar)}
                            >
                              <article className={`golden-plaque supporter-plaque ${isMine ? 'is-mine' : ''}`}>
                                <div className="plaque-corner-ornament tl" />
                                <div className="plaque-corner-ornament tr" />
                                <div className="plaque-corner-ornament bl" />
                                <div className="plaque-corner-ornament br" />
                                <div className="plaque-header">
                                  <span className="plaque-badge">📿 {t('rankSupporter')}</span>
                                  {isMine && <span className="plaque-mine-tag">MY PILLAR</span>}
                                </div>
                                <h3 className="plaque-name">{pillar.name}</h3>
                                {pillar.message && (
                                  <p className="plaque-message-preview">“{pillar.message}”</p>
                                )}
                                <div className="plaque-footer">
                                  <span className="plaque-devotion">✨ {Number(pillar.amount).toLocaleString()} P</span>
                                </div>
                                <div className="plaque-glow" />
                              </article>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="empty-state">{t('emptySupporter')}</div>
                    )}
                  </>
                )}
              </div>
              <div className="hall-frame-fade-bottom" aria-hidden="true" />
            </div>
          )}
        </section>

        {/* Bottom Actions: View All Reset (when active) + Scroll To Top */}
        <div className="pillars-bottom-controls animate-fade-up">
          {searchQuery && (
            <button
              type="button"
              className="btn-bottom-pill"
              onClick={() => {
                setSearchQuery('');
                fetchPillars('', sortBy, role);
              }}
            >
              <span className="btn-bottom-icon">↺</span>
              <span className="btn-bottom-label">{t('viewAll') || '전체 목록 보기'}</span>
            </button>
          )}
          <button
            type="button"
            className="btn-bottom-pill"
            onClick={scrollToTop}
            title={t('scrollToTop') || '맨 위로'}
          >
            <span className="btn-bottom-icon">↑</span>
            <span className="btn-bottom-label">{t('scrollToTop') || '맨 위로'}</span>
          </button>
        </div>


        {selectedPillar && (
          <div className="ritual-modal-overlay" onClick={() => setSelectedPillar(null)}>
            <div className="zoomed-pillar-container animate-sacred-zoom" onClick={e => e.stopPropagation()}>
              <div className="pillar-stone-detail">
                <div className="pillar-texture" />
                <div className="pillar-detail-content">
                  <div className="detail-header">
                    <span className="detail-date">{new Date(selectedPillar.created_at).toLocaleDateString()}</span>
                    <h2 className="detail-name text-gradient-gold-v2">{selectedPillar.name}</h2>
                  </div>
                  <div className="detail-body">
                    <p className="detail-message">“{selectedPillar.message || 'May peace be with all beings.'}”</p>
                  </div>
                  <div className="detail-footer">
                    <span className="detail-amount">{t('devotion', { amount: Number(selectedPillar.amount).toLocaleString() })}</span>
                  </div>
                </div>
              </div>
              <button className="btn-close-zoom" onClick={() => setSelectedPillar(null)}>✕ {t('btnReturn')}</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Sacred Login Modal (공양하기 auth guard) ── */}
      {showLoginModal && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', zIndex:199999, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', animation:'fadeIn 0.25s ease' }}
          onClick={() => setShowLoginModal(false)}
        >
          <div
            style={{ position:'relative', maxWidth:'420px', width:'100%', background:'linear-gradient(145deg, rgba(20,17,12,0.97) 0%, rgba(10,9,7,0.99) 100%)', border:'1px solid rgba(212,160,23,0.4)', borderRadius:'24px', padding:'48px 36px 40px', textAlign:'center', boxShadow:'0 0 80px rgba(212,160,23,0.2), 0 30px 60px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{ position:'absolute', top:'12px', right:'12px', minWidth:'44px', minHeight:'44px', display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', fontSize:'1.3rem', borderRadius:'50%', WebkitTapHighlightColor:'transparent' }}
              onClick={() => setShowLoginModal(false)}
            >✕</button>
            <span style={{ fontSize:'3.5rem', marginBottom:'16px', display:'block' }}>🪷</span>
            <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.7rem', background:'linear-gradient(135deg,#FFD700,#D4A017)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'12px' }}>
              {t('loginRequiredTitle') || '로그인이 필요합니다'}
            </h2>
            <p style={{ fontSize:'0.95rem', color:'rgba(255,255,255,0.65)', lineHeight:1.65, marginBottom:'28px' }}>
              {t('loginRequiredDesc') || '공양을 올리려면 먼저 신성한 사원에 입장해 주세요.'}
            </p>
            <div style={{ height:'1px', background:'linear-gradient(to right, transparent, rgba(212,160,23,0.25), transparent)', marginBottom:'28px' }} />
            <button
              style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'10px', background:'linear-gradient(135deg,#f6e27a,#d4a017,#aa7c11)', color:'#080807', fontWeight:900, fontSize:'1.05rem', padding:'16px 36px', borderRadius:'100px', border:'none', cursor:'pointer', width:'100%', letterSpacing:'0.03em', boxShadow:'0 10px 30px rgba(212,160,23,0.4)', WebkitTapHighlightColor:'transparent' }}
              onClick={() => { setShowLoginModal(false); signIn('google'); }}
            >
              <span>✨</span>
              <span>{t('signInBtn') || '구글로 로그인하기'}</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .pillars-page { min-height: 100vh; padding: calc(var(--nav-height, 80px) + 20px) 24px 80px; position: relative; overflow-x: hidden; background: #050505; }
        .hall-atmosphere { position: absolute; inset: 0; background: radial-gradient(circle at 50% -20%, rgba(212, 160, 23, 0.05) 0%, transparent 70%); pointer-events: none; }
        
        /* Fog Effects - Balanced for clarity */
        .hall-fog-top { 
          position: fixed; top: 0; left: 0; right: 0; height: 180px; 
          background: linear-gradient(to bottom, #050505 0%, rgba(5,5,5,0.8) 40%, transparent 100%); 
          z-index: 150; pointer-events: none; 
        }
        .hall-fog-bottom { 
          position: fixed; bottom: 0; left: 0; right: 0; height: 250px; 
          background: linear-gradient(to top, #050505 0%, rgba(5,5,5,0.8) 40%, transparent 100%); 
          z-index: 150; pointer-events: none; 
        }

        .pillars-container { max-width: 1400px; margin: 0 auto; position: relative; z-index: 10; }
        .page-header { text-align: center; margin-bottom: 36px; }
        .header-eyebrow { font-size: 0.9rem; color: var(--primary-gold); letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 12px; font-weight: 600; }
        .page-title { font-size: clamp(2.3rem, 5.5vw, 4.2rem); font-family: var(--font-serif); margin-bottom: 14px; }
        .page-subtitle { font-size: 1.05rem; color: var(--text-tertiary); max-width: 600px; margin: 0 auto; line-height: 1.6; }
        .loading-state, .empty-state { text-align: center; padding: 60px 0; color: var(--text-tertiary); font-style: italic; font-size: 1.05rem; width: 100%; }
        
        .pillars-top-actions { display: flex; flex-direction: column; align-items: center; gap: 20px; margin-bottom: 24px; }
        .control-group { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; align-items: center; }

        .search-status-banner {
          display: flex;
          justify-content: center;
          margin-top: 12px;
          margin-bottom: 4px;
          width: 100%;
        }
        .search-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 22px;
          border-radius: 30px;
          background: rgba(212, 160, 23, 0.08);
          border: 1px solid rgba(212, 160, 23, 0.3);
          color: var(--primary-gold);
          font-size: 0.9rem;
          font-family: var(--font-ui);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(10px);
        }
        .search-status-icon { font-size: 1.05rem; }
        .search-status-text { letter-spacing: 0.03em; }

        .btn-music-glass { 
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff;
          padding: 8px 20px; border-radius: 40px; cursor: pointer; backdrop-filter: blur(10px);
          transition: 0.3s; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;
        }
        .btn-music-glass:hover { background: rgba(255,255,255,0.1); transform: scale(1.05); }

        /* View & Sort Selectors */
        .view-selector, .sort-selector { display: flex; background: rgba(255,255,255,0.03); padding: 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); }
        .btn-view, .btn-sort { 
          padding: 7px 16px; border: none; background: transparent; color: var(--text-tertiary); 
          cursor: pointer; border-radius: 8px; font-size: 0.88rem; transition: all 0.25s;
          -webkit-tap-highlight-color: transparent;
          outline: none;
          touch-action: manipulation;
          white-space: nowrap;
        }
        .btn-view.active, .btn-sort.active { background: var(--primary-gold); color: #000; font-weight: 700; box-shadow: 0 4px 15px rgba(212, 160, 23, 0.3); }

        .search-box-v2 { 
          display: flex; gap: 12px; background: rgba(255,255,255,0.02); padding: 8px 8px 8px 24px; border-radius: 40px; 
          border: 1px solid rgba(212, 160, 23, 0.2); width: 100%; max-width: 500px; transition: all 0.3s;
          box-shadow: 0 0 20px rgba(0,0,0,0.5); flex-wrap: nowrap; align-items: center;
        }
        .search-box-v2:focus-within { border-color: var(--primary-gold); box-shadow: 0 0 30px rgba(212, 160, 23, 0.2); }
        .search-input { background: transparent; border: none; color: #fff; flex: 1; min-width: 0; outline: none; font-size: 1rem; }
        .btn-clear-search { background: transparent; border: none; color: var(--text-tertiary); font-size: 1.2rem; cursor: pointer; padding: 0 10px; transition: 0.3s; }
        .btn-clear-search:hover { color: #fff; transform: scale(1.1); }
        .btn-search-glow { 
          background: var(--primary-gold); border: none; color: #000; padding: 10px 28px; 
          border-radius: 30px; cursor: pointer; transition: 0.3s; font-weight: 700;
        }

        /* Hall Mode (Coverflow Carousel) */
        .hall-mode { overflow: visible; padding: 16px 0 32px; perspective: 1200px; }
        .pillars-swiper { width: 100%; padding-top: 40px; padding-bottom: 90px; overflow: visible; }
        .pillar-slide { width: 320px; display: flex; justify-content: center; will-change: transform; }
        .pillar-wrapper { width: 100%; cursor: pointer; }
        
        .swiper-slide-active .pillar-monument { filter: drop-shadow(0 20px 50px rgba(212, 160, 23, 0.4)); }
        .swiper-slide-active .pillar-body { border-color: rgba(212, 160, 23, 0.5); background: linear-gradient(90deg, #0a0a0a 0%, #201a0a 50%, #0a0a0a 100%); }
        .swiper-slide-active .donor-name { color: var(--primary-gold); text-shadow: 0 0 20px rgba(212, 160, 23, 0.8); transform: scale(1.1); }
        .swiper-slide-active .pillar-aura { opacity: 1; }

        /* ─── Sacred Hall Frame (Bounded Box for Grid View) ─── */
        .sacred-hall-frame {
          position: relative;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          background: rgba(10, 9, 8, 0.75);
          border: 1px solid rgba(212, 160, 23, 0.25);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }

        .sacred-hall-scroll-area {
          height: clamp(500px, 65vh, 720px);
          overflow-y: auto;
          padding: 32px 24px 40px;
          box-sizing: border-box;
          scroll-behavior: smooth;
        }

        .hall-frame-fade-top,
        .hall-frame-fade-bottom {
          position: absolute;
          left: 0;
          right: 0;
          height: 36px;
          pointer-events: none;
          z-index: 10;
        }
        .hall-frame-fade-top {
          top: 0;
          background: linear-gradient(to bottom, rgba(10, 9, 8, 0.95) 0%, transparent 100%);
        }
        .hall-frame-fade-bottom {
          bottom: 0;
          background: linear-gradient(to top, rgba(10, 9, 8, 0.95) 0%, transparent 100%);
        }

        /* ─── Golden Plaques Grid ─── */
        .golden-plaques-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 20px;
          width: 100%;
          padding: 8px 4px 20px;
          box-sizing: border-box;
        }

        .plaque-wrapper {
          cursor: pointer;
          transition: transform 0.25s ease;
        }
        .plaque-wrapper:hover {
          transform: translateY(-4px);
        }

        .golden-plaque {
          position: relative;
          background: linear-gradient(145deg, rgba(26, 22, 16, 0.9) 0%, rgba(13, 11, 8, 0.95) 100%);
          border: 1px solid rgba(212, 160, 23, 0.3);
          border-radius: 14px;
          padding: 20px 18px;
          min-height: 150px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(212, 160, 23, 0.03);
          overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .golden-plaque:hover {
          border-color: rgba(212, 160, 23, 0.7);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(212, 160, 23, 0.2);
        }

        .golden-plaque.is-mine {
          border-color: var(--primary-gold);
          box-shadow: 0 0 20px rgba(212, 160, 23, 0.3);
        }

        /* Plaque Corner Ornaments */
        .plaque-corner-ornament {
          position: absolute;
          width: 6px;
          height: 6px;
          border-color: rgba(212, 160, 23, 0.5);
          pointer-events: none;
        }
        .plaque-corner-ornament.tl { top: 6px; left: 6px; border-top: 1px solid; border-left: 1px solid; }
        .plaque-corner-ornament.tr { top: 6px; right: 6px; border-top: 1px solid; border-right: 1px solid; }
        .plaque-corner-ornament.bl { bottom: 6px; left: 6px; border-bottom: 1px solid; border-left: 1px solid; }
        .plaque-corner-ornament.br { bottom: 6px; right: 6px; border-bottom: 1px solid; border-right: 1px solid; }

        .plaque-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 10px;
        }
        .plaque-badge {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .founder-plaque .plaque-badge {
          color: var(--primary-gold);
        }
        .supporter-plaque .plaque-badge {
          color: #d4b896;
        }

        .plaque-mine-tag {
          font-size: 0.65rem;
          background: rgba(212, 160, 23, 0.18);
          color: var(--primary-gold);
          border: 1px solid rgba(212, 160, 23, 0.4);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .plaque-name {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px 0;
          letter-spacing: 0.04em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .golden-plaque:hover .plaque-name {
          color: var(--primary-gold);
        }

        .plaque-message-preview {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
          line-height: 1.4;
          margin: 0 0 12px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex-grow: 1;
        }

        .plaque-footer {
          margin-top: auto;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .plaque-devotion {
          font-size: 0.78rem;
          color: rgba(212, 160, 23, 0.85);
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .plaque-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(212, 160, 23, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ─── Custom Scrollbars ─── */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 160, 23, 0.3);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 160, 23, 0.6);
        }

        /* Pillar Monument Design */
        .pillar-monument { position: relative; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.8)); }
        
        .pillar-cap { width: 110%; height: 30px; background: #2a2a2a; border-radius: 4px; border-bottom: 4px solid #1a1a1a; box-shadow: inset 0 2px 5px rgba(255,255,255,0.1); }
        .pillar-base { width: 120%; height: 40px; background: #2a2a2a; border-radius: 4px; border-top: 4px solid #1a1a1a; }
        
        .pillar-body {
          width: 100%; height: 450px; background: linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
          border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05);
          position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center;
        }

        .pillar-monument.is-mine .pillar-body { border: 1px solid var(--primary-gold); }

        .pillar-texture {
          position: absolute; inset: 0; opacity: 0.4; pointer-events: none;
          background-image: url('https://www.transparenttextures.com/patterns/pavement.png');
        }

        .pillar-content { position: relative; z-index: 10; text-align: center; padding: 30px; }
        .donor-name { 
          font-family: var(--font-serif); font-size: 1.95rem; font-weight: 700; color: #fff; 
          margin-bottom: 8px; letter-spacing: 0.1em; transition: 0.3s;
        }
        .pillar-monument:hover .donor-name { color: var(--primary-gold); transform: scale(1.1); }
        .donor-rank { font-size: 0.85rem; color: var(--text-tertiary); letter-spacing: 0.2em; text-transform: uppercase; }
        
        .pillar-engraving-glow {
          position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(212, 160, 23, 0.1) 0%, transparent 80%);
          pointer-events: none;
        }

        .pillar-aura {
          position: absolute; inset: -20px; background: radial-gradient(circle, rgba(212, 160, 23, 0.25) 0%, transparent 70%);
          opacity: 0; transition: 0.5s ease; pointer-events: none; z-index: -1;
        }
        .pillar-monument:hover .pillar-aura { opacity: 1; }

        /* Zoomed Detail */
        .zoomed-pillar-container { max-width: 600px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 28px; z-index: 100001; }
        .pillar-stone-detail {
          width: 100%; padding: 56px 48px; background: linear-gradient(135deg, #151515 0%, #050505 100%);
          border: 1px solid var(--primary-gold); position: relative; text-align: center;
          box-shadow: 0 0 120px rgba(212, 160, 23, 0.4); border-radius: 8px;
        }

        .detail-name { font-family: var(--font-serif); font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 28px; }
        .detail-message { font-size: clamp(1rem, 2.5vw, 1.4rem); font-style: italic; color: #fff; line-height: 1.8; margin-bottom: 36px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .detail-footer { border-top: 1px solid rgba(212, 160, 23, 0.2); padding-top: 24px; color: var(--primary-gold); font-size: 0.95rem; letter-spacing: 0.15em; }

        .btn-close-zoom { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px 40px; border-radius: 40px; cursor: pointer; transition: 0.3s; font-weight: 600; }
        .btn-close-zoom:hover { background: rgba(255,255,255,0.15); border-color: #fff; }

        @keyframes sacred-zoom {
          from { transform: scale(0.7) translateY(40px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-sacred-zoom { animation: sacred-zoom 0.7s cubic-bezier(0.15, 0, 0, 1) forwards; }

        .ritual-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.94); backdrop-filter: blur(20px); z-index: 99999; display: flex; align-items: flex-start; justify-content: center; padding: calc(var(--nav-height) + 24px) 24px 40px; overflow-y: auto; }

        /* ─── Section Headers: Founder / Supporter ─── */
        .pillar-section-header {
          text-align: center; padding: 20px 24px 28px; width: 100%;
        }
        .pillar-section-icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
        .pillar-section-title {
          font-family: var(--font-serif);
          font-size: clamp(1.6rem, 4vw, 2.5rem);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .pillar-section-desc { font-size: 0.95rem; color: var(--text-tertiary); letter-spacing: 0.05em; }
        .pillar-section-header.founder .pillar-section-title {
          background: linear-gradient(135deg, #FFD700, #D4A017, #FFF0A0);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .pillar-section-header.supporter .pillar-section-title {
          background: linear-gradient(135deg, #C8A97E, #A07855, #D4B896);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* ─── Donor Pillar: warm terracotta stone (distinct from gold founders) ─── */
        .donor-pillar .pillar-body {
          background: linear-gradient(180deg, #2a1f14 0%, #1a1208 100%) !important;
          border-left: 3px solid rgba(160, 120, 80, 0.5) !important;
          border-right: 3px solid rgba(160, 120, 80, 0.5) !important;
        }
        .donor-pillar .pillar-cap, .donor-pillar .pillar-base {
          background: linear-gradient(135deg, #3a2a1a, #2a1f14) !important;
          border-color: rgba(160, 120, 80, 0.4) !important;
        }
        .donor-pillar .pillar-engraving-glow {
          background: radial-gradient(ellipse at 50% 50%, rgba(160,120,80,0.15) 0%, transparent 70%) !important;
        }
        .donor-pillar .pillar-aura {
          box-shadow: 0 0 60px rgba(160, 120, 80, 0.15), 0 0 120px rgba(160, 120, 80, 0.08) !important;
        }
        .supporters-swiper { margin-top: 0; }

        /* ─── Bottom Action Controls ─── */
        .pillars-bottom-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 28px;
          margin-bottom: 24px;
        }

        .btn-bottom-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: rgba(212, 160, 23, 0.08);
          border: 1px solid rgba(212, 160, 23, 0.3);
          border-radius: 100px;
          color: var(--primary-gold);
          font-family: var(--font-ui);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }
        .btn-bottom-pill:hover {
          background: rgba(212, 160, 23, 0.2);
          border-color: var(--primary-gold);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 160, 23, 0.25);
          color: #fff;
        }
        .btn-bottom-icon {
          font-size: 1.15rem;
          font-weight: 800;
          line-height: 1;
        }
        .btn-bottom-label {
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .pillars-page { padding: calc(var(--nav-height, 80px) + 12px) 16px 60px; }
          .page-header { margin-bottom: 16px; }
          .header-eyebrow { margin-bottom: 4px; font-size: 0.78rem; }
          .page-title { margin-bottom: 6px; }
          .page-subtitle { font-size: 0.9rem; line-height: 1.5; }
          .pillars-top-actions { gap: 12px; margin-bottom: 14px; }
          /* ── 2-row compact layout: Row1=Role+View, Row2=Sort ── */
          .control-group.multi-toggles {
            flex-direction: column;
            gap: 10px;
            width: 100%;
          }
          .control-group.multi-toggles > * {
            display: flex;
            justify-content: center;
          }
          /* Row 1: Role selector + View selector side by side */
          .control-group.multi-toggles .role-selector,
          .control-group.multi-toggles .view-selector:not(.role-selector) {
            flex: 1;
          }
          /* Stack row1 into a horizontal flex */
          .control-group.multi-toggles::before {
            content: '';
            display: none;
          }
          .btn-view { padding: 7px 12px; font-size: 0.82rem; }
          .btn-sort { padding: 7px 10px; font-size: 0.82rem; }
          .sacred-hall-scroll-area { height: clamp(440px, 62vh, 600px); padding: 20px 12px 30px; }
          .golden-plaques-grid { grid-template-columns: 1fr; gap: 14px; }
          .pillar-slide { width: 270px; }
          .pillar-body { height: 390px; }
          .donor-name { font-size: 1.65rem; }
        }
      `}</style>
    </main>
  );
}
