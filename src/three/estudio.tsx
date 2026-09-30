import { useMemo } from 'react'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

/**
 * PORTADA TAL CUAL del estudio obsidiana de Digitdeck (`3d/estudio/estudio.tsx`); único cambio: el HDRI 512×256
 * (CC0, Poly Haven) se sirve local desde `/3d/hdri/`. No se retocan luces ni materiales por pieza. (Salvedad: `realce`,
 * un multiplicador opcional de las cajas de luz para fondos oscuros; con 1, el valor por defecto, es el estudio de siempre.)
 *
 * Gemela en tiempo real de estudio.py (Blender/Cycles): mismos materiales y mismas cajas de luz, para que
 * cada asset se vea en el navegador igual que su póster de Cycles. Calibrada contra el logo obsidiana
 * (perfil de luminancia de la cara: Cycles [92,75,53,23,1] vs tiempo real [91,74,50,28,10]).
 *
 * Coordenadas: Blender (x, y, z) Z-arriba → three (x, z, -y). La cámara de la escena es de 85 mm
 * (fov vertical 18.05° en 4:3), inclinada 3° hacia abajo, y la pieza va de pie mirando a +Z con
 * rotación [tilt, yaw, 0, 'YXZ'] (tilt > 0 = borde superior hacia la cámara).
 *
 * Diferencia de fondo con Cycles: un mapa de entorno está «en el infinito» (sin paralaje), así que la caja
 * espejo es más baja y más estrecha que en Blender (h 1.8 frente a 4, altura 0.2 frente a 1.6) para que el
 * degradado recorra la cara igual. Medido, no a ojo.
 */
export const DEG = Math.PI / 180
export const lin = (r: number, g: number, b: number) => new THREE.Color().setRGB(r, g, b)
export const VIOLETA = lin(0.1022, 0.0176, 1.0) // #5B24FF en lineal
export const CAMARA_FOV_4x3 = 18.05

/** Recetas = mismas cifras que estudio.py → material(). */
export function crearMateriales() {
  return {
    obsidiana: new THREE.MeshPhysicalMaterial({ color: lin(0.006, 0.006, 0.008), roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.03 }),
    perla: new THREE.MeshPhysicalMaterial({
      color: VIOLETA, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04, emissive: VIOLETA, emissiveIntensity: 0.75,
    }),
    titanio: new THREE.MeshPhysicalMaterial({ color: lin(0.05, 0.05, 0.056), metalness: 1, roughness: 0.3, anisotropy: 0.7 }),
    aluminio: new THREE.MeshPhysicalMaterial({ color: lin(0.62, 0.62, 0.64), metalness: 1, roughness: 0.28 }),
    emisor: new THREE.MeshBasicMaterial({ color: VIOLETA.clone().multiplyScalar(4), toneMapped: false }),
  }
}
export type MaterialesEstudio = ReturnType<typeof crearMateriales>

export function useMateriales() {
  return useMemo(crearMateriales, [])
}

/** `realce` > 1 sube el extremo alto y deja el bajo donde estaba: la caja se multiplica por `realce`, así que el pie 0.08 sigue en 0.08. */
function texturaDegradado(realce = 1) {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  const abajo = 20 / realce
  g.addColorStop(0, 'rgb(255,255,255)') // 1 arriba
  g.addColorStop(1, `rgb(${abajo},${abajo},${abajo})`) //   0.08 abajo (÷ realce)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.NoColorSpace // lineal, como el MapRange de Cycles
  return t
}

/** Posición de la caja grande: donde la cara de la pieza (en su pose de reposo) la refleja hacia la cámara. */
export function posicionEspejo(yawDeg: number, tiltDeg: number, camara: THREE.Vector3, escala = 1) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltDeg * DEG, yawDeg * DEG, 0, 'YXZ'))
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q).normalize()
  const v = camara.clone().normalize()
  const r = n.clone().multiplyScalar(2 * n.dot(v)).sub(v).normalize()
  return r.multiplyScalar(8 * escala).add(new THREE.Vector3(0, 0.2 * escala, 0))
}

