'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── TikTok Video IDs (@buddha_miracle) ─────────────────────
const TIKTOK_VIDEOS = [
  { id: '7629342532014542098', label: 'Miracle #1' },
  { id: '7629655147815259400', label: 'Miracle #2' },
  { id: '7610752603353287954', label: 'Miracle #3' },
  { id: '7634842775787162888', label: 'Miracle #4' },
  { id: '7631873919154195719', label: 'Miracle #5' },
];

// ─── Quiesan Product Links (from index.html CONFIG) ──────────
const PRODUCTS = {
  omMani: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_CANDLE || 'https://quiesan.lemonsqueezy.com/checkout/buy/cb582bc9-e66c-4fef-a4cb-f3facee6f2a2',
  amulet: 'https://quiesan.lemonsqueezy.com/checkout/buy/06d7414e-eff9-4e2b-8922-532ae1925fe7',
  bundle: 'https://quiesan.lemonsqueezy.com/checkout/buy/4bc2b740-a0cb-4855-addb-f4278a00bd77',
};

// ─── Lotus Petal Packages (Temple of Light) ──────────────────
const LOTUS_TIERS = [
  {
    id: 'candle',
    icon: '🕯️',
    name: 'Candle',
    price: '$5',
    lotus: 54,
    desc: '54 Lotus Petals — one for each chapter of the Dhammapada.',
    url: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_CANDLE || '#',
  },
  {
    id: 'lotus',
    icon: '🪷',
    name: 'Lotus',
    price: '$25',
    lotus: 333,
    desc: '333 Lotus Petals — the number of steps on the sacred path.',
    badge: 'Most Popular',
    url: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_LOTUS || '#',
  },
  {
    id: 'mala',
    icon: '📿',
    name: 'Mala',
    price: '$108',
    lotus: 1080,
    desc: '1,080 Lotus Petals + your name eternally etched on the Supporter\'s Wall.',
    badge: 'Best Value',
    url: process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL_MALA || '#',
  },
];

