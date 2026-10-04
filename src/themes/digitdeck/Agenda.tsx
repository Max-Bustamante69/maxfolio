// Agenda de llamadas de la dirección «A la manera de Digitdeck»: una tira de semana tipo comando, las horas como píldoras en
// monoespaciada con el punto verde, un paso de datos como formulario de terminal y la confirmación con el punto que cae.
// Todo sobre useAgenda('digitdeck') (la agenda pública de Digitdeck: reservar crea la cita, el evento con Meet y la invitación de Google).
//
// Tres escenas en un mismo panel (elegir → datos → listo). Cada región entra con la gramática de la casa (el filete se dibuja de
// izquierda a derecha, el contenido baja descubierto por una cortina; las horas y los días se escriben de izquierda a derecha) y sale
// en 140 ms. Todo dentro de un gsap.context que se revierte al desmontar; nada se mueve en reposo (el único movimiento continuo es el
// latido del esqueleto, por CSS y limitado a tres pulsos). prefers-reduced-motion no se implementa: decisión vigente de la casa.
import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, useEffect, type FormEvent, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { useLanguage } from '../../context/LanguageContext'
import { PRIVACIDAD, fmtDia, fmtHora, useAgenda, type Dia, type Fallo, type Franja } from '../shared/agenda'
import { useCopiaDD } from './agenda-copy'
import { EASE } from './movimiento'
import './agenda.css'

type Paso = 'elegir' | 'datos' | 'listo'
type EstadoFila = 'vacio' | 'ok' | 'error'
interface Celda { clave: string; fecha: Date; dia: Dia | null }
interface Datos { nombre: string; email: string; marca: string; mensaje: string; consiente: boolean }

const DIA_MS = 864e5
const VACIO: Datos = { nombre: '', email: '', marca: '', mensaje: '', consiente: false }
const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
/** El enlace de Meet viene de la API: solo se enlaza si es https. */
const urlOk = (u?: string) => (u && /^https:\/\//i.test(u) ? u : undefined)
const claveEn = (iso: string, zona: string) => new Intl.DateTimeFormat('en-CA', { timeZone: zona }).format(new Date(iso))

/** Los días con huecos, en semanas de lunes a domingo; los días sin huecos van como celdas apagadas. */
function armarSemanas(dias: Dia[]): Celda[][] {
  if (!dias.length) return []
  const orden = [...dias].sort((a, b) => (a.clave < b.clave ? -1 : 1))
  const lunes = (f: Date) => f.getTime() - ((f.getUTCDay() + 6) % 7) * DIA_MS
  const porClave = new Map(orden.map((d) => [d.clave, d]))
  const fin = orden[orden.length - 1].fecha.getTime()
  const semanas: Celda[][] = []
  for (let ini = lunes(orden[0].fecha); ini <= fin; ini += 7 * DIA_MS) {
    const sem: Celda[] = []
    for (let k = 0; k < 7; k++) {
      const fecha = new Date(ini + k * DIA_MS)
      const clave = fecha.toISOString().slice(0, 10)
      sem.push({ clave, fecha, dia: porClave.get(clave) ?? null })
    }
    semanas.push(sem)
  }
  return semanas
}

/** Entrada de una región: lo que va marcado con data-ag entra con su gesto. El estado de partida lo escribe JS (nada queda oculto sin JS). */
function entrada(raiz: HTMLElement) {
  const q = (s: string) => [...raiz.querySelectorAll<HTMLElement>(`[data-ag="${s}"]`)]
  const sube = q('sube')
  const celdas = q('celda')
  const horas = q('hora')
  const filas = q('fila')
  const cae = q('cae')
  const hijos = filas.flatMap((f) => [...f.children] as HTMLElement[])
  gsap.set(sube, { opacity: 0, y: 14 })
  gsap.set([...celdas, ...horas, ...filas], { clipPath: 'inset(0 100% 0 0)' })
  gsap.set(hijos, { clipPath: 'inset(0 0 100% 0)' })
  gsap.set(cae, { y: -64, opacity: 0 })
  const tl = gsap.timeline()
  tl.to(sube, { opacity: 1, y: 0, duration: 0.4, ease: EASE.out, stagger: 0.05, clearProps: 'opacity,transform' }, 0)
  tl.to(celdas, { clipPath: 'inset(0 0% 0 0)', duration: 0.32, ease: EASE.out, stagger: 0.03, clearProps: 'clipPath' }, 0.04)
  tl.to(horas, { clipPath: 'inset(0 0% 0 0)', duration: 0.3, ease: EASE.out, stagger: 0.014, clearProps: 'clipPath' }, 0.1)
  tl.to(filas, { clipPath: 'inset(0 0% 0 0)', duration: 0.44, ease: EASE.out, stagger: 0.05, clearProps: 'clipPath' }, 0)
  tl.to(hijos, { clipPath: 'inset(0 0 0% 0)', duration: 0.36, ease: EASE.out, stagger: 0.025, clearProps: 'clipPath' }, 0.1)
  tl.to(cae, { y: 0, opacity: 1, duration: 0.5, ease: EASE.out, clearProps: 'transform,opacity', onComplete: () => cae.forEach((p) => p.setAttribute('data-pulse', 'true')) }, 0.28)
}

function Region({ rf, className, children }: { rf: RefObject<HTMLDivElement | null>; className: string; children: ReactNode }) {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => entrada(rf.current!), rf.current!)
    return () => ctx.revert()
  }, [rf])
  return (
    <div ref={rf} className={className}>
      {children}
    </div>
  )
}

