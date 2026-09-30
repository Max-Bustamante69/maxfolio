import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { DEG, useMateriales, type CamaraAsset, type MaterialesEstudio } from '../estudio'
import type { PropsPieza } from '../tipos'
import { acotarDt, sinAsentar } from './util'
import bundles from './camaras/objetos-feature-bundles.camara.json'
import quiz from './camaras/objetos-feature-quiz.camara.json'
import subscriptions from './camaras/objetos-feature-subscriptions.camara.json'
import reviews from './camaras/objetos-feature-reviews.camara.json'
import migration from './camaras/objetos-feature-migration.camara.json'
import islands from './camaras/objetos-feature-islands.camara.json'
import tracking from './camaras/objetos-feature-tracking.camara.json'
import i18n from './camaras/objetos-feature-i18n.camara.json'

/**
 * p3 · Familia de 8 objetos-hecho: los `FEATURES` reales de ShopifyWork.tsx (bundles, quiz, subscriptions,
 * reviews, migration, islands, tracking, i18n), cada uno una pieza de ingeniería que Digitdeck construyó.
 * Gemela de `logo3d/realtime/src/assets/p3-objetos-feature-*.tsx`: UN solo GLB con 8 sub-grupos nombrados;
 * `estado` elige el grupo (los demás no se dibujan) y su cámara. Una sola perla por composición.
 *
 * El estudio la entrega SIN giro propio (hereda el parallax del carrusel que la monte). Aquí, con
 * `interactiva`, añade el mismo tilt leve por puntero que el teléfono del catálogo de dispositivos; sin ella
 * queda en la pose de reposo del póster. `animar` no hace nada (no hay bucle propio).
 */
const CAMARAS: Record<string, CamaraAsset> = {
  bundles, quiz, subscriptions, reviews, migration, islands, tracking, i18n,
} as unknown as Record<string, CamaraAsset>

export const camaraDe = (estado = 'bundles'): CamaraAsset => CAMARAS[estado] ?? CAMARAS.bundles

const GLB = '/3d/objetos-feature/objetos-feature.opt.glb'

/** Un material por malla, como comun.py en Blender: obsidiana salvo la ÚNICA perla de cada composición. */
const MATERIAL_POR_MALLA: Record<string, keyof MaterialesEstudio> = {
  Capa2: 'perla', Opcion1: 'perla', Repeticion: 'perla', EstrellaGrande: 'perla', Junta: 'perla',
  Isla1: 'perla', Senal: 'perla', Globo: 'perla',
}

export default function Pieza({ interactiva, puntero, estado = 'bundles' }: PropsPieza) {
  const { nodes } = useGLTF(GLB, true, false) as unknown as { nodes: Record<string, THREE.Object3D> }
  const m = useMateriales()
  const cam = camaraDe(estado)
  const yaw = cam.yaw * DEG
  const tilt = cam.tilt * DEG
  const g = useRef<THREE.Group>(null)
  useFrame((state, dtCrudo) => {
    const grupo = g.current
    if (!grupo || !interactiva) return
    const dt = acotarDt(dtCrudo)
    const objY = yaw + puntero.current.x * 0.22
    const objX = tilt - puntero.current.y * 0.1
    grupo.rotation.y = THREE.MathUtils.damp(grupo.rotation.y, objY, 6, dt)
    grupo.rotation.x = THREE.MathUtils.damp(grupo.rotation.x, objX, 6, dt)
    if (sinAsentar(grupo.rotation.y, objY) || sinAsentar(grupo.rotation.x, objX)) state.invalidate()
  })
  // El GLB exporta en pose NEUTRA (de pie); el nodo raíz del grupo lleva la erección de 90° y hay que aplicarla
  // también (bug medido por el estudio: sin ella la pieza sale tumbada).
  const raiz = nodes[estado] ?? nodes.bundles
  return (
    <group ref={g} rotation={[tilt, yaw, 0, 'YXZ']}>
      <group position={raiz.position} quaternion={raiz.quaternion} scale={raiz.scale}>
        {raiz.children.map((n) => {
          const malla = n as THREE.Mesh
          return (
            <mesh key={n.name} geometry={malla.geometry} material={m[MATERIAL_POR_MALLA[n.name] ?? 'obsidiana']}
              position={n.position} quaternion={n.quaternion} scale={n.scale} />
          )
        })}
      </group>
    </group>
  )
}
