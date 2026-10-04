import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { fmtDia, fmtHora, PRIVACIDAD, useAgenda, zonaVisitante, type Franja } from '../shared/agenda'
import { useCopiaPlato, type CopiaPlato } from './agendaCopy'
import { ID, usePlato } from './contexto'
import { gsap } from './motion'
import { Flecha, Rod } from './piezas'
import './agenda.css'

// Agenda de Plató: la «hoja de rodaje». Los días son fechas de rodaje en una tira de película, las horas son tomas, el paso de datos es
// la ficha de la toma y la confirmación una claqueta que se cierra. Datos y reservas salen de shared/agenda.useAgenda('plato').
// Movimiento: cada cambio de paso es un cambio de plano (la ventana en paralelogramo de la casa: sale barriendo hacia la derecha y el
// paso nuevo entra detrás), las tomas se encienden en cascada al elegir fecha y la claqueta cierra con un golpe. Todo termina en CSS o
// en un gsap.context que se revierte: la hoja quieta no pide fotogramas.

type Paso = 'elegir' | 'ficha' | 'listo'
interface Elegida extends Franja { fecha: Date }

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SALE_0 = 'polygon(0% 0%, 100% 0%, 100% 100%, -24% 100%)'
const SALE_1 = 'polygon(124% 0%, 100% 0%, 100% 100%, 100% 100%)'
const ENTRA_0 = 'polygon(0% 0%, 0% 0%, -24% 100%, 0% 100%)'
const ENTRA_1 = 'polygon(0% 0%, 124% 0%, 100% 100%, 0% 100%)'

const claveDe = (iso: string, zona: string) => new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
/** «10:00 a. m.» → ['10:00', 'a. m.'] (en japonés no hay sufijo). */
const partes = (txt: string): [string, string] => {
  const m = txt.match(/^(\d{1,2}:\d{2})\s*(.*)$/)
  return m ? [m[1], m[2]] : [txt, '']
}
const nombreZona = (z: string) => z.replace(/_/g, ' ')
const cap = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1)
const https = (u: string) => { try { const url = new URL(u); return url.protocol === 'https:' ? url.href : '' } catch { return '' } }

/** Flechas, Inicio y Fin mueven el foco dentro de un grupo de botones (arriba y abajo saltan de fila en la rejilla de tomas). */
function moverFoco(grupo: HTMLElement, e: KeyboardEvent<HTMLElement>) {
  const k = e.key
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(k)) return
  const bs = Array.from(grupo.querySelectorAll<HTMLButtonElement>('button'))
  const i = bs.indexOf(document.activeElement as HTMLButtonElement)
  if (i < 0) return
  let a: HTMLButtonElement | undefined
  if (k === 'Home') a = bs[0]
  else if (k === 'End') a = bs[bs.length - 1]
  else if (k === 'ArrowRight') a = bs[i + 1]
  else if (k === 'ArrowLeft') a = bs[i - 1]
  else {
    const r = bs[i].getBoundingClientRect()
    const abajo = k === 'ArrowDown'
    const otras = bs.filter((b) => { const t = b.getBoundingClientRect().top; return abajo ? t > r.top + 6 : t < r.top - 6 })
    if (otras.length) {
      const tops = otras.map((b) => b.getBoundingClientRect().top)
      const fila = abajo ? Math.min(...tops) : Math.max(...tops)
      const x = r.left + r.width / 2
      const cerca = (b: HTMLElement) => { const q = b.getBoundingClientRect(); return Math.abs(q.left + q.width / 2 - x) }
      a = otras.filter((b) => Math.abs(b.getBoundingClientRect().top - fila) < 6).reduce((p, b) => (cerca(b) < cerca(p) ? b : p))
    }
  }
  if (a) { e.preventDefault(); a.focus() }
}

