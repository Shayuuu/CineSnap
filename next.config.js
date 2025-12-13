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
  // Fix workspace root warning for Turbopack
  experimental: {
    turbo: {
      root: path.resolve(__dirname),
    },
  },
}

module.exports = nextConfig

