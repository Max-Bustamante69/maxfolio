// Inicio: héroe (titular, MB cromado con su perla, cinta de capturas), prueba («20+»), obra, cómo trabajo y la banda de papel.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { SHOT_DATE, datosDe, sinPuntoFinal, useV5, v5path, type Obra } from '../data'
import { useLanguage } from '../../context/LanguageContext'
import { ShotImg } from '../shared/ShotImg'
import { useCopy, type Copy } from './copy'
import Cinta from './Cinta'
import IndiceObra from './IndiceObra'
import MBCromo from './mb/MBCromo'
import { DESDE, EASE, useMedia } from './movimiento'
import { Pagina } from './Pagina'
import { Contador, Titulo, enfasis } from './piezas'
import { Enlace } from './transicion'

const CONTACTO = v5path('digitdeck', 'contacto')
const OBRA = v5path('digitdeck', 'obra')

/** Lo que el escenario de «Cómo trabajo» muestra en cada paso: SIEMPRE un dato medido de datosDe() o una captura real, con su tienda y su fecha. */
type Etapa = { tipo: 'captura'; obra: Obra; vp: 'desktop' | 'mobile' } | { tipo: 'dato'; obra: Obra; cifra: string; etiqueta: string; nota: string }

function etapasDe(obras: Obra[], c: Copy): (Etapa | null | undefined)[] {
  const tiendas = obras.filter((o) => o.kind === 'store')
  const conCaptura = tiendas.find((o) => o.views.includes('home'))
  const con = <K extends 'git' | 'comercio' | 'lighthouse'>(k: K) => {
    const o = tiendas.find((x) => datosDe(x.slug)[k])
    return o ? { obra: o, d: datosDe(o.slug)[k]! } : null
  }
  const lh = con('lighthouse')
  const git = con('git')
  const cat = con('comercio')
  return [
    lh && { tipo: 'dato', obra: lh.obra, cifra: String(lh.d.movil.perf), etiqueta: c.proceso.rendimiento, nota: c.ficha.lhNota(lh.d.fecha) },
    conCaptura && { tipo: 'captura', obra: conCaptura, vp: 'desktop' },
    git && { tipo: 'dato', obra: git.obra, cifra: String(git.d.commits), etiqueta: c.proceso.commits(git.d.sections), nota: c.ficha.repoNota(git.d.fecha) },
    conCaptura && { tipo: 'captura', obra: conCaptura, vp: 'mobile' },
    cat && { tipo: 'dato', obra: cat.obra, cifra: String(cat.d.products), etiqueta: c.proceso.productos(cat.d.collections), nota: c.ficha.catalogoNota(cat.d.fecha) },
  ]
}

function Escenario({ etapa, c }: { etapa: Etapa | null; c: Copy }) {
  if (!etapa) return null
  return (
    <figure className="dd-etapa" data-tipo={etapa.tipo}>
      {etapa.tipo === 'captura' ? (
        <>
          <div className="dd-etapa__marco" data-vp={etapa.vp}>
            <ShotImg slug={etapa.obra.slug} vista="home" vp={etapa.vp} alt="" />
          </div>
          <figcaption className="dd-micro">{c.proceso.ejemplo(etapa.obra.name)} · {etapa.vp === 'desktop' ? '1440' : '390'} · {SHOT_DATE}</figcaption>
        </>
      ) : (
        <>
          <p className="dd-etapa__cifra">{etapa.cifra}</p>
          <figcaption>
            <span className="dd-etapa__etiqueta">{etapa.etiqueta}</span>
            <span className="dd-micro">{c.proceso.ejemplo(etapa.obra.name)} · {etapa.nota}</span>
          </figcaption>
        </>
      )}
    </figure>
  )
}

/** «Cómo trabajo»: la palabra gigante del paso fijada a la izquierda (escritorio), con un riel de 1 px cuyo punto baja con el paso y un
 *  escenario con el dato o la captura real que lo acompaña; en móvil cada paso es una fila de la lista. */
