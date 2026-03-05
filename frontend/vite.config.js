import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ mode }) => {
  const rootDir = fileURLToPath(new URL('.', import.meta.url))
  const env = loadEnv(mode, rootDir, '')
  const backendTarget = env.VITE_BACKEND_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/auth': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/products': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/cart': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/orders': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/coupons': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/wishlist': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/activity-logs': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/contact': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/config': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/reviews': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/health': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/status': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/media': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4173,
      host: true,
    },
  }
})
