// Capa pública de Tokonoma. Todo lo que llega a pantalla pasa por aquí.
// 1) Última defensa de afirmaciones: ciertos textos del registro (taglines, historias, hechos) dicen algo que el repo no sostiene
//    —un método de pago, un plazo de entrega o de respuesta, una garantía, reseñas «sembradas»—. Max: «un método anunciado es una
//    promesa contractual». Se quita la cláusula que lo dice y se deja el resto; si no queda nada, la cadena no se imprime. Las cifras
//    del vivo NO se filtran: llegan con su fuente desde useV5().cifras.
// 2) Tipografía: la flecha «→» no está en Jost ni en Inter Tight (se cae a otra fuente), así que se escribe en palabras.
// 3) Datos: qué hecho es una cifra de sala, cómo se lee un hecho cuya etiqueta queda abierta («…actualizado cada») y cómo se parte
//    la historia de una obra en reto, lo que hice y lo que quedó (solo con las frases del registro, ordenadas; nada se reescribe).
import { useMemo } from 'react'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { datosDe, useV5, type Obra } from '../data'

const TERMINOS = [
  /same[- ]day|mismo d[ií]a|当日/i,
  /contra ?entrega|cash[- ]on[- ]delivery|代引/i,
  /\b(visa|mastercard|paypal|addi|sistecr[eé]dito)\b/i,
  /d[ií]a h[aá]bil|business day|営業日/i,
  /garant[ií]a|warranty|guarantee|保証/i,
  /testimoni/i,
  /japon[eé]s|japanese/i,
  /digitdeck\.co\b/i,
  /sembrad|seeded|シードレビュー|初期レビュー/i,
]
export const dice = (s: string) => TERMINOS.some((re) => re.test(s))
const JAPONES = /[぀-ヿ一-鿿]/

/** Parte por comas que no estén dentro de un paréntesis. */
export function clausulas(frase: string): string[] {
  const out: string[] = []
  let hondo = 0
  let actual = ''
  for (const ch of frase) {
    if (ch === '(' || ch === '（') hondo++
    if (ch === ')' || ch === '）') hondo = Math.max(0, hondo - 1)
    if (!hondo && (ch === ',' || ch === '、' || ch === '，')) {
      out.push(actual)
      actual = ''
    } else actual += ch
  }
  out.push(actual)
  return out.map((c) => c.trim()).filter(Boolean)
}

/** Frase a frase. No parte en «EE. UU.», «U.S.» ni en siglas de dos letras mayúsculas con punto. */
export const frases = (s: string) => s.split(/(?<![A-Z]{2}\.)(?<!\bU\.S\.)(?<=[.!?])\s+|(?<=。)/).map((x) => x.trim()).filter(Boolean)

/** El texto sin las cláusulas que afirman un pago, un plazo o una garantía; '' si no queda nada. */
export function limpio(texto?: string | null): string {
  if (!texto || !dice(texto)) return texto ?? ''
  const sep = texto.includes('、') ? '、' : ', '
  const fs = texto.split(/(?<=[.。])\s*/).filter(Boolean)
  const salida = fs
    .map((f) => {
      if (!dice(f)) return f
      const cola = f.replace(/[.。]\s*$/, '')
      if (JAPONES.test(f)) {
        const cs = clausulas(cola)
        const quedan = cs.slice(0, -1)
        if (cs.filter(dice).length === 1 && dice(cs[cs.length - 1]) && quedan.length && !/[してでくり]$/.test(quedan[quedan.length - 1])) return `${quedan.join(sep)}。`
        return ''
      }
      const resto = clausulas(cola)
        .map((c) => (dice(c) ? c.replace(/\s+(?:y|and|e)\s+[^,;()]*$/i, (m) => (dice(m) ? '' : m)) : c))
        .filter((c) => c && !dice(c))
      return resto.length ? `${resto.join(sep)}${f.trim().endsWith('。') ? '。' : '.'}` : ''
    })
    .filter(Boolean)
  const t = salida.join(' ').trim()
  return dice(t) ? '' : t
}