// ─── VVIP Form Modal ─────────────────────────────────────────
function VVIPModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, type: 'VVIP' }),
      });
      setSubmitted(true);
    } catch {
      alert('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="store-modal-overlay" onClick={onClose}>
      <div className="store-modal-box" onClick={e => e.stopPropagation()}>
        <button className="store-modal-close" onClick={onClose}>✖</button>
        {submitted ? (
          <div className="store-success">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🙏</div>
            <h3>마음이 닿았습니다</h3>
            <p>Your inquiry has been received. We will reach out within 1–2 business days.</p>
          </div>
        ) : (
          <>
            <h3 className="store-modal-title">VVIP 1:1 Application</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', marginBottom: '24px' }}>
              Application required. Limited spots available each month.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                className="store-input"
                type="text" placeholder="Full Name" required
                value={name} onChange={e => setName(e.target.value)}
              />
              <input
                className="store-input"
                type="email" placeholder="Email Address" required
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <textarea
                className="store-input"
                placeholder="Tell us about yourself and what you seek…" rows={4} required
                value={message} onChange={e => setMessage(e.target.value)}
                style={{ resize: 'vertical' }}
              />
              <button type="submit" className="store-cta-btn" disabled={loading}>
                {loading ? 'Sending…' : 'Submit Application'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Store Page ──────────────────────────────────────────
export default function StorePage() {
  const [vvipOpen, setVvipOpen] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(2);
  const [followerCount, setFollowerCount] = useState('...');

  // Dynamic spots countdown (seeded by month, as in original)
  useEffect(() => {
    const now = new Date();
    const today = now.getUTCDate();
    const seed = now.getUTCFullYear() * 100 + (now.getUTCMonth() + 1);
    const sin = (s: number) => { const x = Math.sin(s) * 10000; return x - Math.floor(x); };
    const drop1 = Math.floor(sin(seed) * 10) + 3;
    const drop2 = Math.floor(sin(seed + 1) * 11) + 15;
    setSpotsLeft(today >= drop2 ? 1 : today >= drop1 ? 2 : 3);
  }, []);

  // GAS follower count (preserved from original index.html)
  useEffect(() => {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycby0kLrjrJjKnjMyJvyjzecSgocdN6_PXNp-LjgfGSnrE0xNSvYF_kA-bGsp4d0Ec5vH/exec';
    fetch(GAS_URL)
      .then(r => r.json())
      .then(d => { if (d.followerCount) setFollowerCount(d.followerCount); })
      .catch(() => setFollowerCount('400,000+'));
  }, []);

  return (
    <main className="store-page">
      {/* ── Background ── */}
      <div className="store-bg-glow" />

      {/* ══════════════════════════════════════
          SECTION 1: Hero + Social Proof
      ══════════════════════════════════════ */}
      <section className="store-section store-hero">
        <div className="store-hero-inner animate-fade-up">
          <p className="store-eyebrow">Quiesan × Temple of Light</p>
          <h1 className="store-hero-title">THE MASTER KEY</h1>
          <p className="store-hero-sub">Find Deep Stillness in 15 Minutes.</p>
          <p className="store-hero-desc">A guided 5Hz immersion designed for modern minds.</p>

          {/* YouTube embed */}
          <div className="store-video-wrap">
            <iframe
              src="https://www.youtube.com/embed/W_vibklRdqY?autoplay=1&mute=1&loop=1&playsinline=1&fs=0&playlist=W_vibklRdqY&rel=0&controls=0&modestbranding=1&disablekb=1"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{ border: 'none', width: '100%', height: '100%' }}
            />
          </div>

          <p className="store-caption">Experience a free sample above.</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2: Instant Access Products
      ══════════════════════════════════════ */}
      <section className="store-section" id="instant">
        <p className="store-social-proof">
          Over <span className="store-count">{followerCount}</span> souls have already entered.
        </p>
        <h2 className="store-section-title">Enter Now — Instant Access</h2>

        <div className="store-tier-wrap">

          {/* Om Mani — Most Chosen */}
          <div className="store-tier-card store-featured">
            <div className="store-badge" style={{ background: 'linear-gradient(135deg,#FFD700,#C0A062)', color: '#000', right: '-12px', left: 'auto', transform: 'none' }}>
              Most Chosen
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 className="store-tier-name">Om Mani 5Hz Experience</h3>
              <p className="store-tier-price">$11.11</p>
            </div>
            <ul className="store-tier-features">
              <li>🧘 5Hz Immersion for Deep Focus</li>
              <li>🖼️ High-Resolution Mandala Artwork</li>
              <li>📄 Activation &amp; Meditation Guide</li>
            </ul>
            <a
              href={PRODUCTS.omMani}
              target="_blank" rel="noopener noreferrer"
              className="store-cta-btn store-cta-gold"
            >
              Get Instant Access – $11.11
            </a>
            <p className="store-micro-note">Instant download. No subscription. One-time access.</p>
          </div>

          {/* Sacred Cosmic Amulet */}
          <div className="store-tier-card">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 className="store-tier-name">Sacred Cosmic Amulet</h3>
              <p className="store-tier-price">$11.11</p>
            </div>
            <ul className="store-tier-features">
              <li>📿 Digital Sacred Amulet</li>
              <li>🪐 Cosmic Symbol Pack</li>
              <li>📄 Usage Guide</li>
            </ul>
            <a
              href={PRODUCTS.amulet}
              target="_blank" rel="noopener noreferrer"
              className="store-cta-btn store-cta-outline"
            >
              Receive Amulet – $11.11
            </a>
          </div>

          {/* Complete Stillness Bundle */}
          <div className="store-tier-card store-bundle">
            <div className="store-badge" style={{ left: '-12px', right: 'auto', transform: 'none', background: '#FFD700', color: '#000' }}>
              Best Value
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 className="store-tier-name" style={{ color: '#FFD700' }}>Complete Stillness Bundle</h3>
              <p className="store-tier-price" style={{ color: '#FFD700', fontSize: '2rem' }}>$18.88</p>
              <p style={{ color: '#FFD700', fontSize: '0.85rem', margin: 0 }}>Save $3.34</p>
            </div>
            <ul className="store-tier-features">
              <li>✅ Om Mani 5Hz Experience</li>
              <li>✅ Sacred Cosmic Amulet</li>
              <li>💰 Special Bundle Price</li>
            </ul>
            <a
              href={PRODUCTS.bundle}
              target="_blank" rel="noopener noreferrer"
              className="store-cta-btn store-cta-gold"
            >
              Get Bundle – $18.88
            </a>
            <p className="store-micro-note">Limited early access pricing. Perfect for first-time buyers.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3: Philosophy
      ══════════════════════════════════════ */}
      <section className="store-section">
        <div className="store-content-box animate-fade-up">
          <h2 className="store-section-title">현대의 연금술</h2>
          <p className="store-content-p">
            본 서비스는 단순한 디지털 콘텐츠가 아닙니다. 수천 년의 불교적 지혜와 최첨단 신경 과학을 결합한
            &lsquo;무의식 정화 자산&rsquo;이자 &lsquo;현대의 연금술&rsquo;입니다.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4: Sound Design Science
      ══════════════════════════════════════ */}
      <section className="store-section">
        <div className="store-content-box animate-fade-up">
          <h2 className="store-section-title">사운드 디자인 철학</h2>
          <p className="store-content-p" style={{ marginBottom: '28px' }}>
            자연스러운 주파수 구성에서 영감을 받아 설계된 몰입형 오디오 경험으로, 집중과 고요를 위해 만들어졌습니다.
          </p>
          <div className="store-sci-grid">
            <div className="store-sci-item">
              <h3>구조화된 사운드 컴포지션</h3>
              <p>차분하고 집중된 마음 상태를 촉진하도록 설계된 오디오입니다.</p>
            </div>
            <div className="store-sci-item">
              <h3>성찰적 몰입</h3>
              <p>창의적 성찰을 지원하는 명상적 오디오 경험입니다.</p>
            </div>
            <div className="store-sci-item">
              <h3>조화 주파수 레이어</h3>
              <p>선택적 조화 컴포지션(432Hz, 528Hz)은 프리미엄 등급에서 제공됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5: Global Resonance — TikTok
      ══════════════════════════════════════ */}
      <section className="store-section">
        <div className="store-eyebrow-center">🌏 Global Resonance</div>
        <h2 className="store-section-title">Millions Touched by the Frequency</h2>
        <p className="store-content-p" style={{ marginBottom: '40px' }}>
          From Seoul to São Paulo, these moments of stillness have traveled across the world.
        </p>
        <div className="store-tiktok-grid">
          {TIKTOK_VIDEOS.map(v => (
            <div key={v.id} className="store-tiktok-embed">
              <blockquote
                className="tiktok-embed"
                cite={`https://www.tiktok.com/@buddha_miracle/video/${v.id}`}
                data-video-id={v.id}
                style={{ maxWidth: '325px', minWidth: '325px' }}
              >
                <section>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://www.tiktok.com/@buddha_miracle/video/${v.id}`}
                  >
                    @buddha_miracle
                  </a>
                </section>
              </blockquote>
            </div>
          ))}
        </div>
        <a
          href="https://www.tiktok.com/@buddha_miracle"
          target="_blank"
          rel="noopener noreferrer"
          className="store-tiktok-follow"
        >
          Follow @buddha_miracle on TikTok →
        </a>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6: Lotus Petal Packages
      ══════════════════════════════════════ */}
      <section className="store-section">
        <div className="store-eyebrow-center">Temple of Light</div>
        <h2 className="store-section-title">Lotus Petal Packages</h2>
        <p className="store-content-p" style={{ marginBottom: '40px' }}>
          Power your Guru AI conversations. Each lotus petal opens a new dialogue with ancient wisdom.
        </p>
        <div className="store-lotus-wrap">
          {LOTUS_TIERS.map(tier => (
            <div key={tier.id} className={`store-lotus-card ${tier.badge ? 'store-lotus-featured' : ''}`}>
              {tier.badge && <div className="store-badge store-lotus-badge">{tier.badge}</div>}
              <div className="store-lotus-icon">{tier.icon}</div>
              <h3 className="store-lotus-name">{tier.name}</h3>
              <p className="store-lotus-price">{tier.price}</p>
              <p className="store-lotus-count">🪷 × {tier.lotus.toLocaleString()}</p>
              <p className="store-lotus-desc">{tier.desc}</p>
              <a
                href={tier.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`store-cta-btn ${tier.badge === 'Most Popular' ? 'store-cta-gold' : 'store-cta-outline'}`}
              >
                {tier.id === 'mala' ? '📿 Offer a Mala' : `Get ${tier.lotus.toLocaleString()} Lotus`}
              </a>
              {tier.id === 'mala' && (
                <p className="store-micro-note" style={{ color: 'var(--primary-gold)' }}>
                  ✨ Includes permanent Supporter&apos;s Wall registration
                </p>
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/chat" className="store-link-subtle">
            Already have petals? → Go to Guru Chat
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 7: VVIP 1:1 Journey
      ══════════════════════════════════════ */}
      <section className="store-section" id="vvip">
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span className="store-redirect-q">Not ready for VIP?</span>{' '}
          <a
            href="#instant"
            onClick={e => { e.preventDefault(); document.getElementById('instant')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="store-redirect-a"
          >
            Start with Instant Access above.
          </a>
        </div>
        <h2 className="store-section-title">당신만을 위한 여정</h2>
        <div className="store-tier-wrap">
          {/* VVIP */}
          <div className="store-tier-card store-vvip-card">
            <div className="store-badge store-spots-badge">
              이달 허락된 인연은 단 <span className="store-spots-num">{spotsLeft}</span> 자리 남았습니다
            </div>
            <h3 className="store-tier-name" style={{ textAlign: 'center', marginBottom: '8px' }}>
              VVIP 1:1 퍼스널<br />THE MASTER KEY
            </h3>
            <p className="store-tier-price">$11,111</p>
            <ul className="store-tier-features">
              <li>1시간 11분 11초 개인별 맞춤 항해</li>
              <li>가이드가 포함된 상징적 시각화 세션</li>
              <li>맞춤 디자인된 몰입형 시각 명상 패턴</li>
              <li>선별된 조화 오디오 컴포지션(432Hz, 528Hz)</li>
              <li>개인화된 옴(Om) 기반 오디오 가이드</li>
              <li>개인 확언 오디오 레이어</li>
              <li>맞춤형 디지털 만달라 아트워크</li>
              <li>마스터 키가 담긴 프라이빗 메탈릭 USB &amp; 프리미엄 케이스</li>
            </ul>
            <button
              className="store-cta-btn store-cta-vvip"
              onClick={() => setVvipOpen(true)}
            >
              VVIP 프라이빗 여정 시작하기
            </button>
            <p className="store-micro-note">Application required.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 8: Return to Temple
      ══════════════════════════════════════ */}
      <section className="store-section" style={{ paddingBottom: '80px', textAlign: 'center' }}>
        <Link href="/" className="store-link-subtle" style={{ fontSize: '1rem' }}>
          ← Return to the Temple of Light
        </Link>
      </section>

      {/* ── VVIP Modal ── */}
      <VVIPModal isOpen={vvipOpen} onClose={() => setVvipOpen(false)} />

      {/* ── TikTok embed script ── */}
      <script async src="https://www.tiktok.com/embed.js" />

      {/* ── Floating CTA ── */}
      <button
        className="store-fab"
        onClick={() => document.getElementById('instant')?.scrollIntoView({ behavior: 'smooth' })}
        aria-label="Go to instant access"
      >
        ⚡
      </button>

      <style>{`
        .store-page {
          min-height: 100vh;
          background: #0a0a0a;
          padding-top: 80px;
          position: relative;
          overflow-x: hidden;
        }
        .store-bg-glow {
          position: fixed; inset: 0;
          background: radial-gradient(circle at 50% -20%, rgba(192,160,98,0.04) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .store-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 24px 40px;
          position: relative; z-index: 1;
          text-align: center;
        }
        .store-hero { padding-top: 60px; }
        .store-hero-inner { max-width: 800px; margin: 0 auto; }
        .store-eyebrow { font-size: 0.85rem; color: #C0A062; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 20px; }
        .store-eyebrow-center { font-size: 0.85rem; color: #C0A062; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 16px; }
        .store-hero-title { font-size: clamp(2.2rem, 6vw, 4rem); color: #C0A062; font-weight: 900; letter-spacing: 0.08em; margin-bottom: 16px; }
        .store-hero-sub { font-size: 1.2rem; color: #fff; margin-bottom: 8px; }
        .store-hero-desc { font-size: 0.9rem; color: #aaa; margin-bottom: 32px; }
        .store-video-wrap {
          width: 100%; max-width: 650px; aspect-ratio: 16/9; margin: 0 auto 16px;
          border: 1px solid rgba(192,160,98,0.4); border-radius: 10px; overflow: hidden;
          box-shadow: 0 0 30px rgba(192,160,98,0.2);
        }
        .store-caption { font-size: 0.82rem; color: #777; }

        .store-social-proof { color: #C0A062; font-weight: bold; margin-bottom: 8px; font-size: 0.95rem; }
        .store-count { color: #FFD700; font-weight: 900; font-size: 1.15em; text-shadow: 0 0 10px rgba(255,215,0,0.5); }
        .store-section-title { font-size: clamp(1.5rem, 4vw, 2.2rem); color: #C0A062; font-weight: 700; margin-bottom: 24px; letter-spacing: 0.05em; }

        /* Tier cards */
        .store-tier-wrap { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; margin-top: 40px; align-items: stretch; }
        .store-tier-card {
          background: #141414; border: 1px solid rgba(192,160,98,0.4);
          border-radius: 12px; padding: 40px 28px 28px;
          width: 100%; max-width: 360px;
          display: flex; flex-direction: column;
          position: relative; transition: transform 0.3s, box-shadow 0.3s;
        }
        .store-tier-card:hover { transform: translateY(-4px); box-shadow: 0 0 25px rgba(192,160,98,0.2); }
        .store-featured { transform: scale(1.04); box-shadow: 0 0 30px rgba(255,215,0,0.4); border: 2px solid #C0A062; }
        .store-featured:hover { transform: scale(1.04) translateY(-4px); }
        .store-bundle { border-color: #FFD700; }
        .store-vvip-card { background: #0f0c04; border-color: rgba(139,115,34,0.5); max-width: 500px; }
        .store-badge {
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
          background: #C0A062; color: #000; font-size: 0.78rem; font-weight: bold;
          padding: 6px 18px; border-radius: 20px; white-space: nowrap;
        }
        .store-spots-badge { background: rgba(139,115,34,0.6); color: #E0E0E0; border: 1px solid #8B7322; font-weight: normal; font-size: 0.82rem; }
        .store-spots-num { color: #FFD700; font-weight: 900; font-size: 1.1em; margin: 0 3px; }
        .store-tier-name { font-size: 1.1rem; color: #C0A062; font-weight: 700; margin-bottom: 6px; line-height: 1.4; }
        .store-tier-price { font-size: 2rem; color: #FFD700; font-weight: 900; margin-bottom: 16px; text-shadow: 0 0 15px rgba(255,215,0,0.3); }
        .store-tier-features { list-style: disc; padding-left: 20px; color: #ccc; line-height: 2.1; margin-bottom: 24px; font-size: 0.92rem; flex-grow: 1; text-align: left; }

        /* CTAs */
        .store-cta-btn {
          display: block; width: 100%; padding: 14px 20px; border-radius: 6px;
          font-size: 0.95rem; font-weight: bold; letter-spacing: 0.05em; cursor: pointer;
          text-decoration: none; text-align: center; border: none; margin-top: auto;
          transition: all 0.3s ease;
        }
        .store-cta-gold { background: linear-gradient(135deg,#FFD700,#C0A062); color: #000; box-shadow: 0 0 20px rgba(255,215,0,0.4); }
        .store-cta-gold:hover { filter: brightness(1.1); transform: scale(1.02); }
        .store-cta-outline { background: transparent; border: 1px solid #C0A062; color: #C0A062; }
        .store-cta-outline:hover { background: rgba(192,160,98,0.12); }
        .store-cta-vvip { background: #332A0F; color: #E0E0E0; border: 1px solid #8B7322; }
        .store-cta-vvip:hover { background: #4a3a10; }
        .store-micro-note { font-size: 0.78rem; color: #777; text-align: center; margin-top: 10px; margin-bottom: 0; }

        /* Content box */
        .store-content-box { border: 1px solid rgba(192,160,98,0.3); border-radius: 8px; padding: 40px; background: rgba(0,0,0,0.6); max-width: 800px; margin: 0 auto; }
        .store-content-p { color: #ccc; line-height: 1.8; font-size: 0.95rem; }

        /* Science grid */
        .store-sci-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 24px; text-align: left; }
        .store-sci-item { border: 1px solid rgba(192,160,98,0.3); border-radius: 6px; padding: 20px; }
        .store-sci-item h3 { font-size: 1rem; color: #C0A062; margin-bottom: 8px; }
        .store-sci-item p { font-size: 0.88rem; color: #999; margin: 0; }

        /* TikTok Grid */
        .store-tiktok-grid {
          display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;
          margin-bottom: 32px;
        }
        .store-tiktok-embed { flex-shrink: 0; }
        .store-tiktok-follow {
          display: inline-block; color: #C0A062; text-decoration: none; font-size: 0.9rem;
          border-bottom: 1px solid rgba(192,160,98,0.4); padding-bottom: 2px;
          transition: color 0.3s;
        }
        .store-tiktok-follow:hover { color: #FFD700; }

        /* Lotus packages */
        .store-lotus-wrap { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; margin-top: 32px; align-items: stretch; }
        .store-lotus-card {
          background: #141414; border: 1px solid rgba(192,160,98,0.3);
          border-radius: 12px; padding: 36px 24px 28px;
          width: 100%; max-width: 300px;
          display: flex; flex-direction: column; align-items: center;
          position: relative; transition: transform 0.3s, box-shadow 0.3s;
        }
        .store-lotus-card:hover { transform: translateY(-4px); box-shadow: 0 0 20px rgba(192,160,98,0.15); }
        .store-lotus-featured { border-color: #C0A062; box-shadow: 0 0 25px rgba(192,160,98,0.2); }
        .store-lotus-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #C0A062; color: #000; }
        .store-lotus-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .store-lotus-name { font-size: 1.2rem; color: #C0A062; font-weight: 700; margin-bottom: 4px; }
        .store-lotus-price { font-size: 2rem; color: #FFD700; font-weight: 900; margin-bottom: 8px; }
        .store-lotus-count { font-size: 1rem; color: #aaa; margin-bottom: 12px; }
        .store-lotus-desc { font-size: 0.82rem; color: #888; line-height: 1.6; text-align: center; margin-bottom: 20px; flex-grow: 1; }

        /* Navigation helpers */
        .store-redirect-q { font-size: 0.88rem; color: #777; }
        .store-redirect-a { font-size: 0.88rem; color: #C0A062; text-decoration: underline; cursor: pointer; }
        .store-link-subtle { color: #666; font-size: 0.85rem; text-decoration: none; transition: color 0.3s; }
        .store-link-subtle:hover { color: #C0A062; }

        /* Floating action button */
        .store-fab {
          position: fixed; top: 50%; right: 20px; transform: translateY(-50%);
          width: 60px; height: 60px; border-radius: 50%; border: none;
          background: linear-gradient(135deg,#FFD700,#C0A062);
          font-size: 1.5rem; cursor: pointer; z-index: 9000;
          box-shadow: 0 5px 20px rgba(192,160,98,0.5);
          transition: transform 0.3s ease;
        }
        .store-fab:hover { transform: translateY(-50%) scale(1.1); }

        /* Modal */
        .store-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.92);
          backdrop-filter: blur(8px); z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .store-modal-box {
          background: #141414; border: 1px solid rgba(192,160,98,0.5);
          border-radius: 12px; padding: 40px; width: 100%; max-width: 440px;
          position: relative;
        }
        .store-modal-close { position: absolute; top: 14px; right: 18px; background: none; border: none; color: #C0A062; font-size: 1.3rem; cursor: pointer; }
        .store-modal-title { color: #C0A062; text-align: center; margin-bottom: 8px; font-size: 1.2rem; }
        .store-input {
          width: 100%; padding: 14px; background: #000; color: #fff;
          border: 1px solid rgba(192,160,98,0.3); border-radius: 6px;
          font-family: inherit; font-size: 0.95rem; box-sizing: border-box;
        }
        .store-input:focus { outline: none; border-color: #C0A062; }
        .store-success { text-align: center; padding: 20px; }
        .store-success h3 { color: #C0A062; margin-bottom: 16px; }
        .store-success p { color: #aaa; line-height: 1.7; }

        @media (max-width: 768px) {
          .store-section { padding: 60px 16px 32px; }
          .store-tier-wrap, .store-lotus-wrap { flex-direction: column; align-items: center; }
          .store-featured { transform: none; }
          .store-featured:hover { transform: translateY(-4px); }
          .store-tiktok-grid { flex-direction: column; align-items: center; }
          .store-tiktok-embed { width: 100%; max-width: 325px; }
          .store-fab { right: 12px; width: 50px; height: 50px; font-size: 1.2rem; }
        }
      `}</style>
    </main>
  );
}
