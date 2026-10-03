import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { datosDe, useV5, type Obra } from '../data'

// Capa de lectura de la dirección A: numeración del libro, orden, filtros y la última guarda de afirmaciones.
// Todo dato sale de useV5() / datosDe(); aquí solo se ordena, se cuenta y se descartan textos que el repo no sostiene.

/** Afirmaciones que ninguna vista imprime (guardia de DIRECCIONES.md K.0): se descarta la oración o el hecho que las lleve. */
const PROHIBIDO = /\b9[5-9]\s*\+|\b260\s*\+|\b800\s*\+|digitdeck\.co\b|en vivo|\blive\b|same-day|mismo d[ií]a|cada build|every build|every store here|testimoni/i

/** Quita del texto las oraciones con una afirmación sin fuente (p. ej. «260+ elementos medidos», «En vivo en …»). */
export function limpiar(texto: string) {
  return texto.split(/(?<=[.!?。])\s+/).filter((s) => !PROHIBIDO.test(s)).join(' ').trim()
}
export const hechoOk = (h: { label: string; value: string }) => !PROHIBIDO.test(`${h.label} ${h.value}`)
/** La pila sin cifras de CV pegadas a una etiqueta («Lighthouse 90+», «20+ components»): esas viven en el cargo, atribuidas. */
export const pila = (o: Obra) => o.stack.filter((s) => !/\d\s*\+/.test(s))

/** Taxonomía de etiquetas de ShopifyWork.tsx. «Multimoneda» no se aplica a «Dual pricing» (es doble precio, no doble moneda). */
const TEC: [string, RegExp][] = [
  ['bundles', /bundle/i], ['quiz', /quiz/i], ['subscriptions', /subscription/i], ['reviews', /review/i],
  ['migration', /woocommerce|framer|migrat|port/i], ['tracking', /track|pixel|analytics/i], ['i18n', /bilingual|currency/i],
]

export interface ObraLibro extends Obra {
  /** Posición entre las tiendas por fecha de primer commit (o primer día de la ventana), empates por orden del registro. */
  n?: number
  tec: string[]
  clave: string
}

export function useLibro() {
  const v5 = useV5()
  return useMemo(() => {
    const base = v5.obras.map((o, i) => {
      const git = datosDe(o.slug).git
      const clave = git?.first ?? (o.period ? `${o.period.start}-01` : `${o.year}-01-01`)
      const tec = o.kind === 'store' || o.kind === 'product' ? TEC.filter(([, re]) => o.stack.some((t) => re.test(t))).map(([id]) => id) : []
      if (o.kind === 'store' && (git?.lines.islands ?? 0) > 0) tec.push('islands')
      return { o, i, clave, tec }
    })
    const numero = new Map(
      base.filter((b) => b.o.kind === 'store').sort((a, b) => a.clave.localeCompare(b.clave) || a.i - b.i).map((b, k) => [b.o.slug, k + 1]),
    )
    // Orden del libro: año ↓ y, dentro del año, por el MISMO número que se imprime (↓): la columna Nº nunca sale desordenada.
    // Lo que no es tienda no lleva número y va al final de su año, por fecha ↓ y orden del registro.
    const obras: ObraLibro[] = base
      .sort((a, b) => b.o.year - a.o.year || (numero.get(b.o.slug) ?? -1) - (numero.get(a.o.slug) ?? -1) || b.clave.localeCompare(a.clave) || a.i - b.i)
      .map((b) => ({ ...b.o, n: numero.get(b.o.slug), tec: b.tec, clave: b.clave }))
    const mismaClase = (o: ObraLibro) => obras.filter((x) => x.kind === o.kind)
    return {
      ...v5,
      obras,
      tiendas: obras.filter((o) => o.kind === 'store'),
      libro: (slug: string) => obras.find((o) => o.slug === slug),
      /** Anterior y siguiente en el orden del libro, dentro del mismo tipo. */
      vecinos: (o: ObraLibro) => {
        const l = mismaClase(o)
        const k = l.findIndex((x) => x.slug === o.slug)
        return { anterior: l[k - 1], siguiente: l[k + 1] }
      },
    }
  }, [v5])
}

export type Orden = 'anio' | 'nombre'
const FACETAS = ['tipo', 'anio', 'rol', 'tec'] as const
type Faceta = (typeof FACETAS)[number]

/** Filtros del índice en la URL: ?tipo=store&anio=2026&rol=built&tec=quiz&orden=nombre (un valor por faceta, tocar de nuevo lo quita). */
export function useFiltros(obras: ObraLibro[]) {
  const [params, setParams] = useSearchParams()
  const valor = Object.fromEntries(FACETAS.map((k) => [k, params.get(k)])) as Record<Faceta, string | null>
  const orden: Orden = params.get('orden') === 'nombre' ? 'nombre' : 'anio'
  const activos = FACETAS.filter((k) => valor[k]).length

  const resultado = obras
    .filter((o) => (!valor.tipo || o.kind === valor.tipo) && (!valor.anio || String(o.year) === valor.anio) && (!valor.rol || o.role === valor.rol) && (!valor.tec || o.tec.includes(valor.tec)))
    .sort((a, b) => (orden === 'nombre' ? a.name.localeCompare(b.name) : 0))

  const cambiar = (fn: (p: URLSearchParams) => void) =>
    setParams((prev) => { const p = new URLSearchParams(prev); fn(p); return p }, { replace: true, flushSync: true })
  return {
    valor, orden, activos, resultado,
    fijar: (k: Faceta, v: string) => cambiar((p) => (p.get(k) === v ? p.delete(k) : p.set(k, v))),
    ordenar: (o: Orden) => cambiar((p) => (o === 'anio' ? p.delete('orden') : p.set('orden', o))),
    limpiar: () => cambiar((p) => FACETAS.forEach((k) => p.delete(k))),
  }
}
