import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Fallback to defaultLocale if the incoming locale is undefined
  const currentLocale = locale || defaultLocale;
  
  console.log('REQUEST CONFIG FOR LOCALE:', currentLocale, '(original:', locale, ')');
  
  // Validate that the locale is valid
  if (!locales.includes(currentLocale as any)) {
    console.log('LOCALE VALIDATION FAILED:', currentLocale);
    notFound();
  }

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default
  };
});
