import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Letras } from './Letras'
import { usePersona } from './contexto'
import { rafaga } from './efectos'
import { sfx } from './sfx'

/** Enlace interno: href real (clic central, copiar enlace) y, con el clic normal, navega con el barrido de la dirección. */
export function Enlace({ to, sinBarrido, onClick, ...rest }: { to: string; sinBarrido?: boolean } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const { ir } = usePersona()
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return
        e.preventDefault()
        ir(to, { sinBarrido })
      }}
    />
  )
}

type BotonProps = { to?: string; variante?: 'primario' | 'contorno'; children: ReactNode } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

/** Botón de hoja inclinada: al pulsar «golpea» (escala 1,06) y suelta una ráfaga de esquirlas. Con `to` es un enlace. */
export function Boton({ to, variante = 'primario', className = '', children, onClick, ...rest }: BotonProps) {
  const host = useRef<HTMLSpanElement>(null)
  const clase = `pr-btn pr-btn--${variante} ${className}`
  const alPulsar = () => {
    if (host.current) rafaga(host.current, { n: 6, rx: 46, ry: 46 })
    sfx.tono(520, 0.1)
  }
  return (
    <span className="pr-btnhost" ref={host}>
      {to ? (
        <Enlace to={to} className={clase} onClick={alPulsar}>
          {children}
        </Enlace>
      ) : (
        <button
          type="button"
          {...rest}
          className={clase}
          onClick={(e) => {
            alPulsar()
            onClick?.(e)
          }}
        >
          {children}
        </button>
      )}
    </span>
  )
}

/** Título de pantalla «cut-in»: eyebrow, losa de tinta, letras de nota de rescate y lead. La entrada la pone entradaTitulos(). */
export function Titulo({ id, eyebrow, texto, acento, lead, nivel = 1, className = '' }: { id?: string; eyebrow?: string; texto: string; acento?: string; lead?: string; nivel?: 1 | 2; className?: string }) {
  const H = nivel === 1 ? 'h1' : 'h2'
  // En un titular de venta la colisión de letras estorba: cuanto más largo, menos desorden (en «MAXIMILIANO» es la gracia).
  const largo = texto.length + (acento?.length ?? 0)
  const f = largo > 24 ? 0.35 : largo > 10 ? 0.5 : 1
  return (
    <header className={`pr-titulo ${className}`} data-pr-titulo>
      {eyebrow && (
        <p className="pr-eyebrow" data-pr-eyebrow>
          {eyebrow}
        </p>
      )}
      <H id={id} className={`pr-h pr-h--${nivel}`} aria-label={acento ? `${texto} ${acento}` : texto}>
        <span className="pr-losa" aria-hidden="true" />
        <span className="pr-lineas">
          <Letras decorativo texto={texto} intensidad={f} />
          {acento && (
            <>
              {' '}
              <Letras decorativo texto={acento} className="pr-acento" intensidad={0.6 * f} />
            </>
          )}
        </span>
      </H>
      {lead && (
        <p className="pr-lead" data-pr-lead>
          {lead}
        </p>
      )}
    </header>
  )
}

/** Arte de fondo de una banda de cabecera (nunca detrás de texto corrido): panel rasgado, trama y velo que garantiza el contraste.
 *  `carga`: 'alta' = lo primero que se pinta (eager + fetchpriority alta); 'baja' = bajo el pliegue (lazy). */
export function Fondo({ src, corte = false, className = '', carga = 'normal' }: { src: string; corte?: boolean; className?: string; carga?: 'alta' | 'normal' | 'baja' }) {
  return (
    <div className={`pr-fondo ${corte ? 'pr-fondo--corte' : ''} ${className}`} aria-hidden="true">
      <img src={src} alt="" width={1600} height={1067} loading={carga === 'baja' ? 'lazy' : 'eager'} fetchPriority={carga === 'alta' ? 'high' : undefined} decoding="async" />
    </div>
  )
}

/** Preguntas frecuentes: acordeón de altura animada (grid-template-rows), un solo panel abierto. */
export function Acordeon({ items }: { items: { q: string; a: string }[] }) {
  const [abierto, setAbierto] = useState<number | null>(null)
  return (
    <div className="pr-acordeon">
      {items.map((it, i) => (
        <div key={i} className="pr-acc" data-abierto={abierto === i} data-pr-panel>
          <h3>
            <button type="button" id={`pr-accb-${i}`} aria-expanded={abierto === i} aria-controls={`pr-acc-${i}`} onClick={() => setAbierto(abierto === i ? null : i)}>
              <span>{it.q}</span>
              <span className="pr-acc__mas" aria-hidden="true" />
            </button>
          </h3>
          <div id={`pr-acc-${i}`} role="region" aria-labelledby={`pr-accb-${i}`} className="pr-acc__cuerpo">
            <div>
              <p>{it.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Cinta de nombres que corre en el compositor (WAAPI, lineal): se pausa fuera de la vista y al pasar el puntero. */
export function Cinta({ items, etiqueta }: { items: { nombre: string; sub?: string }[]; etiqueta: string }) {
  const pista = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = pista.current
    if (!el || !el.animate) return
    const anim = el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: Math.max(24000, items.length * 3200), iterations: Infinity, easing: 'linear' })
    const visible = new IntersectionObserver(([e]) => (e.isIntersecting ? anim.play() : anim.pause()), { threshold: 0 })
    visible.observe(el)
    const parar = () => anim.pause()
    const seguir = () => anim.play()
    el.addEventListener('pointerenter', parar)
    el.addEventListener('pointerleave', seguir)
    return () => {
      visible.disconnect()
      el.removeEventListener('pointerenter', parar)
      el.removeEventListener('pointerleave', seguir)
      anim.cancel()
    }
  }, [items.length])
  const fila = (oculta: boolean) =>
    items.map((it, i) => (
      <span className="pr-cinta__item" key={`${oculta ? 'b' : 'a'}${i}`} aria-hidden={oculta || undefined}>
        <i aria-hidden="true" />
        <b>{it.nombre}</b>
        {it.sub && <em>{it.sub}</em>}
      </span>
    ))
  return (
    <div className="pr-cinta" role="group" aria-label={etiqueta}>
      <div className="pr-cinta__pista" ref={pista}>
        {fila(false)}
        {fila(true)}
      </div>
    </div>
  )
}