/** La etiqueta de un hecho sin la forma de cobro que nombra («Ofertas en sincronía con contra entrega» → «Ofertas en sincronía»). */
const quitaCobro = (s: string) =>
  s
    .replace(/\s+(?:con|with)\s+(?:contra ?entrega|cash[- ]on[- ]delivery)/i, '')
    .replace(/^代引きと/, '')
    .trim()

/** Valores del registro que están en inglés y se muestran tal cual en la cartela. */
const VALORES: Record<string, { es?: string; ja?: string }> = {
  'Aug 20, 2026': { es: '20 ago 2026', ja: '2026年8月20日' },
  'With · without VAT': { es: 'Con · sin IVA', ja: '税込 · 税抜' },
  Ready: { es: 'Listas', ja: '準備済み' },
}

/** Una cifra en español lleva su espacio antes del %: «+10–20 %». (La flecha y la raya de rango las dibuja Cifra.) */
export const unidad = (s: string, locale: Locale) => {
  const t = s.replace(/\/yr\b/, locale === 'es' ? ' al año' : locale === 'ja' ? '／年' : '/yr')
  return locale === 'es' ? t.replace(/(\d)\s?%/g, '$1\u00A0%') : t
}

/** Texto de la cartela sin flechas: «Framer → Liquid» se lee «Framer a Liquid»; en español, el % lleva su espacio. */
export function plano(s: string, locale: Locale): string {
  const fijo = VALORES[s]?.[locale as 'es' | 'ja']
  if (fijo) return fijo
  if (locale === 'es') return s.replace(/\s*→\s*/g, ' a ').replace(/(\d)\s?%/g, '$1\u00A0%').replace(/(%) a (\d)/g, '$1\u00A0a\u00A0$2').trim()
  if (locale === 'en') return s.replace(/\s*→\s*/g, ' to ').trim()
  return s.trim()
}

const MESES: Record<'es' | 'en', string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
/** «jun a sep 2026» · «Jun – Sep 2026» · «2026年6月–9月». */
export function periodoDe(p: { start: string; end: string }, locale: Locale): string {
  const [y1, m1] = p.start.split('-').map(Number)
  const [y2, m2] = p.end.split('-').map(Number)
  if (locale === 'ja') return y1 === y2 ? `${y1}年${m1}月–${m2}月` : `${y1}年${m1}月–${y2}年${m2}月`
  const t = MESES[locale === 'es' ? 'es' : 'en']
  const sep = locale === 'es' ? ' a ' : ' – '
  return y1 === y2 ? `${t[m1 - 1]}${sep}${t[m2 - 1]} ${y1}` : `${t[m1 - 1]} ${y1}${sep}${t[m2 - 1]} ${y2}`
}

/* ------------------------------------------------------------------ hechos y cifras */

type Hecho = Obra['facts'][number]
const ABIERTA = /(?:cada|desde|every|from|since|·|:)\s*$/i
const FECHA = /^\d{1,2}\s+\p{L}{3}\s+\d{4}$|年.*月.*日$/u

/** Un hecho es una cifra de sala si su valor es un número corto (no una fecha) y su etiqueta cierra una frase. */
export const esCifra = (f: Hecho) => /\d/.test(f.value) && f.value.length <= 14 && !FECHA.test(f.value) && !ABIERTA.test(f.label)

/** Un hecho en una sola frase: «Catálogo actualizado cada 12 h», «Precios mostrados: con · sin IVA». */
export const fraseDe = (f: Hecho) => (ABIERTA.test(f.label) ? `${f.label} ${f.value}` : `${f.label}: ${f.value}`)

/* ------------------------------------------------------------------ escala: lo que el catálogo público de la tienda dice de ella */

export interface Fig { valor: string; etiqueta: string; corta?: string; hecho?: boolean }
export interface EtiquetasEscala { productos: string; colecciones: string; variantes: string }

