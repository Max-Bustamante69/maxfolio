import { useCallback, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useCambioDeTema, type Tema, type ThemeId } from '../temas'
import { gsap } from './motion'
import { ID_PANEL, useCopySelector } from './selector-copy'
import './selector.css'

const ENFOCABLES = 'a[href], button:not([disabled])'
/** Lo que queda detrás mientras el selector está abierto: ni se lee ni se enfoca. */
const DETRAS = '.ing-nav-in, .ing-vista, .ing-pie, .ing-saltar'
/** Lo que tarda en verse la casilla pasar de la variante actual a la elegida antes de cambiar de tema. */
const ARMADO_MS = 340

const Marca = () => (
  <svg className="ing-sel-check" viewBox="0 0 12 10" width="12" height="10" aria-hidden="true">
    <path d="M1.2 5.3 4.4 8.4 10.8 1.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * El configurador «Elige tu variante»: ocho tarjetas tipo radio (miniatura, nombre y lema como filas de una ficha técnica),
 * la actual con borde y marca. En escritorio es una lámina que se despliega bajo la barra; en móvil, una hoja inferior.
 * Cada tarjeta es un <a href> real; la entrada y la salida son la misma línea de tiempo (la salida la rebobina).
 */
export default function PanelTemas({ cerrar }: { cerrar: () => void }) {
  const c = useCopySelector()
  const { temas, actual, cambiar } = useCambioDeTema()
  const { pathname } = useLocation()
  const raiz = useRef<HTMLDivElement>(null)
  const linea = useRef<gsap.core.Timeline | null>(null)
  const saliendo = useRef(false)
  const espera = useRef(0)
  const [elegido, setElegido] = useState<ThemeId | null>(null)

  const resto = pathname.split('/').slice(2).join('/')
  const vista = resto ? `/${resto}` : c.inicio
  const nombreActual = temas.find((t) => t.id === actual)?.nombre ?? ''

  // Salir = rebobinar lo que entró (más rápido), y solo entonces avisar al padre para desmontar.
  const salir = useCallback(() => {
    if (saliendo.current) return
    saliendo.current = true
    window.clearTimeout(espera.current)
    const t = linea.current
    if (!t) { cerrar(); return }
    t.eventCallback('onReverseComplete', cerrar)
    t.timeScale(1.7).reverse()
  }, [cerrar])
  const salirRef = useRef(salir)
  salirRef.current = salir

  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    const html = document.documentElement
    const antes = { overflow: html.style.overflow, pad: html.style.paddingRight }
    const barra = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    if (barra > 0) html.style.paddingRight = `${barra}px`
    const detras = document.querySelectorAll(DETRAS)
    detras.forEach((n) => n.setAttribute('inert', ''))

    const ops = Array.from(el.querySelectorAll<HTMLAnchorElement>('.ing-sel-op'))
    const lista = el.querySelector<HTMLElement>('.ing-sel-lista')
    const marcada = el.querySelector<HTMLElement>('.ing-sel-op[aria-current="true"]')
    // Con la lista en una columna más alta que la hoja (móvil), la variante actual queda en el centro de lo visible.
    if (lista && marcada && lista.scrollHeight > lista.clientHeight && getComputedStyle(lista).gridTemplateColumns.split(' ').length === 1) lista.scrollTop = Math.max(0, marcada.offsetTop - (lista.clientHeight - marcada.offsetHeight) / 2)
    ;(marcada ?? el.querySelector<HTMLElement>(ENFOCABLES))?.focus({ preventScroll: true })

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      const escritorio = window.matchMedia('(min-width: 760px)').matches
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from(q('.ing-sel-vel'), { opacity: 0, duration: 0.4, ease: 'power2.out' }, 0)
      tl.fromTo(q('.ing-sel-linea'), { scaleX: 0 }, { scaleX: 1, duration: 1.1, transformOrigin: '0 50%' }, 0.04)
      if (escritorio) tl.fromTo(q('.ing-sel-hoja'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.72, ease: 'power3.out' }, 0)
      else tl.fromTo(q('.ing-sel-hoja'), { yPercent: 100 }, { yPercent: 0, duration: 0.7 }, 0)
      tl.from(q('.ing-sel-cab > *'), { opacity: 0, y: 12, duration: 0.7, stagger: 0.06 }, 0.12)
      tl.from(q('.ing-sel-lista > li'), { opacity: 0, y: 18, duration: 0.8, stagger: 0.05 }, 0.16)
      tl.fromTo(q('.ing-sel-img'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut', stagger: 0.05 }, 0.22)
      tl.fromTo(q('.ing-sel-fila'), { '--f': 0 }, { '--f': 1, duration: 0.8, stagger: 0.012 }, 0.34)
      tl.from(q('.ing-sel-pie'), { opacity: 0, y: 10, duration: 0.6 }, 0.5)
      linea.current = tl
    }, el)

    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); salirRef.current(); return }
      const foco = document.activeElement as HTMLElement | null
      if (e.key === 'Tab') {
        const f = Array.from(el.querySelectorAll<HTMLElement>(ENFOCABLES))
        if (!f.length) return
        const primero = f[0], ultimo = f[f.length - 1]
        if (!foco || !el.contains(foco)) { e.preventDefault(); primero.focus(); return }
        if (e.shiftKey && foco === primero) { e.preventDefault(); ultimo.focus() }
        else if (!e.shiftKey && foco === ultimo) { e.preventDefault(); primero.focus() }
        return
      }
      // Flechas entre variantes (Inicio y Fin a los extremos): se mueve el foco, no se elige hasta Enter o Espacio.
      const i = foco ? ops.indexOf(foco as HTMLAnchorElement) : -1
      if (i < 0) return
      const columnas = ops.filter((o) => Math.abs(o.offsetTop - ops[0].offsetTop) < 2).length || 1
      const destino: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + columnas, ArrowUp: i - columnas, Home: 0, End: ops.length - 1 }
      if (!(e.key in destino)) return
      e.preventDefault()
      ops[destino[e.key]]?.focus()
    }
    document.addEventListener('keydown', tecla)

    return () => {
      document.removeEventListener('keydown', tecla)
      window.clearTimeout(espera.current)
      ctx.revert()
      linea.current = null
      detras.forEach((n) => n.removeAttribute('inert'))
      html.style.overflow = antes.overflow
      html.style.paddingRight = antes.pad
    }
  }, [])

  const elegir = (e: MouseEvent<HTMLAnchorElement>, t: Tema) => {
    // Clic medio, Ctrl/Cmd/Mayús: el navegador abre el enlace real en su pestaña y el selector se queda como está.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    if (elegido || saliendo.current) return
    if (t.id === actual) { salir(); return }
    setElegido(t.id)
    espera.current = window.setTimeout(() => cambiar(t.id), ARMADO_MS)
  }

  return (
    <div className="ing-sel" ref={raiz}>
      <div className="ing-sel-vel" aria-hidden="true" onClick={salir} />
      <div className="ing-sel-hoja" id={ID_PANEL} role="dialog" aria-modal="true" aria-labelledby="ing-sel-titulo">
        <span className="ing-sel-linea" aria-hidden="true" />
        <div className="ing-marco ing-sel-in">
          <header className="ing-sel-cab">
            <div>
              <p className="ing-etq">{c.eyebrow(String(temas.length).padStart(2, '0'))}</p>
              <h2 className="ing-sel-t" id="ing-sel-titulo">{c.titulo} <em>{c.acento}</em></h2>
              <p className="ing-sel-actual"><span>{c.actual}</span> {nombreActual}</p>
            </div>
            <button type="button" className="ing-sel-x" onClick={salir} aria-label={c.cerrarAria}>
              <span className="ing-sel-x-t" aria-hidden="true">{c.cerrar}</span>
              <kbd className="ing-sel-esc" aria-hidden="true">{c.esc}</kbd>
              <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M1.5 1.5l9 9m0-9-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>
          </header>

          <ul className="ing-sel-lista" aria-label={c.lista} data-elige={elegido ?? undefined}>
            {temas.map((t, i) => {
              const esActual = t.id === actual
              const marca = elegido ? elegido === t.id : esActual
              return (
                <li key={t.id}>
                  <a
                    className="ing-sel-op"
                    href={t.href}
                    aria-current={esActual ? 'true' : undefined}
                    aria-labelledby={`ing-sel-n-${t.id}`}
                    aria-describedby={`ing-sel-l-${t.id}`}
                    data-marca={marca || undefined}
                    data-armado={elegido === t.id || undefined}
                    onClick={(e) => elegir(e, t)}
                    onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); e.currentTarget.click() } }}
                  >
                    <span className="ing-sel-img">
                      <picture>
                        <source media="(max-width: 767px)" srcSet={t.previewMovil} width={390} height={844} />
                        <img src={t.preview} alt={t.nombre} width={720} height={450} loading="lazy" decoding="async" />
                      </picture>
                    </span>
                    <span className="ing-sel-cuerpo">
                      <span className="ing-sel-id">
                        <span>{c.variante} {String(i + 1).padStart(2, '0')}</span>
                        {esActual && <span className="ing-sel-tag">{c.actual}</span>}
                        <span className="ing-sel-radio" aria-hidden="true"><Marca /></span>
                      </span>
                      <dl className="ing-sel-spec">
                        <div className="ing-sel-fila ing-sel-nombre">
                          <dt>{c.nombre}</dt>
                          <dd id={`ing-sel-n-${t.id}`}>{t.nombre}</dd>
                        </div>
                        <div className="ing-sel-fila">
                          <dt>{c.lema}</dt>
                          <dd id={`ing-sel-l-${t.id}`}>{t.lema}</dd>
                        </div>
                      </dl>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="ing-sel-pie">
            <dl className="ing-sel-pie-d">
              <div><dt>{c.actual}</dt><dd>{nombreActual}</dd></div>
              <div><dt>{c.vista}</dt><dd className="ing-sel-mono">{vista}</dd></div>
              <div><dt>{c.variantes}</dt><dd className="ing-sel-mono">{String(temas.length).padStart(2, '0')}</dd></div>
            </dl>
            <p className="ing-sel-nota">{c.nota}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
