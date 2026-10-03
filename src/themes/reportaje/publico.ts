import { useMemo } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useV5, type Obra } from '../data'

// Capa pública de El Reportaje. El contenido del vivo trae unas pocas frases del registro que afirman algo que el repo no
// sostiene o que la guardia de afirmaciones prohíbe (método de pago, entrega «el mismo día», plazo de respuesta, garantías,
// idioma de Max, dominio sin DNS, reseñas «sembradas»). Aquí NO se imprimen: primero un retoque exacto que quita solo la
// cláusula y, como red de seguridad, cualquier frase que aún case se descarta entera. Misma lista que vigila la sonda de capturas.
const PROHIBIDO = [
  /\b98\s*\+/,
  /testimoni/i,
  /same[- ]day|mismo d[ií]a|当日/i,
  /japon[eé]s|japanese/i,
  /\b(visa|mastercard|paypal|addi|sistecr[eé]dito)\b/i,
  /contra ?entrega|cash[- ]on[- ]delivery|代引き/i,
  /digitdeck\.co\b/i,
  /d[ií]a h[aá]bil|business day|営業日/i,
  /garant[ií]a|warranty|guarantee|保証/i,
  /sembrad[ao]s?|seeded|シードレビュー|初期レビュー/i,
  /rese[ñn]as con foto|reviews with photos|写真付きレビュー/i,
]
export const prohibido = (s: string) => PROHIBIDO.some((re) => re.test(s))

/** Retoques exactos del registro (es · en · ja): quitan la cláusula y dejan el resto de la frase en pie. */
const RETOQUES: Array<[RegExp, string]> = [
  [/,\s*flujo contra entrega/, ''], [/,\s*cash-on-delivery flow/, ''], [/、代引きフロー/, ''],
  [/,\s*y el flujo contra entrega[^.]*(?=\.)/, ''], [/,\s*and the cash-on-delivery flow[^.]*(?=\.)/, ''], [/し、Releasitの代引きフローはオファー単位で同期。19件中19件が一致しています/, 'しています'],
  [/\s+y mensajes de entrega el mismo día/, ''], [/\s+and same-day delivery messaging/, ''], [/、当日配送の案内/, ''],
  [/\s*302 reseñas sembradas con fotos \(80\+ por producto\),/, ''], [/,\s*302 reseñas sembradas/, ''],
  [/\s*302 seeded reviews with photos \(80\+ per product\),/, ''], [/,\s*302 seeded reviews/, ''],
  [/写真付きの初期レビュー302件（商品あたり80件以上）、/, ''], [/302件のシードレビュー、/, ''],
]

/** Hechos que son un plazo («de la transferencia al aire: 24 h»): la casa no imprime plazos, así que no salen ni como cifra ni en la hoja. */
const PLAZO = /transferencia al aire|from transfer to live|移行から公開まで/i

/** Frase a frase (también con el punto japonés). */
export const frases = (s: string) => s.split(/(?<=[.!?])\s+|(?<=。)/).filter(Boolean)
const junta = (s: string, partes: string[]) => partes.join(/。/.test(s) ? '' : ' ')

/** El texto tal cual, con los retoques aplicados y sin las frases que no se imprimen. */
export function limpioTexto(s?: string | null): string {
  if (!s) return ''
  const t = RETOQUES.reduce((acc, [re, por]) => acc.replace(re, por), s)
  return junta(t, frases(t).filter((f) => !prohibido(f)))
}

/** Primera frase y el resto (la primera va como entrada y el resto, como cuerpo). */
export function partirFrase(s: string): [string, string] {
  const [a = '', ...resto] = frases(s)
  return [a, junta(s, resto)]
}

/** Un título sin el punto final (la sonda rechaza h1/h2 que terminen en punto). */
export const sinPunto = (s: string) => s.replace(/[.。]\s*$/, '')

