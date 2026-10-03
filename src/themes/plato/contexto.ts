import { createContext, useContext, useLayoutEffect } from 'react'
import type { Copy } from './copy'
import type { Publico } from './publico'
import type { useIr } from './motion'

export const ID = 'plato'
export type ModoVista = '3d' | 'lista'
export interface Ctx {
  c: Copy
  v: Publico
  /** El visitante puede ver el 3D (puerta WebGL abierta) y no ha elegido «lista». */
  en3d: boolean
  puede3d: boolean
  modo: ModoVista
  setModo: (m: ModoVista) => void
  ir: ReturnType<typeof useIr>
}
export const PlatoCtx = createContext<Ctx>(null as unknown as Ctx)
export const usePlato = () => useContext(PlatoCtx)

/** Tono del cromo (encabezado y píldoras): «claro» sobre luz de sala, «oscuro» sobre el plató. Lo fija cada vista y cada sección con data-tono. */
export function setTono(t: 'claro' | 'oscuro') {
  const raiz = document.querySelector('.v5-plato')
  if (raiz && raiz.getAttribute('data-tono') !== t) raiz.setAttribute('data-tono', t)
}
export function useTono(t: 'claro' | 'oscuro', deps: unknown[] = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => setTono(t), [t, ...deps])
}

/** La capa del lienzo (una sola, fija): las vistas deciden si se ve y con qué recorte. Escribe solo si algo cambió. */
let capa: HTMLElement | null = null
let ultimo = ''
let pedido: [boolean, string] | null = null
/** El hijo (la vista) monta antes que el padre registre la capa: lo último que la vista pidió se aplica en cuanto la capa existe. */
export const registrarCapa = (el: HTMLElement | null) => { capa = el; ultimo = ''; if (el && pedido) capaEstado(pedido[0], pedido[1]) }
export function capaEstado(visible: boolean, recorte = 'none') {
  pedido = [visible, recorte]
  const k = `${visible}|${recorte}`
  if (!capa || k === ultimo) return
  ultimo = k
  capa.style.visibility = visible ? 'visible' : 'hidden'
  capa.style.clipPath = recorte
}
