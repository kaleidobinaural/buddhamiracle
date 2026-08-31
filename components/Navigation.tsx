'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { useSession, signOut } from "next-auth/react";
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Nav');
  const locale = useLocale();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lotusCount, setLotusCount] = useState<number | null>(null);

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === 'admin' ||
    (session?.user?.email ? adminEmails.includes(session.user.email) : false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch lotus count
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', key: 'home' },
    { href: '/chat', key: 'chat' },
    { href: '/pillars', key: 'pillars' },
    { href: '/wish-roof', key: 'wishRoof' },
    { href: '/hall', key: 'hall' },
    { href: '/dharma', key: 'dharma' },
    { href: '/store', key: 'store' },
    { href: '/resonance', key: 'resonance' },
  ];

  return (
    <>
      <nav className={`glass-nav${scrolled ? ' scrolled' : ''}`} role="navigation">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <span className="nav-logo-icon">☸</span>
            <span className="nav-logo-text">Temple of Light</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href as any} 
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          {/* Nav Actions */}
          <div className="nav-actions">
            {/* Language Switcher */}
            <div className="locale-switcher">
              <select
                className="btn-ghost locale-btn"
                value={locale}
                onChange={(e) => {
                  const nextLocale = e.target.value;
                  const pathWithoutLocale = pathname.replace(/^\/(en|ko|ja|zh|es|fr|de|pt|ar|vi|th|id|my|km)(\/|$)/, '/') || '/';
                  router.replace(pathWithoutLocale, { locale: nextLocale });
                }}
                style={{ appearance: 'auto', cursor: 'pointer', paddingRight: '12px' }}
              >
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="pt">Português</option>
                <option value="ar">العربية</option>
                <option value="vi">Tiếng Việt</option>
                <option value="th">ไทย</option>
                <option value="id">Indonesia</option>
                <option value="my">မြန်မာ</option>
                <option value="km">ខ្មែរ</option>
              </select>
            </div>

            {session?.user && lotusCount !== null && (
              <div className="nav-lotus-count" title="Your Lotus Petals" style={{ 
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px', 
                padding: '6px 12px', background: 'rgba(212,160,23,0.1)', 
                border: '1px solid rgba(212,160,23,0.2)', borderRadius: '20px',
                color: 'var(--primary-gold)', fontSize: '0.85rem', fontWeight: 600,
                whiteSpace: 'nowrap'
              }}>
                <span>🪷</span>
                <span>{lotusCount}</span>
              </div>
            )}

            <Link href="/donate" className="btn-gold" id="nav-donate-btn">
              <span>♡ {t('donate')}</span>
            </Link>

            {session?.user ? (
              <div className="profile-menu-wrap">
                <button className="auth-avatar-btn">
                  {session.user.image ? (
                    <Image src={session.user.image} alt="User" width={32} height={32} className="rounded-full" />
                  ) : (
                    <span className="fallback-avatar">{session.user.name?.charAt(0) || "U"}</span>
                  )}
                </button>
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="user-name">{session.user.name}</p>
                    <p className="user-email">{session.user.email}</p>
                  </div>
                  <Link href="/profile" className="dropdown-item">
                    {t('mySanctuary')}
                  </Link>
                  <Link href="/privacy" className="dropdown-item" style={{ color: '#888' }}>
                    {t('privacyPolicy')}
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="dropdown-item dropdown-item-admin">
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <button onClick={() => signOut({ callbackUrl: `/${locale}` })} className="dropdown-item">
                    {t('signOut')}
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-ghost sign-in-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </Link>
            )}

            {/* Hamburger Button */}
            <button
              className={`hamburger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <div className="hamburger-box">
                <div className="hamburger-inner" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Lotus Bloom Style */}
        <nav className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
          <div className="mobile-nav-inner">
            <div className="mobile-nav-links">
              {navLinks.map((link, i) => (
                <Link 
                  key={link.href} 
                  href={link.href as any} 
                  className={`mobile-nav-link bloom-${i + 1}`} 
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.key)}
                </Link>
              ))}
              <Link href="/donate" className="mobile-nav-link bloom-7" onClick={() => setMobileOpen(false)}>
                {t('donate')}
              </Link>
              {!session?.user && (
                <Link href="/login" className="mobile-nav-link bloom-8" style={{ color: 'var(--primary-gold)', fontStyle: 'italic' }} onClick={() => setMobileOpen(false)}>
                  {t('signIn')}
                </Link>
              )}
              <Link href="/privacy" className="mobile-nav-link bloom-9" style={{ fontSize: '1.1rem', marginTop: '12px', color: '#666' }} onClick={() => setMobileOpen(false)}>
                {t('privacyPolicy')}
              </Link>
              {/* Language switcher — hidden from top bar on mobile, available here */}
              <select
                className="mobile-nav-link bloom-9"
                style={{ fontSize: '1rem', color: '#555', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px', appearance: 'auto', paddingLeft: '0' }}
                value={locale}
                onChange={(e) => {
                  const nextLocale = e.target.value;
                  const pathWithoutLocale = pathname.replace(/^\/(en|ko|ja|zh|es|fr|de|pt|ar|vi|th|id|my|km)(\/|$)/, '/') || '/';
                  router.replace(pathWithoutLocale, { locale: nextLocale });
                  setMobileOpen(false);
                }}
              >
                <option value="en">🌐 English</option>
                <option value="ko">🌐 한국어</option>
                <option value="ja">🌐 日本語</option>
                <option value="zh">🌐 中文</option>
                <option value="es">🌐 Español</option>
                <option value="fr">🌐 Français</option>
                <option value="de">🌐 Deutsch</option>
                <option value="pt">🌐 Português</option>
                <option value="ar">🌐 العربية</option>
                <option value="vi">🌐 Tiếng Việt</option>
                <option value="th">🌐 ไทย</option>
                <option value="id">🌐 Bahasa Indonesia</option>
                <option value="my">🌐 မြန်မာ</option>
                <option value="km">🌐 ខ្មែរ</option>
              </select>
            </div>
          </div>
        </nav>
      </nav>

    </>
  );
}
