import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { preload } from 'react-dom'
import { supportedLocales, useLanguage, type Locale } from '../../context/LanguageContext'
import { en } from '../../content/en'
import { getContent } from '../../content'
import { v5path } from '../data'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useCopiarCorreo } from '../shared/contacto'
import Contacto from './Contacto'
import Ficha from './Ficha'
import Inicio from './Inicio'
import Obra from './Obra'
import Trayectoria from './Trayectoria'
import { copyFor } from './copy'
import { capaEstado, ID, PlatoCtx, registrarCapa, setTono, type ModoVista } from './contexto'
import { alScroll, entrada, gsap, registrarCubierta, useIr } from './motion'
import { Enlace, Flecha, Rod, ruta } from './piezas'
import { usePublico } from './publico'
import { useCabeceraLimpia } from './seo'
import { puedeEscena } from './escena/puerta'
import { indiceDe } from './escena/sets'
import { TemasBoton } from './selector/Boton'
import './tokens.css'
import './plato.css'
import MarcaMB from '../shared/MarcaMB'

const Lienzo = lazy(() => import('./escena/Lienzo'))
// El selector de temas («Cambiar de set»): su JS, su CSS y sus imágenes no existen hasta que se abre (se pide el trozo al apuntar al botón).
const cargarPanelTemas = () => import('./selector/Panel')
const PanelTemas = lazy(cargarPanelTemas)

/** Si el chunk del 3D no llega o la escena revienta, la portada sigue con su póster y el camino 2D: nunca una pantalla en blanco. */
class SinEscena extends Component<{ alFallo: () => void; children: ReactNode }, { roto: boolean }> {
  state = { roto: false }
  static getDerivedStateFromError() { return { roto: true } }
  componentDidCatch() { this.props.alFallo() }
  render() { return this.state.roto ? null : this.props.children }
}
const BASE = v5path(ID)
const SECCIONES = ['', 'obra', 'trayectoria', 'contacto'] as const
const LABEL: Record<Locale, string> = { en: 'EN', es: 'ES', ja: 'JA' }
const POSTER = '/v5/plato/poster-d.webp'

const leer = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const guardar = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* sin almacenamiento: vale para esta visita */ } }
const leerModo = (): ModoVista => (leer('v5-plato-modo') === 'lista' ? 'lista' : '3d')

function Idioma({ clase = '' }: { clase?: string }) {
  const { locale, setLocale } = useLanguage()
  const c = copyFor(locale)
  return (
    <div className={`pl-idioma ${clase}`} role="group" aria-label={c.idioma}>
      {supportedLocales.map((l) => (
        <button key={l} type="button" aria-pressed={l === locale} lang={l} onClick={() => setLocale(l)}>{LABEL[l]}</button>
      ))}
    </div>
  )
}

const PuntosPil = ({ n }: { n: 1 | 2 }) => <span className="pl-puntos" aria-hidden="true">{n === 2 ? <><i /><i /></> : <i />}</span>

