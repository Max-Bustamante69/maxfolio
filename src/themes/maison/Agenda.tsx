import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { fmtDia, fmtHora, PRIVACIDAD, useAgenda, useCopiaAgenda, type Franja } from '../shared/agenda'
import { useCopy } from './copy'
import { gsap } from './motion'
import { ID, Tri, useMq } from './piezas'
import './agenda.css'

// El libro de citas del atelier. La agenda es la pública de Digitdeck (useAgenda); aquí solo vive su traje de Maison:
// los días son líneas de serifa como una invitación, las horas son etiquetas de prueba de vestuario (con ojal), y la
// confirmación es una tarjeta de invitación impresa. Todo lo que se mueve responde a un gesto y termina en reposo:
// el filete que se traza y la persiana que descubre son la misma gramática del resto de la dirección.

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Los textos de la dirección sobre los comunes de la agenda: lo que Maison no reescribe lo pone el contrato. */
function useTextos() {
  const base = useCopiaAgenda()
  const c = useCopy()
  return { ...base, ...c.agenda }
}
type Textos = ReturnType<typeof useTextos>
type Agenda = ReturnType<typeof useAgenda>
type Paso = 'elegir' | 'datos' | 'listo'

const may = (s: string, l: Locale) => s.charAt(0).toLocaleUpperCase(l) + s.slice(1)
const zonaLegible = (z: string) => z.replace(/_/g, ' ')
/** «Lunes 5 de octubre» (el contrato lo da con coma en es-CO). */
const diaLargo = (d: Date, l: Locale) => may(l === 'es' ? fmtDia(d, l).replace(/^([^,]+),/, '$1') : fmtDia(d, l), l)
const partes = (d: Date, l: Locale, largo: boolean) => ({
  n: fmtDia(d, l, { day: 'numeric' }),
  sem: fmtDia(d, l, { weekday: largo ? 'long' : 'short' }),
  mes: fmtDia(d, l, { month: largo ? 'long' : 'short' }),
})
/** El enlace de Meet solo se pinta si de verdad es de Google Meet. */
const meetSeguro = (u?: string) => {
  try {
    const x = new URL(u ?? '')
    return x.protocol === 'https:' && x.hostname === 'meet.google.com' ? x : null
  } catch {
    return null
  }
}

/** El ojal de la etiqueta: un agujero (el papel se ve a través) con su aro. */
const Ojal = () => (
  <svg className="mz-ag-ojal" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false"><circle cx="5" cy="5" r="3.6" /></svg>
)

function Contenido({ f, locale, zona, zonaMax, t }: { f: Franja; locale: Locale; zona: string; zonaMax: string; t: Textos }) {
  const mia = fmtHora(f.inicio, locale, zona)
  const suya = fmtHora(f.inicio, locale, zonaMax)
  // «10:00 a. m.»: la hora en serifa grande y el «a. m.» pequeño a su lado (en japonés no hay sufijo).
  const [, hm = mia, sufijo = ''] = mia.match(/^(\d{1,2}[:.]\d{2})\s*(.*)$/) ?? []
  return (
    <span className="mz-ag-tag-c">
      <Ojal />
      <span className="mz-ag-tag-h">{hm}{sufijo && <small>{sufijo}</small>}</span>
      {mia !== suya && <span className="mz-ag-tag-m">{t.horaMax(suya)}</span>}
    </span>
  )
}

/** Mientras llega la agenda (o antes de montarla): el libro vacío, con su altura y sin movimiento. */
function Esqueleto({ t }: { t: Textos }) {
  return (
    <div className="mz-ag-esq" aria-busy="true">
      <p className="mz-sr" role="status">{t.cargando}</p>
      <div className="mz-ag-libro" aria-hidden="true">
        <div className="mz-ag-izq">
          <p className="mz-etq mz-ag-leg">{t.elegirDia}</p>
          <i className="mz-ag-regla" />
          <div className="mz-ag-dias">{Array.from({ length: 11 }, (_, i) => <i key={i} className="mz-ag-esq-fila" />)}</div>
        </div>
        <div className="mz-ag-der">
          <p className="mz-etq mz-ag-leg">{t.elegirHora}</p>
          <i className="mz-ag-regla" />
          <div className="mz-ag-esq-horas">{Array.from({ length: 9 }, (_, i) => <i key={i} className="mz-ag-esq-tag" />)}</div>
        </div>
      </div>
    </div>
  )
}

