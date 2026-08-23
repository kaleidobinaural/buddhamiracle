export const runtime = 'edge';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  return (
    <main className="hero-section" id="main-content">
      {/* Background Particles/Glows */}
      <div className="hero-bg-glow" aria-hidden="true" />
      
      <div className="hero-container">
        {/* Animated Badge */}
        <div className="hero-badge animate-fade-up">
          <span className="badge-dot" />
          <span className="badge-text">{t('subtitle')}</span>
        </div>

        {/* Main Heading */}
        <h1 className="hero-title animate-fade-up animate-delay-100 text-gradient-gold-v2">
          {t('heroTitle')}
        </h1>

        {/* Hero Subtitle */}
        <p className="hero-subtitle animate-fade-up animate-delay-200">
          {t('heroSubtitle')}
        </p>

        {/* Secondary Navigation Cards */}
        <div className="hero-features animate-fade-up animate-delay-400">
          <Link href="/hall" className="feature-card glass-card feature-card-featured" id="card-hall">
            <div className="feature-icon-wrap">
              <div className="feature-icon">☸</div>
              <div className="feature-icon-glow" />
            </div>
            <div className="feature-content-wrap">
              <h3 className="feature-title">{t('cardHallTitle')}</h3>
              <p className="feature-desc">{t('cardHallDesc')}</p>
            </div>
            <div className="feature-card-arrow">→</div>
          </Link>

          <Link href="/chat" className="feature-card glass-card" id="card-chat">
            <div className="feature-icon-wrap">
              <div className="feature-icon">✉</div>
              <div className="feature-icon-glow" />
            </div>
            <h3 className="feature-title">{t('cardChatTitle')}</h3>
            <p className="feature-desc">{t('cardChatDesc')}</p>
            <div className="feature-card-arrow">→</div>
          </Link>

          <Link href="/wish-roof" className="feature-card glass-card" id="card-wish">
            <div className="feature-icon-wrap">
              <div className="feature-icon">🏛</div>
              <div className="feature-icon-glow" />
            </div>
            <h3 className="feature-title">{t('cardWishTitle')}</h3>
            <p className="feature-desc">{t('cardWishDesc')}</p>
            <div className="feature-card-arrow">→</div>
          </Link>

          <Link href="/pillars" className="feature-card glass-card" id="card-pillars">
            <div className="feature-icon-wrap">
              <div className="feature-icon">✨</div>
              <div className="feature-icon-glow" />
            </div>
            <h3 className="feature-title">{t('cardPillarsTitle')}</h3>
            <p className="feature-desc">{t('cardPillarsDesc')}</p>
            <div className="feature-card-arrow">→</div>
          </Link>

          <Link href="/dharma" className="feature-card glass-card" id="card-dharma">
            <div className="feature-icon-wrap">
              <div className="feature-icon">📖</div>
              <div className="feature-icon-glow" />
            </div>
            <h3 className="feature-title">{t('cardDharmaTitle')}</h3>
            <p className="feature-desc">{t('cardDharmaDesc')}</p>
            <div className="feature-card-arrow">→</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
