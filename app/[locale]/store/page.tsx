'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';

const PRODUCTS = {
  omMani: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_OMMANI || "#",
  amulet: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_AMULET || "#",
  bundle: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_BUNDLE || "#",
  candle: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_CANDLE || "#",
  lotus: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_LOTUS || "#",
  mala: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_MALA || "#",
};

export default function StorePage() {
  const t = useTranslations('Store');
  const locale = useLocale();
  const { data: session } = useSession();
  const [followerCount, setFollowerCount] = useState<number>(366800);
  const [isVvipModalOpen, setIsVvipModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [vvipSpots, setVvipSpots] = useState(3);

  useEffect(() => {
    // Follower Count Logic
    fetch('https://script.google.com/macros/s/AKfycby0kLrjrJjKnjMyJvyjzecSgocdN6_PXNp-LjgfGSnrE0xNSvYF_kA-bGsp4d0Ec5vH/exec?t=' + Date.now())
      .then(res => res.json())
      .then(data => { if (data.followerCount) setFollowerCount(data.followerCount); })
      .catch(() => {});

    // VVIP 10-day cycle countdown logic
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1; 
    const today = now.getUTCDate(); 
    const seed = year * 100 + month;
    
    function getSeededRandom(s: number) {
      let x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    }

    const drop1 = Math.floor(getSeededRandom(seed) * 10) + 3;
    const drop2 = Math.floor(getSeededRandom(seed + 1) * 11) + 15;

    let spotsLeft = 3;
    if (today >= drop2) {
      spotsLeft = 1;
    } else if (today >= drop1) {
      spotsLeft = 2;
    }
    setVvipSpots(spotsLeft);
  }, []);

  const handleVvipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'vvip' }),
      });
      if (res.ok) setFormStatus('success');
      else setFormStatus('error');
    } catch {
      setFormStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="store-page">
      <div className="store-bg-glow" />

      {/* ══════════════════════════════════════
          SECTION 1: Hero & YouTube Video
      ══════════════════════════════════════ */}
      <section className="store-section store-hero">
        <div className="store-hero-inner animate-fade-up">
          <p className="store-eyebrow">{t('heroEyebrow')}</p>
          <h1 className="store-hero-title">{t('heroTitle')}</h1>
          <p className="store-hero-sub">{t('heroSub')}</p>
          <p className="store-hero-desc">{t('heroDesc')}</p>

          <div className="store-video-wrap">
            <iframe
              src="https://www.youtube.com/embed/W_vibklRdqY?autoplay=1&mute=1&loop=1&playsinline=1&fs=0&playlist=W_vibklRdqY&rel=0&controls=0&modestbranding=1&disablekb=1"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{ border: 'none', width: '100%', height: '100%' }}
            />
          </div>
          <p className="store-caption">{t('heroCaption')}</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2: Philosophy & Science
      ══════════════════════════════════════ */}
      <section className="store-section store-science-section">
        <div className="store-science-inner animate-fade-up">
          <h2 className="store-section-title">{t('sciTitle')}</h2>
          <p className="store-science-desc" style={{ textAlign: 'center' }}>
            {t('sciDesc')}
          </p>

          <div className="store-sci-grid" style={{ textAlign: 'center' }}>
            <div className="store-sci-item">
              <h4>{t('sci1Title')}</h4>
              <p>{t('sci1Desc')}</p>
            </div>
            <div className="store-sci-item">
              <h4>{t('sci2Title')}</h4>
              <p>{t('sci2Desc')}</p>
            </div>
            <div className="store-sci-item">
              <h4>{t('sci3Title')}</h4>
              <p>{t('sci3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3: General Products (Instant Access)
      ══════════════════════════════════════ */}
      <section className="store-section" id="instant">
        <p className="store-social-proof">
          {t('socialProofPre')}<span className="store-count">{followerCount}</span>{t('socialProofPost')}
        </p>
        <h2 className="store-section-title">{t('instantAccessTitle')}</h2>

        <div className="store-tier-wrap">
          {/* Om Mani */}
          <div className="store-tier-card store-featured">
            <div className="store-badge" style={{ background: 'linear-gradient(135deg,#FFD700,#C0A062)', color: '#000', right: '-12px', left: 'auto', transform: 'none' }}>
              {t('mostChosen')}
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 className="store-tier-name">{t('omManiTitle')}</h3>
              <p className="store-tier-price">$11.11</p>
            </div>
            <ul className="store-tier-features">
              <li>🧘 {t('omManiF1')}</li>
              <li>🖼️ {t('omManiF2')}</li>
              <li>📄 {t('omManiF3')}</li>
            </ul>
            <a href={PRODUCTS.omMani} target="_blank" rel="noopener noreferrer" className="store-cta-btn store-cta-gold">
              {t('getInstantAccess')}$11.11
            </a>
            <p className="store-micro-note">{t('microNote')}</p>
          </div>

          {/* Sacred Cosmic Amulet */}
          <div className="store-tier-card">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 className="store-tier-name">{t('amuletTitle')}</h3>
              <p className="store-tier-price">$11.11</p>
            </div>
            <ul className="store-tier-features">
              <li>📿 {t('amuletF1')}</li>
              <li>🪐 {t('amuletF2')}</li>
              <li>📄 {t('amuletF3')}</li>
            </ul>
            <a href={PRODUCTS.amulet} target="_blank" rel="noopener noreferrer" className="store-cta-btn store-cta-outline">
              {t('receiveAmulet')}$11.11
            </a>
          </div>

          {/* Bundle */}
          <div className="store-tier-card store-bundle">
            <div className="store-badge" style={{ left: '-12px', right: 'auto', transform: 'none', background: '#FFD700', color: '#000' }}>
              {t('bestValue')}
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 className="store-tier-name" style={{ color: '#FFD700' }}>{t('bundleTitle')}</h3>
              <p className="store-tier-price" style={{ color: '#FFD700', fontSize: '2rem' }}>$18.88</p>
              <p style={{ color: '#FFD700', fontSize: '0.85rem', margin: 0 }}>{t('saveAmount')}</p>
            </div>
            <ul className="store-tier-features">
              <li>✅ {t('bundleF1')}</li>
              <li>✅ {t('bundleF2')}</li>
              <li>💰 {t('bundleF3')}</li>
            </ul>
            <a href={PRODUCTS.bundle} target="_blank" rel="noopener noreferrer" className="store-cta-btn" style={{ background: '#FFD700', color: '#000' }}>
              {t('getBundle')}$18.88
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4: Lotus Products (Consumables)
      ══════════════════════════════════════ */}
      <section className="store-section">
        <h2 className="store-section-title" style={{ fontSize: '2rem', color: '#fff' }}>{t('lotusTitle')}</h2>
        <p style={{ textAlign: 'center', color: '#aaa', maxWidth: '600px', margin: '0 auto 40px' }}>
          {t('lotusDesc')}
        </p>
        <div className="store-tier-wrap">
          {/* Candle ($5 -> 54) */}
          <div className="store-tier-card">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 className="store-tier-name" style={{ color: '#ccc' }}>{t('candlePack')}</h3>
              <p className="store-tier-price">$5</p>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>{t('candleDesc')}</p>
            </div>
            <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '1.2rem', color: '#FFD700' }}>
              + 54 🪷
            </div>
            <a href={PRODUCTS.candle} target="_blank" rel="noopener noreferrer" className="store-cta-btn store-cta-outline">
              {t('buyLotus')}$5
            </a>
          </div>

          {/* Lotus ($25 -> 333) */}
          <div className="store-tier-card store-featured">
            <div className="store-badge" style={{ background: 'linear-gradient(135deg,#FFD700,#C0A062)', color: '#000', right: '-12px', left: 'auto', transform: 'none' }}>
              {t('mostChosen')}
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 className="store-tier-name" style={{ color: '#FFD700' }}>{t('lotusPack')}</h3>
              <p className="store-tier-price">$25</p>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>{t('lotusDesc2')}</p>
            </div>
            <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '1.5rem', color: '#FFD700', fontWeight: 'bold' }}>
              + 333 🪷
            </div>
            <a href={PRODUCTS.lotus} target="_blank" rel="noopener noreferrer" className="store-cta-btn store-cta-gold">
              {t('buyLotus')}$25
            </a>
          </div>

          {/* Mala ($108 -> 1080) */}
          <div className="store-tier-card">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 className="store-tier-name" style={{ color: '#E5A93C' }}>{t('malaPack')}</h3>
              <p className="store-tier-price">$108</p>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>{t('malaDesc')}</p>
            </div>
            <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '1.5rem', color: '#FFD700', fontWeight: 'bold' }}>
              + 1080 🪷
            </div>
            <a href={PRODUCTS.mala} target="_blank" rel="noopener noreferrer" className="store-cta-btn store-cta-outline" style={{ borderColor: '#E5A93C', color: '#E5A93C' }}>
              {t('buyLotus')}$108
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5: VIP Products
      ══════════════════════════════════════ */}
      <section className="store-section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '80px', marginTop: '60px' }}>
        <h2 className="store-section-title" style={{ fontSize: '2rem' }}>{t('vipTitle')}</h2>
        <p style={{ textAlign: 'center', color: '#aaa', maxWidth: '600px', margin: '0 auto 40px' }}>
          {t('vipDesc')}
        </p>

        <div className="store-tier-wrap" style={{ justifyContent: 'center' }}>
          {/* Premium ($333) */}
          <div className="store-tier-card" style={{ maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 className="store-tier-name">{t('premiumTier')}</h3>
              <p className="store-tier-price">$333</p>
            </div>
            <ul className="store-tier-features">
              <li>✅ {t('premiumF1')}</li>
              <li>📧 {t('premiumF2')}</li>
              <li>🎶 {t('premiumF3')}</li>
            </ul>
            {/* Using a mailto link as the default action for premium inquiry, or could use lemonsqueezy if it exists */}
            <button className="store-cta-btn store-cta-outline" onClick={() => setIsVvipModalOpen(true)}>
              {t('getPremium')}$333
            </button>
          </div>

          {/* VVIP ($1111) */}
          <div className="store-tier-card store-vvip" style={{ maxWidth: '400px', background: 'rgba(212,160,23,0.03)', borderColor: 'rgba(212,160,23,0.3)', position: 'relative' }}>
            <div className="store-badge" style={{ background: '#000', color: 'var(--primary-gold)', border: '1px solid rgba(212,175,55,0.3)', top: '-18px', left: '50%', right: 'auto', transform: 'translateX(-50%)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
              {locale === 'ko' ? '이번 달 남은 자리는 단 ' : 'Only '}
              <span style={{ 
                display: 'inline-block', minWidth: '26px', height: '26px', lineHeight: '26px',
                textAlign: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700 0%, #C0A062 100%)', 
                color: '#000', fontWeight: '900', fontSize: '14px', margin: '0 8px',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.8), inset 0 0 5px rgba(255, 255, 255, 0.5)', 
                border: '1px solid #FFF8DC', transform: 'scale(1.1)' 
              }}>
                {vvipSpots}
              </span>
              {locale === 'ko' ? '자리뿐입니다' : 'exclusive seats left'}
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '12px' }}>
              <h3 className="store-tier-name" style={{ color: '#FFD700', textShadow: '0 0 10px rgba(212,160,23,0.5)' }}>{t('vvipTier')}</h3>
              <p className="store-tier-price" style={{ color: '#FFD700' }}>$1111</p>
            </div>
            <ul className="store-tier-features">
              <li>✨ {t('vvipF1')}</li>
              <li>🗣️ {t('vvipF2')}</li>
              <li>🏛️ {t('vvipF3')}</li>
            </ul>
            <button className="store-cta-btn store-cta-gold" onClick={() => setIsVvipModalOpen(true)}>
              {t('applyVvip')}$1111
            </button>
          </div>
        </div>
      </section>

      {/* VVIP Application Modal */}
      {isVvipModalOpen && (
        <div className="store-modal-overlay" onClick={() => setIsVvipModalOpen(false)}>
          <div className="store-modal-content glass-card animate-fade-up" onClick={e => e.stopPropagation()}>
            <h3 className="store-modal-title" style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--primary-gold)' }}>
              VIP Inquiry
            </h3>
            {formStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: '#4CAF50', fontSize: '1.1rem', marginBottom: '16px' }}>
                  Your application has been received with gratitude.
                </p>
                <p style={{ color: '#aaa' }}>Our team will contact you shortly.</p>
                <button className="store-cta-btn store-cta-gold" style={{ marginTop: '24px' }} onClick={() => setIsVvipModalOpen(false)}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleVvipSubmit} className="store-form">
                <p style={{ color: '#aaa', marginBottom: '24px', fontSize: '0.9rem' }}>
                  Please leave your details. The founder will review and reply directly.
                </p>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="store-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  className="store-input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                <textarea
                  required
                  placeholder="Why do you wish to join the inner circle?"
                  className="store-textarea"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="store-cta-btn store-cta-outline" style={{ padding: '12px', flex: 1 }} onClick={() => setIsVvipModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="store-cta-btn store-cta-gold" style={{ padding: '12px', flex: 1 }} disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </div>
                {formStatus === 'error' && (
                  <p style={{ color: '#E53E3E', fontSize: '0.85rem', marginTop: '12px', textAlign: 'center' }}>
                    Failed to send. Please try again.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global Store Styles */}
      <style>{`
        .store-page { min-height: 100vh; background: #080807; position: relative; overflow-x: hidden; padding-bottom: 120px; }
        .store-bg-glow { position: absolute; top: 0; left: 0; right: 0; height: 800px; background: radial-gradient(circle at 50% 0%, rgba(212,160,23,0.15) 0%, transparent 70%); pointer-events: none; z-index: 0; }
        .store-section { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 80px 24px 20px; }
        .store-hero { text-align: center; padding-top: 140px; }
        .store-eyebrow { color: #d4a017; font-size: 0.9rem; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 16px; text-transform: uppercase; }
        .store-hero-title { font-family: var(--font-serif); font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.1; margin-bottom: 24px; color: #fff; text-shadow: 0 0 30px rgba(255,255,255,0.2); }
        .store-hero-sub { font-size: clamp(1.2rem, 3vw, 1.8rem); color: #fff; margin-bottom: 16px; }
        .store-hero-desc { font-size: 1.1rem; color: #888; max-width: 600px; margin: 0 auto 40px; }
        
        .store-video-wrap { position: relative; width: 100%; max-width: 800px; margin: 0 auto; aspect-ratio: 16/9; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.05); }
        .store-caption { text-align: center; font-size: 0.85rem; color: #666; margin-top: 16px; }
        
        .store-science-inner { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 40px; }
        .store-sci-grid { display: flex; flex-direction: column; gap: 24px; margin-top: 40px; text-align: center; }
        .store-sci-item { padding: 24px; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px solid rgba(255,255,255,0.03); }
        .store-sci-item h4 { color: #d4a017; margin-bottom: 8px; font-size: 1.1rem; }
        .store-sci-item p { color: #888; font-size: 0.95rem; line-height: 1.5; }
        
        .store-social-proof { text-align: center; font-size: 1.1rem; color: #aaa; margin-bottom: 16px; }
        .store-count { color: #d4a017; font-weight: 700; font-size: 1.3rem; }
        .store-section-title { text-align: center; font-family: var(--font-serif); font-size: 2.5rem; color: #fff; margin-bottom: 50px; }
        
        .store-tier-wrap { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; }
        .store-tier-card { position: relative; flex: 1; min-width: 300px; max-width: 380px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 40px 30px; display: flex; flex-direction: column; transition: transform 0.4s; }
        .store-tier-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1); }
        .store-featured { border-color: rgba(212,160,23,0.3); box-shadow: 0 0 40px rgba(212,160,23,0.05); }
        
        .store-badge { position: absolute; top: -12px; padding: 6px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
        .store-tier-name { font-size: 1.3rem; color: #fff; font-weight: 600; margin-bottom: 8px; }
        .store-tier-price { font-size: 1.8rem; font-weight: 700; color: #fff; font-family: var(--font-serif); }
        
        .store-tier-features { list-style: none; padding: 0; margin: 0 0 32px 0; flex-grow: 1; }
        .store-tier-features li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; color: #ccc; font-size: 0.95rem; line-height: 1.4; }
        
        .store-cta-btn { display: inline-block; width: 100%; padding: 16px; text-align: center; border-radius: 30px; font-weight: 700; font-size: 1rem; transition: 0.3s; cursor: pointer; text-decoration: none; border: none; }
        .store-cta-gold { background: linear-gradient(135deg, #d4a017, #f3c75e); color: #000; box-shadow: 0 10px 20px rgba(212,160,23,0.2); }
        .store-cta-gold:hover { transform: scale(1.02); box-shadow: 0 15px 30px rgba(212,160,23,0.4); }
        .store-cta-outline { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; }
        .store-cta-outline:hover { border-color: #fff; background: rgba(255,255,255,0.05); }
        
        .store-micro-note { text-align: center; font-size: 0.75rem; color: #666; margin-top: 12px; }
        
        /* Modal */
        .store-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .store-modal-content { width: 100%; max-width: 500px; padding: 40px; }
        .store-input, .store-textarea { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 16px; border-radius: 12px; font-size: 1rem; margin-bottom: 16px; transition: 0.3s; }
        .store-input:focus, .store-textarea:focus { outline: none; border-color: var(--primary-gold); }
        .store-textarea { min-height: 120px; resize: vertical; }
      `}</style>
    </main>
  );
}
