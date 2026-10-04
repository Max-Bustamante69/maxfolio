import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent, type PointerEvent as PEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { fmtDia, fmtHora, PRIVACIDAD, useAgenda, useCopiaAgenda, type Dia, type Franja } from '../shared/agenda'
import { useExtra, type Extra } from './agenda-copy'
import { useCopy } from './copy'
import { gsap } from './motion'
import { Chevron, Segmentado } from './piezas'
import './agenda.css'

// Calendario de reservas de la dirección Apple. Se dibuja como el Calendario de macOS e iOS: rejilla de mes limpia,
// punto bajo los días con huecos, la selección en azul (un solo círculo que viaja de un día al otro), horas por momento
// del día en un segmentado y, en el móvil, el paso de datos en una hoja inferior que se arrastra hacia abajo.
// La agenda real vive en shared/agenda.ts (useAgenda): este archivo solo la dibuja. Cero fotogramas en reposo: todo
// movimiento es una transición CSS o un tween de GSAP dentro de un gsap.context que se revierte al desmontar.

const BCP: Record<Locale, string> = { es: 'es-CO', en: 'en-US', ja: 'ja-JP' }
const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Colombia empieza la semana en lunes; Estados Unidos y Japón, en domingo (como el Calendario de cada región). */
const INICIO_SEMANA: Record<Locale, number> = { es: 1, en: 0, ja: 0 }
const ANCHO = '(min-width: 720px)'

type Parte = 'manana' | 'tarde' | 'noche'
type Paso = 'fecha' | 'datos' | 'listo'
interface Eleccion { f: Franja; fecha: Date; clave: string }
interface Vals { nombre: string; email: string; marca: string; mensaje: string; consent: boolean }
interface Errores { nombre?: string; email?: string; consent?: string }

const hora24 = (iso: string, zona: string) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: zona, hour: '2-digit', hourCycle: 'h23' }).format(new Date(iso)))
const parteDe = (iso: string, zona: string): Parte => { const h = hora24(iso, zona); return h < 12 ? 'manana' : h < 18 ? 'tarde' : 'noche' }
const hoyClave = (zona: string) => new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const etiquetaZona = (zona: string, locale: Locale, nombres: Record<string, string>) => {
  const ciudad = nombres[zona] ?? (zona.split('/').pop() ?? zona).replace(/_/g, ' ')
  const desfase = new Intl.DateTimeFormat(BCP[locale], { timeZone: zona, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value
  // El signo menos tipográfico (U+2212) no deja que «GMT−5» se parta en dos renglones.
  return desfase ? `${ciudad}, ${desfase.replace('-', '−')}` : ciudad
}
const ms = (clave: string) => Date.parse(`${clave}T12:00:00Z`)
const rango = (f: Franja, locale: Locale) => `${fmtHora(f.inicio, locale)} – ${fmtHora(f.fin, locale)}`

const suscribirAncho = (cb: () => void) => { const m = matchMedia(ANCHO); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) }
const useAncho = () => useSyncExternalStore(suscribirAncho, () => matchMedia(ANCHO).matches, () => true)

/* ------------------------------------------------------------------ iconos */
const IconoVideo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="6" width="13" height="12" rx="3" /><path d="m15.5 10.5 5-2.8v8.6l-5-2.8" />
  </svg>
)
const IconoCerrar = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6.5 6.5 11 11m0-11-11 11" /></svg>
)

/* ------------------------------------------------------------------ esqueleto (la altura del calendario real, sin movimiento) */
function Esqueleto({ titulo, cargando }: { titulo: string; cargando: string }) {
  return (
    <>
      <div className="ap-ag-cuerpo" aria-hidden="true">
        <div className="ap-ag-izq">
          <header className="ap-ag-cab">
            <h2 id="ap-ag-t">{titulo}</h2>
            <p className="ap-ag-meta"><span className="ap-sk ap-sk-meta" /></p>
          </header>
          <div className="ap-cal">
            <div className="ap-cal-cab"><span className="ap-sk ap-sk-mes" /></div>
            <div className="ap-cal-sem">{Array.from({ length: 7 }, (_, i) => <span key={i}><i className="ap-sk ap-sk-sem" /></span>)}</div>
            <div className="ap-cal-dias">{Array.from({ length: 42 }, (_, i) => <span key={i} className="ap-dia"><i className="ap-sk ap-sk-dia" /></span>)}</div>
          </div>
        </div>
        <div className="ap-ag-panel">
          <span className="ap-sk ap-sk-tit" />
          <span className="ap-sk ap-sk-sub" />
          <div className="ap-horas">{Array.from({ length: 6 }, (_, i) => <i key={i} className="ap-sk ap-sk-hora" />)}</div>
        </div>
      </div>
      <p className="ap-sr" role="status">{cargando}</p>
    </>
  )
}

/* ------------------------------------------------------------------ calendario de mes */
interface CalProps { dias: Dia[]; meses: string[]; mes: string; setMes: (m: string) => void; clave: string | null; elegirDia: (c: string) => void; hoy: string; locale: Locale; x: Extra }