function Hoja({ cerrar, actual }: { cerrar: () => void; actual: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { locale } = useLanguage()
  const c = copyFor(locale)
  const v = usePublico()
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { opacity: 0, duration: 0.25, ease: 'power2.out' })
      gsap.from('.pl-hoja-a, .pl-hoja-pie > *', { opacity: 0, y: 28, duration: 0.8, ease: 'pl', stagger: 0.06, delay: 0.05 })
    }, ref)
    document.documentElement.style.overflow = 'hidden'
    const detras = document.querySelectorAll('.pl-vista, .pl-pie')
    detras.forEach((el) => el.setAttribute('inert', ''))
    ref.current?.querySelector<HTMLElement>('a')?.focus()
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', tecla)
    return () => {
      window.removeEventListener('keydown', tecla)
      document.documentElement.style.overflow = ''
      detras.forEach((el) => el.removeAttribute('inert'))
      ctx.revert()
    }
  }, [cerrar])
  const textos = [c.nav.inicio, c.nav.obra, c.nav.trayectoria, c.nav.contacto]
  return (
    <div className="pl-hoja" ref={ref} role="dialog" aria-modal="true" aria-label={c.principal}>
      <nav aria-label={c.principal}>
        {SECCIONES.map((r, i) => (
          <Enlace key={r} to={r ? `${BASE}/${r}` : BASE} className="pl-hoja-a" aria-current={actual === r ? 'page' : undefined} onClick={cerrar}>
            <span className="pl-hoja-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{textos[i]}
          </Enlace>
        ))}
      </nav>
      <div className="pl-hoja-pie">
        <Idioma />
        <a className="pl-enlace-mono" href={v.personal.cv} download>{c.cv}</a>
        <Enlace to={`${BASE}/contacto#agenda`} className="pl-pil pl-pil--tung" onClick={cerrar}>
          <Rod>{c.revision}</Rod><PuntosPil n={1} />
        </Enlace>
      </div>
    </div>
  )
}

function Cabecera({ en3d, puede3d, setModo }: { en3d: boolean; puede3d: boolean; setModo: (m: ModoVista) => void }) {
  const { locale } = useLanguage()
  const c = copyFor(locale)
  const v = usePublico()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [temasAbierto, setTemasAbierto] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  const botonTemas = useRef<HTMLButtonElement>(null)
  const volverATemas = useRef(false)
  const actual = pathname.slice(BASE.length + 1).split('/')[0]
  const textos = [c.nav.inicio, c.nav.obra, c.nav.trayectoria, c.nav.contacto]
  const cerrar = useCallback(() => { setAbierto(false); boton.current?.focus({ preventScroll: true }) }, [])
  useEffect(() => { setAbierto(false); setTemasAbierto(false) }, [pathname])
  // Abrir el selector cierra el menú; al cerrarlo, el foco vuelve a su botón (el panel ya devolvió el fondo a la vida).
  const abrirTemas = useCallback(() => { setAbierto(false); setTemasAbierto(true) }, [])
  const cerrarTemas = useCallback(() => { volverATemas.current = true; setTemasAbierto(false) }, [])
  useEffect(() => {
    if (temasAbierto || !volverATemas.current) return
    volverATemas.current = false
    botonTemas.current?.focus({ preventScroll: true })
  }, [temasAbierto])
  return (
    <header className="pl-cab" data-abierto={abierto} data-ruta={actual || 'inicio'}>
      <div className="pl-cab-in">
        <Enlace to={BASE} className="pl-logo" aria-label={c.logo}>
          <span className="pl-logo-mb" aria-hidden="true"><MarcaMB /></span>
          <span className="pl-logo-txt">Max Bustamante</span>
        </Enlace>
        <nav className="pl-nav" aria-label={c.principal}>
          <ul>
            {SECCIONES.map((r, i) => (
              <li key={r}>
                <Enlace to={r ? `${BASE}/${r}` : BASE} aria-current={actual === r ? 'page' : undefined}><Rod>{textos[i]}</Rod></Enlace>
              </li>
            ))}
          </ul>
        </nav>
        <div className="pl-cab-der">
          <Idioma clase="pl-idioma--cab" />
          {puede3d && (
            <div className="pl-modo" role="group" aria-label={c.modo.grupo}>
              <button type="button" aria-pressed={en3d} onClick={() => setModo('3d')} title={c.modo.a3d}>{c.modo.etq3d}</button>
              <button type="button" aria-pressed={!en3d} onClick={() => setModo('lista')} title={c.modo.aLista}>{c.modo.etqLista}</button>
            </div>
          )}
          <TemasBoton ref={botonTemas} abierto={temasAbierto} onClick={abrirTemas} alApuntar={() => void cargarPanelTemas().catch(() => {})} />
          <span className="pl-cab-slot">
            <Enlace to={`${BASE}/contacto#agenda`} className="pl-pil pl-pil--osc pl-cab-cta">
              <Rod>{c.revision}</Rod><PuntosPil n={1} />
            </Enlace>
            <a href={v.personal.cv} download className="pl-pil pl-pil--clara pl-cab-cv" tabIndex={-1}>
              <Rod>{c.cv}</Rod><PuntosPil n={1} />
            </a>
          </span>
          <button ref={boton} type="button" className="pl-pil pl-pil--clara pl-cab-menu" aria-expanded={abierto} onClick={() => (abierto ? cerrar() : setAbierto(true))}>
            <Rod>{abierto ? c.cerrar : c.menu}</Rod><PuntosPil n={2} />
          </button>
        </div>
      </div>
      {abierto && <Hoja cerrar={cerrar} actual={actual} />}
      {temasAbierto && (
        // Si el trozo del panel no llega (sin red), el panel se cierra en vez de tumbar la página.
        <SinEscena alFallo={() => setTemasAbierto(false)}>
          <Suspense fallback={null}>
            <PanelTemas alCerrado={cerrarTemas} />
          </Suspense>
        </SinEscena>
      )}
    </header>
  )
}

