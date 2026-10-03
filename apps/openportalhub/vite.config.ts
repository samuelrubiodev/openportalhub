import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { devPages } from './scripts/dev-pages'

export default defineConfig({
  plugins: [react(), devPages()],
  // Dev only: send /api/ calls to the local waitlist API (bun server/index.ts).
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
  build: {
    rollupOptions: {
      input: {
      main: resolve(__dirname, 'index.html'),
      event: resolve(__dirname, 'event-timeline.html'),
      privacy: resolve(__dirname, 'privacy.html'),
      terms: resolve(__dirname, 'terms.html'),
      },
    },
  },
})
