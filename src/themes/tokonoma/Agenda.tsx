import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { PRIVACIDAD, fmtDia, fmtHora, useAgenda, useCopiaAgenda, type Dia, type Fallo, type Franja } from '../shared/agenda'
import { useTextosAgenda } from './agendaCopy'
import { useCopy } from './copy'
import { gsap } from './motion'
import { ID, Pares, Sello } from './piezas'
import './agenda.css'

// El calendario de Tokonoma. Una cartela que se completa: días en una fila ordenada como una regla, horas como sellos (hanko) que
// se estampan al elegirlas, los datos en el lenguaje del formulario de la casa y la confirmación como la etiqueta de un museo.
// Solo fundidos cortos; el único gesto con peso es el sello. Nada se mueve en reposo: toda la coreografía es de un solo disparo
// (gsap.context, revertida al desmontar) y los desplazamientos de la fila de días los hace el navegador.

const BCP: Record<Locale, string> = { es: 'es-CO', en: 'en-US', ja: 'ja-JP' }
const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Paso = 'elegir' | 'datos' | 'hecho'
interface Datos { nombre: string; email: string; marca: string; mensaje: string; acepto: boolean }
interface Errores { nombre?: string; email?: string; acepto?: string }
interface Hecho { dia: string; hora: string; max: string | null; email: string; meet?: string }

