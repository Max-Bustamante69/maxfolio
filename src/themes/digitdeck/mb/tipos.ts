import type { RefObject } from 'react'

/** Puntero normalizado (-1..1) sobre la ventana; 0,0 en reposo. Lo mantiene el DOM, no R3F. */
export interface Puntero {
  x: number
  y: number
}

/** Qué se dibuja: el monograma y su perla, solo las letras o solo la perla (los pósters de la entrada se sacan por capas). */
export type Capa = 'todo' | 'letras' | 'perla'

/** Lo que recibe la pieza del monograma. */
export interface PropsPieza {
  /** Pose de reposo (grados de giro en Y). */
  yaw: number
  /** Flota mientras el puntero se mueve (sin puntero, la pieza está quieta y no pide cuadros). */
  animar: boolean
  /** Responde al puntero (parallax). */
  interactiva: boolean
  puntero: RefObject<Puntero>
  capa?: Capa
}