function Calendario({ dias, meses, mes, setMes, clave, elegirDia, hoy, locale, x }: CalProps) {
  const pag = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const burbuja = useRef<HTMLSpanElement>(null)
  const colocada = useRef(false)
  const mesPrevio = useRef(mes)
  const focoPendiente = useRef<string | null>(null)
  const [y, m] = mes.split('-').map(Number)
  const inicio = INICIO_SEMANA[locale]
  const porClave = useMemo(() => new Map(dias.map((d) => [d.clave, d])), [dias])
  const delMes = useMemo(() => dias.filter((d) => d.clave.startsWith(mes)), [dias, mes])
  const desfase = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() - inicio + 7) % 7
  const nDias = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const iMes = meses.indexOf(mes)
  const tabulable = delMes.some((d) => d.clave === clave) ? clave : delMes[0]?.clave
  const semana = useMemo(() => Array.from({ length: 7 }, (_, i) => fmtDia(new Date(Date.UTC(2023, 0, 1 + ((inicio + i) % 7))), locale, { weekday: 'short' })), [inicio, locale])
  const titulo = fmtDia(new Date(Date.UTC(y, m - 1, 1)), locale, { month: 'long', year: 'numeric' })

  /** El círculo azul de la selección: una sola pieza que viaja entre días (transform; si cambia de mes, aparece ya en su sitio). */
  const colocar = useCallback((instantaneo: boolean) => {
    const g = grid.current
    const b = burbuja.current
    if (!g || !b) return
    const sel = g.querySelector<HTMLElement>('.ap-dia[aria-pressed="true"]')
    const n = sel?.querySelector<HTMLElement>('.ap-dia-n')
    if (!sel || !n) { b.style.opacity = '0'; colocada.current = false; return }
    const quieta = instantaneo || !colocada.current
    if (quieta) b.style.transition = 'none'
    b.style.width = b.style.height = `${n.offsetWidth}px`
    b.style.transform = `translate3d(${sel.offsetLeft + n.offsetLeft}px, ${sel.offsetTop + n.offsetTop}px, 0)`
    b.style.opacity = '1'
    if (quieta) { void b.offsetWidth; b.style.transition = '' }
    colocada.current = true
    g.dataset.b = '1'
  }, [])
  useLayoutEffect(() => { colocar(mesPrevio.current !== mes) }, [clave, mes, dias, colocar])
  useEffect(() => {
    const el = grid.current
    if (!el) return
    const ro = new ResizeObserver(() => colocar(true))
    ro.observe(el)
    return () => ro.disconnect()
  }, [colocar])

  // Cambio de mes: la página entra desde el lado hacia el que se avanza.
  useLayoutEffect(() => {
    if (mesPrevio.current === mes) return
    const dir = mes > mesPrevio.current ? 1 : -1
    mesPrevio.current = mes
    const ctx = gsap.context(() => { gsap.fromTo(pag.current, { x: dir * 28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'apple', clearProps: 'transform,opacity' }) })
    return () => ctx.revert()
  }, [mes])
  // Primera aparición: los días encienden en diagonal, una sola vez.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ap-dia:not(.ap-dia-v)', { opacity: 0, y: 6, duration: 0.55, ease: 'apple', stagger: { each: 0.008, from: 'start' }, clearProps: 'transform,opacity' })
    }, grid)
    return () => ctx.revert()
  }, [])
  // El foco que cruzó de mes con las flechas aterriza cuando la página nueva ya está pintada.
  useEffect(() => {
    const k = focoPendiente.current
    if (!k) return
    focoPendiente.current = null
    grid.current?.querySelector<HTMLElement>(`[data-dia="${k}"]`)?.focus()
  }, [mes])

  const irA = (k: string) => {
    if (!k.startsWith(mes)) { focoPendiente.current = k; setMes(k.slice(0, 7)); return }
    grid.current?.querySelector<HTMLElement>(`[data-dia="${k}"]`)?.focus()
  }
  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-dia]')
    if (!t) return
    const k = t.dataset.dia!
    const i = dias.findIndex((d) => d.clave === k)
    let j = -1
    if (e.key === 'ArrowRight') j = i + 1
    else if (e.key === 'ArrowLeft') j = i - 1
    else if (e.key === 'ArrowDown') { const o = ms(k) + 7 * 864e5; j = dias.findIndex((d) => ms(d.clave) >= o) }
    else if (e.key === 'ArrowUp') { const o = ms(k) - 7 * 864e5; for (let n = dias.length - 1; n >= 0; n--) if (ms(dias[n].clave) <= o) { j = n; break } }
    else if (e.key === 'Home') j = dias.findIndex((d) => d.clave.startsWith(mes))
    else if (e.key === 'End') { for (let n = dias.length - 1; n >= 0; n--) if (dias[n].clave.startsWith(mes)) { j = n; break } }
    else if (e.key === 'PageDown' || e.key === 'PageUp') { const s = meses[iMes + (e.key === 'PageDown' ? 1 : -1)]; j = s ? dias.findIndex((d) => d.clave.startsWith(s)) : -1 }
    else return
    e.preventDefault()
    if (j >= 0 && j < dias.length) irA(dias[j].clave)
  }
  const mover = (d: number) => { const s = meses[iMes + d]; if (s) setMes(s) }

  return (
    <div className="ap-cal">
      <div className="ap-cal-cab">
        <h3 className="ap-cal-mes" aria-live="polite">{titulo}</h3>
        <div className="ap-cal-nav">
          <button type="button" className="ap-icono" aria-label={x.mesAnterior} aria-disabled={iMes <= 0} onClick={() => mover(-1)}><Chevron izquierda /></button>
          <button type="button" className="ap-icono" aria-label={x.mesSiguiente} aria-disabled={iMes >= meses.length - 1} onClick={() => mover(1)}><Chevron /></button>
        </div>
      </div>
      <div ref={pag} className="ap-cal-pag">
        <div className="ap-cal-sem" aria-hidden="true">{semana.map((s, i) => <span key={i}>{s}</span>)}</div>
        <div ref={grid} className="ap-cal-dias" role="group" aria-label={titulo} onKeyDown={alTeclear}>
          <span ref={burbuja} className="ap-cal-burbuja" aria-hidden="true" />
          {Array.from({ length: 42 }, (_, i) => {
            const n = i - desfase + 1
            if (n < 1 || n > nDias) return <span key={`v${i}`} className="ap-dia ap-dia-v" aria-hidden="true" />
            const k = `${mes}-${String(n).padStart(2, '0')}`
            const d = porClave.get(k)
            const esHoy = k === hoy
            if (!d) return <span key={k} className="ap-dia ap-dia-off" data-hoy={esHoy || undefined} aria-hidden="true"><span className="ap-dia-n">{n}</span></span>
            return (
              <button key={k} type="button" className="ap-dia" data-dia={k} data-hoy={esHoy || undefined} aria-pressed={k === clave} aria-current={esHoy ? 'date' : undefined}
                aria-label={`${fmtDia(d.fecha, locale)}, ${x.huecos(d.franjas.length)}`} tabIndex={k === tabulable ? 0 : -1} onClick={() => elegirDia(k)}>
                <span className="ap-dia-n">{n}</span><span className="ap-dia-p" aria-hidden="true" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ horas del día */
interface HorasProps { dia: Dia | null; eleccion: Eleccion | null; zona: string; zonaMax: string; locale: Locale; x: Extra; elegirHora: (f: Franja) => void; aviso: string | null; textoDia: string; textoZona: string }

function Horas({ dia, eleccion, zona, zonaMax, locale, x, elegirHora, aviso, textoDia, textoZona }: HorasProps) {
  const base = useCopiaAgenda()
  const lista = useRef<HTMLDivElement>(null)
  // El momento del día elegido pertenece a SU día: al cambiar de día no queda un momento viejo (y no hay un fotograma con las horas equivocadas).
  const [sel, setSel] = useState<{ clave: string; parte: Parte } | null>(null)
  const parte = sel && sel.clave === dia?.clave ? sel.parte : null
  const franjas = dia?.franjas ?? []
  const partes = (['manana', 'tarde', 'noche'] as Parte[]).filter((p) => franjas.some((f) => parteDe(f.inicio, zona) === p))
  const delElegido = eleccion && dia && eleccion.clave === dia.clave ? parteDe(eleccion.f.inicio, zona) : null
  const activa: Parte = parte && partes.includes(parte) ? parte : delElegido && partes.includes(delElegido) ? delElegido : (partes[0] ?? 'manana')
  const visibles = franjas.filter((f) => parteDe(f.inicio, zona) === activa)
  const difiere = zona !== zonaMax
  // Las horas entran escalonadas cada vez que cambia el día o el momento del día.
  useLayoutEffect(() => {
    if (!lista.current?.children.length) return
    const ctx = gsap.context(() => { gsap.from('.ap-hora', { opacity: 0, y: 8, duration: 0.45, ease: 'apple', stagger: 0.025, clearProps: 'transform,opacity' }) }, lista)
    return () => ctx.revert()
  }, [dia?.clave, activa])

  return (
    <>
      {aviso && <p className="ap-ag-aviso" role="alert">{aviso}</p>}
      {dia ? (
        <>
          <div className="ap-panel-cab">
            <h3 tabIndex={-1} data-foco="titulo">{textoDia}</h3>
            <p>{textoZona}</p>
          </div>
          {partes.length > 1 && (
            <Segmentado<Parte> valor={activa} etiqueta={x.partesEtq} onCambio={(p) => dia && setSel({ clave: dia.clave, parte: p })} opciones={partes.map((p) => [p, x.partes[p]])} />
          )}
          <div ref={lista} className="ap-horas" role="group" aria-label={base.elegirHora}>
            {visibles.map((f) => (
              <button key={f.inicio} type="button" className="ap-hora" data-iso={f.inicio} aria-pressed={eleccion?.f.inicio === f.inicio} onClick={() => elegirHora(f)}>
                <span className="ap-hora-v">{fmtHora(f.inicio, locale)}</span>
                {difiere && <span className="ap-hora-m"><span className="ap-sr">{x.deMax} </span>({fmtHora(f.inicio, locale, zonaMax)})</span>}
              </button>
            ))}
          </div>
          {difiere && <p className="ap-panel-nota">{x.horaMax(etiquetaZona(zonaMax, locale, x.zonas))}</p>}
        </>
      ) : (
        <p className="ap-panel-vacio" tabIndex={-1} data-foco="titulo">{base.elegirDia}</p>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ formulario de datos */
interface FormProps {
  idTitulo: string; textoDia: string; textoHora: string; textoZona: string; vals: Vals; setVals: (v: Vals) => void; errores: Errores; enviando: boolean; falloEnvio: string | null
  onSubmit: (e: FormEvent<HTMLFormElement>) => void; onVolver?: () => void; formRef: (el: HTMLFormElement | null) => void
}

function Formulario({ idTitulo, textoDia, textoHora, textoZona, vals, setVals, errores, enviando, falloEnvio, onSubmit, onVolver, formRef }: FormProps) {
  const base = useCopiaAgenda()
  const { locale } = useLanguage()
  const id = useId()
  const poner = (k: keyof Vals) => (e: { target: { value: string } }) => setVals({ ...vals, [k]: e.target.value })
  return (
    <form ref={formRef} className="ap-ag-form" noValidate onSubmit={onSubmit} aria-labelledby={idTitulo}
      onKeyDown={(e) => { if (e.key === 'Escape' && onVolver) { e.stopPropagation(); onVolver() } }}>
      {onVolver && (
        <button type="button" className="ap-enlace ap-ag-atras" onClick={onVolver}><Chevron izquierda />{base.cambiar}</button>
      )}
      <div className="ap-ag-resumen">
        <h3 id={idTitulo} tabIndex={-1} data-foco="resumen">{textoDia}</h3>
        <p>{textoHora}</p>
        <p>{textoZona}</p>
      </div>
      <div className="ap-campo">
        <label>
          <span>{base.nombre}</span>
          <input name="nombre" data-foco="nombre" type="text" autoComplete="name" value={vals.nombre} onChange={poner('nombre')} aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? `${id}-n` : undefined} />
        </label>
        {errores.nombre && <em id={`${id}-n`} role="alert">{errores.nombre}</em>}
      </div>
      <div className="ap-campo">
        <label>
          <span>{base.email}</span>
          <input name="email" type="email" inputMode="email" autoComplete="email" value={vals.email} onChange={poner('email')} aria-invalid={!!errores.email} aria-describedby={errores.email ? `${id}-e` : undefined} />
        </label>
        {errores.email && <em id={`${id}-e`} role="alert">{errores.email}</em>}
      </div>
      <div className="ap-campo">
        <label>
          <span>{base.marca}</span>
          <input name="marca" type="text" autoComplete="organization" value={vals.marca} onChange={poner('marca')} />
        </label>
      </div>
      <div className="ap-campo">
        <label>
          <span>{base.mensaje}</span>
          <textarea name="mensaje" rows={3} value={vals.mensaje} onChange={poner('mensaje')} />
        </label>
      </div>
      {/* Trampa para bots: una persona nunca la ve ni la llena. */}
      <input className="ap-ag-trampa" name="sitio_web_hp" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" />
      <div className="ap-ag-consent">
        <label>
          <input name="consentimiento" type="checkbox" checked={vals.consent} onChange={(e) => setVals({ ...vals, consent: e.target.checked })} aria-invalid={!!errores.consent} aria-describedby={errores.consent ? `${id}-c` : undefined} />
          <span className="ap-caja" aria-hidden="true"><svg viewBox="0 0 16 16" width="16" height="16"><path d="m3.5 8.4 3 3 6-6.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <span className="ap-consent-t">{base.consentimiento}{locale === 'ja' ? '' : ' '}<a href={PRIVACIDAD} target="_blank" rel="noopener noreferrer">{base.aviso}</a></span>
        </label>
        {errores.consent && <em id={`${id}-c`} role="alert">{errores.consent}</em>}
      </div>
      <button type="submit" className="ap-btn ap-btn-pri ap-ag-enviar" aria-busy={enviando} disabled={enviando}>{enviando ? base.enviando : base.confirmar}</button>
      {falloEnvio && <p className="ap-error" role="alert">{falloEnvio}</p>}
    </form>
  )
}

/* ------------------------------------------------------------------ éxito */
function Listo({ idTitulo, texto, rangoTxt, zonaTxt, meet, onOtra, x }: { idTitulo: string; texto: string; rangoTxt: string; zonaTxt: string; meet?: string; onOtra: () => void; x: Extra }) {
  const base = useCopiaAgenda()
  const ref = useRef<HTMLDivElement>(null)
  // El sello se dibuja y la tarjeta asienta desde una escala cercana a 1 (nunca desde 0).
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { opacity: 0, scale: 0.96, y: 14, duration: 0.7, ease: 'apple', clearProps: 'transform,opacity' })
      gsap.fromTo('.ap-ag-sello path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, delay: 0.25, ease: 'apple' })
      gsap.from('.ap-ag-sello circle', { scale: 0.86, transformOrigin: '50% 50%', duration: 0.7, ease: 'apple' })
      gsap.from('.ap-ag-listo > :not(.ap-ag-sello)', { opacity: 0, y: 10, duration: 0.55, ease: 'apple', stagger: 0.06, delay: 0.15, clearProps: 'transform,opacity' })
    }, ref)
    return () => ctx.revert()
  }, [])
  const meetSeguro = meet && /^https:\/\//i.test(meet) ? meet : undefined
  return (
    <div ref={ref} className="ap-ag-listo" role="status">
      <svg className="ap-ag-sello" viewBox="0 0 48 48" width="56" height="56" aria-hidden="true">
        <circle cx="24" cy="24" r="23" fill="var(--v5-ok)" />
        <path d="m14 25 7 7 13-15" pathLength="1" strokeDasharray="1" fill="none" stroke="var(--v5-on-accent)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h3 id={idTitulo} tabIndex={-1} data-foco="listo">{base.listo}</h3>
      <p className="ap-ag-cuando"><strong>{texto}</strong><span>{rangoTxt}</span><span>{zonaTxt}</span></p>
      <p className="ap-ag-detalle">{base.listoDetalle}</p>
      <div className="ap-ag-acciones">
        {meetSeguro && <a className="ap-btn ap-btn-pri" href={meetSeguro} target="_blank" rel="noopener noreferrer"><IconoVideo /><span>{base.meet}</span></a>}
        <button type="button" className="ap-btn ap-btn-sec" onClick={onOtra}>{x.otra}</button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ hoja inferior (móvil) */
const rubberband = (sobrante: number, dim: number, k = 0.55) => (sobrante * dim * k) / (dim + k * Math.abs(sobrante))

interface HojaProps { abierta: boolean; onCerrar: () => void; alMontar: () => void; etiqueta: string; cerrarEtq: string; raiz: HTMLElement | null; children: ReactNode }

/**
 * Hoja que sube desde abajo: velo que atenúa, asa y botón de cerrar. Se arrastra hacia abajo 1:1 con el dedo y, al soltar,
 * la velocidad decide (proyección de impulso): un golpe rápido la cierra aunque el recorrido sea corto. Esc, el velo y el botón también cierran.
 * Mientras está abierta lo demás queda inerte y la página no se desplaza; lo que sube con el teclado la levanta (visualViewport).
 */
function HojaInferior({ abierta, onCerrar, alMontar, etiqueta, cerrarEtq, raiz, children }: HojaProps) {
  const [montada, setMontada] = useState(false)
  const ultimo = useRef<ReactNode>(null)
  const envoltura = useRef<HTMLDivElement>(null)
  const velo = useRef<HTMLDivElement>(null)
  const hoja = useRef<HTMLDivElement>(null)
  const arrastre = useRef<{ id: number; y0: number; dy: number; hist: Array<{ y: number; t: number }> } | null>(null)
  if (abierta) ultimo.current = children

  useLayoutEffect(() => { if (abierta && !montada) setMontada(true) }, [abierta, montada])

  // Entrada: el velo se atenúa y la hoja sube (expo-out de la casa).
  useLayoutEffect(() => {
    if (!abierta || !montada) return
    const ctx = gsap.context(() => {
      gsap.fromTo(velo.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      gsap.fromTo(hoja.current, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'apple', clearProps: 'transform' })
    })
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta, montada])
  // Ya con la hoja en el DOM, el padre le pone el foco al primer campo (su propio efecto no corre: la hoja se monta con su propio estado).
  useLayoutEffect(() => { if (abierta && montada) alMontar() }, [abierta, montada]) // eslint-disable-line react-hooks/exhaustive-deps

  // Salida: más rápida que la entrada, y la hoja se desmonta al terminar.
  useEffect(() => {
    if (abierta || !montada) return
    const tl = gsap.timeline({ onComplete: () => setMontada(false) })
    tl.to(velo.current, { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0).to(hoja.current, { yPercent: 100, duration: 0.4, ease: 'apple' }, 0)
    return () => { tl.kill() }
  }, [abierta, montada])

  // Lo de atrás queda inerte, la página no se mueve y Esc cierra. En fase de layout para que, al cerrar, el foco ya pueda volver a la página.
  useLayoutEffect(() => {
    if (!abierta || !montada || !raiz) return
    const atras = Array.from(raiz.children).filter((n) => n !== envoltura.current)
    atras.forEach((n) => n.setAttribute('inert', ''))
    const previo = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const tecla = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', tecla)
    const vv = window.visualViewport
    const ajustar = () => {
      if (!vv || !envoltura.current) return
      envoltura.current.style.setProperty('--ap-teclado', `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`)
      envoltura.current.style.setProperty('--ap-vv', `${vv.height}px`)
    }
    ajustar()
    vv?.addEventListener('resize', ajustar)
    vv?.addEventListener('scroll', ajustar)
    return () => {
      atras.forEach((n) => n.removeAttribute('inert'))
      document.documentElement.style.overflow = previo
      window.removeEventListener('keydown', tecla)
      vv?.removeEventListener('resize', ajustar)
      vv?.removeEventListener('scroll', ajustar)
    }
  }, [abierta, montada, raiz, onCerrar])

  const abajo = (e: PEvent<HTMLDivElement>) => {
    if (arrastre.current || (e.pointerType === 'mouse' && e.button !== 0)) return
    e.currentTarget.setPointerCapture(e.pointerId)
    arrastre.current = { id: e.pointerId, y0: e.clientY, dy: 0, hist: [{ y: e.clientY, t: e.timeStamp }] }
    gsap.killTweensOf([hoja.current, velo.current])
  }
  const mueve = (e: PEvent<HTMLDivElement>) => {
    const a = arrastre.current
    if (!a || a.id !== e.pointerId || !hoja.current) return
    const bruto = e.clientY - a.y0
    // Hacia abajo, 1:1 con el dedo; hacia arriba, una resistencia que crece (nunca un tope seco).
    a.dy = bruto >= 0 ? bruto : -rubberband(-bruto, hoja.current.offsetHeight)
    a.hist.push({ y: e.clientY, t: e.timeStamp })
    if (a.hist.length > 6) a.hist.shift()
    gsap.set(hoja.current, { y: a.dy })
    gsap.set(velo.current, { opacity: 1 - 0.85 * Math.min(1, Math.max(0, a.dy) / hoja.current.offsetHeight) })
  }
  const arriba = (e: PEvent<HTMLDivElement>, cancelado = false) => {
    const a = arrastre.current
    if (!a || a.id !== e.pointerId || !hoja.current) return
    arrastre.current = null
    const primero = a.hist[0]
    const fin = a.hist[a.hist.length - 1]
    const v = ((fin.y - primero.y) / Math.max(1, fin.t - primero.t)) * 1000 // px/s, positivo = hacia abajo
    const proyectado = a.dy + (v / 1000) * (0.998 / (1 - 0.998)) // adónde llegaría con el impulso (proyección de iOS)
    if (!cancelado && proyectado > hoja.current.offsetHeight * 0.5) { onCerrar(); return }
    gsap.to(hoja.current, { y: 0, duration: 0.5, ease: 'apple', clearProps: 'transform' })
    gsap.to(velo.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
  }

  if (!raiz || !montada) return null
  return createPortal(
    <div ref={envoltura} className="ap-hoja-ag">
      <div ref={velo} className="ap-hoja-velo" onClick={onCerrar} aria-hidden="true" />
      <div ref={hoja} className="ap-hoja-pliego" role="dialog" aria-modal="true" aria-label={etiqueta}>
        <div className="ap-hoja-agarre" onPointerDown={abajo} onPointerMove={mueve} onPointerUp={(e) => arriba(e)} onPointerCancel={(e) => arriba(e, true)}>
          <span className="ap-hoja-asa" aria-hidden="true" />
        </div>
        <button type="button" className="ap-icono ap-hoja-x" aria-label={cerrarEtq} onClick={onCerrar}><IconoCerrar /></button>
        <div className="ap-hoja-cuerpo">{ultimo.current}</div>
      </div>
    </div>,
    raiz,
  )
}

/* ------------------------------------------------------------------ la agenda */
function Agenda({ alEscribir }: { alEscribir: () => void }) {
  const { locale } = useLanguage()
  const base = useCopiaAgenda()
  const c = useCopy()
  const x = useExtra()
  const { estado, dias, duracion, zona, zonaMax, recargar, reservar, elegir } = useAgenda('apple')
  const ancho = useAncho()
  const idTitulo = useId()
  const [clave, setClave] = useState<string | null>(null)
  const [mes, setMes] = useState<string | null>(null)
  const [eleccion, setEleccion] = useState<Eleccion | null>(null)
  const [paso, setPaso] = useState<Paso>('fecha')
  const [hoja, setHoja] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [vals, setVals] = useState<Vals>({ nombre: '', email: '', marca: '', mensaje: '', consent: false })
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)
  const [falloEnvio, setFalloEnvio] = useState<string | null>(null)
  const [meet, setMeet] = useState<string | undefined>()
  const [anuncio, setAnuncio] = useState('')
  const [vista, setVista] = useState<'horas' | 'datos'>('horas')
  const panel = useRef<HTMLDivElement>(null)
  const form = useRef<HTMLFormElement | null>(null)
  const foco = useRef<string | null>(null)
  const primera = useRef(true)
  const raiz = useMemo(() => document.querySelector<HTMLElement>('.v5-apple'), [])

  const meses = useMemo(() => [...new Set(dias.map((d) => d.clave.slice(0, 7)))], [dias])
  const hoy = useMemo(() => hoyClave(zona), [zona])
  const dia = dias.find((d) => d.clave === clave) ?? null
  const zonaTxt = base.zona(etiquetaZona(zona, locale, x.zonas))

  // El primer día con huecos queda elegido: las horas se ven desde el primer momento. Si el día elegido desaparece (alguien lo tomó), se vuelve al primero.
  useEffect(() => {
    if (paso !== 'fecha' || !dias.length || dias.some((d) => d.clave === clave)) return
    setClave(dias[0].clave)
    setMes(dias[0].clave.slice(0, 7))
  }, [dias, clave, paso])
  useEffect(() => {
    if (!ancho) { if (paso === 'datos') setHoja(true) } else setHoja(false)
  }, [ancho]) // eslint-disable-line react-hooks/exhaustive-deps

  const elegirDia = (k: string) => {
    setClave(k)
    setAviso(null)
    const d = dias.find((q) => q.clave === k)
    if (d) setAnuncio(`${fmtDia(d.fecha, locale)}: ${x.huecos(d.franjas.length)}.`)
    if (paso === 'datos') { setPaso('fecha'); setHoja(false) }
  }
  const elegirHora = (f: Franja) => {
    if (!dia) return
    elegir()
    setAviso(null)
    setErrores({})
    setFalloEnvio(null)
    setEleccion({ f, fecha: dia.fecha, clave: dia.clave })
    setPaso('datos')
    foco.current = '[data-foco="nombre"]'
    if (!ancho) setHoja(true)
  }
  const volver = useCallback(() => {
    setPaso('fecha')
    setHoja(false)
    foco.current = eleccion ? `[data-iso="${eleccion.f.inicio}"]` : '[data-foco="titulo"]'
  }, [eleccion])
  const cerrarHoja = useCallback(() => {
    if (paso === 'datos') volver()
    else setHoja(false)
  }, [paso, volver])
  const otra = () => {
    setPaso('fecha')
    setHoja(false)
    setEleccion(null)
    setMeet(undefined)
    setVals((v) => ({ ...v, mensaje: '' }))
    foco.current = '[data-foco="titulo"]'
  }

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (enviando || !eleccion) return
    const trampa = String(new FormData(e.currentTarget).get('sitio_web_hp') ?? '')
    const nuevos: Errores = {
      nombre: vals.nombre.trim() ? undefined : x.faltaNombre,
      email: CORREO_OK.test(vals.email.trim()) ? undefined : c.contacto.falta,
      consent: vals.consent ? undefined : x.faltaConsent,
    }
    setErrores(nuevos)
    setFalloEnvio(null)
    const primero = nuevos.nombre ? 'nombre' : nuevos.email ? 'email' : nuevos.consent ? 'consentimiento' : null
    if (primero) { form.current?.querySelector<HTMLElement>(`[name=${primero}]`)?.focus(); return }
    setEnviando(true)
    const r = await reservar({ inicio: eleccion.f.inicio, nombre: vals.nombre.trim(), email: vals.email.trim(), marca: vals.marca.trim() || undefined, mensaje: vals.mensaje.trim() || undefined, consentimiento: true, trampa })
    setEnviando(false)
    if (r.ok) {
      setMeet(r.meet)
      setPaso('listo')
      foco.current = '[data-foco="listo"]'
    } else if (r.fallo === 'ocupada') {
      // Esa hora ya no está: el hook recargó la lista y se vuelve a ella con el aviso.
      setAviso(base.fallos.ocupada)
      setPaso('fecha')
      setHoja(false)
      setEleccion(null)
      foco.current = '[data-foco="titulo"]'
    } else setFalloEnvio(base.fallos[r.fallo])
  }

  // Paso de datos en el panel (escritorio): la hora sale, el formulario entra por el otro lado. En el móvil el formulario vive en la hoja.
  const deseada = ancho && paso === 'datos' ? 'datos' : 'horas'
  useEffect(() => {
    const nodo = panel.current
    if (!nodo || deseada === vista) return
    const dir = deseada === 'datos' ? 1 : -1
    let hecho = false
    const tw = gsap.to(nodo, { opacity: 0, x: -dir * 18, duration: 0.14, ease: 'power2.out', onComplete: () => { hecho = true; setVista(deseada) } })
    // Si se interrumpe a medias la hora vuelve a su sitio; si terminó, la entrada del otro lado ya se hizo cargo.
    return () => { if (!hecho) { tw.kill(); gsap.set(nodo, { clearProps: 'transform,opacity' }) } }
  }, [deseada, vista])
  useLayoutEffect(() => {
    if (primera.current) { primera.current = false; return }
    const nodo = panel.current
    if (!nodo) return
    const dir = vista === 'datos' ? 1 : -1
    const ctx = gsap.context(() => {
      gsap.fromTo(nodo, { opacity: 0, x: dir * 30 }, { opacity: 1, x: 0, duration: 0.55, ease: 'apple', clearProps: 'transform,opacity' })
      gsap.from(nodo.querySelectorAll('.ap-ag-form > *'), { opacity: 0, y: 10, duration: 0.5, ease: 'apple', stagger: 0.035, delay: 0.05, clearProps: 'transform,opacity' })
    })
    return () => ctx.revert()
  }, [vista])
  // El foco aterriza en el elemento que cada paso pide, ya con el nodo en el DOM (sin desplazar la página).
  const enfocar = useCallback(() => {
    if (!foco.current) return
    const el = document.querySelector<HTMLElement>(`.ap-ag ${foco.current}, .ap-hoja-ag ${foco.current}`)
    if (!el) return
    foco.current = null
    el.focus({ preventScroll: true })
  }, [])
  useLayoutEffect(() => { enfocar() })

  const textoDia = dia ? fmtDia(dia.fecha, locale) : ''
  const resumenDia = eleccion ? fmtDia(eleccion.fecha, locale) : ''
  const resumenHora = eleccion ? rango(eleccion.f, locale) + (zona !== zonaMax ? ` (${fmtHora(eleccion.f.inicio, locale, zonaMax)} · ${x.deMax})` : '') : ''
  const formulario = eleccion && (
    <Formulario idTitulo={idTitulo} textoDia={resumenDia} textoHora={resumenHora} textoZona={zonaTxt} vals={vals} setVals={setVals} errores={errores} enviando={enviando} falloEnvio={falloEnvio}
      onSubmit={enviar} onVolver={ancho ? volver : undefined} formRef={(el) => { form.current = el }} />
  )
  const exito = eleccion && (
    <Listo idTitulo={idTitulo} texto={resumenDia} rangoTxt={rango(eleccion.f, locale) + (zona !== zonaMax ? ` (${fmtHora(eleccion.f.inicio, locale, zonaMax)} · ${x.deMax})` : '')} zonaTxt={zonaTxt} meet={meet} onOtra={otra} x={x} />
  )
  const listoEnLinea = paso === 'listo' && !hoja

  const cabeza = (
    <header className="ap-ag-cab">
      <h2 id="ap-ag-t">{base.titulo}</h2>
      {dias.length > 0 && <p className="ap-ag-meta"><IconoVideo />{base.duracion(duracion)}</p>}
    </header>
  )
  if (listoEnLinea && exito) return <>{cabeza}{exito}</>
  if (!dias.length && estado === 'cargando') return <Esqueleto titulo={base.titulo} cargando={x.cargando} />
  if (!dias.length) {
    const error = estado === 'error'
    return (
      <>
        {cabeza}
        <div className="ap-ag-cuerpo ap-ag-vacio">
          <div role={error ? 'alert' : 'status'}>
            <p>{error ? base.errorCarga : base.sinHuecos}</p>
            <div className="ap-ag-acciones">
              {error && <button type="button" className="ap-btn ap-btn-pri" onClick={() => void recargar()}>{base.reintentar}</button>}
              <button type="button" className={`ap-btn ${error ? 'ap-btn-sec' : 'ap-btn-pri'}`} onClick={alEscribir}>{x.escribir}</button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="ap-ag-cuerpo">
        <div className="ap-ag-izq">
          {cabeza}
          <Calendario dias={dias} meses={meses} mes={mes ?? meses[0]} setMes={setMes} clave={clave} elegirDia={elegirDia} hoy={hoy} locale={locale} x={x} />
        </div>
        <div ref={panel} className="ap-ag-panel">
          {vista === 'datos' && ancho && formulario ? formulario : (
            <Horas dia={dia} eleccion={eleccion} zona={zona} zonaMax={zonaMax} locale={locale} x={x} elegirHora={elegirHora} aviso={aviso}
              textoDia={textoDia} textoZona={zonaTxt} />
          )}
        </div>
      </div>
      <HojaInferior abierta={hoja && !ancho} onCerrar={cerrarHoja} alMontar={enfocar} etiqueta={x.hoja} cerrarEtq={x.cerrar} raiz={raiz}>
        {paso === 'listo' ? exito : formulario}
      </HojaInferior>
      <p className="ap-sr" role="status">{anuncio}</p>
    </>
  )
}

/* ------------------------------------------------------------------ la sección: se monta al acercarse */
/**
 * La sección #agenda. El calendario (y su booking_open, que se mide al montarse) solo se monta cuando la sección se
 * acerca a la vista o cuando la URL trae #agenda; mientras tanto, un esqueleto con su altura.
 */
export default function AgendaSeccion({ forzar, alEscribir }: { forzar: boolean; alEscribir: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const x = useExtra()
  const base = useCopiaAgenda()
  const [visto, setVisto] = useState(false)
  useEffect(() => {
    if (visto || forzar) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setVisto(true); return }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setVisto(true); io.disconnect() } }, { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [visto, forzar])
  const montado = visto || forzar
  return (
    <section id="agenda" ref={ref} className="ap-agenda" aria-labelledby="ap-ag-t" aria-busy={!montado}>
      <div className="ap-ag">
        {montado ? <Agenda alEscribir={alEscribir} /> : <Esqueleto titulo={base.titulo} cargando={x.cargando} />}
      </div>
    </section>
  )
}
