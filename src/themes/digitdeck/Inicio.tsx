// Inicio: héroe (titular, MB cromado con su perla, cinta de capturas), las cifras con su fuente, cuatro obras con su historia,
// cómo trabajo (cinco pasos), los cargos con sus cifras y la banda de papel. Todo sale de useV5(); nada se inventa aquí.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { SHOT_DATE, sinPuntoFinal, useV5, v5path, type Obra } from '../data'
import { useLanguage } from '../../context/LanguageContext'
import { ShotImg } from '../shared/ShotImg'
import { useCopy, type Copy } from './copy'
import Cifras from './Cifras'
import Cinta from './Cinta'
import { useObras } from './limpio'
import IndiceObra from './IndiceObra'
import MBCromo from './mb/MBCromo'
import { DESDE, EASE, useMedia } from './movimiento'
import { Pagina } from './Pagina'
import { Titulo, Valor, enfasis, enfasisFinal, formatoCifra } from './piezas'
import { Enlace } from './transicion'

const CONTACTO = v5path('digitdeck', 'contacto')
const OBRA = v5path('digitdeck', 'obra')
const TRAYECTORIA = v5path('digitdeck', 'trayectoria')

/** Lo que el escenario de «Cómo trabajo» muestra en cada paso: el cuello de botella, una captura real de una tienda, o lo que de
 *  verdad se entrega (las pruebas y los bloques que se editan). Nunca un número de laboratorio ni de git. */
type Etapa =
  | { tipo: 'cuello'; cuelloEtiqueta: string; cuello: string; arregloEtiqueta: string; arreglo: string }
  | { tipo: 'captura'; obra: Obra; vp: 'desktop' | 'mobile' }
  | { tipo: 'lista'; titulo: string; items: string[] }
  | { tipo: 'bloques'; titulo: string; items: string[] }

function etapasDe(obras: Obra[], proceso: ReturnType<typeof useV5>['strings']['sections']['process'], kit: ReturnType<typeof useV5>['strings']['sections']['buildKit']): (Etapa | null)[] {
  const conCaptura = obras.filter((o) => o.kind === 'store' && o.views.includes('home'))
  const a = conCaptura[0]
  const b = conCaptura[1] ?? a
  return [
    { tipo: 'cuello', cuelloEtiqueta: proceso.problemLabel, cuello: proceso.problem, arregloEtiqueta: proceso.fixLabel, arreglo: proceso.fix },
    a ? { tipo: 'captura', obra: a, vp: 'desktop' } : null,
    b ? { tipo: 'captura', obra: b, vp: 'mobile' } : null,
    { tipo: 'lista', titulo: kit.tiles.checks.title, items: kit.tiles.checks.items },
    { tipo: 'bloques', titulo: kit.tiles.editor.title, items: kit.tiles.editor.items },
  ]
}

function Escenario({ etapa, c }: { etapa: Etapa | null; c: Copy }) {
  if (!etapa) return null
  if (etapa.tipo === 'captura')
    return (
      <figure className="dd-etapa" data-tipo="captura">
        <div className="dd-etapa__marco" data-vp={etapa.vp}>
          <ShotImg slug={etapa.obra.slug} vista="home" vp={etapa.vp} alt="" />
        </div>
        <figcaption className="dd-micro">{c.proceso.ejemplo(etapa.obra.name)} · {etapa.vp === 'desktop' ? '1440' : '390'} · {SHOT_DATE}</figcaption>
      </figure>
    )
  if (etapa.tipo === 'cuello')
    return (
      <div className="dd-etapa" data-tipo="cuello">
        <p><b>{etapa.cuelloEtiqueta}</b> {etapa.cuello}</p>
        <p><b>{etapa.arregloEtiqueta}</b> {etapa.arreglo}</p>
      </div>
    )
  return (
    <div className="dd-etapa" data-tipo={etapa.tipo}>
      <p className="dd-etapa__titulo">{etapa.titulo}</p>
      <ul className={etapa.tipo === 'lista' ? 'dd-etapa__lista' : 'dd-etapa__bloques'}>
        {etapa.items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  )
}

/** «Cómo trabajo»: la palabra gigante del paso fijada a la izquierda (escritorio), con un riel de 1 px cuyo punto baja con el paso y un
 *  escenario con lo que acompaña a ese paso; en móvil cada paso es una fila de la lista. */
function Proceso() {
  const c = useCopy()
  const { strings } = useV5()
  const obras = useObras()
  const proceso = strings.sections.process
  const pasos = proceso.steps
  const etapas = etapasDe(obras, proceso, strings.sections.buildKit)
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

  const m = strings.sections.manifesto
  return (
    <section ref={seccion} className="dd-proceso dd-seccion" aria-labelledby="dd-proceso-t">
      <div className="dd-proceso__fija">
        <div className="dd-proceso__cab">
          <p className="dd-eyebrow" data-in>{proceso.eyebrow}</p>
          <Titulo id="dd-proceso-t" className="dd-h2" lineas={[proceso.title, enfasisFinal(proceso.titleAccent)]} />
        </div>
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
            <span className="dd-paso__n dd-micro">{String(k + 1).padStart(2, '0')}</span>
            <h3 className="dd-paso__titulo">{p.title}</h3>
            <p>{p.body}</p>
            <p className="dd-paso__recibes"><span className="dd-micro">{c.proceso.recibes}</span> {p.deliverable}</p>
          </li>
        ))}
      </ol>
      <aside className="dd-manifiesto" aria-label={m.label}>
        <p className="dd-eyebrow" data-in>{m.label}</p>
        <ul>
          {m.lines.map((l) => (
            <li key={l} data-in="fila">{l}</li>
          ))}
        </ul>
      </aside>
    </section>
  )
}

