// El marco permanente de la dirección: cabecera (siempre visible), menú de pantalla completa (un disco de papel que crece
// desde el botón), pie con el MB gigante cuyo punto vuelve arriba, WhatsApp flotante y el cursor-punto.
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { v5path, useV5 } from '../data'
import { evento, useCopiarCorreo } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useCopy } from './copy'
import { IconoWhatsApp } from './iconos'
import { EASE, distanciaALaBarra, instanteEn } from './movimiento'
import { Enlace } from './transicion'

const IDIOMAS: Locale[] = ['es', 'en', 'ja']
const INICIO = v5path('digitdeck')
const RUTAS = [
  ['obra', v5path('digitdeck', 'obra')],
  ['trayectoria', v5path('digitdeck', 'trayectoria')],
  ['contacto', v5path('digitdeck', 'contacto')],
] as const

function SelectorIdioma() {
  const c = useCopy()
  const { locale, setLocale } = useLanguage()
  return (
    <div className="dd-idioma" role="group" aria-label={c.idioma}>
      {IDIOMAS.map((l) => (
        <button key={l} type="button" lang={l} className="dd-idioma__boton" aria-pressed={locale === l} onClick={() => setLocale(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/** Centro del botón del menú y radio con que su disco llena la pantalla: lo usan el menú y el cromo de la cabecera. */
function geometriaMenu(boton: HTMLElement | null) {
  const b = boton?.getBoundingClientRect()
  const [cx, cy] = b ? [b.left + b.width / 2, b.top + b.height / 2] : [innerWidth - 40, 36]
  return { cx, cy, radio: Math.ceil(Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy))) }
}

function Menu({ abierto, boton }: { abierto: boolean; boton: React.RefObject<HTMLButtonElement | null> }) {
  const c = useCopy()
  const { personal, locale } = useV5()
  const hora = useMedellinTime(locale)
  const { copiar, copiado } = useCopiarCorreo('digitdeck')
  const ref = useRef<HTMLDivElement>(null)
  const primera = useRef(true)
  useEffect(() => {
    const el = ref.current!
    if (primera.current) {
      primera.current = false
      if (!abierto) return
    }
    const { cx, cy, radio } = geometriaMenu(boton.current)
    const links = el.querySelectorAll('.dd-menu__fila > *')
    gsap.killTweensOf([el, ...links])
    if (abierto) {
      gsap.set(el, { visibility: 'visible', clipPath: `circle(0px at ${cx}px ${cy}px)` })
      gsap.set(links, { yPercent: 105 })
      gsap
        .timeline()
        .to(el, { clipPath: `circle(${radio}px at ${cx}px ${cy}px)`, duration: 0.34, ease: EASE.cubierta })
        .to(links, { yPercent: 0, duration: 0.5, ease: EASE.out, stagger: 0.04, clearProps: 'transform' }, 0.18)
      el.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
    } else if (getComputedStyle(el).visibility !== 'hidden') {
      gsap.to(el, { clipPath: `circle(0px at ${cx}px ${cy}px)`, duration: 0.26, ease: EASE.cubierta, onComplete: () => void gsap.set(el, { visibility: 'hidden' }) })
    }
  }, [abierto, boton])
  return (
    <div ref={ref} id="dd-menu" className="dd-menu" data-tono="papel" inert={!abierto} role="dialog" aria-modal="true" aria-label={c.nav.menu}>
      <nav aria-label={c.nav.principal} className="dd-menu__nav">
        {[['inicio', INICIO] as const, ...RUTAS].map(([k, ruta]) => (
          <span key={k} className="dd-menu__fila">
            <Enlace to={ruta} etiqueta={c.nav[k]} className="dd-menu__link" tabIndex={abierto ? undefined : -1}>
              {c.nav[k]}
            </Enlace>
          </span>
        ))}
      </nav>
      <div className="dd-menu__pie">
        <button type="button" className="dd-enlace" onClick={copiar}>
          {copiado ? c.contacto.copiado : c.contacto.copiar}
        </button>
        <a className="dd-enlace" href={personal.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => evento('digitdeck', 'contact_click', { canal: 'whatsapp' })}>
          {c.contacto.whatsapp}
        </a>
        <span className="dd-micro" role="status">{c.medellin(hora)}</span>
      </div>
    </div>
  )
}

export function Cabecera() {
  const c = useCopy()
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)
  const cab = useRef<HTMLElement>(null)
  const boton = useRef<HTMLButtonElement>(null)

  useEffect(() => setMenu(false), [pathname])

  // El cromo cambia de color en el cuadro en que el disco del menú cubre (o deja de cubrir) la barra: se calcula con la curva del disco.
  const alternar = () => {
    const el = cab.current
    if (el) {
      const { cx, cy, radio } = geometriaMenu(boton.current)
      const meta = Math.min(distanciaALaBarra(cx, cy, el.offsetHeight) / radio, 1)
      el.style.setProperty('--dd-cubre', `${instanteEn(EASE.cubierta, 0.34, meta)}s`)
      el.style.setProperty('--dd-descubre', `${instanteEn(EASE.cubierta, 0.26, 1 - meta)}s`)
    }
    setMenu((m) => !m)
  }

  // Siempre visible; con vidrio desde 80 px. Un oyente pasivo, sin leer geometría.
  useEffect(() => {
    const f = () => void (cab.current && (cab.current.dataset.vidrio = String(scrollY > 80)))
    f()
    addEventListener('scroll', f, { passive: true })
    return () => removeEventListener('scroll', f)
  }, [])

  // Menú abierto: el resto queda inerte, el fondo no scrollea, Esc cierra y devuelve el foco.
  useEffect(() => {
    if (!menu) return
    const resto = document.querySelectorAll('#main-content, .dd-pie, .dd-fab')
    resto.forEach((e) => e.setAttribute('inert', ''))
    const previo = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenu(false)
      boton.current?.focus()
    }
    addEventListener('keydown', tecla)
    return () => {
      resto.forEach((e) => e.removeAttribute('inert'))
      document.documentElement.style.overflow = previo
      removeEventListener('keydown', tecla)
    }
  }, [menu])

  return (
    <>
      <header ref={cab} className="dd-cab" data-menu={menu} data-vidrio="false">
        <Enlace to={INICIO} etiqueta={c.nav.inicio} className="dd-marca" aria-label={c.marcaAria}>
          <span>{c.marca}</span>
          <span className="dd-dot" aria-hidden="true" />
        </Enlace>
        <nav aria-label={c.nav.principal} className="dd-nav">
          {RUTAS.slice(0, 2).map(([k, ruta]) => (
            <Enlace key={k} to={ruta} etiqueta={c.nav[k]} className="dd-nav__link" aria-current={pathname.startsWith(ruta) ? 'page' : undefined}>
              {c.nav[k]}
            </Enlace>
          ))}
          <Enlace to={RUTAS[2][1]} etiqueta={c.nav.contacto} className="dd-boton dd-boton--chico" aria-current={pathname.startsWith(RUTAS[2][1]) ? 'page' : undefined}>
            {c.nav.contacto}
          </Enlace>
        </nav>
        <SelectorIdioma />
        <button ref={boton} type="button" className="dd-menu-boton" aria-expanded={menu} aria-controls="dd-menu" aria-label={menu ? c.nav.cerrarMenu : undefined} onClick={alternar}>
          {menu ? c.nav.cerrar : c.nav.menu}
        </button>
      </header>
      <Menu abierto={menu} boton={boton} />
    </>
  )
}

export function Pie() {
  const c = useCopy()
  const { personal, strings, locale } = useV5()
  const hora = useMedellinTime(locale)
  return (
    <footer className="dd-pie">
      <div className="dd-pie__cuerpo">
        <p className="dd-pie__lema">{strings.footer.tagline}</p>
        <nav aria-label={c.nav.principal} className="dd-pie__nav">
          {[['inicio', INICIO] as const, ...RUTAS].map(([k, ruta]) => (
            <Enlace key={k} to={ruta} etiqueta={c.nav[k]} className="dd-enlace">
              {c.nav[k]}
            </Enlace>
          ))}
        </nav>
        <div className="dd-pie__canales">
          <a className="dd-enlace" href={`mailto:${personal.email}`}>{personal.email}</a>
          <a className="dd-enlace" href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a className="dd-enlace" href={personal.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
        </div>
        <p className="dd-micro dd-pie__legal">© {new Date().getFullYear()} {personal.name} · {strings.footer.rights} · {c.medellin(hora)}</p>
      </div>
      <div className="dd-pie__marca">
        <span className="dd-pie__letras" aria-hidden="true">MB</span>
        <button type="button" className="dd-dot dd-dot--pie" aria-label={c.volverArriba} onClick={() => scrollTo({ top: 0, behavior: 'smooth' })} />
      </div>
    </footer>
  )
}

/** Lo que el WhatsApp flotante no debe cubrir (S9 del v4): CTA, formulario, miniaturas del índice, pausa de la cinta, canales y los
 *  bloques de lectura (pasos, cargos, datos, preguntas) cuyo borde derecho llega hasta su esquina. */
const TAPA = '.dd-form, .dd-boton, .dd-fila__mini, .dd-cinta__pausa, .dd-canal, .dd-paso, .dd-cargo__cuerpo, .dd-ficha__texto, .dd-datos, .dd-faq__item'

export function Fab() {
  const c = useCopy()
  const { personal } = useV5()
  const { pathname } = useLocation()
  const ref = useRef<HTMLAnchorElement>(null)
  // Se atenúa mientras en su esquina (cinco puntos de su caja) hay algo de TAPA. Se mide con el scroll, a lo sumo cada 90 ms y sin rAF.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let espera = 0
    let final = 0
    const medir = () => {
      espera = 0
      const r = el.getBoundingClientRect()
      const tapa = [[0.5, 0.5], [0.12, 0.12], [0.88, 0.12], [0.12, 0.88], [0.88, 0.88]].some(([a, b]) =>
        document.elementsFromPoint(r.left + r.width * a, r.top + r.height * b).some((n) => n !== el && n.closest(TAPA)),
      )
      el.dataset.tapa = String(tapa)
    }
    // A los 90 ms del scroll y otra vez a los 1000 ms de su última señal: lo que acaba de entrar tarda ~0,7 s en dejar de estar recortado.
    const pedir = () => {
      espera ||= window.setTimeout(medir, 90)
      clearTimeout(final)
      final = window.setTimeout(medir, 1000)
    }
    pedir()
    addEventListener('scroll', pedir, { passive: true })
    addEventListener('resize', pedir)
    return () => {
      clearTimeout(espera)
      clearTimeout(final)
      removeEventListener('scroll', pedir)
      removeEventListener('resize', pedir)
    }
  }, [pathname])
  return (
    <a ref={ref} className="dd-fab" data-tapa="false" href={personal.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label={c.whatsapp} onClick={() => evento('digitdeck', 'contact_click', { canal: 'whatsapp' })}>
      <IconoWhatsApp size={28} />
    </a>
  )
}

/** Cursor-punto (solo puntero fino y ≥1024 px; el cursor del sistema no se oculta). Base 10 px, aro de 36 px sobre enlaces, disco de 84 px «Ver obra» sobre el índice. */
export function Cursor() {
  const c = useCopy()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches) return
    const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' })
    const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' })
    const mover = (e: PointerEvent) => {
      el.dataset.visible = 'true'
      x(e.clientX)
      y(e.clientY)
    }
    const sobre = (e: PointerEvent) => {
      const t = (e.target as Element).closest('[data-cursor], a, button, input, textarea, select, label')
      el.dataset.estado = !t ? 'base' : t.hasAttribute('data-cursor') ? 'ver' : 'enlace'
    }
    const fuera = () => void (el.dataset.visible = 'false')
    addEventListener('pointermove', mover, { passive: true })
    addEventListener('pointerover', sobre, { passive: true })
    document.documentElement.addEventListener('pointerleave', fuera)
    return () => {
      removeEventListener('pointermove', mover)
      removeEventListener('pointerover', sobre)
      document.documentElement.removeEventListener('pointerleave', fuera)
      gsap.killTweensOf(el) // los quickTo viven en el elemento: se sueltan con la dirección
    }
  }, [])
  return (
    <div ref={ref} className="dd-cursor" aria-hidden="true" data-estado="base" data-visible="false">
      <span className="dd-cursor__disco">
        <span>{c.cursorVer}</span>
      </span>
    </div>
  )
}
