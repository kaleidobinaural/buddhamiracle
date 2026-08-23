export const runtime = 'edge';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="terms-page">
      <div className="terms-bg-glow" aria-hidden="true" />

      <div className="terms-container animate-fade-up">

        {/* Header */}
        <header className="terms-header">
          <div className="terms-eyebrow">Legal Document</div>
          <h1 className="terms-title">Terms of Service</h1>
          <p className="terms-updated">Last Updated: April 2026</p>
        </header>

        {/* Sections */}
        <div className="terms-sections">

          <section className="terms-section">
            <h2 className="section-heading"><span className="section-num">1.</span> Acceptance of Terms</h2>
            <p className="section-body">
              By accessing and using the Temple of Light (the &quot;Sanctuary&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Sanctuary.
              Your continued use of the platform signifies your acceptance of any future updates to these terms.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="section-heading"><span className="section-num">2.</span> Digital Offerings &amp; Donations</h2>
            <p className="section-body">
              All offerings, including &quot;Soul Points&quot;, &quot;Wishes&quot;, and &quot;Pillars&quot;, are digital symbolic representations of your devotion.
              Payments made to the Temple of Light are considered voluntary donations to support the maintenance of the digital sanctuary
              and are non-refundable.
            </p>
            <ul className="terms-list">
              <li>Donations do not grant ownership of any part of the platform.</li>
              <li>Virtual items have no real-world monetary value outside the Sanctuary.</li>
              <li>The Sanctuary reserves the right to adjust virtual point values and tier requirements.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2 className="section-heading"><span className="section-num">3.</span> User Conduct</h2>
            <p className="section-body">
              The Temple of Light is a place of peace. You agree not to post any wishes, messages, or names that are
              offensive, discriminatory, hateful, or disruptive to the harmony of the Sanctuary.
            </p>
            <p className="section-body">
              The Keepers of the Temple reserve the right to remove any content that violates this sacred principle without notice or refund.
              Accounts found repeatedly violating these rules may be permanently restricted.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="section-heading"><span className="section-num">4.</span> Impermanence</h2>
            <p className="section-body">
              While we strive to maintain the &quot;Eternal Foundation&quot; indefinitely, the nature of all digital things is impermanence.
              We do not guarantee uninterrupted access to the Sanctuary and are not liable for data loss due to technical failures
              beyond our reasonable control.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="section-heading"><span className="section-num">5.</span> Intellectual Property</h2>
            <p className="section-body">
              All visual designs, code, Guru AI models, and ambient soundscapes are the intellectual property of the Temple of Light.
              Users may not replicate or commercially exploit any part of the Sanctuary without explicit written permission.
            </p>
          </section>

        </div>

        {/* Footer */}
        <footer className="terms-footer">
          <Link href="/" className="footer-return">← Return to Sanctuary</Link>
          <p className="footer-copy">© 2026 Temple of Light. All Rights Reserved.</p>
        </footer>
      </div>

      <style>{`
        .terms-page {
          min-height: 100vh;
          padding: calc(var(--nav-height) + 48px) 24px 80px;
          background: #050505;
          position: relative;
          overflow-x: hidden;
        }

        .terms-bg-glow {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 900px; height: 900px;
          background: radial-gradient(circle, rgba(212,160,23,0.05) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .terms-container {
          max-width: 820px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .terms-header {
          text-align: center;
          margin-bottom: 56px;
        }

        .terms-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--primary-gold);
          opacity: 0.7;
          margin-bottom: 16px;
        }

        .terms-title {
          font-family: var(--font-serif);
          font-size: clamp(2.4rem, 6vw, 4rem);
          line-height: 1.2;
          margin-bottom: 16px;
          background: linear-gradient(180deg, #FFF6D9 0%, #D4A017 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
        }

        .terms-updated {
          font-size: 0.85rem;
          color: #555;
          letter-spacing: 0.05em;
        }

        .terms-sections {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .terms-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 36px 40px;
          transition: border-color 0.4s;
        }

        .terms-section:hover {
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

        .terms-list {
          list-style: none;
          padding: 0;
          margin: 16px 0 0 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .terms-list li {
          font-size: 0.9rem;
          line-height: 1.8;
          color: #888;
          padding-left: 22px;
          position: relative;
        }

        .terms-list li::before {
          content: '☸';
          position: absolute;
          left: 0;
          color: #d4a017;
          opacity: 0.45;
          font-size: 0.65rem;
          top: 5px;
        }

        .terms-list strong {
          color: #ccc;
          font-weight: 600;
        }

        .terms-footer {
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

        .footer-copy {
          font-size: 0.75rem;
          color: #333;
        }

        @media (max-width: 640px) {
          .terms-section { padding: 24px 20px; }
          .terms-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </main>
  );
}
