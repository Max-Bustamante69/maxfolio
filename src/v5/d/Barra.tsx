import { useRef, type CSSProperties } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { useV5, v5path } from '../data'
import { Enlace, EnlaceNav } from './Enlace'
import { Marca } from './Marca'
import { useAnimaAlMontar } from './ajustes'
import { CORTE, LIMPIAR, SNAP, esPrimeraCarga, gsap, useCoreografia } from './movimiento'
import { useCopy } from './copy'

const IDIOMAS: Locale[] = ['es', 'en', 'ja']

/** Selector de idioma: tres teclas con una palanca que se asienta bajo la activa; JA lleva «parcial» mientras caiga a
 *  inglés en las etiquetas de la dirección. */
export function SelectorIdioma({ alCambiar, enBarra }: { alCambiar?: (l: Locale) => void; enBarra?: boolean }) {
  const c = useCopy()
  const { locale, setLocale } = useLanguage()
  return (
    <div className={enBarra ? 'd-trk d-idioma-barra' : 'd-trk'} style={{ '--n': 3, '--i': IDIOMAS.indexOf(locale) } as CSSProperties} role="group" aria-label={c.idiomaAria}>
      <i className="d-knob" aria-hidden="true" />
      {IDIOMAS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className="d-opt"
          aria-pressed={locale === l}
          title={l === 'ja' ? c.jaParcial : undefined}
          aria-label={l === 'ja' ? `JA · ${c.jaParcial}` : undefined}
          onClick={() => {
            setLocale(l)
            alCambiar?.(l)
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

const DESTINOS = [
  ['inicio', ''],
  ['obra', 'obra'],
  ['trayectoria', 'trayectoria'],
  ['contacto', 'contacto'],
] as const

/** «Barra de modelo»: marca grabada, nombre y cuatro destinos con la palabra llana primero y la metáfora como subtítulo.
 *  En móvil la misma <nav> pasa a barra inferior de 64 px. Un solo marcador LED lleva lo activo (X4). */
export function Barra() {
  const c = useCopy()
  const { personal } = useV5()
  const { pathname } = useLocation()
  const anima = useAnimaAlMontar()
  const ref = useRef<HTMLDivElement>(null)
  const enInicio = pathname.replace(/\/$/, '') === v5path('d')
  const activo = Math.max(0, DESTINOS.findIndex(([, ruta], i) => i > 0 && pathname.startsWith(v5path('d', ruta as 'obra'))))

  // Entrada: las celdas de la barra barren de arriba abajo, una tras otra, como el chasis que se enciende.
  useCoreografia(ref, () => {
    if (!esPrimeraCarga()) return
    gsap.from('[data-b]', { clipPath: CORTE.oculto, duration: 0.3, stagger: 0.05, ease: SNAP, clearProps: LIMPIAR })
  }, anima)

  return (
    <div className="d-chasis" ref={ref}>
      <header className="d-barra">
        <Enlace to={v5path('d')} className="d-marca" aria-label={c.marcaAria} data-b>
          <Marca />
        </Enlace>
        <span className="d-quien" data-b>{`Max ${personal.lastName}`}</span>
        <div className="d-barra-fin" data-b data-inicio={enInicio || undefined}>
          <SelectorIdioma enBarra />
          <a className="d-cv" href={personal.cv} download>
            CV <span aria-hidden="true">↓</span>
            <span className="d-solo-lector"> ({c.pie.cv})</span>
          </a>
        </div>
      </header>
      {/* La <nav> es hermana de la barra, no hija: un elemento con view-transition-name es bloque contenedor de lo fijo. */}
      <nav className="d-nav" aria-label={c.navAria} style={{ '--i': activo } as CSSProperties}>
        {DESTINOS.map(([id, ruta]) => (
          <EnlaceNav key={id} to={v5path('d', ruta)} end={id === 'inicio'} className="d-nav-enlace" data-b>
            <b>{c.nav[id][0]}</b>
            <i>{c.nav[id][1]}</i>
          </EnlaceNav>
        ))}
        <i className="d-marcador" aria-hidden="true" />
      </nav>
    </div>
  )
}
