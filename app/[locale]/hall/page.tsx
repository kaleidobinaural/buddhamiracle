export const runtime = 'edge';
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BuddhaHall from '@/components/BuddhaHall';

export default function HallPage() {
  const router = useRouter();
  const t = useTranslations('hall');
  const tWish = useTranslations('WishRoof');
  const { data: session } = useSession();
  const [is3DMode, setIs3DMode] = useState(false);
  const [isEcoMode, setIsEcoMode] = useState(false);
  
  // Offering Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWish, setNewWish] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  const handleOfferingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.trim() || isSubmitting) return;

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
        setIsModalOpen(false);
        setNewWish('');
        setSnackbar({ message: 'Your offering has been illuminated. 🙏', show: true });
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
              <span className="btn-icon">☸</span>
              {is3DMode ? t('returnToMeditation') : t('explore3d')}
            </button>
            <button className="offering-btn" onClick={() => setIsModalOpen(true)}>
              <span className="btn-icon">🕯️</span>
              {t('writeWish')}
            </button>
            <button className="exit-btn" onClick={() => router.push('/')}>
              <span className="btn-icon">←</span>
              {t('exit')}
            </button>
            <button 
              className={`eco-btn ${isEcoMode ? 'active' : ''}`}
              onClick={() => setIsEcoMode(!isEcoMode)}
              title={isEcoMode ? 'Eco Mode On (Low GPU)' : 'Switch to Eco Mode'}
            >
              <span className="btn-icon">{isEcoMode ? '🌿' : '⚡'}</span>
              {isEcoMode ? 'Eco On' : 'Eco'}
            </button>
          </div>
        </footer>
      </div>

      {/* Offering Modal */}
      {isModalOpen && (
        <div className="ritual-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-card animate-fade-up" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{tWish('modalTitle')}</h2>
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

      {/* Snackbar */}
      <div className={`snackbar ${snackbar.show ? 'show' : ''}`}>
        {snackbar.message}
      </div>

      <style jsx>{`
        .hall-container {
          position: relative;
          width: 100vw;
          height: 100vh;
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
          top: 100px; /* Moved down to clear global navbar */
          width: 100%;
          text-align: center;
          padding: 20px 0;
          overflow: visible;
        }

        .hall-title {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 300;
          line-height: 1.4;
          text-shadow: 0 0 30px rgba(212, 160, 23, 0.4);
          padding-bottom: 20px;
          margin-bottom: -20px;
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

        .explore-btn, .offering-btn, .exit-btn {
          background: rgba(212, 160, 23, 0.1);
          border: 1px solid rgba(212, 160, 23, 0.3);
          color: #d4a017;
          padding: 14px 20px;
          border-radius: 30px;
          font-size: 0.95rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          backdrop-filter: blur(10px);
          text-decoration: none;
          width: 100%;
        }

        .explore-btn {
          background: linear-gradient(135deg, #d4a017 0%, #b8860b 100%) !important;
          color: #000 !important;
          font-weight: 700 !important;
          border: none !important;
          box-shadow: 0 10px 25px rgba(212, 160, 23, 0.4), 0 0 15px rgba(212, 160, 23, 0.2);
          animation: gold-pulse 2s infinite alternate;
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
          background: rgba(30, 80, 30, 0.2);
          border-color: rgba(100, 200, 100, 0.3);
          color: rgba(150, 220, 150, 0.8);
        }

        .eco-btn:hover {
          background: rgba(40, 120, 40, 0.3);
          border-color: rgba(100, 200, 100, 0.6);
          box-shadow: 0 5px 20px rgba(80, 180, 80, 0.2);
        }

        .eco-btn.active {
          background: rgba(50, 150, 50, 0.3);
          border-color: rgba(100, 220, 100, 0.7);
          color: #7dff7d;
          box-shadow: 0 0 15px rgba(80, 200, 80, 0.3);
        }

        .explore-btn.active {
          background: #d4a017;
          color: #000;
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
          .hall-header { top: 12vh; }
          .hall-title { font-size: 2.2rem; }
          
          .hall-footer {
            right: 0;
            top: auto;
            bottom: 40px;
            transform: none;
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 0 24px;
          }
          
          .hall-controls {
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
        }
      `}</style>
    </main>
  );
}
