'use client';

import { useTranslations } from 'next-intl';

const TIKTOK_VIDEOS = [
  "7629655147815259400",
  "7610752603353287954",
  "7634842775787162888"
];

export default function ResonancePage() {
  const t = useTranslations('Resonance');

  return (
    <main className="resonance-page">
      <div className="store-bg-glow" />
      <section className="store-section store-tiktok-section" style={{ paddingTop: '120px' }}>
        <p className="store-tiktok-eyebrow">GLOBAL RESONANCE</p>
        <h2 className="store-section-title">{t('title')}</h2>
        <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '40px' }}>
          {t('desc')}
        </p>
        <div className="tiktok-gallery">
          {TIKTOK_VIDEOS.map((vid, idx) => (
            <div key={idx} className="tiktok-embed-wrapper" style={{ width: '325px', height: '580px' }}>
              <iframe
                src={`https://www.tiktok.com/embed/v2/${vid}?lang=en-US`}
                allow="autoplay; encrypted-media"
                title={`TikTok ${vid}`}
                className="store-tiktok-iframe"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation allow-same-origin"
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
              />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <a href="https://www.tiktok.com/@buddha_miracle" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', backgroundColor: '#d4a017', color: '#000', padding: '18px 40px', borderRadius: '8px', fontSize: '1.2rem', fontWeight: '900', textDecoration: 'none', letterSpacing: '1px', boxShadow: '0 10px 25px rgba(212,160,23,0.4)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
            {t('followBtn')}
          </a>
        </div>
      </section>
      
      <style>{`
        .resonance-page { min-height: 100vh; background: #080807; position: relative; overflow-x: hidden; padding-bottom: 80px; }
        .store-bg-glow { position: absolute; top: 0; left: 0; right: 0; height: 800px; background: radial-gradient(circle at 50% 0%, rgba(212,160,23,0.1) 0%, transparent 70%); pointer-events: none; z-index: 0; }
        .store-section { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 60px 24px; }
        .store-tiktok-eyebrow { text-align: center; color: #4A90E2; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.2em; margin-bottom: 12px; }
        .store-section-title { text-align: center; font-family: var(--font-serif); font-size: 2.5rem; color: #d4a017; margin-bottom: 24px; }
        
        .tiktok-gallery {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 40px;
          padding: 20px 0;
        }

        .tiktok-embed-wrapper {
          flex: 0 0 auto;
          width: 325px;
          scroll-snap-align: center;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
      `}</style>
      <script async src="https://www.tiktok.com/embed.js"></script>
    </main>
  );
}
