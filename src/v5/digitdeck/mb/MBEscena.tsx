// Chunk perezoso del MB en cromo: UN Canvas propio dentro de la caja (con una sola pieza no hace falta View/View.Port).
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { DEG, EntornoEstudio, camaraDesdeJson } from './estudio'
import Pieza, { camaraDe } from './pieza'
import type { Capa, Puntero } from './tipos'

useGLTF.setDecoderPath('/draco/') // Draco local, nada de CDN de gstatic

/** Avisa cuando la vista ya dibujó de verdad (pieza + entorno resueltos): ahí se desvanece el póster. */
function Dibujada({ alDibujar }: { alDibujar: () => void }) {
  const n = useRef(0)
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => {
    invalidate()
  }, [invalidate])
  // Prioridad 0: en un Canvas propio cualquier prioridad > 0 le quita el render automático a R3F y el lienzo sale en blanco.
  // Cada cuadro pide el siguiente hasta contar tres: un `invalidate(n)` lo pisaría cualquier `invalidate()` posterior (R3F 9 lo deja en 1).
  useFrame((state) => {
    if (n.current === 3) return
    if (++n.current === 3) alDibujar()
    else state.invalidate()
  })
  return null
}

/** Puntero normalizado (-1..1) sobre la ventana (el lienzo no recibe eventos: el texto va delante); despierta el frameloop "demand". */
function SeguirPuntero({ puntero, visible }: { puntero: { current: Puntero }; visible: { current: boolean } }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    const mover = (e: PointerEvent) => {
      if (!visible.current) return // héroe fuera de pantalla: mover el ratón no despierta el render
      puntero.current.x = (e.clientX / innerWidth) * 2 - 1
      puntero.current.y = -((e.clientY / innerHeight) * 2 - 1)
      invalidate()
    }
    const soltar = () => {
      puntero.current.x = 0
      puntero.current.y = 0
      invalidate()
    }
    addEventListener('pointermove', mover, { passive: true })
    document.documentElement.addEventListener('pointerleave', soltar)
    return () => {
      removeEventListener('pointermove', mover)
      document.documentElement.removeEventListener('pointerleave', soltar)
    }
  }, [invalidate, puntero, visible])
  return null
}

const SIEMPRE = { current: true }
/** La caja del espejo, más ancha que la del estudio original (7): con 7 la pata izquierda de la M reflejaba el vacío y el MB se leía «IB». */
const ANCHO_ESPEJO = 10

interface Props {
  yaw: number
  animar: boolean
  interactiva: boolean
  alDibujar: () => void
  capa?: Capa
  /** ¿La caja del MB está en pantalla? Si no, el puntero no despierta el lienzo. */
  visible?: { current: boolean }
}

export default function MBEscena({ yaw, animar, interactiva, alDibujar, capa, visible = SIEMPRE }: Props) {
  const puntero = useRef<Puntero>({ x: 0, y: 0 })
  const cam = camaraDe()
  const { posicion, centro, fov } = useMemo(() => camaraDesdeJson(cam), [cam]) // estable: el entorno se hornea una vez
  const coarse = matchMedia('(pointer: coarse)').matches
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, Math.min(coarse ? 1.5 : 2, window.devicePixelRatio || 1)]}
      gl={{ alpha: true, antialias: true }}
      camera={{ fov, near: Math.min(0.1, cam.dist * 0.05), far: cam.dist * 4, position: posicion.toArray(), rotation: [-cam.inclinacion_deg * DEG, 0, 0] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <Pieza yaw={yaw} animar={animar} interactiva={interactiva} puntero={puntero} capa={capa} />
        {/* El estudio se hornea UNA vez con la pieza de frente (yaw 0): el póster de cada capítulo sale de la misma escena, así el relevo no salta. */}
        <EntornoEstudio yaw={0} anchoEspejo={ANCHO_ESPEJO} tilt={cam.tilt} escala={cam.escala} camara={posicion} centro={centro} hdri="/3d/hdri/studio_small_09_512.hdr" resolucion={256} />
        <Dibujada alDibujar={alDibujar} />
      </Suspense>
      {interactiva && <SeguirPuntero puntero={puntero} visible={visible} />}
    </Canvas>
  )
}
