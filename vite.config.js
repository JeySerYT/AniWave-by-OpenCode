import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-animation': ['framer-motion'],
          'vendor-player': ['hls.js'],
          'vendor-icons': ['lucide-react'],
        }
      }
    }
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://www.anilibria.top',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['access-control-allow-origin'] = 'http://localhost:5173';
          });
        },
      },
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
})
