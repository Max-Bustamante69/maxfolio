import type { MouseEvent } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { SHOT_DATE, v5path, type Obra } from '../data'
import { evento, useCopiarCorreo } from '../shared/contacto'
import { ShotImg } from '../shared/ShotImg'
import { useCopy } from './copy'
import { dibujarMancuerna, Mancuerna } from './figuras'
import { Riel } from './marco'
import { cuando, despegar, escena, gsap, useVista } from './motion'
import { Enlace, Fig, flechas, Flecha, Insignia, Lamina, Numeral } from './piezas'
import { insignia, partirFrase, sinPunto, usePublico } from './publico'

/** Los dos móviles de la portada y los cuatro casos de la edición. */
const MOVILES = ['nos-cafe', 'the-gummy-box']
const CASOS = ['the-gummy-box', 'nos-cafe', 'millennio', 'nalua']
/** Las cuatro tiendas de la celda «20+». */
const MINIS = ['mindfuel', 'nalua', 'valdo-cafe', 'pixxiesx']
/** Orden de lectura de las seis cifras del registro: la mancuerna manda, la cifra de tiendas lleva sus capturas. */
const ORDEN = ['lighthouse', 'storefronts', 'loadTime', 'conversion', 'organic', 'tests']
const num2 = (n: number) => String(n).padStart(2, '0')

