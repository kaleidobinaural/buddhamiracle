'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function ResonancePage() {
  const t = useTranslations('Resonance');
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<typeof HIGHLIGHTS[0] | null>(null);
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

  const handleOpenTikTok = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.open('https://www.tiktok.com/@buddha_miracle', '_blank', 'noopener,noreferrer');
    setShowNotice(true);
    setNoticeSeconds(5);
  };

  const HIGHLIGHTS = [
    {
      id: 'om-mani',
      titleKey: 'highlight1Title',
      subKey: 'highlight1Sub',
      tagKey: 'highlight1Tag',
      titleFallback: 'Om Mani Padme Hum 5Hz',
      subFallback: '5Hz Theta Waves • Cosmic Healing',
      tagFallback: 'Viral 1.2M+',
      frequency: '5Hz Theta Waves',
      mantra: '옴 마니 반메 훔 (Om Mani Padme Hum)',
      icon: '🕉️'
    },
    {
      id: 'peace',
      titleKey: 'highlight2Title',
      subKey: 'highlight2Sub',
      tagKey: 'highlight2Tag',
      titleFallback: 'Miracle of Inner Peace',
      subFallback: 'Daily Evening Tranquility Ritual',
      tagFallback: 'Daily Meditation',
      frequency: '432Hz Miracle Frequency',
      mantra: '마음의 평화와 치유의 저녁 명상',
      icon: '🪷'
    },
    {
      id: 'mandala',
      titleKey: 'highlight3Title',
      subKey: 'highlight3Sub',
      tagKey: 'highlight3Tag',
      titleFallback: 'Golden Light Mandala',
      subFallback: 'Sacred Geometry & Frequency Resonance',
      tagFallback: 'Sacred Sound',
      frequency: '528Hz Solfeggio Tone',
      mantra: '황금빛 만다라 주파수 명상',
      icon: '✨'
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

          {/* Quick Highlight Cards (Lightbox Popups) */}
          <div className="highlights-grid">
            {HIGHLIGHTS.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedVideo(h)}
                className="highlight-card"
                aria-label={`Open ${safeT(h.titleKey, h.titleFallback)}`}
              >
                <div className="highlight-tag">{safeT(h.tagKey, h.tagFallback)}</div>
                <div className="highlight-title">{safeT(h.titleKey, h.titleFallback)}</div>
                <div className="highlight-sub">{safeT(h.subKey, h.subFallback)}</div>
                <div className="highlight-link">▶ {safeT('watchInSanctuary', '사원에서 바로 감상하기')}</div>
              </button>
            ))}
          </div>

          {/* High-Performance Direct Follow CTA */}
          <div className="portal-cta-wrap">
            <button
              type="button"
              onClick={handleOpenTikTok}
              className="btn-tiktok-gold"
            >
              <span className="tiktok-icon">🎵</span>
              <span className="tiktok-cta-text">{t('followBtn')}</span>
              <span className="tiktok-arrow">↗</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sacred Video Lightbox Modal */}
      {selectedVideo && (
        <div className="video-lightbox-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="video-lightbox-card glass-card animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close-btn" 
              onClick={() => setSelectedVideo(null)} 
              aria-label="Close"
            >
              ✕
            </button>
            
            {/* Visualizer Frame */}
            <div className="lightbox-player-wrap">
              <div className="player-halo-pulse" />
              <div className="player-icon-center">{selectedVideo.icon}</div>
              <div className="player-frequency-badge">{selectedVideo.frequency}</div>
              <div className="player-soundwave">
                <span className="bar b1" />
                <span className="bar b2" />
                <span className="bar b3" />
                <span className="bar b4" />
                <span className="bar b5" />
              </div>
            </div>

            <div className="lightbox-info">
              <span className="lightbox-tag">{safeT(selectedVideo.tagKey, selectedVideo.tagFallback)}</span>
              <h3 className="lightbox-title">{safeT(selectedVideo.titleKey, selectedVideo.titleFallback)}</h3>
              <p className="lightbox-desc">{safeT(selectedVideo.subKey, selectedVideo.subFallback)}</p>
              <p className="lightbox-mantra">{selectedVideo.mantra}</p>
            </div>

            <button
              type="button"
              className="btn-lightbox-tiktok"
              onClick={(e) => {
                setSelectedVideo(null);
                handleOpenTikTok(e);
              }}
            >
              <span className="tiktok-icon">🎵</span>
              <span>TikTok에서 전체 영상 및 댓글 감상 ↗</span>
            </button>
          </div>
        </div>
      )}

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
            <h3 className="notice-title">공식 틱톡(@buddha_miracle)으로 연결되었습니다</h3>
            <p className="notice-desc">새 창(또는 틱톡 앱)에서 신성한 울림을 만나보세요.</p>
            <div className="notice-progress-track">
              <div className="notice-progress-bar" />
            </div>
            <p className="notice-timer-text">
              화면을 터치하거나 <strong>{noticeSeconds}초</strong> 후 사원으로 자동 복귀합니다.
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
          text-align: left;
          cursor: pointer;
          transition: transform 0.25s, border-color 0.25s, background 0.25s;
          display: flex;
          flex-direction: column;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          font-family: inherit;
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
        .tiktok-arrow {
          font-size: 1.2rem;
          transition: transform 0.2s;
        }
        .btn-tiktok-gold:hover .tiktok-arrow {
          transform: translate(2px, -2px);
        }

        /* Lightbox Modal */
        .video-lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .video-lightbox-card {
          position: relative;
          background: rgba(20, 18, 14, 0.95);
          border: 1px solid rgba(212, 160, 23, 0.4);
          border-radius: 28px;
          padding: 36px 28px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 160, 23, 0.15);
        }
        .lightbox-close-btn, .notice-close-btn {
          position: absolute;
          top: 16px;
          right: 18px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.8);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lightbox-close-btn:hover, .notice-close-btn:hover {
          background: rgba(212, 160, 23, 0.25);
          border-color: var(--primary-gold);
          color: #fff;
          transform: scale(1.08);
        }
        .lightbox-player-wrap {
          position: relative;
          width: 160px;
          height: 160px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 160, 23, 0.2) 0%, rgba(10, 10, 8, 0.8) 70%);
          border: 1px solid rgba(212, 160, 23, 0.35);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 35px rgba(212, 160, 23, 0.25);
        }
        .player-halo-pulse {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 1px dashed rgba(212, 160, 23, 0.3);
          animation: spin 20s linear infinite;
        }
        .player-icon-center {
          font-size: 3.5rem;
          filter: drop-shadow(0 0 15px var(--primary-gold));
        }
        .player-frequency-badge {
          position: absolute;
          bottom: 12px;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(212, 160, 23, 0.4);
          color: var(--primary-gold);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 3px 10px;
          border-radius: 50px;
        }
        .player-soundwave {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 18px;
          margin-top: 8px;
        }
        .player-soundwave .bar {
          width: 3px;
          background: var(--primary-gold);
          border-radius: 3px;
          animation: soundwave 1.2s ease-in-out infinite;
        }
        .b1 { height: 8px; animation-delay: 0.1s; }
        .b2 { height: 16px; animation-delay: 0.3s; }
        .b3 { height: 12px; animation-delay: 0.2s; }
        .b4 { height: 18px; animation-delay: 0.4s; }
        .b5 { height: 10px; animation-delay: 0.15s; }
        @keyframes soundwave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }
        .lightbox-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--primary-gold);
          background: rgba(212, 160, 23, 0.12);
          padding: 4px 14px;
          border-radius: 50px;
          border: 1px solid rgba(212, 160, 23, 0.25);
          margin-bottom: 12px;
        }
        .lightbox-title {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          color: #fff;
          margin-bottom: 8px;
          text-shadow: 0 0 20px rgba(212, 160, 23, 0.3);
        }
        .lightbox-desc {
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
          margin-bottom: 6px;
        }
        .lightbox-mantra {
          font-size: 0.85rem;
          color: var(--primary-gold);
          font-style: italic;
          margin-bottom: 24px;
        }
        .btn-lightbox-tiktok {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          background: linear-gradient(135deg, #f6e27a, #d4a017);
          color: #000;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(212, 160, 23, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-lightbox-tiktok:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(212, 160, 23, 0.5);
        }

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
