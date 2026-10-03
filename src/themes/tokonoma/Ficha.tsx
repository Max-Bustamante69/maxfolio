import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { datosDe, type Obra, type Viewport, type Vista } from '../data'
import { useCopy } from './copy'
import { casoDe, clausulas, escalaDe, esCifra, fraseDe, frases, limpio, periodoDe, plano, usePublico } from './limpio'
import { aterrizar, useVista, vuelaHacia } from './motion'
import { Cifras, Enlace, EnlaceObra, Foto, Montura, Nicho, Pares, Salida, ruta, useMedia } from './piezas'

const host = (url: string) => new URL(url).hostname.replace(/^www\./, '')

type Captura = { vista: Vista; vp: Viewport }

/** El visor de tokujin: una captura a la vez, contador «01 / 03», flechas y un fundido de 1 200 ms. En el teléfono solo las vistas móviles, enteras. */
function Visor({ o }: { o: Obra }) {
  const c = useCopy()
  const movil = useMedia('(max-width: 767px)')
  const delMovil: Captura[] = o.views.map((vista) => ({ vista, vp: 'mobile' }))
  // En escritorio la portada ya es la home de escritorio: el visor sigue con el resto.
  const deEscritorio: Captura[] = o.views.flatMap((vista): Captura[] => (vista === 'home' ? [{ vista, vp: 'mobile' }] : [{ vista, vp: 'desktop' }, { vista, vp: 'mobile' }]))
  const items = movil ? delMovil : deEscritorio
  const [i, setI] = useState(0)
  if (!items.length) return null
  const k = Math.min(i, items.length - 1)
  const ir = (d: number) => setI((k + d + items.length) % items.length)
  const tecla = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') ir(1)
    else if (e.key === 'ArrowLeft') ir(-1)
  }
  const nombre = (it: Captura) => c.ficha.vistas[`${it.vista}-${it.vp === 'desktop' ? 'desktop' : 'mobile'}` as keyof typeof c.ficha.vistas]
  return (
    <section className="tk-visor tk-fr" aria-roledescription="carousel" aria-label={c.ficha.visor} onKeyDown={tecla}>
      <div className="tk-visor-v" data-tk="sube" data-vp={movil ? 'movil' : 'escritorio'}>
        {items.map((it, n) => (
          <figure key={`${it.vista}${it.vp}`} className="tk-visor-f" data-activa={n === k} data-vp={it.vp} aria-hidden={n !== k}>
            <Foto slug={o.slug} vista={it.vista} solo={it.vp} alt={`${o.name} · ${nombre(it)}`} />
          </figure>
        ))}
      </div>
      <div className="tk-visor-pie">
        <p className="tk-visor-n" aria-live="polite"><b>{String(k + 1).padStart(2, '0')}</b> / {String(items.length).padStart(2, '0')}</p>
        <p className="tk-visor-c">{nombre(items[k])}</p>
        {items.length > 1 && (
          <div className="tk-visor-b">
            <button type="button" onClick={() => ir(-1)} aria-label={c.ficha.anterior}><svg viewBox="0 0 8 15" width="8" height="15" aria-hidden="true"><path d="M7 1 1.5 7.5 7 14" fill="none" stroke="currentColor" strokeWidth="1" /></svg></button>
            <button type="button" onClick={() => ir(1)} aria-label={c.ficha.siguiente}><svg viewBox="0 0 8 15" width="8" height="15" aria-hidden="true"><path d="M1 1l5.5 6.5L1 14" fill="none" stroke="currentColor" strokeWidth="1" /></svg></button>
          </div>
        )}
      </div>
    </section>
  )
}

/** El caso en cuatro tiempos —el reto, lo que hice, lo que quedó y la tienda hoy— con las frases que el registro ya trae para esa obra, ordenadas
 *  (nada se reescribe), los hechos como cifra grande y el catálogo público de la tienda con su fecha. Un tiempo sin nada que decir no se imprime. */
