import type { ImgHTMLAttributes } from 'react'
import { SHOT_DATE, SHOT_SIZE, shot, type Viewport, type Vista } from '../data'

/** Captura real de public/gallery con su tamaño intrínseco (cero CLS). `prioridad` solo para la imagen del LCP. */
export function ShotImg({ slug, vista, vp, alt, prioridad, ...rest }: { slug: string; vista: Vista; vp: Viewport; alt: string; prioridad?: boolean } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'>) {
  const { w, h } = SHOT_SIZE[vp]
  return (
    <img
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
