import { v5path, sinPuntoFinal, SHOT_DATE, useV5 } from '../data'
import { usePublico } from './publico'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useCopy } from './copy'
import { escena, gsap, SplitText, useVista, zoomTarjetas } from './motion'
import { Chevron, Enlace, Fila, Mac, Telefono, Tile } from './piezas'

/** Tarjeta «Ahora»: disponibilidad, lugar, cifra pública de tiendas y la hora de Medellín. Sin conteos de «en vivo». */
function Ahora() {
  const c = useCopy()
  const { strings: s, storeCount, intlLocale } = useV5()
  const hora = useMedellinTime(intlLocale)
  return (
    <aside className="ap-ahora" data-ap="escala" data-ap-retraso="0.2" aria-label={s.sections.now.label}>
      <p className="ap-ahora-etq"><span className="ap-punto" aria-hidden="true" />{s.sections.now.label}</p>
      <p className="ap-ahora-t">{s.hero.availability}</p>
      <p className="ap-ahora-l">{s.hero.location}</p>
      <div className="ap-ahora-datos">
        <p>{c.tiendasConstruidas(storeCount)}</p>
        <p className="ap-tenue">{s.sections.now.local.replace('{time}', hora)}</p>
      </div>
    </aside>
  )
}

export default function Inicio() {
  const c = useCopy()
  const { strings: s, personal, obras, obra, cifras } = usePublico()
  const productos = obras.filter((o) => o.kind === 'product')
  const destacada = obra('nos-cafe')
  const banda = obras.filter((o) => o.kind === 'store' && !o.legacy && o.views.length)
  const tiles = obras.filter((o) => o.kind === 'store' && o.tema === 'digitdeck' && !o.legacy && o.views.length && o.slug !== destacada?.slug).slice(0, 4)

  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    // Escena fijada: el dispositivo se levanta con el scroll. El diseño en reposo es el estado final de la línea de tiempo.
    const esc = raiz.querySelector<HTMLElement>('.ap-escena')
    if (esc) {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.from(esc.querySelector('.ap-escena-malla'), { opacity: 0.2, scale: 1.12, duration: 0.7, ease: 'none' }, 0)
        .from(esc.querySelector('.ap-mac'), { scale: 0.66, y: 140, rotateX: 30, transformPerspective: 1500, transformOrigin: '50% 100%', duration: 0.5 }, 0)
        .from(esc.querySelector('.ap-telefono'), { x: 170, y: 180, opacity: 0, scale: 0.86, duration: 0.4 }, 0.34)
        .from(esc.querySelector('.ap-escena-pie'), { opacity: 0, y: 18, duration: 0.16 }, 0.8)
      limpiar.push(escena(esc, tl, { suave: 0.55 }))
    }
    // Segundo scrub: la captura de cada tarjeta se asienta al entrar.
    zoomTarjetas(raiz, limpiar)
    // La banda de tiendas corre en el compositor (animación CSS, cero fotogramas de JS) y se detiene fuera de la ventana.
    const banda = raiz.querySelector<HTMLElement>('.ap-banda')
    if (banda) {
      const io = new IntersectionObserver(([en]) => { banda.dataset.fuera = String(!en.isIntersecting) })
      io.observe(banda)
      limpiar.push(() => io.disconnect())
    }
    // Declaración que se enciende palabra a palabra mientras la lees.
    const decl = raiz.querySelector<HTMLElement>('.ap-declaracion-txt')
    if (decl) {
      const partido = SplitText.create(decl, { type: 'words' })
      const tl = gsap.timeline().fromTo(partido.words, { opacity: 0.2 }, { opacity: 1, ease: 'none', stagger: 0.1, duration: 0.1 })
      limpiar.push(escena(decl, tl, { paso: true, suave: 0.35, rango: [0.16, 0.7] }))
    }
  })

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="ap-vista">
      <title>{`${personal.name} · ${c.nav.inicio}`}</title>
      <meta name="robots" content="noindex" />

      <section className="ap-hero ap-frame" aria-labelledby="ap-h1">
        <p className="ap-eyebrow" data-ap="subir">{s.hero.eyebrow}</p>
        <h1 id="ap-h1" className="ap-nombre" data-ap="nombre">{personal.firstName} {personal.lastName}</h1>
        <div className="ap-hero-cuerpo">
          <div className="ap-hero-texto">
            <p className="ap-posicion" data-ap="linea" data-ap-retraso="0.15">{s.hero.positioning}</p>
            <div className="ap-acciones" data-ap="grupo" data-ap-retraso="0.28">
              <Enlace className="ap-btn ap-btn-pri" to={`${v5path('apple', 'contacto')}?motivo=revision`}>{s.hero.ctaPrimary}</Enlace>
              <Enlace className="ap-enlace" to={v5path('apple', 'obra')}>{c.verObra}<Chevron /></Enlace>
              <a className="ap-enlace ap-enlace-tenue" href={personal.cv} download>{s.hero.ctaCv}<Chevron /></a>
            </div>
            <p className="ap-hero-nota" data-ap="subir" data-ap-retraso="0.4">{s.hero.ctaNote}</p>
          </div>
          <Ahora />
        </div>
      </section>

      <section className="ap-banda" aria-label={c.banda}>
        <div className="ap-banda-pista">
          {[false, true].map((copia) => (
            <ul key={String(copia)} className="ap-banda-lista" aria-hidden={copia || undefined}>
              {banda.map((o) => (
                <li key={o.slug} className="ap-banda-item"><strong>{o.name}</strong>{o.industry && <span className="ap-tenue">{o.industry}</span>}</li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {destacada && (
        <section className="ap-escena" aria-labelledby="ap-esc-t">
          <div className="ap-escena-stage">
            <img className="ap-escena-malla" src="/art/apple/mesh.webp" alt="" aria-hidden="true" width={1400} height={933} loading="eager" fetchPriority="low" decoding="async" />
            <div className="ap-escena-txt" data-ap="grupo">
              <p className="ap-eyebrow">{destacada.rolLabel} · {destacada.industry}</p>
              <h2 id="ap-esc-t">{destacada.name}</h2>
              <p className="ap-escena-sub">{destacada.tagline}</p>
            </div>
            <div className="ap-dispositivos">
              <Mac slug={destacada.slug} vistas={['home']} alt={`${destacada.name} · ${c.escena.escritorio}`} previa />
              <Telefono slug={destacada.slug} vistas={['home']} alt={`${destacada.name} · ${c.escena.movil}`} previa />
            </div>
            <div className="ap-escena-pie">
              <span className="ap-tenue">{destacada.name} · Home · 1440 / 390 · {SHOT_DATE}</span>
              <Enlace className="ap-enlace" to={v5path('apple', 'obra', destacada.slug)}>{c.verFicha}<Chevron /></Enlace>
            </div>
          </div>
        </section>
      )}

      <section className="ap-declaracion ap-frame">
        <p className="ap-declaracion-txt">{s.hero.lead}</p>
      </section>

      <section className="ap-cifras ap-frame" aria-labelledby="ap-cif-t">
        <div className="ap-cifras-cab">
          <p className="ap-eyebrow" data-ap="subir">{s.sections.statBand.asOf}</p>
          <h2 id="ap-cif-t" data-ap="linea">{s.sections.statBand.label}</h2>
        </div>
        <ul className="ap-cifras-lista" data-ap="grupo">
          {cifras.map((f) => (
            <li key={f.id} className="ap-cifra">
              <p className="ap-cifra-v">{f.valor}</p>
              <p className="ap-cifra-e">{f.etiqueta}</p>
              <p className="ap-cifra-f"><span>{s.sections.statBand.sourceLabel}</span> {f.fuente}</p>
            </li>
          ))}
        </ul>
        <p className="ap-cifras-nota">{s.sections.statBand.note}</p>
      </section>

      <section className="ap-obra-home ap-frame" aria-labelledby="ap-obra-t">
        <div className="ap-sec-cab">
          <h2 id="ap-obra-t" data-ap="linea">{c.obra.h1}</h2>
          <Enlace className="ap-enlace" to={v5path('apple', 'obra')}>{c.verTodaObra}<Chevron /></Enlace>
        </div>
        <div className="ap-tiles">
          {tiles.map((o, i) => <Tile key={o.slug} o={o} className={`ap-tile-${i}`} etq={[o.industry, o.rolLabel].filter(Boolean).join(' · ')} texto={o.tagline} ficha={c.verFicha} />)}
        </div>
        <p className="ap-grupo-sub">{s.sections.shopify.tabProducts}</p>
        <ul className="ap-filas" data-ap="grupo">{productos.map((o) => <Fila key={o.slug} o={o} />)}</ul>
      </section>

      <section className="ap-proceso ap-frame" aria-labelledby="ap-proc-t">
        <div className="ap-proceso-cab">
          <p className="ap-eyebrow" data-ap="subir">{s.sections.process.eyebrow}</p>
          <h2 id="ap-proc-t" data-ap="linea">
            <span className="ap-bloque">{s.sections.process.title.replace(/[,，]\s*$/, '')}</span>
            <span className="ap-bloque ap-tenue">{s.sections.process.titleAccent}</span>
          </h2>
        </div>
        <ol className="ap-pasos" data-ap="grupo">
          {s.sections.process.steps.map((p, i) => (
            <li key={p.title} className="ap-paso">
              <span className="ap-paso-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <p className="ap-paso-r"><span>{s.sections.process.deliverableLabel}</span> {p.deliverable}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ap-cierre" aria-labelledby="ap-cierre-t">
        <img className="ap-cierre-malla" src="/art/apple/mesh.webp" alt="" aria-hidden="true" width={1400} height={933} loading="lazy" decoding="async" />
        <div className="ap-frame ap-cierre-in">
          <h2 id="ap-cierre-t" data-ap="linea">
            <span className="ap-bloque">{s.sections.contact.title}</span>
            <span className="ap-bloque ap-tenue">{sinPuntoFinal(s.sections.contact.titleAccent)}</span>
          </h2>
          <div className="ap-acciones" data-ap="grupo">
            <Enlace className="ap-btn ap-btn-pri" to={`${v5path('apple', 'contacto')}?motivo=revision`}>{s.sections.contact.cta}</Enlace>
            <Enlace className="ap-enlace" to={v5path('apple', 'trayectoria')}>{c.nav.trayectoria}<Chevron /></Enlace>
          </div>
        </div>
      </section>
    </main>
  )
}
