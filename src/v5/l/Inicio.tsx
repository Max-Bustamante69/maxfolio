import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { sinPuntoFinal } from '../data'
import { ROLES, escalaTexto, fechaDe, recortesDe, type RolId } from './datos'
import { entrada, gsap, useGsap } from './motion'
import { Tira } from './Tira'
import { Enlace, Flecha, Palabras, conParam, ruta, useL } from './ui'

/** Interruptor «Alinear»: las piezas pasan de descansar sobre su suelo a colgar de una misma línea con su cota. */
export function InterruptorAlinear({ activo, onClick, etiqueta }: { activo: boolean; onClick: () => void; etiqueta: string }) {
  return (
    <button type="button" className="l-tog" aria-pressed={activo} onClick={onClick}>
      <i aria-hidden="true" />
      {etiqueta}
    </button>
  )
}

export function Flechas({ el, c }: { el: React.RefObject<HTMLDivElement | null>; c: ReturnType<typeof useL>['c'] }) {
  // Un tile por pulsación: el ancho del primero más el gutter.
  const mover = (dir: 1 | -1) => el.current?.scrollBy({ left: dir * ((el.current.querySelector<HTMLElement>('.l-tile')?.offsetWidth ?? 604) + 16), behavior: 'smooth' })
  return (
    <span className="l-arrows">
      <button type="button" onClick={() => mover(-1)} aria-label={c.inicio.anterior}>
        <Flecha dir="izq" />
      </button>
      <button type="button" onClick={() => mover(1)} aria-label={c.inicio.siguiente}>
        <Flecha />
      </button>
    </span>
  )
}

export default function Inicio() {
  const { c, v5, movil, tw } = useL()
  const raiz = useRef<HTMLDivElement>(null)
  const hoja = useRef<HTMLElement>(null)
  const [sp] = useSearchParams()
  const q = sp.get('pieza')
  const pieza: RolId = (ROLES as string[]).includes(q ?? '') ? (q as RolId) : 'hero'
  const items = recortesDe(pieza)
  const [alin, setAlin] = useState<Partial<Record<RolId, boolean>>>({})
  const alineado = movil || !!alin[pieza]
  const numero = ROLES.indexOf(pieza) + 1
  const nombre = c.piezas[pieza].nombre
  const titulo = sinPuntoFinal(v5.strings.hero.positioning)

  // La firma: el hero llega con sus tiles sobre su suelo (cada uno con su alto). Cuando la cascada de entrada terminó Y el pliegue
  // está a la vista, se deja ver ese «antes» 650 ms y la raya del barrido los alinea en la línea común.
  const revelado = useRef(false)
  const avisar = useRef<() => void>(() => {})
  useGsap(
    raiz,
    (el) =>
      entrada(el, () => {
        revelado.current = true
        avisar.current()
      }),
    [],
  )
  useEffect(() => {
    const el = hoja.current
    if (!el || movil || pieza !== 'hero') return
    let visto = false
    let t = 0
    const intentar = () => {
      if (visto && revelado.current && !t) t = window.setTimeout(() => setAlin((a) => ({ ...a, hero: a.hero ?? true })), 650)
    }
    avisar.current = intentar
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        visto = true
        intentar()
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      avisar.current = () => {}
      window.clearTimeout(t)
    }
  }, [movil, pieza])

  // Al cambiar de pieza, los recortes nuevos encajan en cascada (no al montar: la entrada ya los revela).
  const anterior = useRef(pieza)
  useGsap(
    hoja,
    (el) => {
      if (anterior.current === pieza) return
      anterior.current = pieza
      gsap.fromTo(el.querySelectorAll('.l-tile, .l-mrow'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'l-encaje', stagger: 0.04, clearProps: 'opacity,transform' })
    },
    [pieza],
  )

  const scroller = useRef<HTMLDivElement>(null)

  return (
    <div ref={raiz}>
      <title>{`${v5.personal.name} · ${c.nav.inicio}`}</title>
      <meta name="robots" content="noindex" />
      <section className="l-hero" aria-labelledby="l-h1">
        <p className="l-mono l-eyebrow" data-rv>
          {v5.strings.hero.eyebrow}
        </p>
        <h1 id="l-h1" className="l-h1">
          <Palabras texto={titulo} />
        </h1>
        <span className="l-rule" data-regla aria-hidden="true" />
        <div className="l-cta-row">
          <Enlace className="l-btn l-btn-lg" to={ruta('contacto')} data-rv>
            {v5.strings.hero.ctaPrimary}
          </Enlace>
          <p className="l-note" data-rv>
            {v5.strings.hero.ctaNote}
          </p>
          <span className="l-mono l-n20" data-rv>
            {c.inicio.construidas(v5.storeCount)}
          </span>
        </div>
      </section>

      <nav aria-label={c.inicio.indice} className="l-idxnav">
        <ol className="l-idx">
          {ROLES.map((rol, i) => {
            const n = recortesDe(rol).length
            return (
              <li key={rol} data-rv>
                <Link to={{ search: conParam('', 'pieza', rol) }} replace preventScrollReset aria-current={rol === pieza ? 'true' : undefined}>
                  <span className="l-mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="l-idx-t">{c.piezas[rol].nombre}</span>
                  <span className="l-mono">{n ? c.inicio.recortes(n) : c.inicio.porMedir}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      </nav>

      <section className="l-sheet" ref={hoja} aria-label={nombre}>
        <div className="l-sheet-hd">
          <h2 className="l-mono l-sheet-t">{c.inicio.numero(numero, nombre, alineado)}</h2>
          <span className="l-mono l-ink2 l-hide-m">
            {c.inicio.cota(fechaDe(pieza))} · {c.tira.escala} {escalaTexto(pieza, tw)}
          </span>
          <span className="l-sp" />
          {!movil && items.length > 0 && <Flechas el={scroller} c={c} />}
          {!movil && items.length > 0 && <InterruptorAlinear activo={alineado} onClick={() => setAlin((a) => ({ ...a, [pieza]: !alineado }))} etiqueta={c.inicio.alinear} />}
          <Link className="l-lnk l-hide-m" to={{ pathname: ruta('obra'), search: conParam('', 'pieza', pieza) }}>
            {c.inicio.verTodas(items.length)} <Flecha />
          </Link>
        </div>
        {items.length ? (
          <div className="l-wrap">
            <Tira rol={pieza} items={items} alineado={alineado} scrollRef={scroller} prioridad />
          </div>
        ) : (
          <p className="l-empty l-mono">{c.inicio.sinRecortes}</p>
        )}
        <p className="l-mono l-ink2 l-foot-sheet l-show-m">{c.inicio.cota(fechaDe(pieza))}</p>
      </section>
    </div>
  )
}
