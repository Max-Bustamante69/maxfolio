import { Suspense, lazy, useLayoutEffect, useMemo, useRef, type ComponentType } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { View, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { DEG, EntornoEstudio, camaraDesdeJson, type CamaraAsset } from './estudio'
import { CARGADORES } from './piezas'
import type { ModuloPieza, PropsPieza, SlugPieza } from './tipos'

/**
 * Cubemap del entorno de cada vista. UNA sola resolución para todas: medido, mezclar tamaños distintos en el mismo
 * renderer hace que el PMREM de three salga inestable (el relieve cambiaba de luminancia 57→38 entre cargas según qué
 * piezas hubiera montado antes). 256 iguala a 512/1024 en paridad con el póster y cuesta 4× menos memoria por vista.
 */
const RESOLUCION_ENTORNO = 256

// Los GLB del estudio van con Draco: decodificador servido por el propio sitio (no del CDN de gstatic).
useGLTF.setDecoderPath('/draco/')

/** Cámara del asset (misma distancia, fov e inclinación que su póster de Cycles), una por vista. */
function CamaraPieza({ c, recorte }: { c: CamaraAsset; recorte?: [number, number, number, number] }) {
  const set = useThree((s) => s.set)
  const get = useThree((s) => s.get)
  const cam = useMemo(() => {
    const { posicion, fov } = camaraDesdeJson(c)
    const k = new THREE.PerspectiveCamera(fov, c.rx / c.ry, Math.min(0.1, c.dist * 0.05), c.dist * 4)
    k.position.copy(posicion)
    k.rotation.set(-c.inclinacion_deg * DEG, 0, 0)
    if (recorte) {
      // El póster web es un recorte [x0,y0,x1,y1] del lienzo de la cámara: proyección asimétrica que encuadra
      // exactamente esa caja (la caja de la vista tiene su misma proporción). Sobrevive a que la vista reajuste `aspect`.
      const af = c.rx / c.ry
      const [x0, y0, x1, y1] = recorte
      k.updateProjectionMatrix = function (this: THREE.PerspectiveCamera) {
        const h = (2 * this.near * Math.tan(DEG * 0.5 * this.fov)) / this.zoom
        const w = af * h
        this.projectionMatrix.makePerspective(-w / 2 + x0 * w, -w / 2 + x1 * w, h / 2 - y0 * h, h / 2 - y1 * h, this.near, this.far, this.coordinateSystem)
        this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
      }
    }
    k.updateProjectionMatrix()
    k.updateMatrixWorld()
    return k
  }, [c, recorte])
  useLayoutEffect(() => {
    const anterior = get().camera
    set({ camera: cam })
    return () => set({ camera: anterior })
  }, [cam, set, get])
  return null
}

/** Avisa al DOM cuando la vista ya dibujó de verdad (pieza + entorno resueltos): ahí se desvanece el póster. */
function AvisoCuadro({ onDibujada }: { onDibujada: () => void }) {
  const n = useRef(0)
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => {
    invalidate(3)
  }, [invalidate])
  useFrame(() => {
    if (n.current++ === 2) onDibujada()
  }, 2) // después del render de la vista (prioridad 1)
  return null
}

interface PropsVista {
  slug: SlugPieza
  estado?: string
  interactiva: boolean
  animar: boolean
  progreso: () => number
  puntero: PropsPieza['puntero']
  acento?: PropsPieza['acento']
  seleccionado?: string
  periodoPulsoMs?: number
  captura?: string
  /** Más luz de estudio (ver `Pieza3DProps.realce`). */
  realce?: number
  /** Falso = la vista no se dibuja (scroll rápido: se ve el póster del DOM). */
  visible: boolean
  onDibujada: () => void
}

type PropsContenido = Omit<PropsVista, 'visible'>

function Montaje({ mod, onDibujada, realce = 1, ...p }: PropsContenido & { mod: ModuloPieza }) {
  const cam = mod.camaraDe(p.estado)
  const { posicion, centro } = useMemo(() => camaraDesdeJson(cam), [cam])
  const Pieza = mod.default
  const invalidate = useThree((s) => s.invalidate)
  // El entorno se hornea una vez (frames=1): un realce nuevo (cambio de tema) lo remonta con `key` y pide cuadros para hornearlo.
  useLayoutEffect(() => {
    invalidate(3)
  }, [invalidate, realce])
  return (
    <>
      <CamaraPieza c={cam} recorte={mod.recorte} />
      <Pieza {...p} />
      <EntornoEstudio key={realce} yaw={cam.yaw} tilt={cam.tilt} escala={cam.escala} camara={posicion} centro={centro}
        hdri="/3d/hdri/studio_small_09_512.hdr" resolucion={RESOLUCION_ENTORNO} realce={realce} />
      <AvisoCuadro onDibujada={onDibujada} />
    </>
  )
}

/** Un chunk por gemela (three, GLB y normal maps solo se piden si la página monta esa pieza). */
const cache = new Map<SlugPieza, ComponentType<PropsContenido>>()
function contenidoDe(slug: SlugPieza) {
  let c = cache.get(slug)
  if (!c) {
    c = lazy(async () => {
      const mod = await CARGADORES[slug]()
      return { default: (p: PropsContenido) => <Montaje mod={mod} {...p} /> }
    })
    cache.set(slug, c)
  }
  return c
}

/**
 * La vista de una pieza dentro del Canvas persistente. `<View>` (fuera del Canvas) deja un div rastreado en el
 * DOM y túnel-a su contenido al `View.Port` de Escena3D. Lo que suspende (GLB, HDRI, normal map) queda dentro
 * de este Suspense, así la pieza aparece de golpe y nunca deja bloqueado el resto del Canvas.
 */
export default function Vista({ visible, ...props }: PropsVista) {
  const Contenido = contenidoDe(props.slug)
  return (
    <View visible={visible} style={{ position: 'absolute', inset: 0, pointerEvents: props.interactiva ? 'auto' : 'none' }}>
      <Suspense fallback={null}>
        <Contenido {...props} />
      </Suspense>
    </View>
  )
}
