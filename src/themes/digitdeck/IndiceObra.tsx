// Índice de obra con escenario fijo (arquetipos B + C del v4): filas con filetes (cada fila es UN <a>), nombre grande con su historia en
// una línea, y a la derecha una ventana sticky con la captura de la fila enfocada (o, si la obra no tiene captura, su historia y su
// pila). En móvil no hay escenario: la fila que cruza el centro de la pantalla es la «activa» y cada fila lleva su miniatura. Abrir
// una obra no usa el disco: la captura viaja a su ficha (FLIP). El disco «Ver obra» del cursor vive solo sobre la ventana del
// escenario (señala la captura): sobre una fila taparía su nombre.
import { useEffect, useRef, useState } from 'react'
import { v5path, type Obra } from '../data'
import { ShotImg, pieDeCaptura } from '../shared/ShotImg'
import { useCopy } from './copy'
import { Enlace, useTransicion } from './transicion'

const escritorio = () => matchMedia('(min-width: 1024px)').matches
/** La historia de una fila: su tagline o, si la defensa de la capa pública lo dejó vacío, su descripción. */
const historiaDe = (o: Obra) => o.tagline || o.description

function Escenario({ obra, n, abrir, prioridad }: { obra: Obra | undefined; n: number; abrir: (rect: DOMRect) => void; prioridad?: boolean }) {
  const c = useCopy()
  // La obra actual sale siempre de la prop (un cambio de idioma reemplaza sus textos); solo la previa se recuerda, para fundir la captura.
  const [previa, setPrevia] = useState<Obra | undefined>()
  const ultima = useRef(obra)
  const [lista, setLista] = useState<string | null>(null)
  useEffect(() => {
    if (ultima.current?.slug === obra?.slug) return
    setPrevia(ultima.current)
    ultima.current = obra
  }, [obra])
  const pinta = (o: Obra | undefined, rol: 'actual' | 'previa') =>
    o?.views.includes('home') ? (
      <ShotImg key={`${rol}-${o.slug}`} slug={o.slug} vista="home" vp="desktop" alt="" prioridad={prioridad} loading="lazy" decoding="sync" className={`dd-escena__img dd-escena__img--${rol}`} onLoad={() => setLista(o.slug)} data-lista={lista === o.slug || undefined} />
    ) : null
  const a = obra
  const conCaptura = !!a?.views.includes('home')
  return (
    <figure className="dd-escena" aria-label={c.obra.escenario}>
      {/* Con el puntero, la ventana abre la ficha (el disco «Ver obra» lo anuncia); con teclado y lector, la fila es el enlace. */}
      <div className="dd-escena__ventana" data-cursor={conCaptura ? 'ver' : undefined} onClick={(e) => conCaptura && abrir(e.currentTarget.getBoundingClientRect())}>
        {pinta(previa, 'previa')}
        {pinta(a, 'actual')}
        {a && !conCaptura && (
          <div className="dd-escena__vacio" key={a.slug}>
            <span className="dd-micro">{c.obra.tipos[a.kind]} · {a.year}</span>
            <span className="dd-escena__nombre">{a.name}</span>
            {historiaDe(a) && <span className="dd-escena__historia">{historiaDe(a)}</span>}
            {a.stack.length > 0 && <span className="dd-micro">{a.stack.slice(0, 5).join(' · ')}</span>}
          </div>
        )}
      </div>
      <figcaption>
        {a && (
          <>
            <span className="dd-escena__pie dd-micro">{c.obra.nombreDe(n + 1)} · {conCaptura ? pieDeCaptura(a.name, 'home', 'desktop') : a.name}</span>
            {conCaptura && historiaDe(a) && <span className="dd-escena__historia">{historiaDe(a)}</span>}
          </>
        )}
      </figcaption>
    </figure>
  )
}

/** `prioridad`: el escenario es el LCP de escritorio (la página de obra). Siempre diferido: en móvil está oculto y no se descarga. */
export default function IndiceObra({ obras, prioridad }: { obras: Obra[]; prioridad?: boolean }) {
  const c = useCopy()
  const t = useTransicion()
  const [activa, setActiva] = useState(0)
  const lista = useRef<HTMLOListElement>(null)

  // Móvil: la fila que cruza una franja fina en el centro de la pantalla hace de activa (sin mover nada del diseño).
  useEffect(() => {
    const filas = lista.current?.querySelectorAll<HTMLElement>('[data-i]')
    if (!filas?.length) return
    const io = new IntersectionObserver(
      (es) => {
        if (escritorio()) return
        const e = es.find((x) => x.isIntersecting)
        if (e) setActiva(Number((e.target as HTMLElement).dataset.i))
      },
      { rootMargin: '-46% 0px -46% 0px' },
    )
    filas.forEach((f) => io.observe(f))
    return () => io.disconnect()
  }, [obras])

  const fila = obras[Math.min(activa, obras.length - 1)]
  return (
    <div className="dd-indice">
      <ol ref={lista} className="dd-indice__lista" data-fuera="">
        {obras.map((o, i) => (
          <li key={o.slug} className="dd-indice__li" data-i={i} data-slug={o.slug} data-in="fila">
            <Enlace
              to={v5path('digitdeck', 'obra', o.slug)}
              etiqueta={o.name}
              className="dd-fila"
              data-activa={i === activa}
              viaja={(a) => (!o.views.includes('home') ? null : escritorio() ? document.querySelector('.dd-escena__ventana') : a.querySelector('.dd-fila__mini'))}
              onPointerEnter={() => escritorio() && setActiva(i)}
              onFocus={() => setActiva(i)}
            >
              <span className="dd-fila__n dd-micro">{c.obra.cuenta(i + 1, obras.length)}</span>
              <span className="dd-fila__nombre">{o.name}</span>
              <span className="dd-fila__meta">{[o.industry ?? c.obra.tipos[o.kind], o.rolLabel, o.year].filter(Boolean).join(' · ')}</span>
              {historiaDe(o) && <span className="dd-fila__historia">{historiaDe(o)}</span>}
              {o.views.includes('home') && <img className="dd-fila__mini" src={`/v5/digitdeck/mini/${o.slug}.webp`} width={480} height={300} alt="" loading="lazy" decoding="async" />}
            </Enlace>
          </li>
        ))}
      </ol>
      <div className="dd-indice__escena">
        <Escenario prioridad={prioridad} obra={fila} n={Math.min(activa, obras.length - 1)} abrir={(rect) => fila && t.irFicha(v5path('digitdeck', 'obra', fila.slug), rect)} />
      </div>
    </div>
  )
}