export default function Agenda({ onEscribir }: { onEscribir: () => void }) {
  const t = useCopiaPlato()
  const { c } = usePlato()
  const { hash, key } = useLocation()
  const seccion = useRef<HTMLElement>(null)
  const [montada, setMontada] = useState(() => typeof location !== 'undefined' && location.hash === '#agenda')
  const [duracion, setDuracion] = useState<number | null>(null)
  const idTitulo = useId()
  const llegada = useRef(key)

  // El calendario no se monta (ni pide la agenda, ni mide booking_open) hasta que la sección se acerca a la vista o la URL trae #agenda.
  useEffect(() => {
    if (montada || !seccion.current) return
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setMontada(true); io.disconnect() } }, { rootMargin: '600px 0px' })
    io.observe(seccion.current)
    return () => io.disconnect()
  }, [montada])
  // Un enlace a #agenda estando ya en Contacto: monta y lleva el calendario a la ventana (la llegada desde otra vista ya la lleva useVista).
  useEffect(() => {
    if (hash !== '#agenda') return
    setMontada(true)
    if (llegada.current === key) return
    llegada.current = key
    const id = window.setTimeout(() => seccion.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 80)
    return () => clearTimeout(id)
  }, [hash, key])

  return (
    <section id="agenda" ref={seccion} className="pl-ag" aria-labelledby={idTitulo}>
      <div className="pl-ag-cab" data-pl="subir">
        <div className="pl-ag-tit">
          <p className="pl-mono pl-kicker">{t.kicker}</p>
          <h2 id={idTitulo}>{t.titulo}</h2>
        </div>
        <dl className="pl-ag-datos">
          <div><dt className="pl-mono">{t.dirigeK}</dt><dd>{c.inicio.nombre}</dd></div>
          <div><dt className="pl-mono">{t.duracionK}</dt><dd>{duracion ? t.min(duracion) : '–'}</dd></div>
          <div><dt className="pl-mono">{t.lugarK}</dt><dd>{t.lugarV}</dd></div>
          <div><dt className="pl-mono">{t.zonaK}</dt><dd>{nombreZona(zonaVisitante())}</dd></div>
        </dl>
      </div>
      {montada ? <Hoja t={t} onDuracion={setDuracion} onEscribir={onEscribir} /> : <div className="pl-ag-cuerpo"><Esqueleto t={t} /></div>}
    </section>
  )
}

/** El hueco de la hoja mientras no hay datos: la misma estructura (etiquetas, tira y tomas) con las mismas medidas, quieta y sin brillo que se mueva. */
function Esqueleto({ t }: { t: CopiaPlato }) {
  return (
    <div className="pl-ag-esq" role="status" aria-busy="true" data-max={zonaVisitante() !== 'America/Bogota' || undefined}>
      <div className="pl-ag-bloque" aria-hidden="true">
        <div className="pl-ag-bloque-cab"><p className="pl-mono pl-ag-etq">{t.fechaK}</p></div>
        <div className="pl-ag-tira"><div className="pl-ag-tira-in">{Array.from({ length: 8 }, (_, i) => <i key={i} className="pl-ag-esq-dia" />)}</div></div>
      </div>
      <div className="pl-ag-bloque" aria-hidden="true">
        <div className="pl-ag-bloque-cab pl-ag-bloque-cab--toma"><p className="pl-mono pl-ag-etq">{t.tomaK}</p><p className="pl-ag-dia-largo">&nbsp;</p></div>
        <div className="pl-ag-tomas">{Array.from({ length: 18 }, (_, i) => <i key={i} className="pl-ag-esq-toma" />)}</div>
        <p className="pl-mono pl-ag-leyenda">{t.cargando}</p>
      </div>
    </div>
  )
}

