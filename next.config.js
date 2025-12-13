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
  },
  // Turbopack configuration (if needed)
  // Note: turbo.root is deprecated in Next.js 16
}

module.exports = nextConfig

