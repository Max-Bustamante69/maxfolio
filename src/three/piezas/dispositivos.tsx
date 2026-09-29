import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { DEG, useMateriales, type CamaraAsset } from '../estudio'
import type { PropsPieza, Puntero } from '../tipos'
import { sinAsentar } from './util'
import laptopCamara from './camaras/dispositivos-laptop.camara.json'
import telefonoCamara from './camaras/dispositivos-telefono.camara.json'

/**
 * 11 · Dispositivos genéricos (teléfono y laptop, SIN logos ni muescas de terceros) que muestran trabajo real:
 * la pantalla es una captura de una tienda ya construida (Factores 2x2), no un mockup decorativo. Gemelas de
 * `logo3d/realtime/src/assets/11-dispositivos-{telefono,laptop}.tsx`. `estado` = 'laptop' | 'telefono'
 * (`pareja` es solo póster). Para otro caso de tienda, `captura` con el ASPECTO EXACTO de la pantalla
 * (390:844 teléfono, 1440:900 laptop) o se estira. `tex.flipY = false` es obligatorio (UV glTF).
 *
 * Con `interactiva`: tilt 3D leve por puntero sobre el conjunto rígido (la bisagra de la laptop nunca se reabre).
 * `animar` no hace nada (el estudio no le dio bucle propio).
 */
const CAMARAS: Record<string, CamaraAsset> = {
  laptop: laptopCamara as unknown as CamaraAsset,
  telefono: telefonoCamara as unknown as CamaraAsset,
}
export const camaraDe = (estado = 'laptop'): CamaraAsset => CAMARAS[estado] ?? CAMARAS.laptop

type Malla = Record<string, THREE.Mesh>
const CAPTURA = { laptop: '/3d/dispositivos/captura-laptop.webp', telefono: '/3d/dispositivos/captura-telefono.webp' }

/** Pantalla = negro + emisión de la captura (receta E.material_pantalla de Blender). */
function usePantalla(url: string) {
  const tex = useTexture(url)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.flipY = false
  return useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.0 }),
    [tex],
  )
}

function useInclinacion(interactiva: boolean, puntero: { current: Puntero }, base: [number, number], k: [number, number], damp: number) {
  const g = useRef<THREE.Group>(null)
  useFrame((state, dt) => {
    const grupo = g.current
    if (!grupo || !interactiva) return
    const objY = base[0] + puntero.current.x * k[0]
    const objX = base[1] - puntero.current.y * k[1]
    grupo.rotation.y = THREE.MathUtils.damp(grupo.rotation.y, objY, damp, dt)
    grupo.rotation.x = THREE.MathUtils.damp(grupo.rotation.x, objX, damp, dt)
    if (sinAsentar(grupo.rotation.y, objY) || sinAsentar(grupo.rotation.x, objX)) state.invalidate()
  })
  return g
}

const GLB_TELEFONO = '/3d/dispositivos/telefono.opt.glb'
const GLB_LAPTOP = '/3d/dispositivos/laptop.opt.glb'

function Telefono({ interactiva, puntero, captura = CAPTURA.telefono }: PropsPieza) {
  const { nodes } = useGLTF(GLB_TELEFONO, true, false) as unknown as { nodes: Malla }
  const m = useMateriales()
  const pantalla = usePantalla(captura)
  const cam = camaraDe('telefono')
  const yaw = cam.yaw * DEG
  const tilt = cam.tilt * DEG
  const g = useInclinacion(interactiva, puntero, [yaw, tilt], [0.22, 0.1], 6)
  return (
    <group ref={g} rotation={[tilt, yaw, 0, 'YXZ']}>
      {[nodes.CuerpoTelefono, nodes.PantallaTelefono].map((n) => (
        <mesh key={n.name} geometry={n.geometry} material={n.name === 'CuerpoTelefono' ? m.obsidiana : pantalla}
          position={n.position} quaternion={n.quaternion} scale={n.scale} />
      ))}
    </group>
  )
}

function Laptop({ interactiva, puntero, captura = CAPTURA.laptop }: PropsPieza) {
  const { nodes } = useGLTF(GLB_LAPTOP, true, false) as unknown as { nodes: Malla }
  const m = useMateriales()
  const pantalla = usePantalla(captura)
  // Variante LOCAL más satinada que `titanio` para la base (build.py:_material_titanio_base): Roughness 0.5 / Anisotropy 0.15.
  const titanioBase = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.045, 0.045, 0.05), metalness: 1, roughness: 0.5, anisotropy: 0.15, clearcoat: 0.2, clearcoatRoughness: 0.3 }),
    [],
  )
  // Los nodos GLB de la laptop YA vienen en su pose de mundo final (Rinv en build.py): el reposo es 0,0, no yaw/tilt.
  const g = useInclinacion(interactiva, puntero, [0, 0], [0.18, 0.08], 6)
  return (
    <group ref={g}>
      {[nodes.BaseLaptop, nodes.FrenteLaptop, nodes.TrackpadLaptop].map((n) => (
        <mesh key={n.name} geometry={n.geometry} material={titanioBase}
          position={n.position} quaternion={n.quaternion} scale={n.scale} />
      ))}
      {[nodes.TapaLaptop, nodes.PantallaLaptop].map((n) => (
        <mesh key={n.name} geometry={n.geometry} material={n.name === 'PantallaLaptop' ? pantalla : m.titanio}
          position={n.position} quaternion={n.quaternion} scale={n.scale} />
      ))}
    </group>
  )
}

export default function Pieza(p: PropsPieza) {
  return p.estado === 'telefono' ? <Telefono {...p} /> : <Laptop {...p} />
}
