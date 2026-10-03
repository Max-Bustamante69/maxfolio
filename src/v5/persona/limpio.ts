// Última defensa de la capa pública: ciertos textos del registro (taglines, descripciones, datos) afirman algo que el
// repo no sostiene (plazos, métodos de pago, garantías, cifras sin fuente). Si una cadena los trae, esta dirección NO la
// imprime. Es la misma lista que vigila la sonda de capturas (v5-shots.mjs) más plazo de respuesta y garantías.
const PROHIBIDO = [
  /800\s*\+/,
  /\b98\s*\+/,
  /\b9[5-9]\s*\+/,
  /260\s*\+/,
  /testimoni/i,
  /same[- ]day|mismo d[ií]a/i,
  /cada build|every build|every store here/i,
  /japon[eé]s|japanese/i,
  /\b(visa|mastercard|paypal|addi|sistecr[eé]dito)\b/i,
  /contra ?entrega|cash on delivery/i,
  /digitdeck\.co\b/i,
  /d[ií]a h[aá]bil|business day/i,
  /garant[ií]a|warranty|guarantee/i,
]

/** La cadena tal cual, o '' si trae un claim que no se imprime. */
export const limpio = (s?: string | null) => (s && !PROHIBIDO.some((re) => re.test(s)) ? s : '')
