import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { useV5, v5path } from '../data'
import { evento } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useCopy } from './copy'
import { KLink, KNavLink, SegCapa } from './nav'

const IDIOMAS: Locale[] = ['es', 'en', 'ja']
const INTL = { es: 'es-ES', en: 'en-GB', ja: 'ja-JP' } as const

/** Cabecera de 56 px: marca MB, nombre, Obra · Trayectoria · Contacto y selector ES/EN/JA. Bajo 768 px la
 *  navegación va en el menú y la barra inferior. */
export function Cabecera() {
  const c = useCopy()
  const { personal } = useV5()
  const { locale, setLocale } = useLanguage()
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)
  useEffect(() => setMenu(false), [pathname])
  return (
    <header className="k-cab">
      <div className="k-cab-fila k-pag">
        <KLink className="k-mb" to={v5path('k')} aria-label={`${c.nav.inicio} · ${personal.name}`}>MB</KLink>
        <span className="k-nombre">{personal.firstName}<span className="k-ap"> {personal.lastName}</span></span>
        <nav className="k-nav" aria-label={c.nav.aria}>
          <KNavLink to={v5path('k', 'obra')}>{c.nav.obra}</KNavLink>
          <KNavLink to={v5path('k', 'trayectoria')}>{c.nav.trayectoria}</KNavLink>
          <KNavLink to={v5path('k', 'contacto')}>{c.nav.contacto}</KNavLink>
        </nav>
        <div className="k-idiomas" role="group" aria-label={c.idioma}>
          {IDIOMAS.map((l) => (
            <button key={l} type="button" lang={l} aria-pressed={locale === l} onClick={() => setLocale(l)}>{l.toUpperCase()}</button>
          ))}
        </div>
        <button type="button" className="k-menu" aria-expanded={menu} aria-controls="k-menu-panel" aria-label={menu ? c.nav.cerrarMenu : c.nav.menu} onClick={() => setMenu((m) => !m)}>
          <i aria-hidden="true" />
        </button>
      </div>
      {menu && (
        <nav id="k-menu-panel" className="k-menu-panel k-pag" aria-label={c.nav.aria}>
          <KLink to={v5path('k')}>{c.nav.inicio}</KLink>
          <KLink to={v5path('k', 'obra')}>{c.nav.obra}</KLink>
          <KLink to={v5path('k', 'trayectoria')}>{c.nav.trayectoria}</KLink>
          <KLink to={v5path('k', 'contacto')}>{c.nav.contacto}</KLink>
          <a href={personal.cv} target="_blank" rel="noopener noreferrer" onClick={() => evento('k', 'contact_click', { canal: 'cv' })}>{c.nav.cv}</a>
        </nav>
      )}
    </header>
  )
}

export function Pie() {
  const c = useCopy()
  const { personal, strings, locale } = useV5()
  const hora = useMedellinTime(INTL[locale])
  return (
    <footer className="k-pie">
      <div className="k-pag k-pie-fila k-mono">
        <span>{personal.name}</span>
        <span>{strings.footer.tagline}</span>
        <span>{c.medellin} <time>{hora}</time></span>
      </div>
    </footer>
  )
}

/** Barra inferior de 64 px (solo móvil): en las vistas con placa lleva el control Piel | Esqueleto | Medición y Contacto. */
export function BarraInferior({ conCapas }: { conCapas: boolean }) {
  const c = useCopy()
  return (
    <div className="k-barra" role="region" aria-label={c.nav.barra}>
      {conCapas ? (
        <>
          <SegCapa className="k-seg--barra" />
          <KLink className="k-btn k-btn--barra" to={v5path('k', 'contacto')}>{c.nav.contacto}</KLink>
        </>
      ) : (
        <>
          <KNavLink to={v5path('k', 'obra')} className="k-barra-l">{c.nav.obra}</KNavLink>
          <KNavLink to={v5path('k', 'trayectoria')} className="k-barra-l">{c.nav.trayectoria}</KNavLink>
          <KLink className="k-btn k-btn--barra" to={v5path('k', 'contacto')}>{c.nav.contacto}</KLink>
        </>
      )}
    </div>
  )
}
