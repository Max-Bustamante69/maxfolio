import { useMemo } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useV5, type Obra } from '../data'

// Capa pública de la dirección Apple. El contenido del vivo trae unas pocas frases del registro que afirman algo que el repo
// no sostiene o que la guardia de afirmaciones prohíbe (método de pago, entrega «el mismo día», plazo de respuesta, idioma de
// Max, dominio sin DNS). Esta dirección NO las imprime: primero un retoque exacto que quita solo la cláusula, y como red de
// seguridad cualquier frase que aún case se descarta entera. Misma lista que vigila la sonda de capturas (v5-shots.mjs).
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
]

/** Frase a frase (las que casan con la lista se descartan). No parte en «EE. UU.», «U.S.» ni en siglas de dos letras mayúsculas con punto. */
const frases = (s: string) => s.split(/(?<![A-Z]{2}\.)(?<!\bU\.S\.)(?<=[.!?])\s+|(?<=。)/).filter(Boolean)

/** El texto tal cual, con los retoques aplicados y sin las frases que no se imprimen. */
export function limpioTexto(s?: string | null): string {
  if (!s) return ''
  const t = RETOQUES.reduce((acc, [re, por]) => acc.replace(re, por), s)
  const ok = frases(t).filter((f) => !prohibido(f))
  return ok.join(/。/.test(t) ? '' : ' ')
}

/** Primera frase y el resto (la primera va en tinta y el resto, atenuado). */
export function partirFrase(s: string): [string, string] {
  const [a = '', ...resto] = frases(s)
  return [a, resto.join(/。/.test(s) ? '' : ' ')]
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
export function limpiaObra(o: Obra, locale: 'es' | 'en' | 'ja'): Obra {
  return {
    ...o,
    tagline: ESLOGAN[o.slug]?.[locale] ?? limpioTexto(o.tagline),
    description: limpioTexto(o.description),
    facts: o.facts.filter((f) => !prohibido(`${f.label} ${f.value}`)),
    stack: o.stack.filter((x) => !prohibido(x)),
  }
}

/** useV5() con la obra ya saneada: toda vista de esta dirección lee de aquí. */
export function usePublico() {
  const v = useV5()
  const { locale } = useLanguage()
  return useMemo(() => {
    const obras = v.obras.map((o) => limpiaObra(o, locale))
    return { ...v, obras, obra: (slug: string) => obras.find((o) => o.slug === slug) }
  }, [v, locale])
}
