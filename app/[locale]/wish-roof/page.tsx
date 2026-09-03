'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import CharacterAvatar from '@/components/CharacterAvatar';

interface Wish {
  id: string;
  content: string;
  user_name: string;
  user_email?: string;
  color: string;
  created_at: string;
  likes_count?: number;
  amount?: number;
  is_public: boolean;
}

export default function WishRoofPage() {
  const { data: session } = useSession();
  const t = useTranslations('WishRoof');
  const tGuru = useTranslations('Guru');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWish, setNewWish] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flyingWish, setFlyingWish] = useState<Wish | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'sky' | 'grid'>('sky');
  const [sortBy, setSortBy] = useState<'date' | 'likes'>('date');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('night');
  const [snackbar, setSnackbar] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lotusCount, setLotusCount] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const snackbarTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchWishes(searchQuery, sortBy, showOnlyMine);
    setMounted(true);
    
    // Set time of day
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 17) setTimeOfDay('day');
    else if (hour >= 17 && hour < 20) setTimeOfDay('sunset');
    else setTimeOfDay('night');

    // Fetch lotus count for logged-in users
    fetch('/api/user/lotus')
      .then(r => r.json())
      .then(d => { if (typeof d.lotus_count === 'number') setLotusCount(d.lotus_count); })
      .catch(() => {});
  }, [sortBy, showOnlyMine]);

  useEffect(() => {
    if (searchQuery === '') {
      fetchWishes('', sortBy, showOnlyMine);
    }
  }, [searchQuery]);

  async function fetchWishes(query = '', sort = sortBy, mine = showOnlyMine) {
    setIsLoading(true);
    try {
      let url = `/api/wishes?sort=${sort}&mine=${mine}`;
      if (query) url += `&search=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && !data.error) {
        setWishes(data);
      }
    } catch (err) {
      console.error('Error fetching wishes:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWishes(searchQuery, sortBy, showOnlyMine);
  };

  const showMessage = (msg: string) => {
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbar({ message: msg, show: true });
    snackbarTimerRef.current = setTimeout(() => setSnackbar({ message: '', show: false }), 4000);
  };

  const handleLike = async (id: string) => {
    if (typeof window !== 'undefined') {
      const likedWishes = JSON.parse(localStorage.getItem('liked_wishes') || '[]');
      const isAlreadyLiked = likedWishes.includes(id);
      const action = isAlreadyLiked ? 'unlike' : 'like';

      try {
        const res = await fetch('/api/wishes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action }),
        });
        const data = await res.json();
        if (data.success) {
          let newLiked;
          if (action === 'like') {
            newLiked = [...likedWishes, id];
            showMessage(t('snackbarLike'));
          } else {
            newLiked = likedWishes.filter((item: string) => item !== id);
            showMessage(t('snackbarUnlike'));
          }
          localStorage.setItem('liked_wishes', JSON.stringify(newLiked));

          // Update local state
          const updatedLikes = data.data[0].likes_count;
          setWishes(wishes.map(w => w.id === id ? { ...w, likes_count: updatedLikes } : w));
          if (selectedWish?.id === id) {
            setSelectedWish(prev => prev ? { ...prev, likes_count: updatedLikes } : null);
          }
        }
      } catch (err) {
        console.error('Error liking wish:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.trim() || isSubmitting) return;

    // Check lotus balance (wish costs 3 🪷)
    if (lotusCount !== null && lotusCount < 3) {
      setIsModalOpen(false);
      setShowUpgradeModal(true);
      return;
    }

    const wishText = newWish.trim();
    const userName = session?.user?.name || 'Anonymous';
    
    setNewWish('');
    setIsModalOpen(false);
    setIsSubmitting(true);
    setErrorMsg(null);

    const tempWish = { 
      id: 'temp-' + Date.now(), 
      content: wishText, 
      user_name: userName, 
      color: '#ffcc00', 
      created_at: new Date().toISOString(),
      is_public: isPublic
    };
    setFlyingWish(tempWish);

    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: wishText, user_name: userName, is_public: isPublic }),
      });
      const result = await response.json();
      if (result.success) {
        setTimeout(() => {
          setWishes(prev => [result.data[0], ...prev]);
          setFlyingWish(null);
          setIsSubmitting(false);
        }, 3500);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setTimeout(() => {
        setFlyingWish(null);
        setIsSubmitting(false);
        setErrorMsg(err.message || 'Ritual failed.');
      }, 1500);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <main className={`wish-page time-${timeOfDay}`}>
      <div className="roof-atmosphere" />
      {mounted && (
        <div className="particles-container">
          {[...Array(timeOfDay === 'night' ? 40 : 25)].map((_, i) => (
            <div key={i} className="particle" style={{ 
              left: `${(i * 37) % 100}%`, 
              top: `${(i * 59) % 100}%`,
              animationDelay: `${(i % 5)}s`
            }} />
          ))}
        </div>
      )}

      <CharacterAvatar 
        src="/images/bori/bori_lantern.png" 
        message={t('boriMessage')} 
        delay={1000} 
      />

      <audio ref={audioRef} loop preload="auto">
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3" type="audio/mpeg" />
      </audio>
      
      <div className="wish-container">
        <header className="page-header animate-fade-up">
          <div className="header-eyebrow">{t('eyebrow')}</div>
          <h1 className="page-title text-gradient-gold-v2">{t('title')}</h1>
          <p className="page-subtitle">
            {t('subtitle')}
          </p>
        </header>

        <div className="wish-controls animate-fade-up animate-delay-200">
          <div className="control-group">
            <div className="view-selector">
              <button 
                className={`btn-view ${viewMode === 'sky' ? 'active' : ''}`}
                onClick={() => setViewMode('sky')}
              >✨ {t('viewSky')}</button>
              <button 
                className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >🪟 {t('viewGrid')}</button>
            </div>

            <div className="sort-selector">
              <button 
                className={`btn-sort ${sortBy === 'likes' ? 'active' : ''}`}
                onClick={() => setSortBy('likes')}
              >✨ {t('sortDeep')}</button>
              <button 
                className={`btn-sort ${sortBy === 'date' ? 'active' : ''}`}
                onClick={() => setSortBy('date')}
              >🕒 {t('sortRecent')}</button>
            </div>

            <button className="btn-music-glass" onClick={toggleMusic}>
              <span className="btn-icon">{isMusicPlaying ? '🔊' : '🔇'}</span>
              {isMusicPlaying ? t('musicOn') : t('musicOff')}
            </button>
          </div>
        </div>

        <div className="wish-search-container animate-fade-up animate-delay-250">
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
        </div>

        <div className="wish-primary-action animate-fade-up animate-delay-300">
          <button 
            className={`btn-mine-v2 ${showOnlyMine ? 'active' : ''}`}
            onClick={() => setShowOnlyMine(!showOnlyMine)}
          >👤 {t('btnMyWishes')}</button>

          <button 
            className="btn-gold-glow-v2" 
            onClick={() => setIsModalOpen(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ascending...' : t('btnInscribe')}
          </button>
        </div>

        {flyingWish && (
          <div className="flying-lantern-container">
            <article className="lantern flying">
              <div className="lantern-light" />
              <div className="lantern-content">
                <p className="lantern-text">“{flyingWish.content}”</p>
                <p className="lantern-author">— {flyingWish.user_name}</p>
              </div>
              <div className="lantern-tassel" />
            </article>
          </div>
        )}

        <section className={`lantern-display ${viewMode === 'sky' ? 'sky-mode' : 'grid-mode'}`} style={viewMode === 'sky' ? { minHeight: `${Math.max(100, Math.ceil(wishes.length / 5) * 40)}vh` } : {}}>
          {isLoading ? (
            <div className="loading-state">{t('loading')}</div>
          ) : wishes.length === 0 ? (
            <div className="empty-state">{t('empty')}</div>
          ) : (
            wishes.map((wish, index) => {
              // Create a deterministic pseudo-random seed based on the wish ID
              const seed = Math.abs(
                wish.id.split('').reduce((acc, char) => Math.imul(31, acc) + char.charCodeAt(0) | 0, 0)
              );
              
              // Pseudo-random scatter (5% to 85% of screen width/height to avoid cutoff)
              const left = 5 + (seed % 80); 
              const top = 5 + ((seed >> 3) % 80);
              const scale = 0.5 + ((seed >> 6) % 6) * 0.12;
              const opacity = 0.6 + ((seed >> 9) % 10) * 0.04;
              
              return (
                <div 
                  key={wish.id} 
                  className="lantern-wrapper"
                  onClick={() => setSelectedWish(wish)}
                  style={viewMode === 'sky' ? { 
                    left: `${left}%`, 
                    top: `${top}%`, 
                    transform: `scale(${scale})`,
                    opacity: opacity,
                    zIndex: Math.floor(scale * 10),
                    animationDelay: `${(index % 8) * 0.7}s`,
                    cursor: 'zoom-in'
                  } : { cursor: 'zoom-in' }}
                >
                  <article className={`lantern ${wish.user_email === session?.user?.email ? 'is-mine' : ''} ${viewMode === 'grid' ? 'grid-item' : ''}`}>
                    <div className="lantern-light" />
                    {(wish.likes_count || 0) > 0 && <div className="lantern-aura-glow" />}
                    <div className="lantern-content">
                      <p className="lantern-text">“{wish.content}”</p>
                      <div className="lantern-meta">
                        <span className="lantern-author">{wish.user_name}</span>
                        {(wish.likes_count || 0) > 0 && <span className="stat-likes">✨ {wish.likes_count}</span>}
                        {!wish.is_public && <span className="badge-private">Private</span>}
                      </div>
                    </div>
                    <div className="lantern-tassel" />
                  </article>
                </div>
              );
            })
          )}
        </section>

      {/* ── Wish Input Modal ── */}
      {isModalOpen && (
        <div className="ritual-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-card animate-fade-up" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>{t('modalTitle')}</h2>
              {session?.user && lotusCount !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-gold)', fontSize: '0.9rem', fontWeight: 600, background: 'rgba(212,160,23,0.1)', padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(212,160,23,0.2)', whiteSpace: 'nowrap' }}>
                  <span>🪷</span>
                  <span>{lotusCount}</span>
                </div>
              )}
            </div>
            
            {errorMsg && <div className="error-message">{errorMsg}</div>}
              <form onSubmit={handleSubmit}>
                <textarea 
                  className="wish-input"
                  placeholder={t('modalPlaceholder')}
                  value={newWish}
                  onChange={e => setNewWish(e.target.value)}
                  maxLength={140}
                  required
                />
                <div className="modal-options">
                  <label className="checkbox-container">
                    <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                    <span className="checkmark"></span>
                    {t('modalPublic')}
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>{t('modalCancel')}</button>
                  <button type="submit" className="btn-gold">{t('modalSubmit')}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="ritual-modal-overlay" onClick={() => setErrorMsg(null)}>
            <div className="ritual-popup glass-card animate-fade-up">
              <div className="ritual-popup-icon">⚠️</div>
              <h3 className="ritual-popup-title">Ritual Interrupted</h3>
              <p className="ritual-popup-message">{errorMsg}</p>
              <button className="btn-gold" onClick={() => setErrorMsg(null)}>Return</button>
            </div>
          </div>
        )}
        {selectedWish && (
          <div className="ritual-modal-overlay" onClick={() => setSelectedWish(null)}>
            <div className="zoomed-lantern-container animate-sacred-zoom" onClick={e => e.stopPropagation()}>
              <article className="lantern zoomed">
                <div className="lantern-light" />
                <div className="lantern-content">
                  <p className="lantern-text">“{selectedWish.content}”</p>
                  <p className="lantern-author">— {selectedWish.user_name}</p>
                  <div className="wish-stats">
                    <span className="stat-item">✨ {selectedWish.likes_count || 0}</span>
                  </div>
                  <button 
                    className={`btn-light-up ${typeof window !== 'undefined' && JSON.parse(localStorage.getItem('liked_wishes') || '[]').includes(selectedWish.id) ? 'active' : ''}`} 
                    onClick={(e) => { e.stopPropagation(); handleLike(selectedWish.id); }}
                  >
                    {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('liked_wishes') || '[]').includes(selectedWish.id) ? '🌟' : '🙏'}
                  </button>
                </div>
                <div className="lantern-tassel" />
              </article>
              <button className="btn-close-zoom" onClick={() => setSelectedWish(null)}>✕ {t('modalCancel')}</button>
            </div>
          </div>
        )}
      </div>

      <div className={`snackbar ${snackbar.show ? 'show' : ''}`}>
        {snackbar.message}
      </div>

      <style>{`
        .wish-page { min-height: 100vh; padding: 120px 24px 80px; position: relative; overflow-x: hidden; transition: background 2s ease; }
        
        /* Time of Day Styles */
        .wish-page.time-night { background: #050505; }
        .wish-page.time-night .roof-atmosphere { background: radial-gradient(circle at 50% -20%, rgba(30, 20, 80, 0.4) 0%, transparent 70%); }
        .wish-page.time-night .particle { background: #fff; width: 2px; height: 2px; box-shadow: 0 0 4px #fff; }

        .wish-page.time-sunset { background: #1a0f0a; }
        .wish-page.time-sunset .roof-atmosphere { background: radial-gradient(circle at 50% -20%, rgba(212, 80, 23, 0.25) 0%, transparent 70%); }
        .wish-page.time-sunset .particle { background: #ffaa55; width: 3px; height: 3px; box-shadow: 0 0 6px #ffaa55; }

        .wish-page.time-day { background: #111a1a; }
        .wish-page.time-day .roof-atmosphere { background: radial-gradient(circle at 50% -20%, rgba(100, 200, 255, 0.15) 0%, transparent 80%); }
        .wish-page.time-day .particle { background: #ffffdd; width: 4px; height: 4px; box-shadow: 0 0 8px #ffffdd; opacity: 0.1; }

        .roof-atmosphere { position: absolute; inset: 0; pointer-events: none; transition: background 2s ease; }
        
        /* Particles */
        .particles-container { position: absolute; inset: 0; pointer-events: none; }
        .particle { position: absolute; border-radius: 50%; animation: particle-float 10s linear infinite; opacity: 0.3; transition: all 2s ease; }
        @keyframes particle-float { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.6; } 100% { transform: translateY(-100vh); opacity: 0; } }

        .wish-container { max-width: 1400px; margin: 0 auto; position: relative; z-index: 10; }
        .page-header { text-align: center; margin-bottom: 60px; }
        .header-eyebrow { font-size: 0.95rem; color: var(--primary-gold); letter-spacing: 0.35em; text-transform: uppercase; margin-bottom: 24px; font-weight: 600; }
        .page-title { font-size: clamp(2.5rem, 6vw, 4.5rem); font-family: var(--font-serif); margin-bottom: 28px; }
        .page-subtitle { font-size: 1.15rem; color: var(--text-tertiary); max-width: 600px; margin: 0 auto; line-height: 1.8; }
        .wish-controls { display: flex; flex-direction: column; align-items: center; gap: 24px; margin-bottom: 32px; }
        .control-group { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; align-items: center; }

        .sort-selector { display: flex; background: rgba(255,255,255,0.03); padding: 5px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.08); gap: 4px; }
        .btn-sort { padding: 8px 16px; border: none; background: transparent; color: var(--text-tertiary); cursor: pointer; border-radius: 10px; font-size: 0.85rem; transition: all 0.3s; white-space: nowrap; }
        .btn-sort.active { background: var(--primary-gold); color: #000; font-weight: 700; box-shadow: 0 4px 15px rgba(212, 160, 23, 0.3); }
        .btn-sort:hover:not(.active) { background: rgba(255,255,255,0.05); color: #fff; }

        .wish-search-container { display: flex; justify-content: center; margin-bottom: 32px; }
        .wish-primary-action { display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 80px; }

        .btn-mine-v2 { 
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff;
          padding: 14px 28px; border-radius: 40px; cursor: pointer; transition: 0.3s; font-weight: 600;
        }
        .btn-mine-v2.active { background: rgba(255,255,255,0.15); border-color: #fff; box-shadow: 0 0 20px rgba(255,255,255,0.1); }
        .btn-mine-v2:hover { background: rgba(255,255,255,0.1); }

        .loading-state, .empty-state { text-align: center; padding: 100px 0; color: var(--text-tertiary); font-style: italic; font-size: 1.1rem; }

        .btn-music-glass {
          background: rgba(255,255,255,0.05);
          color: var(--text-secondary);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 10px 24px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          backdrop-filter: blur(8px);
        }

        .btn-music-glass:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(212, 160, 23, 0.4);
          transform: translateY(-2px);
        }

        .search-box-v2 { 
          display: flex; gap: 12px; background: rgba(255,255,255,0.02); padding: 5px 5px 5px 20px; border-radius: 40px; 
          border: 1px solid rgba(212, 160, 23, 0.2); width: 100%; max-width: 450px; transition: all 0.3s;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        .search-box-v2:focus-within { border-color: var(--primary-gold); box-shadow: 0 0 30px rgba(212, 160, 23, 0.2); }
        .search-input { background: transparent; border: none; color: #fff; flex: 1; outline: none; font-size: 0.95rem; }
        .btn-clear-search { background: transparent; border: none; color: var(--text-tertiary); font-size: 1.2rem; cursor: pointer; padding: 0 10px; transition: 0.3s; }
        .btn-clear-search:hover { color: #fff; transform: scale(1.1); }
        .btn-search-glow { 
          background: var(--primary-gold); border: none; color: #000; padding: 10px 24px; 
          border-radius: 30px; cursor: pointer; transition: 0.3s; font-weight: 800; font-size: 0.9rem;
        }

        .btn-gold-glow-v2 {
          background: var(--primary-gold);
          color: #000;
          border: none;
          padding: 14px 40px;
          border-radius: 40px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.4s var(--ease-expo);
          box-shadow: 0 0 30px rgba(212, 160, 23, 0.4);
        }

        .btn-gold-glow-v2:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 0 50px rgba(212, 160, 23, 0.6);
        }

        .search-box-v2 { 
          display: flex; gap: 12px; background: rgba(255,255,255,0.02); padding: 5px 5px 5px 20px; border-radius: 40px; 
          border: 1px solid rgba(212, 160, 23, 0.2); width: 100%; max-width: 400px; transition: all 0.3s;
          box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        .search-box-v2:focus-within { border-color: var(--primary-gold); box-shadow: 0 0 30px rgba(212, 160, 23, 0.2); }
        .search-input { background: transparent; border: none; color: #fff; flex: 1; outline: none; font-size: 0.9rem; }
        .btn-clear-search { background: transparent; border: none; color: var(--text-tertiary); font-size: 1.1rem; cursor: pointer; padding: 0 8px; transition: 0.3s; }
        .btn-clear-search:hover { color: #fff; transform: scale(1.1); }
        .btn-search-glow { 
          background: var(--primary-gold); border: none; color: #000; padding: 8px 20px; 
          border-radius: 30px; cursor: pointer; transition: 0.3s; font-weight: 700; font-size: 0.85rem;
        }

        /* View Selector */
        .view-selector { display: flex; background: rgba(255,255,255,0.03); padding: 5px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.08); }
        .btn-view { padding: 10px 20px; border: none; background: transparent; color: var(--text-tertiary); cursor: pointer; border-radius: 10px; font-size: 0.95rem; transition: all 0.3s; }
        .btn-view.active { background: var(--primary-gold); color: #000; font-weight: 700; box-shadow: 0 4px 15px rgba(212, 160, 23, 0.3); }

        /* Modes */
        .lantern-display.sky-mode { position: relative; width: 100%; margin-top: 40px; }
        .lantern-display.grid-mode { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 50px; justify-items: center; }

        .lantern-wrapper { transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .sky-mode .lantern-wrapper { position: absolute; animation: lantern-float-sky 15s ease-in-out infinite; }
        
        @keyframes lantern-float-sky { 
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0.5deg); } 
          33% { transform: translate(15px, -30px) scale(1.15) rotate(-0.5deg); } 
          66% { transform: translate(-15px, -15px) scale(0.9) rotate(0.2deg); }
        }

        .lantern { 
          width: 180px; 
          height: 250px; 
          background: linear-gradient(180deg, rgba(212, 160, 23, 0.25) 0%, rgba(0, 0, 0, 0.8) 100%); 
          border: 1px solid rgba(212, 160, 23, 0.3); 
          border-radius: 15px 15px 45px 45px; 
          padding: 24px 20px; 
          display: flex; 
          flex-direction: column; 
          text-align: center; 
          position: relative; 
          box-shadow: 0 15px 40px rgba(0,0,0,0.6), 0 0 20px rgba(212, 160, 23, 0.1); 
          transition: all 0.4s var(--ease-expo);
        }

        .lantern:hover { border-color: var(--primary-gold); box-shadow: 0 0 30px rgba(212, 160, 23, 0.4); }
        
        .lantern.zoomed {
          width: 380px;
          max-width: 90vw;
          min-height: 300px;
          height: auto;
          max-height: 70vh;
          overflow-y: auto;
          background: linear-gradient(180deg, rgba(212, 160, 23, 0.4) 0%, rgba(0, 0, 0, 0.9) 100%);
          border-color: var(--primary-gold);
          box-shadow: 0 0 100px rgba(212, 160, 23, 0.6);
        }

        .zoomed .lantern-text { font-size: 1.6rem; line-height: 1.5; margin-bottom: 24px; -webkit-line-clamp: unset; }
        .zoomed .lantern-author { font-size: 1rem; }
        .zoomed .lantern-light { width: 150px; height: 180px; filter: blur(30px); }

        .wish-stats { margin-top: 16px; color: var(--primary-gold); font-size: 0.9rem; font-weight: 600; letter-spacing: 0.1em; }
        .btn-light-up { 
          margin-top: 24px; background: rgba(212, 160, 23, 0.15); border: 1px solid var(--primary-gold); 
          color: var(--primary-gold); padding: 12px 24px; border-radius: 30px; cursor: pointer;
          transition: all 0.3s; font-weight: 700; font-size: 0.95rem;
        }
        .btn-light-up:hover { background: var(--primary-gold); color: #000; box-shadow: 0 0 20px rgba(212, 160, 23, 0.4); }
        .btn-light-up.active { background: var(--primary-gold); color: #000; box-shadow: 0 0 30px rgba(212, 160, 23, 0.6); border-color: #fff; }

        .stat-likes { font-size: 0.7rem; color: var(--primary-gold); margin-left: 8px; font-weight: 700; }
        .lantern-aura-glow {
          position: absolute; inset: -15px; background: radial-gradient(circle, rgba(212, 160, 23, 0.2) 0%, transparent 70%);
          border-radius: 50%; filter: blur(10px); animation: breathing-aura 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes breathing-aura {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        .zoomed-lantern-container { position: relative; display: flex; flex-direction: column; align-items: center; gap: 24px; z-index: 100001; }
        .btn-close-zoom { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 12px 32px; border-radius: 30px; cursor: pointer; transition: 0.3s; font-weight: 600; }
        .btn-close-zoom:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); }

        @keyframes sacred-zoom {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-sacred-zoom { animation: sacred-zoom 0.6s cubic-bezier(0.2, 0, 0, 1) forwards; }
        .lantern-text { font-family: var(--font-serif); font-size: 0.9rem; color: #fff; margin-bottom: 12px; font-style: italic; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; text-shadow: 0 2px 10px #000; }
        .lantern-author { font-size: 0.65rem; color: var(--primary-gold); text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8; }
        .badge-private { font-size: 0.55rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; margin-top: 4px; color: var(--text-tertiary); }
        .lantern-tassel { position: absolute; bottom: -35px; left: 50%; transform: translateX(-50%); width: 1.5px; height: 35px; background: linear-gradient(to bottom, var(--primary-gold), transparent); }

        /* Modal Overlay FIX */
        .ritual-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); backdrop-filter: blur(15px); z-index: 99999; display: flex; align-items: flex-start; justify-content: center; padding: calc(var(--nav-height) + 24px) 24px 40px; overflow-y: auto; }
        .modal-content { width: 100%; max-width: 500px; padding: 40px; border: 1px solid rgba(212,160,23,0.2); }
        .modal-title { font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 24px; text-align: center; }
        .wish-input { width: 100%; height: 120px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; color: #fff; font-size: 1rem; margin-bottom: 16px; resize: none; }
        .checkbox-container { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); cursor: pointer; margin-bottom: 24px; }
        .modal-actions { display: flex; justify-content: center; gap: 16px; }

        /* Flying Animation */
        .flying-lantern-container { position: fixed; inset: 0; z-index: 4000; display: flex; justify-content: center; align-items: flex-end; pointer-events: none; }
        .lantern.flying { animation: lantern-ascend-sky 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; box-shadow: 0 0 60px var(--primary-gold); }
        @keyframes lantern-ascend-sky { 0% { transform: translateY(20vh) scale(0.6); opacity: 0; } 15% { transform: translateY(0) scale(1.1); opacity: 1; } 100% { transform: translateY(-130vh) scale(0.7); opacity: 0; } }

        .snackbar {
          position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%) translateY(100px);
          background: rgba(212, 160, 23, 0.95); color: #000; padding: 14px 40px; border-radius: 50px;
          font-weight: 800; font-size: 1rem; box-shadow: 0 10px 50px rgba(0,0,0,0.8), 0 0 20px rgba(212, 160, 23, 0.5);
          transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1); opacity: 0; z-index: 200000;
          pointer-events: none; letter-spacing: 0.05em; text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .snackbar.show { transform: translateX(-50%) translateY(0); opacity: 1; }
      `}</style>

      {/* ── Lotus Upgrade Modal ── */}
      {showUpgradeModal && (
        <div className="ritual-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content glass-card animate-fade-up text-center" onClick={e => e.stopPropagation()}>
            <div className="modal-inner" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🪷</div>
              <h2 className="modal-title">{tGuru('upgradeTitle')}</h2>
              <p style={{
                fontFamily: 'var(--font-serif)', fontSize: '1rem',
                color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '28px',
              }}>
                {tGuru('upgradeBody')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <a
                  href={process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_URL || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold-glow-v2"
                  style={{ flex: 1, padding: '10px 12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem', whiteSpace: 'nowrap', textAlign: 'center' }}
                >
                  🪷 {tGuru('buyLotus')}
                </a>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  style={{
                    flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '10px 12px', color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', fontFamily: 'var(--font-serif)', fontSize: '0.9rem', whiteSpace: 'nowrap', textAlign: 'center'
                  }}
                >
                  {tGuru('returnToSilence')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