/** Flechas, Inicio y Fin mueven el foco entre los botones de un grupo (en la rejilla de horas, arriba y abajo saltan de fila). */
function flechas(e: KeyboardEvent<HTMLElement>) {
  const k = e.key
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(k)) return
  const bs = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
  const i = bs.indexOf(document.activeElement as HTMLButtonElement)
  if (i < 0) return
  const cols = Math.max(1, bs.filter((b) => b.offsetTop === bs[0].offsetTop).length)
  const n = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'ArrowDown' ? i + cols : k === 'ArrowUp' ? i - cols : k === 'Home' ? 0 : bs.length - 1
  if (n < 0 || n >= bs.length || n === i) return
  e.preventDefault()
  bs[n].focus()
}

const Chevron = ({ dir }: { dir: 'izq' | 'der' }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
    <path d={dir === 'izq' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface ItemRuta { k: string; txt: string; estado: 'hecho' | 'actual' | 'pendiente' }

/** La ruta sin nada elegido (cargando, error o sin huecos): el día es lo próximo. */
const rutaDeCarga = (x: ReturnType<typeof useCopiaDD>): ItemRuta[] => [
  { k: 'dia', txt: x.ruta.dia, estado: 'actual' },
  { k: 'hora', txt: x.ruta.hora, estado: 'pendiente' },
  { k: 'datos', txt: x.ruta.datos, estado: 'pendiente' },
]

/** La línea de comando: agenda / día / hora / datos. Va rellenándose con lo elegido y marca el paso actual. */
function Barra({ items, rotulo, raiz }: { items: ItemRuta[]; rotulo: string; raiz: string }) {
  return (
    <div className="dd-ag__barra">
      <ol className="dd-ag__ruta" aria-label={rotulo}>
        <li className="dd-ag__raiz">
          <span className="dd-ag__punto" aria-hidden="true" />
          <span className="dd-ag__raiz-t">{raiz}</span>
        </li>
        {items.map((i) => (
          <li key={i.k} data-estado={i.estado} aria-current={i.estado === 'actual' ? 'step' : undefined}>
            {i.txt}
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Cuerpo de reserva: mismas cajas que el real, sin contenido (la altura queda reservada). */
function CuerpoEsqueleto() {
  return (
    <div className="dd-ag__cuerpo dd-ag__cuerpo--esq" aria-hidden="true">
      <div className="dd-ag__izq">
        <div className="dd-ag__nav">
          <span className="dd-ag__esq dd-ag__esq--nav" />
        </div>
        <div className="dd-ag__semana">
          {Array.from({ length: 7 }, (_, k) => (
            <span key={k} className="dd-ag__esq dd-ag__esq--dia" />
          ))}
        </div>
      </div>
      <div className="dd-ag__der">
        <span className="dd-ag__esq dd-ag__esq--t" />
        <div className="dd-ag__horas">
          {Array.from({ length: 12 }, (_, k) => (
            <span key={k} className="dd-ag__esq dd-ag__esq--hora" />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Una fila del formulario: el punto de estado (anillo vacío, verde lleno al estar bien, rojo si falla), la etiqueta, el control y su error. */
function Campo({ id, etiqueta, estado, error, children }: { id: string; etiqueta: string; estado: EstadoFila; error: string; children: ReactNode }) {
  return (
    <div className="dd-ag__fila" data-ag="fila" data-estado={estado}>
      <span className="dd-ag__estado" aria-hidden="true" />
      <div className="dd-ag__campo">
        <label htmlFor={id}>{etiqueta}</label>
        {children}
        {error && (
          <p id={`${id}-e`} className="dd-ag__error">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export function Agenda() {
  const { locale } = useLanguage()
  const x = useCopiaDD()
  const ag = useAgenda('digitdeck')
  const uid = useId()

  const [paso, setPaso] = useState<Paso>('elegir')
  const [sel, setSel] = useState<string | null>(null)
  const [semana, setSemana] = useState(0)
  const [franja, setFranja] = useState<Franja | null>(null)
  const [f, setF] = useState<Datos>(VACIO)
  const [hp, setHp] = useState('')
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [fallo, setFallo] = useState<Fallo | null>(null)
  const [ocupada, setOcupada] = useState(false)
  const [resultado, setResultado] = useState<{ meet?: string; email: string } | null>(null)
  const [anuncio, setAnuncio] = useState('')

  const panelRef = useRef<HTMLDivElement>(null)
  const izqRef = useRef<HTMLDivElement>(null)
  const derRef = useRef<HTMLDivElement>(null)
  const semanaRef = useRef<HTMLDivElement>(null)
  const nombreRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const consRef = useRef<HTMLInputElement>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const animando = useRef(false)
  const foco = useRef<'hora' | 'dia' | null>(null)

  const estado = ag.estado === 'listo' && ag.dias.length === 0 ? 'vacio' : ag.estado
  const semanas = useMemo(() => armarSemanas(ag.dias), [ag.dias])
  const dia = ag.dias.find((d) => d.clave === sel) ?? ag.dias[0]
  const idx = Math.min(semana, Math.max(0, semanas.length - 1))
  const fecha = (d: Date, o?: Intl.DateTimeFormatOptions) => fmtDia(d, locale, o)
  const diaLargo = (d: Date) => fecha(d)
  const diaCorto = (d: Date) => fecha(d, { weekday: 'short', day: 'numeric', month: 'short' })
  /** «5 – 11 oct», o «28 sep – 4 oct» si la semana cruza de mes (en japonés, mes y día completos). */
  const rango = (a: Date, b: Date) => {
    if (locale === 'ja') return `${fecha(a, { month: 'numeric', day: 'numeric' })} – ${fecha(b, { month: 'numeric', day: 'numeric' })}`
    const mes = (d: Date) => fecha(d, { month: 'short' }).replace(/\.$/, '')
    const dia = (d: Date) => fecha(d, { day: 'numeric' })
    return a.getUTCMonth() === b.getUTCMonth() ? `${dia(a)} – ${dia(b)} ${mes(b)}` : `${dia(a)} ${mes(a)} – ${dia(b)} ${mes(b)}`
  }

  /** La hora en la zona del visitante y, si difiere, la de Max (con el día si cae en otro). */
  const horaDe = (fr: Franja) => {
    const vis = fmtHora(fr.inicio, locale)
    const max = fmtHora(fr.inicio, locale, ag.zonaMax)
    const otroDia = claveEn(fr.inicio, ag.zona) !== claveEn(fr.inicio, ag.zonaMax)
    const difiere = vis !== max || otroDia
    const maxTxt = !difiere ? '' : otroDia ? `${fmtDia(new Date(fr.inicio), locale, { weekday: 'short', timeZone: ag.zonaMax })} ${max}` : max
    return { vis, maxTxt }
  }

  /** Sale la escena actual en 140 ms y entra la siguiente; el ticket de datos → listo se queda donde está. */
  const irA = useCallback(
    (nuevo: Paso) => {
      if (animando.current) return
      const izqClave = (p: Paso) => (p === 'elegir' ? 'tira' : 'ticket')
      const salen = [derRef.current, izqClave(paso) !== izqClave(nuevo) ? izqRef.current : null].filter(Boolean) as HTMLElement[]
      if (!salen.length) return setPaso(nuevo)
      animando.current = true
      gsap.to(salen, {
        opacity: 0,
        x: -12,
        duration: 0.14,
        ease: EASE.puntual,
        onComplete: () => {
          animando.current = false
          setPaso(nuevo)
        },
      })
    },
    [paso],
  )

  // Foco y encuadre al cambiar de escena: al primer campo, al título de la confirmación, o de vuelta a la hora/el día que se tenía.
  const previo = useRef(paso)
  useLayoutEffect(() => {
    if (previo.current === paso) return
    previo.current = paso
    const panel = panelRef.current
    if (!panel) return
    if (paso === 'datos') nombreRef.current?.focus({ preventScroll: true })
    else if (paso === 'listo') tituloRef.current?.focus({ preventScroll: true })
    else if (foco.current) panel.querySelector<HTMLElement>(foco.current === 'hora' ? '.dd-ag__hora[aria-pressed="true"]' : '.dd-ag__dia[aria-pressed="true"]')?.focus({ preventScroll: true })
    foco.current = null
    // La escena nueva puede dejar la cabecera del panel por encima de la barra fija: se sube a ella.
    const alto = document.querySelector<HTMLElement>('.dd-cab')?.offsetHeight ?? 0
    const top = panel.getBoundingClientRect().top
    if (top < alto + 8) window.scrollTo({ top: scrollY + top - alto - 16, behavior: 'smooth' })
  }, [paso])

  // La tira de semana se desliza hacia el lado al que se va.
  const idxPrevio = useRef(idx)
  useLayoutEffect(() => {
    const dir = idx - idxPrevio.current
    idxPrevio.current = idx
    const g = semanaRef.current
    if (!dir || !g) return
    const ctx = gsap.context(() => void gsap.from([...g.children], { x: dir * 22, opacity: 0, duration: 0.3, ease: EASE.out, stagger: 0.02, clearProps: 'transform,opacity' }), g)
    return () => ctx.revert()
  }, [idx])

  const cambiarSemana = (d: number) => {
    const n = idx + d
    if (n < 0 || n >= semanas.length) return
    setSemana(n)
  }
  const elegirDia = (c: Celda) => {
    if (!c.dia) return
    setSel(c.clave)
    setAnuncio(x.anuncioDia(diaLargo(c.fecha), x.horasLibres(c.dia.franjas.length)))
  }
  const elegirHora = (fr: Franja) => {
    ag.elegir()
    setFranja(fr)
    setOcupada(false)
    setFallo(null)
    setIntentado(false)
    if (dia) setAnuncio(x.anuncioHora(diaLargo(dia.fecha), horaDe(fr).vis))
    irA('datos')
  }
  const cambiarHora = () => {
    foco.current = 'hora'
    irA('elegir')
  }
  const otra = () => {
    setFranja(null)
    setResultado(null)
    setF((v) => ({ ...v, mensaje: '', consiente: false }))
    setIntentado(false)
    setFallo(null)
    foco.current = 'dia'
    irA('elegir')
  }
  const alFormulario = () => {
    document.getElementById('escribir')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    document.querySelector<HTMLElement>('#escribir input')?.focus({ preventScroll: true })
  }

  const errores = {
    nombre: f.nombre.trim().length < 2 ? x.errores.nombre : '',
    email: emailOk(f.email) ? '' : x.errores.email,
    consentimiento: f.consiente ? '' : x.errores.consentimiento,
  }
  const hayErrores = !!(errores.nombre || errores.email || errores.consentimiento)
  const ver = (k: keyof typeof errores) => (intentado ? errores[k] : '')
  const filaDe = (txt: string, error: string): EstadoFila => (error ? 'error' : txt ? 'ok' : 'vacio')
  const mensajeForm = intentado && hayErrores ? x.fallos.datos : fallo ? x.fallos[fallo] : ''

  const alEnviar = async (e: FormEvent) => {
    e.preventDefault()
    if (enviando || !franja) return
    setIntentado(true)
    if (hayErrores) {
      const primero = errores.nombre ? nombreRef : errores.email ? emailRef : consRef
      primero.current?.focus()
      return
    }
    setEnviando(true)
    setFallo(null)
    const r = await ag.reservar({
      inicio: franja.inicio,
      nombre: f.nombre.trim(),
      email: f.email.trim(),
      marca: f.marca.trim() || undefined,
      mensaje: f.mensaje.trim() || undefined,
      consentimiento: f.consiente,
      trampa: hp,
    })
    setEnviando(false)
    if (r.ok) {
      setResultado({ meet: urlOk(r.meet), email: f.email.trim() })
      irA('listo')
    } else if (r.fallo === 'ocupada') {
      // La API ya recargó los huecos: se vuelve a la lista con el aviso, y lo tecleado se conserva.
      setOcupada(true)
      setFranja(null)
      foco.current = 'dia'
      irA('elegir')
    } else setFallo(r.fallo)
  }

  const hora = franja ? horaDe(franja) : null
  const ruta: ItemRuta[] = [
    { k: 'dia', txt: dia ? diaCorto(dia.fecha) : x.ruta.dia, estado: 'hecho' },
    { k: 'hora', txt: franja && paso !== 'elegir' && hora ? hora.vis : x.ruta.hora, estado: paso === 'elegir' ? 'actual' : 'hecho' },
    { k: 'datos', txt: paso === 'listo' ? x.ruta.listo : x.ruta.datos, estado: paso === 'datos' ? 'actual' : paso === 'listo' ? 'hecho' : 'pendiente' },
  ]

  const tituloHoras = `${uid}-horas`

  return (
    <div ref={panelRef} className="dd-ag" data-paso={paso} aria-busy={estado === 'cargando'}>
      <Barra items={estado === 'listo' || paso !== 'elegir' ? ruta : rutaDeCarga(x)} rotulo={x.ruta.pasos} raiz={x.ruta.raiz} />
      <p className="dd-ag__vh" role="status">
        {estado === 'cargando' ? x.cargando : anuncio}
      </p>
      <div role="alert">
        {ocupada && paso === 'elegir' && (
          <p className="dd-ag__aviso dd-ag__aviso--panel">{x.fallos.ocupada}</p>
        )}
      </div>

      {estado === 'cargando' && <CuerpoEsqueleto />}

      {(estado === 'error' || (estado === 'vacio' && paso === 'elegir')) && (
        <Region rf={derRef} className="dd-ag__mensaje">
          <p data-ag="sube">{estado === 'error' ? x.errorCarga : x.sinHuecos}</p>
          <div data-ag="sube">
            {estado === 'error' ? (
              <button type="button" className="dd-boton dd-boton--chico" onClick={() => void ag.recargar()}>
                {x.reintentar}
              </button>
            ) : (
              <button type="button" className="dd-enlace dd-enlace--fuerte dd-ag__texto-boton" onClick={alFormulario}>
                {x.dejarMensaje}
              </button>
            )}
          </div>
        </Region>
      )}

      {(estado === 'listo' || paso !== 'elegir') && estado !== 'cargando' && (
        <div className="dd-ag__cuerpo">
          {paso === 'elegir' && dia && (
            <>
              <Region key="tira" rf={izqRef} className="dd-ag__izq">
                <div className="dd-ag__nav" data-ag="sube">
                  {semanas.length > 1 ? (
                    <button type="button" className="dd-ag__flecha" aria-label={x.semana.anterior} aria-disabled={idx === 0} onClick={() => cambiarSemana(-1)}>
                      <Chevron dir="izq" />
                    </button>
                  ) : (
                    <span />
                  )}
                  <p className="dd-ag__sem" role="status">
                    <span aria-hidden="true">{rango(semanas[idx][0].fecha, semanas[idx][6].fecha)}</span>
                    <span className="dd-ag__vh">
                      {x.semana.de(fecha(semanas[idx][0].fecha, { day: 'numeric', month: 'long' }), fecha(semanas[idx][6].fecha, { day: 'numeric', month: 'long' }))}
                    </span>
                  </p>
                  {semanas.length > 1 ? (
                    <button type="button" className="dd-ag__flecha" aria-label={x.semana.siguiente} aria-disabled={idx === semanas.length - 1} onClick={() => cambiarSemana(1)}>
                      <Chevron dir="der" />
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
                <div ref={semanaRef} className="dd-ag__semana" role="group" aria-label={x.dias} onKeyDown={flechas}>
                  {semanas[idx].map((c) => (
                    <button
                      key={c.clave}
                      type="button"
                      className="dd-ag__dia"
                      data-ag="celda"
                      disabled={!c.dia}
                      aria-pressed={c.dia ? dia.clave === c.clave : undefined}
                      aria-label={`${diaLargo(c.fecha)}, ${c.dia ? x.horasLibres(c.dia.franjas.length) : x.sinHoras}`}
                      onClick={() => elegirDia(c)}
                    >
                      <span className="dd-ag__dia-sem" aria-hidden="true">{fecha(c.fecha, { weekday: 'short' })}</span>
                      <span className="dd-ag__dia-num" aria-hidden="true">{c.fecha.getUTCDate()}</span>
                      <span className="dd-ag__dia-punto" aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <p className="dd-ag__meta dd-ag__meta--izq" data-ag="sube">
                  <span>{x.duracion(ag.duracion)}</span>
                  <span>{x.zona(ag.zona)}</span>
                </p>
              </Region>

              <Region key={`horas-${dia.clave}`} rf={derRef} className="dd-ag__der">
                <h3 id={tituloHoras} className="dd-ag__dia-t" data-ag="sube">{diaLargo(dia.fecha)}</h3>
                <p className="dd-ag__meta dd-ag__meta--cuenta" data-ag="sube">
                  <span>{x.horasLibres(dia.franjas.length)}</span>
                </p>
                <div className="dd-ag__horas" role="group" aria-label={x.horasDe(diaLargo(dia.fecha))} onKeyDown={flechas}>
                  {dia.franjas.map((fr) => {
                    const h = horaDe(fr)
                    return (
                      <button
                        key={fr.inicio}
                        type="button"
                        className="dd-ag__hora"
                        data-ag="hora"
                        aria-pressed={franja?.inicio === fr.inicio}
                        aria-label={h.maxTxt ? `${h.vis}, ${x.maxLargo(h.maxTxt, ag.zonaMax)}` : h.vis}
                        onClick={() => elegirHora(fr)}
                      >
                        <span className="dd-ag__hora-t">
                          <span>{h.vis}</span>
                          {h.maxTxt && <span className="dd-ag__hora-max">{x.max(h.maxTxt)}</span>}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </Region>
            </>
          )}

          {paso !== 'elegir' && franja && hora && (
            <Region key="ticket" rf={izqRef} className="dd-ag__izq">
              <div className="dd-ag__ticket">
                <p className="dd-ag__t-dia" data-ag="sube">
                  <time dateTime={franja.inicio}>{diaLargo(new Date(`${claveEn(franja.inicio, ag.zona)}T12:00:00Z`))}</time>
                </p>
                <p className="dd-ag__t-hora" data-ag="sube">
                  <time dateTime={franja.inicio}>{hora.vis}</time>
                </p>
                <p className="dd-ag__meta" data-ag="sube">
                  <span>{x.duracion(ag.duracion)}</span>
                  <span>{x.zona(ag.zona)}</span>
                  {hora.maxTxt && <span>{x.maxLargo(hora.maxTxt, ag.zonaMax)}</span>}
                </p>
                {paso === 'datos' && (
                  <div data-ag="sube">
                    <button type="button" className="dd-enlace dd-enlace--fuerte dd-ag__texto-boton" onClick={cambiarHora}>
                      {x.cambiar}
                    </button>
                  </div>
                )}
              </div>
            </Region>
          )}

          {paso === 'datos' && (
            <Region key="datos" rf={derRef} className="dd-ag__der">
              <form className="dd-ag__form" noValidate onSubmit={alEnviar} aria-label={x.datos}>
                <Campo id={`${uid}-nombre`} etiqueta={x.nombre} estado={filaDe(f.nombre.trim().length >= 2 ? 'x' : '', ver('nombre'))} error={ver('nombre')}>
                  <input
                    ref={nombreRef}
                    id={`${uid}-nombre`}
                    type="text"
                    name="nombre"
                    autoComplete="name"
                    required
                    aria-invalid={!!ver('nombre')}
                    aria-describedby={ver('nombre') ? `${uid}-nombre-e` : undefined}
                    value={f.nombre}
                    onChange={(e) => setF({ ...f, nombre: e.target.value })}
                  />
                </Campo>
                <Campo id={`${uid}-email`} etiqueta={x.email} estado={filaDe(emailOk(f.email) ? 'x' : '', ver('email'))} error={ver('email')}>
                  <input
                    ref={emailRef}
                    id={`${uid}-email`}
                    type="email"
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    aria-invalid={!!ver('email')}
                    aria-describedby={ver('email') ? `${uid}-email-e` : undefined}
                    value={f.email}
                    onChange={(e) => setF({ ...f, email: e.target.value })}
                  />
                </Campo>
                <Campo id={`${uid}-marca`} etiqueta={x.marca} estado={filaDe(f.marca.trim(), '')} error="">
                  <input id={`${uid}-marca`} type="text" name="marca" autoComplete="organization" placeholder={x.marcaEj} value={f.marca} onChange={(e) => setF({ ...f, marca: e.target.value })} />
                </Campo>
                <Campo id={`${uid}-mensaje`} etiqueta={x.mensaje} estado={filaDe(f.mensaje.trim(), '')} error="">
                  <textarea id={`${uid}-mensaje`} name="mensaje" rows={3} placeholder={x.mensajeEj} value={f.mensaje} onChange={(e) => setF({ ...f, mensaje: e.target.value })} />
                </Campo>

                <div className="dd-ag__fila dd-ag__fila--cons" data-ag="fila" data-estado={filaDe(f.consiente ? 'x' : '', ver('consentimiento'))}>
                  <label className="dd-ag__cons">
                    <input
                      ref={consRef}
                      type="checkbox"
                      className="dd-ag__chk"
                      name="consentimiento"
                      required
                      checked={f.consiente}
                      aria-invalid={!!ver('consentimiento')}
                      aria-describedby={ver('consentimiento') ? `${uid}-cons-e` : undefined}
                      onChange={(e) => setF({ ...f, consiente: e.target.checked })}
                    />
                    <span className="dd-ag__caja" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
                        <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>
                      {x.consentimiento}{' '}
                      <a className="dd-ag__enlace" href={PRIVACIDAD} target="_blank" rel="noopener noreferrer">
                        {x.aviso}
                        <span className="dd-ag__vh"> {x.nuevaPestana}</span>
                      </a>
                    </span>
                  </label>
                  {ver('consentimiento') && (
                    <p id={`${uid}-cons-e`} className="dd-ag__error dd-ag__error--cons">
                      {ver('consentimiento')}
                    </p>
                  )}
                </div>

                {/* Campo trampa: una persona no lo ve ni lo alcanza con el teclado; un bot lo rellena y la API lo descarta. */}
                <div className="dd-ag__hp" aria-hidden="true">
                  <input type="text" name="sitio_web_hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
                </div>

                <div className="dd-ag__envio" data-ag="sube">
                  <button type="submit" className="dd-boton dd-boton--grande" disabled={enviando} aria-busy={enviando}>
                    {enviando ? x.enviando : x.confirmar}
                  </button>
                  <div role="alert" aria-atomic="true">
                    {mensajeForm && <p className="dd-ag__aviso">{mensajeForm}</p>}
                  </div>
                </div>
              </form>
            </Region>
          )}

          {paso === 'listo' && resultado && (
            <Region key="listo" rf={derRef} className="dd-ag__der dd-ag__der--listo">
              <h3 ref={tituloRef} tabIndex={-1} className="dd-ag__listo-t" data-ag="sube">
                {x.listo}
                <span className="dd-dot" data-ag="cae" aria-hidden="true" />
              </h3>
              <p className="dd-ag__lede" data-ag="sube">{x.listoDetalle}</p>
              <dl className="dd-ag__datos">
                <div className="dd-ag__dato" data-ag="fila">
                  <dt>{x.filas.invitacion}</dt>
                  <dd>{resultado.email}</dd>
                </div>
                {resultado.meet && (
                  <div className="dd-ag__dato" data-ag="fila">
                    <dt>{x.filas.videollamada}</dt>
                    <dd>
                      <a className="dd-ag__enlace" href={resultado.meet} target="_blank" rel="noopener noreferrer">
                        {x.meet}
                        <span className="dd-ag__vh"> {x.nuevaPestana}</span>
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              <div data-ag="sube">
                <button type="button" className="dd-boton dd-boton--chico" onClick={otra}>
                  {x.otra}
                </button>
              </div>
            </Region>
          )}
        </div>
      )}
    </div>
  )
}

/** Monta la agenda solo cuando la sección se acerca a la vista (a 600 px) o enseguida si la URL trae #agenda: useAgenda mide
 *  booking_open al montarse y pide los huecos, y no debe hacerlo para quien nunca baja hasta aquí. Mientras tanto, un esqueleto con su altura. */
export function AgendaCarga() {
  const { hash } = useLocation()
  const x = useCopiaDD()
  const ref = useRef<HTMLDivElement>(null)
  const [montar, setMontar] = useState(() => hash === '#agenda')
  useEffect(() => {
    const el = ref.current
    if (montar || !el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setMontar(true)
        io.disconnect()
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [montar])
  return (
    <div ref={ref}>
      {montar ? (
        <Agenda />
      ) : (
        <div className="dd-ag" aria-hidden="true">
          <Barra items={rutaDeCarga(x)} rotulo={x.ruta.pasos} raiz={x.ruta.raiz} />
          <CuerpoEsqueleto />
        </div>
      )}
    </div>
  )
}
