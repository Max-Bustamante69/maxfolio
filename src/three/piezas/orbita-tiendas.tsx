import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { DEG, useMateriales, type CamaraAsset, type MaterialesEstudio } from '../estudio'
import type { PropsPieza } from '../tipos'
import { pedirCuadro, sinAsentar } from './util'
import camaraJson from './camaras/orbita-tiendas.camara.json'
import datosJson from './camaras/orbita-tiendas.datos.json'

/**
 * p2 · Órbita de las 23 tiendas Shopify reales de Max (SOLO tiendas). Gemela de
 * `logo3d/realtime/src/assets/p2-orbita-tiendas.tsx`: un anillo de titanio por año real (2023 · 2025 · 2026),
 * una cuenta de obsidiana por tienda nombrada por su slug, y la perla violeta en UNA cuenta a la vez: la de
 * `seleccionado` si el DOM la controla, la que está bajo el puntero si `interactiva`, o `RESALTADO_DEFECTO`.
 *
 * `progreso` (0..1): la flota se abre desde el centro (escala uniforme de la pieza entera, misma curva
 * smoothstep que el `_p0/_p50` de Cycles). Sin `progreso` = abierta (0..1 → 1), que es el póster de reposo.
 * `animar`: cada anillo gira sobre su eje, más rápido el interno (período orbital que crece con el radio).
 *
 * Móvil (deuda declarada por el estudio): con 18 cuentas en el anillo 2026 el arco por cuenta no da para un
 * tap de 44 px; en táctil la página debe mostrar el reposo + una lista HTML de tiendas, no el raycast.
 *
 * Exposición local 1.09 (medida por el estudio: la perla leía a distancia 21 de #5B24FF frente a 17 en Cycles).
 * El original la aplicaba con `gl.toneMappingExposure`, que en un Canvas compartido pisaría a las demás piezas;
 * aquí es lo mismo pero por vista: el tone mapping «Neutral» multiplica la radiancia final por la exposición, y
 * eso equivale a escalar el entorno (`scene.environmentIntensity`) y la emisión de la perla por el mismo factor.
 */
export const camaraDe = (): CamaraAsset => camaraJson as unknown as CamaraAsset

const EXPOSICION = 1.09

interface Tienda {
  slug: string
  name: string
  year: number
  status: 'live' | 'dev'
}
const TIENDAS = (datosJson as { stores: Tienda[] }).stores
const ANIOS = Array.from(new Set(TIENDAS.map((t) => t.year))).sort((a, b) => a - b)
const ANIO_DE = new Map(TIENDAS.map((t) => [t.slug, t.year]))

const GLB = '/3d/orbita-tiendas/orbita-tiendas.opt.glb'
const RESALTADO_DEFECTO = 'the-gummy-box'
const ESCALA_RESALTE = 1.22
const AMORTIGUACION = 9
// vueltas/seg por anillo: el más interno (índice 0) gira más rápido — mismo `1/(i+1)` que build.py.
const VUELTAS_POR_SEG = (i: number) => 0.05 / (i + 1)

interface CuentaProps {
  nodo: THREE.Mesh
  resaltada: boolean
  material: THREE.Material
  suave: boolean
  onOver?: (e: ThreeEvent<PointerEvent>) => void
}

function Cuenta({ nodo, resaltada, material, suave, onOver }: CuentaProps) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state, dt) => {
    const malla = ref.current
    if (!malla) return
    const objetivo = resaltada ? ESCALA_RESALTE : 1
    const actual = suave ? THREE.MathUtils.damp(malla.scale.x, objetivo, AMORTIGUACION, dt) : objetivo
    malla.scale.setScalar(actual)
    if (suave && sinAsentar(actual, objetivo, 1e-3)) state.invalidate()
  })
  return (
    <mesh ref={ref} name={nodo.name} geometry={nodo.geometry} material={material}
      position={nodo.position} quaternion={nodo.quaternion} onPointerOver={onOver} />
  )
}

interface AnilloProps {
  anio: number
  nodos: THREE.Mesh[]
  resaltado: string
  animar: boolean
  suave: boolean
  onOver?: (slug: string) => (e: ThreeEvent<PointerEvent>) => void
  m: MaterialesEstudio
}

function Anillo({ anio, nodos, resaltado, animar, suave, onOver, m }: AnilloProps) {
  const ref = useRef<THREE.Group>(null)
  const i = ANIOS.indexOf(anio)
  useFrame((state, dt) => {
    if (!ref.current || !animar) return
    ref.current.rotation.z += 2 * Math.PI * VUELTAS_POR_SEG(i) * dt
    pedirCuadro(state, 30)
  })
  return (
    <group ref={ref}>
      {nodos.map((n) => {
        const esAro = n.name.startsWith('Aro')
        const resaltada = !esAro && n.name === resaltado
        const material = esAro ? m.titanio : resaltada ? m.perla : m.obsidiana
        return (
          <Cuenta key={n.name} nodo={n} resaltada={resaltada} material={material} suave={suave}
            onOver={esAro || !onOver ? undefined : onOver(n.name)} />
        )
      })}
    </group>
  )
}

export default function Pieza({ animar, interactiva, progreso, seleccionado }: PropsPieza) {
  const { nodes } = useGLTF(GLB, true, false) as unknown as { nodes: Record<string, THREE.Mesh> }
  const base = useMateriales()
  const m = useMemo(() => {
    const perla = base.perla.clone()
    perla.emissiveIntensity = base.perla.emissiveIntensity * EXPOSICION
    return { ...base, perla }
  }, [base])
  const [bajoPuntero, setBajoPuntero] = useState<string | undefined>()
  const cam = camaraDe()
  const grupo = useRef<THREE.Group>(null)

  const porAnio = useMemo(() => {
    const mapa = new Map<number, THREE.Mesh[]>(ANIOS.map((a) => [a, []]))
    for (const n of Object.values(nodes)) {
      if (!(n as THREE.Mesh).isMesh) continue
      const anio = n.name.startsWith('Aro') ? Number(n.name.slice(3)) : ANIO_DE.get(n.name)
      if (anio !== undefined) mapa.get(anio)?.push(n as THREE.Mesh)
    }
    return mapa
  }, [nodes])

  const onOver = interactiva
    ? (slug: string) => (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setBajoPuntero(slug)
      }
    : undefined

  // Misma curva que build.py para el `_p0/_p50` de Cycles; mínimo 0.06 para que la cámara fija nunca vea un punto.
  useFrame((state) => {
    if (!grupo.current) return
    // Environment (hermano posterior) reescribe la intensidad al montar; se fija cada cuadro, antes del render de la vista.
    state.scene.environmentIntensity = EXPOSICION
    const p = Math.max(0, Math.min(1, progreso()))
    const abierto = Math.max(p * p * (3 - 2 * p), 0.06)
    if (sinAsentar(grupo.current.scale.x, abierto)) {
      grupo.current.scale.setScalar(abierto)
      state.invalidate()
    }
  })

  return (
    <group ref={grupo} rotation={[cam.tilt * DEG, cam.yaw * DEG, 0, 'YXZ']}
      onPointerLeave={interactiva ? () => setBajoPuntero(undefined) : undefined}>
      {ANIOS.map((anio) => (
        <Anillo key={anio} anio={anio} nodos={porAnio.get(anio) ?? []}
          resaltado={seleccionado ?? bajoPuntero ?? RESALTADO_DEFECTO}
          animar={animar} suave={animar || interactiva} onOver={onOver} m={m} />
      ))}
    </group>
  )
}
