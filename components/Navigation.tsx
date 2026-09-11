'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { useSession, signOut, signIn } from "next-auth/react";
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
  const [showLoginModal, setShowLoginModal] = useState(false);

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === 'admin' ||
    (session?.user?.email ? adminEmails.includes(session.user.email) : false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch lotus count & listen for live updates
  useEffect(() => {
    const fetchCount = () => {
      if (session?.user) {
        fetch('/api/user/lotus')
          .then(res => res.json())
          .then(data => {
            if (typeof data.lotus_count === 'number') setLotusCount(data.lotus_count);
          })
          .catch(() => {});
      }
    };

    fetchCount();

    const handleLotusUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ lotus_count?: number }>;
      if (typeof customEvent.detail?.lotus_count === 'number') {
        setLotusCount(customEvent.detail.lotus_count);
      } else {
        fetchCount();
      }
    };

    window.addEventListener('lotus-updated', handleLotusUpdate);
    const handleFocus = () => fetchCount();
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (!document.hidden) fetchCount();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('lotus-updated', handleLotusUpdate);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [session]);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Sync mobile-nav-open class on body to hide floating audio button & lock body scroll
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('mobile-nav-open');
      document.body.style.overflow = 'hidden';
      // Auto pause ambient audio when mobile drawer opens
      if (isAudioPlaying) {
        window.dispatchEvent(new CustomEvent('toggle-ambient-audio'));
      }
    } else {
      document.body.classList.remove('mobile-nav-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('mobile-nav-open');
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Listen to ambient audio state
  useEffect(() => {
    const handleAudioChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isPlaying: boolean }>;
      if (typeof customEvent.detail?.isPlaying === 'boolean') {
        setIsAudioPlaying(customEvent.detail.isPlaying);
      }
    };
    window.addEventListener('ambient-audio-changed', handleAudioChange);
    return () => window.removeEventListener('ambient-audio-changed', handleAudioChange);
  }, []);

  // Dispatch event when mobile menu opens so CharacterAvatar can auto-dismiss
  const handleMobileMenuToggle = (open: boolean) => {
    setMobileOpen(open);
    if (open) {
      window.dispatchEvent(new CustomEvent('mobile-menu-opened'));
    }
  };

  const navLinks = [
    { href: '/', key: 'home' },
    { href: '/chat', key: 'chat' },
    { href: '/pillars', key: 'pillars' },
    { href: '/wish-roof', key: 'wishRoof' },
    { href: '/hall', key: 'hall' },
    { href: '/dharma', key: 'dharma' },
    { href: '/resonance', key: 'resonance' },
    { href: '/store', key: 'store' },
  ];

  // Mobile nav includes ALL links including home
  const mobileNavLinks = navLinks;

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
                  document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
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

            <button
              className="btn-gold"
              id="nav-donate-btn"
              onClick={() => {
                if (!session?.user) { setShowLoginModal(true); return; }
                router.push('/donate');
              }}
            >
              <span>♡ {t('donate')}</span>
            </button>

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
              onClick={() => handleMobileMenuToggle(!mobileOpen)}
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
              {mobileNavLinks.map((link, i) => (
                <Link 
                  key={link.href} 
                  href={link.href as any} 
                  className={`mobile-nav-link bloom-${i + 1}`} 
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.key)}
                </Link>
              ))}
              {/* Auth-gated donate in mobile nav */}
              <button
                className="mobile-nav-link bloom-8"
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: 0 }}
                onClick={() => {
                  setMobileOpen(false);
                  if (!session?.user) { setShowLoginModal(true); return; }
                  router.push('/donate');
                }}
              >
                {t('donate')}
              </button>
              {!session?.user && (
                <Link href="/login" className="mobile-nav-link bloom-9" style={{ color: 'var(--primary-gold)', fontStyle: 'italic' }} onClick={() => setMobileOpen(false)}>
                  {t('signIn')}
                </Link>
              )}
              {/* Language switcher — hidden from top bar on mobile, available here */}
              <select
                className="mobile-nav-link bloom-9"
                style={{ fontSize: '1rem', color: '#555', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px', appearance: 'auto', paddingLeft: '0' }}
                value={locale}
                onChange={(e) => {
                  const nextLocale = e.target.value;
                  document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
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

      {/* Sacred Login Modal — Navigation */}
      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(18px)',
            zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg,#12100e,#1a1510)',
              border: '1px solid rgba(212,160,23,0.25)',
              borderRadius: '24px',
              padding: '44px 36px 36px',
              maxWidth: '360px', width: '90%',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7),0 0 80px rgba(212,160,23,0.08)',
            }}
          >
            <button
              onClick={() => setShowLoginModal(false)}
              aria-label="Close"
              style={{
                position: 'absolute', top: '12px', right: '16px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem',
                lineHeight: 1, padding: '8px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >✕</button>
            <span style={{ fontSize: '3.5rem', marginBottom: '16px', display: 'block' }}>🐚</span>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.6rem',
              background: 'linear-gradient(135deg,#FFD700,#D4A017)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '12px'
            }}>
              로그인이 필요합니다
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: '28px' }}>
              공양을 올리려면 먼저 신성한 사원에 입장해 주세요.
            </p>
            <div style={{ height: '1px', background: 'linear-gradient(to right,transparent,rgba(212,160,23,0.25),transparent)', marginBottom: '28px' }} />
            <button
              onClick={() => { setShowLoginModal(false); signIn('google'); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', width: '100%', padding: '16px 24px',
                background: 'linear-gradient(135deg,#D4A017,#FFD700)',
                color: '#1a1200', fontWeight: 700, fontSize: '1rem',
                border: 'none', borderRadius: '14px', cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(212,160,23,0.35)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span>✨</span>
              <span>구글로 로그인하기</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
