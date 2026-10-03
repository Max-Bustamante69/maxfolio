import { Fragment, useMemo, type CSSProperties } from 'react'

// Letras de nota de rescate: implementación propia. Cada letra lleva una rotación, un desnivel y una escala pequeños
// y SEMILLADOS (mismo texto, mismo pegado), como letras recortadas y pegadas a distintos ángulos. Quedan fijas; el
// movimiento (pegarse una a una) lo pone GSAP. Por palabras: una palabra nunca se parte entre dos renglones.
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

export function Letras({ texto, intensidad = 1, className = '', decorativo = false }: Props) {
  const palabras = useMemo(() => {
    const rand = mulberry32(semilla(texto))
    return texto.split(' ').map((palabra) =>
      palabra.split('').map((ch) => ({
        ch,
        r: ((rand() - 0.5) * 14 * intensidad).toFixed(2),
        y: ((rand() - 0.5) * 10 * intensidad).toFixed(2),
        s: (1 + (rand() - 0.5) * 0.16 * intensidad).toFixed(3),
      })),
    )
  }, [texto, intensidad])
  return (
    <span className={`pr-letras ${className}`} aria-hidden={decorativo || undefined}>
      {palabras.map((letras, i) => (
        <Fragment key={i}>
          <span className={`pr-palabra ${/[぀-ヿ一-鿿]/.test(letras.map((g) => g.ch).join('')) ? 'pr-palabra--libre' : ''}`}>
            {letras.map((g, j) => (
              <span key={j} className="pr-letra" style={{ '--r': `${g.r}deg`, '--y': `${g.y}px`, '--s': g.s } as CSSProperties}>
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
