import type { NextConfig } from 'next'
import path from 'path'

const isDev = process.env.NODE_ENV !== 'production'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  async rewrites() {
    if (!isDev) return []

    return [
      {
        source: '/api/dashboard/:path*',
        destination: 'http://localhost:3000/dashboard/:path*',
      },
      {
        source: '/api/products/:path*',
        destination: 'http://localhost:3001/products/:path*',
      },
      {
        source: '/api/orders/:path*',
        destination: 'http://localhost:3002/orders/:path*',
      },
      {
        source: '/api/stores/:path*',
        destination: 'http://localhost:3003/stores/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:3004/auth/:path*',
      },
    ]
  },
}

export default nextConfig
