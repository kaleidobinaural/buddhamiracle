import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <div className="privacy-bg-glow" aria-hidden="true" />

      <div className="privacy-container">

        {/* Header */}
        <header className="privacy-header">
          <div className="privacy-eyebrow">Legal Document</div>
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-updated">Last Updated: May 9, 2026</p>
        </header>

        {/* Sections */}
        <div className="privacy-sections">

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">1.</span> Introduction</h2>
            <p className="section-body">
              The Temple of Light (&quot;we&quot;, &quot;our&quot;, or &quot;the Sanctuary&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your information when you visit our digital sanctuary.
              We strictly comply with global privacy laws including the General Data Protection Regulation (GDPR),
              the California Consumer Privacy Act (CCPA), and the Personal Information Protection Act (PIPA) of South Korea.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">2.</span> Information We Collect</h2>
            <p className="section-body">We only collect information strictly necessary to provide our spiritual services:</p>
            <ul className="privacy-list">
              <li><strong>Authentication Data:</strong> Your name and email address provided via Google OAuth.</li>
              <li><strong>Sanctuary Content:</strong> The text of your Wishes, Pillar dedications, and chat interactions with the Guru AI.</li>
              <li><strong>Offering Amount:</strong> Records of your contributions (if applicable) to sustain the temple.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">3.</span> How We Use Your Information</h2>
            <p className="section-body">Your data is used solely to maintain your personal experience within the Sanctuary:</p>
            <ul className="privacy-list">
              <li>To identify your offerings (Wishes and Pillars) so you can manage them.</li>
              <li>To provide personalized responses via the Guru AI.</li>
              <li>To display &quot;Public&quot; offerings to other seekers as per your choice.</li>
              <li><strong>Data Security &amp; Confidentiality:</strong> Your confessions are kept strictly confidential. We do not sell, trade, or share your data with third parties or marketing agencies.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">4.</span> Data Storage and Retention</h2>
            <p className="section-body">
              We use industry-standard encryption and secure cloud infrastructure to store your data.{' '}
              <strong className="highlight-gold">All personal information and private messages will be securely stored and completely
              destroyed 1 year after the date of collection</strong>, unless you exercise your right to delete them earlier.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">5.</span> Your Rights (GDPR/CCPA/PIPA)</h2>
            <p className="section-body">You have the following rights regarding your data:</p>
            <ul className="privacy-list">
              <li><strong>Right to Access &amp; Correction:</strong> You can view all your data and edit public dedications in your Profile page.</li>
              <li><strong>Right to Erasure (Right to be Forgotten):</strong> You can delete your account and all associated data instantly through your Profile settings.</li>
              <li><strong>Right to Portability:</strong> You can request a copy of your data in a machine-readable format.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">6.</span> Analytics &amp; Cookies</h2>
            <p className="section-body">
              We use essential session cookies strictly for authentication purposes. Additionally, we may use Google Analytics (GA4)
              to analyze anonymous website traffic and improve the Sanctuary experience.{' '}
              <strong className="highlight-gold">No personally identifiable tracking is conducted.</strong>
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="section-heading"><span className="section-num">7.</span> Contact Us</h2>
            <p className="section-body">
              If you have any questions about this Privacy Policy or wish to exercise your rights,
              please contact the Temple Administrators at:
            </p>
            <a href="mailto:KaleidoBinaural@proton.me" className="contact-email">
              KaleidoBinaural@proton.me
            </a>
          </section>

        </div>

        {/* Footer */}
        <footer className="privacy-footer">
          <Link href="/" className="footer-return">← Return to Sanctuary</Link>
        </footer>
      </div>

      <style>{`
        .privacy-page {
          min-height: 100vh;
          padding: calc(var(--nav-height) + 48px) 24px 80px;
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
          margin-bottom: 56px;
        }

        .privacy-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--primary-gold);
          opacity: 0.7;
          margin-bottom: 16px;
        }

        .privacy-title {
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

        .highlight-gold {
          color: #d4a017;
          font-weight: 600;
        }

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

        .contact-email {
          display: inline-block;
          margin-top: 14px;
          font-family: monospace;
          font-size: 0.95rem;
          color: #d4a017;
          border-bottom: 1px solid rgba(212,160,23,0.3);
          padding-bottom: 2px;
          transition: all 0.3s;
        }

        .contact-email:hover {
          color: #fff6d9;
          border-color: #d4a017;
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

        .footer-copy {
          font-size: 0.75rem;
          color: #333;
        }

        @media (max-width: 640px) {
          .privacy-section { padding: 24px 20px; }
          .privacy-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </main>
  );
}
