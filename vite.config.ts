import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const here = fileURLToPath(new URL('.', import.meta.url))
// One HTML entry per A/B variant shell (see ab.config.ts); the edge middleware rewrites `/` to the chosen one.
const entries = ['index.html', 'neo.html', 'persona.html'].filter((f) => existsSync(here + f))

export default defineConfig({
  plugins: [react()],
  build: {
    // Lighthouse (best practices) wants source maps for large first-party JS; they only load in devtools.
    sourcemap: true,
    rollupOptions: { input: Object.fromEntries(entries.map((f) => [f.replace('.html', ''), here + f])) },
  },
})
