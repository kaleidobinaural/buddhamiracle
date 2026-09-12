'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const LOTUS_TIERS = [
  { id: 'wish', lotus: 10, icon: '🌱', labelKey: 'lotusTier1Name', descKey: 'lotusTier1Desc' },
  { id: 'wisdom', lotus: 54, icon: '🌸', labelKey: 'lotusTier2Name', descKey: 'lotusTier2Desc' },
  { id: 'sanctuary', lotus: 333, icon: '🪷', labelKey: 'lotusTier3Name', descKey: 'lotusTier3Desc' },
];

export default function DonatePage() {
  const { data: session, status } = useSession();
  const tGuru = useTranslations('Guru');
  const tDonate = useTranslations('Donate');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [lotusCount, setLotusCount] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryFormData, setInquiryFormData] = useState({ name: '', email: '', message: '' });
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const paypalMeUrl = process.env.NEXT_PUBLIC_PAYPAL_ME_URL || '';
  const paypalEmail = process.env.NEXT_PUBLIC_PAYPAL_EMAIL || '';

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/lotus').then(r => r.json()).then(d => {
        if (typeof d.lotus_count === 'number') setLotusCount(d.lotus_count);
      }).catch(() => {});
    }
  }, [session]);

  function buildPayPalUrl() {
    if (paypalMeUrl) return paypalMeUrl;
    if (paypalEmail) return 'https://www.paypal.com/donate?business=' + encodeURIComponent(paypalEmail) + '&currency_code=USD&no_note=1&lc=US';
    return '#';
  }

  async function handleLotusOffer(tier: typeof LOTUS_TIERS[0]) {
    if (status !== 'authenticated') { 
      setShowAuthModal(true); 
      return; 
    }
    if (lotusCount !== null && lotusCount < tier.lotus) { 
      setShowUpgradeModal(true); 
      return; 
    }

    try {
      const res = await fetch('/api/user/lotus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: tier.lotus, reason: `offering_${tier.id}` }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof data.lotus_count === 'number') {
          setLotusCount(data.lotus_count);
          window.dispatchEvent(new CustomEvent('lotus-updated', { detail: { lotus_count: data.lotus_count } }));
        }
        setNotification({
          message: tDonate('offeringSuccess', { count: tier.lotus }),
          show: true
        });
        setTimeout(() => setNotification({ message: '', show: false }), 4000);
      } else {
        if (res.status === 403) {
          setShowUpgradeModal(true);
        } else {
          setNotification({ message: data.error || '공양 처리 중 오류가 발생했습니다.', show: true });
          setTimeout(() => setNotification({ message: '', show: false }), 3000);
        }
      }
    } catch {
      setNotification({ message: '공양 처리 중 오류가 발생했습니다.', show: true });
      setTimeout(() => setNotification({ message: '', show: false }), 3000);
    }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setInquiryStatus('submitting');
    try {
      const res = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...inquiryFormData, type: 'Support' }) });
      if (res.ok) setInquiryStatus('success'); else setInquiryStatus('error');
    } catch { setInquiryStatus('error'); }
  };

  return (
    <main className="donate-page" id="main-content">
      <div className="donate-fog-top" aria-hidden="true" />
      <div className="donate-bg-glow" aria-hidden="true" />
      <div className="donate-container">

        {/* Header */}
        <header className="donate-header animate-fade-up">
          <div className="header-eyebrow">{tDonate('eyebrow')}</div>
          <h1 className="donate-title text-gradient-gold-v2">{tDonate('title')}</h1>
          <p className="donate-subtitle">{tDonate('subtitle')}</p>
          {session?.user && lotusCount !== null && (
            <div className="lotus-balance-badge">
              {tDonate('balance')} <strong>🪷 {lotusCount}</strong>
            </div>
          )}
        </header>

        {/* 3 Lotus Cards + 1 PayPal Card */}
        <section className="donate-grid-4 animate-fade-up animate-delay-200" aria-label="Offering options">
          {LOTUS_TIERS.map((tier, i) => (
            <article
              key={tier.id}
              className="donate-card glass-card"
              id={"offer-" + tier.id}
              style={{ animationDelay: (i + 1) * 120 + 'ms' }}
            >
              <div className="tier-icon-wrap">
                <div className="tier-icon">{tier.icon}</div>
                <div className="tier-icon-glow" />
              </div>
              <h2 className="tier-label">{tDonate(tier.labelKey as Parameters<typeof tDonate>[0])}</h2>
              <div className="lotus-amount-display">
                <span className="lotus-emoji">🪷</span>
                <span className="lotus-num">{tier.lotus}</span>
              </div>
              <p className="tier-desc">{tDonate(tier.descKey as Parameters<typeof tDonate>[0])}</p>
              <button
                onClick={() => handleLotusOffer(tier)}
                className="btn-gold tier-btn"
                id={"btn-offer-" + tier.id}
              >
                {tDonate('offerBtn' as any, { count: tier.lotus })}
              </button>
            </article>
          ))}

          {/* PayPal Card */}
          <article className="donate-card glass-card paypal-card" id="offer-paypal">
            <div className="tier-icon-wrap">
              <div className="tier-icon">💛</div>
              <div className="tier-icon-glow" />
            </div>
            <h2 className="tier-label">{tDonate('paypalTitle')}</h2>
            <div className="lotus-amount-display">
              <span className="paypal-free-label">{tDonate('paypalFreeAmount')}</span>
            </div>
            <p className="tier-desc">{tDonate('paypalDesc')}</p>
            <a
              href={buildPayPalUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold tier-btn paypal-btn"
              id="btn-offer-paypal"
              style={{ textDecoration: 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.9 }}>
                <path d="M7.144 19.532l1.049-5.751c.11-.606.691-1.002 1.304-.9 2.155.37 3.814-.208 4.913-1.565.9-1.117 1.154-2.6.756-4.145C14.696 5.564 13.37 5 11.849 5H7.037C6.55 5 6.134 5.35 6.053 5.83L3.5 19.5c-.095.527.316 1.016.853 1.016h2.035c.44 0 .817-.317.883-.75z"/>
                <path d="M19.5 9.5c-.063 3.256-1.87 5.5-5.844 5.5H12l-1 5.5h-2l3-16h5c2.5 0 3.636 1.5 3.5 5z" opacity="0.6"/>
              </svg>
              {tDonate('payWithPayPal')}
            </a>
          </article>
        </section>

        {/* Bottom Actions */}
        <div className="donate-bottom-actions animate-fade-up animate-delay-400">
          <Link
            href="/store#lotus-section"
            className="donate-action-btn donate-action-btn--gold"
            id="btn-buy-lotus"
            style={{ textDecoration: 'none' }}
          >
            🪷 {tDonate('buyMoreLotus')}
          </Link>
          <button
            className="donate-action-btn donate-action-btn--outline"
            id="btn-payment-inquiry"
            onClick={() => {
              setInquiryStatus('idle');
              setInquiryFormData({ name: '', email: '', message: '' });
              setIsInquiryModalOpen(true);
            }}
          >
            💬 {tDonate('inquiryLink')}
          </button>
        </div>
      </div>

      <style>{`
        .donate-page { min-height: 100vh; display: flex; flex-direction: column; align-items: flex-start; padding: 16px 24px 60px; position: relative; overflow: hidden; }
        .donate-fog-top { position: fixed; top: 0; left: 0; right: 0; height: 180px; background: linear-gradient(to bottom, #080807 0%, rgba(8,8,7,0.85) 40%, transparent 100%); z-index: 150; pointer-events: none; }
        .donate-bg-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 1000px; height: 1000px; background: radial-gradient(circle, rgba(212,160,23,0.04) 0%, transparent 70%); filter: blur(120px); pointer-events: none; }
        .donate-container { max-width: 1200px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 32px; position: relative; z-index: 1; }
        .donate-header { text-align: center; }
        .header-eyebrow { font-size: 0.85rem; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; color: var(--primary-gold); margin-bottom: 8px; opacity: 0.85; }
        .donate-title { font-size: clamp(2.3rem, 6vw, 4.5rem); margin-bottom: 12px; line-height: 1.15; }
        .donate-subtitle { font-size: 1rem; color: var(--text-secondary); max-width: 560px; margin: 0 auto 16px; line-height: 1.6; font-weight: 300; font-style: italic; }
        .lotus-balance-badge { display: inline-block; color: var(--primary-gold); font-size: 1rem; background: rgba(212,160,23,0.08); padding: 8px 20px; border-radius: 100px; border: 1px solid rgba(212,160,23,0.2); }
        .donate-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; align-items: stretch; }
        
        @media (max-width: 768px) {
          .donate-page { padding: 12px 16px 60px; }
          .donate-container { gap: 24px; }
          .header-eyebrow { margin-bottom: 6px; font-size: 0.78rem; letter-spacing: 0.2em; }
          .donate-title { font-size: 2.2rem; margin-bottom: 8px; }
          .donate-subtitle { font-size: 0.88rem; line-height: 1.5; margin-bottom: 12px; }
          .donate-grid-4 { grid-template-columns: 1fr; gap: 16px; }
        }
        .donate-card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 44px 24px 28px; gap: 14px; transition: all 0.5s var(--ease-expo); border-radius: 24px; }
        .donate-card:hover { transform: translateY(-10px); border-color: var(--primary-gold); box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 20px var(--primary-glow-soft); }
        .paypal-card { border-color: rgba(255,196,57,0.25); background: rgba(255,196,57,0.02); }
        .tier-icon-wrap { position: relative; }
        .tier-icon { font-size: 3rem; position: relative; z-index: 1; filter: drop-shadow(0 0 15px var(--primary-glow-soft)); transition: transform 0.5s var(--ease-expo); display: block; }
        .donate-card:hover .tier-icon { transform: scale(1.15); }
        .tier-icon-glow { position: absolute; inset: -10px; background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%); opacity: 0.3; transition: opacity 0.5s; }
        .donate-card:hover .tier-icon-glow { opacity: 0.7; }
        .tier-label { font-family: var(--font-ui); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-tertiary); transition: color 0.3s; margin: 0; }
        .donate-card:hover .tier-label { color: var(--primary-gold); }
        .lotus-amount-display { display: flex; align-items: center; gap: 8px; margin: 4px 0; min-height: 56px; justify-content: center; }
        .lotus-emoji { font-size: 1.8rem; }
        .lotus-num { font-size: 3.5rem; line-height: 1; font-family: var(--font-serif); color: var(--primary-gold); }
        .paypal-free-label { font-size: 1.05rem; color: rgba(255,255,255,0.4); font-family: var(--font-serif); font-style: italic; }
        .tier-desc { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7; flex: 1; margin: 0; }
        .tier-btn { width: 100%; padding: 14px; font-size: 0.88rem; justify-content: center; display: flex; align-items: center; gap: 8px; text-decoration: none; margin-top: auto; border-radius: 100px; border: none; cursor: pointer; }
        .donate-bottom-actions { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .donate-action-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; border-radius: 100px; font-size: 0.95rem; font-weight: 600; font-family: var(--font-ui); cursor: pointer; transition: all 0.3s; white-space: nowrap; min-width: 240px; text-align: center; }
        .donate-action-btn--gold { background: linear-gradient(135deg, var(--primary-gold), #f3c75e); color: #000; border: none; box-shadow: 0 8px 24px rgba(212,160,23,0.25); }
        .donate-action-btn--gold:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(212,160,23,0.45); }
        .donate-action-btn--outline { background: transparent; border: 1px solid rgba(212,160,23,0.35); color: var(--primary-gold); }
        .donate-action-btn--outline:hover { background: rgba(212,160,23,0.08); border-color: var(--primary-gold); }
        .ritual-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); backdrop-filter: blur(15px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 24px; overflow-y: auto; }
        .modal-content { width: 100%; max-width: 500px; padding: 40px; border: 1px solid rgba(212,160,23,0.2); border-radius: 24px; }
        .modal-title { font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 24px; text-align: center; }
        .store-form { display: flex; flex-direction: column; gap: 14px; }
        .store-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px 16px; border-radius: 10px; font-size: 0.95rem; font-family: var(--font-ui); outline: none; transition: border-color 0.3s; }
        .store-input:focus { border-color: var(--primary-gold); }
        .store-textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px 16px; border-radius: 10px; font-size: 0.95rem; font-family: var(--font-ui); outline: none; resize: vertical; min-height: 100px; transition: border-color 0.3s; }
        .store-textarea:focus { border-color: var(--primary-gold); }
        .notification-bar { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(120px); background: rgba(212,160,23,0.98); color: #000; padding: 14px 36px; border-radius: 50px; font-weight: 800; font-size: 1rem; transition: all 0.5s cubic-bezier(0.19,1,0.22,1); opacity: 0; z-index: 200000; pointer-events: none; max-width: 90vw; text-align: center; line-height: 1.5; box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 25px rgba(212,160,23,0.4); }
        .notification-bar.show { transform: translateX(-50%) translateY(0); opacity: 1; }
        @media (max-width: 1024px) { .donate-grid-4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .donate-page { padding: 70px 16px 60px; } .donate-grid-4 { grid-template-columns: 1fr; } }
      `}</style>

      <div className={`notification-bar ${notification.show ? 'show' : ''}`}>{notification.message}</div>

      {showUpgradeModal && (
        <div className="ritual-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content glass-card animate-fade-up" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🪷</div>
              <h2 className="modal-title">{tGuru('upgradeTitle')}</h2>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '28px' }}>{tGuru('upgradeBody')}</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link href="/store#lotus-section" className="btn-gold-glow-v2" style={{ flex: 1, padding: '10px 12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem', textDecoration: 'none' }}>🪷 {tGuru('buyLotus')}</Link>
                <button onClick={() => setShowUpgradeModal(false)} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem' }}>{tGuru('returnToSilence')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Localized Login Required Modal ── */}
      {showAuthModal && (
        <div className="ritual-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content glass-card animate-fade-up" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>☸</div>
              <h2 className="modal-title">{tDonate('loginRequiredTitle')}</h2>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '28px' }}>
                {tDonate('loginRequiredDesc')}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link
                  href="/login"
                  className="btn-gold-glow-v2"
                  style={{ flex: 1, padding: '10px 12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem', textDecoration: 'none' }}
                >
                  🔑 {tDonate('loginBtn')}
                </Link>
                <button
                  onClick={() => setShowAuthModal(false)}
                  style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {tDonate('returnBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isInquiryModalOpen && (
        <div className="ritual-modal-overlay" onClick={() => setIsInquiryModalOpen(false)}>
          <div className="modal-content glass-card animate-fade-up" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => setIsInquiryModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1.4rem',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1
              }}
              aria-label="Close"
            >✕</button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--primary-gold)', fontFamily: 'var(--font-serif)', textAlign: 'center' }}>{tDonate('inquiryModalTitle')}</h3>
            {inquiryStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: '#4CAF50', fontSize: '1.1rem', marginBottom: '16px' }}>{tDonate('inquirySuccess')}</p>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '24px' }}>{tDonate('inquirySuccessNote')}</p>
                <button className="btn-gold" onClick={() => setIsInquiryModalOpen(false)}>{tDonate('inquiryClose')}</button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="store-form">
                <p style={{ color: '#aaa', marginBottom: '12px', fontSize: '0.9rem', textAlign: 'center', lineHeight: 1.6 }}>{tDonate('inquiryDesc')}</p>
                <input type="text" required placeholder={tDonate('inquiryName')} className="store-input" value={inquiryFormData.name} onChange={e => setInquiryFormData({ ...inquiryFormData, name: e.target.value })} />
                <input type="email" required placeholder={tDonate('inquiryEmail')} className="store-input" value={inquiryFormData.email} onChange={e => setInquiryFormData({ ...inquiryFormData, email: e.target.value })} />
                <textarea required placeholder={tDonate('inquiryMessage')} className="store-textarea" value={inquiryFormData.message} onChange={e => setInquiryFormData({ ...inquiryFormData, message: e.target.value })} />
                {inquiryStatus === 'error' && <p style={{ color: '#E53E3E', fontSize: '0.85rem', textAlign: 'center' }}>{tDonate('inquiryError')}</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', alignItems: 'center', width: '100%' }}>
                  <button 
                    type="submit" 
                    className="btn-gold" 
                    style={{ width: '100%', padding: '14px', justifyContent: 'center', display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 600 }} 
                    disabled={inquiryStatus === 'submitting'}
                  >
                    {inquiryStatus === 'submitting' ? '...' : tDonate('inquirySubmit')}
                  </button>
                  <button 
                    type="button" 
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', padding: '8px', fontSize: '0.88rem' }} 
                    onClick={() => setIsInquiryModalOpen(false)}
                  >
                    {tDonate('inquiryCancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
