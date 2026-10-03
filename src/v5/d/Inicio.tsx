import { useMemo, useRef, type ReactNode } from 'react'
import { SHOT_DATE, datosDe, useV5, v5path } from '../data'
import { ShotImg } from '../shared/ShotImg'
import { Aparato } from './Aparato'
import { Cabeza } from './Cabeza'
import { Despiece } from './Despiece'
import { Enlace } from './Enlace'
import { useAnimaAlMontar } from './ajustes'
import { conCaptura, ordenar, useObras } from './datos'
import { CORTE, CORTE_H, LIMPIAR, SNAP, enTransicion, esPrimeraCarga, gsap, revelar, useCoreografia } from './movimiento'
import { llenar, useCopy } from './copy'

/** Hoja de especificaciones: lista de definición en monoespaciada, una celda por dato. */
function HojaSpecs() {
  const c = useCopy().inicio
  const { strings, trayectoria, personal } = useV5()
  const desde = Math.min(...trayectoria.map((e) => Number(e.start.slice(0, 4))))
  const filas: [string, ReactNode, string][] = [
    [c.hoy, strings.experience['digitdeck-cto'].title, 'd-s-ancha'],
    [c.empresa, trayectoria.find((e) => e.id === 'digitdeck-cto')?.company, ''],
    [c.trayectoria, `${desde} → ${c.presente}`, ''],
    [c.ubicacion, strings.location, ''],
    [c.idiomasSitio, c.idiomasSitioValor, ''],
    [
      c.interfaces,
      <span className="d-lista-enlaces" key="i">
        <a href={`mailto:${personal.email}`}>{c.correo}</a>
        <a href={personal.whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a href={personal.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href={personal.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href={personal.cv} target="_blank" rel="noopener noreferrer">{c.cvEtiqueta}</a>
      </span>,
      'd-s-ancha',
    ],
  ]
  return (
    <section className="d-banda" aria-labelledby="d-hoja">
      <h2 id="d-hoja" className="d-solo-lector">{c.hojaTitulo}</h2>
      <dl className="d-hoja" aria-label={c.hojaTitulo}>
        {filas.map(([k, v, ancho]) => (
          <div key={k} className={`d-celda d-spec ${ancho}`.trim()}>
            <dt className="d-cap">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** «Cómo trabajo, según Max»: su proceso, con las cifras de su CV atribuidas, y los commits que sí salen de los repos. */
function ComoTrabajo() {
  const c = useCopy().inicio
  const { strings, obras, intlLocale } = useV5()
  const t = strings.sections.buildKit.tiles
  const repos = obras.filter((o) => o.kind === 'store').map((o) => datosDe(o.slug).git).filter((g) => g !== null)
  const commits = repos.reduce((n, g) => n + g.commits, 0)
  const celdas = [
    { id: 'repo', titulo: t.repo.title, cuerpo: llenar(c.comoCommits, { n: new Intl.NumberFormat(intlLocale).format(commits), t: repos.length }) },
    { id: 'checks', titulo: t.checks.title, cuerpo: t.checks.body },
    { id: 'editor', titulo: t.editor.title, cuerpo: t.editor.body },
  ]
  return (
    <section className="d-banda" aria-labelledby="d-como">
      <div className="d-celda d-como-cab">
        <h2 id="d-como" className="d-h2">{c.comoTitulo}</h2>
        <p className="d-nota-chica">{c.comoNota}</p>
      </div>
      <ul className="d-como">
        {celdas.map((x, i) => (
          <li key={x.id} className="d-celda d-blanca">
            <span className="d-cap">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="d-h3">{x.titulo}</h3>
            <p>{x.cuerpo}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** La línea de modelos: las obras más recientes con captura real, como puerta a la tabla. */
function LineaDeModelos() {
  const t = useCopy()
  const c = t.inicio
  const { storeCount } = useV5()
  const obras = useObras()
  const lista = useMemo(() => conCaptura(obras), [obras])
  const seis = lista.slice(0, 6)
  const tambien = lista.slice(6, 12).map((o) => o.name)
  const resto = ordenar(obras).length - 12
  return (
    <section className="d-banda d-linea" aria-labelledby="d-linea-t">
      <div className="d-celda d-linea-cab">
        <h2 id="d-linea-t" className="d-cap d-cap-h">
          {c.ultimosTitulo} · {llenar(c.seisDe, { n: seis.length, total: storeCount })} · {llenar(c.capturasDel, { fecha: SHOT_DATE })}
        </h2>
        <p className="d-linea-tambien">{t.obra.tambien}: {tambien.join(' · ')}{resto > 0 ? ` · +${resto} ${t.obra.enLaTabla}` : ''}</p>
      </div>
      <ul className="d-modelos">
        {seis.map((o) => (
          <li key={o.slug}>
            <Enlace foto to={v5path('d', 'obra', o.slug)} className="d-m" aria-label={llenar(c.verFicha, { nombre: o.name })}>
              <span className="d-ph"><ShotImg slug={o.slug} vista="home" vp="desktop" alt="" /></span>
              <span className="d-t"><b>{o.name}</b><span>{o.industry ?? t.obra.tipoUno[o.kind]}</span></span>
            </Enlace>
          </li>
        ))}
      </ul>
      <div className="d-celda d-linea-pie">
        <Enlace className="d-ter" to={v5path('d', 'obra')}>{c.verObra}</Enlace>
      </div>
    </section>
  )
}

export default function Inicio() {
  const t = useCopy()
  const { strings, personal } = useV5()
  const anima = useAnimaAlMontar()
  const raiz = useRef<HTMLDivElement>(null)

  // Entrada: «se enciende el aparato». El nombre baja línea a línea, el panel se barre en pantalla, la pantalla de puntos
  // enciende su retroiluminación en tres pasos, imprime sus líneas columna a columna y el LED se calienta.
  // Dura ≈ 1,1 s y el contenido se lee desde los primeros 0,4 s. Lo que sigue (hoja, línea, despiece) se revela al llegar.
  // Si la vista llega dentro de una View Transition, el barrido de la página YA es la entrada: la vista nace completa y solo
  // queda el encendido del LCD (≤ 0,4 s), que coincide con el momento en que el barrido lo descubre.
  useCoreografia(
    raiz,
    () => {
      const bajoVT = enTransicion()
      const tl = gsap.timeline({ defaults: { ease: SNAP, clearProps: LIMPIAR }, delay: bajoVT ? 0 : esPrimeraCarga() ? 0.08 : 0.04 })
      if (bajoVT) {
        tl.from('.d-lcd', { opacity: 0, duration: 0.09, ease: 'steps(3)' }, 0.08)
          .fromTo('.d-lcd .d-led', { opacity: 0.12 }, { keyframes: [{ opacity: 1, duration: 0.06 }, { opacity: 0.35, duration: 0.05 }, { opacity: 1, duration: 0.1 }], ease: 'none' }, 0.17)
      } else {
        tl.from('.d-h1 span', { clipPath: CORTE.oculto, y: 30, duration: 0.55, stagger: 0.09 }, 0)
          .from('.d-modelo', { clipPath: CORTE_H.oculto, duration: 0.4 }, 0.14)
          .from('.d-pos', { clipPath: CORTE.oculto, y: 12, duration: 0.42 }, 0.24)
          .from('.d-acciones > *, .d-hb3 .d-nota', { clipPath: CORTE.oculto, y: 10, duration: 0.36, stagger: 0.07 }, 0.36)
          .from('.d-fig-cab', { opacity: 0, duration: 0.3 }, 0.1)
          .from('.d-aparato', { clipPath: CORTE.oculto, duration: 0.5 }, 0.1)
          .from('.d-lcd', { opacity: 0, duration: 0.09, ease: 'steps(3)' }, 0.38)
          .from('.d-lcd-l1, .d-lcd-l2, .d-lcd-l3, .d-lcd-st', { clipPath: CORTE_H.oculto, duration: 0.36, ease: 'steps(18)', stagger: 0.08 }, 0.44)
          .fromTo('.d-lcd .d-led', { opacity: 0.12 }, { keyframes: [{ opacity: 1, duration: 0.06 }, { opacity: 0.35, duration: 0.05 }, { opacity: 1, duration: 0.1 }], ease: 'none' }, 0.5)
          .from('.d-sws .d-sw', { y: 8, opacity: 0, duration: 0.26, stagger: 0.06 }, 0.66)
          .from('.d-agujeros i', { opacity: 0, duration: 0.1, ease: 'steps(2)', stagger: 0.01 }, 0.8)
      }

      revelar('.d-spec', { escalon: 0.05 })
      revelar('.d-modelos > li', { escalon: 0.06 })
      revelar('.d-como > li', { escalon: 0.08 })
    },
    anima,
  )

  return (
    <div ref={raiz} className="d-vista">
      <Cabeza titulo={`${personal.name} · ${t.titulos.inicio}`} />
      <section className="d-banda d-hero" aria-label={t.inicio.modelo}>
        <div className="d-hero-grid">
          <div className="d-hero-texto">
            <div className="d-hb d-hb1">
              <h1 className="d-h1">
                <span>{personal.firstName}</span> <span>{personal.lastName}</span>
              </h1>
            </div>
            <div className="d-hb d-hb2">
              <p className="d-modelo">{strings.hero.eyebrow}</p>
              <p className="d-pos">{strings.hero.positioning}</p>
            </div>
            <div className="d-hb d-hb3">
              <div className="d-acciones">
                <Enlace className="d-cta" to={v5path('d', 'contacto')}>
                  <span>{t.inicio.ctaCorto}</span>
                  <span className="d-cta-flecha" aria-hidden="true">→</span>
                </Enlace>
                <Enlace className="d-ter" to={v5path('d', 'obra')}>{strings.hero.ctaSecondary}</Enlace>
              </div>
              <p className="d-nota">
                {t.inicio.ctaNota} <span className="d-n2">{strings.hero.ctaNote}</span>
              </p>
            </div>
          </div>
          <div className="d-dev">
            <i className="d-reg d-reg-1" aria-hidden="true" />
            <i className="d-reg d-reg-2" aria-hidden="true" />
            <i className="d-reg d-reg-3" aria-hidden="true" />
            <i className="d-reg d-reg-4" aria-hidden="true" />
            <Aparato />
          </div>
        </div>
      </section>
      <HojaSpecs />
      <LineaDeModelos />
      <Despiece />
      <ComoTrabajo />
    </div>
  )
}
