// Supported locales and default setting
export const locales = ['en', 'ko', 'ja', 'zh', 'es', 'fr'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
