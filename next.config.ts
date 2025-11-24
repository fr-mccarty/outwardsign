import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ['pdfmake', '@foliojs-fork/fontkit', '@foliojs-fork/restructure'],
  // Disable dev overlay during tests (it blocks Playwright clicks)
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
