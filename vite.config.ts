import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Varios servidores de desarrollo en paralelo sobre el mismo checkout (un puerto por tema):
  // cada uno con su caché de dependencias para que el optimizador de Vite no se pise.
  cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',
  // En desarrollo la agenda (src/themes/shared/agenda.ts) va por este proxy: la API de reservas solo acepta por CORS
  // los orígenes reales (digitdeck.co, maxfolio.dev), nunca localhost.
  server: { proxy: { '/agenda-api': { target: 'https://app.digitdeck.co', changeOrigin: true, rewrite: (p) => p.replace(/^\/agenda-api/, '/api/reservas') } } },
  // Vista previa por túnel de Cloudflare para que Max vea los temas (las previews de Vercel exigen sesión).
  preview: { allowedHosts: ['.trycloudflare.com'] },
  build: {
    // Lighthouse (best practices) wants source maps for large first-party JS; they only load in devtools.
    sourcemap: true,
  },
})
