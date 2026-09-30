import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { DEG, lin, useMateriales, type CamaraAsset } from '../estudio'
import type { PropsPieza, SkinId } from '../tipos'
import { acotarDt, pedirCuadro, sinAsentar } from './util'
import camaraJson from './camaras/monograma-mb.camara.json'

/**
 * p1 · Monograma MB obsidiana (portafolio de Max). Gemela de `logo3d/realtime/src/assets/p1-monograma-mb.tsx`:
 * contornos reales de Inter Bold (OFL) con la misma losa que la «D.» del logo; el ÚNICO acento es el punto,
 * que toma el color de la skin activa (nunca la perla violeta de Digitdeck). Un solo GLB para las 6 skins.
 *
 * Portado sin cambiar geometría, materiales ni luz. Cambios de integración: GLB Draco local re-optimizado con
 * `--join false` (el `.opt.glb` del estudio fundía «MB» y «Punto» en una malla y el punto no podía cambiar de
 * color por skin), bucle/puntero gobernados por `animar`/`interactiva`, y cuadros pedidos con `invalidate`.
 */
export const camaraDe = (): CamaraAsset => camaraJson as unknown as CamaraAsset

const AMPLITUD_YAW = 9 // grados, bucle estándar del estudio
/** Sin mover el puntero durante tanto tiempo (s) la flotación se asienta en la pose del póster y deja de pedir cuadros. */
const REPOSO_S = 8
/** La firma flota a 30 cuadros por segundo: es un movimiento de 9° cada 4 s, no hace falta más. */
const FPS = 30

/** Mismos hex que `src/data/designs.ts` (accent por skin), en lineal. */
export const ACENTOS_SKIN: Record<SkinId, THREE.Color> = {
  apple: lin(0.0, 0.1651, 0.7682), // #0071e3
  luxury: lin(0.5841, 0.3968, 0.1221), // #C9A962
  brutalist: lin(0.7157, 0.0194, 0.0194), // #dc2626
  neo: lin(0.0578, 0.0865, 0.6939), // #4453d9
  persona: lin(0.0116, 0.159, 0.4342), // #1c6fb0
  terminal: lin(0.0409, 1.0, 0.2462), // #39ff88
}

const GLB = '/3d/monograma-mb/monograma-mb.opt.glb'

export default function Pieza({ animar, interactiva, puntero, acento = 'apple' }: PropsPieza) {
  const { nodes } = useGLTF(GLB, true, false) as unknown as { nodes: Record<string, THREE.Mesh> }
  const m = useMateriales()
  const material = useMemo(() => {
    const color = ACENTOS_SKIN[acento] ?? ACENTOS_SKIN.apple
    return new THREE.MeshPhysicalMaterial({
      color, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04, emissive: color, emissiveIntensity: 0.95,
    })
  }, [acento])
  const g = useRef<THREE.Group>(null)
  const cam = camaraDe()
  const yaw = cam.yaw * DEG
  const tilt = cam.tilt * DEG
  // Reloj de LA PIEZA, no del Canvas (que lleva vivo desde la primera pieza de la página): la flotación arranca en el
  // seno 0 = la pose del póster, y el primer cuadro 3D coincide con él.
  const t0 = useRef<number | undefined>(undefined)
  const despierto = useRef(0) // último movimiento del puntero (s de la pieza)
  const amplitud = useRef(1) // 1 = flotando, 0 = asentada en la pose del póster
  const ultimo = useRef({ x: 0, y: 0 })
  useFrame((state, dtCrudo) => {
    const grupo = g.current
    if (!grupo || (!animar && !interactiva)) return
    const dt = acotarDt(dtCrudo)
    const t = state.clock.elapsedTime - (t0.current ??= state.clock.elapsedTime)
    const px = interactiva ? puntero.current.x : 0
    const py = interactiva ? puntero.current.y : 0
    if (px !== ultimo.current.x || py !== ultimo.current.y) {
      ultimo.current = { x: px, y: py }
      despierto.current = t
    }
    const activa = t - despierto.current < REPOSO_S
    amplitud.current = THREE.MathUtils.damp(amplitud.current, activa ? 1 : 0, 2, dt)
    const a = animar ? amplitud.current : 0
    const w = (2 * Math.PI * t) / 4
    const objY = yaw + a * AMPLITUD_YAW * DEG * Math.sin(w) + px * 0.25
    const objX = tilt + a * 2 * DEG * Math.cos(w) - py * 0.12
    grupo.rotation.y = THREE.MathUtils.damp(grupo.rotation.y, objY, 5, dt)
    grupo.rotation.x = THREE.MathUtils.damp(grupo.rotation.x, objX, 5, dt)
    grupo.position.y = a * 0.07 * Math.sin(w)
    if (animar && (activa || a > 1e-3)) pedirCuadro(state, FPS)
    else if (sinAsentar(grupo.rotation.y, objY) || sinAsentar(grupo.rotation.x, objX)) state.invalidate()
  })
  return (
    <group ref={g} rotation={[tilt, yaw, 0, 'YXZ']}>
      {[nodes.MB, nodes.Punto].map((n) => (
        <mesh key={n.name} geometry={n.geometry} material={n.name === 'MB' ? m.obsidiana : material}
          position={n.position} quaternion={n.quaternion} scale={n.scale} />
      ))}
    </group>
  )
}
