import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { devPages } from './scripts/dev-pages'

export default defineConfig({
  plugins: [react(), devPages()],
  // Dev only: send /api/ calls to the local waitlist API (bun server/index.ts).
  // X-Site brands each request as eventimeline so local development exercises
  // this site's profile instead of falling back to the API's default brand.
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        headers: { 'X-Site': 'eventimeline' },
      },
    },
  },
})
