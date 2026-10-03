import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { v5path, useV5 } from '../data'
import { evento } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useCopy } from './copy'
import { CORTE, gsap } from './movimiento'
import { Idiomas } from './piezas'
import { Enlace } from './transicion'

// 24 horas en los tres idiomas (es-CO daría «2:32 p. m.»).
const INTL = { es: 'es-ES', en: 'en-GB', ja: 'ja-JP' } as const

/** Cabecera de 56 px: marca MB, Obra · Trayectoria · Contacto · CV, hora de Medellín y selector ES/EN/JA.
 *  Un solo marcador de tinta recorre la navegación hasta la vista activa (transform, 380 ms) en lugar de subrayar cada enlace. */
export function Cabecera() {
  const c = useCopy()
  const { personal } = useV5()
  const { locale } = useLanguage()
  const hora = useMedellinTime(INTL[locale])
  const { pathname } = useLocation()
  const nav = useRef<HTMLElement>(null)
  const marcador = useRef<HTMLSpanElement>(null)
  const colocado = useRef(false)

  const colocar = (animar: boolean) => {
    const a = nav.current?.querySelector<HTMLElement>('a[aria-current="page"]')
    const m = marcador.current
    if (!m) return
    if (!a) return void gsap.to(m, { opacity: 0, duration: 0.15, ease: 'none' })
    const to = { x: a.offsetLeft, scaleX: a.offsetWidth, opacity: 1 }
    if (animar && colocado.current) gsap.to(m, { ...to, duration: 0.38, ease: CORTE })
    else gsap.set(m, to)
    colocado.current = true
  }
  useLayoutEffect(() => colocar(true), [pathname, locale]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Las medidas cambian cuando llegan las fuentes y al redimensionar: se recolocan sin animar.
    const de = () => colocar(false)
    document.fonts?.ready.then(de)
    addEventListener('resize', de, { passive: true })
    return () => removeEventListener('resize', de)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header className="a-cab">
      <div className="a-pag a-cab-fila">
        <Enlace className="a-marca" to={v5path('a')} aria-label={`${c.nav.inicio} · ${personal.name}`}>MB</Enlace>
        <nav className="a-nav" aria-label={c.nav.aria} ref={nav}>
          <Enlace nav to={v5path('a', 'obra')}>{c.nav.obra}</Enlace>
          <Enlace nav to={v5path('a', 'trayectoria')}>{c.nav.trayectoria}</Enlace>
          <Enlace nav className="a-nav-contacto" to={v5path('a', 'contacto')}>{c.nav.contacto}</Enlace>
          <a href={personal.cv} target="_blank" rel="noopener noreferrer" onClick={() => evento('a', 'contact_click', { canal: 'cv' })}>{c.nav.cv}</a>
          <span className="a-marcador" ref={marcador} aria-hidden="true" />
        </nav>
        <p className="a-hora a-sec">{c.medellin} <time>{hora}</time></p>
        <Idiomas clase="a-idiomas-cab" />
      </div>
    </header>
  )
}

/** Barra inferior de 56 px en móvil: la acción de la izquierda dice solo lo que hace. «Filtrar (N)» abre la hoja de filtros en el
 *  índice y, desde el inicio, lleva al índice con la hoja ya abierta; en la ficha, la trayectoria y el contacto no hay nada que
 *  filtrar, así que dice «Obra». A la derecha, «Contacto», siempre a un toque. */
export function BarraInferior() {
  const c = useCopy()
  const { pathname, search } = useLocation()
  const enObra = pathname === v5path('a', 'obra')
  const enInicio = pathname === v5path('a')
  const n = ['tipo', 'anio', 'rol', 'tec'].filter((k) => new URLSearchParams(search).get(k)).length
  const filtrar = `${c.indice.filtrar}${n ? ` (${n})` : ''}`
  return (
    <nav className="a-bb" aria-label={c.bb}>
      {enObra ? (
        <button type="button" onClick={() => dispatchEvent(new Event('a-filtrar'))}>{filtrar}</button>
      ) : enInicio ? (
        <Enlace to={`${v5path('a', 'obra')}?filtrar=1`}>{c.indice.filtrar}</Enlace>
      ) : (
        <Enlace to={v5path('a', 'obra')}>{c.nav.obra}</Enlace>
      )}
      <Enlace className="a-bb-contacto" to={v5path('a', 'contacto')} aria-current={pathname === v5path('a', 'contacto') ? 'page' : undefined}>{c.nav.contacto}</Enlace>
    </nav>
  )
}

export function Pie() {
  const { personal, strings } = useV5()
  return (
    <footer className="a-pie">
      <div className="a-pag a-pie-fila a-sec">
        <span>{personal.name}</span>
        <span>{strings.footer.tagline}</span>
        <Idiomas clase="a-idiomas-pie" />
      </div>
    </footer>
  )
}
