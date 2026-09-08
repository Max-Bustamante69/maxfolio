import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Lighthouse (best practices) wants source maps for large first-party JS; they only load in devtools.
    sourcemap: true,
  },
})
