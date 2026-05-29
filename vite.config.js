import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
