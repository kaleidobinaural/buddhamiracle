import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async (params: any) => {
  // Support both explicit locale and Next.js 15 requestLocale Promise
  let currentLocale = params.locale;
  if (!currentLocale && params.requestLocale) {
    currentLocale = await params.requestLocale;
  }
  if (!currentLocale || !locales.includes(currentLocale as any)) {
    currentLocale = defaultLocale;
  }

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default
  };
});
