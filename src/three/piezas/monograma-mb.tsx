import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { DEG, lin, useMateriales, type CamaraAsset } from '../estudio'
import type { PropsPieza, SkinId } from '../tipos'
import { pedirCuadro, sinAsentar } from './util'
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
  useFrame((state, dt) => {
    const grupo = g.current
    if (!grupo || (!animar && !interactiva)) return
    const w = animar ? (2 * Math.PI * state.clock.elapsedTime) / 4 : 0
    const px = interactiva ? puntero.current.x : 0
    const py = interactiva ? puntero.current.y : 0
    const objY = yaw + (animar ? AMPLITUD_YAW * DEG * Math.sin(w) : 0) + px * 0.25
    const objX = tilt + (animar ? 2 * DEG * Math.cos(w) : 0) - py * 0.12
    grupo.rotation.y = THREE.MathUtils.damp(grupo.rotation.y, objY, 5, dt)
    grupo.rotation.x = THREE.MathUtils.damp(grupo.rotation.x, objX, 5, dt)
    grupo.position.y = animar ? 0.07 * Math.sin(w) : 0
    if (animar) pedirCuadro(state, 60)
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
