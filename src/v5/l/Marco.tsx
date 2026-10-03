import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { useCopiarCorreo } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { FECHAS } from './datos'
import { cascada, gsap } from './motion'
import { Enlace, Equis, ruta, useIr, useL } from './ui'

const NOMBRES: Record<Locale, string> = { es: 'Español', en: 'English', ja: '日本語' }
const IDIOMAS: Locale[] = ['es', 'en', 'ja']

function Idiomas({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLanguage()
  const { c } = useL()
  return (
    <div className={`l-lang ${className}`} role="group" aria-label={c.nav.idioma}>
      {IDIOMAS.map((l) => (
        <button key={l} type="button" lang={l} aria-label={NOMBRES[l]} aria-pressed={locale === l} onClick={() => setLocale(l)}>
          {c.idiomas[l]}
        </button>
      ))}
    </div>
  )
}

const activa = (pathname: string, vista: 'obra' | 'trayectoria' | 'contacto') => pathname.startsWith(ruta(vista))

export function Cabecera() {
  const { c, v5, movil } = useL()
  const { pathname } = useLocation()
  return (
    <header className="l-hdr">
      <Enlace className="l-mark" to={ruta()} aria-label={`${c.nav.inicio} · ${v5.personal.name}`}>
        MB
      </Enlace>
      <Enlace className="l-who" to={ruta()}>
        {v5.personal.name}
      </Enlace>
      {movil ? (
        <MenuMovil />
      ) : (
        <nav className="l-nav" aria-label={c.nav.principal}>
          <Enlace to={ruta('obra')} aria-current={activa(pathname, 'obra') ? 'page' : undefined}>
            {c.nav.obra}
          </Enlace>
          <Enlace to={ruta('trayectoria')} aria-current={activa(pathname, 'trayectoria') ? 'page' : undefined}>
            {c.nav.trayectoria}
          </Enlace>
          <Idiomas />
          <Enlace className="l-btn" to={ruta('contacto')} aria-current={activa(pathname, 'contacto') ? 'page' : undefined}>
            {c.nav.contacto}
          </Enlace>
        </nav>
      )}
    </header>
  )
}

/** Menú de teléfono: una hoja a pantalla completa (diálogo modal: foco dentro, Esc, foco devuelto) con las cuatro vistas y el idioma. */
function MenuMovil() {
  const { c } = useL()
  const ir = useIr()
  const { pathname } = useLocation()
  const dlg = useRef<HTMLDialogElement>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const [abierto, setAbierto] = useState(false)

  const abrir = () => {
    dlg.current?.showModal()
    document.documentElement.style.overflow = 'hidden'
    setAbierto(true)
    const d = dlg.current
    if (!d) return
    gsap.fromTo(d.querySelector('.l-sheetnav'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.38, ease: 'l-encaje', clearProps: 'clipPath' })
    cascada(d.querySelectorAll('.l-menu-it'), { delay: 0.12 })
  }
  const cerrar = (despues?: () => void) => {
    const d = dlg.current
    if (!d) return
    gsap.to(d.querySelector('.l-sheetnav'), {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.26,
      ease: 'power3.out',
      onComplete: () => {
        d.close()
        document.documentElement.style.overflow = ''
        setAbierto(false)
        disparador.current?.focus({ preventScroll: true })
        despues?.()
      },
    })
  }
  useEffect(() => () => void (document.documentElement.style.overflow = ''), [])

  const va = (e: React.MouseEvent, to: string) => {
    e.preventDefault()
    cerrar(() => ir(null, to))
  }

  return (
    <>
      <button ref={disparador} type="button" className="l-menu" aria-haspopup="dialog" aria-expanded={abierto} onClick={abrir}>
        {c.nav.menu}
      </button>
      <dialog ref={dlg} className="l-dlg-menu" aria-label={c.nav.menu} onCancel={(e) => { e.preventDefault(); cerrar() }}>
        <div className="l-sheetnav">
          <div className="l-sheetnav-hd">
            <span className="l-mono">{c.nav.menu}</span>
            <button type="button" className="l-x" onClick={() => cerrar()} aria-label={c.nav.cerrar}>
              <Equis />
            </button>
          </div>
          <nav aria-label={c.nav.principal}>
            <ul className="l-menu-list">
              {([['', c.nav.inicio], ['obra', c.nav.obra], ['trayectoria', c.nav.trayectoria], ['contacto', c.nav.contacto]] as const).map(([v, n]) => {
                const to = ruta(v)
                return (
                  <li key={v} className="l-menu-it">
                    <a href={to} aria-current={pathname === to ? 'page' : undefined} onClick={(e) => va(e, to)}>
                      {n}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
          <Idiomas className="l-lang-lg" />
        </div>
      </dialog>
    </>
  )
}

/** Barra inferior de teléfono: «Piezas» y «Contacto». */
export function BarraMovil() {
  const { c, movil } = useL()
  if (!movil) return null
  return (
    <nav className="l-bar" aria-label={c.nav.inferior}>
      <Enlace to={ruta('obra')}>{c.nav.piezas}</Enlace>
      <Enlace to={ruta('contacto')}>{c.nav.contacto}</Enlace>
    </nav>
  )
}

export function Pie() {
  const { c, v5 } = useL()
  const hora = useMedellinTime(v5.intlLocale)
  const { copiar, copiado, correo } = useCopiarCorreo('l')
  return (
    <footer className="l-foot">
      <span className="l-mono">{c.pie.medido(FECHAS.join(' · '))}</span>
      <span className="l-mono">{c.pie.hora(hora)}</span>
      <button type="button" className="l-lnk" onClick={copiar} aria-describedby="l-copiado">
        {correo}
      </button>
      <span id="l-copiado" role="status" className="l-mono l-copiado">
        {copiado ? c.contacto.copiado : ''}
      </span>
    </footer>
  )
}
