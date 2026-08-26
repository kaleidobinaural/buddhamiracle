import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
// next-pwa does not ship its own type declarations; cast via require avoids
// suppressing ALL type errors with @ts-ignore.
const withPWAInit = require('next-pwa') as (options: Record<string, unknown>) => (config: NextConfig) => NextConfig;

const withNextIntl = createNextIntlPlugin();

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // ★ SECURITY: Disable source maps in production to protect business logic
  productionBrowserSourceMaps: false,
  output: 'standalone',
  turbopack: {
    resolveAlias: {
      'next-intl': 'next-intl',
      'next-intl/server': 'next-intl/server'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(withPWA(nextConfig));