const claveDe = (iso: string, zona: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
const diaLargo = (iso: string, zona: string, locale: Locale) =>
  new Intl.DateTimeFormat(BCP[locale], { timeZone: zona, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso))

/** La hora de Max para una franja, solo si difiere de la del visitante (si cae otro día, con su día corto). */
function horaDeMax(iso: string, locale: Locale, zona: string, zonaMax: string): string | null {
  const mia = fmtHora(iso, locale, zona)
  const suya = fmtHora(iso, locale, zonaMax)
  if (claveDe(iso, zona) === claveDe(iso, zonaMax)) return mia === suya ? null : suya
  const dia = new Intl.DateTimeFormat(BCP[locale], { timeZone: zonaMax, weekday: 'short' }).format(new Date(iso))
  return `${dia} ${suya}`
}

/** «hora de Colombia» / «Colombia Time»: el nombre de la zona de Max en el idioma activo (si el navegador no lo sabe, el identificador). */
function nombreZona(zona: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(BCP[locale], { timeZone: zona, timeZoneName: 'longGeneric' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value ?? zona
  } catch {
    return zona
  }
}

/** Flechas de un grupo de botones: mueven el foco entre hermanos (los botones siguen siendo accesibles con Tab). */
function teclas(e: KeyboardEvent<HTMLElement>) {
  const sig = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
  if (!sig && e.key !== 'Home' && e.key !== 'End') return
  const botones = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'))
  const i = botones.indexOf(document.activeElement as HTMLButtonElement)
  if (i < 0) return
  e.preventDefault()
  const destino = e.key === 'Home' ? 0 : e.key === 'End' ? botones.length - 1 : Math.min(botones.length - 1, Math.max(0, i + (sig ?? 0)))
  botones[destino]?.focus()
}

const Flecha = ({ dir }: { dir: 1 | -1 }) => (
  <svg viewBox="0 0 8 15" width="8" height="15" aria-hidden="true">
    <path d={dir < 0 ? 'M7 1 1.5 7.5 7 14' : 'M1 1l5.5 6.5L1 14'} fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
)

/** La sección #agenda: su estructura es estática; el calendario vivo (que mide booking_open y pide los huecos) se monta cuando se acerca. */
export default function Agenda() {
  const { hash } = useLocation()
  const copia = useCopiaAgenda()
  const ref = useRef<HTMLElement>(null)
  const [montar, setMontar] = useState(() => hash === '#agenda')

  useEffect(() => {
    if (montar) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([en]) => en?.isIntersecting && setMontar(true), { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [montar])

  // Llegar con #agenda (los CTA de la portada) lleva el scroll al calendario, ya con la vista en su sitio.
  useEffect(() => {
    if (hash !== '#agenda') return
    setMontar(true)
    ref.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [hash])

  return (
    <section id="agenda" ref={ref} className="tk-agenda tk-fr tk-12" aria-labelledby="tk-ag-t">
      <h2 id="tk-ag-t" className="tk-h2 tk-ag-t" data-tk="titulo">{copia.titulo}</h2>
      <div className="tk-ag-caja" data-tk="sube" data-tk-r="0.1">
        {montar ? <AgendaViva /> : <Esqueleto />}
      </div>
    </section>
  )
}

/** El esqueleto tiene la geometría del calendario (mismas filas, mismos huecos) y no se mueve: papel quieto hasta que llegan los huecos. */
function Esqueleto() {
  return (
    <div className="tk-ag-esq" aria-hidden="true">
      <div className="tk-ag-esq-datos"><i /><i /></div>
      <div className="tk-ag-bloque">
        <div className="tk-ag-et" />
        <div className="tk-ag-esq-dias">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div>
      </div>
      <div className="tk-ag-bloque">
        <div className="tk-ag-et" />
        <div className="tk-ag-horas">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</div>
      </div>
    </div>
  )
}

function AgendaViva() {
  const { locale } = useLanguage()
  const c = useCopy()
  const copia = useCopiaAgenda()
  const t = useTextosAgenda()
  const { estado, dias, duracion, zona, zonaMax, recargar, reservar, elegir } = useAgenda(ID)

  const [claveSel, setClaveSel] = useState<string | null>(null)
  const [slot, setSlot] = useState<Franja | null>(null)
  const [paso, setPaso] = useState<Paso>('elegir')
  const [datos, setDatos] = useState<Datos>({ nombre: '', email: '', marca: '', mensaje: '', acepto: false })
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<Fallo | null>(null)
  const [hecho, setHecho] = useState<Hecho | null>(null)
  const [antes, setAntes] = useState(false)
  const [despues, setDespues] = useState(false)

  const raiz = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const franja = useRef<HTMLDivElement>(null)
  const horas = useRef<HTMLDivElement>(null)
  const formulario = useRef<HTMLFormElement>(null)
  const titulo = useRef<HTMLHeadingElement>(null)
  const ocupado = useRef(false)
  const enfocarDia = useRef(false)
  const ctx = useRef<gsap.Context | null>(null)
  const id = useId()

  // Toda la coreografía vive en un contexto: al desmontar se revierte y no queda ni un tween vivo.
  useLayoutEffect(() => {
    ctx.current = gsap.context(() => undefined, raiz)
    return () => ctx.current?.revert()
  }, [])
  const mover = (f: () => void) => (ctx.current ? ctx.current.add(f) : f())

  const dia: Dia | null = useMemo(() => dias.find((d) => d.clave === claveSel) ?? dias[0] ?? null, [dias, claveSel])
  const vista: 'cargando' | 'error' | 'vacio' | 'elegir' | 'datos' | 'hecho' =
    paso === 'hecho' ? 'hecho' : paso === 'datos' && slot ? 'datos' : estado === 'listo' ? (dia ? 'elegir' : 'vacio') : estado
  const diaTexto = dia ? fmtDia(dia.fecha, locale) : ''
  const nombreMax = useMemo(() => nombreZona(zonaMax, locale), [zonaMax, locale])
  const zonaTexto = zona.replace(/_/g, ' ')
  const hayOtraZona = !!dia && dia.franjas.some((f) => horaDeMax(f.inicio, locale, zona, zonaMax))

  /** Entra la vista nueva: un fundido corto. La primera (el esqueleto) no se anima; el foco sigue al paso. */
  const primera = useRef(true)
  useLayoutEffect(() => {
    if (primera.current) { primera.current = false; return }
    const el = panel.current
    if (!el) return
    mover(() => {
      gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7, ease: 'tk-expo', clearProps: 'opacity,transform' })
      if (vista === 'datos') {
        const s = el.querySelector('.tk-sello')
        if (s) gsap.fromTo(s, { opacity: 0, scale: 1.5, rotate: -12 }, { opacity: 1, scale: 1, rotate: -3, duration: 0.55, ease: 'tk-asienta', delay: 0.12, clearProps: 'opacity,transform' })
      }
      if (vista === 'hecho') {
        const s = el.querySelector('.tk-sello')
        if (s) gsap.fromTo(s, { opacity: 0, scale: 1.6, rotate: -14 }, { opacity: 1, scale: 1, rotate: -3, duration: 0.6, ease: 'tk-asienta', delay: 0.35, clearProps: 'opacity,transform' })
      }
    })
    let foco: HTMLElement | null = null
    if (vista === 'datos') foco = formulario.current?.querySelector<HTMLInputElement>('[name=nombre]') ?? null
    else if (vista === 'hecho') foco = titulo.current
    else if (vista === 'elegir') {
      // Al volver a las horas el foco recupera su sitio: la hora ya elegida, o (tras agendar otra o una hora ocupada) el día marcado.
      const destino = enfocarDia.current ? '.tk-ag-dia[aria-pressed="true"]' : '.tk-ag-hora[aria-pressed="true"]'
      foco = el.querySelector<HTMLButtonElement>(destino)
      enfocarDia.current = false
    }
    foco?.focus({ preventScroll: true })
    // QA final: si el paso nuevo es más corto que el anterior (la lista larga de horas → el formulario) la página queda scrolleada más abajo y el foco fuera de pantalla: se trae a la vista.
    const rf = foco?.getBoundingClientRect()
    if (foco && rf && (rf.top < window.innerHeight * 0.18 || rf.bottom > window.innerHeight * 0.82)) foco.scrollIntoView({ block: 'center' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista])

  /** Las horas de otro día aparecen con un fundido corto (no la primera vez). */
  const primerDia = useRef(true)
  useLayoutEffect(() => {
    if (primerDia.current) { primerDia.current = false; return }
    const hijos = horas.current ? Array.from(horas.current.children) : []
    if (hijos.length) mover(() => gsap.fromTo(hijos, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'tk-expo', stagger: 0.02, clearProps: 'opacity' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia?.clave])

  /** Cuánto de la fila de días queda fuera a cada lado: las flechas solo existen si hay algo que mostrar. */
  useEffect(() => {
    const tira = franja.current
    const primero = tira?.firstElementChild
    const ultimo = tira?.lastElementChild
    if (!tira || !primero || !ultimo) return
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.target === primero) setAntes(e.intersectionRatio < 0.98)
          if (e.target === ultimo) setDespues(e.intersectionRatio < 0.98)
        }
      },
      { root: tira, threshold: [0, 0.98, 1] },
    )
    io.observe(primero)
    io.observe(ultimo)
    return () => io.disconnect()
  }, [vista, dias.length])

  const mueveFila = (dir: 1 | -1) => franja.current?.scrollBy({ left: dir * Math.max(franja.current.clientWidth - 96, 96), behavior: 'smooth' })

  /** Sale la vista actual (fundido de 240 ms) y entra la siguiente. */
  const ir = (siguiente: Paso, espera = 0) => {
    const el = panel.current
    if (!el) { setPaso(siguiente); ocupado.current = false; return }
    mover(() => gsap.to(el, { opacity: 0, duration: 0.24, ease: 'none', delay: espera, onComplete: () => { setPaso(siguiente); ocupado.current = false } }))
  }

  /** Elegir una hora: el sello se estampa (rebase de takram) y, apenas asienta, el panel pasa a los datos. */
  const elegirHora = (f: Franja, boton: HTMLButtonElement) => {
    if (ocupado.current) return
    ocupado.current = true
    elegir()
    setSlot(f)
    setAviso(null)
    mover(() => gsap.fromTo(boton, { scale: 1.2, rotate: -8 }, { scale: 1, rotate: -2, duration: 0.45, ease: 'tk-asienta', clearProps: 'transform' }))
    ir('datos', 0.3)
  }

  const volverAHoras = () => {
    if (ocupado.current) return
    ocupado.current = true
    setAviso(null)
    ir('elegir')
  }

  const otra = () => {
    if (ocupado.current) return
    ocupado.current = true
    enfocarDia.current = true
    setSlot(null)
    setHecho(null)
    setAviso(null)
    setErrores({})
    setDatos((d) => ({ ...d, mensaje: '', acepto: false }))
    ir('elegir')
  }

  const cambia = (k: keyof Datos) => (e: { target: { value: string; checked?: boolean; type?: string } }) =>
    setDatos((d) => ({ ...d, [k]: e.target.type === 'checkbox' ? !!e.target.checked : e.target.value }))

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (enviando || !slot) return
    const nuevos: Errores = {
      nombre: datos.nombre.trim().length < 2 ? t.nombreFalta : undefined,
      email: CORREO_OK.test(datos.email.trim()) ? undefined : c.contacto.correoFalta,
      acepto: datos.acepto ? undefined : t.consentimientoFalta,
    }
    setErrores(nuevos)
    if (nuevos.nombre || nuevos.email || nuevos.acepto) {
      const orden = nuevos.nombre ? 'nombre' : nuevos.email ? 'email' : 'acepto'
      formulario.current?.querySelector<HTMLInputElement>(`[name=${orden}]`)?.focus()
      return
    }
    setEnviando(true)
    setAviso(null)
    const trampa = String(new FormData(e.currentTarget).get('sitio_web_hp') ?? '')
    const r = await reservar({ inicio: slot.inicio, nombre: datos.nombre.trim(), email: datos.email.trim(), marca: datos.marca.trim(), mensaje: datos.mensaje.trim(), consentimiento: true, trampa })
    setEnviando(false)
    if (r.ok) {
      setHecho({ dia: diaLargo(slot.inicio, zona, locale), hora: fmtHora(slot.inicio, locale, zona), max: horaDeMax(slot.inicio, locale, zona, zonaMax), email: datos.email.trim(), meet: r.meet })
      ocupado.current = true
      ir('hecho')
    } else if (r.fallo === 'ocupada') {
      // La hora ya no es suya: la lista se recarga sola (useAgenda) y se vuelve a ella con el aviso.
      enfocarDia.current = true
      setSlot(null)
      setAviso('ocupada')
      setPaso('elegir')
    } else setAviso(r.fallo)
  }

  const resumen = slot ? { dia: diaLargo(slot.inicio, zona, locale), hora: fmtHora(slot.inicio, locale, zona), max: horaDeMax(slot.inicio, locale, zona, zonaMax) } : null
  const maxTxt = (m: string | null) => (m ? ` (${t.horaDeMax(m)})` : '')

  let cuerpo: ReactNode = null
  if (vista === 'cargando') {
    cuerpo = (
      <>
        <Esqueleto />
        <p className="tk-sr" role="status">{t.cargando}</p>
      </>
    )
  } else if (vista === 'error') {
    cuerpo = (
      <div className="tk-ag-estado">
        <p role="alert">{copia.errorCarga}</p>
        <button type="button" className="tk-ver" onClick={() => void recargar()}>{copia.reintentar}</button>
      </div>
    )
  } else if (vista === 'vacio') {
    cuerpo = (
      <div className="tk-ag-estado">
        {aviso && <p className="tk-ag-aviso" role="alert">{copia.fallos[aviso]}</p>}
        <p>{copia.sinHuecos}</p>
        <a className="tk-enlace" href="#escribeme">{c.contacto.formulario}</a>
      </div>
    )
  } else if (vista === 'elegir' && dia) {
    cuerpo = (
      <>
        {aviso && <p className="tk-ag-aviso" role="alert">{copia.fallos[aviso]}</p>}
        <Pares items={[[t.duracionL, copia.duracion(duracion)], [t.zonaL, zonaTexto]]} className="tk-ag-datos" />

        <div className="tk-ag-bloque">
          <div className="tk-ag-et">
            <span id={`${id}d`}>{copia.elegirDia}</span>
            <div className="tk-ag-flechas" hidden={!antes && !despues}>
              <button type="button" className="tk-ag-flecha" aria-label={t.anterior} aria-controls={`${id}f`} aria-disabled={!antes} onClick={() => antes && mueveFila(-1)}><Flecha dir={-1} /></button>
              <button type="button" className="tk-ag-flecha" aria-label={t.siguiente} aria-controls={`${id}f`} aria-disabled={!despues} onClick={() => despues && mueveFila(1)}><Flecha dir={1} /></button>
            </div>
          </div>
          <div id={`${id}f`} ref={franja} className="tk-ag-dias" role="group" aria-labelledby={`${id}d`} onKeyDown={teclas}>
            {dias.map((d, i) => {
              const mes = fmtDia(d.fecha, locale, { month: 'short' })
              const nuevoMes = i === 0 || fmtDia(dias[i - 1].fecha, locale, { month: 'short' }) !== mes
              return (
                <button key={d.clave} type="button" className="tk-ag-dia" aria-pressed={d.clave === dia.clave} aria-label={fmtDia(d.fecha, locale)} onClick={() => setClaveSel(d.clave)}>
                  <span className="tk-ag-dsem">{fmtDia(d.fecha, locale, { weekday: 'short' })}</span>
                  <span className="tk-ag-dnum">{d.fecha.getUTCDate()}</span>
                  <span className="tk-ag-dmes">{nuevoMes ? mes : ''}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="tk-ag-bloque">
          <div className="tk-ag-et">
            <span id={`${id}h`}>{copia.elegirHora}</span>
            <span id={`${id}x`} className="tk-ag-fecha">{diaTexto}</span>
          </div>
          <div ref={horas} className="tk-ag-horas" role="group" aria-labelledby={`${id}h ${id}x`} onKeyDown={teclas}>
            {dia.franjas.map((f) => {
              const h = fmtHora(f.inicio, locale, zona)
              const max = horaDeMax(f.inicio, locale, zona, zonaMax)
              return (
                <button key={f.inicio} type="button" className="tk-ag-hora" aria-pressed={slot?.inicio === f.inicio} aria-label={max ? `${h}, ${t.horaDeMax(max)}` : h} onClick={(e) => elegirHora(f, e.currentTarget)}>
                  <span>{h}</span>
                  {max && <small aria-hidden="true">({max})</small>}
                </button>
              )
            })}
          </div>
          {hayOtraZona && <p className="tk-ag-nota">{t.notaZona(nombreMax)}</p>}
          <p className="tk-sr" role="status">{t.horasLibres(dia.franjas.length, diaTexto)}</p>
        </div>
      </>
    )
  } else if (vista === 'datos' && resumen) {
    cuerpo = (
      <form ref={formulario} onSubmit={(e) => void enviar(e)} noValidate aria-label={copia.titulo}>
        <div className="tk-ag-resumen">
          <Sello tam={36} />
          <div className="tk-ag-resumen-t">
            <p className="tk-ag-cuando">{resumen.dia}</p>
            <p className="tk-ag-horario">{resumen.hora}{maxTxt(resumen.max)}, {copia.duracion(duracion)}</p>
          </div>
          <button type="button" className="tk-ver" onClick={volverAHoras}>{copia.cambiar}</button>
        </div>

        <div className="tk-ag-doble">
          <div className="tk-campo">
            <label htmlFor={`${id}n`}>{copia.nombre}</label>
            <input id={`${id}n`} name="nombre" type="text" autoComplete="name" value={datos.nombre} onChange={cambia('nombre')} aria-required="true" aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? `${id}ne` : undefined} />
            {errores.nombre && <em id={`${id}ne`} role="alert">{errores.nombre}</em>}
          </div>
          <div className="tk-campo">
            <label htmlFor={`${id}c`}>{copia.email}</label>
            <input id={`${id}c`} name="email" type="email" inputMode="email" autoComplete="email" value={datos.email} onChange={cambia('email')} aria-required="true" aria-invalid={!!errores.email} aria-describedby={errores.email ? `${id}ce` : undefined} />
            {errores.email && <em id={`${id}ce`} role="alert">{errores.email}</em>}
          </div>
        </div>
        <div className="tk-campo">
          <label htmlFor={`${id}m`}>{copia.marca}</label>
          <input id={`${id}m`} name="marca" type="text" autoComplete="organization" value={datos.marca} onChange={cambia('marca')} />
        </div>
        <div className="tk-campo">
          <label htmlFor={`${id}t`}>{copia.mensaje}</label>
          <textarea id={`${id}t`} name="mensaje" rows={3} value={datos.mensaje} onChange={cambia('mensaje')} />
        </div>

        {/* La trampa: una persona no la ve ni llega con el teclado; un robot que rellena todo la deja llena y la API lo descarta. */}
        <div className="tk-ag-trampa" aria-hidden="true">
          <input name="sitio_web_hp" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div className="tk-ag-acepto">
          <label className="tk-ag-consent">
            <input type="checkbox" name="acepto" checked={datos.acepto} onChange={cambia('acepto')} aria-required="true" aria-invalid={!!errores.acepto} aria-describedby={errores.acepto ? `${id}ae` : undefined} />
            <span>{copia.consentimiento} <a href={PRIVACIDAD} target="_blank" rel="noopener noreferrer">{copia.aviso}</a></span>
          </label>
          {errores.acepto && <em id={`${id}ae`} className="tk-ag-err" role="alert">{errores.acepto}</em>}
        </div>

        <button type="submit" className="tk-boton tk-enviar" aria-busy={enviando} aria-disabled={enviando}>{enviando ? copia.enviando : copia.confirmar}</button>
        {aviso && <p className="tk-error" role="alert">{copia.fallos[aviso]}</p>}
      </form>
    )
  } else if (vista === 'hecho' && hecho) {
    cuerpo = (
      <div className="tk-ag-cartela">
        <Sello tam={64} className="tk-ag-sello" />
        <h3 ref={titulo} tabIndex={-1} className="tk-ag-listo">{copia.listo}</h3>
        <p className="tk-ag-detalle">{copia.listoDetalle}</p>
        <Pares
          className="tk-ag-pares"
          items={[
            [t.cuando, `${hecho.dia}, ${hecho.hora}${maxTxt(hecho.max)}`],
            [t.duracionL, copia.duracion(duracion)],
            ...(hecho.meet ? ([[t.dondeL, <a key="meet" href={hecho.meet} target="_blank" rel="noopener noreferrer">{copia.meet}</a>]] as Array<[string, ReactNode]>) : []),
            [t.paraL, hecho.email],
          ]}
        />
        <button type="button" className="tk-ver" onClick={otra}>{t.otra}</button>
      </div>
    )
  }

  return (
    <div ref={raiz} className="tk-ag-viva">
      <div ref={panel} className="tk-ag-panel" data-vista={vista}>{cuerpo}</div>
    </div>
  )
}
