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
};

export default withNextIntl(nextConfig);
