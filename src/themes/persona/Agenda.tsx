import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { useCopiaAgenda } from '../shared/agenda'
import { vozAgenda } from './vozAgenda'
import './agenda-marco.css'

// El calendario (su código, su CSS y la consulta a la agenda) no se pide ni se monta hasta que la sección se acerca a la
// vista (600 px) o la URL trae #agenda: useAgenda() mide booking_open al montarse, y un visitante que nunca llega aquí no
// debe contarse como alguien que abrió la agenda. Mientras tanto, un esqueleto con la misma altura.
const Calendario = lazy(() => import('./Calendario'))

function Esqueleto() {
  return (
    <div className="pr-ag pr-ag--esqueleto" aria-hidden="true">
      <div className="pr-ag__cab">
        <span className="pr-ag__sq-titulo" />
      </div>
      <div className="pr-ag__cuerpo">
        <div className="pr-ag__col pr-ag__col--dias">
          <div className="pr-ag__rejilla" style={{ '--cols': 5 } as React.CSSProperties}>
            {Array.from({ length: 15 }, (_, i) => (
              <span key={i} className="pr-ag__vacio" />
            ))}
          </div>
        </div>
        <div className="pr-ag__col pr-ag__col--horas" />
      </div>
    </div>
  )
}

export default function Agenda() {
  const { hash } = useLocation()
  const { locale } = useLanguage()
  const base = useCopiaAgenda()
  const raiz = useRef<HTMLElement>(null)
  const [montado, setMontado] = useState(() => hash === '#agenda')

  useEffect(() => {
    if (hash === '#agenda') setMontado(true)
  }, [hash])

  useEffect(() => {
    const el = raiz.current
    if (montado || !el) return
    if (!('IntersectionObserver' in window)) return void setMontado(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMontado(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [montado])

  return (
    <section id="agenda" className="pr-agenda" ref={raiz} aria-label={vozAgenda(locale as Locale, base).titulo}>
      {montado ? (
        <Suspense fallback={<Esqueleto />}>
          <Calendario />
        </Suspense>
      ) : (
        <Esqueleto />
      )}
    </section>
  )
}