function Proceso() {
  const c = useCopy()
  const { strings, obras } = useV5()
  const pasos = strings.sections.process.steps
  const etapas = etapasDe(obras, c)
  const [i, setI] = useState(0)
  const [vista, setVista] = useState(0) // la palabra mostrada: cambia a mitad de la máscara, cuando la vieja ya salió
  const seccion = useRef<HTMLElement>(null)
  const lista = useRef<HTMLOListElement>(null)
  const palabra = useRef<HTMLSpanElement>(null)
  const escenario = useRef<HTMLDivElement>(null)
  const primera = useRef(true)

  // El paso activo es el último cuyo borde superior ya pasó por el centro de la pantalla. Se mide con el scroll solo mientras la
  // sección se ve; no depende de IntersectionObserver sobre las filas porque estas entran recortadas por clip-path.
  useEffect(() => {
    const sec = seccion.current
    if (!sec) return
    // Los pasos se consultan en cada medida: si el contenido cambia de idioma, los nodos se reemplazan.
    const medir = () => setI([...(lista.current?.querySelectorAll<HTMLElement>('[data-paso]') ?? [])].reduce((k, el, j) => (el.getBoundingClientRect().top <= innerHeight / 2 ? j : k), 0))
    const io = new IntersectionObserver(([e]) => {
      removeEventListener('scroll', medir)
      if (!e.isIntersecting) return
      addEventListener('scroll', medir, { passive: true })
      medir()
    })
    io.observe(sec)
    return () => {
      io.disconnect()
      removeEventListener('scroll', medir)
    }
  }, [])

  // La palabra cambia por máscara (la vieja sale hacia arriba en 180 ms, la nueva sube en 500 ms) y el escenario se abre desde abajo.
  useEffect(() => {
    const el = palabra.current
    const esc = escenario.current
    if (!el || !esc) return
    if (primera.current) return void (primera.current = false)
    // fromTo explícito y limpieza a mano: revertir un yPercent a medio camino deja un translate en px pegado al elemento.
    const tl = gsap
      .timeline()
      .fromTo(el, { yPercent: 0 }, { yPercent: -DESDE, duration: 0.18, ease: EASE.puntual })
      .add(() => setVista(i))
      .fromTo(el, { yPercent: DESDE }, { yPercent: 0, duration: 0.5, ease: EASE.out })
    const abre = gsap.fromTo(esc, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.5, ease: EASE.out, clearProps: 'clipPath' })
    return () => {
      tl.kill()
      abre.kill()
      gsap.set(el, { yPercent: 0 })
      gsap.set(esc, { clearProps: 'clipPath' })
    }
  }, [i])

  return (
    <section ref={seccion} className="dd-proceso dd-seccion" aria-labelledby="dd-proceso-t">
      <div className="dd-proceso__fija">
        <Titulo id="dd-proceso-t" className="dd-h2" lineas={[c.proceso.titulo]} />
        <div className="dd-proceso__escena" style={{ '--i': i, '--n': pasos.length - 1 } as CSSProperties}>
          <div className="dd-riel" aria-hidden="true">
            <span className="dd-riel__lleva">
              <span className="dd-riel__punto" />
            </span>
          </div>
          <div className="dd-proceso__cuerpo">
            <div className="dd-proceso__palabra" aria-hidden="true" style={{ '--largo': pasos[vista].title.length } as CSSProperties}>
              <span className="dd-ln"><span ref={palabra}>{pasos[vista].title}<span className="dd-dot" /></span></span>
            </div>
            <p className="dd-micro">{c.proceso.paso(i + 1, pasos.length)}</p>
            <div ref={escenario} className="dd-proceso__etapa" aria-hidden="true">
              <Escenario key={i} etapa={etapas[i] ?? null} c={c} />
            </div>
          </div>
        </div>
      </div>
      <ol ref={lista} className="dd-proceso__pasos">
        {pasos.map((p, k) => (
          <li key={p.title} data-paso={k} data-in="fila" className="dd-paso" data-activo={k === i}>
            <h3 className="dd-paso__titulo">{p.title}</h3>
            <p>{p.body}</p>
            <p className="dd-paso__recibes"><span className="dd-micro">{c.proceso.recibes}</span> {p.deliverable}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function Inicio() {
  const c = useCopy()
  const { locale } = useLanguage()
  const { obras, strings, storeCount } = useV5()
  const esc = useMedia('(min-width: 1024px)')
  const heroRef = useRef<HTMLElement>(null)
  const objeto = useRef<HTMLDivElement>(null)
  const h = strings.hero
  const frases = h.positioning.split(/(?<=[.。])\s*/).filter(Boolean)
  const lineas = frases.map((f, k) => (k === frases.length - 1 ? sinPuntoFinal(f) : f)).map((f, k, a) => (k === a.length - 1 && locale !== 'ja' ? enfasis(f, locale === 'es' ? 'pedidos' : 'orders') : f))
  const tiendas = obras.filter((o) => o.kind === 'store' && o.views.includes('home'))
  const destacadas = tiendas.slice(0, 6)
  const n = Number.parseInt(storeCount, 10)

  // Parallax del objeto (R5 del v4): el MB sube hasta 6 vh con el scroll. Un oyente pasivo que solo existe mientras el héroe se ve.
  useEffect(() => {
    const el = objeto.current
    const hero = heroRef.current
    if (!el || !hero) return
    const mover = () => void (el.style.translate = `0 ${-Math.min(scrollY / innerHeight, 1) * 0.06 * innerHeight}px`)
    const io = new IntersectionObserver(([e]) => {
      removeEventListener('scroll', mover)
      if (e.isIntersecting) addEventListener('scroll', mover, { passive: true })
    })
    io.observe(hero)
    return () => {
      io.disconnect()
      removeEventListener('scroll', mover)
    }
  }, [])

  return (
    <Pagina titulo={strings.meta.title}>
      <section ref={heroRef} className="dd-hero">
        <div ref={objeto} className="dd-hero__objeto" data-dd-hero-object="">
          <MBCromo yaw={-10} soloPoster={!esc} />
        </div>
        <div className="dd-hero__texto">
          <p className="dd-eyebrow" data-in>{h.eyebrow}</p>
          <Titulo as="h1" className="dd-mega" lineas={lineas} />
          <p className="dd-lede" data-in>{h.lead}</p>
          <div className="dd-acciones" data-in>
            <div className="dd-acciones__primaria">
              <Enlace to={`${CONTACTO}?motivo=revision`} etiqueta={c.nav.contacto} className="dd-boton dd-boton--grande">{h.ctaPrimary}</Enlace>
              <p className="dd-nota">{h.ctaNote}</p>
            </div>
            <Enlace to={OBRA} etiqueta={c.nav.obra} className="dd-enlace dd-enlace--fuerte">{h.ctaSecondary}</Enlace>
          </div>
        </div>
        <Cinta obras={tiendas.slice(0, 10)} />
      </section>

      <section className="dd-prueba" aria-label={c.prueba.etiqueta}>
        <div className="dd-prueba__cifra" data-in>
          <Contador hasta={n} sufijo="+" className="dd-figura" />
        </div>
        <div className="dd-prueba__texto" data-in>
          <p className="dd-prueba__leyenda">{strings.stats.storefronts}</p>
          <p className="dd-micro">{strings.statSources.storefronts}</p>
          <p>{h.availability}</p>
          <p>{h.location}</p>
        </div>
        <div className="dd-prueba__tiendas" data-in>
          <p className="dd-micro">{c.prueba.enLaObra}</p>
          <ul>
            {tiendas.slice(0, 8).map((o) => (
              <li key={o.slug}>
                <Enlace to={v5path('digitdeck', 'obra', o.slug)} etiqueta={o.name} className="dd-enlace">{o.name}</Enlace>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="dd-seccion" aria-labelledby="dd-obra-t">
        <div className="dd-seccion__cab">
          <Titulo id="dd-obra-t" className="dd-h2" lineas={[c.obra.titulo]} />
          <p className="dd-lede" data-in>{c.obra.ledeInicio}</p>
        </div>
        <IndiceObra obras={destacadas} />
        <Enlace to={OBRA} etiqueta={c.nav.obra} className="dd-enlace dd-enlace--fuerte dd-seccion__mas" data-in>{c.obra.verTodo}</Enlace>
      </section>

      <Proceso />

      <section className="dd-cierre" data-tono="papel" aria-labelledby="dd-cierre-t">
        <div className="dd-cierre__cuerpo">
          <Titulo id="dd-cierre-t" className="dd-display" lineas={[c.cierre.titulo]} />
          <p className="dd-lede" data-in>{strings.sections.contact.promise}</p>
          <Enlace to={`${CONTACTO}?motivo=revision`} etiqueta={c.nav.contacto} className="dd-boton dd-boton--grande" data-in>{h.ctaPrimary}</Enlace>
        </div>
      </section>
    </Pagina>
  )
}
