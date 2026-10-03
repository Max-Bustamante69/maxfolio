import { Fragment, useMemo, type CSSProperties } from 'react'

// Letras de nota de rescate: implementación propia. Cada letra lleva una rotación, un desnivel y una escala pequeños
// y SEMILLADOS (mismo texto, mismo pegado), como letras recortadas y pegadas a distintos ángulos. Quedan fijas; el
// movimiento (pegarse una a una) lo pone GSAP. Por palabras: una palabra nunca se parte entre dos renglones.
//
// Legibilidad (causa raíz de «MAXIMI ANO»): Anton casi no tiene espacio lateral y dos letras vecinas que se inclinan una
// hacia la otra juntan sus astas por un extremo (la «I» y la «L» de MAXIMILIANO quedaban fundidas en una sola letra: ni
// recorte, ni z-index, ni glifo ausente; el desorden era el mismo, pero sin ningún hueco mínimo que lo pagara).
// Cada letra paga con un margen derecho lo que su inclinación y su escala le quitan al hueco con la siguiente de su palabra:
//   hueco = BASE + MITAD_ALTO · |sen(r_k) − sen(r_k+1)| + ANCHO · (exceso de escala de las dos)
// La inclinación gira sobre el centro de la letra, así que el hueco se cierra por arriba O por abajo, nunca por los dos
// extremos, y el margen es el peor caso. La sonda shots9/persona/letras-sonda.mjs lo mide píxel a píxel.
const BASE = 0.032 // em: hueco mínimo entre astas
const MITAD_ALTO = 0.5 // em: media altura de mayúscula de Anton (el brazo con que la inclinación cierra el hueco)
const ANCHO = 0.24 // em: media anchura típica (lo que la escala empuja hacia la vecina)

function semilla(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h || 1
}
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Props {
  texto: string
  intensidad?: number
  className?: string
  /** true cuando el elemento padre (h1, h2, enlace) ya lleva el nombre accesible: las letras sueltas se ocultan al lector. */
  decorativo?: boolean
}

interface Letra {
  ch: string
  r: number
  y: number
  s: number
}

const RAD = Math.PI / 180

export function Letras({ texto, intensidad = 1, className = '', decorativo = false }: Props) {
  const palabras = useMemo(() => {
    const rand = mulberry32(semilla(texto))
    return texto.split(' ').map((palabra) => {
      const letras: Letra[] = palabra.split('').map((ch) => ({
        ch,
        r: (rand() - 0.5) * 14 * intensidad,
        y: (rand() - 0.5) * 10 * intensidad,
        s: 1 + (rand() - 0.5) * 0.16 * intensidad,
      }))
      // Un título largo se calma (menos inclinación) y por eso necesita más hueco base: no queda el desorden que lo separaba.
      const base = BASE + 0.025 * (1 - Math.min(1, intensidad))
      return letras.map((g, j) => {
        const sig = letras[j + 1]
        const hueco = sig ? base + MITAD_ALTO * Math.abs(Math.sin(g.r * RAD) - Math.sin(sig.r * RAD)) + ANCHO * (Math.max(0, g.s - 1) + Math.max(0, sig.s - 1)) : 0.02
        return { ...g, hueco }
      })
    })
  }, [texto, intensidad])
  return (
    <span className={`pr-letras ${className}`} aria-hidden={decorativo || undefined}>
      {palabras.map((letras, i) => (
        <Fragment key={i}>
          <span className={`pr-palabra ${/[぀-ヿ一-鿿]/.test(letras.map((g) => g.ch).join('')) ? 'pr-palabra--libre' : ''}`}>
            {letras.map((g, j) => (
              <span key={j} className="pr-letra" style={{ '--r': `${g.r.toFixed(2)}deg`, '--y': `${g.y.toFixed(2)}px`, '--s': g.s.toFixed(3), '--g': `${g.hueco.toFixed(3)}em` } as CSSProperties}>
                {g.ch}
              </span>
            ))}
          </span>
          {i < palabras.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </span>
  )
}
