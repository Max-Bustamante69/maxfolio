import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { datosDe, useV5 } from '../data'
import { useAnimaAlMontar } from './ajustes'
import { CAPAS_RE, cuentaStack, useObras } from './datos'
import { SNAP, alVer, gsap, revelar, seguirPista, useCoreografia } from './movimiento'
import { llenar, useCopy } from './copy'

// Cada plancha del despiece es una cara romboidal de 220 × 56 con 10 de grosor, centrada en x = 150.
const CARA = '40,28 150,0 260,28 150,56'
const LADO_IZQ = '40,28 150,56 150,66 40,38'
const LADO_DER = '150,56 260,28 260,38 150,66'
// Separación entre capas: 14 px apiladas → 84 px abiertas (la define estilos.css con la variable --p de cada capa).
const APILADA = 14
const ABIERTA = 84
const ALTO = ABIERTA * 5 + 66
// Apiladas, las seis placas miden 5 × 14 + 66 = 136 de alto: nacen CENTRADAS en el visor (.d-pila las baja por --g) y se abren
// simétricas, las de arriba hacia arriba y las de abajo hacia abajo.
const CENTRO = (ALTO - (APILADA * 5 + 66)) / 2
const TRAMO_ABRIR = 0.3 // el primer 30 % del recorrido separa las capas; el resto recorre una capa tras otra
const ALZADA = 8 // la capa activa se levanta 8 unidades

/** Marca de cada capa sobre su cara (trazos finos, en perspectiva): lo que la capa «es». */
const GLIFOS = [
  <path key="1" d="M114 31l36-13 36 13M124 36l26-9.5 26 9.5" />, // plantilla: dos chevrones
  <g key="2"><ellipse cx="150" cy="28" rx="26" ry="9" /><circle cx="150" cy="28" r="2.6" /></g>, // isla: anillo con núcleo
  <g key="3"><path d="M150 14l9 3.6-9 3.6-9-3.6z" /><path d="M128 25l9 3.6-9 3.6-9-3.6z" /><path d="M172 25l9 3.6-9 3.6-9-3.6z" /><path d="M150 36l9 3.6-9 3.6-9-3.6z" /></g>, // suite: cuatro módulos
  <g key="4"><circle cx="132" cy="28" r="2.4" /><circle cx="150" cy="28" r="2.4" /><circle cx="168" cy="28" r="2.4" /><path d="M118 28h6M176 28h6" /></g>, // functions: nodos
  <g key="5"><circle cx="150" cy="28" r="7" /><path d="M150 12v32M130 28h40" /></g>, // medición: retícula
  <path key="6" d="M136 30l9 6 18-16" />, // QA: visto
]

const MEDIA_ESCRITORIO = '(min-width: 1024px)'

/** Lo que se sabe de una capa: o una cuenta que sale del registro (n de m) o un hecho del CV de Max, nunca «sin cuenta». */
type Cuenta = { tipo: 'conteo'; n: number; m: number; etiqueta: string } | { tipo: 'cv' }

/** La cuenta de una capa: un mini-LCD «23/39» (Doto) con su barra debajo, o la atribución al CV. */
function CuentaCapa({ cuenta }: { cuenta: Cuenta }) {
  const c = useCopy().inicio
  if (cuenta.tipo === 'cv') {
    return <p className="d-dato"><span className="d-led-fijo" aria-hidden="true" />{c.segunCv}</p>
  }
  return (
    <>
      <p className="d-cuenta">
        <span className="d-minilcd" aria-hidden="true"><b>{cuenta.n}</b>/{cuenta.m}</span>
        <span>{llenar(c.cuentaDe, { n: cuenta.n, m: cuenta.m, etiqueta: cuenta.etiqueta })}</span>
      </p>
      <span className="d-medida" aria-hidden="true"><i style={{ '--v': cuenta.m > 0 ? cuenta.n / cuenta.m : 0 } as CSSProperties} /></span>
    </>
  )
}

/** Seis capas de lo que hay dentro de una tienda. En escritorio la escena queda fija y las capas se SEPARAN con una
 *  línea de tiempo de scroll de 120 vh (después recorre una capa tras otra); en móvil se abre una vez al llegar y cada capa
 *  es un acordeón. Sin JS: el estado separado, que es el de reposo en CSS. */
