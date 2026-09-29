// Catálogo LIGERO de piezas 3D (sin three): qué póster pinta cada pieza y si tiene gemela en tiempo real.
// Fuente de los assets: estudio obsidiana (Blender/Cycles), fichas en `public/3d/README.md`.
import type { SkinId, SlugPieza } from './tipos'

export interface Poster {
  /** Nombre base: `/3d/<carpeta>/<base>-<ancho>.{avif,webp}`. */
  base: string
  /** Anchos publicados (px), de menor a mayor. */
  anchos: number[]
  /** Dimensiones del póster al ancho MENOR (fijan el aspect-ratio = cero CLS). */
  w: number
  h: number
}

export interface Definicion {
  carpeta: string
  poster: Poster
  /** false = solo póster (no hay gemela 3D de esa variante). */
  tiene3d: boolean
  alt: string
}

export const SLUGS: readonly SlugPieza[] = ['monograma-mb', 'orbita-tiendas', 'objetos-feature', 'relieve-medellin', 'dispositivos']

export const FEATURES = ['bundles', 'quiz', 'subscriptions', 'reviews', 'migration', 'islands', 'tracking', 'i18n'] as const
export const DISPOSITIVOS = ['laptop', 'telefono', 'pareja'] as const

const ALT_FEATURE: Record<string, string> = {
  bundles: 'Bundles: a slab with three stacked layers, the top one in violet',
  quiz: 'Quiz: a slab with a question mark and two options, one chosen',
  subscriptions: 'Subscriptions: a slab with a repeat ring in violet',
  reviews: 'Reviews: a slab with one large star in violet',
  migration: 'Migration: two half-assembled blocks with a violet seam',
  islands: 'React islands: a slab with three holes and three floating islands, the middle one hydrated',
  tracking: 'Tracking: a slab with a short antenna ending in a violet signal',
  i18n: 'Bilingual: a slab with a speech bubble carrying two glyphs',
}

/**
 * Skins sin póster de Cycles (FICHA p1 del estudio: solo gemela en tiempo real). Su póster se DERIVA del de `apple`
 * recoloreando el punto de acento (`scripts/poster-acento.mjs`); es una derivación declarada, no un render, y el
 * póster exacto de esas cuatro skins queda pendiente en el estudio. Solo a 1200 px.
 */
const POSTER_DERIVADO: SkinId[] = ['brutalist', 'neo', 'persona', 'terminal']

const P43 = { w: 1200, h: 900 }

export function resolver(slug: SlugPieza, estado?: string, acento?: SkinId): Definicion {
  switch (slug) {
    case 'monograma-mb': {
      const derivado = acento !== undefined && POSTER_DERIVADO.includes(acento)
      return {
        carpeta: 'monograma-mb',
        poster: derivado
          ? { base: `apple-${acento}`, anchos: [1200], ...P43 }
          : { base: acento === 'luxury' ? 'luxury' : 'apple', anchos: [1200, 2400], ...P43 },
        tiene3d: true,
        alt: 'MB monogram in polished obsidian with an accent dot',
      }
    }
    case 'orbita-tiendas':
      return {
        carpeta: 'orbita-tiendas',
        poster: { base: 'reposo', anchos: [1200, 2400], ...P43 },
        tiene3d: true,
        alt: 'Orbit of 23 Shopify storefronts: a titanium ring per year, one obsidian bead per store',
      }
    case 'objetos-feature': {
      const f = (FEATURES as readonly string[]).includes(estado ?? '') ? (estado as string) : 'bundles'
      return { carpeta: 'objetos-feature', poster: { base: f, anchos: [1200], ...P43 }, tiene3d: true, alt: ALT_FEATURE[f] }
    }
    case 'relieve-medellin': {
      const pequena = estado === 'pequena'
      return {
        carpeta: 'relieve-medellin',
        poster: { base: pequena ? 'pequena' : 'recorte', anchos: pequena ? [600, 1200] : [1200, 2400], w: pequena ? 600 : 1200, h: pequena ? 429 : 858 },
        // La variante pequeña tiene otras curvas (otra geometría/normal map): solo póster.
        tiene3d: !pequena,
        alt: 'Obsidian relief block of the Aburrá Valley with a violet pearl on Medellín',
      }
    }
    case 'dispositivos': {
      const d = (DISPOSITIVOS as readonly string[]).includes(estado ?? '') ? (estado as string) : 'laptop'
      return {
        carpeta: 'dispositivos',
        poster: { base: d, anchos: [1200, 2400], ...P43 },
        // `pareja` (laptop + teléfono en una sola composición) no tiene GLB conjunto: solo póster.
        tiene3d: d !== 'pareja',
        alt: d === 'telefono' ? 'Generic phone showing a real storefront' : d === 'pareja' ? 'Generic laptop and phone showing a real storefront' : 'Generic laptop showing a real storefront',
      }
    }
  }
}

export const urlPoster = (carpeta: string, base: string, ancho: number, ext: 'avif' | 'webp') => `/3d/${carpeta}/${base}-${ancho}.${ext}`
