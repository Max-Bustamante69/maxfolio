import { useEffect, useLayoutEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { type Obra as ObraT, type ObraKind } from '../data'
import { Cabeza } from './Cabeza'
import { usePersona } from './contexto'
import { entradaTitulos } from './efectos'
import { Fondo, Titulo } from './piezas'
import { conCaptura, Fila, Tarjeta } from './tarjeta'
import { enVista, gsap, memoria, parallaxFondo, revelarPaneles, ScrollTrigger, SLAM, useGsap, viajePendiente, volarDesde } from './motion'

type Filtro = 'todo' | ObraKind
const FILTROS: Filtro[] = ['todo', 'store', 'product', 'personal', 'role']

const coincide = (o: ObraT, f: Filtro) => f === 'todo' || o.kind === f

export default function Obra() {
  const { v5, c } = usePersona()
  const raiz = useRef<HTMLElement>(null)
  const listas = useRef<HTMLDivElement>(null)
  // El filtro vive en la URL (?tipo=): Atrás y «← Obra» vuelven a la misma rejilla y se puede enlazar «mis apps».
  const [params, setParams] = useSearchParams()
  const tipo = params.get('tipo')
  const filtro: Filtro = FILTROS.includes(tipo as Filtro) ? (tipo as Filtro) : 'todo'
  const cuenta = v5.obras.filter((o) => coincide(o, filtro)).length
  const previo = useRef(filtro) // el filtro del último efecto: StrictMode monta dos veces y esa segunda pasada no es un cambio

  // Lo que tiene captura real va como tarjeta; lo demás, como fila del archivo con su historia (nunca un cuadro vacío).
  const tarjetas = v5.obras.filter(conCaptura)
  const filas = v5.obras.filter((o) => !conCaptura(o))
  const hayFilas = filas.some((o) => coincide(o, filtro))

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
    const cont = listas.current
    if (!cont) return
    // Las tarjetas que esperaban su revelado conservan opacity 0 y un disparador calculado con la rejilla completa: en la
    // rejilla filtrada nunca se alcanzaría (la página quedaba en blanco). Se muestran todas, ya, y se animan las del pliegue.
    const lis = cont.querySelectorAll<HTMLElement>('li')
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger instanceof Element && cont.contains(t.trigger)) t.kill()
    })
    gsap.killTweensOf(lis)
    gsap.set(lis, { opacity: 1, clearProps: 'transform' })
    const arriba = Array.from(lis).filter((li) => !li.hidden && enVista(li))
    const ctx = gsap.context(() => {
      gsap.from(arriba, { opacity: 0, y: 34, rotation: -2.5, scale: 0.96, transformOrigin: '0% 100%', duration: 0.55, ease: SLAM, stagger: 0.05, clearProps: 'transform,opacity' })
    }, cont)
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
          <div ref={listas}>
            <ul className="pr-grid" aria-label={c.obra.titulo}>
              {tarjetas.map((o, i) => (
                <Tarjeta key={o.slug} o={o} prioridad={i < 3} oculto={!coincide(o, filtro)} />
              ))}
            </ul>
            <div className="pr-archivo" hidden={!hayFilas}>
              <h2 className="pr-subtitulo">{c.obra.archivo}</h2>
              <p className="pr-archivo__lead">{c.obra.archivoLead}</p>
              <ul className="pr-filas">
                {filas.map((o) => (
                  <Fila key={o.slug} o={o} oculto={!coincide(o, filtro)} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
