// Parámetros del 3D que solo importa la carga diferida (`arrancar`): laboratorio y `forzar`. El interruptor en sí
// (`modo3dActivo`) vive en `flag3d.ts`, que es lo único que toca el chunk inicial.
import { modo3dActivo } from './flag3d'

export interface Modo3d {
  /** El 3D está permitido en esta visita (flag por URL o interruptor persistente). */
  activo: boolean
  /** `?3d=1&lab`: laboratorio con las piezas del estudio junto a sus pósters. */
  lab: boolean
  /** `&forzar`: se salta las heurísticas de gama baja (no la de prefers-reduced-motion ni la de WebGL2). */
  forzar: boolean
}

export function modo3d(): Modo3d {
  const activo = modo3dActivo()
  const q = new URLSearchParams(location.search)
  return { activo, lab: activo && q.has('lab'), forzar: q.has('forzar') }
}
