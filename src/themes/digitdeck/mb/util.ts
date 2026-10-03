import type { RootState } from '@react-three/fiber'

const pendientes = new Map<number, number>()

/**
 * Pide el siguiente cuadro (frameloop "demand"): 60 = en cada rAF; menos = temporizado (bucles lentos gastan menos).
 * Un solo temporizador pendiente por cadencia: este `useFrame` corre en CADA cuadro para TODAS las piezas montadas, y sin
 * el `Map` cada cuadro sembraba un temporizador que al disparar sembraba otro, así que los bucles se multiplicaban y no
 * se apagaban nunca (medido: la cabecera de Apple seguía a ~35 dibujos por segundo mucho después de asentarse).
 */
export function pedirCuadro(state: RootState, fps = 60) {
  if (fps >= 60) return state.invalidate()
  if (pendientes.has(fps)) return
  pendientes.set(
    fps,
    window.setTimeout(() => {
      pendientes.delete(fps)
      state.invalidate()
    }, 1000 / fps),
  )
}

/** true mientras `actual` no haya llegado a `objetivo` (para seguir pidiendo cuadros hasta que el resorte se asiente). */
export const sinAsentar = (actual: number, objetivo: number, eps = 1e-4) => Math.abs(actual - objetivo) > eps

/**
 * `dt` acotado a un cuadro de 30 fps. Con `frameloop="demand"` el primer cuadro tras un reposo trae como `dt` todo el
 * tiempo ocioso; integrar eso salta la pose (el anillo interior de la órbita giraba 18° por cada segundo de inactividad
 * y el primer cuadro 3D ya no coincidía con el póster).
 */
export const acotarDt = (dt: number) => Math.min(dt, 1 / 30)
