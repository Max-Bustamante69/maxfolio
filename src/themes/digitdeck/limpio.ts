// Última defensa de la capa pública de esta dirección: ciertos textos del registro (taglines, historias, hechos) afirman algo que el
// repo no sostiene —un método de pago, un plazo de entrega, una garantía—. Max: «un método anunciado es una promesa contractual».
// La dirección no imprime esas cláusulas: quita la cláusula que lo dice (entre comas) y deja el resto del texto. Es la misma lista
// que vigila la sonda de capturas (v5-shots.mjs), más plazo de respuesta y garantías. Las cifras del vivo (800+ pruebas, 70→95+,
// 260+ elementos medidos) NO se filtran: llegan con su fuente desde useV5().cifras.
import { useMemo } from 'react'
import { useV5, type Obra } from '../data'

const TERMINOS = [
  /same[- ]day|mismo d[ií]a|当日/i,
  /contra ?entrega|cash[- ]on[- ]delivery|代引/i,
  /\b(visa|mastercard|paypal|addi|sistecr[eé]dito)\b/i,
  /d[ií]a h[aá]bil|business day|営業日/i,
  /garant[ií]a|warranty|guarantee|保証/i,
  /digitdeck\.co\b/i, // el dominio de la Plataforma no se imprime (el enlace ya se oculta en la capa de datos; su descripción lo nombra)
  /japon[eé]s|japanese/i, // la sonda de la casa no deja que una frase afirme el idioma de Max: el tagline de Kotodama cae y la fila cuenta su descripción
]
const dice = (s: string) => TERMINOS.some((re) => re.test(s))
const JAPONES = /[\u3040-\u30ff\u4e00-\u9fff]/

/** Parte por comas que no estén dentro de un paréntesis. */
function cláusulas(frase: string): string[] {
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

/** El texto sin las cláusulas que afirman un pago, un plazo o una garantía; '' si no queda nada. */
export function limpio(texto: string): string {
  if (!texto || !dice(texto)) return texto
  const sep = texto.includes('、') ? '、' : ', '
  const frases = texto.split(/(?<=[.。])\s*/).filter(Boolean)
  const salida = frases
    .map((f) => {
      if (!dice(f)) return f
      const cola = f.replace(/[.。]\s*$/, '')
      if (JAPONES.test(f)) {
        // En japonés el verbo cierra la cláusula: solo se quita una cola nominal («…、代引きフロー。»); si el claim está en medio, cae la frase.
        const cs = cláusulas(cola)
        const malas = cs.filter(dice).length
        if (!malas) return f
        const quedan = cs.slice(0, -1)
        // la cláusula que queda debe cerrar sola: una forma continuativa («…に接続し») pide la que se quitó
        if (malas === 1 && dice(cs[cs.length - 1]) && quedan.length && !/[してでくり]$/.test(quedan[quedan.length - 1])) return `${quedan.join(sep)}。`
        return ''
      }
      const resto = cláusulas(cola)
        .map((c) => {
          if (!dice(c)) return c
          // «…seis tipos de metaobjetos (…) y mensajes de entrega el mismo día»: se quita la coda con el claim y se conserva lo demás
          const sinCoda = c.replace(/\s+(?:y|and|e)\s+[^,;()]*$/i, (m) => (dice(m) ? '' : m))
          return dice(sinCoda) ? '' : sinCoda
        })
        .filter(Boolean)
      return resto.length ? `${resto.join(sep)}${f.trim().endsWith('。') ? '。' : '.'}` : ''
    })
    .filter(Boolean)
  const t = salida.join(' ').trim()
  return dice(t) ? '' : t
}

/** La obra con sus textos y hechos ya limpios. */
export function limpiarObra(o: Obra): Obra {
  return {
    ...o,
    tagline: limpio(o.tagline),
    description: limpio(o.description),
    facts: o.facts.filter((f) => !dice(`${f.label} ${f.value}`)),
  }
}

/** useV5().obras pasadas por la defensa: lo único que la dirección debe leer para imprimir una obra. */
export function useObras() {
  const { obras } = useV5()
  return useMemo(() => obras.map(limpiarObra), [obras])
}