/** 1.064 · 6,7 (es) / 1,064 · 6.7 (en, ja): el separador lo pone el idioma, no el navegador (es-CO no agrupa los miles de cuatro cifras). */
export function numero(n: number, locale: Locale, dec = 0): string {
  const [ent, frac] = n.toFixed(dec).split('.')
  const miles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, locale === 'es' ? '.' : ',')
  return frac ? `${miles}${locale === 'es' ? ',' : '.'}${frac}` : miles
}

/** «9 sep 2026» · «Sep 9, 2026» · «2026年9月9日». */
export function fechaDe(iso: string, locale: Locale): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (locale === 'ja') return `${y}年${m}月${d}日`
  const t = MESES[locale === 'es' ? 'es' : 'en']
  return locale === 'es' ? `${d} ${t[m - 1]} ${y}` : `${t[m - 1]} ${d}, ${y}`
}

/** El catálogo público de la tienda (productos, colecciones, variantes) con la fecha en que se midió; solo lo que dice algo: un catálogo de 2 productos no se anuncia. */
export function escalaDe(o: Obra, e: EtiquetasEscala, locale: Locale): { figuras: Fig[]; fecha: string } | null {
  const c = datosDe(o.slug).comercio
  if (!c) return null
  const figuras: Fig[] = []
  if (c.products >= 10) figuras.push({ valor: numero(c.products, locale), etiqueta: e.productos, corta: e.productos.toLowerCase() })
  if (c.collections && c.collections >= 8) figuras.push({ valor: numero(c.collections, locale), etiqueta: e.colecciones, corta: e.colecciones.toLowerCase() })
  if (c.variantsPerProduct && c.variantsPerProduct >= 3) figuras.push({ valor: numero(c.variantsPerProduct, locale, 1), etiqueta: e.variantes, corta: e.variantes.toLowerCase() })
  return figuras.length ? { figuras, fecha: fechaDe(c.fecha, locale) } : null
}

const MEDIDO = /medid|measured|計測|測定/i

/** Las cifras de una sala o tarjeta, de más a menos propias: los hechos del registro, luego la escala del catálogo y, al final, lo «medido».
 *  Un hecho (p. ej. «10 % a 20 %») no se repite en la misma página (`usadas`); nunca se inventa una cifra. */
export function figurasDe(o: Obra, e: EtiquetasEscala, locale: Locale, usadas?: Set<string>, max = 3): Fig[] {
  const hechos = o.facts.filter(esCifra).map((f): Fig => ({ valor: f.value, etiqueta: f.label, corta: f.label.length <= 34 ? f.label.charAt(0).toLowerCase() + f.label.slice(1) : undefined, hecho: true }))
  const lista = [...hechos.filter((f) => !MEDIDO.test(f.etiqueta)), ...(escalaDe(o, e, locale)?.figuras ?? []), ...hechos.filter((f) => MEDIDO.test(f.etiqueta))]
  const sal = lista.filter((f) => !(f.hecho && usadas?.has(f.valor))).slice(0, max)
  sal.forEach((f) => f.hecho && usadas?.add(f.valor))
  return sal
}

/** ¿Hay algo que contar de esta obra? Con captura, con más de una frase, con hechos o con catálogo público tiene ficha; sin nada de eso es una línea, no una página. */
export const tieneHistoria = (o: Obra) =>
  o.kind !== 'store' || o.views.length > 0 || frases(o.description).length > 1 || o.facts.length > 0 || !!datosDe(o.slug).comercio

/* ------------------------------------------------------------------ la historia de una obra: reto, lo que hice, lo que quedó */

