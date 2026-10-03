import { useMemo } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useV5, type Obra } from '../data'
import { useCopy } from './copy'

// Capa pública de la dirección Maison. El contenido del vivo trae unas pocas frases del registro que afirman algo que el repo
// no sostiene o que la guardia de afirmaciones prohíbe (método de pago, entrega «el mismo día», plazo de respuesta, idioma de
// Max, dominio sin DNS). Aquí no se imprimen: primero un retoque exacto que quita solo la cláusula y, como red de seguridad,
// cualquier frase que aún case se descarta entera. Misma lista que vigila la sonda de capturas (v5-shots.mjs).
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
]
export const prohibido = (s: string) => PROHIBIDO.some((re) => re.test(s))

/** Retoques exactos del registro (es · en · ja): quitan la cláusula y dejan el resto de la frase en pie. */
const RETOQUES: Array<[RegExp, string]> = [
  [/,\s*flujo contra entrega/, ''], [/,\s*cash-on-delivery flow/, ''], [/、代引きフロー/, ''],
  [/,\s*y el flujo contra entrega[^.]*(?=\.)/, ''], [/,\s*and the cash-on-delivery flow[^.]*(?=\.)/, ''], [/し、Releasitの代引きフローはオファー単位で同期。19件中19件が一致しています/, 'しています'],
  [/\s+y mensajes de entrega el mismo día/, ''], [/\s+and same-day delivery messaging/, ''], [/、当日配送の案内/, ''],
  // Lo interno del taller no es contenido para quien contrata: el tema paralelo del cliente y las reseñas sembradas.
  [/;\s*el tema Shrine del cliente sigue corriendo en paralelo hasta el cambio/, ''], [/;\s*the client's Shrine theme keeps running in parallel until the switch/, ''],
  [/\s*302 reseñas sembradas con fotos \(80\+ por producto\),/, ''], [/\s*302 seeded reviews with photos \(80\+ per product\),/, ''], [/写真付きの初期レビュー302件（商品あたり80件以上）、/, ''],
]
/** Frases que cuentan cómo va el trabajo por dentro («389 archivos por delante del Dawn», el tema Shrine en japonés): no se imprimen. */
const INTERNO = /archivos por delante|files ahead|ファイル先行|Shrine/i

/** Frase a frase (también en japonés). */
export const frases = (s: string) => s.split(/(?<=[.!?])\s+|(?<=。)/).filter(Boolean)
const unir = (f: string[], ja: boolean) => f.join(ja ? '' : ' ')

/** Frases del vivo que hablan del propio sitio («los mismos registros que el resto del sitio», «un bloque por año, sin relleno»): al que contrata no le sirven. */
const META = /mismos registros|same records|derived from the same|同じ記録|sin relleno|nothing padded|水増し|en esta p[aá]gina|on this page|このページ/i
export function sinMeta(s: string): string {
  const f = frases(s)
  return unir(f.filter((x) => !META.test(x)), /。/.test(s))
}

/** El texto tal cual, con los retoques aplicados y sin las frases que no se imprimen. */
export function limpioTexto(s?: string | null): string {
  if (!s) return ''
  const t = RETOQUES.reduce((acc, [re, por]) => acc.replace(re, por), s)
  return unir(frases(t).filter((f) => !prohibido(f) && !INTERNO.test(f)), /。/.test(t))
}

/** Eslóganes que dicen algo que la guardia no deja pasar (aquí, el idioma): se sustituyen por lo que la app hace. */
const ESLOGAN: Record<string, { es: string; en: string; ja: string }> = {
  kotodama: {
    es: 'Repetición espaciada, escucha, kanji y misiones de lectura.',
    en: 'Spaced repetition, listening, kanji and reading quests.',
    ja: '間隔反復、リスニング、漢字、読解クエスト。',
  },
}

/** La obra tal como esta dirección la imprime: texto sin afirmaciones fuera de lugar y hechos sin el dato del cobro. */
export function limpiaObra(o: Obra, locale: 'es' | 'en' | 'ja', pie?: string): Obra {
  // La captura de «Digitdeck Apps» es una página de NOS Café (el armador de cajas que usa el módulo) y su enlace lleva a esa tienda:
  // el producto no se presenta con la cara de otra obra; queda sin captura y sin enlace.
  const apps = o.slug === 'digitdeck-apps'
  return {
    ...o,
    ...(apps ? { views: [], link: undefined } : {}),
    // El eslogan del registro habla en términos del taller; el de la casa, en los del dueño de la tienda (copy.ts, `pies`).
    tagline: pie ?? ESLOGAN[o.slug]?.[locale] ?? limpioTexto(o.tagline),
    // Las medidas de laboratorio (Lighthouse) no son un resultado: se quitan de la prosa y de los hechos; viven, con su fecha, al final de «Oficio».
    description: frases(limpioTexto(o.description)).filter((f) => !/lighthouse/i.test(f)).join(/。/.test(o.description) ? '' : ' '),
    // Fuera también el recuento de reseñas: son reseñas sembradas, no un resultado que se pueda presentar como tal.
    facts: o.facts.filter((f) => !prohibido(`${f.label} ${f.value}`) && !/lighthouse|rese[ñn]as|reviews|レビュー/i.test(f.label)),
    stack: o.stack.filter((x) => !prohibido(x)),
  }
}

/** useV5() con la obra ya saneada: toda vista de esta dirección lee de aquí. */
export function usePublico() {
  const v = useV5()
  const { locale } = useLanguage()
  const { pies } = useCopy()
  return useMemo(() => {
    const obras = v.obras.map((o) => limpiaObra(o, locale, pies[o.slug]))
    return { ...v, obras, obra: (slug: string) => obras.find((o) => o.slug === slug) }
  }, [v, locale, pies])
}
