import { useMemo } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useV5, type Obra } from '../data'

// Capa pública de la dirección Ingeniería. El contenido del vivo trae unas pocas frases del registro que afirman algo que el
// repo no sostiene o que la guardia de afirmaciones prohíbe (método de pago, entrega «el mismo día», plazo de respuesta, idioma
// de Max, dominio sin DNS, «800+ pruebas» sin conteo, «260+ elementos» sin conteo). Aquí NO se imprimen: primero un retoque
// exacto que quita solo la cláusula y, como red de seguridad, cualquier frase que aún case se descarta entera.
// La sonda local de esta dirección (shots9/ingenieria/_claims.mjs) vigila la misma lista sobre el texto renderizado.
const PROHIBIDO = [
  /\b98\s*\+/,
  /\b800\s*\+|800以上/, // CONTENIDO-VERDAD §4.3: nivel C, sin fuente que se pueda contar
  /\b260\s*\+/, // §8.3: sin conteo en el repo
  /testimoni/i,
  /same[- ]day|mismo d[ií]a|当日/i,
  /japon[eé]s|japanese/i,
  /\b(visa|mastercard|paypal|addi|sistecr[eé]dito)\b/i,
  /contra ?entrega|cash[- ]on[- ]delivery|代引き|releasit/i,
  /digitdeck\.co\b/i,
  /d[ií]a h[aá]bil|business day|営業日/i,
  /garant[ií]a|warranty|guarantee|保証/i,
]
export const prohibido = (s: string) => PROHIBIDO.some((re) => re.test(s))

const RETOQUES: Array<[RegExp, string]> = [
  [/,\s*flujo contra entrega/, ''], [/,\s*cash-on-delivery flow/, ''], [/、代引きフロー/, ''],
  [/,\s*y el flujo contra entrega[^.]*(?=\.)/, ''], [/,\s*and the cash-on-delivery flow[^.]*(?=\.)/, ''], [/し、Releasitの代引きフローはオファー単位で同期。19件中19件が一致しています/, 'しています'],
  [/\s+y mensajes de entrega el mismo día/, ''], [/\s+and same-day delivery messaging/, ''], [/、当日配送の案内/, ''],
  // «800+ pruebas» del cargo de Digitdeck: se quita la cláusula y queda el resto de la viñeta.
  [/\s+con 800\+ pruebas automatizadas/, ''], [/\s+with 800\+ automated tests/, ''], [/800以上の自動テストを備えた/, ''],
]

/** Frase a frase; no parte en «EE. UU.», «U.S.» ni en siglas de dos letras mayúsculas con punto. */
const frases = (s: string) => s.split(/(?<![A-Z]{2}\.)(?<!\bU\.S\.)(?<=[.!?])\s+|(?<=。)/).filter(Boolean)
const junta = (lista: string[], like: string) => lista.join(/。/.test(like) ? '' : ' ')

/** El texto con los retoques aplicados y sin las frases que no se imprimen. */
export function limpioTexto(s?: string | null): string {
  if (!s) return ''
  const t = RETOQUES.reduce((acc, [re, por]) => acc.replace(re, por), s)
  return junta(frases(t).filter((f) => !prohibido(f)), t)
}

/** Primera frase y el resto (la primera va en tinta y el resto, atenuado). */
export function partirFrase(s: string): [string, string] {
  const [a = '', ...resto] = frases(s)
  return [a, junta(resto, s)]
}

/** Eslóganes que dicen algo que la guardia no deja pasar (el idioma, o un conteo sin fuente): se sustituyen por lo que la obra hace. */
const ESLOGAN: Record<string, { es: string; en: string; ja: string }> = {
  kotodama: {
    es: 'Repetición espaciada, escucha, kanji y misiones de lectura.',
    en: 'Spaced repetition, listening, kanji and reading quests.',
    ja: '間隔反復、リスニング、漢字、読解クエスト。',
  },
  millennio: {
    es: 'El diseño de Framer de una perfumería, vivo en Shopify.',
    en: "A perfumery's Framer design, live on Shopify.",
    ja: 'Framerのデザインを、そのままShopifyで稼働。',
  },
}
/** Piezas del stack que el repo no sostiene en esa tienda (§8.3: Millennio no tiene archivos TS/TSX). */
const STACK_FUERA: Record<string, string[]> = { millennio: ['React islands'] }