const irAlMensaje = () => {
  const f = document.getElementById('mz-form')
  if (!f) return
  f.scrollIntoView({ block: 'start' })
  f.querySelector<HTMLInputElement>('input[name="correo"]')?.focus({ preventScroll: true })
}

/** Sin horas libres o sin agenda: se dice qué pasó y se ofrece el otro camino. */
function Mensaje({ t, texto, reintentar }: { t: Textos; texto: string; reintentar?: () => void }) {
  return (
    <div className="mz-ag-msg" role={reintentar ? 'alert' : 'status'}>
      <p className="mz-display">{texto}</p>
      <div className="mz-acciones">
        {reintentar && <button type="button" className="mz-btn mz-btn-vacio" onClick={reintentar}>{t.reintentar}</button>}
        <button type="button" className="mz-enlace" onClick={irAlMensaje}>{t.escribir}</button>
      </div>
    </div>
  )
}

function Libro() {
  const ag = useAgenda(ID)
  const t = useTextos()
  const [visto, setVisto] = useState(false)
  if (ag.dias.length > 0 && !visto) setVisto(true)
  // Una vez montado el libro no vuelve al esqueleto: tras una reserva o un 409 la agenda se recarga por detrás.
  if (!visto) {
    if (ag.estado === 'vacio') return <Mensaje t={t} texto={t.sinHuecos} />
    if (ag.estado === 'error') return <Mensaje t={t} texto={t.errorCarga} reintentar={ag.recargar} />
    return <Esqueleto t={t} />
  }
  return <Reservas ag={ag} />
}

