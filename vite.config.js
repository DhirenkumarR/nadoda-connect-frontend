import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nadoda-connect-frontend/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://nadoda-connect-backend.onrender.com',
        changeOrigin: true
      }
    }
  }
})
