'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

// ─── Donation tiers ───────────────────────────────────────
const REAL_TIERS = [
  {
    id: 'candle',
    label: 'A Candle',
    amount: 5,
    lotusReward: 54,
    icon: '🕯️',
    desc: 'Light a single flame in the sanctuary. Receive 54 lotus petals — one for each chapter of the Dhammapada.',
    paypalItem: 'Temple+of+Light+Candle+Offering',
    lemonUrl: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_CANDLE,
  },
  {
    id: 'lotus',
    label: 'A Lotus',
    amount: 25,
    lotusReward: 333,
    icon: '🪷',
    desc: 'Offer a lotus in full bloom. Receive 333 lotus petals — the number of steps on the sacred path.',
    paypalItem: 'Temple+of+Light+Lotus+Offering',
    lemonUrl: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_LOTUS,
  },
  {
    id: 'mala',
    label: 'A Mala',
    amount: 108,
    lotusReward: 1080,
    icon: '📿',
    desc: 'Offer a prayer mala. Receive 1,080 lotus petals and have your name eternally etched on the Supporter\'s Wall.',
    paypalItem: 'Temple+of+Light+Mala+Offering',
    lemonUrl: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_MALA,
    pillarReward: true,
  },
];

// Lotus-based virtual offerings (spend lotus to "offer" to the temple community)
const LOTUS_TIERS = [
  {
    id: 'incense',
    label: 'Incense',
    lotus: 5,
    icon: '🌿',
    desc: 'A small offering of presence. Your energy joins the collective field.',
  },
  {
    id: 'prayer',
    label: 'Prayer Bell',
    lotus: 10,
    icon: '🔔',
    desc: 'Ring the virtual bell. Your intention resonates through the temple for all seekers.',
  },
  {
    id: 'shrine',
    label: 'Shrine Light',
    lotus: 20,
    icon: '✨',
    desc: 'Illuminate the shrine. Your contribution of light supports the community for one moon cycle.',
  },
];

