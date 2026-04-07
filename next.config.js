/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.bio-spring.top/api/v1/:path*',
      },
    ]
  },
}

module.exports = nextConfig
