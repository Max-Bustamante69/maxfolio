import { Fragment, useMemo, type CSSProperties } from 'react'

// Letras de recorte para la agenda: cada letra es una ficha pegada con su propio papel (tinta, azul o hielo), su giro y su
// desnivel. Semillado por el texto (mismo texto, mismo pegado) y sin movimiento propio: el golpe de pegarlas lo pone GSAP
// sobre `.pr-rec__l`. Decorativo: el elemento que lo contiene lleva el nombre accesible.
export const semillaDe = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
export const azar = (sem: number, i: number) => {
  let t = (sem + Math.imul(i + 1, 0x9e3779b1)) >>> 0
  t = Math.imul(t ^ (t >>> 15), 1 | t)
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function Recorte({ texto, semilla, amp = 1 }: { texto: string; semilla: string; amp?: number }) {
  const sem = useMemo(() => semillaDe(`${semilla}|${texto}`), [semilla, texto])
  let k = 0
  return (
    <span className="pr-rec" aria-hidden="true">
      {texto.split(' ').map((palabra, i, todas) => (
        <Fragment key={i}>
          <span className={`pr-rec__pal ${/[぀-ヿ一-鿿]/.test(palabra) ? 'pr-rec__pal--libre' : ''}`}>
            {[...palabra].map((ch, j) => {
              const n = k++
              // Fichas vecinas nunca iguales: el papel avanza 1 o 2 pasos del ciclo de tres.
              const v = (n + Math.floor(azar(sem, n * 3) * 2)) % 3
              const estilo = { '--r': `${((azar(sem, n * 3 + 1) - 0.5) * 11 * amp).toFixed(1)}deg`, '--y': `${((azar(sem, n * 3 + 2) - 0.5) * 7 * amp).toFixed(1)}px` } as CSSProperties
              return (
                <span key={j} className="pr-rec__l" data-v={v} style={estilo}>
                  {ch}
                </span>
              )
            })}
          </span>
          {i < todas.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </span>
  )
}