function Caso({ o, solo, desde = 1 }: { o: Obra; solo?: string; desde?: number }) {
  const c = useCopy()
  const { locale } = usePublico()
  const caso = casoDe(o)
  const esc = escalaDe(o, c.escala, locale)
  const cifras = o.facts.filter(esCifra).map((f) => ({ valor: f.value, etiqueta: f.label }))
  const frasesHecho = o.facts.filter((f) => !esCifra(f)).map(fraseDe)
  const hice = caso ? caso.hice : frases(o.description).join(' ')
  const quedo = [caso?.quedo, ...frasesHecho].filter(Boolean).join(' ')
  const tiempos = [
    { clave: 'reto', rotulo: c.ficha.reto, texto: caso?.reto },
    { clave: 'hice', rotulo: caso ? c.ficha.hice : c.ficha.historia, texto: hice && hice !== o.tagline ? hice : undefined },
    { clave: 'quedo', rotulo: c.ficha.quedo, texto: quedo, figuras: cifras },
    { clave: 'hoy', rotulo: c.ficha.hoy, texto: esc ? c.ficha.hoyTxt : undefined, nota: esc ? c.escala.fuente.replace('{fecha}', esc.fecha) : undefined, figuras: esc?.figuras },
  ].filter((t) => (t.texto || t.figuras?.length) && (!solo || t.clave === solo))
  if (!tiempos.length) return null
  return (
    <section className="tk-caso2 tk-fr" aria-labelledby="tk-caso2-t">
      <h2 id="tk-caso2-t" className="tk-sr">{c.ficha.caso}</h2>
      <ol className="tk-tiempos2">
        {tiempos.map((t, i) => (
          <li key={t.clave} className="tk-tiempo2 tk-12">
            <p className="tk-rotulo tk-t2-r" data-tk="sube" data-tk-y="10">{String(i + desde).padStart(2, '0')} · {t.rotulo}</p>
            <div className="tk-t2-t" data-tk="grupo">
              {t.texto && <p className="tk-t2-p">{t.texto}</p>}
              {t.nota && <p className="tk-t2-n">{t.nota}</p>}
            </div>
            {!!t.figuras?.length && <Cifras figuras={t.figuras} className="tk-t2-f" />}
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Quita de un tiempo la cláusula de Lighthouse: la medición se queda en la línea gris de abajo y el texto cierra con el resultado de negocio. */
function sinMedicion(texto: string): string {
  return frases(texto)
    .map((f) => {
      if (!/lighthouse/i.test(f)) return f
      if (/[぀-ヿ一-鿿]/.test(f)) return '' // en japonés la medición es una frase entera
      const resto = clausulas(f.replace(/[.]\s*$/, '')).filter((x) => !/lighthouse/i.test(x))
      if (!resto.length) return ''
      const t = resto.join(', ').replace(/^(?:y|and)\s+/i, '')
      return `${t.charAt(0).toUpperCase()}${t.slice(1)}.`
    })
    .filter(Boolean)
    .join(' ')
}

/** El caso completo del vivo («Un build, completo»): cuatro tiempos con las cifras reales de la tienda. Solo hay caso contado de esta tienda.
 *  Las mediciones de laboratorio quedan en gris, en segundo plano, y el caso cierra con lo que quedó y el enlace a la tienda. */
const CASO_COMPLETO = 'the-gummy-box'
function CasoCompleto({ o }: { o: Obra }) {
  const c = useCopy()
  const { strings, registry, locale } = usePublico()
  const tienda = registry.stores.find((s) => s.slug === o.slug)
  const d = datosDe(o.slug)
  const lh = d.lighthouse?.escritorio
  if (o.slug !== CASO_COMPLETO || !tienda || !lh) return null
  const vars: Record<string, string | number> = {
    sections: d.git?.sections ?? tienda.sections ?? 0,
    blocks: d.git?.blocks ?? 0,
    trackedComponents: d.git?.trackedComponents ?? 0,
    url: tienda.url.replace(/^https?:\/\//, ''),
    ladder: tienda.facts.find((x) => x.id === 'ladder')?.value ?? '',
    perfDesktop: lh.perf, a11yDesktop: lh.a11y, seoDesktop: lh.seo, lcpDesktop: (lh.lcp ?? 0).toFixed(2),
  }
  const llenar = (s: string) => plano(limpio(s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))), locale)
  const fb = strings.sections.featuredBuild
  const tiempos = fb.beats.map((b) => ({ label: b.label, body: sinMedicion(llenar(b.body)), metric: llenar(b.metric) })).filter((b) => b.body)
  return (
    <section className="tk-caso tk-fr tk-12" aria-labelledby="tk-caso-t">
      <div className="tk-caso-cab">
        <p className="tk-rotulo" data-tk="sube">{fb.eyebrow}</p>
        <h2 id="tk-caso-t" className="tk-h2" data-tk="sube" data-tk-r="0.1">{fb.title} <span className="tk-tenue">{fb.titleAccent}</span></h2>
        <p className="tk-nota" data-tk="sube" data-tk-r="0.15">{frases(fb.lead)[0]}</p>
        {o.link && <p data-tk="sube" data-tk-r="0.2"><a className="tk-ver" href={o.link} target="_blank" rel="noopener noreferrer">{c.ficha.ver}<Salida /></a></p>}
      </div>
      <ol className="tk-tiempos" data-tk="grupo">
        {tiempos.map((b, i) => (
          <li key={b.label} className="tk-tiempo">
            <p className="tk-rotulo">{String(i + 1).padStart(2, '0')} · {b.label}</p>
            <p className="tk-cuerpo">{b.body}</p>
            <p className="tk-tiempo-m"><span className="tk-sr">{c.ficha.medido}: </span>{b.metric}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Detalle({ o }: { o: Obra }) {
  const c = useCopy()
  const { obras, personal, locale, numero } = usePublico()
  const vuela = vuelaHacia(o.slug) // la captura llega volando desde la sala: no se despliega, se recibe
  const ref = useVista<HTMLElement>([locale], (raiz, limpiar) => {
    const img = raiz.querySelector<HTMLImageElement>('.tk-hero img')
    if (img) aterrizar(o.slug, img, limpiar)
  })

  const conCaptura = o.views.length > 0
  const completo = o.slug === CASO_COMPLETO && !!datosDe(o.slug).lighthouse
  const sig = (() => {
    const con = obras.filter((x) => x.views.length)
    const k = con.findIndex((x) => x.slug === o.slug)
    return con[(k + 1) % con.length] ?? con[0]
  })()

  const filas: Array<[string, ReactNode | undefined]> = [
    [c.ficha.sector, o.industry],
    [c.ficha.rol, o.rolLabel],
    [o.period ? c.ficha.periodo : c.ficha.anio, o.period ? periodoDe(o.period, locale) : o.year],
    [c.ficha.pila, o.stack.join(' · ')],
    [c.ficha.enlace, o.link ? <a href={o.link} target="_blank" rel="noopener noreferrer">{host(o.link)}<Salida /></a> : undefined],
    [c.ficha.repo, o.repo ? <a href={o.repo} target="_blank" rel="noopener noreferrer">{host(o.repo)}<Salida /></a> : undefined],
  ]
  const info = filas.filter((p): p is [string, ReactNode] => p[1] !== undefined && p[1] !== '')

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="tk-vista">
      <title>{`${o.name} · ${c.nav.obra} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      {conCaptura ? (
        <section className="tk-hero tk-fr" aria-label={`${o.name} · ${c.ficha.vistas['home-desktop']}`}>
          <Nicho slug={o.slug} vista="home" alt={`${o.name} · ${c.ficha.vistas['home-desktop']}`} prioridad tk={vuela ? '' : 'pieza'} />
        </section>
      ) : (
        <section className="tk-hero tk-fr" data-tk="sube">
          <Montura nombre={o.name} leyenda={c.ficha.sinCaptura} />
        </section>
      )}

      <header className="tk-ficha-cab tk-fr tk-12">
        <div className="tk-ficha-id">
          <Enlace to={ruta('obra')} className="tk-volver" data-tk="sube"><svg viewBox="0 0 8 15" width="7" height="12" aria-hidden="true"><path d="M7 1 1.5 7.5 7 14" fill="none" stroke="currentColor" strokeWidth="1" /></svg>{c.ficha.volver}</Enlace>
          <p className="tk-rotulo" data-tk="sube" data-tk-r="0.05">{c.no} {numero(o)} · {o.year}</p>
          <h1 className="tk-h1 tk-h1-obra" data-tk="titulo" data-tk-r="0.05">{o.name}</h1>
        </div>
        <div className="tk-historia" data-tk="grupo">
          {o.tagline && <p className="tk-abre">{o.tagline}</p>}
          {o.link && !completo && (
            <p><a className="tk-ver" href={o.link} target="_blank" rel="noopener noreferrer">{o.kind === 'store' ? c.ficha.ver : c.ficha.verSitio}<Salida /></a></p>
          )}
        </div>
      </header>

      {completo ? <><CasoCompleto o={o} /><Caso o={o} solo="hoy" desde={5} /></> : <Caso o={o} />}

      <section className="tk-info tk-fr tk-12" aria-labelledby="tk-info-t">
        <h2 id="tk-info-t" className="tk-h3" data-tk="sube">{c.ficha.info}</h2>
        <div className="tk-info-c" data-tk="sube" data-tk-r="0.1">
          <Pares items={info} />
        </div>
      </section>

      {conCaptura && <Visor key={o.slug} o={o} />}

      {sig && sig.slug !== o.slug && (
        <aside className="tk-sig tk-fr tk-12" aria-labelledby="tk-sig-t">
          <div className="tk-sig-t">
            <p id="tk-sig-t" className="tk-rotulo" data-tk="sube">{c.ficha.proxima}</p>
            <h2 className="tk-h2" data-tk="sube" data-tk-r="0.1">{sig.name}</h2>
            <p className="tk-lema" data-tk="sube" data-tk-r="0.15">{sig.tagline}</p>
          </div>
          <EnlaceObra o={sig} className="tk-sig-a" aria-label={`${c.ficha.proxima}: ${sig.name}`}>
            <Nicho slug={sig.slug} vista={sig.views[0]} alt="" vuelo tk="" />
          </EnlaceObra>
        </aside>
      )}
    </main>
  )
}

export default function Ficha() {
  const { slug = '' } = useParams()
  const c = useCopy()
  const { obra, personal } = usePublico()
  const o = obra(slug)
  const ref = useVista<HTMLElement>([])
  if (o) return <Detalle key={o.slug} o={o} />
  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="tk-vista">
      <title>{`${c.ficha.noExiste} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />
      <section className="tk-fr tk-hero">
        <h1 className="tk-h1">{c.ficha.noExiste}</h1>
        <p><Enlace to={ruta('obra')} className="tk-ver">{c.nav.obra}</Enlace></p>
      </section>
    </main>
  )
}
