import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BASE = '/nadoda-connect-frontend/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dev-base-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '/'
          // If request is not already prefixed with BASE, and not internal assets or api
          if (
            !url.startsWith(BASE) &&
            !url.startsWith('/api') &&
            !url.startsWith('/@') &&
            !url.startsWith('/src') &&
            !url.startsWith('/node_modules')
          ) {
            const clean = url.replace(/^\/+/, '')
            res.writeHead(302, { Location: `${BASE}${clean}` })
            return res.end()
          }
          next()
        })
      }
    }
  ],
  base: BASE,
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