export default function Inicio() {
  const c = useCopy()
  const { locale } = useLanguage()
  const v = usePublico()
  const { strings: s, cifras, personal } = v
  const { copiar, copiado, correo } = useCopiarCorreo('reportaje')

  const [primera, resto] = partirFrase(sinPunto(s.hero.positioning))
  const conCaptura = (slugs: string[]) => slugs.map((slug) => v.obra(slug)).filter((o): o is Obra => !!o?.views.length)
  const moviles = conCaptura(MOVILES)
  const casos = conCaptura(CASOS)
  const minis = conCaptura(MINIS)
  const productos = v.obras.filter((o) => o.kind === 'product')
  const proceso = s.sections.process
  const porQue = s.sections.contact
  const cifra = (id: string) => cifras.find((f) => f.id === id)
  // En una sola columna (móvil) la lámina de cada caso es su imagen y se descubre al llegar; en dos columnas el escenario hace ese papel.
  const enColumna = !window.matchMedia('(min-width: 1000px) and (min-height: 640px)').matches

  const ref = useVista<HTMLElement>([locale], (raiz, limpiar, espera) => {
    // El subrayador dorado del titular: nace oculto (por JS) y se pinta cuando el titular ya subió.
    const h1 = raiz.querySelector<HTMLElement>('.rp-h1')
    if (h1) {
      h1.dataset.marca = '0'
      const t = gsap.delayedCall(espera + 0.85, () => { h1.dataset.marca = '1' })
      limpiar.push(() => { t.kill(); delete h1.dataset.marca })
    }
    // Los dos móviles de la portada se separan al salir de ella: el segundo sube más rápido que el primero.
    const tels = raiz.querySelectorAll<HTMLElement>('.rp-fold-tel')
    const fold = raiz.querySelector<HTMLElement>('.rp-fold-tels')
    if (fold && tels.length === 2) {
      const tl = gsap.timeline({ defaults: { ease: 'none' } }).to(tels[0], { y: -34 }, 0).to(tels[1], { y: -96 }, 0)
      limpiar.push(escena(fold, tl, { modo: 'salida', suave: 0.4 }))
    }
    // La mancuerna se dibuja al verse, con tiempo propio: el lector que se detiene en ella la ve completa.
    const cuerpo = raiz.querySelector<HTMLElement>('.rp-cifra-c[data-id="lighthouse"] .rp-fig-cuerpo')
    if (cuerpo) {
      const tl = dibujarMancuerna(cuerpo)
      limpiar.push(cuando(cuerpo, () => { tl.play() }, '0px 0px -8% 0px'))
    }
    // El riel del margen se oscurece mientras la línea de lectura cruza el capítulo de tinta.
    const noche = raiz.querySelector('.rp-noche')
    const rail = raiz.closest<HTMLElement>('.v5-reportaje')
    if (noche && rail) {
      const ion = new IntersectionObserver((es) => es.forEach((e) => { rail.dataset.noche = e.isIntersecting ? '1' : '0' }), { rootMargin: '-50% 0px -50% 0px' })
      ion.observe(noche)
      limpiar.push(() => { ion.disconnect(); delete rail.dataset.noche })
    }
    // El escenario de los casos: la captura del caso que cruza el centro de la ventana se descubre sobre la anterior (Pudding: escenario fijo + pasos).
    const escenario = raiz.querySelector<HTMLElement>('.rp-escenario')
    if (escenario) {
      const ic = new IntersectionObserver((es) => es.forEach((e) => {
        const activo = e.isIntersecting || e.boundingClientRect.top < 0
        const li = e.target as HTMLElement
        if (e.isIntersecting) escenario.dataset.i = li.dataset.i ?? '0'
        li.dataset.on = activo ? '1' : '0'
      }), { rootMargin: '-45% 0px -45% 0px' })
      raiz.querySelectorAll('.rp-caso-paso').forEach((li) => ic.observe(li))
      limpiar.push(() => ic.disconnect())
    }
  })

  // «Leer el caso» lleva la captura del escenario (o la del bloque móvil) hasta la ficha.
  const alAbrir = (slug: string) => (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // abrir en otra pestaña no levanta la captura
    const marco = [...document.querySelectorAll<HTMLElement>(`.rp-lamina[data-slug="${slug}"] .rp-lamina-placa .rp-placa-img`)].find((el) => el.offsetParent && el.getBoundingClientRect().height > 0)
    const img = marco?.querySelector('img')
    if (marco && img) despegar(slug, marco, img)
    evento('reportaje', 'obra_open', { slug })
  }

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="rp-vista">
      <title>{`${personal.name} · ${s.hero.eyebrow}`}</title>
      <meta name="robots" content="noindex" />

      {/* ------------------------------------------------------------ portada: el titular y dos tiendas reales en el móvil */}
      <section className="rp-portada rp-marco" aria-labelledby="rp-h1">
        <div className="rp-portada-texto">
          <p className="rp-kicker rp-mono" data-rp="subir">{c.portada.kicker}</p>
          <h1 id="rp-h1" className="rp-h1" data-rp="linea">
            {resto ? <>{primera} <mark>{resto}</mark></> : primera}
          </h1>
          <p className="rp-dek" data-rp="subir" data-rp-retraso="0.25">{s.hero.lead}</p>
          <div className="rp-byline-filete" data-rp="filete" data-rp-retraso="0.3" />
          <p className="rp-byline rp-meta" data-rp="subir" data-rp-retraso="0.4">
            <span>{c.portada.por} {personal.name}</span>
            <span>{s.hero.eyebrow}</span>
            <span>{s.sections.statBand.asOf}</span>
          </p>
          <div className="rp-acciones" data-rp="subir" data-rp-retraso="0.5">
            <Enlace to={`${v5path('reportaje', 'contacto')}?motivo=revision`} num={c.capitulo.contacto} titulo={c.nav.contacto} className="rp-btn rp-btn-pri" onClick={() => evento('reportaje', 'contact_click', { canal: 'portada' })}>{s.hero.ctaPrimary}<Flecha /></Enlace>
            <Enlace to={v5path('reportaje', 'obra')} num={c.capitulo.obra} titulo={c.nav.obra} className="rp-enlace">{s.hero.ctaSecondary}<Flecha /></Enlace>
            <a className="rp-enlace" href={personal.cv} download>{s.hero.ctaCv}</a>
          </div>
          <p className="rp-nota-cta" data-rp="subir" data-rp-retraso="0.58">{s.hero.ctaNote}</p>
        </div>
        <figure className="rp-fold" aria-label={moviles.map((o) => o.name).join(', ')}>
          <div className="rp-fold-tels">
            {moviles.map((o, i) => (
              <div key={o.slug} className="rp-fold-tel">
                <div className="rp-placa rp-placa-tel" data-rp="placa" data-rp-retraso={0.3 + i * 0.15}>
                  <div className="rp-placa-img"><ShotImg slug={o.slug} vista="home" vp="mobile" alt={`${o.name} · ${c.ficha.movil}`} prioridad /></div>
                </div>
                <p className="rp-fold-leyenda"><b>{o.name}</b><span className="rp-meta">{o.industry}</span></p>
              </div>
            ))}
          </div>
          <figcaption className="rp-nota rp-fold-pie" data-rp="subir" data-rp-retraso="0.7">{c.portada.laminaPie(SHOT_DATE)}</figcaption>
        </figure>
      </section>

      {/* ------------------------------------------------------------ 01 · las cifras (el único capítulo invertido) */}
      <section id="cifras" className="rp-noche" aria-labelledby="rp-cifras-t">
        <div className="rp-marco rp-cap-cab">
          <p className="rp-kicker rp-mono" data-rp="subir">01 · {c.cifras.kicker}</p>
          <h2 id="rp-cifras-t" className="rp-h2" data-rp="linea">{c.cifras.h2}</h2>
          <p className="rp-lead" data-rp="subir" data-rp-retraso="0.15">{s.sections.statBand.note}</p>
        </div>
        <div className="rp-marco">
          <ol className="rp-bento">
            {ORDEN.map((id) => {
              const f = cifra(id)
              if (!f) return null
              return (
                <li key={id} className="rp-cifra-c" data-id={id}>
                  <div className="rp-cifra"><div className="rp-cifra-mascara" data-rp="mascara"><div><Numeral valor={f.valor} /></div></div></div>
                  <p className="rp-cifra-etq" data-rp="subir" data-rp-retraso="0.12">{f.etiqueta}</p>
                  {id !== 'lighthouse' && <p className="rp-nota rp-cifra-fuente">{c.fuente}: {f.fuente}</p>}
                  {id === 'lighthouse' && (
                    <div className="rp-cifra-extra">
                      <Fig n={1} titulo={c.cifras.lighthouse.titulo} sub={c.cifras.lighthouse.lectura} fuente={f.fuente} aria={c.cifras.lighthouse.aria}><Mancuerna /></Fig>
                    </div>
                  )}
                  {id === 'storefronts' && (
                    <div className="rp-cifra-extra">
                      <div className="rp-minis" aria-hidden="true">
                        {minis.map((o, k) => (
                          <div key={o.slug} className="rp-placa" data-rp="placa" data-rp-retraso={k * 0.1}>
                            <div className="rp-placa-img"><ShotImg slug={o.slug} vista="home" vp="desktop" alt="" /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ 02 · los casos: un escenario fijo y cuatro pasos */}
      <section id="casos" className="rp-casos" aria-labelledby="rp-casos-t">
        <div className="rp-marco rp-cap-cab">
          <p className="rp-kicker rp-mono" data-rp="subir">02 · {c.casos.kicker}</p>
          <h2 id="rp-casos-t" className="rp-h2" data-rp="linea">{s.sections.shopify.title} {s.sections.shopify.titleAccent}</h2>
          <p className="rp-lead" data-rp="subir" data-rp-retraso="0.15">{partirFrase(s.sections.shopify.lead)[1] || s.sections.shopify.lead}</p>
        </div>
        <div className="rp-marco rp-casos-cuerpo">
          <figure className="rp-escenario" data-i="0" aria-hidden="true">
            <div className="rp-escenario-in">
              <div className="rp-escenario-laminas">
                {casos.map((o, i) => <Lamina key={o.slug} o={o} clase={`rp-escena rp-escena-${i}`} animar={false} />)}
              </div>
              <figcaption className="rp-escenario-pie">
                {casos.map((o, i) => <span key={o.slug} className="rp-nota rp-escenario-leyenda" data-i={i}>{c.casos.pie(i + 1, casos.length, o.name, SHOT_DATE)}</span>)}
              </figcaption>
            </div>
          </figure>
          <ol className="rp-casos-pasos">
            {casos.map((o, i) => {
              const res = insignia(o.slug, v)
              return (
                <li key={o.slug} className="rp-caso-paso" data-i={i} data-on={i === 0 ? '1' : '0'}>
                  <article aria-labelledby={`rp-caso-${o.slug}`}>
                    <div className="rp-caso-movil"><Lamina o={o} animar={enColumna} /></div>
                    <p className="rp-mono rp-caso-kicker">{c.casos.pasoDe(i + 1, casos.length)}</p>
                    <h3 id={`rp-caso-${o.slug}`} className="rp-caso-n"><span>{o.name}</span></h3>
                    <p className="rp-meta">{[o.industry, o.year, o.rolLabel].filter(Boolean).join(' · ')}</p>
                    <p className="rp-entrada" data-rp="linea">{flechas(o.tagline)}</p>
                    {res && <Insignia valor={res.valor} clase={res.clase} />}
                    <Enlace to={v5path('reportaje', 'obra', o.slug)} hoja={false} className="rp-enlace rp-caso-ver" onClick={alAbrir(o.slug)}>{c.leerCaso}<Flecha /></Enlace>
                  </article>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="rp-marco rp-suite">
          <p className="rp-kicker rp-mono" data-rp="subir">{c.casos.suiteKicker}</p>
          <h3 className="rp-bloque-t" data-rp="linea">{c.casos.suiteH}</h3>
          <ul className="rp-productos">
            {productos.map((o) => (
              <li key={o.slug} className="rp-producto" data-rp="subir">
                <Enlace to={v5path('reportaje', 'obra', o.slug)} hoja={false} className="rp-producto-a">
                  <span className="rp-fila-n"><span>{flechas(o.name)}</span></span>
                  <span className="rp-producto-t">{o.tagline}</span>
                  <span className="rp-fila-ver"><span className="rp-sr">{c.leerCaso}</span><Flecha /></span>
                </Enlace>
              </li>
            ))}
          </ul>
          <div className="rp-acciones">
            <Enlace to={v5path('reportaje', 'obra')} num={c.capitulo.obra} titulo={c.nav.obra} className="rp-btn rp-btn-linea">{c.casos.todaLaObra}<Flecha /></Enlace>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ 03 · cómo se trabaja, en breve */}
      <section id="proceso" className="rp-cap rp-cap-linea rp-marco" aria-labelledby="rp-proceso-t">
        <div className="rp-cap-cab">
          <p className="rp-kicker rp-mono" data-rp="subir">03 · {c.proceso.kicker}</p>
          <h2 id="rp-proceso-t" className="rp-h2" data-rp="linea">{proceso.title} {proceso.titleAccent}</h2>
          <p className="rp-lead" data-rp="subir" data-rp-retraso="0.1">{proceso.fix}</p>
        </div>
        <ol className="rp-proceso-pasos" data-rp="grupo">
          {proceso.steps.map((p, i) => (
            <li key={p.title}>
              <span className="rp-mono rp-proceso-n">{num2(i + 1)}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
        <div className="rp-manifiesto">
          <p className="rp-mono" data-rp="subir">{s.sections.manifesto.label}</p>
          <ul data-rp="grupo">
            {s.sections.manifesto.lines.map((l) => <li key={l}>{sinPunto(l)}</li>)}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ 04 · cierre */}
      <section id="cierre" className="rp-cierre rp-marco" aria-labelledby="rp-cierre-t">
        <div className="rp-cierre-filete" data-rp="filete" />
        <p className="rp-kicker rp-mono" data-rp="subir">04 · {c.cierre.kicker}</p>
        <h2 id="rp-cierre-t" className="rp-h2 rp-cierre-h" data-rp="linea">{porQue.title} {sinPunto(porQue.titleAccent)}</h2>
        <div className="rp-cierre-cols">
          <p className="rp-lead" data-rp="subir" data-rp-retraso="0.1">{porQue.lead}</p>
          <div>
            <p className="rp-lead" data-rp="subir" data-rp-retraso="0.18">{porQue.promise}</p>
            <div className="rp-acciones" data-rp="subir" data-rp-retraso="0.26">
              <Enlace to={`${v5path('reportaje', 'contacto')}?motivo=revision`} num={c.capitulo.contacto} titulo={c.nav.contacto} className="rp-btn rp-btn-pri" onClick={() => evento('reportaje', 'contact_click', { canal: 'cierre' })}>{porQue.cta}<Flecha /></Enlace>
              <button type="button" className="rp-enlace" onClick={copiar}>{copiado ? c.cierre.copiado : <>{porQue.ctaSecondary}<span className="rp-correo-txt"> · {correo}</span></>}</button>
            </div>
            <p className="rp-estado rp-meta" data-rp="subir" data-rp-retraso="0.3"><i aria-hidden="true" />{s.hero.availability}</p>
          </div>
        </div>
        <p className="rp-sr" role="status">{copiado ? c.cierre.copiado : ''}</p>
      </section>

      <Riel>
        <p>{s.sections.statBand.note}</p>
        <p>{c.cifras.lighthouse.lectura}</p>
        <h3 className="rp-mono">{c.metodo.tablaCifras}</h3>
        <table className="rp-tabla">
          <thead><tr><th scope="col">{c.metodo.cifra}</th><th scope="col">{c.metodo.valor}</th><th scope="col">{c.metodo.fuente}</th></tr></thead>
          <tbody>
            {cifras.map((f) => <tr key={f.id}><th scope="row">{f.etiqueta}</th><td>{f.valor.replace(/-/g, '−')}</td><td>{f.fuente}</td></tr>)}
          </tbody>
        </table>
        <p className="rp-nota">{c.metodo.colofon}</p>
      </Riel>
    </main>
  )
}
