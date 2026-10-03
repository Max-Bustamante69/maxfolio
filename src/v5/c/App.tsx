import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { preload } from 'react-dom'
import { Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { v5path } from '../data'
import { Cabecera, Pie } from './Cabecera'
import Contacto from './Contacto'
import Ficha from './Ficha'
import Inicio from './Inicio'
import { aterrizarVuelo, entrarShell, entrarVista, gsap, salirVista } from './movimiento'
import ObraIndice from './Obra'
import { Reglas, type ReglasApi } from './Reglas'
import Trayectoria from './Trayectoria'
import { useAncho, useC, useListo } from './useC'
import './tokens.css'
import './c.css'

// Dirección C · Mesa de luz. Las cinco vistas con <Routes> relativas a /v5/c; cualquier otra ruta vuelve al inicio.
export default function App() {
  const { t } = useC()
  const raiz = useRef<HTMLDivElement>(null)
  const reglas = useRef<ReglasApi>(null)
  const ancho = useAncho()
  // Solo se precarga la fuente del h1 (Albert Sans); Martian Mono entra con font-display: swap.
  preload('/fonts/c/albert-sans-latin.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })

  // La mesa se enciende una vez por carga: la luz sube, las reglas se trazan y la cabecera asienta.
  useLayoutEffect(() => {
    if (!raiz.current) return
    const ctx = gsap.context(() => {}, raiz)
    ctx.add(() => {
      try {
        entrarShell(raiz.current!)
      } catch {
        ctx.revert() // fail-open: si el movimiento falla, queda el estado final del CSS
      }
    })
    return () => ctx.revert()
  }, [])

  // Las reglas leen la hoja: al hacer scroll sus marcas y cifras se desplazan con ella (un manejador de scroll, nunca un lazo: en reposo no corre nada).
  useEffect(() => {
    if (!ancho) return
    const f = () => reglas.current?.actualizar(28, 138 - window.scrollY, 0.34)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [ancho])
  return (
    <div className="v5-root v5-c c-app" ref={raiz}>
      <meta name="robots" content="noindex" />
      <a
        className="c-saltar"
        href="#contenido"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('contenido')?.focus()
        }}
      >
        {t.saltar}
      </a>
      <div className="c-fondo" aria-hidden="true">
        <div className="c-luz" />
      </div>
      <Reglas ref={reglas} />
      <Cabecera />
      <Vistas />
      <Pie />
    </div>
  )
}

/** Las vistas con su transición (EX-7): la actual sale en ~120 ms, la nueva entra en ≤ 0,5 s y el contenido es usable en < 1 s.
 *  Un cambio solo de búsqueda (?por, ?tipo, ?vista) no es una transición: se aplica al momento. */
function Vistas() {
  const location = useLocation()
  const tipo = useNavigationType()
  const [mostrada, setMostrada] = useState(location)
  const raiz = useRef<HTMLDivElement>(null)
  const primera = useRef(true)
  const posiciones = useRef(new Map<string, number>())
  const pendiente = useRef<number | null>(null)
  const listo = useListo()
  const mostro = useRef(false) // el cambio de idioma a mitad de visita no vacía la página: la espera es solo de la primera pintura
  if (listo) mostro.current = true
  const ver = mostro.current

  useEffect(() => {
    if (location === mostrada) return
    if (location.pathname === mostrada.pathname) {
      setMostrada(location)
      return
    }
    posiciones.current.set(mostrada.key, window.scrollY)
    pendiente.current = tipo === 'POP' ? (posiciones.current.get(location.key) ?? null) : null
    let vivo = true
    void salirVista(raiz.current).then(() => vivo && setMostrada(location))
    return () => {
      vivo = false
    }
  }, [location, mostrada, tipo])

  // La vista nueva ya está en el DOM: arriba del todo (o donde se dejó, al volver atrás), foco al contenido y la entrada.
  useLayoutEffect(() => {
    const el = raiz.current
    if (!el || !ver) return
    const arriba = primera.current
    window.scrollTo(0, 0)
    let limpiar = () => {}
    const ctx = gsap.context(() => {}, el)
    ctx.add(() => {
      try {
        limpiar = entrarVista(el, arriba)
      } catch {
        ctx.revert()
      }
    })
    aterrizarVuelo(el) // fuera del contexto: el vuelo de las capturas termina aunque se navegue a mitad
    if (!arriba) document.getElementById('contenido')?.focus({ preventScroll: true })
    if (pendiente.current !== null) {
      const y = pendiente.current
      pendiente.current = null
      requestAnimationFrame(() => window.scrollTo(0, y)) // el ScrollToTop del sitio corre justo después
    }
    primera.current = false
    return () => {
      limpiar()
      ctx.revert()
    }
  }, [mostrada.pathname, ver])

  return (
    <div className="c-vistas" ref={raiz}>
      {ver && (
        <Routes location={mostrada}>
          <Route index element={<Inicio />} />
          <Route path="obra" element={<ObraIndice />} />
          <Route path="obra/:slug" element={<Ficha />} />
          <Route path="trayectoria" element={<Trayectoria />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="*" element={<Navigate to={v5path('c')} replace />} />
        </Routes>
      )}
    </div>
  )
}
