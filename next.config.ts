import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import fs from 'fs';
import path from 'path';

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

function getGitCommitHash(): string {
  // 1. Vercel deployment environment variable
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  // 2. Read from local .git HEAD ref
  try {
    const gitHeadPath = path.resolve(process.cwd(), '.git/HEAD');
    if (fs.existsSync(gitHeadPath)) {
      const headContent = fs.readFileSync(gitHeadPath, 'utf8').trim();
      if (headContent.startsWith('ref: ')) {
        const refRelative = headContent.slice(5).trim();
        const refPath = path.resolve(process.cwd(), '.git', refRelative);
        if (fs.existsSync(refPath)) {
          return fs.readFileSync(refPath, 'utf8').trim().slice(0, 7);
        }
        const packedRefsPath = path.resolve(process.cwd(), '.git/packed-refs');
        if (fs.existsSync(packedRefsPath)) {
          const lines = fs.readFileSync(packedRefsPath, 'utf8').split('\n');
          for (const line of lines) {
            if (line.includes(refRelative)) {
              return line.split(' ')[0].trim().slice(0, 7);
            }
          }
        }
      } else {
        return headContent.slice(0, 7);
      }
    }
  } catch {}
  return 'dev';
}

const buildId = getGitCommitHash();
const now = new Date();
const buildTime = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} UTC`;

const nextConfig: NextConfig = {
  // ★ SECURITY: Disable source maps in production to protect business logic
  productionBrowserSourceMaps: false,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
    NEXT_PUBLIC_APP_VERSION: '0.1.0',
  },
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
