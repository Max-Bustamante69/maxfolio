import { useRef } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { sinPuntoFinal } from '../data'
import { CASO, fechaCorta, medidasDe } from './casos'
import { capaEstado, setTono, usePlato } from './contexto'
import { control } from './escena/control'
import { ORDEN } from './escena/sets'
import { alScroll, useVista } from './motion'
import { Cruces, Enlace, Flecha, Rod, Tarjeta, ruta } from './piezas'
import { limpioTexto, partirFrase } from './publico'
import { Seo } from './seo'

const acota = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const suave = (a: number, b: number, x: number) => { const t = acota((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const DESTACADAS = ['the-gummy-box', 'nos-cafe', 'millennio', 'origen-vital']
/** Qué medida de cada destacada va en la portada (cada cifra, una sola vez por página: las dos del descuento 10 → 20 % no se repiten). */
const MEDIDA_PORTADA: Record<string, number> = { 'nos-cafe': 1 }

export default function Inicio() {
  const { c, v, en3d } = usePlato()
  const { strings: s, personal } = v
  const { locale } = useLanguage()
  const k = locale === 'es' ? 'es' : 'en'
  const marco = useRef<HTMLDivElement>(null)
  const declaracion = useRef<HTMLDivElement>(null)

  const ref = useVista<HTMLElement>([en3d], (raiz, limpiar) => {
    // 1 · El marco se abre a pantalla completa con el scroll y la cámara entra al plató (solo con 3D; sin él, es una portada fija).
    const esc = raiz.querySelector<HTMLElement>('.pl-esc')
    const mc = marco.current
    if (en3d && esc && mc) {
      const cab = raiz.querySelector<HTMLElement>('.pl-esc-cab')
      const pies = Array.from(raiz.querySelectorAll<HTMLElement>('.pl-esc-pie, .pl-marco-acc'))
      const dentro = raiz.querySelector<HTMLElement>('.pl-esc-dentro')
      let top = 0, left = 0, w = 0, h = 0, vw = 0, vh = 0, alto = 0
      const medir = () => {
        const e = esc.getBoundingClientRect(), r = mc.getBoundingClientRect()
        top = r.top - e.top; left = r.left - e.left; w = r.width; h = r.height
        vw = window.innerWidth; vh = window.innerHeight; alto = esc.offsetHeight
      }
      medir()
      const ro = new ResizeObserver(medir)
      ro.observe(esc)
      limpiar.push(() => ro.disconnect())
      const raizPl = document.querySelector<HTMLElement>('.v5-plato')
      limpiar.push(() => { if (raizPl) delete raizPl.dataset.esc })
      limpiar.push(alScroll((y) => {
        // Mientras dura la escena el encabezado no lleva velo (sobre el marco que se abre, el velo sería una franja).
        if (raizPl) { const d = y < alto - vh ? 'si' : 'no'; if (raizPl.dataset.esc !== d) raizPl.dataset.esc = d }
        const recorrido = Math.max(1, alto - vh - vh * 0.1) // el último tramo es la salida de la escena
        const p = acota(y / recorrido)
        const kk = suave(0.05, 0.6, p)
        const a = 1 - kk
        // Recorte del lienzo: del marco (1296 × 644, radio 15) a la ventana entera.
        capaEstado(y < alto, `inset(${top * a}px ${(vw - left - w) * a}px ${(vh - top - h) * a}px ${left * a}px round ${15 * a}px)`)
        control.set({ modo: 'poster', apertura: suave(0.08, 0.95, p) })
        if (cab) { cab.style.opacity = String(1 - suave(0.02, 0.28, p)); cab.style.transform = `translate3d(0,${-60 * suave(0.02, 0.4, p)}px,0)` }
        { const o = 1 - suave(0.0, 0.18, p); pies.forEach((el) => { el.style.opacity = String(o); el.style.visibility = o < 0.02 ? 'hidden' : 'visible' }) }
        mc.style.setProperty('--cruces', String(1 - suave(0.0, 0.3, p)))
        if (dentro) {
          const o = suave(0.7, 0.92, p) * (1 - suave(alto - vh, alto - vh * 0.6, y)) // y se va con la escena, no se queda flotando sobre la declaración
          dentro.style.opacity = String(o)
          dentro.style.visibility = o < 0.02 ? 'hidden' : 'visible'
        }
        if (y < alto - vh) setTono(top * a < 80 ? 'oscuro' : 'claro') // el encabezado pasa a texto claro cuando el marco ya cubre su fila
      }))
    }
    // 2 · La declaración se enciende línea a línea mientras se lee.
    const dec = declaracion.current
    if (dec) {
      const lineas = Array.from(dec.querySelectorAll<HTMLElement>('.pl-decl-l'))
      let centros: number[] = []
      const medir = () => { centros = lineas.map((l) => { let t = 0; for (let n: HTMLElement | null = l; n; n = n.offsetParent as HTMLElement | null) t += n.offsetTop; return t + l.offsetHeight / 2 }) }
      medir()
      const ro = new ResizeObserver(medir)
      ro.observe(dec)
      limpiar.push(() => ro.disconnect())
      limpiar.push(alScroll((y) => {
        const vh = window.innerHeight
        lineas.forEach((l, i) => {
          const d = (centros[i] - y) / vh // 0,95 entra por abajo · 0,45 centro
          l.style.opacity = String(0.42 + 0.58 * suave(0.92, 0.55, d))
        })
      }))
    }
  })

  const hero = s.hero
  const cifras = s.sections.statBand
  const lineasManifiesto = v.manifiesto
  const destacadas = DESTACADAS.map((slug) => v.obra(slug)).filter((o): o is NonNullable<typeof o> => !!o)
  const primerSet = v.obra(ORDEN[0])
  const etq = (o: NonNullable<typeof primerSet>) => [o.industry, o.rolLabel ?? c.kinds[o.kind], o.year].filter(Boolean).join(' • ')
  const fecha = (iso: string) => fechaCorta(iso, v.intlLocale)
  const [leadUno, leadDos] = partirFrase(limpioTexto(hero.lead))
  const [cierreA, cierreB] = leadDos.split(/(?<=[:：])\s*/)
  // La cifra de las tiendas ya está en el pliegue («20+ tiendas construidas»): en la banda no se repite.
  const banda = v.cifras.filter((f) => f.id !== 'storefronts')
  /** A dónde lleva cada cifra de la banda: al cargo del CV que la respalda o a la obra. */
  const respaldo = (id: string) => {
    if (id === 'lighthouse') return { to: `${ruta('trayectoria')}#rh`, txt: c.inicio.verCargo }
    if (id === 'loadTime' || id === 'conversion' || id === 'organic') return { to: `${ruta('trayectoria')}#digitdeck-fe`, txt: c.inicio.verCargo }
    if (id === 'modules') return { to: ruta('obra', 'digitdeck-apps'), txt: c.inicio.verObraCifra }
    return { to: ruta('obra'), txt: c.inicio.verObraCifra }
  }
  const cambioDe = (o: NonNullable<typeof primerSet>) => {
    const ca = CASO[o.slug]
    return locale === 'ja' || !ca ? o.tagline : ca.cambio[k]
  }

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="pl-vista pl-inicio">
      <Seo ruta="/plato" titulo={`${personal.name} · ${hero.eyebrow}`} descripcion={`${sinPuntoFinal(hero.positioning)}. ${hero.eyebrow}.`} />

      <section className={`pl-esc${en3d ? ' pl-esc--3d' : ''}`} data-tono={en3d ? undefined : 'claro'} aria-labelledby="pl-h1">
        <div className="pl-esc-pega">
          <div className="pl-esc-cab">
            <div className="pl-esc-id" data-pl="subir">
              <p className="pl-esc-nombre">{c.inicio.nombre}</p>
              <p className="pl-esc-eyebrow">{hero.eyebrow}</p>
            </div>
            <h1 id="pl-h1" className="pl-lema" data-pl="linea">{sinPuntoFinal(hero.positioning)}</h1>
          </div>
          <div className="pl-marco" ref={marco}>
            {!en3d && (
              <picture>
                <source media="(max-width: 699px)" srcSet="/v5/plato/poster-m.webp" />
                <img src="/v5/plato/poster-d.webp" width={1440} height={900} alt="" fetchPriority="high" decoding="async" />
              </picture>
            )}
            <div className="pl-marco-acc">
              <div className="pl-marco-acc-in" data-pl="grupo" data-pl-retraso="0.35">
                <Enlace to={ruta('contacto') + '#agenda'} className="pl-pil pl-pil--tung pl-pil--grande"><Rod>{c.inicio.ctaCorto}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></Enlace>
                <Enlace to={ruta('obra')} className="pl-marco-ver"><Rod>{hero.ctaSecondary}</Rod><Flecha /></Enlace>
              </div>
            </div>
            <Cruces />
          </div>
          <div className="pl-esc-pie">
            <p className="pl-mono pl-esc-prueba"><b>{v.storeCount}</b> {c.inicio.tiendasConstruidas('').trim()}</p>
            <p className="pl-mono pl-esc-disp"><i aria-hidden="true" />{hero.availability}</p>
            {en3d && <p className="pl-mono pl-esc-cue">{c.inicio.scroll}</p>}
          </div>
          <div className="pl-esc-dentro" aria-hidden={!en3d}>
            {primerSet && <p className="pl-hud"><span>{c.obra.lote} 01 / {ORDEN.length}</span><i /><span>{primerSet.name}</span></p>}
            <div className="pl-esc-dentro-acc">
              <Enlace to={ruta('obra')} className="pl-pil pl-pil--tung" tabIndex={en3d ? undefined : -1}><Rod>{c.inicio.entrar}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></Enlace>
            </div>
          </div>
        </div>
      </section>

      <section className="pl-decl" data-tono="oscuro" aria-label={c.inicio.declaracion}>
        <div className="pl-decl-in" ref={declaracion}>
          <p className="pl-mono pl-kicker" data-pl="subir">{c.inicio.declaracion}</p>
          <p className="pl-decl-t">
            {lineasManifiesto.map((l) => <span key={l} className="pl-decl-l">{l}</span>)}
          </p>
        </div>
      </section>

      <section className="pl-dest" data-tono="claro" aria-labelledby="pl-dest-t">
        <div className="pl-dest-cab">
          <h2 id="pl-dest-t" className="pl-h-l" data-pl="linea">{c.inicio.destacada}</h2>
          <p className="pl-dest-lead" data-pl="subir" data-pl-retraso="0.15">{c.inicio.destacadaLead}</p>
        </div>
        <div className="pl-dest-rejilla">
          {destacadas.map((o) => {
            const todas = medidasDe(o, locale, fecha, o.period ? v.formatPeriod(o.period.start, o.period.end) : String(o.year))
            const med = todas[MEDIDA_PORTADA[o.slug] ?? 0] ?? todas[0]
            return (
              <article key={o.slug} className="pl-dcard">
                <Tarjeta o={o} etq={etq(o)} nivel={3} sinHistoria diferida />
                <div className="pl-dcard-dl" data-pl="subir">
                  <p className="pl-dcard-c">{cambioDe(o)}</p>
                  {med && (
                    <p className="pl-medida">
                      <b>{med.valor}</b>
                      <span>{med.etq}</span>
                      <small className="pl-mono">{med.nota}</small>
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
        <div className="pl-dest-pie" data-pl="subir">
          <Enlace to={ruta('obra')} className="pl-pil pl-pil--osc"><Rod>{c.inicio.verTodo}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></Enlace>
        </div>
      </section>

      <section className="pl-cifras" data-tono="claro" aria-labelledby="pl-cifras-t">
        <div className="pl-cifras-cab">
          <h2 id="pl-cifras-t" className="pl-h-l" data-pl="linea">{cifras.label}</h2>
          <div className="pl-cifras-der" data-pl="subir" data-pl-retraso="0.2">
            <p className="pl-mono pl-cifras-fecha">{cifras.asOf}</p>
            <p className="pl-cifras-lead">{c.inicio.cifrasNota}</p>
          </div>
        </div>
        <ul className="pl-cifras-l" data-pl="grupo">
          {banda.map((f) => {
            const r = respaldo(f.id)
            return (
              <li key={f.id} className="pl-cifra">
                <p className="pl-cifra-v">{f.valor}</p>
                <p className="pl-cifra-e">{f.etiqueta}</p>
                <p className="pl-mono pl-cifra-f"><span>{cifras.sourceLabel}</span> {f.fuente}</p>
                <Enlace to={r.to} className="pl-enlace-mono pl-cifra-ver">{r.txt} <Flecha /></Enlace>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="pl-cierre" data-tono="claro" aria-labelledby="pl-cierre-t">
        <p className="pl-mono pl-kicker pl-kicker--claro" data-pl="subir">{c.inicio.cierreKicker}</p>
        <h2 id="pl-cierre-t" className="pl-h-cierre" data-pl="linea">
          {cierreB ? <>{cierreA} <em>{sinPuntoFinal(cierreB)}</em></> : sinPuntoFinal(leadDos || hero.positioning)}
        </h2>
        <div className="pl-cierre-fila">
          <p className="pl-cierre-lead" data-pl="subir">{leadUno}</p>
          <div className="pl-cierre-acc" data-pl="grupo">
            <Enlace to={ruta('contacto') + '#agenda'} className="pl-pil pl-pil--osc pl-pil--grande pl-pil--ancha"><Rod>{hero.ctaPrimary}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span></Enlace>
            <p className="pl-cierre-nota">{limpioTexto(hero.ctaNote)}</p>
            <p className="pl-mono pl-cierre-datos">{hero.location}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
