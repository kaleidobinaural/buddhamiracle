'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BuddhaHall from '@/components/BuddhaHall';

export default function HallPage() {
  const router = useRouter();
  const t = useTranslations('hall');
  const tWish = useTranslations('WishRoof');
  const tGuru = useTranslations('Guru');
  const { data: session, status } = useSession();
  const [is3DMode, setIs3DMode] = useState(false);
  const [isEcoMode, setIsEcoMode] = useState(false);
  const [lotusCount, setLotusCount] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Offering Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWish, setNewWish] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/lotus')
        .then(r => r.json())
        .then(d => { if (typeof d.lotus_count === 'number') setLotusCount(d.lotus_count); })
        .catch(() => {});
    }
  }, [session]);

  const handleOfferingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.trim() || isSubmitting) return;

    if (status !== 'authenticated') {
      window.location.href = '/api/auth/signin';
      return;
    }

    if (lotusCount !== null && lotusCount < 3) {
      setIsModalOpen(false);
      setShowUpgradeModal(true);
      return;
    }

    const wishText = newWish.trim();
    const userName = session?.user?.name || 'Anonymous';
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: wishText, user_name: userName, is_public: isPublic }),
      });
      const result = await response.json();
      if (result.success) {
        if (typeof result.lotus_count === 'number') {
          setLotusCount(result.lotus_count);
          window.dispatchEvent(new CustomEvent('lotus-updated', { detail: { lotus_count: result.lotus_count } }));
        }
        setIsModalOpen(false);
        setNewWish('');
        setSnackbar({ message: 'Your offering has been illuminated. 🙏 (3 🪷)', show: true });
        setTimeout(() => setSnackbar({ message: '', show: false }), 4000);
      } else if (response.status === 403) {
        setIsModalOpen(false);
        setShowUpgradeModal(true);
      } else {
        setSnackbar({ message: result.error || 'Offering failed.', show: true });
        setTimeout(() => setSnackbar({ message: '', show: false }), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="hall-container">
      <BuddhaHall is3DMode={is3DMode} isEcoMode={isEcoMode} />

      <div className="hall-overlay animate-fade-in">
        <header className="hall-header">
          <h1 className="hall-title text-gradient-gold-v2">{t('title')}</h1>
        </header>

        <footer className="hall-footer">
          <div className="hall-controls">
            <button
              className={`explore-btn ${is3DMode ? 'active' : ''}`}
              onClick={() => setIs3DMode(!is3DMode)}
            >
              <span className="btn-icon" style={{ fontSize: '1.2rem', lineHeight: '1', display: 'block' }}>☸</span>
              {is3DMode ? t('returnToMeditation') : t('explore3d')}
            </button>
            <button className="offering-btn" onClick={() => {
              if (status !== 'authenticated') { setShowLoginModal(true); return; }
              setIsModalOpen(true);
            }}>
              <span className="btn-icon">🕯️</span>
              {t('writeWish')}
            </button>
            <button className="exit-btn" onClick={() => router.push('/')}>
              <span className="btn-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{display:'block'}}>
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </span>
              {t('exit')}
            </button>
            <button
              className={`eco-btn ${isEcoMode ? 'active' : ''}`}
              onClick={() => setIsEcoMode(!isEcoMode)}
              title={isEcoMode ? 'Lite Mode On (Low GPU)' : 'Switch to Lite Mode (Low GPU)'}
            >
              <span className="btn-icon">{isEcoMode ? '🌿' : '⚡'}</span>
              {isEcoMode ? t('ecoOn') : t('eco')}
            </button>
          </div>
        </footer>
      </div>

      {/* Offering Modal */}
      {isModalOpen && (
        <div className="ritual-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-card animate-fade-up" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>{tWish('modalTitle')}</h2>
              {session?.user && lotusCount !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-gold)', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(212,160,23,0.1)', padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(212,160,23,0.2)', whiteSpace: 'nowrap' }}>
                  <span>🪷</span>
                  <span>{lotusCount}</span>
                </div>
              )}
            </div>
            <form onSubmit={handleOfferingSubmit}>
              <textarea 
                className="wish-input"
                placeholder={tWish('modalPlaceholder')}
                value={newWish}
                onChange={e => setNewWish(e.target.value)}
                maxLength={140}
                required
              />
              <div className="modal-options">
                <label className="checkbox-container">
                  <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                  <span className="checkmark"></span>
                  {tWish('modalPublic')}
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>{tWish('modalCancel')}</button>
                <button type="submit" className="btn-gold" disabled={isSubmitting}>
                  {isSubmitting ? '...' : tWish('modalSubmit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lotus Upgrade Modal */}
      {showUpgradeModal && (
        <div className="ritual-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content glass-card animate-fade-up text-center" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
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
                  href="/store#lotus-section"
                  className="btn-gold"
                  style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem', whiteSpace: 'nowrap', textAlign: 'center', textDecoration: 'none' }}
                >
                  🪷 {tGuru('buyLotus')}
                </a>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  style={{
                    flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '12px', color: 'rgba(255,255,255,0.5)',
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

      {/* Snackbar */}
      <div className={`snackbar ${snackbar.show ? 'show' : ''}`}>
        {snackbar.message}
      </div>

      <style jsx>{`
        .hall-container {
          position: relative;
          width: 100vw;
          height: 100dvh; /* Use dynamic viewport height to fix mobile browser bar clipping */
          overflow: hidden;
          background: #000;
        }

        .hall-overlay {
          position: fixed;
          inset: 0;
          z-index: 10;
          pointer-events: none;
        }

        .hall-header {
          position: absolute;
          top: calc(var(--nav-height, 80px) + 12px);
          width: 100%;
          text-align: center;
          padding: 0;
          overflow: visible;
        }

        .hall-title {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 300;
          line-height: 1.2;
          text-shadow: 0 0 30px rgba(212, 160, 23, 0.4);
          padding-bottom: 0;
          margin-bottom: 0;
        }

        .hall-footer {
          position: absolute;
          right: 60px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          pointer-events: auto;
        }

        .hall-controls {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: stretch;
          width: 240px;
        }

        .explore-btn, .offering-btn, .exit-btn, .eco-btn {
          background: rgba(212, 160, 23, 0.15);
          border: 1px solid rgba(212, 160, 23, 0.4);
          color: #fff;
          padding: 14px 20px;
          border-radius: 20px;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          backdrop-filter: blur(10px);
          text-decoration: none;
          width: 100%;
        }

        @media (max-width: 768px) {
          .explore-btn, .offering-btn, .exit-btn, .eco-btn {
            flex-direction: column;
            padding: 12px 10px;
            font-size: 0.85rem;
            gap: 4px;
            text-align: center;
            justify-content: center;
          }
        }

        .explore-btn {
          background: rgba(212, 160, 23, 0.8) !important;
          color: #000 !important;
          font-weight: 700 !important;
          border: none !important;
          box-shadow: 0 10px 25px rgba(212, 160, 23, 0.4);
        }

        @keyframes gold-pulse {
          from { box-shadow: 0 0 10px rgba(212, 160, 23, 0.3), 0 5px 15px rgba(212, 160, 23, 0.2); }
          to { box-shadow: 0 0 25px rgba(212, 160, 23, 0.6), 0 8px 30px rgba(212, 160, 23, 0.4); }
        }

        .explore-btn:hover {
          background: #fff !important;
          color: #000 !important;
          transform: translateY(-2px) scale(1.03);
        }

        .explore-btn.active {
          background: rgba(255, 255, 255, 0.15) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          color: #fff !important;
          animation: none !important;
          box-shadow: none !important;
        }

        .explore-btn:hover, .offering-btn:hover, .exit-btn:hover {
          background: rgba(212, 160, 23, 0.2);
          border-color: #d4a017;
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(212, 160, 23, 0.2);
        }

        .exit-btn {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .exit-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 5px 20px rgba(255, 255, 255, 0.1);
        }

        .eco-btn {
          background: rgba(30, 80, 30, 0.6);
          border-color: rgba(100, 200, 100, 0.3);
          color: rgba(150, 220, 150, 0.9);
        }

        .eco-btn:hover {
          background: rgba(40, 120, 40, 0.25);
          border-color: rgba(100, 200, 100, 0.6);
          box-shadow: 0 5px 20px rgba(80, 180, 80, 0.2);
          transform: translateY(-2px);
        }

        .eco-btn.active {
          background: rgba(50, 150, 50, 0.25);
          border-color: rgba(100, 220, 100, 0.7);
          color: #7dff7d;
          box-shadow: 0 0 15px rgba(80, 200, 80, 0.3);
        }

        .btn-icon {
          font-size: 1.2rem;
        }

        /* Modal Styles */
        .ritual-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 40px;
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(212, 160, 23, 0.3);
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .modal-title {
          font-family: var(--font-serif);
          color: var(--primary-gold);
          font-size: 1.8rem;
          margin-bottom: 24px;
          text-align: center;
        }

        .wish-input {
          width: 100%;
          height: 120px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 16px;
          color: #fff;
          font-size: 1rem;
          resize: none;
          margin-bottom: 20px;
          outline: none;
          transition: border-color 0.3s;
        }

        .wish-input:focus {
          border-color: var(--primary-gold);
        }

        .modal-options {
          margin-bottom: 30px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ccc;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          gap: 16px;
        }

        .modal-actions button {
          flex: 1;
          padding: 14px;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
        }

        .btn-ghost:hover {
          background: rgba(255,255,255,0.1);
        }

        .btn-gold {
          background: var(--primary-gold);
          border: none;
          color: #000;
        }

        .btn-gold:hover {
          box-shadow: 0 0 20px rgba(212, 160, 23, 0.4);
        }

        /* Snackbar */
        .snackbar {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translate(-50%, 20px);
          background: rgba(212, 160, 23, 0.9);
          color: #000;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: 600;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
          z-index: 200;
        }

        .snackbar.show {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, 0);
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 2.5s forwards ease-out;
        }

        @media (max-width: 768px) {
          .hall-header { top: calc(var(--nav-height, 80px) + 8px); padding: 0; }
          .hall-title { font-size: 2rem; }
          
          .hall-footer {
            right: 0;
            top: auto;
            bottom: 75px; /* Raised above the ambient sound button */
            transform: none;
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 0 16px;
          }
          
          .hall-controls {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            max-width: 100%;
          }
          
          .explore-btn, .offering-btn, .exit-btn, .eco-btn {
            width: calc(50% - 5px); /* 2x2 Grid */
            font-size: 0.9rem;
            padding: 10px 0;
          }
        }
      `}</style>

      {/* Sacred Login Modal — Hall */}
      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(18px)',
            zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg,#12100e,#1a1510)',
              border: '1px solid rgba(212,160,23,0.25)',
              borderRadius: '24px',
              padding: '44px 36px 36px',
              maxWidth: '360px', width: '90%',
              textAlign: 'center', position: 'relative',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            }}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              style={{ position:'absolute',top:'12px',right:'16px',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.4)',fontSize:'1.5rem',padding:'8px',WebkitTapHighlightColor:'transparent' }}
            >✕</button>
            <span style={{ fontSize:'3.5rem', marginBottom:'16px', display:'block' }}>🪷</span>
            <h2 style={{ fontFamily:'var(--font-serif)',fontSize:'1.6rem',background:'linear-gradient(135deg,#FFD700,#D4A017)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'12px' }}>
              {tWish('loginRequiredTitle') || '로그인이 필요합니다'}
            </h2>
            <p style={{ fontSize:'0.92rem',color:'rgba(255,255,255,0.6)',lineHeight:1.65,marginBottom:'28px' }}>
              {tWish('loginRequiredDesc') || '소원을 적으려면 먼저 신성한 사원에 입장해 주세요.'}
            </p>
            <div style={{ height:'1px',background:'linear-gradient(to right,transparent,rgba(212,160,23,0.25),transparent)',marginBottom:'28px' }} />
            <button
              onClick={() => { setShowLoginModal(false); signIn('google'); }}
              style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',width:'100%',padding:'16px 24px',background:'linear-gradient(135deg,#D4A017,#FFD700)',color:'#1a1200',fontWeight:700,fontSize:'1rem',border:'none',borderRadius:'14px',cursor:'pointer',boxShadow:'0 8px 24px rgba(212,160,23,0.35)',WebkitTapHighlightColor:'transparent' }}
            >
              <span>✨</span>
              <span>{tWish('signInBtn') || '구글로 로그인하기'}</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
