import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { useCopiarCorreo } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { v5path } from '../data'
import { ID, usePersona } from './contexto'
import { gsap, ScrollTrigger } from './motion'
import { Enlace } from './piezas'
import { sfx, useSfx } from './sfx'

const LOCALES: Locale[] = ['es', 'en', 'ja']
const BASE = v5path(ID)

/** Barrido diagonal: una hoja de acento con una cuchilla de tinta por delante. Cubre en ≤ 0,26 s, cambia de ruta en
 *  ese instante (sin esperas fijas: el cambio es un callback de la línea de tiempo) y descubre en 0,3 s.
 *  `retraso` deja que el golpe del menú se vea antes de que el azul lo tape: la espera es la misma línea de tiempo
 *  (el barrido arranca en esa posición), así que `isActive()` sigue siendo cierto mientras se espera. */
export function useBarrido(barrido: React.RefObject<HTMLDivElement | null>) {
  const navigate = useNavigate()
  const location = useLocation()
  const actual = useRef(location.pathname + location.search)
  actual.current = location.pathname + location.search
  const tl = useRef<gsap.core.Timeline | null>(null)
  const destino = useRef('')

  useEffect(() => () => void tl.current?.kill(), [])

  return useCallback(
    (to: string, opciones: { sinBarrido?: boolean; retraso?: number } = {}) => {
      // Pulsar la pantalla en la que ya estás sube al principio en vez de no hacer nada.
      if (to === actual.current) return void (window.scrollY > 8 && window.scrollTo({ top: 0, behavior: 'smooth' }))
      if (opciones.sinBarrido || !barrido.current) return void navigate(to)
      destino.current = to
      if (tl.current?.isActive()) return // un segundo clic durante el barrido solo cambia el destino
      const [tinta, acento] = Array.from(barrido.current.children)
      const r = opciones.retraso ?? 0
      tl.current = gsap
        .timeline({ onComplete: () => void gsap.set(barrido.current, { display: 'none' }) })
        .set(barrido.current, { display: 'block' }, r)
        .fromTo(tinta, { xPercent: -118 }, { xPercent: 0, duration: 0.24, ease: 'power3.out' }, r)
        .fromTo(acento, { xPercent: -112 }, { xPercent: 0, duration: 0.26, ease: 'power3.out' }, r + 0.02)
        .add(() => navigate(destino.current))
        .to(acento, { xPercent: 112, duration: 0.32, ease: 'power2.inOut' })
        .to(tinta, { xPercent: 124, duration: 0.32, ease: 'power2.inOut' }, '<0.05')
    },
    [navigate, barrido],
  )
}

const Mail = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)
const Check = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

/** Cromo persistente: barra superior (marca, idioma, sonido, correo), barra inferior (navegación en palabras llanas),
 *  el barrido de transición, el enlace «Saltar al contenido» y el pie. */
export function Cromo({ children, barrido }: { children: ReactNode; barrido: React.RefObject<HTMLDivElement | null> }) {
  const { v5, c, ir } = usePersona()
  const { setLocale } = useLanguage()
  const { pathname } = useLocation()
  const raiz = useRef<HTMLDivElement>(null)
  const hora = useMedellinTime(v5.intlLocale)
  const sonido = useSfx()
  const { copiar, copiado } = useCopiarCorreo(ID)

  const seccion = pathname.replace(BASE, '').split('/')[1] ?? ''
  const nav = [
    { id: '', to: BASE, label: c.nav.inicio },
    { id: 'obra', to: v5path(ID, 'obra'), label: c.nav.obra },
    { id: 'trayectoria', to: v5path(ID, 'trayectoria'), label: c.nav.trayectoria },
    { id: 'contacto', to: v5path(ID, 'contacto'), label: c.nav.contacto },
  ]

  // Entrada del cromo (una vez, primera carga): las barras llegan desde su borde.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pr-top', { yPercent: -100, duration: 0.45, ease: 'power3.out' })
      gsap.from('.pr-bottom', { yPercent: 100, duration: 0.45, ease: 'power3.out', delay: 0.05 })
    }, raiz.current ?? undefined)
    return () => ctx.revert()
  }, [])

  // Las fuentes propias cambian alturas al llegar: se recalculan las posiciones de scroll.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  // Tras cambiar de pantalla el foco pasa al contenido (lectores de pantalla); la primera carga no lo roba.
  const previa = useRef(pathname)
  useEffect(() => {
    if (previa.current === pathname) return
    previa.current = pathname
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [pathname])

  // ⎋ vuelve al inicio desde cualquier pantalla (nunca dentro de un campo).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (seccion !== '') ir(BASE)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [seccion, ir])

  return (
    <div className="pr-raiz" ref={raiz}>
      <a className="pr-saltar" href="#contenido" onClick={(e) => { e.preventDefault(); const m = document.getElementById('contenido'); m?.focus(); m?.scrollIntoView() }}>
        {c.saltar}
      </a>

      <header className="pr-top">
        <div className="pr-top__in">
          <Enlace to={BASE} className="pr-marca" aria-label={`${v5.personal.name} · ${c.nav.inicio}`}>
            <span className="pr-marca__mb" aria-hidden="true">MB</span>
            <span className="pr-marca__nombre">{v5.personal.name}</span>
          </Enlace>
          <div className="pr-top__acciones">
            <button type="button" className="pr-icono pr-sfx" aria-pressed={sonido} aria-label={c.sonido} title={sonido ? c.sonidoOn : c.sonidoOff} onClick={() => sfx.alternar()}>
              <span aria-hidden="true">SFX</span>
              <span className="pr-sfx__estado" aria-hidden="true">{sonido ? 'On' : 'Off'}</span>
            </button>
            <button type="button" className="pr-icono" aria-label={c.copiarCorreo} onClick={copiar}>
              {copiado ? <Check /> : <Mail />}
            </button>
            <span className="sr-only" role="status">{copiado ? c.correoCopiado : ''}</span>
            <div className="pr-idiomas" role="group" aria-label={c.idioma}>
              {LOCALES.map((l) => (
                <button key={l} type="button" className="pr-idioma" aria-pressed={v5.locale === l} lang={l} onClick={() => setLocale(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* El enlace «Skip to main content» de la carcasa de la app apunta a #main-content: aquí aterriza al inicio del contenido. */}
      <span id="main-content" />
      {children}

      <footer className="pr-pie">
        <div className="pr-pie__in">
          <p>© 2026 {v5.personal.name}</p>
          <p className="pr-pie__tag">{v5.strings.footer.tagline}</p>
          <button type="button" className="pr-pie__arriba" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {c.volverArriba} ↑
          </button>
        </div>
      </footer>

      <nav className="pr-bottom" aria-label={c.navAria}>
        <div className="pr-bottom__in">
          {nav.map((n) => (
            <Enlace key={n.id} to={n.to} className="pr-chip" aria-current={seccion === n.id ? 'page' : undefined}>
              {n.label}
            </Enlace>
          ))}
          <span className="pr-bottom__relleno" />
          <span className="pr-estado">
            <b>{v5.storeCount}</b> {c.construidas}
          </span>
          <span className="pr-estado pr-estado--hora">
            {c.hora} <b>{hora}</b>
          </span>
        </div>
      </nav>

      <div className="pr-barrido" ref={barrido} aria-hidden="true">
        <span className="pr-barrido__tinta" />
        <span className="pr-barrido__acento" />
      </div>
    </div>
  )
}

