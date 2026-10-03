// Piezas de la gramática: el punto final, el título display (líneas con máscara, última línea con su punto), la palabra en
// serif cursiva y el contador. Ningún título termina en un carácter «.»: el punto es un elemento gráfico aparte.
import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { D, EASE, useContexto } from './movimiento'

/** El punto: un disco violeta de 0,15 em. Es el signo final de todo título display y el destino del disco de la transición. */
export const Punto = () => <span className="dd-dot" data-dd-dot="" aria-hidden="true" />

interface PropsTitulo {
  as?: 'h1' | 'h2'
  id?: string
  className?: string
  /** Una línea por elemento: cada una sube por su máscara; el punto se añade tras la última. */
  lineas: ReactNode[]
}

export function Titulo({ as: Tag = 'h2', id, className = '', lineas }: PropsTitulo) {
  return (
    <Tag id={id} className={`dd-titulo ${className}`}>
      {lineas.map((l, i) => (
        <span key={i}>
          <span className="dd-ln">
            <span>
              {l}
              {i === lineas.length - 1 && <Punto />}
            </span>
          </span>
          {i < lineas.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  )
}

/** Envuelve la primera aparición de `palabra` en la cursiva serif (UNA por título); si no está (p. ej. japonés), devuelve el texto tal cual. */
export function enfasis(texto: string, palabra: string): ReactNode {
  const i = palabra ? texto.indexOf(palabra) : -1
  if (i < 0) return texto
  return (
    <>
      {texto.slice(0, i)}
      <em className="dd-serif">{palabra}</em>
      {texto.slice(i + palabra.length)}
    </>
  )
}

/** Cifra que cuenta de 0 al valor en 1,2 s al entrar en vista y se repite al volver (enfriamiento de 1,5 s). El valor final ya está en el HTML. */
export function Contador({ hasta, sufijo = '', className = '' }: { hasta: number; sufijo?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useContexto((ctx) => {
    const el = ref.current!
    const cuenta = { v: 0 }
    let ultimo = -Infinity
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || performance.now() - ultimo < 1500) return
      ultimo = performance.now()
      cuenta.v = 0
      ctx.add(() =>
        gsap.to(cuenta, {
          v: hasta,
          duration: D.count,
          ease: EASE.puntual,
          onUpdate: () => void (el.textContent = `${Math.round(cuenta.v)}${sufijo}`),
          onComplete: () => void (el.textContent = `${hasta}${sufijo}`),
        }),
      )
    })
    io.observe(el)
    return () => io.disconnect()
  }, ref)
  return (
    <span ref={ref} className={`dd-contador ${className}`}>
      {hasta}
      {sufijo}
    </span>
  )
}
