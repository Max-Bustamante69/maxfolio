import { useMemo } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useV5, type Obra } from '../data'

// Capa pública de Plató. El contenido del vivo trae unas pocas frases del registro que afirman algo que el repo no sostiene o que
// la guardia de afirmaciones prohíbe (método de pago, entrega «el mismo día», plazo de respuesta, garantías, idioma de Max, dominio
// sin DNS, y la cifra «800+ pruebas», que CONTENIDO-VERDAD §4.3 marca como sin fuente). Esta dirección NO las imprime: primero un
// retoque exacto que quita solo la cláusula, y como red de seguridad cualquier frase que aún case se descarta entera. Misma lista
// que vigila la sonda de capturas (v5-shots.mjs).
const PROHIBIDO = [
  /\b98\s*\+/,
  /\b800\s*\+|800以上/,
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
  // «800+ pruebas» se va; el motor de facturación que las llevaba se queda.
  [/\s+con 800\+ pruebas automatizadas/, ''], [/\s+with 800\+ automated tests/, ''], [/800以上の自動テストを備えた/, ''],
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

/** Una cifra en el formato del idioma de la página: «$45k/yr» → «45.000 USD/año» y «10,000+» → «10.000+» en español (el cuerpo ya usa el punto de miles). */
export function formatoLocal(valor: string, locale: 'es' | 'en' | 'ja'): string {
  if (locale !== 'es') return valor
  const usd = valor.match(/^\$(\d+)k\/yr$/)
  if (usd) return `${usd[1]}.000 USD/año`
  return valor.replace(/(\d{1,3}),(\d{3})(?!\d)/g, '$1.$2')
}
/** Los cargos de la línea FUENTE de la banda de cifras, con el mismo nombre que en la trayectoria. */
const cargoLocal = (fuente: string, locale: 'es' | 'en' | 'ja') => (locale === 'es' ? fuente.replace(/Frontend Developer/g, 'Desarrollador Frontend') : fuente)

/** Eslóganes que dicen algo que la guardia no deja pasar (aquí, el idioma): se sustituyen por lo que la app hace. */
const ESLOGAN: Record<string, { es: string; en: string; ja: string }> = {
  kotodama: {
    es: 'Repetición espaciada, escucha, kanji y misiones de lectura.',
    en: 'Spaced repetition, listening, kanji and reading quests.',
    ja: '間隔反復、リスニング、漢字、読解クエスト。',
  },
}

/** La obra tal como esta dirección la imprime: texto sin afirmaciones fuera de lugar y hechos sin el dato del cobro. */
function limpiaObra(o: Obra, locale: 'es' | 'en' | 'ja'): Obra {
  return {
    ...o,
    tagline: ESLOGAN[o.slug]?.[locale] ?? limpioTexto(o.tagline),
    description: limpioTexto(o.description),
    facts: o.facts.filter((f) => !prohibido(`${f.label} ${f.value}`)),
    stack: o.stack.filter((x) => !prohibido(x)),
  }
}

/** Las líneas del manifiesto que le hablan al cliente: las que presumen del repo o de la herramienta de pruebas son del taller, no del encargo. */
const DEL_TALLER = /\bgit\b|commit|コミット|playwright/i

/** useV5() con la obra y los textos ya saneados: toda vista de esta dirección lee de aquí. */
export function usePublico() {
  const v = useV5()
  const { locale } = useLanguage()
  return useMemo(() => {
    const obras = v.obras.map((o) => limpiaObra(o, locale))
    const cto = v.trayectoria.find((t) => t.id === 'digitdeck-cto')
    // La banda de cifras del vivo con su fuente. «800+ pruebas» no tiene fuente que se pueda contar: en su lugar va el dato del mismo cargo que sí la tiene.
    const cifras = v.cifras.map((f) => {
      if (!prohibido(f.valor)) return { ...f, valor: formatoLocal(f.valor, locale), fuente: cargoLocal(f.fuente, locale) }
      const m = cto?.metrics.find((x) => !prohibido(x.value) && /^\d+$/.test(x.value))
      return m && cto ? { id: 'modules', valor: formatoLocal(m.value, locale), etiqueta: m.label, fuente: `${cto.title}, ${cto.company}, ${cto.period}` } : null
    }).filter((f): f is NonNullable<typeof f> => !!f)
    const trayectoria = v.trayectoria.map((r) => ({
      ...r,
      summary: limpioTexto(r.summary),
      highlights: r.highlights.map(limpioTexto).filter(Boolean),
      metrics: r.metrics.filter((m) => !prohibido(m.value)).map((m) => ({ ...m, value: formatoLocal(m.value, locale) })),
    }))
    const manifiesto = v.strings.sections.manifesto.lines.map(limpioTexto).filter((l) => l && !DEL_TALLER.test(l))
    return {
      ...v,
      obras,
      obra: (slug: string) => obras.find((o) => o.slug === slug),
      faq: v.faq.filter((f) => !prohibido(`${f.q} ${f.a}`)),
      cifras,
      trayectoria,
      manifiesto,
    }
  }, [v, locale])
}
export type Publico = ReturnType<typeof usePublico>