export default function DonatePage() {
  const { data: session, status } = useSession();
  const t = useTranslations('WishRoof'); // reuse shared keys
  const tGuru = useTranslations('Guru');
  const tDonate = useTranslations('Donate');
  const [mode, setMode] = useState<'real' | 'lotus'>('real');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lotusCount, setLotusCount] = useState<number | null>(null);
  const [notification, setNotification] = useState<{message: string, show: boolean}>({ message: '', show: false });
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryFormData, setInquiryFormData] = useState({ name: '', email: '', message: '' });
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const paypalEmail = process.env.NEXT_PUBLIC_PAYPAL_EMAIL || '';
  const paypalMeUrl = process.env.NEXT_PUBLIC_PAYPAL_ME_URL || '';
  const lemonUrl = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_URL || '#';

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/lotus')
        .then(res => res.json())
        .then(data => {
          if (typeof data.lotus_count === 'number') setLotusCount(data.lotus_count);
        })
        .catch(() => {});
    }
  }, [session]);

  function buildPayPalUrl(tier: typeof REAL_TIERS[0]) {
    // Use PayPal.me if configured, otherwise standard PayPal checkout
    if (paypalMeUrl) return `${paypalMeUrl}/${tier.amount}`;
    if (paypalEmail) {
      return (
        `https://www.paypal.com/donate?business=${encodeURIComponent(paypalEmail)}` +
        `&amount=${tier.amount}&currency_code=USD` +
        `&item_name=${tier.paypalItem}` +
        `&no_note=1&lc=US`
      );
    }
    return '#';
  }

  async function handleLotusOffer(tier: typeof LOTUS_TIERS[0]) {
    if (status !== 'authenticated') {
      window.location.href = '/api/auth/signin';
      return;
    }
    
    if (lotusCount !== null && lotusCount < tier.lotus) {
      setShowUpgradeModal(true);
      return;
    }

    // TODO: deduct lotus via API
    setNotification({ message: tDonate('comingSoon', { count: tier.lotus }), show: true });
    setTimeout(() => setNotification({ message: '', show: false }), 3000);
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryStatus('submitting');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inquiryFormData, type: 'Support' }),
      });
      if (res.ok) setInquiryStatus('success');
      else setInquiryStatus('error');
    } catch {
      setInquiryStatus('error');
    }
  };

  return (
    <main className="donate-page" id="main-content">
      <div className="donate-bg-glow" aria-hidden="true" />

      <div className="donate-container">
        {/* Header */}
        <header className="donate-header animate-fade-up">
          <div className="header-eyebrow">{tDonate('eyebrow')}</div>
          <h1 className="donate-title text-gradient-gold-v2">{tDonate('title')}</h1>
          <p className="donate-subtitle">
            {tDonate('subtitle')}
          </p>
          
          {session?.user && lotusCount !== null && (
            <div style={{ marginBottom: '24px', color: 'var(--primary-gold)', fontSize: '1.1rem' }}>
              {tDonate('balance')} <strong>🪷 {lotusCount}</strong>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="mode-toggle" role="tablist" aria-label="Offering type">
            <button
              role="tab"
              aria-selected={mode === 'real'}
              className={`mode-btn ${mode === 'real' ? 'active' : ''}`}
              onClick={() => setMode('real')}
              id="tab-real"
            >
              💳 {tDonate('realOffering')}
            </button>
            <button
              role="tab"
              aria-selected={mode === 'lotus'}
              className={`mode-btn ${mode === 'lotus' ? 'active' : ''}`}
              onClick={() => setMode('lotus')}
              id="tab-lotus"
            >
              🪷 {tDonate('lotusOffering')}
            </button>
          </div>
        </header>

        {/* Real Money Tiers */}
        {mode === 'real' && (
          <section className="donate-grid animate-fade-up animate-delay-200" aria-label="Real donation tiers">
            {REAL_TIERS.map((tier, index) => (
              <article
                key={tier.id}
                className="donate-card glass-card"
                id={`tier-${tier.id}`}
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                <div className="tier-icon-wrap">
                  <div className="tier-icon" aria-hidden="true">{tier.icon}</div>
                  <div className="tier-icon-glow" />
                </div>
                <h2 className="tier-label">{tDonate(`realTier${index + 1}Name`)}</h2>
                <p className="tier-amount">
                  <span className="currency">$</span>
                  <span className="value">{tier.amount}</span>
                </p>
                <p className="tier-desc">{tDonate(`realTier${index + 1}Desc`)}</p>
                <p className="tier-reward">{tDonate('receiveLotus', { count: tier.lotusReward })}</p>
                <a
                  href={buildPayPalUrl(tier)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold tier-btn"
                  id={`donate-${tier.id}-btn`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}>
                    <path d="M7.144 19.532l1.049-5.751c.11-.606.691-1.002 1.304-.9 2.155.37 3.814-.208 4.913-1.565.9-1.117 1.154-2.6.756-4.145C14.696 5.564 13.37 5 11.849 5H7.037C6.55 5 6.134 5.35 6.053 5.83L3.5 19.5c-.095.527.316 1.016.853 1.016h2.035c.44 0 .817-.317.883-.75z"/>
                    <path d="M19.5 9.5c-.063 3.256-1.87 5.5-5.844 5.5H12l-1 5.5h-2l3-16h5c2.5 0 3.636 1.5 3.5 5z" opacity="0.6"/>
                  </svg>
                  {tDonate('payWithPayPal')}
                </a>
              </article>
            ))}
            {/* Payment Inquiry Link */}
            <div style={{ textAlign: 'center', marginTop: '32px', width: '100%' }}>
              <button
                className="btn-inquiry-link"
                onClick={() => { setInquiryStatus('idle'); setInquiryFormData({ name: '', email: '', message: '' }); setIsInquiryModalOpen(true); }}
              >
                💬 {tDonate('inquiryLink')}
              </button>
            </div>
          </section>
        )}

        {/* Lotus Offering Tiers */}
        {mode === 'lotus' && (
          <section className="donate-grid animate-fade-up animate-delay-200" aria-label="Lotus donation tiers">
            <div className="lotus-mode-note">
              <p dangerouslySetInnerHTML={{ __html: tDonate('lotusModeNote') || '🪷 Your lotus petals were received with gratitude. Offering them back to the temple community is a beautiful act of <em>dana</em> — the Buddhist virtue of generosity.' }} />
              <p style={{ marginTop: '12px', fontSize: '0.85rem', opacity: 0.8 }}>{tDonate('lotusNotice')}</p>
            </div>
            {LOTUS_TIERS.map((tier, index) => (
              <article
                key={tier.id}
                className="donate-card glass-card"
                id={`lotus-tier-${tier.id}`}
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                <div className="tier-icon-wrap">
                  <div className="tier-icon" aria-hidden="true">{tier.icon}</div>
                  <div className="tier-icon-glow" />
                </div>
                <h2 className="tier-label">{tDonate(`lotusTier${index + 1}Name`)}</h2>
                <p className="tier-amount lotus-amount">
                  <span className="currency" style={{ fontSize: '2rem' }}>🪷</span>
                  <span className="value">{tier.lotus}</span>
                </p>
                <p className="tier-desc">{tDonate(`lotusTier${index + 1}Desc`)}</p>
                <button
                  onClick={() => handleLotusOffer(tier)}
                  className="btn-gold tier-btn"
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  🌿 Offer {tier.lotus} Lotus
                </button>
              </article>
            ))}
            <div className="lotus-buy-note">
              <p>{tDonate('needMoreLotus')}</p>
              <a href={lemonUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ marginTop: '12px', display: 'inline-block' }}>
                🪷 {tDonate('purchaseLotus')}
              </a>
            </div>
          </section>
        )}

        {/* Footer Note */}
        <div className="donate-note animate-fade-up animate-delay-400">
          <div className="note-divider" />
          <p>
            {mode === 'real'
              ? tDonate('paypalNote')
              : tDonate('virtualNote')}
          </p>
          <Link href="/" className="btn-ghost return-btn" id="donate-return-btn">
            {tDonate('returnToTemple')}
          </Link>
        </div>
      </div>

      <style>{`
        .donate-page {
          min-height: calc(100dvh - var(--nav-height));
          display: flex;
          align-items: center;
          padding: 100px 24px;
          position: relative;
          overflow: hidden;
        }
        .donate-bg-glow {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 1000px; height: 1000px;
          background: radial-gradient(circle, rgba(212,160,23,0.04) 0%, transparent 70%);
          filter: blur(120px); pointer-events: none;
        }
        .donate-container {
          max-width: 1100px; margin: 0 auto; width: 100%;
          display: flex; flex-direction: column; gap: 56px;
          position: relative; z-index: 1;
        }
        .donate-header { text-align: center; }
        .header-eyebrow {
          font-size: 0.75rem; font-weight: 600; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--primary-gold); margin-bottom: 24px; opacity: 0.8;
        }
        .donate-title { font-size: clamp(3rem, 7vw, 5rem); margin-bottom: 24px; line-height: 1.1; }
        .donate-subtitle {
          font-size: 1.1rem; color: var(--text-secondary); max-width: 580px;
          margin: 0 auto 36px; line-height: 1.8; font-weight: 300;
        }

        /* Mode Toggle */
        .mode-toggle {
          display: inline-flex; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 100px;
          padding: 6px; gap: 4px; margin: 0 auto;
        }
        .mode-btn {
          padding: 10px 24px; border-radius: 100px; border: none; cursor: pointer;
          font-family: var(--font-ui); font-size: 0.9rem; font-weight: 500;
          color: var(--text-secondary); background: transparent;
          transition: all 0.3s ease; letter-spacing: 0.02em;
        }
        .mode-btn.active {
          background: linear-gradient(135deg, rgba(212,160,23,0.25), rgba(212,160,23,0.1));
          color: var(--primary-gold); border: 1px solid rgba(212,160,23,0.3);
        }
        .mode-btn:hover:not(.active) { color: #fff; background: rgba(255,255,255,0.05); }

        /* Grid */
        .donate-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;
        }
        .donate-card {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 56px 40px; gap: 20px;
          transition: all 0.5s var(--ease-expo); border-radius: 24px;
        }
        .donate-card:hover {
          transform: translateY(-12px); background: rgba(255,255,255,0.02);
          border-color: var(--primary-gold);
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 20px var(--primary-glow-soft);
        }
        .tier-icon-wrap { position: relative; margin-bottom: 8px; }
        .tier-icon {
          font-size: 3.5rem; position: relative; z-index: 1;
          filter: drop-shadow(0 0 15px var(--primary-glow-soft));
          transition: transform 0.5s var(--ease-expo);
        }
        .donate-card:hover .tier-icon { transform: scale(1.15); }
        .tier-icon-glow {
          position: absolute; inset: -10px;
          background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
          opacity: 0.4; transition: opacity 0.5s;
        }
        .donate-card:hover .tier-icon-glow { opacity: 0.8; transform: scale(1.5); }
        .tier-label {
          font-family: var(--font-ui); font-size: 0.85rem; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--text-tertiary); transition: color 0.3s;
        }
        .donate-card:hover .tier-label { color: var(--primary-gold); }
        .tier-amount {
          font-family: var(--font-serif); color: var(--primary-gold);
          display: flex; align-items: baseline; gap: 4px;
        }
        .tier-amount .currency { font-size: 1.5rem; opacity: 0.7; }
        .tier-amount .value { font-size: 4rem; line-height: 1; }
        .tier-desc { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.7; flex: 1; }
        .tier-reward {
          font-size: 0.8rem; color: var(--primary-gold); opacity: 0.7;
          background: rgba(212,160,23,0.08); padding: 6px 14px; border-radius: 20px;
          border: 1px solid rgba(212,160,23,0.15);
        }
        .tier-btn {
          width: 100%; padding: 16px; font-size: 0.9rem;
          justify-content: center; display: flex; align-items: center;
          gap: 8px; text-decoration: none;
        }

        /* Lotus mode extras */
        .lotus-mode-note {
          grid-column: 1 / -1; text-align: center;
          padding: 20px 32px; border: 1px solid rgba(212,160,23,0.15);
          border-radius: 16px; background: rgba(212,160,23,0.04);
        }
        .lotus-mode-note p {
          color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7;
        }
        .lotus-buy-note {
          grid-column: 1 / -1; text-align: center; padding: 24px;
        }
        .lotus-buy-note p { color: var(--text-tertiary); font-size: 0.9rem; margin-bottom: 8px; }

        /* Footer */
        .donate-note {
          display: flex; flex-direction: column; align-items: center; gap: 32px; text-align: center;
        }
        .note-divider { width: 80px; height: 1px; background: var(--border-glass-hover); opacity: 0.5; }
        .donate-note p {
          font-size: 0.85rem; color: var(--text-tertiary); max-width: 540px; line-height: 1.8; font-style: italic;
        }
        .return-btn { font-size: 0.9rem; padding: 12px 24px; border-radius: 100px; }
        
        .lotus-pillar-notice {
          background: rgba(212, 160, 23, 0.05); border: 1px solid rgba(212, 160, 23, 0.2); 
          padding: 16px 24px; border-radius: 12px; margin-bottom: 32px; text-align: center;
        }
        .lotus-pillar-notice p {
          color: var(--primary-gold); font-size: 0.95rem; line-height: 1.6; font-weight: 500;
        }
        
        .notification-bar {
          position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%) translateY(100px);
          background: rgba(212, 160, 23, 0.95); color: #000; padding: 14px 40px; border-radius: 50px;
          font-weight: 800; font-size: 1rem; box-shadow: 0 10px 50px rgba(0,0,0,0.8), 0 0 20px rgba(212, 160, 23, 0.5);
          transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1); opacity: 0; z-index: 200000;
          pointer-events: none; letter-spacing: 0.05em; text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .notification-bar.show { transform: translateX(-50%) translateY(0); opacity: 1; }
        
        /* Modal Overlay FIX */
        .ritual-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.92); backdrop-filter: blur(15px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 24px; overflow-y: auto; }
        .modal-content { width: 100%; max-width: 500px; padding: 40px; border: 1px solid rgba(212,160,23,0.2); border-radius: 24px; }
        .modal-title { font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 24px; text-align: center; }

        .btn-inquiry-link {
          background: none; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.5);
          padding: 10px 24px; border-radius: 100px; cursor: pointer; font-size: 0.9rem;
          font-family: var(--font-ui); transition: all 0.3s;
        }
        .btn-inquiry-link:hover { border-color: var(--primary-gold); color: var(--primary-gold); }

        .store-form { display: flex; flex-direction: column; gap: 14px; }
        .store-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px 16px; border-radius: 10px; font-size: 0.95rem; font-family: var(--font-ui); outline: none; transition: border-color 0.3s; }
        .store-input:focus { border-color: var(--primary-gold); }
        .store-textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 12px 16px; border-radius: 10px; font-size: 0.95rem; font-family: var(--font-ui); outline: none; resize: vertical; min-height: 100px; transition: border-color 0.3s; }
        .store-textarea:focus { border-color: var(--primary-gold); }

        @media (max-width: 768px) {
          .donate-page { padding: 60px 20px; }
          .donate-container { gap: 40px; }
          .tier-amount .value { font-size: 3rem; }
          .mode-btn { padding: 8px 16px; font-size: 0.8rem; }
        }
      `}</style>

      <div className={`notification-bar ${notification.show ? 'show' : ''}`}>
        {notification.message}
      </div>

      {/* ── Lotus Upgrade Modal ── */}
      {showUpgradeModal && (
        <div className="ritual-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content glass-card animate-fade-up text-center" onClick={e => e.stopPropagation()}>
            <div className="modal-inner" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', margin: '0 auto 16px' }}>🪷</div>
              <h2 className="modal-title">{tGuru('upgradeTitle')}</h2>
              <p style={{
                fontFamily: 'var(--font-serif)', fontSize: '1rem',
                color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '28px',
              }}>
                {tGuru('upgradeBody')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '12px', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <a
                  href={lemonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold-glow-v2"
                  style={{ flex: 1, padding: '10px 12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem', whiteSpace: 'nowrap', textAlign: 'center' }}
                >
                  🪷 {tGuru('buyLotus')}
                </a>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  style={{
                    flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '10px 12px', color: 'rgba(255,255,255,0.5)',
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

      {/* ── Payment Inquiry Modal ── */}
      {isInquiryModalOpen && (
        <div className="ritual-modal-overlay" onClick={() => setIsInquiryModalOpen(false)}>
          <div className="modal-content glass-card animate-fade-up" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--primary-gold)', fontFamily: 'var(--font-serif)' }}>
              {tDonate('inquiryModalTitle')}
            </h3>
            {inquiryStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: '#4CAF50', fontSize: '1.1rem', marginBottom: '16px' }}>{tDonate('inquirySuccess')}</p>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '24px' }}>{tDonate('inquirySuccessNote')}</p>
                <button className="btn-gold" onClick={() => setIsInquiryModalOpen(false)}>{tDonate('inquiryClose')}</button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="store-form">
                <p style={{ color: '#aaa', marginBottom: '8px', fontSize: '0.9rem' }}>{tDonate('inquiryDesc')}</p>
                <input
                  type="text" required
                  placeholder={tDonate('inquiryName')}
                  className="store-input"
                  value={inquiryFormData.name}
                  onChange={e => setInquiryFormData({ ...inquiryFormData, name: e.target.value })}
                />
                <input
                  type="email" required
                  placeholder={tDonate('inquiryEmail')}
                  className="store-input"
                  value={inquiryFormData.email}
                  onChange={e => setInquiryFormData({ ...inquiryFormData, email: e.target.value })}
                />
                <textarea
                  required
                  placeholder={tDonate('inquiryMessage')}
                  className="store-textarea"
                  value={inquiryFormData.message}
                  onChange={e => setInquiryFormData({ ...inquiryFormData, message: e.target.value })}
                />
                {inquiryStatus === 'error' && (
                  <p style={{ color: '#E53E3E', fontSize: '0.85rem' }}>{tDonate('inquiryError')}</p>
                )}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" className="btn-ghost" style={{ flex: 1, padding: '12px' }} onClick={() => setIsInquiryModalOpen(false)}>{tDonate('inquiryCancel')}</button>
                  <button type="submit" className="btn-gold" style={{ flex: 1, padding: '12px' }} disabled={inquiryStatus === 'submitting'}>
                    {inquiryStatus === 'submitting' ? '...' : tDonate('inquirySubmit')}
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
