/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? (process.env.JOURNAL_BUILD_DIR || '.next-dev') : '.next',
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: '*.neon.tech' },
    ],
  },
}

module.exports = nextConfig