function Pie() {
  const { locale } = useLanguage()
  const c = copyFor(locale)
  const v = usePublico()
  const hora = useMedellinTime(v.intlLocale)
  const { copiar, copiado, correo } = useCopiarCorreo(ID)
  return (
    <footer className="pl-pie" data-tono="oscuro">
      <div className="pl-pie-in">
        <div className="pl-pie-col">
          <p className="pl-mono pl-pie-k">{c.pie.medellin}</p>
          <p className="pl-pie-v">{c.inicio.local(hora)}</p>
        </div>
        <div className="pl-pie-col pl-pie-redes">
          <p className="pl-mono pl-pie-k">{c.pie.redes}</p>
          <p><a href={v.personal.linkedin} target="_blank" rel="noopener noreferrer"><Rod>LinkedIn</Rod></a></p>
          <p><a href={v.personal.github} target="_blank" rel="noopener noreferrer"><Rod>GitHub</Rod></a></p>
          <p><a href={v.personal.cv} download><Rod>{c.cv}</Rod></a></p>
        </div>
        <div className="pl-pie-col pl-pie-correo">
          <p className="pl-mono pl-pie-k">{c.pie.escribir}</p>
          <p><button type="button" className="pl-pie-mail" onClick={copiar}>{correo}<span className="pl-mono">{copiado ? c.contacto.copiado : c.contacto.copiar}</span></button></p>
          <p><a href={v.personal.whatsappHref} target="_blank" rel="noopener noreferrer"><Rod>WhatsApp</Rod></a></p>
        </div>
      </div>
      <p className="pl-pie-marca" aria-hidden="true">MAX BUSTAMANTE</p>
      <div className="pl-pie-base">
        <p className="pl-mono">{c.pie.derechos}</p>
        <button type="button" className="pl-mono pl-pie-arriba" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{c.pie.arriba} <Flecha arriba /></button>
      </div>
    </footer>
  )
}

/**
 * Cortina de entrada, una vez por sesión: el plato negro con el monograma abre una ventana en paralelogramo y deja ver la página; el
 * monograma viaja hasta el logo del encabezado y se queda (la entrada deja un objeto, no una pausa). ≤ 1,2 s.
 */
