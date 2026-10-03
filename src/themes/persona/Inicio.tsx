import { useRef } from 'react'
import { v5path } from '../data'
import { ShotImg } from '../shared/ShotImg'
import { Cabeza } from './Cabeza'
import { Letras } from './Letras'
import { Menu } from './Menu'
import { Boton, Cinta, Enlace, Fondo, Titulo } from './piezas'
import { Estado, Tarjeta } from './tarjeta'
import { ID, usePersona } from './contexto'
import { CASO_SLUG, casoDe } from './caso'
import { entradaTitulos } from './efectos'
import { limpio } from './limpio'
import { CLIP_PLENO, gsap, guardarViaje, OUT, parallaxFondo, revelarPaneles, SLAM, useGsap } from './motion'
import { llenar, Valor } from './util'

const ART = '/v5/persona/art'
// Las tres tiendas que acompañan al caso completo: cada una resolvió una cosa distinta (armador de cajas, medición, catálogo).
const MAS_TIENDAS = ['nos-cafe', 'millennio', 'atmosfera']

export default function Inicio() {
  const { v5, c } = usePersona()
  const raiz = useRef<HTMLElement>(null)
  const { personal, strings, obras } = v5
  const hero = strings.hero
  const sec = strings.sections
  const proceso = sec.process
  const cinta = obras.filter((o) => o.kind === 'store' && !o.legacy).map((o) => ({ nombre: o.name, sub: limpio(o.industry) || undefined }))
  const items = [
    { id: 'obra', to: v5path(ID, 'obra'), label: c.nav.obra, desc: c.inicio.menu.obra },
    { id: 'trayectoria', to: v5path(ID, 'trayectoria'), label: c.nav.trayectoria, desc: c.inicio.menu.trayectoria },
    { id: 'contacto', to: v5path(ID, 'contacto'), label: c.nav.contacto, desc: c.inicio.menu.contacto },
  ]
  const caso = obras.find((o) => o.slug === CASO_SLUG)
  const beats = casoDe(v5, CASO_SLUG)
  const masTiendas = MAS_TIENDAS.map((s) => v5.obra(s)).filter((o): o is NonNullable<typeof o> => !!o)
  const contacto = `${v5path(ID, 'contacto')}?motivo=revision`

  useGsap(raiz, () => {
    const r = raiz.current
    // Coreografía de entrada (≈ 1,1 s): el fondo se descubre en diagonal, el nombre se pega letra a letra, la placa sube,
    // las filas del menú entran inclinadas una tras otra y el selector se enciende al final. Lo que no se anima ya está visible.
    const tl = gsap.timeline({ defaults: { ease: OUT } })
    tl.fromTo('.pr-inicio .pr-fondo--menu', { clipPath: 'polygon(0% 0%, 0% 0%, -24% 100%, 0% 100%)' }, { clipPath: CLIP_PLENO, duration: 0.8, ease: 'expo.out', clearProps: 'clipPath' }, 0)
      .from('.pr-inicio .pr-fondo--corte', { opacity: 0, x: 60, duration: 0.7, ease: 'expo.out' }, 0.1)
      .from('.pr-inicio .pr-eyebrow', { opacity: 0, x: -28, duration: 0.4 }, 0.05)
      .from('.pr-nombre .pr-letra', { opacity: 0, yPercent: -70, rotation: () => gsap.utils.random(-32, 32), scale: 1.55, duration: 0.5, ease: SLAM, stagger: { each: 0.022, from: 'start' } }, 0.1)
      .from('.pr-menu__item', { opacity: 0, x: -70, skewX: -8, duration: 0.5, ease: SLAM, stagger: 0.07 }, 0.3)
      .from('.pr-menu__sel', { scaleX: 0, duration: 0.4, ease: 'expo.out', transformOrigin: '0% 50%' }, 0.6)
      .from('.pr-placa', { opacity: 0, y: 22, duration: 0.55 }, 0.4)
      .from('.pr-inicio .pr-acciones > *', { opacity: 0, x: -36, skewX: -8, duration: 0.5, ease: SLAM, stagger: 0.08 }, 0.5)
      .from('.pr-menu__hint', { opacity: 0, duration: 0.4 }, 0.8)
    parallaxFondo(r)
    entradaTitulos(r)
    revelarPaneles(r)
  }, [v5.locale])

  return (
    <main id="contenido" className="pr-pagina" tabIndex={-1} ref={raiz}>
      <Cabeza titulo={`${c.inicio.titulo} · ${personal.name}`} />

      <section className="pr-inicio" aria-labelledby="pr-h1">
        <Fondo src={`${ART}/menu-bg-ice.webp`} className="pr-fondo--menu" carga="alta" />
        <Fondo src={`${ART}/home-bg-ice.webp`} corte carga="alta" />
        <div className="pr-trama" aria-hidden="true" />
        <div className="pr-inicio__col">
          <p className="pr-eyebrow pr-eyebrow--placa" data-pr-eyebrow>
            {hero.eyebrow}
          </p>
          <h1 id="pr-h1" className="pr-nombre" aria-label={personal.name}>
            <Letras decorativo texto={personal.firstName} />
            <Letras decorativo texto={personal.lastName} className="pr-acento" />
          </h1>

          <Menu items={items} aria={c.inicio.menuAria} hint={c.inicio.hint} />

          <div className="pr-placa">
            <p className="pr-placa__pos">{hero.positioning}</p>
            <p className="pr-placa__lead">{hero.lead}</p>
          </div>
          <div className="pr-acciones">
            <Boton to={contacto}>{hero.ctaPrimary}</Boton>
            <a className="pr-enlace" href={personal.cv} download>
              {hero.ctaCv} ›
            </a>
          </div>
        </div>
      </section>

      <Cinta items={cinta} etiqueta={c.inicio.cinta} />

      {/* Las seis cifras del vivo, cada una con su etiqueta y su fuente (el cargo y el periodo del CV de donde sale). */}
      <section className="pr-banda" aria-labelledby="pr-numeros">
        <Fondo src={`${ART}/work-bg-ice.webp`} className="pr-fondo--rasgado" carga="baja" />
        <div className="pr-wrap">
          <Titulo id="pr-numeros" nivel={2} eyebrow={c.inicio.numerosEyebrow} texto={c.inicio.numeros} />
          <ul className="pr-nums pr-nums--6">
            {v5.cifras.map((f) => (
              <li className="pr-num" key={f.id} data-pr-panel>
                <div className="pr-num__caja">
                  <span className="pr-num__v">
                    <Valor v={f.valor} />
                  </span>
                  <span className="pr-num__t">{f.etiqueta}</span>
                  <span className="pr-num__f">
                    <b>{c.inicio.fuente}</b> {f.fuente}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="pr-nota" data-pr-panel>
            {sec.statBand.note} <span>{sec.statBand.asOf}</span>
          </p>
        </div>
      </section>

      {/* Obra destacada: el caso completo de una tienda y tres más, cada una con la frase de lo que resolvió. */}
      <section className="pr-banda pr-banda--papel" aria-labelledby="pr-destacada">
        <div className="pr-wrap">
          <Titulo id="pr-destacada" nivel={2} eyebrow={c.inicio.destacadas.eyebrow} texto={sec.featuredBuild.title} acento={sec.featuredBuild.titleAccent} lead={c.inicio.destacadas.lead} />
          {caso && (
            <article className="pr-estreno" data-pr-panel>
              <Enlace
                to={v5path(ID, 'obra', caso.slug)}
                className="pr-estreno__img pr-tile"
                sinBarrido
                aria-label={c.obra.abrir.replace('{name}', caso.name)}
                onClick={(e) => {
                  const img = e.currentTarget.querySelector('img')
                  if (img) guardarViaje(caso.slug, img)
                }}
              >
                <div className="pr-tile__vista">
                  <ShotImg slug={caso.slug} vista="home" vp="desktop" alt="" className="pr-tile__img" />
                </div>
              </Enlace>
              <div className="pr-estreno__txt">
                <p className="pr-tile__meta">
                  <span>
                    {sec.featuredBuild.eyebrow} · {c.obra.tipo[caso.kind]} · {caso.year}
                  </span>
                  <Estado o={caso} />
                </p>
                <h3 className="pr-estreno__nombre">{caso.name}</h3>
                <p className="pr-estreno__sub">{limpio(caso.tagline)}</p>
                {beats && (
                  <dl className="pr-beats pr-beats--mini">
                    {[beats[0], beats[beats.length - 1]].map((b) => (
                      <div key={b.label}>
                        <dt>{b.label}</dt>
                        <dd>{b.body}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <div className="pr-acciones">
                  <Boton to={v5path(ID, 'obra', caso.slug)}>{c.inicio.destacadas.verCaso}</Boton>
                </div>
              </div>
            </article>
          )}
          <h3 className="pr-subtitulo">{c.inicio.destacadas.masTiendas}</h3>
          <ul className="pr-grid pr-grid--tres">
            {masTiendas.map((o) => (
              <Tarjeta key={o.slug} o={o} />
            ))}
          </ul>
          <div className="pr-acciones pr-acciones--fin">
            <Enlace className="pr-enlace" to={v5path(ID, 'obra')}>
              {c.inicio.destacadas.verTodo} ›
            </Enlace>
          </div>
        </div>
      </section>

      {/* Cómo se entrega: el cuello de botella, la solución y los cinco puntos de control con lo que se recibe en cada uno. */}
      <section className="pr-banda" aria-labelledby="pr-proceso">
        <Fondo src={`${ART}/skills-bg-ice.webp`} className="pr-fondo--rasgado" carga="baja" />
        <div className="pr-wrap">
          <Titulo id="pr-proceso" nivel={2} eyebrow={proceso.eyebrow} texto={proceso.title} acento={proceso.titleAccent} />
          <div className="pr-problema" data-pr-panel>
            <p>
              <b>{proceso.problemLabel}</b> {proceso.problem}
            </p>
            <p>
              <b>{proceso.fixLabel}</b> {proceso.fix}
            </p>
          </div>
          <ol className="pr-proceso">
            {proceso.steps.map((s, i) => (
              <li className="pr-paso" key={s.title} data-pr-panel>
                <span className="pr-paso__n" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="pr-paso__txt">
                  <p className="pr-paso__de">{llenar(proceso.stepOf, { n: i + 1, total: proceso.steps.length })}</p>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
                <div className="pr-paso__recibes">
                  <b>{proceso.deliverableLabel}</b>
                  <p>{s.deliverable}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pr-banda pr-banda--papel" aria-label={c.inicio.cierre}>
        <div className="pr-wrap">
          <div className="pr-cierre pr-cierre--doble" data-pr-panel>
            <div className="pr-cierre__lado">
              <h2 className="pr-cierre__t">{c.inicio.cierre}</h2>
              <p className="pr-cierre__p">{hero.ctaNote}</p>
              <div className="pr-acciones">
                <Boton to={contacto}>{hero.ctaPrimary}</Boton>
                <Enlace className="pr-enlace" to={v5path(ID, 'obra')}>
                  {c.inicio.verObra} ›
                </Enlace>
              </div>
              <p className="pr-cierre__disp">
                <i aria-hidden="true" />
                {hero.availability}
                <span>
                  {hero.location}
                </span>
              </p>
            </div>
            <div className="pr-siempre">
              <b>{sec.manifesto.label}</b>
              <ul>
                {sec.manifesto.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

