import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { datosDe, sinPuntoFinal, v5path, type Obra, type Vista } from '../data'
import { evento } from '../shared/contacto'
import { pieDeCaptura, ShotImg } from '../shared/ShotImg'
import { Cabeza } from './Cabeza'
import { casoDe } from './caso'
import { ID, usePersona } from './contexto'
import { entradaTitulos } from './efectos'
import { limpio } from './limpio'
import { Enlace, Fondo, Titulo } from './piezas'
import { gsap, guardarViaje, leerViaje, memoria, OUT, parallaxFondo, revelarPaneles, useGsap, volarDesde } from './motion'
import { llenar } from './util'

/** «← Obra» vuelve al índice con el filtro que había (el filtro vive en la URL del índice). */
const rutaObra = () => v5path(ID, 'obra') + (memoria.filtro !== 'todo' ? `?tipo=${memoria.filtro}` : '')

export default function Ficha() {
  const { slug = '' } = useParams()
  const { v5 } = usePersona()
  const o = v5.obra(slug)
  return o ? <FichaDe key={o.slug} o={o} /> : <NoExiste />
}

function NoExiste() {
  const { v5, c } = usePersona()
  return (
    <main id="contenido" className="pr-pagina" tabIndex={-1}>
      <Cabeza titulo={`${c.ficha.noExiste} · ${v5.personal.name}`} />
      <section className="pr-banda pr-banda--primera">
        <div className="pr-wrap">
          <Titulo texto={c.ficha.noExiste} lead={c.ficha.noExisteLead} />
          <Enlace to={rutaObra()} className="pr-volver">
            ← {c.ficha.volver}
          </Enlace>
        </div>
      </section>
    </main>
  )
}

