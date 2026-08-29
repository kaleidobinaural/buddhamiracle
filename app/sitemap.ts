import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://buddhamiracle.com';
  const locales = ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de', 'pt', 'ar', 'vi', 'th', 'id', 'my', 'km'];
  const routes = ['', '/chat', '/wish-roof', '/pillars', '/donate', '/store', '/resonance', '/dharma', '/hall'];
  const staticRoutes = ['/privacy', '/terms', '/refund'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
      });
    });
    staticRoutes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      });
    });
  });

  return sitemapEntries;
}
