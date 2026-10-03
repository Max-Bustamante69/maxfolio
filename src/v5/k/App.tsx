import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { preload } from 'react-dom'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { v5path } from '../data'
import Contacto from './Contacto'
import Ficha from './Ficha'
import Inicio from './Inicio'
import Obra from './Obra'
import Trayectoria from './Trayectoria'
import { useCopy } from './copy'
import type { Capa } from './medicion'
import { BARRIDO, gsap } from './motion'
import { KCtx, type IrOpciones } from './nav'
import { BarraInferior, Cabecera, Pie } from './Shell'
import './tokens.css'
import './k.css'

// Dirección K · Radiografía. Las cinco vistas con <Routes> relativas a /v5/k; cualquier otra ruta vuelve al inicio.
//
// Transición de vista (EX-7): la línea de escaneo se lleva la vista vieja hacia abajo (320 ms, power1.inOut: velocidad casi
// constante, para que la línea SE VEA cruzar la pantalla) y deja caer la nueva detrás de ella (550 ms, power2.out), siempre
// en el mismo sentido. Es clip-path en el contenedor de la vista y transform en la línea: nada de lo que se anima dispara
// layout. Sin espera codificada: la navegación ocurre al terminar el barrido.
const CABECERA = 56

type Modo = 'barrido' | 'vuelo' | 'pop'

export default function App() {
  const c = useCopy()
  const navigate = useNavigate()
  const loc = useLocation()
  const [capa, setCapa] = useState<Capa>('medicion')
  const vista = useRef<HTMLDivElement>(null)
  const barrido = useRef<HTMLDivElement>(null)
  const modo = useRef<Modo>('pop')
  const primera = useRef(true)
  const ctx = useRef<gsap.Context | null>(null)
  const activo = useRef<gsap.core.Tween | null>(null)
  const locRef = useRef(loc)
  locRef.current = loc

  // Solo se precarga la fuente del h1; la de texto y la mono entran por font-display: swap.
  preload('/fonts/k/sofia-sans-extra-condensed.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })

  useLayoutEffect(() => {
    ctx.current = gsap.context(() => {})
    return () => ctx.current?.revert()
  }, [])

  const ir = useCallback(
    (a: string, o?: IrOpciones) => {
      const l = locRef.current
      if (a === `${l.pathname}${l.search}`) return
      const v = vista.current
      const b = barrido.current
      // Un segundo clic parte de donde está: corta el barrido en curso y navega ya (interrumpible).
      const enCurso = activo.current?.isActive()
      activo.current?.kill()
      if (enCurso && v && b) {
        v.style.clipPath = ''
        gsap.set(b, { opacity: 0 })
      }
      if (!v || !b || o?.sinBarrido || enCurso) {
        modo.current = o?.sinBarrido ? 'vuelo' : 'pop'
        navigate(a)
        return
      }
      modo.current = 'barrido'
      const vh = window.innerHeight - CABECERA
      const y0 = window.scrollY
      const p = { v: 0 }
      ctx.current?.add(() => {
        gsap.set(b, { opacity: 1 })
        activo.current = gsap.to(p, {
          v: 1,
          ...BARRIDO.salida,
          onUpdate: () => {
            v.style.clipPath = `inset(${y0 + p.v * vh}px 0 0 0)`
            b.style.transform = `translate3d(0,${p.v * vh}px,0)`
          },
          onComplete: () => navigate(a),
        })
      })
    },
    [navigate],
  )

  // Entrada de la vista nueva: antes de pintar, escondida detrás de la línea; la línea la revela de arriba abajo.
  useLayoutEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    window.scrollTo(0, 0)
    document.getElementById('contenido')?.focus({ preventScroll: true })
    const v = vista.current
    const b = barrido.current
    const m = modo.current
    modo.current = 'pop'
    if (!v || !b) return
    if (m !== 'barrido') {
      v.style.clipPath = ''
      return
    }
    const vh = window.innerHeight - CABECERA
    const H = v.offsetHeight
    const p = { v: 0 }
    v.style.clipPath = `inset(0 0 ${H}px 0)`
    b.style.transform = 'translate3d(0,0,0)'
    ctx.current?.add(() => {
      activo.current = gsap.to(p, {
        v: 1,
        ...BARRIDO.entrada,
        onUpdate: () => {
          const y = p.v * vh
          v.style.clipPath = `inset(0 0 ${Math.max(H - y, 0)}px 0)`
          b.style.transform = `translate3d(0,${y}px,0)`
        },
        onComplete: () => {
          v.style.clipPath = ''
          gsap.set(b, { opacity: 0 })
        },
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname])

  // Si la ficha cambia de idioma o de placa, el foco no se mueve; solo al cambiar de vista.
  useEffect(() => {
    document.documentElement.classList.add('k-activo')
    return () => document.documentElement.classList.remove('k-activo')
  }, [])

  const conCapas = /^\/v5\/k\/?$/.test(loc.pathname) || /^\/v5\/k\/obra\/[^/]+/.test(loc.pathname)
  const valor = useMemo(() => ({ ir, capa, setCapa }), [ir, capa])

  return (
    <KCtx.Provider value={valor}>
      <div className="v5-root v5-k">
        <a className="k-saltar" href="#contenido">{c.saltar}</a>
        <Cabecera />
        <div ref={vista} className="k-vista">
          <main id="contenido" tabIndex={-1}>
            <Routes>
              <Route index element={<Inicio />} />
              <Route path="obra" element={<Obra />} />
              <Route path="obra/:slug" element={<Ficha />} />
              <Route path="trayectoria" element={<Trayectoria />} />
              <Route path="contacto" element={<Contacto />} />
              <Route path="*" element={<Navigate to={v5path('k')} replace />} />
            </Routes>
          </main>
          <Pie />
        </div>
        <BarraInferior conCapas={conCapas} />
        <div ref={barrido} className="k-barrido" aria-hidden="true" />
      </div>
    </KCtx.Provider>
  )
}
