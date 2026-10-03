import { useState, type CSSProperties, type ReactNode } from 'react'
import { datosDe, SHOT_SIZE, useV5, type Viewport, type Vista } from '../data'
import { ShotImg, pieDeCaptura } from '../shared/ShotImg'
import { useCopy } from './copy'
import { hechoOk, limpiar, pila, type ObraLibro } from './datos'

// Lo que muestran el panel de la fila y la ficha: la hoja de datos (siempre en el mismo orden, solo las filas que
// existen) y las capturas reales con su pie sistemático. Nada se inventa: sin dato, sin fila; sin captura, «Sin captura».

/** `compacto` (el panel de una fila): sin Rubro, Rol ni Año, que la fila de encima ya dice. La ficha lleva la hoja completa. */
export function Datos({ o, compacto }: { o: ObraLibro; compacto?: boolean }) {
  const c = useCopy().datos
  const { formatPeriod } = useV5()
  const d = datosDe(o.slug)
  const hechos = o.facts.filter(hechoOk)
  const filas: [string, ReactNode][] = []
  if (!compacto) {
    if (o.industry) filas.push([c.rubro, o.industry])
    if (o.rolLabel) filas.push([c.rol, o.rolLabel])
    filas.push([c.anio, o.year])
  }
  if (o.period) filas.push([c.construccion, formatPeriod(o.period.start, o.period.end)])
  if (pila(o).length) filas.push([c.pila, pila(o).join(' · ')])
  if (d.git)
    filas.push([
      c.git,
      <>
        {d.git.commits} {c.commits} · {d.git.sections} {c.secciones} · {c.primerCommit} {d.git.first}
        <small>{c.gitNota(d.git.fecha)}</small>
      </>,
    ])
  // Lighthouse solo si el dominio servía un tema de Digitdeck al medir (datosDe lo decide); Best Practices no se muestra.
  if (d.lighthouse) {
    const { movil: m, escritorio: e } = d.lighthouse
    filas.push([
      c.lighthouse,
      <>
        <span className="a-lh">{c.movil} · {c.rend} {m.perf} · {c.acc} {m.a11y} · {c.seo} {m.seo}</span>
        <span className="a-lh">{c.escritorio} · {c.rend} {e.perf} · {c.acc} {e.a11y} · {c.seo} {e.seo}</span>
        <small>{c.lhNota(d.lighthouse.fecha)}</small>
      </>,
    ])
  }
  if (hechos.length)
    filas.push([c.hechos, hechos.map((h) => <span className="a-lh" key={h.label}>{h.label}: {h.value}</span>)])
  return (
    <dl className="a-datos">
      {filas.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Entradilla (tagline) y descripción, ya sin las oraciones que el repo no sostiene. */
export function Texto({ o }: { o: ObraLibro }) {
  const tagline = limpiar(o.tagline)
  const descripcion = limpiar(o.description)
  if (!tagline && !descripcion) return null
  return (
    <div className="a-texto">
      {tagline && <p className="a-entradilla">{tagline}</p>}
      {descripcion && <p>{descripcion}</p>}
    </div>
  )
}

/** La tienda donde se hizo la captura de un producto: la que tiene el mismo dominio que el enlace del producto
 *  (p. ej. el bundle builder de cafesnos.com → NOS Café). Sin coincidencia, undefined: no se nombra ninguna. */
function useTiendaDeLaCaptura(o: ObraLibro) {
  const { obras } = useV5()
  if (o.kind !== 'product' || !o.link) return undefined
  const host = (u?: string) => { try { return new URL(u ?? '').hostname.replace(/^www\./, '') } catch { return '' } }
  return obras.find((s) => s.kind === 'store' && host(s.link) === host(o.link))?.name
}

/** Pie sistemático de una captura en dos renglones, cada trozo entero (ni la fecha ni «Nº 18» se parten). Una tienda dice
 *  «HOME · 1440 / Nº 18 · fecha»; un producto no tiene «home»: dice en qué tienda corre («Ejemplo en NOS Café»). */
function Pie({ o, vista, vp, tienda }: { o: ObraLibro; vista: Vista; vp: Viewport; tienda?: string }) {
  const c = useCopy().ficha
  const [v, d, fecha] = pieDeCaptura(o.name, vista, vp).split(' · ').slice(-3)
  const renglones = o.kind === 'product' ? [[tienda ? c.ejemploEn(tienda) : ''], [d, fecha]] : [[v, d], [o.n ? c.no(o.n) : '', fecha]]
  return (
    <>
      {renglones.map((r, i) => (
        <span className="a-renglon" key={i}>
          {r.filter(Boolean).map((t, j) => <span className="a-nw" key={j}>{j > 0 && ' · '}{t}</span>)}
        </span>
      ))}
    </>
  )
}

/** Tira del panel: las cuatro capturas como pliego de hojas, la siguiente asomando. Se descargan solo al abrir la fila,
 *  con prioridad baja: nunca compiten con el titular ni con las fuentes. */
export function Tira({ o }: { o: ObraLibro }) {
  const c = useCopy()
  const tienda = useTiendaDeLaCaptura(o)
  if (!o.views.length) return <p className="a-sincap">{c.panel.sinCaptura}</p>
  const hojas = o.views.flatMap((vista) => (['desktop', 'mobile'] as const).map((vp) => ({ vista, vp })))
  return (
    <div className="a-tira" tabIndex={0} role="group" aria-label={o.name}>
      {hojas.map(({ vista, vp }, i) => (
        <figure className="a-hoja" data-vp={vp} key={`${vista}-${vp}`} style={{ '--i': i } as CSSProperties}>
          <ShotImg slug={o.slug} vista={vista} vp={vp} alt={c.ficha.alt(o.name, vista, vp, tienda)} fetchPriority="low" style={{ aspectRatio: `${SHOT_SIZE[vp].w} / ${SHOT_SIZE[vp].h}` }} />
          <figcaption><Pie o={o} vista={vista} vp={vp} tienda={tienda} /></figcaption>
        </figure>
      ))}
    </div>
  )
}

/** Capturas de la ficha: chips Home | PDP × Escritorio | Móvil en dos grupos rotulados; solo se descarga la vista activa. */
export function Capturas({ o }: { o: ObraLibro }) {
  const c = useCopy()
  const tienda = useTiendaDeLaCaptura(o)
  const [vista, setVista] = useState<Vista>('home')
  const [vp, setVp] = useState<Viewport>('desktop')
  if (!o.views.length) return <p className="a-sincap">{c.panel.sinCaptura}</p>
  const chip = (activo: boolean, texto: string, alTocar: () => void) => (
    <button type="button" className="a-chip" aria-pressed={activo} onClick={alTocar} key={texto}>{texto}</button>
  )
  return (
    <div className="a-capturas">
      <div className="a-chips">
        {o.views.length > 1 && (
          <div className="a-grupo" role="group" aria-label={c.ficha.vista}>
            <span className="a-sec">{c.ficha.vista}</span>
            {chip(vista === 'home', c.ficha.home, () => setVista('home'))}
            {chip(vista === 'pdp', c.ficha.pdp, () => setVista('pdp'))}
          </div>
        )}
        <div className="a-grupo" role="group" aria-label={c.ficha.dispositivo}>
          <span className="a-sec">{c.ficha.dispositivo}</span>
          {chip(vp === 'desktop', c.ficha.escritorio, () => setVp('desktop'))}
          {chip(vp === 'mobile', c.ficha.movil, () => setVp('mobile'))}
        </div>
      </div>
      <figure className="a-hoja a-hoja-grande" data-vp={vp}>
        <ShotImg slug={o.slug} vista={vista} vp={vp} alt={c.ficha.alt(o.name, vista, vp, tienda)} prioridad style={{ aspectRatio: `${SHOT_SIZE[vp].w} / ${SHOT_SIZE[vp].h}` }} />
        <figcaption><Pie o={o} vista={vista} vp={vp} tienda={tienda} /></figcaption>
      </figure>
    </div>
  )
}
