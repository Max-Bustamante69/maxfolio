import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { DEG, lin, type CamaraAsset } from './estudio'
import type { PropsPieza } from './tipos'
import { acotarDt, pedirCuadro, sinAsentar } from './util'
import camaraJson from './camara/monograma-mb.camara.json'

/**
 * Monograma MB en cromo (portado de `src/three/piezas/monograma-mb.tsx`, ea6c976): contornos reales de Inter Bold (OFL).
 * Respecto al original (obsidiana) el material es cromo (receta del PoC de INVENTARIO-3D §7). En esta dirección el nodo
 * `Punto` SÍ se dibuja: la perla violeta es el punto final de la marca (la imitación del sitio de Digitdeck es intencional).
 */
export const camaraDe = (): CamaraAsset => camaraJson as unknown as CamaraAsset

const AMPLITUD_YAW = 9 // grados de flotación mientras el puntero se mueve
/** Sin mover el puntero durante tanto tiempo (s) la flotación se asienta en la pose de reposo y deja de pedir cuadros. */
const REPOSO_S = 8
/** La pieza flota a 30 cuadros por segundo: es un movimiento de 9° cada 4 s. */
const FPS = 30
const GLB = '/3d/monograma-mb/monograma-mb.opt.glb'
const CROMO: THREE.MeshPhysicalMaterialParameters = { color: lin(0.9, 0.92, 0.95), metalness: 1, roughness: 0.06 }
/** El violeta de marca en sRGB (145, 95, 243): el MISMO del punto del H1 (tokens.css --v5-violet). */
const violeta = () => new THREE.Color().setRGB(0.569, 0.373, 0.953, THREE.SRGBColorSpace)
const PERLA: THREE.MeshPhysicalMaterialParameters = { metalness: 0, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05, emissiveIntensity: 0.32 }

export default function Pieza({ yaw, animar, interactiva, puntero, capa = 'todo' }: PropsPieza) {
  const { nodes } = useGLTF(GLB, true, false) as unknown as { nodes: Record<string, THREE.Mesh> }
  const metal = useMemo(() => new THREE.MeshPhysicalMaterial(CROMO), [])
  const perla = useMemo(() => new THREE.MeshPhysicalMaterial({ ...PERLA, color: violeta(), emissive: violeta() }), [])
  const invalidate = useThree((s) => s.invalidate)
  const g = useRef<THREE.Group>(null)
  const tilt = camaraDe().tilt * DEG
  const base = yaw * DEG
  const [inicial] = useState(base) // la rotación inicial es la del póster; los cambios de capítulo los amortigua el useFrame
  const t0 = useRef<number | undefined>(undefined)
  const despierto = useRef(-Infinity) // último movimiento del puntero (s de la pieza)
  const amplitud = useRef(0) // 1 = flotando, 0 = asentada en la pose de reposo
  const ultimo = useRef({ x: 0, y: 0 })
  // frameloop="demand": un cambio de capítulo despierta el bucle, y el useFrame lo mantiene vivo hasta que la pose se asienta.
  useEffect(() => {
    invalidate()
  }, [base, invalidate])
  useFrame((state, dtCrudo) => {
    const grupo = g.current
    if (!grupo) return
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
    const objY = base + a * AMPLITUD_YAW * DEG * Math.sin(w) + px * 0.2
    const objX = tilt + a * 1.5 * DEG * Math.cos(w) - py * 0.035
    grupo.rotation.y = THREE.MathUtils.damp(grupo.rotation.y, objY, 5, dt)
    grupo.rotation.x = THREE.MathUtils.damp(grupo.rotation.x, objX, 5, dt)
    grupo.position.y = a * 0.07 * Math.sin(w)
    if (animar && (activa || a > 1e-3)) pedirCuadro(state, FPS)
    else if (sinAsentar(grupo.rotation.y, objY) || sinAsentar(grupo.rotation.x, objX)) state.invalidate()
  })
  const n = nodes.MB
  const p = nodes.Punto
  return (
    <group ref={g} rotation={[tilt, inicial, 0, 'YXZ']}>
      {capa !== 'perla' && <mesh geometry={n.geometry} material={metal} position={n.position} quaternion={n.quaternion} scale={n.scale} />}
      {capa !== 'letras' && <mesh geometry={p.geometry} material={perla} position={p.position} quaternion={p.quaternion} scale={p.scale} />}
    </group>
  )
}
