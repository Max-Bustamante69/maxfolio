// Índice de obra con escenario fijo (arquetipos B + C del v4): filas con filetes (cada fila es UN <a>), nombre grande, y a la
// derecha una ventana sticky con la captura de la fila enfocada. En móvil no hay escenario: la fila que cruza el centro de la
// pantalla es la «activa» y cada fila lleva su miniatura. Abrir una obra no usa el disco: la captura viaja a su ficha (FLIP).
// El disco «Ver obra» del cursor vive solo sobre la ventana del escenario (señala la captura): sobre una fila taparía su nombre.
import { useEffect, useRef, useState } from 'react'
import { v5path, type Obra } from '../data'
import { ShotImg, pieDeCaptura } from '../shared/ShotImg'
import { useCopy } from './copy'
import { Enlace, useTransicion } from './transicion'

const escritorio = () => matchMedia('(min-width: 1024px)').matches

function Escenario({ obra, n, abrir }: { obra: Obra | undefined; n: number; abrir: (rect: DOMRect) => void }) {
  const c = useCopy()
  const [par, setPar] = useState<{ a?: Obra; b?: Obra }>({ a: obra })
  const [lista, setLista] = useState<string | null>(null)
  useEffect(() => setPar((p) => (p.a?.slug === obra?.slug ? p : { a: obra, b: p.a })), [obra])
  const pinta = (o: Obra | undefined, rol: 'actual' | 'previa') =>
    o?.views.includes('home') ? (
      <ShotImg key={`${rol}-${o.slug}`} slug={o.slug} vista="home" vp="desktop" alt="" prioridad loading="eager" decoding="sync" className={`dd-escena__img dd-escena__img--${rol}`} onLoad={() => setLista(o.slug)} data-lista={lista === o.slug || undefined} />
    ) : null
  const a = par.a
  return (
    <figure className="dd-escena" aria-label={c.obra.escenario}>
      {/* Con el puntero, la ventana abre la ficha (el disco «Ver obra» lo anuncia); con teclado y lector, la fila es el enlace. */}
      <div className="dd-escena__ventana" data-cursor={a?.views.includes('home') ? 'ver' : undefined} onClick={(e) => a?.views.includes('home') && abrir(e.currentTarget.getBoundingClientRect())}>
        {pinta(par.b, 'previa')}
        {pinta(a, 'actual')}
        {a && !a.views.includes('home') && (
          <div className="dd-escena__vacio">
            <span className="dd-escena__nombre">{a.name}</span>
            <span className="dd-micro">{c.obra.sinCaptura}</span>
          </div>
        )}
      </div>
      <figcaption className="dd-micro">{a?.views.includes('home') ? `Nº ${String(n + 1).padStart(2, '0')} · ${pieDeCaptura(a.name, 'home', 'desktop')}` : a ? `Nº ${String(n + 1).padStart(2, '0')} · ${a.name} · ${c.obra.sinCaptura}` : ''}</figcaption>
    </figure>
  )
}

export default function IndiceObra({ obras }: { obras: Obra[] }) {
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
              {o.views.includes('home') && <img className="dd-fila__mini" src={`/v5/digitdeck/mini/${o.slug}.webp`} width={480} height={300} alt="" loading="lazy" decoding="async" />}
            </Enlace>
          </li>
        ))}
      </ol>
      <div className="dd-indice__escena">
        <Escenario obra={fila} n={Math.min(activa, obras.length - 1)} abrir={(rect) => fila && t.irFicha(v5path('digitdeck', 'obra', fila.slug), rect)} />
      </div>
    </div>
  )
}
