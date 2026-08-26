import type { Metadata } from 'next';
import '@/app/globals.css';
import Navigation from '@/components/Navigation';
import NextAuthSessionProvider from '@/components/auth/SessionProvider';
import { NextIntlClientProvider } from 'next-intl';
import Link from 'next/link';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import CustomCursor from '@/components/CustomCursor';
import AmbientAudio from '@/components/AmbientAudio';

export const metadata: Metadata = {
  title: {
    default: 'Temple of Light | The Eternal Digital Sanctuary',
    template: '%s | Temple of Light',
  },
  description:
    'A premium digital sanctuary for peace, wisdom, and eternal legacy. Connect with Guru AI, leave your wishes in the starry sky, and etch your devotion into the Hall of Pillars.',
  keywords: ['digital temple', 'buddhism', 'meditation', 'sanctuary', 'mindfulness', 'guru chat', 'spiritual', 'digital legacy', 'wishes'],
  authors: [{ name: 'Temple of Light' }],
  openGraph: {
    title: 'Temple of Light | The Eternal Digital Sanctuary',
    description: 'Seek clarity, wisdom, and peace in our digital sanctuary. Inscribe your intentions upon the celestial canopy and support the eternal foundation.',
    type: 'website',
    siteName: 'Temple of Light',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Temple of Light Sanctuary',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temple of Light | The Eternal Digital Sanctuary',
    description: 'Seek clarity, wisdom, and peace in our premium digital sanctuary.',
    images: ['/og-image.jpg'],
  },
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure the locale is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Load messages for the provider
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <NextAuthSessionProvider>
            {/* Ambient Background Lighting */}
            <div className="ambient-bg" aria-hidden="true">
              <div className="animate-breathing">
                <div className="ambient-orb ambient-orb-1" />
                <div className="ambient-orb ambient-orb-2" />
                <div className="ambient-orb ambient-orb-3" />
              </div>
            </div>

            {/* Navigation */}
            <Navigation />

            {/* Custom Cursor */}
            <CustomCursor />

            {/* Ambient Audio */}
            <AmbientAudio />

            {/* Page Content */}
            <div className="page-wrap">
              {children}
            </div>

            {/* Global Footer for Legal Compliance */}
            <footer className="sanctuary-footer">
              <div className="footer-divider" />
              <div className="footer-content">
                <p className="copyright">&copy; {new Date().getFullYear()} Temple of Light. The Eternal Sanctuary.</p>
                <div className="legal-links">
                  <Link href="/terms" className="footer-link">Terms of Service</Link>
                  <span className="footer-dot">•</span>
                  <Link href="/privacy" className="footer-link">Privacy Policy</Link>
                </div>
              </div>
            </footer>
          </NextAuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );

}