function Hoja({ t, onDuracion, onEscribir }: { t: CopiaPlato; onDuracion: (m: number) => void; onEscribir: () => void }) {
  const { locale } = useLanguage()
  const { c } = usePlato()
  const { estado, dias, duracion, zona, zonaMax, recargar, reservar, elegir } = useAgenda(ID)
  const [paso, setPaso] = useState<Paso>('elegir')
  const [diaSel, setDiaSel] = useState<string | null>(null)
  const [elegida, setElegida] = useState<Elegida | null>(null)
  const [aviso, setAviso] = useState('')
  const [anuncio, setAnuncio] = useState('')
  const [campos, setCampos] = useState({ nombre: '', email: '', marca: '', mensaje: '', trampa: '' })
  const [consent, setConsent] = useState(false)
  const [errores, setErrores] = useState<{ nombre?: string; email?: string; consent?: string }>({})
  const [fallo, setFallo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [meet, setMeet] = useState('')
  const [bordes, setBordes] = useState({ ini: false, fin: false })
  const raiz = useRef<HTMLDivElement>(null)
  const pasoEl = useRef<HTMLDivElement>(null)
  const tira = useRef<HTMLDivElement>(null)
  const nombreRef = useRef<HTMLInputElement>(null)
  const tituloListo = useRef<HTMLHeadingElement>(null)
  const ctx = useRef<gsap.Context | null>(null)
  const cambiando = useRef(false)
  const previo = useRef<Paso>('elegir')
  const seguro = useRef<gsap.core.Tween | null>(null)
  const idFecha = useId()
  const idToma = useId()
  const idDia = useId()
  const idFicha = useId()
  const idErrNombre = useId()
  const idErrEmail = useId()
  const idErrConsent = useId()

  const dia = useMemo(() => dias.find((d) => d.clave === diaSel) ?? dias[0] ?? null, [dias, diaSel])
  const tomas = useMemo(
    () => (dia?.franjas ?? []).map((f) => {
      const propia = fmtHora(f.inicio, locale, zona)
      const deMax = fmtHora(f.inicio, locale, zonaMax)
      const [hm, ap] = partes(propia)
      return { f, hm, ap, max: deMax !== propia ? deMax : '' }
    }),
    [dia, locale, zona, zonaMax],
  )
  const hayMax = tomas.some((x) => x.max)

  /** Hora y día de una toma en la zona del visitante y, si difiere, la de Max (con su día cuando cambia). */
  const describir = (e: Elegida) => {
    const propia = fmtHora(e.inicio, locale, zona)
    const [hm, ap] = partes(propia)
    const deMax = fmtHora(e.inicio, locale, zonaMax)
    const claveMax = claveDe(e.inicio, zonaMax)
    const otroDia = claveMax !== claveDe(e.inicio, zona) ? fmtDia(new Date(`${claveMax}T12:00:00Z`), locale, { weekday: 'short', day: 'numeric', month: 'short' }) : ''
    return { hm, ap, dia: cap(fmtDia(e.fecha, locale)), corto: fmtDia(e.fecha, locale, { day: '2-digit', month: 'short' }), max: deMax !== propia || otroDia ? `${otroDia ? `${otroDia}, ` : ''}${deMax} · ${nombreZona(zonaMax)}` : '' }
  }

  useEffect(() => { if (estado === 'listo') onDuracion(duracion) }, [estado, duracion, onDuracion])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (estado === 'cargando') setAnuncio(t.cargando); else if (estado === 'listo') setAnuncio(t.fechasLibres(dias.length)) }, [estado])

  // Un único contexto de GSAP para los cambios de paso: se revierte al desmontar.
  useLayoutEffect(() => {
    ctx.current = gsap.context(() => {}, raiz)
    return () => { ctx.current?.revert(); ctx.current = null }
  }, [])

  /** Cambio de plano: el paso actual sale barrido hacia la derecha (0,3 s) y, ya cambiado, el nuevo entra detrás (efecto de abajo). */
  const irA = useCallback((p: Paso) => {
    const el = pasoEl.current
    const c = ctx.current
    if (!el || !c) { setPaso(p); return }
    if (cambiando.current) return
    cambiando.current = true
    c.add(() => {
      gsap.fromTo(el, { clipPath: SALE_0 }, { clipPath: SALE_1, duration: 0.3, ease: 'pl-rod', onComplete: () => setPaso(p) })
      seguro.current?.kill()
      seguro.current = gsap.delayedCall(1.8, () => { cambiando.current = false }) // red de seguridad: un cambio nunca deja la hoja bloqueada
    })
  }, [])

  useLayoutEffect(() => {
    if (previo.current === paso) return
    previo.current = paso
    const el = pasoEl.current
    const c = ctx.current
    if (!el || !c) { cambiando.current = false; return }
    c.add(() => {
      gsap.fromTo(el, { clipPath: ENTRA_0 }, { clipPath: ENTRA_1, duration: 0.72, ease: 'pl', clearProps: 'clipPath', onComplete: () => { cambiando.current = false; seguro.current?.kill() } })
      gsap.from(el.querySelectorAll('[data-ag-in]'), { opacity: 0, y: 18, duration: 0.6, ease: 'pl', stagger: 0.045, delay: 0.1, clearProps: 'opacity,transform' })
    })
    // El foco acompaña al paso: primer campo en la ficha, el título en la claqueta, la toma elegida al volver.
    const destino = paso === 'ficha' ? nombreRef.current : paso === 'listo' ? tituloListo.current : (raiz.current?.querySelector<HTMLElement>('.pl-ag-toma[aria-pressed="true"]') ?? raiz.current?.querySelector<HTMLElement>('.pl-ag-dia[aria-pressed="true"]') ?? null)
    destino?.focus({ preventScroll: true })
    // QA final: en móvil la ficha de la toma empuja el campo bajo el pliegue (o la lista larga deja la hoja más abajo): el foco nunca queda fuera de pantalla.
    const rd = destino?.getBoundingClientRect()
    const sec = raiz.current?.closest<HTMLElement>('.pl-ag')
    if (destino && rd) { if (rd.top < window.innerHeight * 0.18 || rd.bottom > window.innerHeight * 0.82) destino.scrollIntoView({ block: 'center', behavior: 'smooth' }) }
    else if (sec) { const r = sec.getBoundingClientRect(); if (r.top < 70) window.scrollTo({ top: window.scrollY + r.top - 100, behavior: 'smooth' }) }
  }, [paso])

  // Flechas de la tira de fechas: solo existen mientras haya fechas fuera de la vista; el estado solo se escribe si cambia.
  const medir = useCallback(() => {
    const el = tira.current
    if (!el) return
    const ini = el.scrollLeft > 4
    const fin = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    setBordes((b) => (b.ini === ini && b.fin === fin ? b : { ini, fin }))
  }, [])
  useLayoutEffect(() => {
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [medir, paso, dias.length])
  const mover = (dir: 1 | -1) => tira.current?.scrollBy({ left: dir * tira.current.clientWidth * 0.8, behavior: 'smooth' })
  const centrar = (b: HTMLElement) => {
    const el = tira.current
    if (el) el.scrollTo({ left: Math.max(0, b.offsetLeft - (el.clientWidth - b.offsetWidth) / 2), behavior: 'smooth' })
  }

  const pickDia = (d: NonNullable<typeof dia>) => {
    setDiaSel(d.clave)
    setAnuncio(`${fmtDia(d.fecha, locale)}: ${t.libres(d.franjas.length)}`)
  }
  const pickToma = (f: Franja) => {
    if (!dia) return
    elegir()
    setElegida({ ...f, fecha: dia.fecha })
    setFallo('')
    setErrores({})
    irA('ficha')
  }
  const cambiarHora = () => { setFallo(''); irA('elegir') }
  const otra = () => {
    setElegida(null); setMeet(''); setConsent(false); setAviso(''); setErrores({}); setFallo('')
    setCampos((c) => ({ ...c, mensaje: '' }))
    irA('elegir')
  }

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (enviando || !elegida) return
    const form = e.currentTarget
    const nuevos: typeof errores = {}
    if (campos.nombre.trim().length < 2) nuevos.nombre = t.errores.nombre
    if (!CORREO_OK.test(campos.email.trim())) nuevos.email = t.errores.email
    if (!consent) nuevos.consent = t.errores.consent
    setErrores(nuevos)
    setFallo('')
    const primero = nuevos.nombre ? 'nombre' : nuevos.email ? 'email' : nuevos.consent ? 'consent' : ''
    if (primero) { form.querySelector<HTMLElement>(`[name=${primero}]`)?.focus(); return }
    setEnviando(true)
    const r = await reservar({
      inicio: elegida.inicio, nombre: campos.nombre.trim(), email: campos.email.trim(), marca: campos.marca.trim() || undefined,
      mensaje: campos.mensaje.trim() || undefined, consentimiento: consent, trampa: campos.trampa,
    })
    setEnviando(false)
    if (r.ok) {
      setMeet(r.meet ?? '')
      const d = describir(elegida)
      setAnuncio(`${t.listoK}. ${d.dia}, ${d.hm} ${d.ap}`.trim())
      irA('listo')
    } else if (r.fallo === 'ocupada') {
      // La API ya recargó los huecos: la toma que acaban de tomar no vuelve a aparecer.
      setAviso(t.fallos.ocupada)
      setElegida(null)
      irA('elegir')
    } else setFallo(t.fallos[r.fallo])
  }

  const campo = (k: 'nombre' | 'email' | 'marca' | 'mensaje') => (ev: { target: { value: string } }) => {
    const valor = ev.target.value
    setCampos((c) => ({ ...c, [k]: valor }))
    if (k === 'nombre' || k === 'email') setErrores((x) => (x[k] ? { ...x, [k]: undefined } : x))
  }

  const cuando = elegida ? describir(elegida) : null
  const meetUrl = https(meet)

  return (
    <div className="pl-ag-cuerpo" ref={raiz} aria-busy={estado === 'cargando'}>
      <p className="pl-sr" role="status" aria-live="polite">{anuncio}</p>
      <div className="pl-ag-paso" ref={pasoEl} data-paso={paso}>
        {paso === 'elegir' && (
          estado === 'error' || estado === 'vacio' ? (
            <div className="pl-ag-msj" role={estado === 'error' ? 'alert' : 'status'}>
              <p>{estado === 'error' ? t.errorCarga : t.sinHuecos}</p>
              <div className="pl-ag-msj-acc">
                {estado === 'error' && <button type="button" className="pl-pil pl-pil--clara pl-pil--grande" onClick={() => void recargar()}><Rod>{t.reintentar}</Rod></button>}
                <button type="button" className="pl-pil pl-pil--linea pl-pil--grande" onClick={onEscribir}><Rod>{t.escribir}</Rod></button>
              </div>
            </div>
          ) : !dia ? (
            <Esqueleto t={t} />
          ) : (
            <>
              {aviso && <p className="pl-ag-aviso" role="alert" data-ag-in>{aviso}</p>}
              <div className="pl-ag-bloque" data-ag-in>
                <div className="pl-ag-bloque-cab">
                  <p className="pl-mono pl-ag-etq" id={idFecha}>{t.fechaK}</p>
                  {(bordes.ini || bordes.fin) && (
                    <div className="pl-ag-flechas">
                      <button type="button" className="pl-ag-flecha" onClick={() => mover(-1)} disabled={!bordes.ini} aria-label={t.prev}><Flecha izq /></button>
                      <button type="button" className="pl-ag-flecha" onClick={() => mover(1)} disabled={!bordes.fin} aria-label={t.next}><Flecha /></button>
                    </div>
                  )}
                </div>
                <div className="pl-ag-tira" ref={tira} onScroll={medir} data-ini={bordes.ini || undefined} data-fin={bordes.fin || undefined}>
                  <div className="pl-ag-tira-in" role="group" aria-labelledby={idFecha} onKeyDown={(e) => moverFoco(e.currentTarget, e)}>
                    {dias.map((d, i) => (
                      <button
                        key={d.clave} type="button" className="pl-ag-dia" aria-pressed={d.clave === dia.clave} style={{ '--i': i } as CSSProperties}
                        aria-label={`${fmtDia(d.fecha, locale)}, ${t.libres(d.franjas.length)}`}
                        onClick={(e) => { pickDia(d); centrar(e.currentTarget) }}
                      >
                        <span className="pl-mono pl-ag-dia-s" aria-hidden="true">{fmtDia(d.fecha, locale, { weekday: 'short' })}</span>
                        <span className="pl-ag-dia-n" aria-hidden="true">{d.fecha.getUTCDate()}</span>
                        <span className="pl-mono pl-ag-dia-m" aria-hidden="true">{fmtDia(d.fecha, locale, { month: 'short' })}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pl-ag-bloque" data-ag-in>
                <div className="pl-ag-bloque-cab pl-ag-bloque-cab--toma">
                  <p className="pl-mono pl-ag-etq" id={idToma}>{t.tomaK}</p>
                  <p className="pl-ag-dia-largo" id={idDia}>{cap(fmtDia(dia.fecha, locale))}</p>
                </div>
                <div className="pl-ag-tomas" key={dia.clave} role="group" aria-labelledby={`${idToma} ${idDia}`} onKeyDown={(e) => moverFoco(e.currentTarget, e)}>
                  {tomas.map(({ f, hm, ap, max }, i) => (
                    <button
                      key={f.inicio} type="button" className="pl-ag-toma" aria-pressed={elegida?.inicio === f.inicio} style={{ '--i': i } as CSSProperties}
                      aria-label={`${t.toma} ${hm} ${ap}${max ? `, ${t.horaMaxCorta} ${max}` : ''}`.replace(/\s+/g, ' ')}
                      onClick={() => pickToma(f)}
                    >
                      <span className="pl-mono pl-ag-toma-k" aria-hidden="true"><span>{t.toma}</span><span>{ap}</span></span>
                      <span className="pl-ag-toma-h" aria-hidden="true">{hm}</span>
                      {hayMax && <span className="pl-ag-toma-max" aria-hidden="true">{max ? `(${max})` : ''}</span>}
                    </button>
                  ))}
                </div>
                <p className="pl-mono pl-ag-leyenda">{t.zona(nombreZona(zona))}{hayMax ? ` · ${t.maxLeyenda(nombreZona(zonaMax))}` : ''}</p>
              </div>
            </>
          )
        )}

        {paso === 'ficha' && elegida && cuando && (
          <form className="pl-ag-ficha" onSubmit={enviar} noValidate aria-labelledby={idFicha}>
            <div className="pl-ag-resumen" data-ag-in>
              <h3 className="pl-mono pl-ag-etq" id={idFicha}>{t.fichaK}</h3>
              <p className="pl-ag-resumen-h" aria-label={`${cuando.hm} ${cuando.ap}`.trim()}>{cuando.hm}<small className="pl-mono">{cuando.ap}</small></p>
              <p className="pl-ag-resumen-d">{cuando.dia}</p>
              <dl className="pl-ag-resumen-l">
                <div><dt className="pl-mono">{t.duracionK}</dt><dd>{t.min(duracion)}</dd></div>
                <div><dt className="pl-mono">{t.lugarK}</dt><dd>{t.lugarV}</dd></div>
                <div><dt className="pl-mono">{t.zonaK}</dt><dd>{nombreZona(zona)}</dd></div>
                {cuando.max && <div><dt className="pl-mono">{t.horaMaxK}</dt><dd>{cuando.max}</dd></div>}
              </dl>
              <button type="button" className="pl-ag-volver" onClick={cambiarHora}><Flecha izq />{t.cambiar}</button>
            </div>
            <div className="pl-ag-campos">
              <div className="pl-campo" data-ag-in>
                <label>
                  <span className="pl-mono">{t.nombreL}</span>
                  <input ref={nombreRef} name="nombre" type="text" autoComplete="name" value={campos.nombre} onChange={campo('nombre')} aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? idErrNombre : undefined} aria-required="true" />
                </label>
                {errores.nombre && <em id={idErrNombre} role="alert">{errores.nombre}</em>}
              </div>
              <div className="pl-campo" data-ag-in>
                <label>
                  <span className="pl-mono">{t.emailL}</span>
                  <input name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} placeholder={t.emailEj} value={campos.email} onChange={campo('email')} aria-invalid={!!errores.email} aria-describedby={errores.email ? idErrEmail : undefined} aria-required="true" />
                </label>
                {errores.email && <em id={idErrEmail} role="alert">{errores.email}</em>}
              </div>
              <div className="pl-campo pl-ag-ancho" data-ag-in>
                <label>
                  <span className="pl-mono">{t.marcaL}</span>
                  <input name="marca" type="text" autoComplete="organization" placeholder={t.marcaEj} value={campos.marca} onChange={campo('marca')} />
                </label>
              </div>
              <div className="pl-campo pl-ag-ancho" data-ag-in>
                <label>
                  <span className="pl-mono">{t.mensajeL}</span>
                  <textarea name="mensaje" rows={3} value={campos.mensaje} onChange={campo('mensaje')} />
                </label>
              </div>
              <div className="pl-ag-consent pl-ag-ancho" data-ag-in>
                <label className="pl-ag-chk">
                  <input
                    type="checkbox" name="consent" checked={consent} aria-invalid={!!errores.consent} aria-describedby={errores.consent ? idErrConsent : undefined} aria-required="true"
                    onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setErrores((x) => ({ ...x, consent: undefined })) }}
                  />
                  <span className="pl-ag-chk-caja" aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14"><path d="m3 8.5 3.2 3.2L13 4.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                  <span className="pl-ag-chk-txt">{t.consentimiento} <a href={PRIVACIDAD} target="_blank" rel="noopener noreferrer">{t.aviso}</a></span>
                </label>
                {errores.consent && <em id={idErrConsent} className="pl-ag-err" role="alert">{errores.consent}</em>}
              </div>
              {/* Trampa para bots: una persona nunca la ve ni la toca; si llega con texto, la API descarta la reserva. */}
              <input type="text" name="sitio_web_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pl-ag-hp" value={campos.trampa} onChange={(e) => setCampos((c) => ({ ...c, trampa: e.target.value }))} />
              <div className="pl-ag-envio pl-ag-ancho" data-ag-in>
                {fallo && <p className="pl-error" role="alert">{fallo}</p>}
                <button type="submit" className="pl-pil pl-pil--tung pl-pil--grande pl-enviar" aria-busy={enviando} aria-disabled={enviando}>
                  <Rod>{enviando ? t.enviando : t.confirmar}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span>
                </button>
              </div>
            </div>
          </form>
        )}

        {paso === 'listo' && elegida && cuando && (
          <div className="pl-ag-listo">
            <Claqueta k={t.claqueta} dirige={c.inicio.nombre.split(' ')[0]} fecha={cuando.corto} toma={`${cuando.hm}${cuando.ap ? ` ${cuando.ap}` : ''}`} />
            <div className="pl-ag-listo-txt">
              <h3 ref={tituloListo} tabIndex={-1} data-ag-in>{t.listoK}</h3>
              <p className="pl-ag-listo-cuando" data-ag-in>
                {cuando.dia} <span className="pl-ag-listo-hora">{cuando.hm}{cuando.ap && <small className="pl-mono">{cuando.ap}</small>}</span>
              </p>
              <p className="pl-ag-listo-zona pl-mono" data-ag-in>{nombreZona(zona)}{cuando.max ? ` · ${t.horaMaxK}: ${cuando.max}` : ''}</p>
              <p className="pl-ag-listo-det" data-ag-in>{t.listoDetalle}</p>
              <div className="pl-ag-listo-acc" data-ag-in>
                {meetUrl && (
                  <a className="pl-pil pl-pil--tung pl-pil--grande" href={meetUrl} target="_blank" rel="noopener noreferrer">
                    <Rod>{t.meetAbrir}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span>
                  </a>
                )}
                <button type="button" className="pl-pil pl-pil--linea pl-pil--grande" onClick={otra}><Rod>{t.otra}</Rod></button>
              </div>
              {meetUrl && <p className="pl-ag-listo-meet pl-mono" data-ag-in>{t.meet}: <a href={meetUrl} target="_blank" rel="noopener noreferrer">{meetUrl.replace(/^https:\/\//, '')}</a></p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** La claqueta: el brazo baja y golpea, el filo de tungsteno se enciende en el golpe. Decorativa; los datos están en el texto de al lado. */
function Claqueta({ k, dirige, fecha, toma }: { k: { dirige: string; fecha: string; toma: string }; dirige: string; fecha: string; toma: string }) {
  return (
    <div className="pl-ag-clap" aria-hidden="true">
      <div className="pl-ag-clap-brazo" />
      <span className="pl-ag-clap-filo" />
      <div className="pl-ag-clap-cuerpo">
        <p><span>{k.dirige}</span><b>{dirige}</b></p>
        <p><span>{k.fecha}</span><b>{fecha}</b></p>
        <p><span>{k.toma}</span><b>{toma}</b></p>
      </div>
    </div>
  )
}
