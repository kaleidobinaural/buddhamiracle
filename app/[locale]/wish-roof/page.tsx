'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
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
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('night');
  const [snackbar, setSnackbar] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lotusCount, setLotusCount] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const snackbarTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wishSectionRef = useRef<HTMLDivElement>(null);

  const handleTogglePublic = async (wish: Wish) => {
    setIsActionSubmitting(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: wish.id, action: 'toggle_public' }),
      });
      if (res.ok) {
        const updatedStatus = !wish.is_public;
        setWishes(prev => prev.map(w => w.id === wish.id ? { ...w, is_public: updatedStatus } : w));
        if (selectedWish?.id === wish.id) {
          setSelectedWish({ ...selectedWish, is_public: updatedStatus });
        }
        showMessage(updatedStatus ? (t('wishMadePublic') || '공개 소원으로 전환되었습니다.') : (t('wishMadePrivate') || '비공개 소원으로 전환되었습니다.'));
      }
    } catch {
      showMessage('오류가 발생했습니다.');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleDeleteWish = async (id: string) => {
    setIsActionSubmitting(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setWishes(prev => prev.filter(w => w.id !== id));
        setSelectedWish(null);
        setDeleteConfirmOpen(false);
        showMessage(t('wishDeleted') || '소원이 삭제되었습니다.');
      }
    } catch {
      showMessage('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
    if (wishSectionRef.current) {
      wishSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    fetchWishes(searchQuery, sortBy, showOnlyMine);
    setMounted(true);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
    
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
      if (response.ok && result.success) {
        if (typeof result.lotus_count === 'number') {
          setLotusCount(result.lotus_count);
          window.dispatchEvent(new CustomEvent('lotus-updated', { detail: { lotus_count: result.lotus_count } }));
        }
        setTimeout(() => {
          setWishes(prev => [result.data[0], ...prev]);
          setFlyingWish(null);
          setIsSubmitting(false);
        }, 3500);
      } else {
        if (response.status === 403) {
          setFlyingWish(null);
          setIsSubmitting(false);
          setShowUpgradeModal(true);
          return;
        }
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



  return (
    <main className={`wish-page time-${timeOfDay}`}>
      <div className="roof-atmosphere" />
      {mounted && (
        <div className="particles-container">
          {[...Array(12)].map((_, i) => (
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


      
      <div className="wish-container" ref={wishSectionRef}>
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

        {/* Search / Filter Status Badge */}
        {(showOnlyMine || searchQuery) && (
          <div className="search-status-banner animate-fade-up">
            <div className="search-status-chip">
              <span className="search-status-icon">{showOnlyMine ? '👤' : '🔍'}</span>
              <span className="search-status-text">
                {showOnlyMine ? (
                  <>{t('viewingMyWishes', { count: wishes.length }) || `내 소원 (${wishes.length}개)`}</>
                ) : (
                  <>&ldquo;{searchQuery}&rdquo; {t('searchResultCount', { count: wishes.length }) || `검색 결과 (${wishes.length}개)`}</>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Sacred Sky Frame / Viewport */}
        <div className="sacred-sky-frame">
          <div className="sky-fade-top" aria-hidden="true" />
          <div className="sacred-sky-scroll-area" ref={scrollAreaRef}>
            {(() => {
              const isFewOrFiltered = showOnlyMine || !!searchQuery || wishes.length <= 3;
              const canvasHeight = isFewOrFiltered ? 540 : Math.max(700, Math.ceil(wishes.length / 3) * 220);
              return (
                <section 
                  className={`lantern-display ${viewMode === 'sky' ? 'sky-mode' : 'grid-mode'} ${isFewOrFiltered && viewMode === 'sky' ? 'centered-sky' : ''}`} 
                  style={viewMode === 'sky' ? { height: `${canvasHeight}px` } : {}}
                >
                  {isLoading ? (
                    <div className="loading-state">{t('loading')}</div>
                  ) : wishes.length === 0 ? (
                    <div className="empty-state">{t('empty')}</div>
                  ) : (
                    wishes.map((wish, index) => {
                      let left: number;
                      let top: number | string;
                      let scale: number;
                      let opacity: number;

                      if (isFewOrFiltered && viewMode === 'sky') {
                        if (wishes.length === 1) {
                          left = 50;
                          top = 48;
                          scale = 1.15;
                          opacity = 1.0;
                        } else if (wishes.length === 2) {
                          left = index === 0 ? 35 : 65;
                          top = 48;
                          scale = 1.05;
                          opacity = 0.96;
                        } else if (wishes.length === 3) {
                          left = index === 0 ? 22 : index === 1 ? 50 : 78;
                          top = index === 1 ? 44 : 50;
                          scale = 1.0;
                          opacity = 0.95;
                        } else {
                          const cols = Math.min(3, wishes.length);
                          const row = Math.floor(index / cols);
                          const col = index % cols;
                          const itemsInRow = Math.min(cols, wishes.length - row * cols);
                          left = 50 + (col - (itemsInRow - 1) / 2) * 28;
                          top = 28 + row * 38;
                          scale = 0.92;
                          opacity = 0.92;
                        }
                      } else {
                        const seed = Math.abs(
                          wish.id.split('').reduce((acc, char) => Math.imul(31, acc) + char.charCodeAt(0) | 0, 0)
                        );
                        const totalSlots = Math.max(1, wishes.length);
                        const baseTop = (index / totalSlots) * (canvasHeight - 280) + 40;
                        const jitterTop = ((seed >> 2) % 70) - 35;
                        top = Math.max(30, Math.min(canvasHeight - 260, baseTop + jitterTop));
                        left = 3 + (seed % 90);
                        scale = 0.6 + ((seed >> 6) % 5) * 0.1;
                        opacity = 0.75 + ((seed >> 9) % 10) * 0.025;
                      }

                      const isMyWish = !!(session?.user?.email && wish.user_email && session.user.email.toLowerCase() === wish.user_email.toLowerCase());

                      return (
                        <div 
                          key={wish.id} 
                          className="lantern-wrapper"
                          onClick={() => setSelectedWish(wish)}
                          style={viewMode === 'sky' ? { 
                            left: `${left}%`, 
                            top: isFewOrFiltered ? `${top}%` : `${top}px`, 
                            transform: isFewOrFiltered ? `translate(-50%, -50%) scale(${scale})` : `scale(${scale})`,
                            opacity: opacity,
                            zIndex: Math.floor(scale * 10),
                            animationDelay: `${(index % 8) * 0.7}s`,
                            cursor: 'zoom-in'
                          } : { cursor: 'zoom-in' }}
                        >
                          <article className={`lantern ${isMyWish ? 'is-mine' : ''} ${viewMode === 'grid' ? 'grid-item' : ''}`}>
                            <div className="lantern-light" />
                            {(wish.likes_count || 0) > 0 && <div className="lantern-aura-glow" />}
                            <div className="lantern-content">
                              <p className="lantern-text">“{wish.content}”</p>
                              <div className="lantern-meta">
                                <span className="lantern-author">{wish.user_name}</span>
                                {(wish.likes_count || 0) > 0 && <span className="stat-likes">✨ {wish.likes_count}</span>}
                                {isMyWish && <span className="badge-mine">{t('myWishBadge') || '내 소원'}</span>}
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
              );
            })()}
          </div>
          <div className="sky-fade-bottom" aria-hidden="true" />
        </div>

        {/* Bottom Controls: View All Reset (when active) + Scroll To Top */}
        <div className="sky-bottom-controls animate-fade-up">
          {(showOnlyMine || searchQuery) && (
            <button
              type="button"
              className="btn-bottom-pill"
              onClick={() => {
                setShowOnlyMine(false);
                setSearchQuery('');
                fetchWishes('', sortBy, false);
              }}
            >
              <span className="btn-bottom-icon">🌟</span>
              <span className="btn-bottom-label">{t('viewAllWishes') || '전체 소원 보기'}</span>
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
                <button
                  type="button"
                  className="btn-modal-close-corner"
                  onClick={() => setSelectedWish(null)}
                  aria-label={t('modalCancel')}
                >✕</button>
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

                  {/* Owner Controls (In-situ wish management) */}
                  {session?.user?.email && selectedWish.user_email && session.user.email.toLowerCase() === selectedWish.user_email.toLowerCase() && (
                    <div className="wish-owner-toolbar">
                      <button 
                        type="button" 
                        className="btn-owner-action btn-owner-toggle"
                        onClick={(e) => { e.stopPropagation(); handleTogglePublic(selectedWish); }}
                        disabled={isActionSubmitting}
                        title={selectedWish.is_public ? (t('makePrivate') || '비공개로 전환') : (t('makePublic') || '공개로 전환')}
                      >
                        {selectedWish.is_public ? '🔒 ' + (t('makePrivate') || '비공개로 전환') : '🌐 ' + (t('makePublic') || '공개로 전환')}
                      </button>
                      <button 
                        type="button" 
                        className="btn-owner-action btn-owner-delete"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmOpen(true); }}
                        disabled={isActionSubmitting}
                        title={t('deleteWish') || '소원 삭제'}
                      >
                        🗑️ {t('deleteWish') || '소원 삭제'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="lantern-tassel" />
              </article>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && selectedWish && (
          <div className="delete-confirm-overlay" onClick={() => setDeleteConfirmOpen(false)}>
            <div className="delete-confirm-box glass-card animate-fade-up" onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🗑️</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '10px', color: '#fff' }}>
                {t('confirmDeleteWishTitle') || '소원 삭제'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
                {t('confirmDeleteWishDesc') || '이 소원을 삭제하시겠습니까? 삭제된 소원은 복구할 수 없습니다.'}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-delete-cancel"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  {t('modalCancel') || '취소'}
                </button>
                <button
                  type="button"
                  className="btn-delete-confirm"
                  onClick={() => handleDeleteWish(selectedWish.id)}
                  disabled={isActionSubmitting}
                >
                  {isActionSubmitting ? '...' : (t('deleteWish') || '삭제')}
                </button>
              </div>
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
          box-shadow: 0 0 20px rgba(0,0,0,0.5); flex-wrap: nowrap; align-items: center;
        }
        .search-box-v2:focus-within { border-color: var(--primary-gold); box-shadow: 0 0 30px rgba(212, 160, 23, 0.2); }
        .search-input { background: transparent; border: none; color: #fff; flex: 1; min-width: 0; outline: none; font-size: 0.95rem; }
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

        /* Sacred Sky Viewport Frame */
        .sacred-sky-frame {
          position: relative;
          width: 100%;
          margin: 28px auto 40px;
          border-radius: 20px;
          background: radial-gradient(ellipse at 50% 15%, rgba(26, 18, 50, 0.45) 0%, rgba(8, 8, 7, 0.95) 100%);
          border: 1px solid rgba(212, 160, 23, 0.25);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(212, 160, 23, 0.04);
          overflow: hidden;
        }

        .sacred-sky-scroll-area {
          height: clamp(500px, 68vh, 760px);
          overflow: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          position: relative;
          padding: 24px 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 160, 23, 0.45) rgba(0, 0, 0, 0.4);
        }

        .sacred-sky-scroll-area::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .sacred-sky-scroll-area::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.35);
          border-radius: 10px;
        }
        .sacred-sky-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(212, 160, 23, 0.4);
          border-radius: 10px;
          border: 1px solid rgba(212, 160, 23, 0.2);
        }
        .sacred-sky-scroll-area::-webkit-scrollbar-thumb:hover {
          background: var(--primary-gold);
        }

        .sky-fade-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(to bottom, rgba(8, 8, 7, 0.95), transparent);
          pointer-events: none;
          z-index: 20;
        }

        .sky-fade-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50px;
          background: linear-gradient(to top, rgba(8, 8, 7, 0.95), transparent);
          pointer-events: none;
          z-index: 20;
        }

        /* Search Status Banner */
        .search-status-banner {
          display: flex;
          justify-content: center;
          margin-top: 20px;
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

        /* Modes */
        .lantern-display.sky-mode { position: relative; width: 180%; min-width: 1400px; }
        .lantern-display.sky-mode.centered-sky { width: 100% !important; min-width: 100% !important; }
        .lantern-display.grid-mode { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 240px)); 
          gap: 40px 32px; 
          justify-items: center; 
          justify-content: center;
          align-content: center;
          min-height: 100%;
          padding: 24px 16px; 
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .lantern-display.grid-mode .lantern-wrapper {
          width: 220px;
          display: flex;
          justify-content: center;
        }

        .badge-mine {
          background: rgba(212, 160, 23, 0.25);
          border: 1px solid rgba(212, 160, 23, 0.5);
          color: var(--primary-gold);
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
        }

        .wish-owner-toolbar {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          width: 100%;
          justify-content: center;
        }

        .btn-owner-action {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-family: var(--font-ui);
        }

        .btn-owner-toggle {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
        }
        .btn-owner-toggle:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .btn-owner-delete {
          background: rgba(229, 57, 53, 0.15);
          border: 1px solid rgba(229, 57, 53, 0.4);
          color: #ff8888;
        }
        .btn-owner-delete:hover {
          background: rgba(229, 57, 53, 0.3);
          border-color: #ff5555;
          color: #fff;
        }

        .delete-confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(10px);
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .delete-confirm-box {
          background: rgba(20, 20, 20, 0.98);
          border: 1px solid rgba(212, 160, 23, 0.3);
          border-radius: 20px;
          padding: 36px 30px;
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
        }

        .btn-delete-cancel {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
          padding: 10px 24px;
          border-radius: 100px;
          cursor: pointer;
          font-size: 0.9rem;
          font-family: var(--font-ui);
        }
        .btn-delete-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .btn-delete-confirm {
          background: #e53935;
          border: none;
          color: #fff;
          padding: 10px 24px;
          border-radius: 100px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 700;
          font-family: var(--font-ui);
        }
        .btn-delete-confirm:hover {
          background: #d32f2f;
        }

        /* Bottom Action Controls */
        .sky-bottom-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 24px;
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

        .lantern-wrapper { transition: transform 0.4s var(--ease-expo); will-change: transform; }
        .sky-mode .lantern-wrapper { position: absolute; animation: lantern-float-sky 15s ease-in-out infinite; }
        
        @keyframes lantern-float-sky { 
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0.5deg); } 
          33% { transform: translate(12px, -20px) scale(1.08) rotate(-0.5deg); } 
          66% { transform: translate(-12px, -10px) scale(0.94) rotate(0.2deg); }
        }

        .lantern { 
          width: 170px; 
          height: 240px; 
          background: linear-gradient(180deg, rgba(212, 160, 23, 0.22) 0%, rgba(0, 0, 0, 0.85) 100%); 
          border: 1px solid rgba(212, 160, 23, 0.3); 
          border-radius: 15px 15px 45px 45px; 
          padding: 22px 18px; 
          display: flex; 
          flex-direction: column; 
          text-align: center; 
          position: relative; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(212, 160, 23, 0.08); 
          transition: all 0.4s var(--ease-expo);
        }

        .lantern:hover { border-color: var(--primary-gold); box-shadow: 0 0 30px rgba(212, 160, 23, 0.4); }
        
        .lantern.zoomed {
          width: 420px;
          max-width: 90vw;
          min-height: 280px;
          height: auto;
          max-height: 75vh;
          overflow-y: auto;
          background: linear-gradient(180deg, rgba(212, 160, 23, 0.28) 0%, rgba(12, 10, 8, 0.96) 100%);
          border: 1px solid var(--primary-gold);
          box-shadow: 0 0 70px rgba(212, 160, 23, 0.45), 0 20px 50px rgba(0, 0, 0, 0.9);
          padding: 36px 28px 28px;
          position: relative;
        }

        .btn-modal-close-corner {
          position: absolute;
          top: 14px;
          right: 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: rgba(255, 255, 255, 0.8);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }
        .btn-modal-close-corner:hover {
          background: rgba(212, 160, 23, 0.3);
          border-color: var(--primary-gold);
          color: #fff;
          transform: scale(1.1);
        }

        .zoomed .lantern-content {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .zoomed .lantern-text {
          font-size: 1.45rem;
          line-height: 1.6;
          margin-top: 6px;
          margin-bottom: 20px;
          -webkit-line-clamp: unset;
          color: #fff;
          text-shadow: 0 2px 8px rgba(0,0,0,0.8);
        }
        .zoomed .lantern-author {
          font-size: 0.95rem;
          color: var(--primary-gold);
          letter-spacing: 0.12em;
        }
        .zoomed .lantern-light {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translate(-50%, -30%);
          width: 220px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.22) 0%, rgba(212, 160, 23, 0.06) 50%, transparent 70%);
          filter: blur(25px);
          pointer-events: none;
          z-index: 0;
        }

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
          position: absolute; inset: -15px; 
          background: radial-gradient(circle, rgba(212, 160, 23, 0.35) 0%, rgba(212, 160, 23, 0.08) 45%, transparent 70%);
          border-radius: 50%; 
          animation: breathing-aura 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes breathing-aura {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.25); opacity: 0.7; }
        }

        .zoomed-lantern-container { position: relative; display: flex; flex-direction: column; align-items: center; gap: 24px; z-index: 100001; }


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
                <Link
                  href="/store#lotus-section"
                  className="btn-gold-glow-v2"
                  style={{ flex: 1, padding: '10px 12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem', whiteSpace: 'nowrap', textAlign: 'center', textDecoration: 'none' }}
                >
                  🪷 {tGuru('buyLotus')}
                </Link>
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

