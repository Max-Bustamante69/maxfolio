import { useEffect, useLayoutEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { v5path, type Obra as ObraT, type ObraKind } from '../data'
import { ShotImg } from '../shared/ShotImg'
import { Cabeza } from './Cabeza'
import { ID, usePersona } from './contexto'
import { entradaTitulos } from './efectos'
import { limpio } from './limpio'
import { Enlace, Fondo, Titulo } from './piezas'
import { enVista, gsap, guardarViaje, memoria, parallaxFondo, revelarPaneles, ScrollTrigger, SLAM, useGsap, viajePendiente, volarDesde } from './motion'

type Filtro = 'todo' | ObraKind
const FILTROS: Filtro[] = ['todo', 'store', 'product', 'personal', 'role']

function iniciales(nombre: string) {
  const p = nombre.replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean)
  return (p.length > 1 ? p[0][0] + p[1][0] : (p[0] ?? '?').slice(0, 2)).toUpperCase()
}

function Tarjeta({ o, prioridad, oculto }: { o: ObraT; prioridad: boolean; oculto: boolean }) {
  const { c } = usePersona()
  const conFoto = o.views.includes('home')
  const sub = limpio(o.tagline) || limpio(o.industry)
  return (
    <li data-pr-panel data-slug={o.slug} hidden={oculto}>
      <Enlace
        to={v5path(ID, 'obra', o.slug)}
        className="pr-tile"
        sinBarrido={conFoto}
        aria-label={c.obra.abrir.replace('{name}', o.name)}
        onClick={(e) => {
          const img = e.currentTarget.querySelector('img')
          if (img) guardarViaje(o.slug, img)
        }}
      >
        <div className="pr-tile__vista">
          {conFoto ? (
            <ShotImg slug={o.slug} vista="home" vp="desktop" alt="" className="pr-tile__img" prioridad={prioridad} />
          ) : (
            <div className="pr-tile__ph" aria-hidden="true">
              <b>{iniciales(o.name)}</b>
              <span>{c.obra.sinCaptura}</span>
            </div>
          )}
        </div>
        <div className="pr-tile__cuerpo" aria-hidden="true">
          <p className="pr-tile__meta">
            {c.obra.tipo[o.kind]} · {o.year}
          </p>
          <h3 className="pr-tile__nombre">{o.name}</h3>
          {sub && <p className="pr-tile__sub">{sub}</p>}
        </div>
      </Enlace>
    </li>
  )
}

export default function Obra() {
  const { v5, c } = usePersona()
  const raiz = useRef<HTMLElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  // El filtro vive en la URL (?tipo=): Atrás y «← Obra» vuelven a la misma rejilla y se puede enlazar «mis apps».
  const [params, setParams] = useSearchParams()
  const tipo = params.get('tipo')
  const filtro: Filtro = FILTROS.includes(tipo as Filtro) ? (tipo as Filtro) : 'todo'
  const cuenta = filtro === 'todo' ? v5.obras.length : v5.obras.filter((o) => o.kind === filtro).length
  const previo = useRef(filtro) // el filtro del último efecto: StrictMode monta dos veces y esa segunda pasada no es un cambio

  useGsap(raiz, () => {
    const r = raiz.current
    // Al volver de una ficha, la captura regresa a su tarjeta (retorno exacto): primero se coloca la tarjeta a la vista.
    const viaje = viajePendiente()
    const tarjeta = viaje ? r?.querySelector<HTMLElement>(`li[data-slug="${viaje.slug}"]`) : null
    tarjeta?.removeAttribute('data-pr-panel') // la tarjeta que vuelve no espera su revelado: su captura aterriza en ella
    if (tarjeta) {
      // Solo se desplaza si la tarjeta no cabe ya en el primer pliegue (si cabe, el título no se corta bajo la barra).
      const y = tarjeta.getBoundingClientRect().top + window.scrollY
      const cabe = y + tarjeta.offsetHeight < window.innerHeight - 80
      window.scrollTo({ top: cabe ? 0 : Math.max(0, y - window.innerHeight * 0.3), behavior: 'instant' })
    }
    entradaTitulos(r)
    parallaxFondo(r)
    revelarPaneles(r, '[data-pr-panel]', 0.3)
    gsap.from('.pr-filtro', { opacity: 0, x: -24, skewX: -8, duration: 0.45, ease: SLAM, stagger: 0.05, delay: 0.35 })
    const img = tarjeta?.querySelector<HTMLElement>('img')
    if (viaje && img) volarDesde(img, viaje.rect)
  }, [v5.locale])

  useEffect(() => {
    memoria.filtro = filtro
  }, [filtro])

  const cambiar = (f: Filtro) => {
    if (f !== filtro) setParams(f === 'todo' ? {} : { tipo: f }, { replace: true })
  }

  // Filtrar = las tarjetas que quedan caen un poco giradas y se asientan, una tras otra (el golpe de la dirección). No hay
  // viaje desde la posición anterior: en la rejilla completa las tarjetas filtradas estaban a miles de píxeles más abajo.
  useLayoutEffect(() => {
    if (previo.current === filtro) return // StrictMode monta dos veces: la segunda pasada no es un cambio de filtro
    previo.current = filtro
    const ul = lista.current
    if (!ul) return
    // Las tarjetas que esperaban su revelado conservan opacity 0 y un disparador calculado con la rejilla completa: en la
    // rejilla filtrada nunca se alcanzaría (la página quedaba en blanco). Se muestran todas, ya, y se animan las del pliegue.
    const lis = ul.querySelectorAll<HTMLElement>('li')
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger instanceof Element && ul.contains(t.trigger)) t.kill()
    })
    gsap.killTweensOf(lis)
    gsap.set(lis, { opacity: 1, clearProps: 'transform' })
    const arriba = Array.from(lis).filter((li) => !li.hidden && enVista(li))
    const ctx = gsap.context(() => {
      gsap.from(arriba, { opacity: 0, y: 34, rotation: -2.5, scale: 0.96, transformOrigin: '0% 100%', duration: 0.55, ease: SLAM, stagger: 0.05, clearProps: 'transform,opacity' })
    }, ul)
    ScrollTrigger.refresh() // la página cambió de alto: los disparadores del fondo se recalculan
    return () => ctx.revert()
  }, [filtro])

  return (
    <main id="contenido" className="pr-pagina" tabIndex={-1} ref={raiz}>
      <Cabeza titulo={`${c.obra.titulo} · ${v5.personal.name}`} />
      <section className="pr-banda pr-banda--primera" aria-labelledby="pr-obra">
        <Fondo src="/v5/persona/art/work-bg-ice.webp" className="pr-fondo--rasgado" />
        <div className="pr-wrap">
          <Titulo id="pr-obra" eyebrow={c.obra.eyebrow} texto={c.obra.titulo} lead={c.obra.lead} />
          <div className="pr-filtros" role="group" aria-label={c.obra.filtrosAria}>
            {FILTROS.map((f) => (
              <button key={f} type="button" className="pr-filtro" aria-pressed={filtro === f} onClick={() => cambiar(f)}>
                {c.obra.filtros[f]}
              </button>
            ))}
          </div>
          <p className="sr-only" role="status">
            {(cuenta === 1 ? c.obra.cuentaUna : c.obra.cuenta).replace('{n}', String(cuenta))}
          </p>
          <ul className="pr-grid" ref={lista}>
            {v5.obras.map((o, i) => (
              <Tarjeta key={o.slug} o={o} prioridad={i < 3} oculto={filtro !== 'todo' && o.kind !== filtro} />
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
