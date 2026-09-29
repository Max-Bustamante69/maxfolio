// Interruptor del 3D. Sin `?3d=1` (ni el interruptor persistente que ese parámetro activa) el sitio es
// EXACTAMENTE el de siempre: este módulo no importa nada y es lo único de `src/three` que toca el chunk
// inicial (una llamada en main.tsx). `?3d=1` activa y persiste en localStorage; `?3d=0` lo apaga y lo borra.
const CLAVE = 'maxfolio:3d'

export interface Modo3d {
  /** El 3D está permitido en esta visita (flag por URL o interruptor persistente). */
  activo: boolean
  /** `?3d=1&lab`: laboratorio con las piezas del estudio junto a sus pósters. */
  lab: boolean
  /** `&forzar`: se salta las heurísticas de gama baja (no la de prefers-reduced-motion ni la de WebGL2). */
  forzar: boolean
}

let memo: Modo3d | undefined

export function modo3d(): Modo3d {
  if (memo) return memo
  const q = new URLSearchParams(typeof location === 'undefined' ? '' : location.search)
  const p = q.get('3d')
  let activo = p === '1'
  try {
    if (p === '1') localStorage.setItem(CLAVE, '1')
    else if (p === '0') localStorage.removeItem(CLAVE)
    else activo = localStorage.getItem(CLAVE) === '1'
  } catch {
    /* almacenamiento bloqueado: solo vale el parámetro de esta carga */
  }
  memo = { activo, lab: activo && q.has('lab'), forzar: q.has('forzar') }
  return memo
}

export const modo3dActivo = () => modo3d().activo

/** Cambia el interruptor persistente (surte efecto en la siguiente carga). */
export function fijarModo3d(activo: boolean) {
  try {
    if (activo) localStorage.setItem(CLAVE, '1')
    else localStorage.removeItem(CLAVE)
  } catch {
    /* sin almacenamiento */
  }
}
