import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ['pdfmake', '@foliojs-fork/fontkit', '@foliojs-fork/restructure'],
  // Disable dev overlay during tests (it blocks Playwright clicks)
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    remotePatterns: [
      {
        // Local Supabase storage (development)
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/**',
      },
      {
        // Supabase storage (production)
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
