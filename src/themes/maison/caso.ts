import { datosDe, type Obra, type useV5 } from '../data'
import { frases, limpioTexto } from './publico'

type V = Pick<ReturnType<typeof useV5>, 'strings' | 'registry' | 'intlLocale'>
const llenar = (t: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), t)
export const sinProtocolo = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export interface Beat { label: string; body: string }

/**
 * El caso de The Gummy Box (problema, plan, construcción, resultado): los textos del vivo con sus cifras. La línea de Lighthouse
 * y de LCP del «resultado» no se imprime aquí: la medición de laboratorio vive, con su fecha, al final de «Oficio».
 */
const SIN_LAB = [/[^.。,，、]*\{perfDesktop\}[^.。,，、]*[,，、]\s*/, /LCPは\{lcpDesktop\}秒。/]
const mayuscula = (s: string) => s.replace(/(^|[.]\s+)([a-zñáéíóú])/g, (_, a: string, b: string) => a + b.toUpperCase())
export function casoGummy(v: V, enlace?: string) {
  const { git } = datosDe('the-gummy-box')
  if (!git) return null
  const fb = v.strings.sections.featuredBuild
  const ladder = v.registry.stores.find((s) => s.slug === 'the-gummy-box')?.facts.find((f) => f.id === 'ladder')?.value ?? ''
  const vars = { ladder, sections: git.sections, blocks: git.blocks ?? 0, trackedComponents: git.trackedComponents ?? 0, url: enlace ? sinProtocolo(enlace) : '' }
  return fb.beats.map((b): Beat => ({ label: b.label, body: mayuscula(limpioTexto(llenar(SIN_LAB.reduce((t, re) => t.replace(re, ' '), b.body), vars))).replace(/。\s+/g, '。') }))
}

/**
 * Toda tienda cuenta su caso en dos tiempos con las frases de su propia descripción: la primera es el encargo (qué se pidió) y el
 * resto, lo que se construyó. Nada se escribe aparte, así que ningún número ni afirmación sale de este archivo. Las piezas cuya
 * primera frase ya es la construcción (no hay encargo) lo dicen aquí; con una sola frase se cuenta tal cual.
 */
const SIN_ENCARGO = new Set(['mindfuel', 'sebum', 'valdo-cafe'])
export function casoCorto(o: Obra, rotulos: { encargo: string; construi: string }): Beat[] | null {
  if (!o.description || o.kind !== 'store') return null
  const f = frases(o.description)
  const unir = (x: string[]) => x.join(/。/.test(o.description) ? '' : ' ')
  if (SIN_ENCARGO.has(o.slug)) return [{ label: rotulos.construi, body: unir(f) }]
  if (f.length < 2) return null
  return [{ label: rotulos.encargo, body: unir(f.slice(0, 1)) }, { label: rotulos.construi, body: unir(f.slice(1)) }]
}

/**
 * El resultado de una pieza, en el lugar donde una casa de moda pone el precio. Solo entra una cifra que el registro sostiene y que
 * describe alcance medible de la obra: elementos medidos, anuncios convertidos, cada cuánto se sincroniza el catálogo. Las
 * escaleras de descuento, las fechas, los pares sueltos y el recuento del catálogo del cliente no son resultado (el catálogo vive en
 * «Hechos»). Sin cifra, el lugar del precio lo ocupa el alcance, con las palabras del cliente (`obra.tagline`).
 */
const ES_RESULTADO = new Set(['tracked', 'ads', 'sync'])
export interface Resultado { cifra: string; que?: string; nota?: string; hecho?: string }
export function resultadoDe(o: Obra, v: V, nota: string): Resultado | null {
  const reg = v.registry.stores.find((s) => s.slug === o.slug)?.facts.find((f) => ES_RESULTADO.has(f.id) && o.facts.some((x) => x.value === f.value))
  const hecho = reg && o.facts.find((x) => x.value === reg.value)
  if (hecho) return { cifra: hecho.value, que: hecho.label, nota, hecho: hecho.value }
  return null
}

export { llenar }
