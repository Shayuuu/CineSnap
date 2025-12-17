/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
    ],
    // Optimize image loading
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/manifest.json',
        destination: '/manifest',
      },
    ]
  },
  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['framer-motion', '@tsparticles/react'],
  },
}

module.exports = nextConfig

