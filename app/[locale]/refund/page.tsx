import Link from 'next/link';

export const metadata = {
  title: 'Refund Policy – Temple of Light',
  description: 'Refund and return policy for Temple of Light and Quiesan digital products.',
};

export default function RefundPage() {
  return (
    <main className="privacy-page">
      <div className="privacy-bg-glow" aria-hidden="true" />

      <div className="privacy-container animate-fade-up">

        {/* Header */}
        <header className="privacy-header">
          <div className="privacy-eyebrow">Legal Document</div>
          <h1 className="privacy-title">Refund Policy</h1>
          <p className="privacy-updated">Last Updated: August 29, 2026</p>
        </header>

        {/* Sections */}
        <div className="privacy-sections">

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">1.</span> Overview</h2>
            <p className="section-body">
              All purchases made through Temple of Light and Quiesan — including Lotus Petal packages (Candle, Lotus, Mala),
              digital meditation art, and VVIP / Premium Commission services — are governed by this Refund Policy.
              Please read it carefully before completing your purchase.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">2.</span> Digital Products (Instant Download)</h2>
            <p className="section-body">
              Due to the nature of digital goods, <strong>all sales of instant-download products are final and non-refundable</strong>.
              This includes, but is not limited to:
            </p>
            <ul className="privacy-list">
              <li><strong>Om Mani 5Hz Meditation Experience</strong> (audio + Mandala art)</li>
              <li><strong>Sacred Cosmic Amulet</strong> (symbolic digital artwork)</li>
              <li><strong>The Complete Stillness Bundle</strong></li>
            </ul>
            <p className="section-body">
              Once a download link has been accessed or a file has been delivered, no refund can be issued.
              This policy is consistent with EU Consumer Rights Directive Article 16(m) and equivalent regulations worldwide
              for digital content delivered upon purchase.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">3.</span> Lotus Petal Packages (🕯️ Candle / 🪷 Lotus / 📿 Mala)</h2>
            <p className="section-body">
              Lotus Petals are a virtual in-app currency used to interact with the Guru AI and other sanctuary features.
              Once a Lotus Petal package is purchased and credits are applied to your account, <strong>the purchase is non-refundable</strong>.
            </p>
            <ul className="privacy-list">
              <li>🕯️ <strong>Candle ($5)</strong> — 54 Lotus Petals</li>
              <li>🪷 <strong>Lotus ($25)</strong> — 333 Lotus Petals</li>
              <li>📿 <strong>Mala ($108)</strong> — 1,080 Lotus Petals + Supporter&apos;s Wall Registration</li>
            </ul>
            <p className="section-body">
              If you experience a technical issue that prevented your Lotus Petals from being credited, please contact us
              within 7 days of purchase with your order confirmation. We will investigate and resolve legitimate technical failures.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">4.</span> VVIP Commission & Premium Collection</h2>
            <p className="section-body">
              VVIP 1:1 Commissions and Premium Collection memberships are personalized, bespoke services.
              Refund eligibility depends on the stage of the commission:
            </p>
            <ul className="privacy-list">
              <li><strong>Before work begins:</strong> Full refund available within 48 hours of application approval.</li>
              <li><strong>After initial session / consultation:</strong> A 50% refund may be offered at our discretion.</li>
              <li><strong>After final delivery:</strong> No refund is available once the commissioned work has been delivered.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">5.</span> PayPal Donations & Supporter Contributions</h2>
            <p className="section-body">
              Voluntary donations made via PayPal to support the Temple are <strong>gratitude-based and non-refundable</strong>.
              They represent an act of <em>dana</em> (the Buddhist virtue of generosity) and are used to sustain this sacred digital space.
              If you believe a donation was made in error, please contact us promptly and we will review on a case-by-case basis.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">6.</span> How to Contact Us</h2>
            <p className="section-body">
              For refund requests, technical issues, or any questions regarding a purchase, please contact us via email.
              Include your order number (from Lemon Squeezy or PayPal) and a description of the issue.
              We aim to respond within 2 business days.
            </p>
            <p className="section-body" style={{ marginTop: '16px' }}>
              We are committed to resolving all legitimate concerns with compassion and fairness.
            </p>
          </section>

        </div>

        {/* Footer */}
        <footer className="privacy-footer" style={{ marginTop: '56px', paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/" className="footer-return" style={{ fontSize: '0.88rem', color: '#666', transition: 'color 0.3s' }}>← Return to Sanctuary</Link>
        </footer>

      </div>

      <style>{`
        .privacy-page {
          min-height: 100vh;
          padding: 16px 24px 80px;
          background: #050505;
          position: relative;
          overflow-x: hidden;
        }

        .privacy-bg-glow {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 900px; height: 900px;
          background: radial-gradient(circle, rgba(212,160,23,0.05) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .privacy-container {
          max-width: 820px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .privacy-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .privacy-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--primary-gold);
          opacity: 0.7;
          margin-bottom: 8px;
        }

        .privacy-title {
          font-family: var(--font-serif);
          font-size: clamp(2.4rem, 6vw, 4rem);
          line-height: 1.25;
          margin-bottom: 16px;
          background: linear-gradient(180deg, #FFF6D9 0%, #D4A017 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
          padding-bottom: 0.18em;
          margin-bottom: calc(16px - 0.18em);
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
        }

        .privacy-updated {
          font-size: 0.85rem;
          color: #555;
          letter-spacing: 0.05em;
        }

        .privacy-sections {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .privacy-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 36px 40px;
          transition: border-color 0.4s;
        }

        .privacy-section:hover {
          border-color: rgba(212,160,23,0.2);
        }

        .section-heading {
          font-family: var(--font-serif);
          font-size: clamp(1.15rem, 2.5vw, 1.5rem);
          color: #d4a017;
          margin-bottom: 16px;
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .section-num {
          font-size: 0.8em;
          opacity: 0.45;
        }

        .section-body {
          font-size: 0.93rem;
          line-height: 1.9;
          color: #999;
          margin-bottom: 16px;
        }

        .section-body:last-child { margin-bottom: 0; }

        .privacy-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .privacy-list li {
          font-size: 0.9rem;
          line-height: 1.8;
          color: #888;
          padding-left: 22px;
          position: relative;
        }

        .privacy-list li::before {
          content: '☸';
          position: absolute;
          left: 0;
          color: #d4a017;
          opacity: 0.45;
          font-size: 0.65rem;
          top: 5px;
        }

        .privacy-list strong {
          color: #ccc;
          font-weight: 600;
        }

        .privacy-footer {
          margin-top: 56px;
          padding-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .footer-return {
          font-size: 0.88rem;
          color: #666;
          transition: color 0.3s;
        }

        .footer-return:hover { color: #d4a017; }

        @media (max-width: 640px) {
          .privacy-section { padding: 24px 20px; }
          .privacy-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </main>
  );
}