function Cortina({ fin }: { fin: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const mb = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const el = ref.current!
    const m = mb.current!
    const raiz = el.closest('.pl-raiz')
    const logo = raiz?.querySelector<SVGElement>('.pl-logo-mb svg')
    const ventana = (w: number, h: number, s: number) =>
      `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${50 - w + s}% ${50 - h}%, ${50 + w + s}% ${50 - h}%, ${50 + w - s}% ${50 + h}%, ${50 - w - s}% ${50 + h}%, ${50 - w + s}% ${50 - h}%)`
    gsap.set(el, { clipPath: ventana(0.4, 0.4, 0.3) })
    raiz?.classList.add('pl-entrando')
    // El monograma nace abajo a la izquierda, grande, y aterriza exactamente sobre la marca del encabezado (mismo tamaño al llegar).
    const px = parseFloat(getComputedStyle(raiz!).getPropertyValue('--px')) || 40
    const py = parseFloat(getComputedStyle(raiz!).getPropertyValue('--py')) || 30
    const w = m.offsetWidth, h = m.offsetHeight
    const x0 = px, y0 = window.innerHeight - py - h
    gsap.set(m, { x: x0, y: y0, opacity: 0, transformOrigin: '50% 50%' })
    const dest = logo?.getBoundingClientRect()
    const tl = gsap.timeline({ onComplete: () => { raiz?.classList.remove('pl-entrando'); fin() } })
    tl.to(m, { opacity: 1, duration: 0.25, ease: 'pl' }, 0)
      .to(el, { clipPath: ventana(75, 75, 30), duration: 0.85, ease: 'pl' }, 0.2)
    if (dest) {
      const k = Math.min(1, dest.height / h)
      tl.to(m, { x: dest.left + dest.width / 2 - w / 2, y: dest.top + dest.height / 2 - h / 2, scale: k, duration: 0.7, ease: 'pl-rod' }, 0.35)
        .to(m, { opacity: 0, duration: 0.15, ease: 'power1.out' }, 1.05)
    } else tl.to(m, { opacity: 0, duration: 0.25 }, 0.5)
    return () => { tl.kill(); raiz?.classList.remove('pl-entrando') }
  }, [fin])
  return (
    <>
      <div className="pl-cortina" ref={ref} aria-hidden="true" />
      <span className="pl-cortina-mb" ref={mb} aria-hidden="true"><MarcaMB /></span>
    </>
  )
}

