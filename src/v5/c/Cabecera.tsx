import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { v5path } from '../data'
import { supportedLocales, useLanguage, type Locale } from '../../context/LanguageContext'
import { guardarSesion } from './datos'
import { Disposicion } from './Disposicion'
import { calentarMesa, useAncho, useC, useListo, usePor, useVista } from './useC'

const NOMBRES: Record<Locale, string> = { es: 'ES', en: 'EN', ja: 'JA' }
const VISTAS = ['obra', 'trayectoria', 'contacto'] as const

/** Cabecera de 56 px: marca, control Lectura | Mesa, disposición (en el inicio), navegación en palabras llanas e idioma.
 *  Con menos de 900 px la navegación vive en un menú y Lectura | Mesa en una píldora fija abajo. */
export function Cabecera() {
  const { t, locale, personal } = useC()
  const { setLocale } = useLanguage()
  const { pathname } = useLocation()
  const vista = useVista()
  const [por, setPor] = usePor()
  const ancho = useAncho()
  const [abierto, setAbierto] = useState(false)
  const inicio = v5path('c')
  const enInicio = pathname.replace(/\/$/, '') === inicio

  useEffect(() => setAbierto(false), [pathname])

  const nav = VISTAS.map((v) => {
    const ruta = v5path('c', v)
    const activa = pathname === ruta || pathname.startsWith(`${ruta}/`)
    return (
      <Link key={v} to={ruta} aria-current={activa ? 'page' : undefined}>
        {t.nav[v]}
      </Link>
    )
  })
  const idioma = (
    <label className="c-idioma">
      <span className="c-sr">{t.idioma.aria}</span>
      <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
        {supportedLocales.map((l) => (
          <option key={l} value={l}>
            {NOMBRES[l]}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <>
      <header className="c-cab" onKeyDown={(e) => e.key === 'Escape' && setAbierto(false)}>
        <div className="c-cab__fila">
          <Link className="c-marca" to={inicio} aria-label={t.marca}>
            <span className="c-mb" aria-hidden="true">
              MB
            </span>
            <span className="c-marca__nombre" aria-hidden="true">
              {personal.name}
            </span>
          </Link>
          {ancho ? (
            <>
              <div className="c-centro">
                <Seg vista={vista} enInicio={enInicio} />
                {enInicio && <Disposicion por={por} onChange={setPor} variante="cab" />}
              </div>
              <nav className="c-nav" aria-label={t.nav.aria}>
                {nav}
              </nav>
              {idioma}
            </>
          ) : (
            <button type="button" className="c-menu-btn" aria-expanded={abierto} aria-controls="c-menu" onClick={() => setAbierto((a) => !a)}>
              <span className="c-sr">{t.nav.menu}</span>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {abierto ? <path d="M5 5l12 12M17 5L5 17" /> : <path d="M3 7h16M3 15h16" />}
              </svg>
            </button>
          )}
        </div>
        {!ancho && (
          <div id="c-menu" className="c-menu" data-abierto={abierto || undefined} inert={!abierto}>
            <nav className="c-nav" aria-label={t.nav.aria}>
              {nav}
            </nav>
            {idioma}
          </div>
        )}
      </header>
      {!ancho && enInicio && vista === 'lectura' && (
        <nav className="c-pildora" aria-label={t.vista.aria}>
          <Seg vista={vista} enInicio={enInicio} pildora />
        </nav>
      )}
    </>
  )
}

/** Control segmentado Lectura | Mesa. Si la mesa está abierta, «Lectura» la cierra con su animación en vez de saltar. */
function Seg({ vista, enInicio, pildora }: { vista: 'lectura' | 'mesa'; enInicio: boolean; pildora?: boolean }) {
  const { t } = useC()
  const inicio = v5path('c')
  const pulsa = (v: 'lectura' | 'mesa') => (e: React.MouseEvent) => {
    guardarSesion('vista', v)
    if (v === 'lectura' && vista === 'mesa' && enInicio) {
      e.preventDefault()
      window.dispatchEvent(new Event('c:salir-mesa'))
    }
  }
  return (
    <div className={pildora ? 'c-seg c-seg--pildora' : 'c-seg'} role="group" aria-label={pildora ? undefined : t.vista.aria}>
      <Link to={`${inicio}?vista=lectura`} onClick={pulsa('lectura')} aria-current={enInicio && vista === 'lectura' ? 'true' : undefined}>
        {t.vista.lectura}
      </Link>
      <Link to={`${inicio}?vista=mesa`} onClick={pulsa('mesa')} {...calentarMesa} aria-current={enInicio && vista === 'mesa' ? 'true' : undefined} data-abrir-mesa={pildora ? '' : undefined}>
        {pildora && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="1.5" y="2.5" width="7" height="5" rx="1" />
            <rect x="11.5" y="3.5" width="7" height="5" rx="1" />
            <rect x="2.5" y="11.5" width="5" height="6" rx="1" />
            <rect x="10.5" y="11.5" width="7" height="6" rx="1" />
          </svg>
        )}
        {t.vista.mesa}
      </Link>
    </div>
  )
}

export function Pie() {
  const { t, locale, strings } = useC()
  const listo = useListo()
  return (
    <footer className="c-pie">
      <p>{listo ? strings.footer.tagline : ' '}</p>
      <p className="c-pie__marca c-mono">{t.pie.marca}</p>
      {locale === 'ja' && <p lang="en">{t.idioma.nota}</p>}
    </footer>
  )
}