/** Lo que estudio.py escribe en out/<slug>.camara.json: encuadre y escala de luces de ESTE asset. */
export interface CamaraAsset {
  dist: number
  centro_three: [number, number, number]
  escala: number
  fov_v_deg: number
  inclinacion_deg: number
  yaw: number
  tilt: number
  rx: number
  ry: number
}

/** Cámara de three equivalente a la de Cycles para un asset (misma distancia, fov e inclinación). */
export function camaraDesdeJson(c: CamaraAsset) {
  const centro = new THREE.Vector3(...c.centro_three)
  const inc = c.inclinacion_deg * DEG
  const posicion = centro.clone().add(new THREE.Vector3(0, c.dist * Math.sin(inc), c.dist * Math.cos(inc)))
  return { posicion, centro, fov: c.fov_v_deg, aspecto: c.rx / c.ry }
}

interface EntornoProps {
  /** Pose de reposo de la pieza (la que se ve en el póster). */
  yaw?: number
  tilt?: number
  /** Posición de la cámara respecto a la pieza (three). */
  camara?: THREE.Vector3
  /** Tamaño de la pieza respecto al logo (1 = logo de 2.2 unidades de ancho). */
  escala?: number
  /** Centro de la pieza posada (centro_three del json): las luces apuntan y se colocan respecto a él. */
  centro?: THREE.Vector3
  resolucion?: number
  /** Ruta del HDRI de estudio servido por el sitio. */
  hdri?: string
  /**
   * Más luz para fondos oscuros (1 = el estudio tal cual, el del póster de Cycles). Multiplica las cuatro cajas de luz
   * (espejo, contornos y tira superior) dejando el pie del espejo donde estaba: la cara sigue muriendo en negro y solo sube
   * su parte alta y los filos.
   */
  realce?: number
}

/**
 * Entorno de estudio horneado UNA vez (frames=1): cero coste por cuadro. La pieza puede moverse (puntero,
 * scroll) y el reflejo corre por su cara como en una foto de producto real; el estudio no se mueve.
 */
export function EntornoEstudio({
  yaw = 22, tilt = 6, camara = new THREE.Vector3(0, 0.55, 12.5), escala = 1, resolucion = 256,
  hdri = '/3d/hdri/studio_small_09_512.hdr', centro = new THREE.Vector3(), realce = 1,
}: EntornoProps) {
  const mapa = useMemo(() => texturaDegradado(realce), [realce])
  const s = escala
  const c = centro
  const espejo = useMemo(
    () => posicionEspejo(yaw, tilt, camara.clone().sub(c), s).add(c),
    [yaw, tilt, camara, s, c],
  )
  const en = (x: number, y: number, z: number) => new THREE.Vector3(x * s, y * s, z * s).add(c)
  const t = c.toArray() as [number, number, number]
  return (
    <Environment resolution={resolucion} frames={1}>
      <Lightformer form="rect" map={mapa} intensity={3.2 * realce} position={espejo} scale={[7 * s, 1.8 * s, 1]} target={t} />
      <Lightformer form="rect" intensity={26 * realce} color={lin(0.93, 0.95, 1)} position={en(-4.6, 0.8, -2.2)} scale={[0.3 * s, 7 * s, 1]} target={t} />
      <Lightformer form="rect" intensity={20 * realce} color={lin(0.8, 0.72, 1)} position={en(4.6, 1.0, -2.4)} scale={[0.3 * s, 7 * s, 1]} target={t} />
      <Lightformer form="rect" intensity={10 * realce} position={en(0, 5, -1)} scale={[6 * s, 0.5 * s, 1]} target={t} />
      {/* HDRI a 0.35 como fondo del entorno virtual = el mundo de Cycles */}
      <Environment files={hdri} background backgroundIntensity={0.35} />
    </Environment>
  )
}

/** Ajustes del renderer que exige la paridad con Cycles (Khronos PBR Neutral). */
export function configurarRenderer(gl: THREE.WebGLRenderer, camera: THREE.Camera) {
  gl.toneMapping = THREE.NeutralToneMapping
  camera.rotation.set(-3 * DEG, 0, 0)
}
