/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/llm-usage',
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/llm-usage/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
        },
      ],
    }
  },
}

module.exports = nextConfig