/** Posición (en las frases ya saneadas de la descripción) de cada bloque. Solo estas obras tienen su historia escrita con esa forma; las demás cuentan una sola frase. */
const HISTORIA: Record<string, { reto?: number; hice?: number; quedo?: number }> = {
  'nos-cafe': { reto: 0, hice: 1 },
  millennio: { reto: 0, hice: 1 },
  mindfuel: { hice: 0, quedo: 1 },
  nalua: { reto: 0, hice: 1 },
  sebum: { hice: 0, quedo: 1 },
  'valdo-cafe': { hice: 0, quedo: 1 },
  'factores-2x2': { hice: 0, quedo: 1 },
  pixxiesx: { reto: 0, hice: 1 },
  'luxe-shine': { reto: 0, hice: 1 },
  atmosfera: { reto: 0, hice: 1 },
  unik: { hice: 0, quedo: 1 },
}
export interface Caso { reto?: string; hice?: string; quedo?: string }
export function casoDe(o: Obra): Caso | null {
  const e = HISTORIA[o.slug]
  if (!e) return null
  const fr = frases(o.description)
  const c: Caso = { reto: e.reto === undefined ? undefined : fr[e.reto], hice: e.hice === undefined ? undefined : fr[e.hice], quedo: e.quedo === undefined ? undefined : fr[e.quedo] }
  return c.hice || c.reto ? c : null
}

/** Eslóganes que dicen algo que la guardia no deja pasar (aquí, el idioma): se sustituyen por lo que la app hace. */
const ESLOGAN: Record<string, { es: string; en: string; ja: string }> = {
  kotodama: {
    es: 'Repetición espaciada, escucha, kanji y misiones de lectura.',
    en: 'Spaced repetition, listening, kanji and reading quests.',
    ja: '間隔反復、リスニング、漢字、読解クエスト。',
  },
}
/** Hechos que sugieren una cosa que no es: «reseñas con foto, en vivo» sobre reseñas sembradas. */
const HECHO_FUERA = /rese[ñn]as con foto|reviews? with photos?|写真付きレビュー/i
/** No se lista: la propia página, que ya se está viendo. */
const FUERA = new Set(['maxfolio'])
/** Las dos salas grandes del inicio (a todo el ancho) y las tres tarjetas que las siguen: las obras con más que contar. El índice pone primero las grandes. */
export const GRANDES = ['the-gummy-box', 'nos-cafe']
export const MEDIAS = ['millennio', 'nalua', 'pixxiesx']

/** Una frase que no cuenta nada («Tienda Digitdeck temprana»): se imprime el sector, que sí. */
const GENERICA = /digitdeck temprana|early digitdeck|初期の?Digitdeck/i

/** La obra tal como esta dirección la imprime. */
function limpiarObra(o: Obra, locale: Locale): Obra {
  return {
    ...o,
    tagline: ESLOGAN[o.slug]?.[locale as 'es' | 'en' | 'ja'] ?? (GENERICA.test(o.tagline) && o.industry ? o.industry : plano(limpio(o.tagline), locale)),
    description: limpio(o.description),
    facts: o.facts
      .map((f) => ({ label: quitaCobro(f.label), value: f.value }))
      .filter((f) => !dice(`${f.label} ${f.value}`) && !HECHO_FUERA.test(f.label))
      .map((f) => ({ label: f.label, value: plano(f.value, locale) })),
    stack: o.stack.filter((x) => !dice(x)).map((x) => plano(x, locale)),
  }
}

/** useV5() con la obra ya saneada y solo lo que se muestra: tiendas, productos y proyectos (los trabajos dentro de un empleo viven en Trayectoria). */
export function usePublico() {
  const v = useV5()
  const { locale } = useLanguage()
  return useMemo(() => {
    const todas = v.obras.filter((o) => o.kind !== 'role' && !FUERA.has(o.slug)).map((o) => limpiarObra(o, locale))
    return { ...v, locale, obras: todas, obra: (slug: string) => todas.find((o) => o.slug === slug), numero: (o: Obra) => String(todas.findIndex((x) => x.slug === o.slug) + 1).padStart(2, '0') }
  }, [v, locale])
}