function FichaDe({ o }: { o: Obra }) {
  const { v5, c } = usePersona()
  const raiz = useRef<HTMLElement>(null)
  const [vista, setVista] = useState<Vista>(o.views[0] ?? 'home')
  const vistaPrevia = useRef(vista)
  const idx = v5.obras.findIndex((x) => x.slug === o.slug)
  const ant = v5.obras[(idx - 1 + v5.obras.length) % v5.obras.length]
  const sig = v5.obras[(idx + 1) % v5.obras.length]
  const datos = datosDe(o.slug)
  const conFoto = o.views.length > 0
  const hayMovil = conFoto
  const estado = o.kind === 'store' && o.status ? v5.strings.badges[o.status] : ''
  const tipoAnio = [c.obra.tipo[o.kind], o.year, estado].filter(Boolean).join(' · ')
  const beats = casoDe(v5, o.slug)
  const tagline = limpio(o.tagline)
  const descripcion = limpio(o.description)
  const periodo = o.period ? v5.formatPeriod(o.period.start, o.period.end || null) : null

  useEffect(() => {
    evento(ID, 'obra_open', { slug: o.slug })
  }, [o.slug])

  useGsap(raiz, () => {
    const r = raiz.current
    const viaje = leerViaje(o.slug)
    const img = r?.querySelector<HTMLElement>('[data-flip]')
    entradaTitulos(r, viaje ? 0.25 : 0.12)
    parallaxFondo(r)
    revelarPaneles(r, '[data-pr-panel]', 0.35)
    gsap.from('.pr-volver, .pr-vistas', { opacity: 0, x: -24, duration: 0.45, ease: OUT, delay: 0.1 })
    if (viaje && img) {
      // Elemento compartido: la captura de la tarjeta es la primera captura de la ficha; viaja y se asienta (Flip).
      window.scrollTo({ top: 0, behavior: 'instant' })
      volarDesde(img, viaje.rect)
      gsap.from('.pr-ficha-aparece', { opacity: 0, y: 18, duration: 0.5, ease: OUT, stagger: 0.08, delay: 0.3 })
    } else if (img) {
      gsap.from('.pr-marco', { opacity: 0, y: 26, rotation: -1.5, duration: 0.6, ease: 'pr-slam', stagger: 0.1, delay: 0.3 })
    }
  }, [o.slug, v5.locale])

  // Home ↔ PDP: las capturas se relevan con un deslizamiento inclinado (no en el primer pintado).
  useGsap(raiz, () => {
    if (vistaPrevia.current === vista) return
    vistaPrevia.current = vista
    gsap.from('.pr-marco__img', { opacity: 0, x: 36, skewX: -5, duration: 0.45, ease: OUT, stagger: 0.06 })
  }, [vista])

  const fila = (k: string, v: string | null | undefined, extra?: string) =>
    v ? (
      <div key={k}>
        <dt>{k}</dt>
        <dd>
          {v}
          {extra && <small>{extra}</small>}
        </dd>
      </div>
    ) : null

  // Las tres mediciones con fecha (git, catálogo público, Lighthouse) son cifras grandes: cada una dice cuándo se midió.
  const medidas = [
    datos.comercio && { id: 'catalogo', v: String(datos.comercio.products), t: c.ficha.productos, s: datos.comercio.collections ? llenar(c.ficha.catalogoColecciones, { n: datos.comercio.collections }) : '', f: llenar(c.ficha.catalogoMedido, { fecha: datos.comercio.fecha }) },
    datos.lighthouse && { id: 'lh', v: `${datos.lighthouse.movil.perf} / ${datos.lighthouse.escritorio.perf}`, t: c.ficha.lhEtiqueta, s: '', f: llenar(c.ficha.lhNota, { fecha: datos.lighthouse.fecha }) },
  ].filter((m): m is { id: string; v: string; t: string; s: string; f: string } => !!m)

  const vistas = o.views
  const nombreVista = c.ficha.vistas[vista]

  return (
    <main id="contenido" className="pr-pagina" tabIndex={-1} ref={raiz}>
      <Cabeza titulo={`${o.name} · ${v5.personal.name}`} />
      <section className="pr-banda pr-banda--primera" aria-labelledby="pr-ficha">
        <Fondo src="/v5/persona/art/skills-bg-ice.webp" className="pr-fondo--rasgado" />
        <div className="pr-wrap pr-ficha">
          <Enlace
            to={rutaObra()}
            className="pr-volver"
            aria-label={c.ficha.volverAria}
            sinBarrido={conFoto}
            onClick={() => {
              const img = raiz.current?.querySelector('[data-flip]')
              if (img) guardarViaje(o.slug, img)
            }}
          >
            ← {c.ficha.volver}
          </Enlace>
          <div className="pr-ficha__cab">
            <Titulo id="pr-ficha" eyebrow={tipoAnio} texto={o.name} lead={tagline || undefined} />
            {descripcion && (
              <div className="pr-ficha__desc pr-ficha-aparece">
                <p className="pr-ficha__desc-r">{c.ficha.casoEyebrow}</p>
                <p className="pr-texto">{descripcion}</p>
              </div>
            )}
          </div>

          <div className="pr-ficha__cuerpo">
            <div className="pr-ficha__capturas">
              {vistas.length > 1 && (
                <div className="pr-vistas" role="group" aria-label={c.ficha.vistasAria}>
                  {vistas.map((v) => (
                    <button key={v} type="button" className="pr-filtro" aria-pressed={vista === v} onClick={() => setVista(v)}>
                      {c.ficha.vistas[v]}
                    </button>
                  ))}
                </div>
              )}
              {conFoto ? (
                <div className={`pr-marcos ${hayMovil ? 'pr-marcos--dos' : ''}`}>
                  <figure className="pr-marco pr-marco--escritorio">
                    <div className="pr-marco__vista">
                      <ShotImg slug={o.slug} vista={vista} vp="desktop" alt={llenar(c.ficha.capturaDe, { name: o.name, vista: nombreVista, vp: c.ficha.escritorio })} className="pr-marco__img" prioridad data-flip="" />
                    </div>
                    <figcaption>{pieDeCaptura(o.name, vista, 'desktop')}</figcaption>
                  </figure>
                  <figure className="pr-marco pr-marco--movil pr-ficha-aparece">
                    <div className="pr-marco__vista">
                      <ShotImg slug={o.slug} vista={vista} vp="mobile" alt={llenar(c.ficha.capturaDe, { name: o.name, vista: nombreVista, vp: c.ficha.movil })} className="pr-marco__img" />
                    </div>
                    <figcaption>{pieDeCaptura(o.name, vista, 'mobile')}</figcaption>
                  </figure>
                </div>
              ) : (
                <div className="pr-sinfoto" role="img" aria-label={c.ficha.sinCaptura}>
                  <b aria-hidden="true">{o.name.slice(0, 2).toUpperCase()}</b>
                  <span>{c.ficha.sinCaptura}</span>
                </div>
              )}
            </div>
            {beats && beats.length > 0 && (
              <section className="pr-caso" aria-labelledby="pr-caso-t" data-pr-panel>
                <h2 id="pr-caso-t" className="pr-subtitulo">
                  {c.ficha.casoCompleto}
                </h2>
                <ol className="pr-beats">
                  {beats.map((b, i) => (
                    <li key={b.label} className="pr-beat">
                      <span className="pr-beat__n" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3>{b.label}</h3>
                      <p>{b.body}</p>
                      <span className="pr-etiqueta">{b.metric}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {medidas.length > 0 && (
              <div className={`pr-nums pr-nums--${medidas.length}`} role="group" aria-label={c.ficha.medidas}>
                {medidas.map((m) => (
                  <div className="pr-num" key={m.id} data-pr-panel>
                    <div className="pr-num__caja">
                      <span className="pr-num__v">{m.v}</span>
                      <span className="pr-num__t">{m.t}</span>
                      {m.s && <span className="pr-num__s">{m.s}</span>}
                      <span className="pr-num__f">{m.f}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <aside className="pr-datos" data-pr-panel aria-labelledby="pr-datos">
              <h2 id="pr-datos">{c.ficha.datos}</h2>
              <dl className="pr-dl">
                {fila(c.ficha.sector, limpio(o.industry))}
                {fila(c.ficha.anio, String(o.year))}
                {fila(c.ficha.periodo, periodo)}
                {fila(c.ficha.rol, limpio(o.rolLabel))}
                {datos.git && fila(c.ficha.historial, llenar(c.ficha.historialLinea, { n: datos.git.commits, first: datos.git.first, last: datos.git.last, fecha: datos.git.fecha }))}
                {o.facts.filter((f) => limpio(f.label) && limpio(f.value)).map((f) => fila(f.label, f.value))}
                {o.stack.length > 0 && (
                  <div className="pr-dl__stack">
                    <dt>{c.ficha.stack}</dt>
                    <dd>
                      <span className="pr-etiquetas">
                        {o.stack.map((s) => (
                          <span className="pr-etiqueta" key={s}>
                            {s}
                          </span>
                        ))}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
              {o.link && (
                <div className="pr-acciones">
                  <a className="pr-enlace" href={o.link} target="_blank" rel="noopener noreferrer">
                    {c.ficha.visitar} ↗
                  </a>
                </div>
              )}
            </aside>
          </div>

          <nav className="pr-hermanas" aria-label={`${c.ficha.anterior} / ${c.ficha.siguiente}`}>
            <Enlace to={v5path(ID, 'obra', ant.slug)} className="pr-hermana">
              <small>← {c.ficha.anterior}</small>
              <b>{sinPuntoFinal(ant.name)}</b>
            </Enlace>
            <Enlace to={v5path(ID, 'obra', sig.slug)} className="pr-hermana pr-hermana--sig">
              <small>{c.ficha.siguiente} →</small>
              <b>{sinPuntoFinal(sig.name)}</b>
            </Enlace>
          </nav>
        </div>
      </section>
    </main>
  )
}
