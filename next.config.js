/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["zmiqsuhmxfiqlidudywz.supabase.co", "images.unsplash.com"],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: false,
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ["react", "react-dom", "@supabase/supabase-js"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
