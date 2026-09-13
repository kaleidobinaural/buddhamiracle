'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function ResonancePage() {
  const t = useTranslations('Resonance');
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileRedirect, setShowMobileRedirect] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycby0kLrjrJjKnjMyJvyjzecSgocdN6_PXNp-LjgfGSnrE0xNSvYF_kA-bGsp4d0Ec5vH/exec?t=' + Date.now())
      .then(res => res.json())
      .then(data => { if (data.followerCount) setFollowerCount(data.followerCount); })
      .catch(() => {});
  }, []);

  const formatFollowers = (count: number | null) => {
    if (!count) return '1.2M+';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+`;
    if (count >= 1000) return `${Math.floor(count / 1000).toLocaleString()}K+`;
    return `${count.toLocaleString()}+`;
  };

  const handleOpenTikTok = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isMobile) {
      // Mobile: show redirect notice for 3.2s so user can comfortably read it, then navigate
      setShowMobileRedirect(true);
      setTimeout(() => {
        window.location.href = 'https://www.tiktok.com/@buddha_miracle';
        setTimeout(() => setShowMobileRedirect(false), 3000);
      }, 3200);
    } else {
      window.open('https://www.tiktok.com/@buddha_miracle', '_blank', 'noopener,noreferrer');
    }
  };

  const safeT = (key: string, fallback: string): string => {
    try {
      const result = t(key as any);
      if (!result || result === key || result === `Resonance.${key}`) return fallback;
      return result;
    } catch {
      return fallback;
    }
  };

  return (
    <main className="resonance-page">
      <div className="store-bg-glow" />

      <section className="store-section store-tiktok-section">
        {/* Header Eyebrow & Titles */}
        <p className="store-tiktok-eyebrow animate-fade-up">
          {safeT('eyebrow', 'Official TikTok Sanctuary')}
        </p>
        <h1 className="store-section-title animate-fade-up animate-delay-100">
          {t('title')}
        </h1>
        <p className="resonance-lead animate-fade-up animate-delay-150">
          {t('desc')}
        </p>

        {/* ═════════════════════════════════════════════════════ */}
        {/* 🌟 SACRED CINEMATIC VIDEO SANCTUARY STAGE            */}
        {/* ═════════════════════════════════════════════════════ */}
        <div className="sacred-video-stage-container animate-fade-up animate-delay-200">
          <div className="video-glow-underlay" aria-hidden="true" />
          
          <div className={`sacred-video-frame ${isMobile ? 'is-mobile' : 'is-desktop'}`}>
            <video
              key={isMobile ? 'mobile-stream' : 'desktop-stream'}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="sacred-video-player"
              src={isMobile ? '/videos/temple_mobile.mp4' : '/videos/Temple_Desktop.mp4'}
            />
            
            {/* Subtle Divine Watermark Badge - centered */}
            <div className="video-badge-overlay">
              <span className="badge-sparkle">✦</span>
              <span>{safeT('livingMiracle', 'Living Miracle · Digital Sanctuary')}</span>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════ */}
        {/* 📿 STREAMLINED OFFICIAL TIKTOK CHANNEL PORTAL CARD   */}
        {/* ═════════════════════════════════════════════════════ */}
        <div className="resonance-portal-card glass-card animate-fade-up animate-delay-300">
          <div className="channel-header">
            <div className="channel-avatar-wrapper">
              <div className="avatar-glow-ring" />
              <div className="channel-avatar">
                <img 
                  src="/images/tiktok/profile.jpg" 
                  alt="Buddha Miracle Official Profile" 
                  className="channel-avatar-img" 
                />
              </div>
            </div>
            
            <div className="channel-meta">
              <div className="channel-badge">{safeT('officialChannel', 'Official TikTok Sanctuary')}</div>
              <h2 className="channel-handle">@buddha_miracle</h2>
              <div className="channel-stats-info">
                <span className="stat-info-item">
                  <span className="stat-info-icon">✨</span>
                  <span className="stat-info-count">{formatFollowers(followerCount)}</span>
                  <span className="stat-info-label">{safeT('followers', 'Followers (도반)')}</span>
                </span>
                <span className="stat-info-sep">•</span>
                <span className="stat-info-item">
                  <span className="stat-info-icon">🌏</span>
                  <span className="stat-info-label">{safeT('globalCommunity', 'Global Sacred Community')}</span>
                </span>
              </div>
            </div>
          </div>

          <p className="channel-intro">
            {safeT('channelIntro', 'Every day, millions of seekers share sacred frequency, wisdom, and miraculous moments on TikTok. Follow our official sanctuary to awaken inner peace.')}
          </p>

          {/* High-Impact Direct Action Button */}
          <div className="portal-cta-wrap">
            <button
              type="button"
              onClick={handleOpenTikTok}
              className="btn-tiktok-gold"
            >
              <span className="tiktok-icon">🎵</span>
              <span className="tiktok-cta-text">{safeT('followBtn', 'Open in TikTok [Follow] ↗')}</span>
            </button>
            <p className="tiktok-load-notice">
              <span className="notice-icon">💡</span>
              <span>{safeT('mobileRedirectNote', 'A black screen may appear for a few seconds while TikTok loads.')}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Mobile Fullscreen Redirect Overlay */}
      {showMobileRedirect && (
        <div className="mobile-redirect-overlay" onClick={() => { window.location.href = 'https://www.tiktok.com/@buddha_miracle'; }}>
          <div className="mobile-redirect-content" onClick={e => e.stopPropagation()}>
            <div className="mobile-redirect-icon">🎵</div>
            <h2 className="mobile-redirect-title">{safeT('mobileRedirectTitle', 'Redirecting to TikTok')}</h2>
            <p className="mobile-redirect-desc">{safeT('mobileRedirectDesc', 'You will be connected to @buddha_miracle official channel shortly.')}</p>
            <p className="mobile-redirect-note">{safeT('mobileRedirectNote', 'A black screen may appear for a few seconds while TikTok loads.')}</p>
            <div className="mobile-redirect-loader">
              <span /><span /><span />
            </div>
            <button
              type="button"
              className="btn-redirect-now"
              onClick={() => { window.location.href = 'https://www.tiktok.com/@buddha_miracle'; }}
            >
              {safeT('redirectNow', '지금 바로 이동 ↗')}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .resonance-page { 
          min-height: 100vh; 
          background: #080807; 
          position: relative; 
          overflow-x: hidden; 
          padding-bottom: 90px; 
        }

        .store-bg-glow { 
          position: absolute; 
          top: 0; left: 0; right: 0; 
          height: 900px; 
          background: radial-gradient(circle at 50% 0%, rgba(212,160,23,0.16) 0%, transparent 70%); 
          pointer-events: none; 
          z-index: 0; 
        }

        .store-tiktok-section { 
          position: relative; 
          z-index: 1; 
          padding: 16px 20px 60px; 
          max-width: 960px; 
          margin: 0 auto; 
        }

        .store-tiktok-eyebrow { 
          text-align: center; 
          color: var(--primary-gold, #d4a017); 
          font-size: 0.85rem; 
          font-weight: 700; 
          letter-spacing: 0.25em; 
          text-transform: uppercase;
          margin-bottom: 12px; 
        }

        .store-section-title { 
          text-align: center; 
          font-family: var(--font-serif); 
          font-size: clamp(2rem, 5vw, 3.2rem); 
          color: #fff; 
          margin-bottom: 16px; 
          text-shadow: 0 0 40px rgba(212,160,23,0.25);
        }

        .resonance-lead {
          text-align: center; 
          color: rgba(255,255,255,0.65); 
          max-width: 620px; 
          margin: 0 auto 36px;
          font-size: 1.02rem;
          line-height: 1.6;
        }

        /* ─── Sacred Video Stage ─── */
        .sacred-video-stage-container {
          position: relative;
          width: 100%;
          margin: 0 auto 36px auto;
          display: flex;
          justify-content: center;
        }

        .video-glow-underlay {
          position: absolute;
          inset: -10px;
          background: radial-gradient(circle at 50% 50%, rgba(212, 160, 23, 0.22) 0%, transparent 70%);
          filter: blur(30px);
          pointer-events: none;
          z-index: 0;
        }

        .sacred-video-frame {
          position: relative;
          z-index: 1;
          border-radius: 24px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(212, 160, 23, 0.35);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 160, 23, 0.18);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sacred-video-frame.is-desktop {
          max-width: 900px;
          aspect-ratio: 16 / 9;
        }

        .sacred-video-frame.is-mobile {
          max-width: 360px;
          aspect-ratio: 9 / 16;
          border-radius: 28px;
        }

        .sacred-video-player {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .video-badge-overlay {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(10, 9, 8, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(212, 160, 23, 0.3);
          border-radius: 100px;
          font-size: 0.76rem;
          color: #ffd700;
          letter-spacing: 0.08em;
          pointer-events: none;
          white-space: nowrap;
        }

        .badge-sparkle {
          color: #d4a017;
          font-size: 0.85rem;
        }

        /* ─── Channel Card ─── */
        .resonance-portal-card {
          position: relative;
          background: rgba(18, 16, 12, 0.82);
          border: 1px solid rgba(212, 160, 23, 0.28);
          border-radius: 24px;
          padding: 36px 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .channel-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .channel-avatar-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }

        .avatar-glow-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #d4a017, #f6e27a, #8a6d1a, #d4a017);
          animation: spin-slow 12s linear infinite;
          opacity: 0.85;
          filter: blur(5px);
        }

        .channel-avatar {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #14120f;
          border: 2px solid #d4a017;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.8), 0 0 20px rgba(212,160,23,0.3);
        }

        .channel-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .channel-meta {
          flex: 1;
          text-align: center;
        }

        .channel-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #d4a017;
          background: rgba(212,160,23,0.12);
          border: 1px solid rgba(212,160,23,0.25);
          padding: 4px 10px;
          border-radius: 100px;
          margin-bottom: 6px;
        }

        .channel-handle {
          font-family: var(--font-serif);
          font-size: clamp(1.4rem, 3.5vw, 1.8rem);
          color: #fff;
          margin-bottom: 8px;
          letter-spacing: 0.02em;
        }

        .channel-stats-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.7);
        }

        .stat-info-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .stat-info-count {
          color: #ffd700;
          font-weight: 700;
        }

        .stat-info-sep {
          color: rgba(212,160,23,0.4);
        }

        .channel-intro {
          font-size: 0.95rem;
          line-height: 1.8;
          color: rgba(255,255,255,0.75);
          margin-bottom: 28px;
          padding: 16px 20px;
          background: rgba(255,255,255,0.02);
          border-left: 3px solid rgba(212,160,23,0.6);
          border-radius: 0 12px 12px 0;
        }

        .portal-cta-wrap {
          display: flex;
          justify-content: center;
        }

        .btn-tiktok-gold {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          max-width: 440px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #d4a017 0%, #ffd700 50%, #d4a017 100%);
          background-size: 200% auto;
          color: #120e06;
          font-weight: 800;
          font-size: 1.05rem;
          letter-spacing: 0.05em;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(212,160,23,0.35);
          transition: all 0.3s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .btn-tiktok-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(212,160,23,0.5);
          background-position: right center;
        }

        .btn-tiktok-gold:active {
          transform: scale(0.98);
        }

        /* ─── Mobile Fullscreen Redirect Overlay ─── */
        .mobile-redirect-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: mobile-redirect-fade-in 0.3s ease;
        }
        @keyframes mobile-redirect-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .mobile-redirect-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px 32px;
          max-width: 340px;
        }

        .mobile-redirect-icon {
          font-size: 4rem;
          margin-bottom: 24px;
          animation: mobile-redirect-pulse 1s ease-in-out infinite;
        }
        @keyframes mobile-redirect-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.8; }
        }

        .mobile-redirect-title {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          color: #ffd700;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .mobile-redirect-desc {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.75);
          line-height: 1.7;
          margin-bottom: 12px;
        }

        .mobile-redirect-note {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.4);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .mobile-redirect-loader {
          display: flex;
          gap: 8px;
        }
        .mobile-redirect-loader span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d4a017;
          animation: mobile-redirect-dot 1.2s ease-in-out infinite;
        }
        .mobile-redirect-loader span:nth-child(2) { animation-delay: 0.2s; }
        .mobile-redirect-loader span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes mobile-redirect-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        .tiktok-load-notice {
          margin-top: 14px;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.65);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          line-height: 1.5;
          text-align: center;
          padding: 8px 18px;
          background: rgba(212, 160, 23, 0.08);
          border: 1px solid rgba(212, 160, 23, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(8px);
          max-width: 90%;
        }
        .tiktok-load-notice .notice-icon {
          font-size: 0.95rem;
        }

        .btn-redirect-now {
          margin-top: 24px;
          padding: 10px 24px;
          background: rgba(212, 160, 23, 0.15);
          border: 1px solid rgba(212, 160, 23, 0.4);
          border-radius: 30px;
          color: var(--primary-gold);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-redirect-now:hover {
          background: var(--primary-gold);
          color: #000;
        }

        @media (max-width: 768px) {
          .store-tiktok-section { padding: 12px 16px 60px; }
          .channel-intro { font-size: 0.88rem; text-align: center; border-left: none; border-top: 2px solid rgba(212,160,23,0.5); border-radius: 0 0 12px 12px; }
          .btn-tiktok-gold { font-size: 0.95rem; padding: 14px 24px; }
        }
      `}</style>
    </main>
  );
}