function Reservas({ ag }: { ag: Agenda }) {
  const { dias, duracion, zona, zonaMax, reservar, elegir, recargar } = ag
  const { locale } = useLanguage()
  const t = useTextos()
  const ancho = useMq('(min-width: 900px)')
  const idDias = useId()
  const idHoras = useId()
  const idFecha = useId()
  const idN = useId()
  const idE = useId()
  const idC = useId()
  const idCarta = useId()

  const raiz = useRef<HTMLDivElement>(null)
  const ctx = useRef<gsap.Context | null>(null)
  const bloqueado = useRef(false)
  const previo = useRef<{ llave: string; paso: Paso } | null>(null)
  const intento = useRef<'nombre' | 'tag' | 'carta' | null>(null)
  const origen = useRef<{ x: number; y: number } | null>(null)
  const nombreRef = useRef<HTMLInputElement>(null)
  const correoRef = useRef<HTMLInputElement>(null)
  const consRef = useRef<HTMLInputElement>(null)
  const cartaRef = useRef<HTMLDivElement>(null)
  const trampa = useRef<HTMLInputElement>(null)

  const [diaClave, setDiaClave] = useState<string | null>(null)
  const [hora, setHora] = useState<Franja | null>(null)
  const [paso, setPaso] = useState<Paso>('elegir')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [datos, setDatos] = useState({ nombre: '', email: '', marca: '', mensaje: '', ok: false })
  const [errores, setErrores] = useState<{ nombre?: string; email?: string; ok?: string }>({})
  const [hecho, setHecho] = useState<{ franja: Franja; fecha: Date; nombre: string; meet?: string } | null>(null)

  const dia = useMemo(() => dias.find((d) => d.clave === diaClave) ?? dias[0], [dias, diaClave])

  // El contexto que sostiene las salidas: al desmontar se recoge todo lo que quedó en vuelo.
  useLayoutEffect(() => {
    ctx.current = gsap.context(() => {}, raiz)
    return () => { ctx.current?.revert(); ctx.current = null }
  }, [])

  // La entrada del libro: los filetes se trazan, los días y las etiquetas suben una vez; después, reposo.
  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    const c = gsap.context(() => {
      const q = gsap.utils.selector(el)
      gsap.from(q('.mz-ag-regla'), { scaleX: 0, transformOrigin: '0% 50%', duration: 1, ease: 'maison', stagger: 0.12, clearProps: 'transform' })
      gsap.from(q('.mz-ag-dia'), { opacity: 0, y: 10, duration: 0.7, ease: 'velo', stagger: 0.035, clearProps: 'transform,opacity' })
      gsap.from(q('.mz-ag-fecha, .mz-ag-meta'), { opacity: 0, y: 8, duration: 0.5, ease: 'velo', stagger: 0.05, delay: 0.2, clearProps: 'transform,opacity' })
      gsap.from(q('.mz-ag-tag'), { opacity: 0, y: 8, duration: 0.6, ease: 'velo', stagger: 0.02, delay: 0.3, clearProps: 'transform,opacity' })
    }, el)
    return () => c.revert()
  }, [])

  /** Sale lo viejo (160 ms) y solo entonces cambia el estado: nada se corta ni se solapa. */
  const salir = (blancos: Element[], hecho: () => void) => {
    if (!blancos.length || !ctx.current) { hecho(); return }
    bloqueado.current = true
    ctx.current.add(() => {
      gsap.to(blancos, { opacity: 0, y: -6, duration: 0.16, ease: 'power2.out', onComplete: () => { bloqueado.current = false; hecho() } })
    })
  }
  const todos = (sel: string) => Array.from(raiz.current?.querySelectorAll(sel) ?? [])

  /** Si el panel nuevo queda fuera de la ventana (móvil), se baja hasta él, bajo la cabecera. */
  const verPanel = () => {
    const el = raiz.current?.querySelector<HTMLElement>('.mz-ag-panel')
    if (!el) return
    const cab = (document.querySelector<HTMLElement>('.mz-cab')?.offsetHeight ?? 64) + 16
    const top = el.getBoundingClientRect().top
    if (top < cab || top > window.innerHeight * 0.6) window.scrollTo({ top: window.scrollY + top - cab, behavior: 'auto' })
  }

  // Cada cambio de paso (o de día) tiene su entrada: el panel nuevo se descubre, la etiqueta elegida viaja a su sitio y el foco llega al primer campo.
  const llave = paso + '|' + (paso === 'elegir' ? dia?.clave ?? '' : '')
  useLayoutEffect(() => {
    const antes = previo.current
    if (!antes) { previo.current = { llave, paso }; return }
    if (antes.llave === llave) return
    previo.current = { llave, paso }
    const el = raiz.current
    if (!el) return
    const quien = intento.current
    intento.current = null
    const c = gsap.context(() => {
      const q = gsap.utils.selector(el)
      if (paso === 'elegir') {
        if (antes.paso !== 'elegir') gsap.from(q('.mz-ag-panel .mz-ag-regla'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'maison', clearProps: 'transform' })
        if (antes.paso === 'listo') {
          gsap.from(q('.mz-ag-izq .mz-ag-regla'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'maison', clearProps: 'transform' })
          gsap.from(q('.mz-ag-dia'), { opacity: 0, y: 10, duration: 0.6, ease: 'velo', stagger: 0.03, clearProps: 'transform,opacity' })
        }
        gsap.from(q('.mz-ag-fecha, .mz-ag-meta, .mz-ag-aviso'), { opacity: 0, y: 8, duration: 0.4, ease: 'velo', stagger: 0.05, clearProps: 'transform,opacity' })
        gsap.from(q('.mz-ag-tag'), { opacity: 0, y: 8, duration: 0.5, ease: 'velo', stagger: 0.014, delay: 0.06, clearProps: 'transform,opacity' })
      } else if (paso === 'datos') {
        gsap.from(q('.mz-ag-panel .mz-ag-regla'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'maison', clearProps: 'transform' })
        gsap.from(q('.mz-ag-panel .mz-ag-leg, .mz-ag-resumen-t, .mz-ag-cambiar'), { opacity: 0, y: 8, duration: 0.5, ease: 'velo', stagger: 0.05, clearProps: 'transform,opacity' })
        const form = q('.mz-ag-form')[0]
        if (form) {
          gsap.fromTo(form, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'velo', delay: 0.1, clearProps: 'clipPath' })
          gsap.from(Array.from(form.children), { opacity: 0, y: 12, duration: 0.6, ease: 'velo', stagger: 0.05, delay: 0.16, clearProps: 'transform,opacity' })
        }
      } else {
        const carta = q('.mz-ag-carta')[0]
        if (carta) {
          gsap.fromTo(carta, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'velo', clearProps: 'clipPath' })
          gsap.from(q('.mz-ag-carta > :not(.mz-ag-carta-filete)'), { opacity: 0, y: 14, duration: 0.8, ease: 'velo', stagger: 0.07, delay: 0.25, clearProps: 'transform,opacity' })
          gsap.from(q('.mz-ag-carta-filete'), { scaleX: 0, duration: 0.9, ease: 'maison', delay: 0.55, clearProps: 'transform' })
        }
      }
    }, el)
    if (quien) verPanel()
    // La etiqueta que se eligió viaja desde donde estaba hasta su sitio en el resumen (solo transform).
    const fija = paso === 'datos' ? el.querySelector<HTMLElement>('.mz-ag-resumen .mz-ag-tag') : null
    if (fija && origen.current) {
      const r = fija.getBoundingClientRect()
      const o = origen.current
      c.add(() => { gsap.from(fija, { x: o.x - window.scrollX - r.left, y: o.y - window.scrollY - r.top, duration: 0.85, ease: 'velo', clearProps: 'transform' }) })
    }
    origen.current = null
    if (quien === 'nombre') nombreRef.current?.focus({ preventScroll: true })
    else if (quien === 'tag') (el.querySelector<HTMLElement>('.mz-ag-horas [aria-pressed="true"]') ?? el.querySelector<HTMLElement>('.mz-ag-horas button'))?.focus({ preventScroll: true })
    else if (quien === 'carta') cartaRef.current?.focus({ preventScroll: true })
    return () => c.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llave])

  const alElegirDia = (clave: string) => {
    if (clave === dia?.clave || bloqueado.current) return
    setDiaClave(clave)
    setAviso('')
    if (paso === 'elegir') { setHora(null); return }
    intento.current = null
    salir(todos('.mz-ag-panel'), () => { setHora(null); setPaso('elegir') })
    // En móvil el día elegido se centra en la tira.
    if (!ancho) raiz.current?.querySelector<HTMLElement>(`.mz-ag-dia-in[value="${clave}"]`)?.closest('label')?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }

  const alElegirHora = (f: Franja, e: MouseEvent<HTMLButtonElement>) => {
    if (bloqueado.current) return
    const boton = e.currentTarget
    const r = boton.getBoundingClientRect()
    origen.current = { x: r.left + window.scrollX, y: r.top + window.scrollY }
    elegir()
    intento.current = 'nombre'
    // Todo se desvanece menos la etiqueta pulsada: es la que viaja al resumen.
    const panel = raiz.current?.querySelector('.mz-ag-panel')
    const fuera = [...Array.from(panel?.children ?? []).filter((n) => !n.classList.contains('mz-ag-horas')), ...todos('.mz-ag-horas .mz-ag-tag').filter((n) => n !== boton)]
    salir(fuera, () => { setHora(f); setPaso('datos'); setAviso(''); setErrores({}) })
  }

  const volver = () => {
    if (bloqueado.current) return
    intento.current = 'tag'
    salir(todos('.mz-ag-panel'), () => { setPaso('elegir'); setAviso('') })
  }

  const otra = () => {
    if (bloqueado.current) return
    intento.current = 'tag'
    salir(todos('.mz-ag-panel'), () => {
      setHecho(null); setHora(null); setErrores({}); setAviso('')
      setDatos((d) => ({ ...d, mensaje: '', ok: false }))
      setPaso('elegir')
    })
  }

  const flechas = (e: KeyboardEvent<HTMLDivElement>) => {
    const tags = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button.mz-ag-tag'))
    const i = tags.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    const fila = tags.filter((b) => b.offsetTop === tags[0].offsetTop).length || 1
    const destino: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + fila, ArrowUp: i - fila, Home: 0, End: tags.length - 1 }
    const n = destino[e.key]
    if (n === undefined) return
    e.preventDefault()
    if (n >= 0 && n < tags.length) tags[n].focus()
  }

  const alEnviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (enviando || bloqueado.current || !hora || !dia) return
    const nombre = datos.nombre.trim()
    const email = datos.email.trim()
    const nuevos = {
      nombre: nombre ? undefined : t.faltaNombre,
      email: CORREO_OK.test(email) ? undefined : t.faltaCorreo,
      ok: datos.ok ? undefined : t.faltaConsentimiento,
    }
    setErrores(nuevos)
    if (nuevos.nombre || nuevos.email || nuevos.ok) {
      ;(nuevos.nombre ? nombreRef : nuevos.email ? correoRef : consRef).current?.focus()
      return
    }
    setEnviando(true)
    setAviso('')
    const fecha = dia.fecha
    const r = await reservar({
      inicio: hora.inicio,
      nombre,
      email,
      marca: datos.marca.trim() || undefined,
      mensaje: datos.mensaje.trim() || undefined,
      consentimiento: datos.ok,
      trampa: trampa.current?.value ?? '',
    })
    setEnviando(false)
    if (r.ok) {
      intento.current = 'carta'
      setHecho({ franja: hora, fecha, nombre, meet: r.meet })
      salir(todos('.mz-ag-izq, .mz-ag-der'), () => setPaso('listo'))
      return
    }
    setAviso(t.fallos[r.fallo])
    if (r.fallo === 'ocupada') {
      // La agenda ya se recargó por detrás: se vuelve a la lista de horas con el aviso.
      intento.current = 'tag'
      salir(todos('.mz-ag-panel'), () => { setHora(null); setPaso('elegir') })
    }
  }

  if (!dia && paso !== 'listo') return <Mensaje t={t} texto={t.sinHuecos} reintentar={recargar} />
  const zonaTxt = zonaLegible(zona)
  const meet = hecho ? meetSeguro(hecho.meet) : null

  return (
    <div className="mz-ag-libro" ref={raiz}>
      {paso === 'listo' && hecho ? (
        <div key="carta" className="mz-ag-panel mz-ag-final mz-ag-carta" ref={cartaRef} tabIndex={-1} role="group" aria-labelledby={idCarta}>
          <h3 id={idCarta} className="mz-etq mz-ag-carta-et">{t.listo}</h3>
          <p className="mz-ag-carta-fecha">{diaLargo(hecho.fecha, locale)}</p>
          <p className="mz-ag-carta-hora">{fmtHora(hecho.franja.inicio, locale, zona)}</p>
          <i className="mz-ag-carta-filete" aria-hidden="true" />
          <p className="mz-nota">{t.para(hecho.nombre)}</p>
          <p className="mz-nota mz-ag-carta-n">{t.duracion(duracion)}<br />{t.zona(zonaTxt)}</p>
          <p className="mz-nota">{t.listoDetalle}</p>
          {meet && (
            <p className="mz-ag-carta-meet">
              <span className="mz-etq">{t.meet}</span>
              <a className="mz-ag-meet" href={meet.href} target="_blank" rel="noopener noreferrer">{meet.hostname + meet.pathname}</a>
            </p>
          )}
          <button type="button" className="mz-btn mz-btn-vacio mz-ag-otra" onClick={otra}>{t.otra}</button>
        </div>
      ) : dia && (
        <>
          <div key="izq" className="mz-ag-izq">
            <p className="mz-etq mz-ag-leg" id={idDias}>{t.elegirDia}</p>
            <i className="mz-ag-regla" aria-hidden="true" />
            <div className="mz-ag-dias" role="radiogroup" aria-labelledby={idDias}>
              {dias.map((d) => {
                const p = partes(d.fecha, locale, ancho)
                return (
                  <label key={d.clave} className="mz-ag-dia">
                    <input type="radio" className="mz-ag-dia-in" name={idDias} value={d.clave} checked={d.clave === dia.clave} onChange={() => alElegirDia(d.clave)}
                      aria-label={t.diaAria(diaLargo(d.fecha, locale), d.franjas.length)} />
                    <span className="mz-ag-dia-c" aria-hidden="true">
                      <span className="mz-ag-dia-n">{p.n}</span>
                      <span className="mz-ag-dia-t"><span className="mz-ag-dia-sem">{p.sem}</span><span className="mz-ag-dia-mes">{p.mes}</span></span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div key="der" className="mz-ag-der">
            <div className="mz-ag-panel" key={paso}>
              {paso === 'elegir' ? (
                <>
                  <p className="mz-etq mz-ag-leg" id={idHoras}>{t.elegirHora}</p>
                  <i className="mz-ag-regla" aria-hidden="true" />
                  {aviso && <p className="mz-ag-aviso" role="alert">{aviso}</p>}
                  <h3 className="mz-ag-fecha" id={idFecha}>{diaLargo(dia.fecha, locale)}</h3>
                  <p className="mz-ag-meta"><span>{t.duracion(duracion)}</span><span>{t.zona(zonaTxt)}</span></p>
                  <div className="mz-ag-horas" role="group" aria-labelledby={`${idHoras} ${idFecha}`} onKeyDown={flechas}>
                    {dia.franjas.map((f) => (
                      <button key={f.inicio} type="button" className="mz-ag-tag" aria-pressed={hora?.inicio === f.inicio} onClick={(e) => alElegirHora(f, e)}>
                        <Contenido f={f} locale={locale} zona={zona} zonaMax={zonaMax} t={t} />
                      </button>
                    ))}
                  </div>
                </>
              ) : hora && (
                <>
                  <p className="mz-etq mz-ag-leg">{t.datos}</p>
                  <i className="mz-ag-regla" aria-hidden="true" />
                  <div className="mz-ag-resumen">
                    <div className="mz-ag-tag mz-ag-tag-fija"><Contenido f={hora} locale={locale} zona={zona} zonaMax={zonaMax} t={t} /></div>
                    <div className="mz-ag-resumen-t">
                      <h3 className="mz-ag-fecha mz-ag-fecha-s">{diaLargo(dia.fecha, locale)}</h3>
                      <p className="mz-ag-meta"><span>{t.duracion(duracion)}</span><span>{t.zona(zonaTxt)}</span></p>
                    </div>
                    <button type="button" className="mz-enlace mz-ag-cambiar" onClick={volver}><Tri atras />{t.cambiar}</button>
                  </div>
                  <form className="mz-ag-form" onSubmit={alEnviar} noValidate aria-label={t.confirmar}>
                    <div className="mz-ag-campos">
                      <div className="mz-campo">
                        <label>
                          <span className="mz-etq">{t.nombre}</span>
                          <input ref={nombreRef} name="nombre" type="text" autoComplete="name" value={datos.nombre} required aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? idN : undefined}
                            onChange={(e) => { setDatos({ ...datos, nombre: e.target.value }); if (errores.nombre) setErrores({ ...errores, nombre: undefined }) }} />
                          <i className="mz-campo-linea" aria-hidden="true" />
                        </label>
                        {errores.nombre && <em id={idN} role="alert">{errores.nombre}</em>}
                      </div>
                      <div className="mz-campo">
                        <label>
                          <span className="mz-etq">{t.email}</span>
                          <input ref={correoRef} name="correo" type="email" inputMode="email" autoComplete="email" value={datos.email} required aria-invalid={!!errores.email} aria-describedby={errores.email ? idE : undefined}
                            onChange={(e) => { setDatos({ ...datos, email: e.target.value }); if (errores.email) setErrores({ ...errores, email: undefined }) }} />
                          <i className="mz-campo-linea" aria-hidden="true" />
                        </label>
                        {errores.email && <em id={idE} role="alert">{errores.email}</em>}
                      </div>
                      <div className="mz-campo">
                        <label>
                          <span className="mz-etq">{t.marca}</span>
                          <input name="marca" type="text" autoComplete="organization" placeholder={t.marcaEj} value={datos.marca} onChange={(e) => setDatos({ ...datos, marca: e.target.value })} />
                          <i className="mz-campo-linea" aria-hidden="true" />
                        </label>
                      </div>
                      <div className="mz-campo">
                        <label>
                          <span className="mz-etq">{t.mensaje}</span>
                          <textarea name="mensaje" rows={3} autoComplete="off" value={datos.mensaje} onChange={(e) => setDatos({ ...datos, mensaje: e.target.value })} />
                          <i className="mz-campo-linea" aria-hidden="true" />
                        </label>
                      </div>
                    </div>
                    {/* La trampa: una persona no la ve ni la toca; un robot que rellena todo la delata. */}
                    <input ref={trampa} className="mz-ag-hp" type="text" name="sitio_web_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" />
                    <div className="mz-ag-ok">
                      <label className="mz-ag-chk">
                        <input ref={consRef} type="checkbox" name="consentimiento" checked={datos.ok} aria-invalid={!!errores.ok} aria-describedby={errores.ok ? idC : undefined}
                          onChange={(e) => { setDatos({ ...datos, ok: e.target.checked }); if (errores.ok) setErrores({ ...errores, ok: undefined }) }} />
                        <span>{t.consentimiento} <a href={PRIVACIDAD} target="_blank" rel="noopener noreferrer">{t.aviso}</a>.</span>
                      </label>
                      {errores.ok && <em id={idC} className="mz-ag-err" role="alert">{errores.ok}</em>}
                    </div>
                    {aviso && <p className="mz-error" role="alert">{aviso}</p>}
                    <button type="submit" className="mz-btn mz-ag-enviar" aria-busy={enviando} disabled={enviando}>{enviando ? t.enviando : t.confirmar}</button>
                  </form>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * La sección del libro de citas. El calendario (y con él la lectura de huecos y la medida booking_open) solo se monta cuando la
 * sección se acerca a la vista, o enseguida si la dirección trae #agenda; hasta entonces, el esqueleto guarda su altura.
 */
export default function AgendaSeccion() {
  const t = useTextos()
  const { hash, key } = useLocation()
  const [montado, setMontado] = useState(() => typeof location !== 'undefined' && location.hash === '#agenda')
  const seccion = useRef<HTMLElement>(null)

  useEffect(() => { if (hash === '#agenda') setMontado(true) }, [hash, key])
  useEffect(() => {
    const el = seccion.current
    if (montado || !el) return
    const io = new IntersectionObserver((entradas) => { if (entradas.some((e) => e.isIntersecting)) { setMontado(true); io.disconnect() } }, { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [montado])

  return (
    <section id="agenda" ref={seccion} className="mz-marco mz-ag" aria-labelledby="mz-ag-t">
      <div className="mz-ag-cab">
        <h2 id="mz-ag-t" className="mz-titulo-sec" data-mz="linea">{t.titulo}</h2>
        <p className="mz-nota mz-ag-lead" data-mz="subir">{t.lead}</p>
      </div>
      {montado ? <Libro /> : <Esqueleto t={t} />}
    </section>
  )
}