/** Los cargos del CV en una sola mirada: periodo, empresa, título y las cifras que cada cargo dejó (atribuidas a su cargo y periodo). */
function Cargos() {
  const c = useCopy()
  const { trayectoria, strings, locale } = useV5()
  const x = strings.sections.experience
  return (
    <section className="dd-seccion dd-cargos-r" aria-labelledby="dd-cargos-t">
      <div className="dd-seccion__cab">
        <p className="dd-eyebrow" data-in>{x.eyebrow}</p>
        <Titulo id="dd-cargos-t" className="dd-h2" lineas={[x.title, enfasisFinal(x.titleAccent)]} />
      </div>
      <ol className="dd-cargos-r__lista">
        {trayectoria.map((e) => (
          <li key={e.id} className="dd-cargo-r" data-in="fila">
            <p className="dd-cargo-r__periodo dd-micro">{e.period}</p>
            <div className="dd-cargo-r__quien">
              <h3 className="dd-cargo-r__empresa">{e.company}</h3>
              {e.title && <p className="dd-micro">{e.title}</p>}
            </div>
            <dl className="dd-cargo-r__cifras">
              {e.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="dd-micro">{m.label}</dt>
                  <dd><Valor v={formatoCifra(m.value, locale)} /></dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>
      <Enlace to={TRAYECTORIA} etiqueta={c.nav.trayectoria} className="dd-enlace dd-enlace--fuerte dd-seccion__mas" data-in>{c.cargos.ver}</Enlace>
    </section>
  )
}

export default function Inicio() {
  const c = useCopy()
  const { locale } = useLanguage()
  const { strings, personal } = useV5()
  const obras = useObras()
  const esc = useMedia('(min-width: 1024px)')
  const heroRef = useRef<HTMLElement>(null)
  const objeto = useRef<HTMLDivElement>(null)
  const h = strings.hero
  const frases = h.positioning.split(/(?<=[.。])\s*/).filter(Boolean)
  const lineas = frases.map((f, k) => (k === frases.length - 1 ? sinPuntoFinal(f) : f)).map((f, k, a) => (k === a.length - 1 && locale !== 'ja' ? enfasis(f, locale === 'es' ? 'pedidos' : 'orders') : f))
  const tiendas = obras.filter((o) => o.kind === 'store' && o.views.includes('home'))
  const destacadas = tiendas.slice(0, 4)

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
        <div className="dd-hero__rejilla">
          <div ref={objeto} className="dd-hero__objeto" data-dd-hero-object="">
            <MBCromo yaw={-10} soloPoster={!esc} />
          </div>
          <div className="dd-hero__texto">
            <p className="dd-eyebrow" data-in>{h.eyebrow}</p>
            <Titulo as="h1" className="dd-mega" lineas={lineas} />
            <p className="dd-lede" data-in>{h.lead}</p>
            <div className="dd-acciones" data-in>
              <div className="dd-acciones__primaria">
                <Enlace to={`${CONTACTO}?motivo=revision#agenda`} etiqueta={c.nav.contacto} className="dd-boton dd-boton--grande">{h.ctaPrimary}</Enlace>
                <p className="dd-nota">{h.ctaNote}</p>
              </div>
              <Enlace to={OBRA} etiqueta={c.nav.obra} className="dd-enlace dd-enlace--fuerte">{h.ctaSecondary}</Enlace>
            </div>
          </div>
        </div>
        <Cinta obras={tiendas.slice(0, 10)} />
      </section>

      <Cifras />

      <section className="dd-seccion" aria-labelledby="dd-obra-t">
        <div className="dd-seccion__cab">
          <Titulo id="dd-obra-t" className="dd-h2" lineas={[c.obra.titulo]} />
          <p className="dd-lede" data-in>{c.obra.ledeInicio}</p>
        </div>
        <IndiceObra obras={destacadas} />
        <Enlace to={OBRA} etiqueta={c.nav.obra} className="dd-enlace dd-enlace--fuerte dd-seccion__mas" data-in>{c.obra.verTodo}</Enlace>
      </section>

      <Proceso />

      <Cargos />

      <section className="dd-cierre" data-tono="papel" aria-labelledby="dd-cierre-t">
        <div className="dd-cierre__cuerpo">
          <Titulo id="dd-cierre-t" className="dd-mega" lineas={[c.cierre.titulo]} />
          <p className="dd-lede" data-in>{strings.sections.contact.promise}</p>
          <div className="dd-acciones" data-in>
            <Enlace to={`${CONTACTO}?motivo=revision#agenda`} etiqueta={c.nav.contacto} className="dd-boton dd-boton--grande">{h.ctaPrimary}</Enlace>
            <a className="dd-enlace dd-enlace--fuerte" href={personal.cv} download>{h.ctaCv}</a>
          </div>
          <ul className="dd-cierre__datos" data-in>
            <li><span className="dd-estado-luz" aria-hidden="true" />{h.availability}</li>
            <li>{h.location}</li>
          </ul>
        </div>
      </section>
    </Pagina>
  )
}
