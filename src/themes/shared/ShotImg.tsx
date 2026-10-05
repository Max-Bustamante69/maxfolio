import type { ImgHTMLAttributes } from 'react'
import { SHOT_DATE, SHOT_SIZE, shot, type Viewport, type Vista } from '../data'

/** Variante estrecha de cada captura y el ancho al que se pinta (medido a 390–1440 px): la de escritorio va a 285–404 px en un
 *  móvil (92vw a 412 px y DPR 1,75 = 663 px, de ahí los 720) y a más de 700 en tableta y escritorio; la móvil nunca pasa de 300 px.
 *  `auto` (Chrome) toma el ancho real de las diferidas. */
const VARIANTE: Record<Viewport, number> = { desktop: 720, mobile: 400 }
const TAMANO: Record<Viewport, string> = { desktop: '(max-width: 767px) 92vw, 100vw', mobile: '(max-width: 767px) 60vw, 300px' }

/** Captura real de public/gallery con su tamaño intrínseco (cero CLS). `prioridad` solo para la imagen del LCP. */
export function ShotImg({ slug, vista, vp, alt, prioridad, ...rest }: { slug: string; vista: Vista; vp: Viewport; alt: string; prioridad?: boolean } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'>) {
  const { w, h } = SHOT_SIZE[vp]
  const diferida = !prioridad && rest.loading !== 'eager'
  return (
    <img
      srcSet={`${shot(slug, vista, vp, VARIANTE[vp])} ${VARIANTE[vp]}w, ${shot(slug, vista, vp)} ${w}w`}
      sizes={diferida ? `auto, ${TAMANO[vp]}` : TAMANO[vp]}
      src={shot(slug, vista, vp)}
      width={w}
      height={h}
      alt={alt}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      {...rest}
    />
  )
}

/** Pie sistemático de una captura: «NOS Café · Home · 1440 · 2026-09-07». */
export const pieDeCaptura = (nombre: string, vista: Vista, vp: Viewport) =>
  `${nombre} · ${vista === 'home' ? 'Home' : 'PDP'} · ${vp === 'desktop' ? '1440' : '390'} · ${SHOT_DATE}`