/** Eslóganes que dicen algo que la guardia no deja pasar (aquí, el idioma): se sustituyen por lo que la app hace. */
const ESLOGAN: Record<string, { es: string; en: string; ja: string }> = {
  kotodama: {
    es: 'Repetición espaciada, escucha, kanji y misiones de lectura.',
    en: 'Spaced repetition, listening, kanji and reading quests.',
    ja: '間隔反復、リスニング、漢字、読解クエスト。',
  },
}

/** La obra tal como esta dirección la imprime: texto sin afirmaciones fuera de lugar y hechos sin el dato del cobro. */
export function limpiaObra(o: Obra, locale: 'es' | 'en' | 'ja'): Obra {
  return {
    ...o,
    tagline: ESLOGAN[o.slug]?.[locale] ?? limpioTexto(o.tagline),
    description: limpioTexto(o.description),
    facts: o.facts.filter((f) => !prohibido(`${f.label} ${f.value}`) && !PLAZO.test(f.label)),
    stack: o.stack.filter((x) => !prohibido(x)),
  }
}

/** useV5() con la obra ya saneada: toda vista de esta dirección lee de aquí. */
export function usePublico() {
  const v = useV5()
  const { locale } = useLanguage()
  return useMemo(() => {
    const obras = v.obras.map((o) => limpiaObra(o, locale))
    const tiendas = v.registry.stores
    return {
      ...v,
      obras,
      obra: (slug: string) => obras.find((o) => o.slug === slug),
      /** Lo que el vivo cuenta bajo «Ahora»: las tiendas del registro por estado. */
      enVivo: tiendas.filter((s) => s.status === 'live').length,
      enConstruccion: tiendas.filter((s) => s.status === 'dev').length,
    }
  }, [v, locale])
}

/** Capacidades por las que se filtra la obra: las mismas del vivo (maxfolio.dev), detectadas en el stack declarado de cada tienda. */
export const CAPACIDADES = [
  { id: 'bundles', test: /bundle/i },
  { id: 'quiz', test: /quiz/i },
  { id: 'subscriptions', test: /subscription/i },
  { id: 'reviews', test: /review/i },
  { id: 'migration', test: /woocommerce|framer|migrat|port/i },
  { id: 'islands', test: /react/i },
  { id: 'tracking', test: /track|pixel|analytics/i },
  { id: 'i18n', test: /bilingual|currency|dual/i },
] as const
export type CapacidadId = (typeof CAPACIDADES)[number]['id']
export const capacidadesDe = (o: Obra): CapacidadId[] => CAPACIDADES.filter((c) => o.stack.some((t) => c.test.test(t))).map((c) => c.id)

/** Un hecho con cifra delante (10% → 20%, 260+, 19/19, 24 h) se compone como número; los demás van en la hoja de datos. */
export const numerico = (valor: string) => /^\d/.test(valor) && valor.length <= 13

/** Hechos del registro que no son un resultado de la tienda (fecha de salida, idiomas) o que no se imprimen (reseñas con foto). */
const SIN_INSIGNIA = new Set(['live', 'langs', 'reviews', 'transfer'])
/** Valores del registro que están en inglés: se dicen en el idioma de la página. */
const VALOR: Record<string, { es: string }> = { Ready: { es: 'Listas' }, 'With · without VAT': { es: 'Con y sin IVA' } }
/**
 * La insignia de resultado de una obra: su primer hecho verificable con el nombre corto del vivo («10% → 20%», «Escalón de
 * descuento»). Devuelve null si la obra no tiene ninguno: no se inventa un resultado.
 */
export function insignia(slug: string, v: ReturnType<typeof usePublico>): { valor: string; clase: string; crudo: string } | null {
  const hecho = v.registry.stores.find((s) => s.slug === slug)?.facts.find((f) => !SIN_INSIGNIA.has(f.id))
  if (!hecho) return null
  const clase = v.strings.sections.caseStudy.commerce.offerKind[hecho.id] ?? v.strings.stores[slug]?.factLabels?.[hecho.id]
  if (!clase) return null
  const valor = v.locale === 'es' ? VALOR[hecho.value]?.es ?? hecho.value : hecho.value
  return { valor, clase, crudo: hecho.value }
}
