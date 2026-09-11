'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetAllScroll = () => {
      // 1. Reset standard window & document
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }

      // 2. CRITICAL: Reset .page-wrap (which has overflow-y: auto in globals.css)
      const pageWrap = document.querySelector('.page-wrap');
      if (pageWrap) {
        pageWrap.scrollTop = 0;
        if (typeof pageWrap.scrollTo === 'function') {
          pageWrap.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }

      // 3. Reset any other scrolling containers
      const scrollables = document.querySelectorAll(
        '.page-wrap, main, .pillars-page, .wish-page, .sacred-sky-scroll-area, .sacred-hall-scroll-area, [data-scroll-container]'
      );
      scrollables.forEach((el) => {
        el.scrollTop = 0;
      });
    };

    // Immediate reset
    resetAllScroll();

    // Next frame (after React reconciliation / DOM repaint)
    const rafId = requestAnimationFrame(resetAllScroll);

    // Short timeouts (after async page mounts & layout shifts)
    const timer1 = setTimeout(resetAllScroll, 50);
    const timer2 = setTimeout(resetAllScroll, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  return null;
}
