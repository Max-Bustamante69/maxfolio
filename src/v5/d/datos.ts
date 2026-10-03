import { useMemo } from 'react'
import { datosDe, useV5, type Obra, type ObraKind } from '../data'

// Derivaciones sobre useV5(): orden, filtros y cuentas. Ninguna cifra se teclea aquí.

/** Frases del registro que la dirección no imprime: cifras sin conteo en el repo, plazos y métodos de pago y «en vivo»
 *  (CONTENIDO-VERDAD §4.3, §8.3; la cifra pública habla de tiendas «construidas»). Se quitan por frase; useV5() no las toca todavía. */
const RESTRINGIDO = /260\s*\+|mismo d[ií]a|same-day|\b9[5-9]\s*\+|contra ?entrega|cash on delivery|en vivo|\blive\b|digitdeck\.co\b/i
export const publico = (texto: string) =>
  texto
    .split(/(?<=[.!?。])\s+/)
    .filter((frase) => !RESTRINGIDO.test(frase))
    .join(' ')

/** Una obra con sus textos pasados por `publico`: tagline, descripción y hechos sin frases restringidas. */
export const limpia = (o: Obra): Obra => ({
  ...o,
  tagline: publico(o.tagline),
  description: publico(o.description),
  facts: o.facts.filter((f) => !RESTRINGIDO.test(`${f.label} ${f.value}`)),
})

export const TIPOS: ObraKind[] = ['store', 'product', 'personal', 'role']

/** Las ocho etiquetas de la taxonomía FEATURES del sitio vivo (ShopifyWork.tsx). «Islas React» sale de la telemetría. */
export const TECNOLOGIAS = [
  { id: 'bundles', test: /bundle/i },
  { id: 'quiz', test: /quiz/i },
  { id: 'subscriptions', test: /subscription/i },
  { id: 'reviews', test: /review/i },
  { id: 'migration', test: /woocommerce|framer|migrat|port/i },
  { id: 'islands', test: /react/i },
  { id: 'tracking', test: /track|pixel|analytics/i },
  { id: 'i18n', test: /bilingual|currency|dual/i },
] as const

export const tieneTecnologia = (o: Obra, id: string) => {
  if (id === 'islands') {
    const git = datosDe(o.slug).git
    return git ? git.lines.islands > 0 : o.stack.some((t) => /react/i.test(t))
  }
  return o.stack.some((t) => TECNOLOGIAS.find((f) => f.id === id)?.test.test(t))
}

/** Rol para el filtro: construida, migrada o personalizada sobre una base de tercero (Millennio, Pixxiesx). */
export const rolDe = (o: Obra, etiquetas: Record<string, string>) =>
  o.kind !== 'store' || !o.role ? undefined : o.rolLabel === etiquetas[o.role] ? o.role : 'custom'

const fin = (o: Obra) => o.period?.end ?? `${o.year}-12`
const inicio = (o: Obra) => o.period?.start ?? `${o.year}-01`

/** Orden de la matriz: primero las tiendas cuyo tema era de Digitdeck al medir (las que Max respalda con datos),
 *  luego por fin y comienzo de construcción, y por commits. */
export const ordenar = (obras: Obra[]) => {
  const peso = (o: Obra) => (o.tema === 'digitdeck' ? 0 : o.kind === 'store' ? 1 : 2)
  return [...obras].sort((a, b) => peso(a) - peso(b) || fin(b).localeCompare(fin(a)) || inicio(b).localeCompare(inicio(a)) || (b.commits ?? 0) - (a.commits ?? 0))
}

/** Las obras con captura real, de la más reciente a la más antigua. */
export const conCaptura = (obras: Obra[]) => ordenar(obras.filter((o) => o.views.length > 0 && o.tema !== 'por-confirmar'))

/** Etiqueta del stack → producto propio que la explica. La tabla la valida Max (Q11). */
export const HECHO_CON: Record<string, string> = {
  'Bundles app': 'digitdeck-apps',
  'Bundle builder': 'digitdeck-apps',
  'Review wall': 'digitdeck-apps',
  'A/B testing': 'digitdeck-apps',
  'Digitdeck Track': 'track',
}

export const cuentaStack = (obras: Obra[], re: RegExp) => obras.filter((o) => o.stack.some((t) => re.test(t))).length

/** Qué nombra el stack de las fichas para cada capa del despiece (regex escritas a mano, como skillUsage). */
export const CAPAS_RE: Record<string, RegExp | null> = {
  tema: /liquid/i,
  islas: null, // se cuenta con la telemetría de git, no con el texto del stack
  apps: /bundles app|bundle builder|subscriptions|review wall|a\/b testing/i,
  functions: /shopify functions|web pixel|theme app extension/i,
  medicion: /digitdeck track/i,
  qa: /playwright/i,
}

/** Fechas de los datos de git, Lighthouse y catálogo (las del propio registro, la primera tienda que las trae). */
export function fechasDeDatos(obras: Obra[]) {
  const f = { git: '', lh: '', catalogo: '' }
  for (const o of obras) {
    const d = datosDe(o.slug)
    f.git ||= d.git?.fecha ?? ''
    f.lh ||= d.lighthouse?.fecha ?? ''
    f.catalogo ||= d.comercio?.fecha ?? ''
  }
  return f
}

/** Las obras de useV5() con sus textos pasados por `limpia`: lo único que la dirección pinta. */
export function useObras() {
  const { obras } = useV5()
  return useMemo(() => obras.map(limpia), [obras])
}

/** Periodo de construcción en UNA línea: «jun 2026 – sep 2026» (el formateador del sitio escribe «jun de 2026 - sept de 2026»,
 *  que parte en dos líneas en una columna de la matriz). */
const MESES = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
export function usePeriodo() {
  const { locale } = useV5()
  return useMemo(() => {
    const mes = (ym: string) => {
      const [y, m] = ym.split('-').map(Number)
      return locale === 'ja' ? `${y}年${m}月` : `${MESES[locale === 'es' ? 'es' : 'en'][m - 1]} ${y}`
    }
    return (inicio: string, fin: string) => (inicio === fin ? mes(inicio) : `${mes(inicio)} – ${mes(fin)}`)
  }, [locale])
}

/** Fecha en que se confirmó la disponibilidad que dice `hero.availability`. La actualiza Max; si pasan más de 45 días sin
 *  actualizarla, el LED baja y la línea declara su fecha (spec D.7, riesgo 2): el LED significa lo que dice, no «siempre». */
export const DISPONIBILIDAD_AL = '2026-09-30'
export const disponibilidadVencida = () => Date.now() - Date.parse(DISPONIBILIDAD_AL) > 45 * 864e5
