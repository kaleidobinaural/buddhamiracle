import createMiddleware from 'next-intl/middleware';
import { auth } from "./auth";
import { locales, defaultLocale } from './i18n/config';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default function middleware(req: NextRequest) {
  return intlMiddleware(req);
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - /static (static files)
  // - all files (e.g. favicon.ico, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

