'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
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
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  // Split pillars into Founders and Supporters
  const founderPillars = pillars.filter(p => ['gold', 'marble', 'stone'].includes(p.pillar_type));
  const supporterPillars = pillars.filter(p => p.pillar_type === 'donor');


  useEffect(() => {
    setMounted(true);
    fetchPillars(searchQuery, sortBy, role);
  }, [sortBy, role]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

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
    if (viewMode === 'hall' && swiperInstance && searchQuery) {
      const idx = pillars.findIndex(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (idx !== -1) {
        swiperInstance.slideTo(idx, 1000);
        return;
      }
    }
    fetchPillars(searchQuery, sortBy, role);
  };

  return (
    <main className="pillars-page">
      <div className="hall-atmosphere" />
      <div className="hall-fog-top" />
      <div className="hall-fog-bottom" />
      
      <audio 
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3" 
        loop
        onError={(e) => console.error('Audio load error:', e)}
      />
      
      <div className="pillars-container">
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

            <button className="btn-music-glass" onClick={toggleMusic}>
              <span className="btn-icon">{isMusicPlaying ? '🔊' : '🔇'}</span>
              {isMusicPlaying ? t('musicOn') : t('musicOff')}
            </button>
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

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <Link href="/donate" className="btn-gold-glow-v2" style={{ padding: '12px 32px' }}>
              ♡ {t('donate')}
            </Link>
          </div>
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
                    coverflowEffect={{
                      rotate: 0,
                      stretch: 150,
                      depth: 300,
                      modifier: 1.2,
                      slideShadows: false,
                    }}
                    keyboard={{ enabled: true }}
                    mousewheel={{ forceToAxis: true, sensitivity: 1, thresholdDelta: 20 }}
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
                      coverflowEffect={{
                        rotate: 0,
                        stretch: 120,
                        depth: 250,
                        modifier: 1.0,
                        slideShadows: false,
                      }}
                      keyboard={{ enabled: true }}
                      mousewheel={{ forceToAxis: true, sensitivity: 1, thresholdDelta: 20 }}
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
            /* ─── Grid View (both sections) ─── */
            <div className="pillars-scroll-area animate-fade-up">
              {role === 'founder' && founderPillars.length > 0 && (
                <>
                  <div className="pillar-section-header founder" style={{ gridColumn: '1 / -1' }}>
                    <span className="pillar-section-icon">🏛️</span>
                    <h2 className="pillar-section-title">{t('foundersHall')}</h2>
                  </div>
                  {founderPillars.map((pillar) => (
                    <div
                      key={pillar.id}
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
                  ))}
                </>
              )}
              {role === 'founder' && founderPillars.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#888', fontStyle: 'italic' }}>
                  {t('empty')}
                </div>
              )}
              {role === 'supporter' && (
                <>
                  <div className="pillar-section-header supporter" style={{ gridColumn: '1 / -1', marginTop: '0' }}>
                    <span className="pillar-section-icon">📿</span>
                    <h2 className="pillar-section-title">{t('supportersWall')}</h2>
                  </div>
                  {supporterPillars.length > 0 ? (
                    <>
                      {supporterPillars.map((pillar) => (
                        <div
                          key={pillar.id}
                          className="pillar-wrapper"
                          onClick={() => setSelectedPillar(pillar)}
                        >
                          <article className={`pillar-monument donor-pillar ${pillar.user_email === session?.user?.email ? 'is-mine' : ''}`}>
                            <div className="pillar-cap" />
                            <div className="pillar-body">
                              <div className="pillar-texture" />
                              <div className="pillar-content">
                                <h3 className="donor-name">{pillar.name}</h3>
                                <p className="donor-rank">Supporter</p>
                              </div>
                              <div className="pillar-engraving-glow" />
                            </div>
                            <div className="pillar-base" />
                            <div className="pillar-aura" />
                          </article>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#888', fontStyle: 'italic' }}>
                      {t('emptySupporter')}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>


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

      <style>{`
        .pillars-page { min-height: 100vh; padding: 120px 24px 80px; position: relative; overflow-x: hidden; background: #050505; }
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
        .page-header { text-align: center; margin-bottom: 60px; }
        .header-eyebrow { font-size: 0.95rem; color: var(--primary-gold); letter-spacing: 0.35em; text-transform: uppercase; margin-bottom: 24px; font-weight: 600; }
        .page-title { font-size: clamp(2.5rem, 6vw, 4.5rem); font-family: var(--font-serif); margin-bottom: 28px; }
        .page-subtitle { font-size: 1.15rem; color: var(--text-tertiary); max-width: 600px; margin: 0 auto; line-height: 1.8; }
        .loading-state, .empty-state { text-align: center; padding: 100px 0; color: var(--text-tertiary); font-style: italic; font-size: 1.1rem; width: 100%; }
        
        .pillars-top-actions { display: flex; flex-direction: column; align-items: center; gap: 32px; margin-bottom: 80px; }
        .control-group { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; align-items: center; }

        .btn-music-glass { 
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff;
          padding: 8px 20px; border-radius: 40px; cursor: pointer; backdrop-filter: blur(10px);
          transition: 0.3s; font-size: 0.9rem; display: flex; align-items: center; gap: 10px;
        }
        .btn-music-glass:hover { background: rgba(255,255,255,0.1); transform: scale(1.05); }

        /* View & Sort Selectors */
        .view-selector, .sort-selector { display: flex; background: rgba(255,255,255,0.03); padding: 5px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.08); }
        .btn-view, .btn-sort { padding: 8px 20px; border: none; background: transparent; color: var(--text-tertiary); cursor: pointer; border-radius: 10px; font-size: 0.9rem; transition: all 0.3s; }
        .btn-view.active, .btn-sort.active { background: var(--primary-gold); color: #000; font-weight: 700; box-shadow: 0 4px 15px rgba(212, 160, 23, 0.3); }

        .search-box-v2 { 
          display: flex; gap: 12px; background: rgba(255,255,255,0.02); padding: 8px 8px 8px 24px; border-radius: 40px; 
          border: 1px solid rgba(212, 160, 23, 0.2); width: 100%; max-width: 500px; transition: all 0.3s;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        .search-box-v2:focus-within { border-color: var(--primary-gold); box-shadow: 0 0 30px rgba(212, 160, 23, 0.2); }
        .search-input { background: transparent; border: none; color: #fff; flex: 1; outline: none; font-size: 1rem; }
        .btn-clear-search { background: transparent; border: none; color: var(--text-tertiary); font-size: 1.2rem; cursor: pointer; padding: 0 10px; transition: 0.3s; }
        .btn-clear-search:hover { color: #fff; transform: scale(1.1); }
        .btn-search-glow { 
          background: var(--primary-gold); border: none; color: #000; padding: 10px 28px; 
          border-radius: 30px; cursor: pointer; transition: 0.3s; font-weight: 700;
        }

        /* Hall Mode (Coverflow Carousel) */
        .hall-mode { overflow: visible; padding: 40px 0; perspective: 1200px; }
        .pillars-swiper { width: 100%; padding-top: 50px; padding-bottom: 100px; overflow: visible; }
        .pillar-slide { width: 320px; display: flex; justify-content: center; transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .pillar-wrapper { width: 100%; cursor: pointer; }
        
        .swiper-slide-active .pillar-monument { filter: drop-shadow(0 20px 50px rgba(212, 160, 23, 0.4)); }
        .swiper-slide-active .pillar-body { border-color: rgba(212, 160, 23, 0.5); background: linear-gradient(90deg, #0a0a0a 0%, #201a0a 50%, #0a0a0a 100%); }
        .swiper-slide-active .donor-name { color: var(--primary-gold); text-shadow: 0 0 20px rgba(212, 160, 23, 0.8); transform: scale(1.1); }
        .swiper-slide-active .pillar-aura { opacity: 1; }

        /* Grid Mode */
        .grid-mode .pillars-scroll-area { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 60px; }

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
          font-family: var(--font-serif); font-size: 2rem; color: #fff; 
          text-shadow: 0 0 15px rgba(212, 160, 23, 0.8); margin-bottom: 12px; letter-spacing: 0.05em;
          transition: all 0.3s;
        }
        .pillar-monument:hover .donor-name { color: var(--primary-gold); transform: scale(1.1); }
        .donor-rank { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3em; color: var(--text-tertiary); opacity: 0.8; }
        
        .pillar-engraving-glow {
          position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(212, 160, 23, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .pillar-aura {
          position: absolute; inset: -20px; background: radial-gradient(ellipse at center, rgba(212, 160, 23, 0.1) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.5s; pointer-events: none;
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
          text-align: center; padding: 60px 24px 40px; width: 100%;
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
      `}</style>
    </main>
  );
}
