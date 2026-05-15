import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return [
      {
        source: '/api/dashboard/:path*',
        destination: 'https://vendora-api-admin-bff.vercel.app/dashboard/:path*',
      },
      {
        source: '/api/products/:path*',
        destination: 'https://vendora-api-product-service.vercel.app/products/:path*',
      },
      {
        source: '/api/orders/:path*',
        destination: 'https://vendora-api-order-service.vercel.app/orders/:path*',
      },
      {
        source: '/api/stores/:path*',
        destination: 'https://vendora-api-store-service.vercel.app/stores/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'https://vendora-api-auth-service.vercel.app/auth/:path*',
      },
    ]
  },
}

export default nextConfig