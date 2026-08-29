// Supported locales and default setting
export const locales = ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de', 'pt', 'ar', 'vi', 'th', 'id', 'my', 'km'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
