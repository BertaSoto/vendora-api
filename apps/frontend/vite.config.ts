import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/dashboard': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/dashboard/, '/dashboard'),
      },
      '/api/products': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/products/, '/products'),
      },
      '/api/orders': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/orders/, '/orders'),
      },
    },
  },
})
