'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function ResonancePage() {
  const t = useTranslations('Resonance');
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycby0kLrjrJjKnjMyJvyjzecSgocdN6_PXNp-LjgfGSnrE0xNSvYF_kA-bGsp4d0Ec5vH/exec?t=' + Date.now())
      .then(res => res.json())
      .then(data => { if (data.followerCount) setFollowerCount(data.followerCount); })
      .catch(() => {});
  }, []);

  const formatFollowers = (count: number | null) => {
    if (!count) return '366,000+';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+`;
    if (count >= 1000) return `${Math.floor(count / 1000).toLocaleString()}K+`;
    return `${count.toLocaleString()}+`;
  };

  const handleTikTokRedirect = () => {
    setIsRedirecting(true);
    // Navigate in SAME tab after brief delay so overlay is visible
    setTimeout(() => {
      window.location.href = 'https://www.tiktok.com/@buddha_miracle';
    }, 350);
  };

  const HIGHLIGHTS = [
    {
      titleKey: 'highlight1Title',
      subKey: 'highlight1Sub',
      tagKey: 'highlight1Tag',
      titleFallback: 'Om Mani Padme Hum 5Hz',
      subFallback: '5Hz Theta Waves • Cosmic Healing',
      tagFallback: 'Viral 1.2M+'
    },
    {
      titleKey: 'highlight2Title',
      subKey: 'highlight2Sub',
      tagKey: 'highlight2Tag',
      titleFallback: 'Miracle of Inner Peace',
      subFallback: 'Daily Evening Tranquility Ritual',
      tagFallback: 'Daily Meditation'
    },
    {
      titleKey: 'highlight3Title',
      subKey: 'highlight3Sub',
      tagKey: 'highlight3Tag',
      titleFallback: 'Golden Light Mandala',
      subFallback: 'Sacred Geometry & Frequency Resonance',
      tagFallback: 'Sacred Sound'
    }
  ];

  const safeT = (key: string, fallback: string): string => {
    try {
      const result = t(key as any);
      // next-intl returns 'Namespace.key' for missing keys — detect and use fallback
      if (!result || result === key || result === `Resonance.${key}`) return fallback;
      return result;
    } catch {
      return fallback;
    }
  };

  return (
    <main className="resonance-page">
      <div className="store-bg-glow" />
      <section className="store-section store-tiktok-section" style={{ paddingTop: 'calc(var(--nav-height, 80px) + 50px)', maxWidth: '960px', margin: '0 auto' }}>
        <p className="store-tiktok-eyebrow animate-fade-up">{t('eyebrow')}</p>
        <h1 className="store-section-title animate-fade-up animate-delay-100">{t('title')}</h1>
        <p className="resonance-lead animate-fade-up animate-delay-150">
          {t('desc')}
        </p>

        {/* Sacred Official Channel Card */}
        <div className="resonance-portal-card glass-card animate-fade-up animate-delay-200">
          <div className="channel-header">
            <div className="channel-avatar-wrapper">
              <div className="avatar-glow-ring" />
              <div className="channel-avatar">☸</div>
            </div>
            <div className="channel-meta">
              <div className="channel-badge">{safeT('officialChannel', 'Official TikTok Channel')}</div>
              <h2 className="channel-handle">@buddha_miracle</h2>
              {/* Stats as plain text info — NOT button-like */}
              <div className="channel-stats-info">
                <span className="stat-info-item">
                  <span className="stat-info-icon">✨</span>
                  <span className="stat-info-count">{formatFollowers(followerCount)}</span>
                  <span className="stat-info-label">{safeT('followers', 'Followers')}</span>
                </span>
                <span className="stat-info-sep">•</span>
                <span className="stat-info-item">
                  <span className="stat-info-icon">🌏</span>
                  <span className="stat-info-label">{t('globalCommunity')}</span>
                </span>
              </div>
            </div>
          </div>

          <p className="channel-intro">
            {safeT('channelIntro', '매일 수만 명의 순례자들이 틱톡에서 신성한 주파수와 지혜의 울림을 함께 나누고 있습니다. 지금 공식 채널을 팔로우하고 일상 속 평온의 기적을 경험해 보세요.')}
          </p>

          {/* Quick Highlight Cards */}
          <div className="highlights-grid">
            {HIGHLIGHTS.map((h, i) => (
              <button
                key={i}
                className="highlight-card"
                onClick={handleTikTokRedirect}
                type="button"
              >
                <div className="highlight-tag">{safeT(h.tagKey, h.tagFallback)}</div>
                <div className="highlight-title">{safeT(h.titleKey, h.titleFallback)}</div>
                <div className="highlight-sub">{safeT(h.subKey, h.subFallback)}</div>
                <div className="highlight-link">{safeT('viewOnTikTok', 'TikTok에서 보기 ↗')}</div>
              </button>
            ))}
          </div>

          {/* High-Performance Direct Follow CTA */}
          <div className="portal-cta-wrap">
            <button
              type="button"
              className={`btn-tiktok-gold ${isRedirecting ? 'redirecting' : ''}`}
              onClick={handleTikTokRedirect}
            >
              {isRedirecting ? (
                <>
                  <span className="tiktok-icon redirect-spin">🌀</span>
                  <span className="tiktok-cta-text">{safeT('redirecting', '틱톡 채널로 이동 중... ✨')}</span>
                </>
              ) : (
                <>
                  <span className="tiktok-icon">🎵</span>
                  <span className="tiktok-cta-text">{t('followBtn')}</span>
                  <span className="tiktok-arrow">↗</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Full-screen redirect overlay */}
      {isRedirecting && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5,5,4,0.96)',
          backdropFilter: 'blur(12px)',
          zIndex: 999999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '20px'
        }}>
          <span style={{ fontSize: '4rem', display: 'block', animation: 'spin 1.2s linear infinite' }}>🌀</span>
          <p style={{ color: '#FFD700', fontSize: '1.3rem', fontWeight: 700, textAlign: 'center', padding: '0 24px' }}>
            {safeT('redirecting', '틱톡 채널로 이동 중... ✨')}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>@buddha_miracle</p>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .resonance-page { 
          min-height: 100vh; 
          background: #080807; 
          position: relative; 
          overflow-x: hidden; 
          padding-bottom: 100px; 
        }
        .store-bg-glow { 
          position: absolute; 
          top: 0; left: 0; right: 0; 
          height: 800px; 
          background: radial-gradient(circle at 50% 0%, rgba(212,160,23,0.14) 0%, transparent 70%); 
          pointer-events: none; 
          z-index: 0; 
        }
        .store-tiktok-section { 
          position: relative; 
          z-index: 1; 
          padding: 60px 24px; 
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
          font-size: clamp(2rem, 5vw, 3rem); 
          color: #fff; 
          margin-bottom: 16px; 
          text-shadow: 0 0 40px rgba(212,160,23,0.25);
        }
        .resonance-lead {
          text-align: center; 
          color: rgba(255,255,255,0.65); 
          max-width: 620px; 
          margin: 0 auto 48px;
          font-size: 1.05rem;
          line-height: 1.6;
        }

        .resonance-portal-card {
          position: relative;
          background: rgba(18, 16, 12, 0.75);
          border: 1px solid rgba(212, 160, 23, 0.28);
          border-radius: 24px;
          padding: 48px 36px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .channel-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
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
          opacity: 0.8;
          filter: blur(4px);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .channel-avatar {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #14120f;
          border: 2px solid #d4a017;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          color: #d4a017;
          box-shadow: 0 8px 24px rgba(0,0,0,0.8);
        }

        .channel-meta {
          flex: 1;
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
          font-size: clamp(1.4rem, 3.5vw, 1.9rem);
          font-weight: 800;
          color: #fff;
          margin: 0 0 10px 0;
          letter-spacing: -0.01em;
        }

        /* Stats as plain informational text — NOT buttons */
        .channel-stats-info {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
        }
        .stat-info-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .stat-info-icon { font-size: 0.95rem; }
        .stat-info-count {
          font-weight: 700;
          color: var(--primary-gold, #d4a017);
          font-size: 1.05rem;
        }
        .stat-info-label { font-size: 0.85rem; color: rgba(255,255,255,0.65); }
        .stat-info-sep { color: rgba(255,255,255,0.2); }

        .channel-intro {
          font-size: 0.98rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(212,160,23,0.15);
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 40px;
        }
        .highlight-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          text-decoration: none;
          transition: transform 0.25s, border-color 0.25s, background 0.25s;
          display: flex;
          flex-direction: column;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .highlight-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212,160,23,0.5);
          background: rgba(212,160,23,0.04);
        }
        .highlight-card:active { transform: scale(0.98); }
        .highlight-tag {
          font-size: 0.72rem;
          color: #d4a017;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .highlight-title {
          color: #fff;
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 6px;
        }
        .highlight-sub {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          line-height: 1.4;
          margin-bottom: 14px;
          flex: 1;
        }
        .highlight-link {
          font-size: 0.82rem;
          font-weight: 600;
          color: #d4a017;
        }

        .portal-cta-wrap {
          text-align: center;
        }
        .btn-tiktok-gold {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: linear-gradient(135deg, #f6e27a 0%, #d4a017 50%, #aa7c11 100%);
          color: #080807;
          font-weight: 900;
          font-size: 1.1rem;
          padding: 18px 36px;
          border-radius: 100px;
          text-decoration: none;
          letter-spacing: 0.02em;
          box-shadow: 0 12px 35px rgba(212,160,23,0.4);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, opacity 0.2s;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          min-height: 56px;
        }
        .btn-tiktok-gold:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 18px 45px rgba(212,160,23,0.6);
        }
        .btn-tiktok-gold:active { transform: scale(0.97); }
        .btn-tiktok-gold.redirecting {
          background: linear-gradient(135deg, rgba(212,160,23,0.7), rgba(212,160,23,0.9));
          cursor: default;
          pointer-events: none;
          opacity: 0.9;
        }

        .tiktok-icon { font-size: 1.3rem; }
        .tiktok-arrow {
          font-size: 1.2rem;
          transition: transform 0.2s;
        }
        .btn-tiktok-gold:hover .tiktok-arrow {
          transform: translate(2px, -2px);
        }
        @keyframes redirect-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .redirect-spin {
          animation: redirect-pulse 1s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .resonance-portal-card { padding: 28px 18px; }
          .channel-header { flex-direction: column; text-align: center; }
          .channel-stats-info { justify-content: center; }
          .highlights-grid { grid-template-columns: 1fr; gap: 12px; }
          .btn-tiktok-gold {
            width: 100%;
            padding: 16px 20px;
            font-size: 1rem;
          }
        }
      `}</style>
    </main>
  );
}
