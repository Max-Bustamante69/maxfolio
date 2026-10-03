import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const here = fileURLToPath(new URL('.', import.meta.url))
// One HTML entry per A/B variant shell (see ab.config.ts); the edge middleware rewrites `/` to the chosen one.
const entries = ['index.html', 'neo.html', 'persona.html'].filter((f) => existsSync(here + f))

// R3F (dirección v5 B) hace `extend(THREE)` con el namespace ENTERO de three (688 kB), mientras que ScrollObjectScene
// solo usa un subconjunto (~478 kB). Si compartieran el módulo, Rollup sacaría la unión a un chunk común y esas skins
// crecerían sin activar nada: todo lo que no sea ScrollObjectScene resuelve `three` a una copia aislada (solo en build).
// Traído de feat/3d-estudio (ea6c976).
const THREE_MODULE = fileURLToPath(new URL('./node_modules/three/build/three.module.js', import.meta.url))
function threeAisladoParaR3F(): Plugin {
  const AISLADO = '\u0000three-aislado-r3f' // prefijo NUL = id virtual de Rollup
  return {
    name: 'three-aislado-r3f',
    apply: 'build',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source !== 'three' || !importer) return null
      return importer.replace(/\\/g, '/').endsWith('/src/components/common/ScrollObjectScene.tsx') ? null : AISLADO
    },
    load: (id) => (id === AISLADO ? readFileSync(THREE_MODULE, 'utf8') : null),
  }
}

export default defineConfig({
  plugins: [threeAisladoParaR3F(), react()],
  // Varios servidores de desarrollo en paralelo sobre el mismo checkout (un puerto por dirección v5):
  // cada uno con su caché de dependencias para que el optimizador de Vite no se pise.
  cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',
  build: {
    // Lighthouse (best practices) wants source maps for large first-party JS; they only load in devtools.
    sourcemap: true,
    rollupOptions: { input: Object.fromEntries(entries.map((f) => [f.replace('.html', ''), here + f])) },
  },
})
