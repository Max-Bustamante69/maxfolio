import type { RootState } from '@react-three/fiber'

/** Pide el siguiente cuadro (frameloop "demand"): 60 = en cada rAF; menos = temporizado (bucles lentos gastan menos). */
export function pedirCuadro(state: RootState, fps = 60) {
  if (fps >= 60) state.invalidate()
  else setTimeout(() => state.invalidate(), 1000 / fps)
}

/** true mientras `actual` no haya llegado a `objetivo` (para seguir pidiendo cuadros hasta que el resorte se asiente). */
export const sinAsentar = (actual: number, objetivo: number, eps = 1e-4) => Math.abs(actual - objetivo) > eps