/** Cifras del CV con el formato del idioma: «10,000+» → «10.000+», «-40%» → «−40 %», «$45k/yr» → «45.000 USD/año». */
export function valorMetrica(v: string, locale: 'es' | 'en' | 'ja'): string {
  let t = v.replace(/^-/, '−')
  if (locale === 'es') {
    t = t.replace(/\$(\d+)k\/yr/, (_, n) => `${n}.000 USD/año`).replace(/(\d),(\d{3})/g, '$1.$2').replace(/\s*%/g, ' %')
  } else {
    t = t.replace(/\s*%/g, '%')
  }
  return t
}

/** Lugar del cargo en el idioma de la interfaz («Remote · Medellín, CO» → «Remoto · Medellín, CO»). */
export const lugar = (l: string, locale: 'es' | 'en' | 'ja') => (locale === 'es' ? l.replace('Remote', 'Remoto') : l)

/** Las pocas herramientas del registro que son frases (no nombres propios) en español; sin flechas que la fuente no trae. */
const HERRAMIENTAS_ES: Record<string, string> = {
  'Metaobjects & metafields': 'Metaobjetos y metacampos', 'Admin & Storefront GraphQL': 'GraphQL Admin y Storefront', 'Theme Blocks': 'Bloques de tema',
  'Embedded apps (Remix)': 'Apps embebidas (Remix)', 'Store migrations': 'Migraciones de tienda', Accessibility: 'Accesibilidad', 'REST & GraphQL': 'REST y GraphQL',
  'Multi-tenant architecture': 'Arquitectura multi-tenant', 'A/B testing (Bayesian, SRM)': 'Pruebas A/B (bayesianas, SRM)',
  'First-party event instrumentation': 'Instrumentación de eventos propios', 'AOV & funnel optimization': 'Optimización de AOV y del embudo',
  'Multi-agent orchestration': 'Orquestación multiagente', 'Evaluation suites': 'Suites de evaluación',
}
export const herramienta = (t: string, locale: 'es' | 'en' | 'ja') => {
  const sinFlecha = t.replace(/\s*→\s*(\w+)/, ' ($1)')
  return locale === 'es' ? HERRAMIENTAS_ES[sinFlecha] ?? sinFlecha : sinFlecha
}

function limpiaObra(o: Obra, locale: 'es' | 'en' | 'ja'): Obra {
  return {
    ...o,
    tagline: ESLOGAN[o.slug]?.[locale] ?? limpioTexto(o.tagline),
    description: limpioTexto(o.description),
    facts: o.facts.filter((f) => !prohibido(`${f.label} ${f.value}`)),
    stack: o.stack.filter((x) => !prohibido(x) && !STACK_FUERA[o.slug]?.includes(x)),
  }
}

/** useV5() con todo lo que llega a pantalla ya saneado: toda vista de esta dirección lee de aquí. */
export function usePublico() {
  const v = useV5()
  const { locale } = useLanguage()
  return useMemo(() => {
    const obras = v.obras.map((o) => limpiaObra(o, locale))
    const trayectoria = v.trayectoria.map((t) => ({
      ...t,
      location: lugar(t.location, locale),
      summary: limpioTexto(t.summary),
      highlights: t.highlights.map(limpioTexto).filter(Boolean),
      metrics: t.metrics.filter((m) => !prohibido(`${m.label} ${m.value}`)).map((m) => ({ ...m, value: valorMetrica(m.value, locale) })),
    }))
    const habilidades = Object.fromEntries(Object.entries(v.habilidades).map(([g, lista]) => [g, lista.map((x) => herramienta(x, locale))])) as Record<keyof typeof v.habilidades, string[]>
    return {
      ...v,
      obras,
      obra: (slug: string) => obras.find((o) => o.slug === slug),
      trayectoria,
      habilidades,
      cifras: v.cifras.filter((f) => !prohibido(`${f.valor} ${f.etiqueta}`)),
      faq: v.faq.map((f) => ({ ...f, a: limpioTexto(f.a) })).filter((f) => f.a),
    }
  }, [v, locale])
}

export const llenar = (t: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((s, [k, x]) => s.split(`{${k}}`).join(String(x)), t)
export const sinProtocolo = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
