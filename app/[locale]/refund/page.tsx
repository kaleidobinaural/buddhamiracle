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

        {/* Footer Nav */}
        <footer className="privacy-footer">
          <Link href="/privacy" className="privacy-link">Privacy Policy</Link>
          <span className="privacy-sep">·</span>
          <Link href="/terms" className="privacy-link">Terms of Service</Link>
          <span className="privacy-sep">·</span>
          <Link href="/refund" className="privacy-link" style={{ color: 'var(--primary-gold)' }}>Refund Policy</Link>
          <span className="privacy-sep">·</span>
          <Link href="/" className="privacy-link">← Return to Temple</Link>
        </footer>

      </div>
    </main>
  );
}
