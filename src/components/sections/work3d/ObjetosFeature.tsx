import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Pieza3D } from '../../../three/Pieza3D'

/**
 * Objeto-hecho de una tienda (p3 del estudio obsidiana): UNO por fila, el de la primera característica que coincide con
 * la MISMA taxonomía `FEATURES` que ya filtra la lista (bundles, quiz, subscriptions, reviews, migration, islands,
 * tracking, i18n); con un filtro activo, el de ese filtro. Este módulo solo se descarga con `?3d=1` (ShopifyWork lo
 * importa en diferido), así que sin el flag la fila es la de siempre.
 *
 * Solo desde 1280 px: el objeto es una losa de ~66 px que dice «hay una característica», y el nombre y la cifra tienen
 * que seguir empezando en el margen. Por debajo (móvil, tableta, Terminal a 320-360 px) la fila no cambia ni se pide su
 * póster.
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
const CAJA = 108 // ancho de la caja del póster → el objeto mide ~64 px
const ALTO = 72 // alto que reserva en la fila (el objeto ocupa el 81 % del alto de su caja)
/** El hueco mide lo mismo en TODAS las filas (con o sin objeto) para que los nombres queden alineados (el aire lo pone el `gap` de la fila). */
const HUECO = Math.round(CAJA * OBJ_ANCHO)

// El póster se desvanece bajo el 3D en 140 ms (los objetos son pequeños: 450 ms se notaría como un parpadeo).
const css = `.w3d-obj{--fundido-3d:140ms}`

export interface ObjetosFeatureProps {
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

function Objeto({ id, features, etiquetas, resaltada, alAbrir }: ObjetosFeatureProps) {
  const raiz = useRef<HTMLDivElement>(null)
  const vivo = useSyncExternalStore(suscribir, leer, leer).includes(id)
  const f = features[0]

  // Hover con puntero fino / foco de teclado sobre TODA la fila (el <li> más cercano), sin tocar el JSX de ShopifyWork.
  useEffect(() => {
    const fila = raiz.current?.closest('li')
    if (!fila || !f) return
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
  }, [id, f])
  useEffect(() => {
    if (resaltada && f) activar(id)
  }, [resaltada, id, f])

  return (
    <div
      ref={raiz}
      aria-hidden="true"
      className="w3d-obj shrink-0"
      onClick={f ? alAbrir : undefined}
      style={{ position: 'relative', width: HUECO, height: ALTO, cursor: f ? 'pointer' : undefined }}
    >
      <style href="w3d-obj" precedence="default">
        {css}
      </style>
      {f && (
        <div title={etiquetas[f]} style={{ position: 'absolute', left: -CAJA * OBJ_X0, top: -((CAJA * 0.75 - ALTO) / 2), width: CAJA }}>
          <Pieza3D slug="objetos-feature" estado={f} soloPoster={!vivo} interactiva={vivo} alt="" sizes={`${CAJA}px`} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  )
}

export default function ObjetosFeature(props: ObjetosFeatureProps) {
  return useMedia('(min-width: 1280px)') ? <Objeto {...props} /> : null
}
