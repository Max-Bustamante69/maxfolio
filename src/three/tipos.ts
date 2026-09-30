import type { CSSProperties, ReactElement, RefObject } from 'react'
import type { MotionValue } from 'framer-motion'
import type { CamaraAsset } from './estudio'

export type SlugPieza = 'monograma-mb' | 'orbita-tiendas' | 'objetos-feature' | 'relieve-medellin' | 'dispositivos'

/** Las 6 skins del portafolio (`src/data/designs.ts`); deciden el color del punto del monograma. */
export type SkinId = 'apple' | 'luxury' | 'brutalist' | 'neo' | 'persona' | 'terminal'

/** Puntero normalizado (-1..1) sobre la caja de la pieza; 0,0 en reposo. Lo mantiene el DOM, no R3F. */
export interface Puntero {
  x: number
  y: number
}

/** Lo que recibe cada gemela en `src/three/piezas/<slug>.tsx`. */
export interface PropsPieza {
  /** Bucles propios (flotación, órbitas, pulso). Falso = pose de reposo idéntica al póster. */
  animar: boolean
  /** Responde al puntero (parallax / hover). */
  interactiva: boolean
  /** Lector 0..1 (number o MotionValue de framer-motion, ya normalizado por Vista). */
  progreso: () => number
  puntero: RefObject<Puntero>
  estado?: string
  acento?: SkinId
  seleccionado?: string
  periodoPulsoMs?: number
  captura?: string
}

/** Contrato de un módulo de pieza (mismo patrón que el visor del estudio: `camara` + `default`). */
export interface ModuloPieza {
  default: (p: PropsPieza) => ReactElement
  camaraDe: (estado?: string) => CamaraAsset
  /** Caja del póster recortado dentro del lienzo de la cámara [x0, y0, x1, y1] (fracciones). */
  recorte?: [number, number, number, number]
}

/** API pública de `<Pieza3D>`. Solo `slug` es obligatorio. */
export interface Pieza3DProps {
  slug: SlugPieza
  /**
   * Variante de la pieza. `objetos-feature`: bundles | quiz | subscriptions | reviews | migration | islands | tracking | i18n.
   * `dispositivos`: laptop | telefono | pareja (solo póster). `relieve-medellin`: pequena (solo póster, para 120-240 px).
   */
  estado?: string
  /** Responde al puntero: parallax/tilt y, en la órbita de tiendas, resaltar la cuenta bajo el cursor. Captura los eventos de la caja. */
  interactiva?: boolean
  /** Bucles propios (flotación del monograma, giro de anillos, pulso de la perla). Por defecto = `interactiva`; falso = pose idéntica al póster. */
  animar?: boolean
  /** 0..1 (número o MotionValue de framer-motion, p. ej. `useScroll().scrollYProgress`). Órbita de tiendas: cuánto se ha abierto la flota. Por defecto 1. */
  progreso?: number | MotionValue<number>
  /** Skin activa del portafolio: color del punto del monograma (y su póster: apple/luxury son de Cycles; las otras 4 se derivan del de apple recoloreando el punto). */
  acento?: SkinId
  /** Órbita de tiendas: slug de la tienda que lleva la perla (si no, la que esté bajo el puntero). */
  seleccionado?: string
  /** Relieve de Medellín: cadencia real del reloj que lo acompaña (Apple 30000, Terminal 1000). */
  periodoPulsoMs?: number
  /** Dispositivos: URL de otra captura con el ASPECTO EXACTO de la pantalla (390:844 teléfono, 1440:900 laptop). */
  captura?: string
  className?: string
  style?: CSSProperties
  /** Texto alternativo del póster (por defecto, una descripción en inglés de la pieza). */
  alt?: string
  /** `sizes` del póster (por defecto 600px). */
  sizes?: string
  /** Pieza en la primera pantalla: póster con fetchpriority alta y sin lazy. */
  prioridad?: boolean
  /** No monta el 3D aunque pueda (comparativas, pruebas): solo póster. */
  soloPoster?: boolean
}
