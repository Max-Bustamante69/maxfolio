import { useState } from 'react'
import { SHOT_SIZE, shot } from '../data'
import { lodSrc, type Captura } from './datos'

export type Nivel = 0 | 1 | 2

/** Una captura en tres niveles: LOD 0 y 1 son AVIF pequeños (build con sharp) y el 2 es el WebP original.
 *  Las capas superiores entran con un fundido de 160 ms cuando ya decodificaron (la anterior se queda hasta entonces: sin parpadeo)
 *  y se desmontan al bajar de nivel, que es lo que acota la memoria decodificada. */
export function Lod({ slug, c, nivel, alt, prioridad }: { slug: string; c: Captura; nivel: Nivel; alt: string; prioridad?: boolean }) {
  const fuentes = [lodSrc(0, slug, c), lodSrc(1, slug, c), shot(slug, c.vista, c.vp)]
  return (
    <>
      {fuentes.slice(0, nivel + 1).map((src, n) => (
        <Capa key={n} src={src} n={n} c={c} alt={n === 0 ? alt : ''} prioridad={prioridad && n === 0} />
      ))}
    </>
  )
}

function Capa({ src, n, c, alt, prioridad }: { src: string; n: number; c: Captura; alt: string; prioridad?: boolean }) {
  const [listo, setListo] = useState(n === 0)
  const { w, h } = SHOT_SIZE[c.vp]
  return (
    <img
      className="c-lod"
      data-listo={listo || undefined}
      src={src}
      width={w}
      height={h}
      alt={alt}
      loading={n > 0 || prioridad ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onLoad={n === 0 ? undefined : (e) => void e.currentTarget.decode().catch(() => undefined).then(() => setListo(true))}
    />
  )
}