// Dirección «Plató»: un plató de lujo que se recorre. Rutas reales: /v5/plato · /obra · /obra/:slug · /trayectoria · /contacto.
export default function PlatoApp() {
  useCabeceraLimpia()
  const v = usePublico()
  const { locale } = useLanguage()
  const { pathname } = useLocation()
  const c = copyFor(locale)
  const ir = useIr()
  const listo = locale === 'en' || getContent(locale) !== en
  const [modo, setModoEstado] = useState<ModoVista>(leerModo)
  const [puede3d, setPuede3d] = useState(puedeEscena)
  const en3d = puede3d && modo === '3d'
  const raiz = useRef<HTMLDivElement>(null)
  const capa = useRef<HTMLDivElement>(null)
  const cubierta = useRef<HTMLDivElement>(null)
  const [monta3d, setMonta3d] = useState(false)
  const [listaEscena, setListaEscena] = useState(false)
  const [cortina, setCortina] = useState(() => {
    if (leer('v5-plato-entrada')) return false
    entrada.retraso = 0.5
    return true
  })
  const quitarCortina = useCallback(() => { setCortina(false); guardar('v5-plato-entrada', '1') }, [])

  const setModo = useCallback((m: ModoVista) => { setModoEstado(m); guardar('v5-plato-modo', m) }, [])
  useEffect(() => {
    const mq = matchMedia('(max-width: 1023px)')
    const f = () => setPuede3d(puedeEscena())
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])

  // Primer plano: el fondo del documento es el de la sala (sin parpadeo blanco en el rebote del scroll).
  useLayoutEffect(() => {
    document.documentElement.style.backgroundColor = getComputedStyle(raiz.current!).getPropertyValue('--sala')
    return () => { document.documentElement.style.backgroundColor = '' }
  }, [])
  // El velo del encabezado solo existe con la página en movimiento: arriba del todo no tapa el titular.
  useEffect(() => alScroll((y) => { const d = y > 24 ? 'si' : 'no'; const r = raiz.current; if (r && r.dataset.vel !== d) r.dataset.vel = d }), [])
  useLayoutEffect(() => { registrarCapa(capa.current); registrarCubierta(cubierta.current); return () => { registrarCapa(null); registrarCubierta(null) } }, [])
  // El tono del cromo cambia con la sección que queda bajo la línea del encabezado.
  useEffect(() => {
    const secs = raiz.current?.querySelectorAll<HTMLElement>('[data-tono]')
    if (!secs?.length) return
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setTono((e.target as HTMLElement).dataset.tono as 'claro' | 'oscuro')), { rootMargin: `-40px 0px -${Math.max(0, window.innerHeight - 41)}px 0px` })
    secs.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [pathname, locale, listo, en3d])

  // El 3D solo se descarga si la puerta lo permite, la vista lo usa y ya pasó el LCP.
  const usa3d = en3d && (pathname === BASE || pathname.endsWith('/obra') || (pathname.includes('/obra/') && indiceDe(pathname.split('/').pop() ?? '') >= 0))
  useEffect(() => {
    if (!usa3d || monta3d || cortina) return
    const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }
    const id = w.requestIdleCallback ? w.requestIdleCallback(() => setMonta3d(true), { timeout: 1500 }) : window.setTimeout(() => setMonta3d(true), 700)
    return () => { (window as Window & { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(id); clearTimeout(id) }
  }, [usa3d, monta3d, cortina])
  // Sin escena en esta ruta, la capa se esconde (Trayectoria, Contacto, fichas sin set).
  useEffect(() => { if (!usa3d) capaEstado(false) }, [usa3d, pathname])
  useEffect(() => { if (!en3d) setMonta3d(false) }, [en3d])

  // En la portada con 3D el póster (el LCP junto al lema) se pide antes que nada. La fuente va con font-display: swap y respaldo de métricas.
  if (en3d && pathname === BASE) preload(POSTER, { as: 'image', fetchPriority: 'high' })

  const ctx = useMemo(() => ({ c, v, en3d, puede3d, modo, setModo, ir }), [c, v, en3d, puede3d, modo, setModo, ir])
  const solo = typeof location !== 'undefined' && new URLSearchParams(location.search).has('pl-poster')

  return (
    <PlatoCtx.Provider value={ctx}>
      <div className={`v5-plato pl-raiz${solo ? ' pl-solo' : ''}`} data-tono="claro" data-vel="no" data-3d={en3d ? 'si' : 'no'} ref={raiz}>
        <a className="pl-saltar" href="#contenido">{c.saltar}</a>
        <Cabecera en3d={en3d} puede3d={puede3d} setModo={setModo} />
        <div className="pl-lienzo" ref={capa} aria-hidden="true" data-listo={listaEscena ? 'si' : 'no'}>
          {en3d && pathname === BASE && <img className="pl-poster" src={POSTER} width={1440} height={900} alt="" decoding="async" />}
          {en3d && monta3d && (
            <SinEscena alFallo={() => setPuede3d(false)}>
              <Suspense fallback={null}>
                <Lienzo alListo={() => setListaEscena(true)} alFallo={() => setPuede3d(false)} />
              </Suspense>
            </SinEscena>
          )}
        </div>
        <div className="pl-cuerpo">
          {listo ? (
            <Routes>
              <Route index element={<Inicio key={locale} />} />
              <Route path="obra" element={<Obra key={locale} />} />
              <Route path="obra/:slug" element={<Ficha />} />
              <Route path="trayectoria" element={<Trayectoria key={locale} />} />
              <Route path="contacto" element={<Contacto key={locale} />} />
              <Route path="*" element={<Navigate to={ruta()} replace />} />
            </Routes>
          ) : (
            <main id="contenido" className="pl-vista" aria-busy="true" />
          )}
          <Pie />
        </div>
        <div className="pl-cubierta" ref={cubierta} aria-hidden="true" />
        {cortina && <Cortina fin={quitarCortina} />}
      </div>
    </PlatoCtx.Provider>
  )
}
