'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function ResonancePage() {
  const t = useTranslations('Resonance');
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [showNotice, setShowNotice] = useState(false);
  const [noticeSeconds, setNoticeSeconds] = useState(5);

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycby0kLrjrJjKnjMyJvyjzecSgocdN6_PXNp-LjgfGSnrE0xNSvYF_kA-bGsp4d0Ec5vH/exec?t=' + Date.now())
      .then(res => res.json())
      .then(data => { if (data.followerCount) setFollowerCount(data.followerCount); })
      .catch(() => {});
  }, []);

  // 5-second transition countdown
  useEffect(() => {
    if (!showNotice) return;
    const interval = setInterval(() => {
      setNoticeSeconds((prev) => {
        if (prev <= 1) {
          setShowNotice(false);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showNotice]);

  const formatFollowers = (count: number | null) => {
    if (!count) return '636K+';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+`;
    if (count >= 1000) return `${Math.floor(count / 1000).toLocaleString()}K+`;
    return `${count.toLocaleString()}+`;
  };

  const handleOpenTikTok = (e?: React.MouseEvent, targetUrl = 'https://www.tiktok.com/@buddha_miracle') => {
    if (e) e.preventDefault();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setShowNotice(true);
    setNoticeSeconds(5);
  };

  const HIGHLIGHTS = [
    {
      id: '7629655147815259400',
      url: 'https://www.tiktok.com/@buddha_miracle/video/7629655147815259400',
      thumb: '/images/tiktok/thumb1.jpg',
      tag: 'Living Buddha',
      title: 'One lifetime of devotion, one second of miracle. ✨🙏',
      sub: 'Một đời tận tụy, một giây phép màu. 🌸 Một đời đức tin',
      frequency: 'Miracle of Devotion'
    },
    {
      id: '7610752603353287954',
      url: 'https://www.tiktok.com/@buddha_miracle/video/7610752603353287954',
      thumb: '/images/tiktok/thumb2.jpg',
      tag: 'Pure Heart',
      title: 'A pure heart always receives the greatest miracle 😭✨',
      sub: 'Một trái tim thuần khiết luôn nhận được phép màu vĩ đại nhất 🌸',
      frequency: 'Instant Karma & Grace'
    },
    {
      id: '7629342532014542098',
      url: 'https://www.tiktok.com/@buddha_miracle/video/7629342532014542098',
      thumb: '/images/tiktok/thumb3.jpg',
      tag: 'Divine Nature',
      title: 'Greed takes, but nature gives back to the Divine. ✨🙏',
      sub: 'Lòng tham cướp mất, nhưng thiên nhiên sẽ trả lại cho Đấng Thiêng Liêng 🌸',
      frequency: 'Cosmic Justice'
    }
  ];

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
        <p className="store-tiktok-eyebrow animate-fade-up">{safeT('eyebrow', 'Official TikTok Channel')}</p>
        <h1 className="store-section-title animate-fade-up animate-delay-100">{t('title')}</h1>
        <p className="resonance-lead animate-fade-up animate-delay-150">
          {t('desc')}
        </p>

        {/* Sacred Official Channel Card */}
        <div className="resonance-portal-card glass-card animate-fade-up animate-delay-200">
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
              <div className="channel-badge">{safeT('officialChannel', 'Official TikTok Channel')}</div>
              <h2 className="channel-handle">@buddha_miracle</h2>
              <div className="channel-stats-info">
                <span className="stat-info-item">
                  <span className="stat-info-icon">✨</span>
                  <span className="stat-info-count">{formatFollowers(followerCount)}</span>
                  <span className="stat-info-label">{safeT('followers', 'Followers')}</span>
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

          {/* Quick Highlight Cards (Direct Link to TikTok Video) */}
          <div className="highlights-grid">
            {HIGHLIGHTS.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={(e) => handleOpenTikTok(e, h.url)}
                className="highlight-card"
                aria-label={`Open ${h.title} on TikTok`}
              >
                <div className="highlight-thumb-wrap">
                  <img src={h.thumb} alt={h.title} className="highlight-thumb-img" />
                  <div className="highlight-play-overlay">
                    <span className="play-triangle">▶</span>
                  </div>
                  <span className="highlight-tag-badge">{h.tag}</span>
                </div>
                <div className="highlight-card-body">
                  <div className="highlight-title">{h.title}</div>
                  <div className="highlight-sub">{h.sub}</div>
                  <div className="highlight-link">
                    <span>{safeT('goToTikTok', 'Open in TikTok ↗')}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* High-Performance Direct Follow CTA */}
          <div className="portal-cta-wrap">
            <button
              type="button"
              onClick={(e) => handleOpenTikTok(e)}
              className="btn-tiktok-gold"
            >
              <span className="tiktok-icon">🎵</span>
              <span className="tiktok-cta-text">{safeT('followBtn', 'Open in TikTok ↗')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5-Second Serene Transition Notice (with backdrop & ✕ close) */}
      {showNotice && (
        <div className="tiktok-notice-overlay" onClick={() => setShowNotice(false)}>
          <div className="tiktok-notice-card glass-card animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <button 
              className="notice-close-btn" 
              onClick={() => setShowNotice(false)} 
              aria-label="Close"
            >
              ✕
            </button>
            <div className="notice-icon-wrap">
              <span className="notice-icon-spin">☸</span>
            </div>
            <h3 className="notice-title">{safeT('noticeTitle', 'Guiding to Official TikTok')}</h3>
            <p className="notice-desc">{safeT('noticeDesc', 'Opening @buddha_miracle sanctuary in a new window. You can return to the Temple anytime.')}</p>
            <div className="notice-progress-track">
              <div className="notice-progress-bar" />
            </div>
            <p className="notice-timer-text">
              {safeT('noticeTimer', '{sec}s').replace('{sec}', String(noticeSeconds))}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .resonance-page { 
          min-height: 100vh; 
          background: #080807; 
          position: relative; 
          overflow-x: hidden; 
          padding-bottom: 80px; 
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
          padding: 16px 24px 60px; 
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
          font-size: clamp(2rem, 5vw, 3rem); 
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

        .resonance-portal-card {
          position: relative;
          background: rgba(18, 16, 12, 0.75);
          border: 1px solid rgba(212, 160, 23, 0.28);
          border-radius: 24px;
          padding: 36px 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .channel-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        .channel-avatar-wrapper {
          position: relative;
          width: 84px;
          height: 84px;
          flex-shrink: 0;
          margin: 0 auto;
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
          font-size: clamp(1.3rem, 3.5vw, 1.8rem);
          font-weight: 800;
          color: #fff;
          margin: 0 0 8px 0;
          letter-spacing: -0.01em;
        }

        .channel-stats-info {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.88rem;
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
          font-size: 0.95rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(212,160,23,0.15);
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-bottom: 36px;
        }
        .highlight-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          text-align: left;
          cursor: pointer;
          transition: transform 0.25s, border-color 0.25s, background 0.25s;
          display: flex;
          flex-direction: column;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          font-family: inherit;
          padding: 0;
        }
        .highlight-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212,160,23,0.5);
          background: rgba(212,160,23,0.05);
        }
        .highlight-card:active { transform: scale(0.98); }

        .highlight-thumb-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #000;
        }
        .highlight-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.4s ease;
        }
        .highlight-card:hover .highlight-thumb-img {
          transform: scale(1.05);
        }

        .highlight-play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }
        .highlight-card:hover .highlight-play-overlay {
          background: rgba(0,0,0,0.15);
        }
        .play-triangle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(0,0,0,0.7);
          border: 1.5px solid var(--primary-gold);
          color: var(--primary-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          padding-left: 3px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          transition: transform 0.3s;
        }
        .highlight-card:hover .play-triangle {
          transform: scale(1.1);
          background: var(--primary-gold);
          color: #000;
        }

        .highlight-tag-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.75);
          border: 1px solid rgba(212, 160, 23, 0.4);
          color: var(--primary-gold);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 6px;
          backdrop-filter: blur(8px);
        }

        .highlight-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .highlight-title {
          color: #fff;
          font-weight: 700;
          font-size: 0.98rem;
          line-height: 1.4;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .highlight-sub {
          color: rgba(255,255,255,0.5);
          font-size: 0.82rem;
          line-height: 1.4;
          margin-bottom: 12px;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .highlight-link {
          font-size: 0.85rem;
          font-weight: 700;
          color: #d4a017;
          display: inline-flex;
          align-items: center;
          gap: 4px;
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
          border: none;
          letter-spacing: 0.02em;
          box-shadow: 0 12px 35px rgba(212,160,23,0.4);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
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

        .tiktok-icon { font-size: 1.3rem; }

        /* 5-Second Transition Notice */
        .tiktok-notice-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 100001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .tiktok-notice-card {
          position: relative;
          background: rgba(22, 19, 14, 0.96);
          border: 1px solid rgba(212, 160, 23, 0.45);
          border-radius: 24px;
          padding: 38px 28px 28px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 160, 23, 0.2);
        }
        .notice-icon-wrap {
          width: 68px;
          height: 68px;
          margin: 0 auto 18px;
          border-radius: 50%;
          background: rgba(212, 160, 23, 0.12);
          border: 1px solid rgba(212, 160, 23, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notice-icon-spin {
          font-size: 2.2rem;
          color: var(--primary-gold);
          display: inline-block;
          animation: spin 16s linear infinite;
        }
        .notice-title {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: #fff;
          margin-bottom: 10px;
          line-height: 1.35;
        }
        .notice-desc {
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.6;
          margin-bottom: 22px;
        }
        .notice-progress-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 14px;
        }
        .notice-progress-bar {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #d4a017, #f6e27a);
          border-radius: 10px;
          animation: progress-shrink 5s linear forwards;
          transform-origin: left;
        }
        @keyframes progress-shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .notice-timer-text {
          font-size: 0.8rem;
          color: var(--primary-gold);
          margin: 0;
          opacity: 0.9;
        }
        .notice-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .notice-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 640px) {
          .store-tiktok-section { padding: 12px 16px 60px; }
          .resonance-portal-card { padding: 24px 16px; }
          .channel-header { flex-direction: column; text-align: center; }
          .channel-stats-info { justify-content: center; }
          .highlights-grid { grid-template-columns: 1fr; gap: 14px; }
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
