import { designs } from '../data/designs'

const EN_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const ES_WORDS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez']

/** How many switchable experiences `designs.ts` actually registers right now — the single number
 *  every locale's "N designs" copy below reads instead of a typed-in digit, so removing/adding a
 *  theme never leaves a stale count in three languages. */
export const designCount = designs.length

/** English/Spanish spell small counts ("six designs", "seis diseños"); Japanese keeps the numeral
 *  with its native "つ" counter ("6つのデザイン"), which is the idiomatic form here. Falls back to
 *  the bare numeral past ten — this fleet of themes was never going to reach it. */
export function designCountWord(lang: 'en' | 'es' | 'ja', n: number = designCount): string {
  if (lang === 'ja') return `${n}つ`
  const words = lang === 'es' ? ES_WORDS : EN_WORDS
  return words[n] ?? String(n)
}

function capitalize(word: string): string {
  return word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word
}

/** Sentence-initial form ("Six design languages…", "Seis lenguajes…") — Japanese has no case, so it
 *  passes through unchanged. */
export function designCountWordCapitalized(lang: 'en' | 'es' | 'ja', n: number = designCount): string {
  return lang === 'ja' ? designCountWord(lang, n) : capitalize(designCountWord(lang, n))
}
