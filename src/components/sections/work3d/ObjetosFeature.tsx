import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Pieza3D } from '../../../three/Pieza3D'

/**
 * Objetos-hecho de una tienda (p3 del estudio obsidiana): 1-2 piezas por fila, elegidas por la MISMA taxonomía
 * `FEATURES` que ya filtra la lista (bundles, quiz, subscriptions, reviews, migration, islands, tracking, i18n).
 * Este módulo solo se descarga con `?3d=1` (ShopifyWork lo importa en diferido), así que sin el flag la fila es la de siempre.
 *
 * Reglas de coste (TECNICA-3D-WEB.md): por defecto cada objeto es su póster estático; el 3D solo se monta en la fila sobre
 * la que se pasa el puntero (o se enfoca con teclado, o la que abre la órbita de habilidades), y se conservan a lo sumo
 * `MAX_VIVAS` filas en 3D a la vez (la última que se dejó sigue viva, quieta en su pose de reposo, para que al irse el
 * puntero no parpadee entre el 3D y el póster). Con puntero táctil, reduced-motion, gama baja o sin WebGL2 se queda en póster.
 */
const MAX_VIVAS = 3
/** Retardo de intención: pasar el puntero de largo por 20 filas no monta 20 vistas. */
const INTENCION_MS = 120

// --- filas vivas (LRU) fuera de React: el estado es del módulo, la fila solo se suscribe -----------------------------
let vivas: readonly string[] = []
const oyentes = new Set<() => void>()
const suscribir = (f: () => void) => {
  oyentes.add(f)
  return () => void oyentes.delete(f)
}
const leer = () => vivas
function activar(id: string) {
  if (vivas[vivas.length - 1] === id) return
  vivas = [...vivas.filter((x) => x !== id), id].slice(-MAX_VIVAS)
  oyentes.forEach((f) => f())
}

function useMedia(consulta: string) {
  const [v, setV] = useState(() => matchMedia(consulta).matches)
  useEffect(() => {
    const m = matchMedia(consulta)
    const f = () => setV(m.matches)
    f()
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [consulta])
  return v
}

/**
 * El póster de cada objeto es 4:3 con el objeto en el 20-79 % del ancho y el 9-91 % del alto (medido sobre el alfa de los
 * 8 pósters): la caja se desplaza para que el OBJETO (no su margen transparente) quede alineado con el borde de la fila.
 */
const OBJ_X0 = 0.2
const OBJ_ANCHO = 0.59

// Ajustes de la caja del póster; el margen transparente se solapa con el hueco de al lado.
const css = `.w3d-obj picture img{transition-duration:140ms!important}`

interface Props {
  /** Slug de la tienda (identifica la fila en la lista de filas vivas). */
  id: string
  /** Características de la tienda, por prioridad (la del filtro activo va primero). Vacío = solo el hueco. */
  features: string[]
  /** Etiqueta legible de cada característica (la misma de los chips de filtro), para el `title`. */
  etiquetas: Record<string, string>
  /** La órbita de habilidades acaba de abrir esta fila: cuenta como «tarjeta abierta». */
  resaltada: boolean
  alAbrir: () => void
}

export default function ObjetosFeature({ id, features, etiquetas, resaltada, alAbrir }: Props) {
  const raiz = useRef<HTMLDivElement>(null)
  const grande = useMedia('(min-width: 768px)')
  const doble = useMedia('(min-width: 1280px)')
  const vivo = useSyncExternalStore(suscribir, leer, leer).includes(id)

  // Hover con puntero fino / foco de teclado sobre TODA la fila (el <li> más cercano), sin tocar el JSX de ShopifyWork.
  useEffect(() => {
    const fila = raiz.current?.closest('li')
    if (!fila || features.length === 0) return
    let t = 0
    const entra = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      clearTimeout(t)
      t = window.setTimeout(() => activar(id), INTENCION_MS)
    }
    const sale = () => clearTimeout(t)
    const foco = (e: FocusEvent) => {
      if ((e.target as Element).matches(':focus-visible')) activar(id)
    }
    fila.addEventListener('pointerenter', entra)
    fila.addEventListener('pointerleave', sale)
    fila.addEventListener('focusin', foco)
    return () => {
      clearTimeout(t)
      fila.removeEventListener('pointerenter', entra)
      fila.removeEventListener('pointerleave', sale)
      fila.removeEventListener('focusin', foco)
    }
  }, [id, features.length])
  useEffect(() => {
    if (resaltada && features.length > 0) activar(id)
  }, [resaltada, id, features.length])

  const caja = grande ? 152 : 128 // ancho de la caja del póster; el objeto mide ~59 % → 90 px / 76 px
  const alto = grande ? 96 : 80 // alto que reserva en la fila (el objeto ocupa el 81 % del alto de su caja)
  const objAncho = caja * OBJ_ANCHO
  const paso = objAncho + 8
  const n = Math.min(features.length, doble ? 2 : 1)
  // El hueco mide lo mismo en TODAS las filas (con o sin objetos) para que los nombres queden alineados.
  const hueco = (doble ? paso : 0) + objAncho + 16

  return (
    <div
      ref={raiz}
      aria-hidden="true"
      className="w3d-obj shrink-0"
      onClick={features.length > 0 ? alAbrir : undefined}
      style={{ position: 'relative', width: hueco, height: alto, marginTop: grande ? 0 : 6, cursor: features.length > 0 ? 'pointer' : undefined }}
    >
      <style href="w3d-obj" precedence="default">
        {css}
      </style>
      {features.slice(0, n).map((f, i) => (
        <div
          key={f}
          title={etiquetas[f]}
          style={{ position: 'absolute', left: i * paso - caja * OBJ_X0, top: -((caja * 0.75 - alto) / 2), width: caja }}
        >
          <Pieza3D slug="objetos-feature" estado={f} soloPoster={!vivo} interactiva={vivo} alt="" sizes={`${caja}px`} style={{ width: '100%' }} />
        </div>
      ))}
    </div>
  )
}
