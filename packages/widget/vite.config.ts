import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Library build for the embeddable Event Timeline widget. Two ES-module
// entries: the framework-free kernel (`event-timeline-ui`) and the thin
// React wrapper (`event-timeline-ui-react`). React stays external so the
// kernel entry never pulls it in. The output lives in this package's own
// dist/, so `emptyOutDir` takes vite's default (true): wiping that directory
// only affects this package's build.
export default defineConfig({
  publicDir: false, // a widget package does not ship public assets
  build: {
    outDir: 'dist',
    lib: {
      entry: {
        'event-timeline-ui': resolve(__dirname, 'src/index.ts'),
        'event-timeline-ui-react': resolve(__dirname, 'src/react.tsx'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
