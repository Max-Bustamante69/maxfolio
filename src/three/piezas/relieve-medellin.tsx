import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { DEG, lin, useMateriales, type CamaraAsset } from '../estudio'
import type { PropsPieza } from '../tipos'
import { pedirCuadro, sinAsentar } from './util'
import camaraJson from './camaras/relieve-medellin.camara.json'
import recorteJson from './camaras/relieve-medellin.recorte.json'

/**
 * p4 · Relieve real del Valle de Aburrá (DEM AWS Terrain Tiles z12), junto al reloj en vivo de Medellín.
 * Gemela de `logo3d/realtime/src/assets/p4-relieve-medellin.tsx` (ronda 3b). Sin cinemática propia
 * (cámara fija, sin rotación continua): la única animación es el PULSO de la perla, sincronizado a la fase del
 * reloj real (`Date.now() % periodoPulsoMs`: Apple 30 s, Terminal 1 s), y un parallax muy sutil hacia el puntero.
 * Las curvas de nivel y el eje del valle van en un normal map (webp 217 KB), no en la malla (316 k triángulos).
 *
 * El póster web es un RECORTE del lienzo 3200×2400 (caja de la pieza + 5 %): `recorte` lo reproduce con una
 * proyección asimétrica, así la vista 3D encuadra exactamente lo mismo que el póster.
 */
export const camaraDe = (): CamaraAsset => camaraJson as unknown as CamaraAsset
export const recorte = recorteJson.caja_frac as [number, number, number, number]

const GLB = '/3d/relieve-medellin/relieve-medellin.opt.glb'
const NORMAL = '/3d/relieve-medellin/relieve-medellin-normal.webp'
// Cycles usa emisión 0.75 (perla a 16.2 de #5B24FF); el tone mapping comprime el violeta y con 0.75 la perla
// quedaba a 21.2 (umbral 20): ajuste LOCAL medido por el estudio, el material compartido no se toca.
const EMISION_PERLA = 0.87

/** Obsidiana del RELIEVE: receta de build.py:material_terreno. Curvas y río entran por `normalMap`. */
function useObsidianaRelieve(normal: THREE.Texture) {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: lin(0.005, 0.005, 0.005 * 1.3),
        roughness: 0.18,
        specularIntensity: 0.55,
        clearcoat: 0.78,
        clearcoatRoughness: 0.14,
        normalMap: normal,
        normalScale: new THREE.Vector2(1, -1),
        clearcoatNormalMap: normal,
        clearcoatNormalScale: new THREE.Vector2(1, -1),
      }),
    [normal],
  )
}

/** Pared del bloque: obsidiana SATINADA (build.py:material_pared). */
const paredMaterial = () =>
  new THREE.MeshPhysicalMaterial({ color: lin(0.012, 0.012, 0.012 * 1.3), roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.3 })

/** Base: receta de la familia; la cara superior plana refleja más clara en el entorno horneado (sin paralaje) → menos especular, medido. */
const baseMaterial = () =>
  new THREE.MeshPhysicalMaterial({ color: lin(0.006, 0.006, 0.008), roughness: 0.16, specularIntensity: 0.5, clearcoat: 0.5, clearcoatRoughness: 0.03 })

export default function Pieza({ animar, interactiva, puntero, periodoPulsoMs = 30000 }: PropsPieza) {
  const { nodes } = useGLTF(GLB, true, false) as unknown as { nodes: Record<string, THREE.Mesh> }
  const normal = useTexture(NORMAL)
  const gl = useThree((s) => s.gl)
  // UV del terreno = (este, norte) con fila 0 = norte (glTF: v hacia abajo) → flipY = false; mipmaps + anisotropía: sin moiré.
  useLayoutEffect(() => {
    normal.flipY = false
    normal.colorSpace = THREE.NoColorSpace
    normal.generateMipmaps = true
    normal.minFilter = THREE.LinearMipmapLinearFilter
    normal.magFilter = THREE.LinearFilter
    normal.anisotropy = gl.capabilities.getMaxAnisotropy()
    normal.needsUpdate = true
  }, [normal, gl])
  const m = useMateriales()
  const relieve = useObsidianaRelieve(normal)
  const pared = useMemo(paredMaterial, [])
  const base = useMemo(baseMaterial, [])
  const g = useRef<THREE.Group>(null)
  const perla = useRef<THREE.MeshPhysicalMaterial>(null)
  const cam = camaraDe()
  const yaw = cam.yaw * DEG
  const tilt = cam.tilt * DEG

  useFrame((state, dt) => {
    const grupo = g.current
    if (grupo && interactiva) {
      const objY = yaw + puntero.current.x * 0.1
      const objX = tilt - puntero.current.y * 0.06
      grupo.rotation.y = THREE.MathUtils.damp(grupo.rotation.y, objY, 4, dt)
      grupo.rotation.x = THREE.MathUtils.damp(grupo.rotation.x, objX, 4, dt)
      if (sinAsentar(grupo.rotation.y, objY) || sinAsentar(grupo.rotation.x, objX)) state.invalidate()
    }
    if (perla.current) {
      if (!animar) perla.current.emissiveIntensity = EMISION_PERLA // misma emisión CONSTANTE que el render de Cycles
      else {
        const t = (Date.now() % periodoPulsoMs) / periodoPulsoMs
        const onda = 0.5 - 0.5 * Math.cos(2 * Math.PI * t)
        perla.current.emissiveIntensity = EMISION_PERLA * (0.45 + 0.55 * Math.pow(onda, 1.6))
        pedirCuadro(state, 20)
      }
    }
  })

  return (
    <group ref={g} rotation={[tilt, yaw, 0, 'YXZ']}>
      <mesh geometry={nodes.Base.geometry} material={base} position={nodes.Base.position}
        quaternion={nodes.Base.quaternion} scale={nodes.Base.scale} />
      <mesh geometry={nodes.Terreno.geometry} material={relieve} position={nodes.Terreno.position}
        quaternion={nodes.Terreno.quaternion} scale={nodes.Terreno.scale} />
      <mesh geometry={nodes.Pared.geometry} material={pared} position={nodes.Pared.position}
        quaternion={nodes.Pared.quaternion} scale={nodes.Pared.scale} />
      <mesh geometry={nodes.Medellin.geometry} position={nodes.Medellin.position}
        quaternion={nodes.Medellin.quaternion} scale={nodes.Medellin.scale}>
        <primitive object={m.perla} ref={perla} attach="material" />
      </mesh>
    </group>
  )
}
