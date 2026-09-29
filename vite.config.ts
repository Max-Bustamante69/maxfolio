import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const here = fileURLToPath(new URL('.', import.meta.url))
// One HTML entry per A/B variant shell (see ab.config.ts); the edge middleware rewrites `/` to the chosen one.
const entries = ['index.html', 'neo.html', 'persona.html'].filter((f) => existsSync(here + f))

// R3F hace `extend(THREE)` con el namespace ENTERO de three (688 kB), mientras que ScrollObjectScene (el objeto
// ambiental de luxury/brutalist/neo, sin ?3d=1) solo usa un subconjunto tree-shakeado (~478 kB). Si compartieran el
// módulo, Rollup lo sacaría a un chunk común con la unión de lo usado y esas skins pasarían de 478 a 688 kB sin haber
// activado nada. Por eso todo lo que NO sea ScrollObjectScene (R3F, drei, three-stdlib, src/three) resuelve `three`
// a una copia aislada del mismo archivo; ScrollObjectScene conserva la suya. Solo en `build` (en dev es un único three).
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
  build: {
    // Lighthouse (best practices) wants source maps for large first-party JS; they only load in devtools.
    sourcemap: true,
    rollupOptions: { input: Object.fromEntries(entries.map((f) => [f.replace('.html', ''), here + f])) },
  },
})
