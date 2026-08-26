// ============================================================
// navigation.ts — next-intl typed navigation helpers
// Usage: import { useRouter, usePathname, Link } from '@/i18n/navigation'
// ============================================================
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({ locales, defaultLocale });
