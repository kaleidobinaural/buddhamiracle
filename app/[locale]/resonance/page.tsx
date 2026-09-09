'use client';

import { useTranslations } from 'next-intl';

export default function ResonancePage() {
  const t = useTranslations('Resonance');

  const HIGHLIGHTS = [
    {
      title: 'Om Mani Padme Hum 5Hz',
      sub: '5Hz Theta Waves • Cosmic Healing',
      tag: 'Viral 1.2M+'
    },
    {
      title: 'Miracle of Inner Peace',
      sub: 'Daily Evening Tranquility Ritual',
      tag: 'Daily Meditation'
    },
    {
      title: 'Golden Light Mandala',
      sub: 'Sacred Geometry & Frequency Resonance',
      tag: 'Sacred Sound'
    }
  ];

  return (
    <main className="resonance-page">
      <div className="store-bg-glow" />
      <section className="store-section store-tiktok-section" style={{ paddingTop: '130px', maxWidth: '960px', margin: '0 auto' }}>
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
              <div className="channel-badge">Official TikTok Channel</div>
              <h2 className="channel-handle">@buddha_miracle</h2>
              <div className="channel-stats">
                <span className="stat-pill">✨ 366,000+ Followers</span>
                <span className="stat-pill">🌏 Global Community</span>
              </div>
            </div>
          </div>

          <p className="channel-intro">
            매일 수만 명의 순례자들이 틱톡에서 신성한 주파수와 지혜의 울림을 함께 나누고 있습니다.
            지금 공식 채널을 팔로우하고 일상 속 평온의 기적을 경험해 보세요.
          </p>

          {/* Quick Highlight Cards */}
          <div className="highlights-grid">
            {HIGHLIGHTS.map((h, i) => (
              <a 
                key={i} 
                href="https://www.tiktok.com/@buddha_miracle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="highlight-card"
              >
                <div className="highlight-tag">{h.tag}</div>
                <div className="highlight-title">{h.title}</div>
                <div className="highlight-sub">{h.sub}</div>
                <div className="highlight-link">TikTok에서 보기 ↗</div>
              </a>
            ))}
          </div>

          {/* High-Performance Direct Follow CTA */}
          <div className="portal-cta-wrap">
            <a 
              href="https://www.tiktok.com/@buddha_miracle" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-tiktok-gold"
            >
              <span className="tiktok-icon">🎵</span>
              <span className="tiktok-cta-text">{t('followBtn')}</span>
              <span className="tiktok-arrow">↗</span>
            </a>
          </div>
        </div>
      </section>

      <style>{`
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
          margin: 0 0 8px 0;
          letter-spacing: -0.01em;
        }
        .channel-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .stat-pill {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.75);
          background: rgba(255,255,255,0.05);
          padding: 4px 12px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.08);
        }

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
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
        }
        .highlight-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212,160,23,0.5);
          background: rgba(212,160,23,0.04);
        }
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
          font-size: 1.15rem;
          padding: 18px 36px;
          border-radius: 100px;
          text-decoration: none;
          letter-spacing: 0.02em;
          box-shadow: 0 12px 35px rgba(212,160,23,0.4);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
          cursor: pointer;
        }
        .btn-tiktok-gold:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 18px 45px rgba(212,160,23,0.6);
        }
        .btn-tiktok-gold:active {
          transform: translateY(0) scale(0.98);
        }
        .tiktok-icon {
          font-size: 1.3rem;
        }
        .tiktok-arrow {
          font-size: 1.2rem;
          transition: transform 0.2s;
        }
        .btn-tiktok-gold:hover .tiktok-arrow {
          transform: translate(2px, -2px);
        }

        @media (max-width: 640px) {
          .resonance-portal-card {
            padding: 32px 20px;
          }
          .channel-header {
            flex-direction: column;
            text-align: center;
          }
          .channel-stats {
            justify-content: center;
          }
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
