import { useRef } from 'react'
import { v5path } from '../data'
import { Cabeza } from './Cabeza'
import { Letras } from './Letras'
import { Menu } from './Menu'
import { Boton, Cinta, Enlace, Fondo, Titulo } from './piezas'
import { ID, usePersona } from './contexto'
import { entradaTitulos } from './efectos'
import { limpio } from './limpio'
import { CLIP_PLENO, gsap, OUT, parallaxFondo, revelarPaneles, SLAM, useGsap } from './motion'

const ART = '/v5/persona/art'

export default function Inicio() {
  const { v5, c } = usePersona()
  const raiz = useRef<HTMLElement>(null)
  const { personal, strings, trayectoria, obras } = v5
  const hero = strings.hero
  const primer = trayectoria[trayectoria.length - 1]
  const modulos = trayectoria[0]?.metrics[1]
  const cinta = obras.filter((o) => o.kind === 'store' && !o.legacy).map((o) => ({ nombre: o.name, sub: limpio(o.industry) || undefined }))
  const items = [
    { id: 'obra', to: v5path(ID, 'obra'), label: c.nav.obra, desc: c.inicio.menu.obra },
    { id: 'trayectoria', to: v5path(ID, 'trayectoria'), label: c.nav.trayectoria, desc: c.inicio.menu.trayectoria },
    { id: 'contacto', to: v5path(ID, 'contacto'), label: c.nav.contacto, desc: c.inicio.menu.contacto },
  ]

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
            <Boton to={`${v5path(ID, 'contacto')}?motivo=revision`}>{hero.ctaPrimary}</Boton>
            <a className="pr-enlace" href={personal.cv} download>
              {hero.ctaCv} ›
            </a>
          </div>
        </div>
      </section>

      <Cinta items={cinta} etiqueta={c.inicio.cinta} />

      <section className="pr-banda" aria-labelledby="pr-numeros">
        <Fondo src={`${ART}/work-bg-ice.webp`} className="pr-fondo--rasgado" carga="baja" />
        <div className="pr-wrap">
          <Titulo id="pr-numeros" nivel={2} eyebrow={c.inicio.numeros} texto={c.inicio.numeros} />
          <div className="pr-nums">
            <div className="pr-num" data-pr-panel>
              <div className="pr-num__caja">
                <span className="pr-num__v">{v5.storeCount}</span>
                <span className="pr-num__t">{c.construidas}</span>
              </div>
            </div>
            {modulos && (
              <div className="pr-num" data-pr-panel>
                <div className="pr-num__caja">
                  <span className="pr-num__v">{modulos.value}</span>
                  <span className="pr-num__t">{modulos.label}</span>
                </div>
              </div>
            )}
            {primer && (
              <div className="pr-num" data-pr-panel>
                <div className="pr-num__caja">
                  <span className="pr-num__v">{primer.start.slice(0, 4)}</span>
                  <span className="pr-num__t">{c.inicio.numerosPrimer}</span>
                  <span className="pr-num__s">{[primer.company, primer.title].filter(Boolean).join(' · ')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="pr-banda pr-banda--papel" aria-labelledby="pr-modelos">
        <div className="pr-wrap">
          <Titulo id="pr-modelos" nivel={2} eyebrow={strings.sections.engagement.eyebrow} texto={c.inicio.modelos} />
          <div className="pr-cartas pr-cartas--3">
            {strings.sections.engagement.models.map((m, i) => (
              <article className="pr-carta" key={m.title} data-pr-panel>
                <span className="pr-carta__n">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="pr-carta__t">{m.title}</h3>
                <p className="pr-carta__p">{m.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pr-banda" aria-label={c.inicio.cierre}>
        <div className="pr-wrap">
          <div className="pr-cierre" data-pr-panel>
            <h2 className="pr-cierre__t">{c.inicio.cierre}</h2>
            <p className="pr-cierre__p">{hero.ctaNote}</p>
            <div className="pr-acciones">
              <Boton to={`${v5path(ID, 'contacto')}?motivo=revision`}>{hero.ctaPrimary}</Boton>
              <Enlace className="pr-enlace" to={v5path(ID, 'obra')}>
                {c.inicio.verObra} ›
              </Enlace>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