export function Despiece() {
  const c = useCopy().inicio
  const { strings, trayectoria } = useV5()
  const obras = useObras()
  const anima = useAnimaAlMontar()
  const escritorio = useMediaQuery(MEDIA_ESCRITORIO)
  const [sel, setSel] = useState(0)
  const [abierta, setAbierta] = useState(false)
  const raiz = useRef<HTMLElement>(null)
  const pista = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const det = useRef<HTMLDivElement>(null)
  const pistaCtl = useRef<ReturnType<typeof seguirPista> | null>(null)

  const cto = trayectoria.find((e) => e.id === 'digitdeck-cto')
  const delCv = (re: RegExp) => cto?.highlights.find((h) => re.test(h)) ?? ''
  const tiendasConGit = obras.filter((o) => o.kind === 'store' && datosDe(o.slug).git)
  const conIslas = tiendasConGit.filter((o) => (datosDe(o.slug).git?.lines.islands ?? 0) > 0).length
  const enFichas = (id: string): Cuenta => ({ tipo: 'conteo', n: cuentaStack(obras, CAPAS_RE[id] as RegExp), m: obras.length, etiqueta: c.fichasLaNombran })
  // Functions y QA casi no aparecen en el stack de las fichas (1 y 0): su prueba es el CV del cargo, atribuida como tal.
  const detalle: { texto: string; cuenta: Cuenta }[] = [
    { texto: strings.sections.process.steps[2].body, cuenta: enFichas('tema') },
    { texto: strings.sections.skills.groupNote.frontend, cuenta: { tipo: 'conteo', n: conIslas, m: tiendasConGit.length, etiqueta: c.tiendasConIslas } },
    { texto: strings.products['digitdeck-apps'].description, cuenta: enFichas('apps') },
    { texto: delCv(/function/i), cuenta: { tipo: 'cv' } },
    { texto: `${strings.products.track.tagline} · ${obras.find((o) => o.slug === 'track')?.stack.join(' · ') ?? ''}`, cuenta: enFichas('medicion') },
    { texto: delCv(/playwright/i) || strings.sections.buildKit.tiles.checks.body, cuenta: { tipo: 'cv' } },
  ]

  // La guía de la capa activa llega hasta su detalle: el rombo está en el visor y el texto, fijo en la columna de al lado, así
  // que la guía sale horizontal de la capa, baja o sube por una regla vertical y entra al texto. Se mide la posición REAL de la
  // capa (la escala del visor depende del alto y del ancho de su celda) y se escribe en --ya.
  const medirGuia = () => {
    if (!svg.current || !det.current) return
    const r = svg.current.getBoundingClientRect()
    const d = det.current.getBoundingClientRect()
    const s = Math.min(r.width / 300, r.height / ALTO)
    const arriba = r.top + (r.height - ALTO * s) / 2
    det.current.style.setProperty('--ya', `${arriba + (Math.max(sel, 0) * ABIERTA + 28 - ALZADA) * s - d.top}px`)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(medirGuia, [sel, escritorio, abierta])

  // Escritorio: la escena se queda fija (position: sticky) y el scroll separa las capas. El progreso se lee del evento scroll
  // (sin bucle de fotogramas); una línea de tiempo pausada lo traduce a la variable --p de cada capa. Móvil: las capas quedan
  // apiladas hasta que la figura entra en pantalla y entonces se abren una vez, en 6 pasos.
  useCoreografia(
    raiz,
    () => {
      const capas = gsap.utils.toArray<SVGGElement>('.d-slab')
      const pila = '.d-pila'
      gsap.set(capas, { '--p': 0 })
      gsap.set(pila, { '--g': 0 })
      if (!escritorio) {
        alVer(svg.current, () => {
          gsap.timeline({ defaults: { ease: 'steps(6)' } })
            .to(capas, { '--p': 1, duration: 0.48, stagger: { each: 0.02, from: 'end' } }, 0)
            .to(pila, { '--g': 1, duration: 0.48 }, 0)
        })
        return
      }
      if (!pista.current) return
      const escena = pista.current.querySelector<HTMLElement>('.d-escena')!
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
      // Las capas se separan desde el centro: la pila nace centrada y se abre simétrica.
      tl.to(capas, { '--p': 1, ease: SNAP, duration: TRAMO_ABRIR, stagger: { each: 0.018, from: 'end' } }, 0)
      tl.to(pila, { '--g': 1, ease: SNAP, duration: TRAMO_ABRIR + 0.09 }, 0)
      tl.to({}, { duration: 1 - TRAMO_ABRIR }, TRAMO_ABRIR)
      const ctl = seguirPista(
        pista.current,
        escena,
        () => parseFloat(getComputedStyle(escena).top) || 0,
        (p) => {
          tl.progress(p)
          setAbierta((a) => (a === p >= TRAMO_ABRIR ? a : !a))
          const paso = p < TRAMO_ABRIR ? 0 : Math.min(5, Math.floor(((p - TRAMO_ABRIR) / (1 - TRAMO_ABRIR)) * 6))
          setSel((anterior) => (anterior === paso ? anterior : paso))
        },
      )
      pistaCtl.current = ctl
      window.addEventListener('resize', medirGuia)
      return () => {
        ctl.limpiar()
        window.removeEventListener('resize', medirGuia)
        pistaCtl.current = null
      }
    },
    anima,
    [escritorio],
  )

  // Revelados internos de la cabecera de la sección (la escena no se oculta nunca).
  useCoreografia(raiz, () => revelar('.d-desp-cab > *', { escalon: 0.06 }), anima, [escritorio])

  const irA = (i: number) => {
    setSel(i)
    pistaCtl.current?.irA(TRAMO_ABRIR + ((i + 0.5) / 6) * (1 - TRAMO_ABRIR))
  }

  const figura = (
    <svg ref={svg} className="d-despiece-svg" viewBox={`0 0 300 ${ALTO}`} role="img" aria-label={c.despieceTitulo} focusable="false" style={{ '--ct': CENTRO } as CSSProperties}>
      <g className="d-pila">
        {c.capas
          .map((capa, i) => (
            <g key={capa.id} className="d-slab" data-activa={i === sel} style={{ '--i': i } as CSSProperties}>
              <g className="d-slab-in">
                <line className="d-slab-guia" x1="206" y1="28" x2="2000" y2="28" />
                <polygon className="d-slab-lado d-lado-i" points={LADO_IZQ} />
                <polygon className="d-slab-lado d-lado-d" points={LADO_DER} />
                <polygon className="d-slab-cara" points={CARA} />
                <g className="d-slab-glifo">{GLIFOS[i]}</g>
                <circle className="d-slab-led" cx="236" cy="28" r="3.4" />
                <text className="d-slab-n" x="2" y="36">{String(i + 1).padStart(2, '0')}</text>
              </g>
            </g>
          ))
          .reverse()}
      </g>
    </svg>
  )

  const activa = detalle[Math.max(sel, 0)]

  return (
    <section className="d-banda d-despiece" aria-labelledby="d-despiece" ref={raiz}>
      <div className="d-pista" ref={pista}>
        <div className="d-escena" data-abierta={abierta}>
          <div className="d-celda d-desp-cab">
            <h2 id="d-despiece" className="d-h2">{c.despieceTitulo}</h2>
            <p className="d-lead d-lead-chico">{c.despieceLead}</p>
            {escritorio && (
              <ol className="d-capas" aria-label={c.despieceTitulo}>
                {c.capas.map((capa, i) => (
                  <li key={capa.id}>
                    <button type="button" className="d-capa-b" aria-current={i === sel ? 'step' : undefined} onClick={() => irA(i)}>
                      <span className="d-capa-n">{String(i + 1).padStart(2, '0')}</span>
                      <span>{capa.nombre}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="d-celda d-desp-fig">{figura}</div>

          {escritorio ? (
            <div className="d-celda d-desp-det" ref={det} aria-live="off">
              <i className="d-conector" aria-hidden="true" />
              <i className="d-conector-t" aria-hidden="true" />
              <p className="d-cap">{llenar(c.capa, { i: sel + 1 })} / 6</p>
              <h3 className="d-h3">{c.capas[sel].nombre}</h3>
              <p className="d-det-texto" key={sel} data-cambia="true">{activa.texto}</p>
              <CuentaCapa cuenta={activa.cuenta} />
            </div>
          ) : (
            <ol className="d-capas d-capas-movil" aria-label={c.despieceTitulo}>
              {c.capas.map((capa, i) => (
                <li key={capa.id} className="d-capa" data-abierto={i === sel}>
                  <h3 className="d-capa-t">
                    <button type="button" aria-expanded={i === sel} aria-controls={`d-capa-${i}`} onClick={() => setSel(i === sel ? -1 : i)} className="d-capa-b">
                      <span className="d-capa-n">{String(i + 1).padStart(2, '0')}</span>
                      <span>{capa.nombre}</span>
                    </button>
                  </h3>
                  <div id={`d-capa-${i}`} className="d-acordeon" inert={i !== sel}>
                    <div className="d-acordeon-in">
                      <p>{detalle[i].texto}</p>
                      <CuentaCapa cuenta={detalle[i].cuenta} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
      <p className="d-nota">{c.fuenteDespiece}</p>
    </section>
  )
}
