// Precarga por ruta: el HTML es el mismo para todas las rutas (SPA), así que el código del tema, su CSS, el contenido del idioma y la
// imagen del LCP solo se descubrían DESPUÉS de bajar y ejecutar index.js (cadena HTML → index → tema → imagen). Este plugin escribe en
// el <head> un script de pocas líneas que, según la URL, pide todo eso en paralelo con index.js.
// Imágenes: SOLO las del LCP que en móvil pesan ≤ 15 KB (pósters de Plató, capas del MB y miniaturas de Digitdeck). Precargar una pesada empeoró
// el LCP medido (A/B intercalado, móvil: ficha de Plató 92 → 85 con la franja de 197 KB, inicio de Ingeniería 79 → 77 con 72 KB): Lantern
// reparte el ancho de banda por igual y la imagen le quita bytes al JS que la pinta. La lista de miniaturas sale del disco en cada build:
// nunca se precarga un archivo que no existe (un 404 sería un error de consola).
import { readdirSync } from 'node:fs'
import type { Plugin } from 'vite'
import type { OutputBundle, OutputChunk } from 'rollup'

/** El chunk de `facade` y todo lo que importa estáticamente (sin el entry, que ya pide el <script> del HTML), más su CSS. */
function cierre(bundle: OutputBundle, chunk: OutputChunk) {
  const archivos = new Set<string>()
  const visitar = (nombre: string) => {
    const c = bundle[nombre]
    if (!c || c.type !== 'chunk' || c.isEntry || archivos.has(`/${nombre}`)) return
    archivos.add(`/${nombre}`)
    c.viteMetadata?.importedCss.forEach((css) => archivos.add(`/${css}`))
    c.imports.forEach(visitar)
  }
  visitar(chunk.fileName)
  return [...archivos]
}

export function precargaPorRuta(): Plugin {
  return {
    name: 'precarga-por-ruta',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        if (!bundle) return html
        const temas: Record<string, string[]> = {}
        const idiomas: Record<string, string[]> = {}
        for (const c of Object.values(bundle)) {
          if (c.type !== 'chunk' || !c.isDynamicEntry) continue
          // En este gancho `facadeModuleId` llega nulo en los chunks de los temas: el módulo se busca entre los que contiene el chunk.
          const ids = c.moduleIds.map((m) => m.replace(/\\/g, '/'))
          const tema = ids.map((m) => m.match(/\/src\/themes\/([^/]+)\/App\.tsx$/)?.[1]).find(Boolean)
          const idioma = ids.map((m) => m.match(/\/src\/content\/(es|ja)\.ts$/)?.[1]).find(Boolean)
          if (tema) temas[tema] = cierre(bundle, c)
          if (idioma) idiomas[idioma] = cierre(bundle, c)
        }
        const minis = readdirSync('public/v5/digitdeck/mini').map((f) => f.replace(/\.webp$/, ''))
        // crossorigin='' como los <link> que crea el ayudante de precarga de Vite: si no coinciden, el navegador baja el archivo dos veces.
        const js = `(function(){try{
var T=${JSON.stringify(temas)},I=${JSON.stringify(idiomas)},N=${JSON.stringify(minis)};
var s=location.pathname.replace(/\\/+$/,'').split('/'),t=s[1],o=s[2]==='obra'&&s[3],raiz=s.length===2,h=document.head;
function l(r,u,x){var e=document.createElement('link');e.rel=r;e.href=u;for(var k in x)e.setAttribute(k,x[k]);h.appendChild(e)}
function cod(u){/\\.css$/.test(u)?l('preload',u,{as:'style',crossorigin:''}):l('modulepreload',u,{crossorigin:''})}
function img(u,m,ty){var x={as:'image',fetchpriority:'high'};if(m)x.media=m;if(ty)x.type=ty;l('preload',u,x)}
(T[t]||[]).forEach(cod);
var g=localStorage.getItem('lang')||((navigator.language||'').toLowerCase().indexOf('es')===0?'es':'en');(I[g]||[]).forEach(cod);
if(t==='plato'&&raiz){img('/v5/plato/poster-m.webp','(max-width: 699px)');img('/v5/plato/poster-d.webp','(min-width: 700px)')}
else if(t==='digitdeck'&&raiz){img('/v5/digitdeck/mb/mb-letras.avif',0,'image/avif');img('/v5/digitdeck/mb/mb-perla.avif',0,'image/avif')}
else if(t==='digitdeck'&&o&&N.indexOf(o)>=0)img('/v5/digitdeck/mini/'+o+'.webp');
}catch(e){}})()`
        // Al final del <head>: la meta charset tiene que quedar en los primeros 1 024 bytes.
        return { html, tags: [{ tag: 'script', children: js, injectTo: 'head' }] }
      },
    },
  }
}
