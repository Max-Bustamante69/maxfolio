import { useLayoutEffect, useRef } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { preload } from 'react-dom'
import { useLanguage } from '../../context/LanguageContext'
import { en } from '../../content/en'
import { getContent } from '../../content'
import { useV5, v5path } from '../data'
import Contacto from './Contacto'
import { useCopy } from './copy'
import Ficha from './Ficha'
import Inicio from './Inicio'
import { Nav } from './Nav'
import Obra from './Obra'
import { Enlace } from './piezas'
import Trayectoria from './Trayectoria'
import './tokens.css'
import './ingenieria.css'

const BASE = v5path('ingenieria')

function Pie() {
  const c = useCopy()
  const { personal, strings: s } = useV5()
  const vinculos: Array<[string, string]> = [[BASE, c.nav.inicio], [`${BASE}/obra`, c.nav.obra], [`${BASE}/trayectoria`, c.nav.trayectoria], [`${BASE}/contacto`, c.nav.contacto]]
  return (
    <footer className="ing-pie">
      <div className="ing-marco ing-pie-in">
        <div className="ing-pie-marca">
          <p className="ing-pie-nombre"><span className="ing-marca-sello" aria-hidden="true">MB</span>{personal.name}</p>
          <p className="ing-pie-lema">{s.footer.tagline}</p>
          <a className="ing-enlace" href={`mailto:${personal.email}`}>{personal.email}</a>
        </div>
        <nav className="ing-pie-col" aria-label={c.pie.nav}>
          <p className="ing-etq">{c.pie.sitio}</p>
          <ul>{vinculos.map(([to, t]) => <li key={to}><Enlace to={to}>{t}</Enlace></li>)}</ul>
        </nav>
        <div className="ing-pie-col ing-pie-serv">
          <p className="ing-etq">{s.footer.servicesTitle}</p>
          <ul>{s.footer.services.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div className="ing-pie-col">
          <p className="ing-etq">{c.contacto.canales}</p>
          <ul>
            <li><a href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href={personal.github} target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href={personal.cv} download>{c.contacto.cvC}</a></li>
          </ul>
        </div>
      </div>
      <div className="ing-marco ing-pie-base">
        <p>© 2026 {personal.name} · {c.pie.medellin}</p>
        <button type="button" className="ing-enlace" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{c.pie.arriba}</button>
      </div>
    </footer>
  )
}

// Dirección «Ingeniería»: el portafolio de un CTO como la página de producto de una empresa de ingeniería de primer nivel.
export default function App() {
  const c = useCopy()
  const { locale } = useLanguage()
  const { personal } = useV5()
  const raiz = useRef<HTMLDivElement>(null)
  // Los textos de es/ja llegan en su propio chunk; hasta entonces useContent devuelve inglés. Se espera para no montar la vista dos veces.
  const listo = locale === 'en' || getContent(locale) !== en

  preload('/fonts/ingenieria/inter-latin-var.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  preload('/fonts/ingenieria/newsreader-display-var.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })

  useLayoutEffect(() => {
    document.documentElement.style.backgroundColor = getComputedStyle(raiz.current!).getPropertyValue('--ing-paper')
    return () => { document.documentElement.style.backgroundColor = '' }
  }, [])

  return (
    <div className="v5-ingenieria ing-raiz" ref={raiz}>
      <a className="ing-saltar" href="#contenido">{c.saltar}</a>
      <div className="ing-pulso" aria-hidden="true" />
      <Nav cv={personal.cv} />
      {listo ? (
        <Routes>
          <Route index element={<Inicio key={locale} />} />
          <Route path="obra" element={<Obra key={locale} />} />
          <Route path="obra/:slug" element={<Ficha />} />
          <Route path="trayectoria" element={<Trayectoria key={locale} />} />
          <Route path="contacto" element={<Contacto key={locale} />} />
          <Route path="*" element={<Navigate to={BASE} replace />} />
        </Routes>
      ) : (
        <main id="contenido" className="ing-vista" aria-busy="true" />
      )}
      <Pie />
    </div>
  )
}
