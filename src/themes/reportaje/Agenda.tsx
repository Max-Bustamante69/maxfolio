import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { fmtDia, fmtHora, PRIVACIDAD, useAgenda, type Dia, type Franja } from '../shared/agenda'
import { useCopiaAgendaRp, type CopiaAgenda } from './agenda-copia'
import { gsap } from './motion'
import { Chevron, Flecha } from './piezas'
import './agenda.css'

// La Agenda de El Reportaje: una página de «Agenda» de revista. Los días son columnas de una cartelera (lunes a viernes, una fila por
// semana), las horas del día elegido son un listado a columnas con un filete por línea y la confirmación es un recorte con un sello
// dorado. Todo el estado y la API son de shared/agenda.ts (useAgenda); aquí solo se dibuja y se mueve.
// Movimiento: cada paso sale con un fundido de 160 ms y entra con la gramática de la casa (los filetes se trazan, los textos suben
// dentro de su máscara, el sello cae). No hay nada en reposo: ni rAF propio ni animaciones infinitas.

type Paso = 'elegir' | 'datos' | 'confirmada'
type Vista = 'cargando' | 'vacio' | 'error' | Paso
interface Eleccion { inicio: string; fecha: Date }
interface Reserva extends Eleccion { meet?: string }
interface Errores { nombre?: string; email?: string; consent?: string }

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DIA_MS = 864e5
const PASOS: Paso[] = ['elegir', 'datos', 'confirmada']
const lunes = (f: Date) => (f.getUTCDay() + 6) % 7
const seguro = (u?: string) => (u && /^https:\/\//i.test(u) ? u : undefined)
/** «2:00 p. m.» → [«2:00», «p. m.»]; en 24 h o con el periodo delante (japonés) la cadena queda entera. */
const partirHora = (t: string): [string, string] => {
  const m = t.match(/^(\d{1,2}:\d{2})\s*(\S.*)?$/)
  return m ? [m[1], m[2] ?? ''] : [t, '']
}

/* ------------------------------------------------------------------ cartelera: lunes a viernes (o los días que existan) y una fila por semana */

interface Celda { clave: string; fecha: Date; dia?: Dia }
function armar(dias: Dia[]) {
  if (!dias.length) return { cols: [] as number[], filas: [] as Celda[][] }
  const orden = [...dias].sort((a, b) => a.clave.localeCompare(b.clave))
  const mapa = new Map(orden.map((d) => [d.clave, d]))
  const cols = [...new Set(orden.map((d) => lunes(d.fecha)))].sort((a, b) => a - b)
  const inicio = orden[0].fecha.getTime() - lunes(orden[0].fecha) * DIA_MS
  const fin = orden[orden.length - 1].fecha.getTime()
  const filas: Celda[][] = []
  for (let l = inicio; l <= fin; l += 7 * DIA_MS) {
    const fila = cols.map((c) => {
      const fecha = new Date(l + c * DIA_MS)
      const clave = fecha.toISOString().slice(0, 10)
      return { clave, fecha, dia: mapa.get(clave) }
    })
    if (fila.some((c) => c.dia)) filas.push(fila)
  }
  return { cols, filas }
}

/** Salta con las flechas al vecino más cercano en esa dirección (vale para la cuadrícula y para las columnas del listado). */
function flechas(e: KeyboardEvent<HTMLElement>) {
  const t = e.target as HTMLElement
  if (!t.matches('button')) return
  const lista = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
  let destino: HTMLElement | undefined
  if (e.key === 'Home') destino = lista[0]
  else if (e.key === 'End') destino = lista[lista.length - 1]
  else if (e.key.startsWith('Arrow')) {
    const a = t.getBoundingClientRect()
    const ax = a.left + a.width / 2
    const ay = a.top + a.height / 2
    let mejor = Infinity
    for (const b of lista) {
      if (b === t) continue
      const r = b.getBoundingClientRect()
      const dx = r.left + r.width / 2 - ax
      const dy = r.top + r.height / 2 - ay
      const vale = e.key === 'ArrowRight' ? dx > 8 : e.key === 'ArrowLeft' ? dx < -8 : e.key === 'ArrowDown' ? dy > 8 : dy < -8
      if (!vale) continue
      const d = e.key === 'ArrowRight' || e.key === 'ArrowLeft' ? Math.abs(dx) + Math.abs(dy) * 3 : Math.abs(dy) + Math.abs(dx) * 3
      if (d < mejor) { mejor = d; destino = b }
    }
  } else return
  e.preventDefault()
  destino?.focus()
}

/* ------------------------------------------------------------------ movimiento */

const dentro = (p: HTMLElement, s: string) => Array.from(p.querySelectorAll<HTMLElement>(s))

/** Entrada de una vista: los filetes se trazan, los textos suben dentro de su máscara, lo demás se funde. */
function animarVista(p: HTMLElement | null, vista: Vista) {
  if (!p) return
  const filetes = dentro(p, '[data-ag="filete"]')
  const sube = dentro(p, '[data-ag="sube"]')
  const fade = dentro(p, '[data-ag="fade"]')
  const campos = dentro(p, '[data-ag="campo"]')
  const tl = gsap.timeline({ defaults: { ease: 'rep' } })
  if (vista === 'confirmada') {
    const recorte = dentro(p, '.rp-ag-recorte')
    const sello = dentro(p, '.rp-ag-sello')
    tl.fromTo(recorte, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.75, clearProps: 'clipPath' }, 0)
    if (filetes.length) tl.fromTo(filetes, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.8, clearProps: 'transform' }, 0.3)
    if (sube.length) tl.fromTo(sube, { yPercent: 108 }, { yPercent: 0, duration: 0.7, stagger: 0.07, clearProps: 'transform' }, 0.3)
    if (fade.length) tl.fromTo(fade, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, clearProps: 'transform,opacity' }, 0.55)
    // El sello cae sobre el recorte: más grande y torcido, y se asienta con un golpe seco.
    tl.fromTo(sello, { opacity: 0 }, { opacity: 1, duration: 0.14, ease: 'none', clearProps: 'opacity' }, 0.8)
    tl.fromTo(sello, { scale: 1.6, rotation: -24 }, { scale: 1, rotation: -9, duration: 0.42, ease: 'power4.out', clearProps: 'transform' }, 0.8)
    return
  }
  if (filetes.length) tl.fromTo(filetes, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.7, stagger: { amount: 0.3 }, clearProps: 'transform' }, 0)
  if (sube.length) tl.fromTo(sube, { yPercent: 108 }, { yPercent: 0, duration: 0.6, stagger: { amount: 0.4 }, clearProps: 'transform' }, 0.05)
  if (fade.length) tl.fromTo(fade, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'opacity' }, 0.15)
  if (campos.length) tl.fromTo(campos, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, clearProps: 'transform,opacity' }, 0.2)
}

/** Las horas de un día nuevo se imprimen línea a línea. */
function animarHoras(b: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: 'rep' } })
  tl.fromTo(dentro(b, '[data-ag="filete"]'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.6, stagger: { amount: 0.25 }, clearProps: 'transform' }, 0)
  tl.fromTo(dentro(b, '[data-ag="sube"]'), { yPercent: 108 }, { yPercent: 0, duration: 0.55, stagger: { amount: 0.3 }, clearProps: 'transform' }, 0.04)
  tl.fromTo(dentro(b, '[data-ag="fade"]'), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'opacity' }, 0.1)
}

/* ------------------------------------------------------------------ piezas */

const Tijera = () => (
  <svg className="rp-ag-tijera" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.12 8.12 20 20M20 4 8.12 15.88" />
    </g>
  </svg>
)

/** El sello dorado: relleno claro y trazo hondo (receta del NYT), el día y el mes al centro y la palabra dando la vuelta. */
function Sello({ dia, mes, texto }: { dia: string; mes: string; texto: string }) {
  const aro = `${useId().replace(/:/g, '')}-aro`
  return (
    <svg className="rp-ag-sello" viewBox="0 0 128 128" aria-hidden="true" focusable="false">
      <defs><path id={aro} d="M64 64m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" /></defs>
      <circle cx="64" cy="64" r="61" fill="var(--gold-fill)" stroke="var(--gold-deep)" strokeWidth="1.5" />
      <circle cx="64" cy="64" r="56" fill="none" stroke="var(--gold-deep)" strokeWidth="0.8" />
      <circle cx="64" cy="64" r="33" fill="none" stroke="var(--gold-deep)" strokeWidth="0.8" />
      <text className="rp-ag-sello-aro"><textPath href={`#${aro}`} textLength="286" lengthAdjust="spacing">{`${texto} · ${texto} · `}</textPath></text>
      <text className="rp-ag-sello-dia" x="64" y="70" textAnchor="middle">{dia}</text>
      <text className="rp-ag-sello-mes" x="64" y="88" textAnchor="middle">{mes}</text>
    </svg>
  )
}

function Cabecera({ copia, duracion, paso }: { copia: CopiaAgenda; duracion: number | null; paso: Paso }) {
  const actual = PASOS.indexOf(paso)
  return (
    <header className="rp-ag-cab">
      <div className="rp-ag-filete" data-ag-marco="filete" />
      <div className="rp-ag-cab-fila">
        <div>
          <h2 id="rp-ag-t" className="rp-h2"><span className="rp-ag-m"><span data-ag-marco="sube">{copia.titulo}</span></span></h2>
          <p className="rp-ag-dek">{duracion != null ? copia.dek(duracion) : ''}</p>
        </div>
        <ol className="rp-ag-pasos" aria-label={copia.pasosEtiqueta} data-ag-marco="fade">
          {copia.pasos.map((p, i) => (
            <li key={p} className="rp-ag-paso" data-estado={i < actual ? 'hecho' : undefined} aria-current={i === actual ? 'step' : undefined}>{p}</li>
          ))}
        </ol>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ la sección: se monta al acercarse a la vista (o con #agenda) */

export default function Agenda() {
  const copia = useCopiaAgendaRp()
  const { hash } = useLocation()
  const ref = useRef<HTMLElement>(null)
  const [vivo, setVivo] = useState(false)
  useEffect(() => {
    if (vivo) return
    if (hash === '#agenda') { setVivo(true); return }
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) { setVivo(true); return }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setVivo(true); io.disconnect() } }, { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [vivo, hash])
  return (
    <section id="agenda" ref={ref} className="rp-agenda" aria-label={copia.titulo} data-vivo={vivo ? '1' : '0'}>
      {vivo ? <Viva /> : <div className="rp-ag-esqueleto" aria-hidden="true" />}
    </section>
  )
}

function Viva() {
  const copia = useCopiaAgendaRp()
  const { locale } = useLanguage()
  const { estado, dias, duracion, zona, zonaMax, recargar, reservar, elegir } = useAgenda('reportaje')
  const idDias = useId()

  const raiz = useRef<HTMLDivElement>(null)
  const cuerpo = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const horasRef = useRef<HTMLDivElement>(null)
  const cambiando = useRef(false)
  const enviandoRef = useRef(false)
  const alturaPrev = useRef<number | null>(null)
  const pedirFoco = useRef<'paso' | 'estado' | null>(null)
  const diaVisto = useRef<string | undefined>(undefined)

  const [paso, setPaso] = useState<Paso>('elegir')
  const [diaSel, setDiaSel] = useState<string | null>(null)
  const [sel, setSel] = useState<Eleccion | null>(null)
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [anuncio, setAnuncio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errores, setErrores] = useState<Errores>({})
  const [falloEnvio, setFalloEnvio] = useState<string | null>(null)
  const [campos, setCampos] = useState({ nombre: '', email: '', marca: '', mensaje: '', consent: false, trampa: '' })

  const { cols, filas } = useMemo(() => armar(dias), [dias])
  const activa = dias.some((d) => d.clave === diaSel) ? diaSel! : dias[0]?.clave
  const dia = dias.find((d) => d.clave === activa)
  const vista: Vista = paso !== 'elegir' ? paso : estado === 'listo' ? 'elegir' : estado
  const zonaTxt = zona.replace(/_/g, ' ')

  const larga = useCallback((f: Date) => fmtDia(f, locale), [locale])
  const semana = (f: Date) => fmtDia(f, locale, { weekday: 'long' })
  const fechaCorta = (f: Date) => fmtDia(f, locale, { day: 'numeric', month: 'long' })

  /* ---------- transiciones entre pasos ---------- */
  const salir = (el: HTMLElement | null, s: number, luego: () => void) => {
    if (!el) { luego(); return }
    gsap.to(el, { opacity: 0, y: -8, duration: s, ease: 'power2.out', overwrite: true, onComplete: luego })
  }
  const ir = (sig: Paso) => {
    if (cambiando.current) return
    cambiando.current = true
    salir(panel.current, 0.16, () => {
      alturaPrev.current = cuerpo.current?.offsetHeight ?? null
      pedirFoco.current = 'paso'
      setPaso(sig)
      cambiando.current = false
    })
  }

  // La entrada de cada vista, y la altura del cuerpo que pasa de una a otra sin saltar.
  useLayoutEffect(() => {
    const r = raiz.current
    if (!r) return
    const h0 = alturaPrev.current
    alturaPrev.current = null
    const ctx = gsap.context(() => {
      const wrap = cuerpo.current
      if (wrap && h0 != null) {
        const h1 = wrap.offsetHeight
        if (Math.abs(h1 - h0) > 2) gsap.fromTo(wrap, { height: h0, overflow: 'hidden' }, { height: h1, duration: 0.55, ease: 'rep', clearProps: 'height,overflow' })
      }
      if (vista !== 'cargando') animarVista(panel.current, vista)
    }, r)
    diaVisto.current = activa
    // Foco y encuadre tras un cambio de paso: el primer campo, la hora que se había elegido o el recorte.
    const quiere = pedirFoco.current
    if (quiere && (quiere === 'estado' || vista === 'datos' || vista === 'confirmada' || vista === 'elegir')) {
      pedirFoco.current = null
      const p = panel.current
      const el = quiere === 'estado' ? p?.querySelector<HTMLElement>('[data-ag-foco="estado"]')
        : vista === 'datos' ? p?.querySelector<HTMLElement>('[name="nombre"]')
        : vista === 'confirmada' ? p?.querySelector<HTMLElement>('[data-ag-foco="listo"]')
        : (p?.querySelector<HTMLElement>('.rp-ag-hora[aria-pressed="true"]') ?? p?.querySelector<HTMLElement>('[data-ag-foco="horas"]'))
      el?.focus({ preventScroll: true })
      const top = r.getBoundingClientRect().top
      if (top < 64 || top > window.innerHeight * 0.55) window.scrollTo({ top: window.scrollY + top - 64, behavior: 'smooth' })
    }
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista])

  // Un día nuevo: sus horas se imprimen otra vez.
  useLayoutEffect(() => {
    if (vista !== 'elegir' || diaVisto.current === activa) return
    diaVisto.current = activa
    const b = horasRef.current
    if (!b) return
    const ctx = gsap.context(() => animarHoras(b), b)
    return () => ctx.revert()
  }, [activa, vista])

  // El marco (filete, título, pasos) se imprime una sola vez, al montarse.
  useLayoutEffect(() => {
    const r = raiz.current
    if (!r) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'rep' } })
      tl.fromTo('[data-ag-marco="filete"]', { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.9, clearProps: 'transform' }, 0)
      tl.fromTo('[data-ag-marco="sube"]', { yPercent: 108 }, { yPercent: 0, duration: 0.8, clearProps: 'transform' }, 0.1)
      tl.fromTo('[data-ag-marco="fade"]', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, clearProps: 'transform,opacity' }, 0.25)
    }, r)
    return () => ctx.revert()
  }, [])

  /* ---------- acciones ---------- */
  const escogerDia = (k: string) => {
    if (k === activa || cambiando.current) return
    cambiando.current = true
    const d = dias.find((x) => x.clave === k)
    salir(horasRef.current, 0.12, () => {
      setDiaSel(k)
      if (d) setAnuncio(copia.anuncio.dia(larga(d.fecha), copia.horasLibres(d.franjas.length)))
      cambiando.current = false
    })
  }
  const escogerHora = (f: Franja) => {
    if (!dia) return
    elegir()
    setSel({ inicio: f.inicio, fecha: dia.fecha })
    setAviso(null)
    setFalloEnvio(null)
    setErrores({})
    setAnuncio(copia.anuncio.datos(larga(dia.fecha), fmtHora(f.inicio, locale)))
    ir('datos')
  }
  const volver = () => { setAnuncio(copia.anuncio.horas); ir('elegir') }
  const otra = () => {
    setReserva(null)
    setSel(null)
    setAnuncio(copia.anuncio.horas)
    ir('elegir')
  }
  const reintentar = () => { pedirFoco.current = 'estado'; void recargar() }
  const alFormulario = () => document.getElementById('rp-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (enviandoRef.current || !sel) return
    const n: Errores = {}
    if (campos.nombre.trim().length < 2) n.nombre = copia.faltaNombre
    if (!CORREO_OK.test(campos.email.trim())) n.email = copia.faltaCorreo
    if (!campos.consent) n.consent = copia.faltaConsent
    setErrores(n)
    setFalloEnvio(null)
    const primero = n.nombre ? 'nombre' : n.email ? 'email' : n.consent ? 'consent' : null
    if (primero) { panel.current?.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus(); return }
    enviandoRef.current = true
    setEnviando(true)
    const r = await reservar({
      inicio: sel.inicio,
      nombre: campos.nombre.trim(),
      email: campos.email.trim(),
      marca: campos.marca.trim() || undefined,
      mensaje: campos.mensaje.trim() || undefined,
      consentimiento: true,
      trampa: campos.trampa,
    })
    enviandoRef.current = false
    setEnviando(false)
    if (r.ok) {
      setReserva({ ...sel, meet: seguro(r.meet) })
      setCampos((c) => ({ ...c, mensaje: '', consent: false }))
      setAnuncio(copia.anuncio.listo(larga(sel.fecha), fmtHora(sel.inicio, locale)))
      ir('confirmada')
      return
    }
    if (r.fallo === 'ocupada') {
      // El hook ya pidió la lista otra vez: se vuelve a las horas con el aviso.
      setSel(null)
      setAviso(copia.fallos.ocupada)
      setAnuncio(copia.fallos.ocupada)
      ir('elegir')
      return
    }
    setFalloEnvio(copia.fallos[r.fallo])
  }

  /* ---------- vistas ---------- */
  let contenido
  if (vista === 'cargando') {
    contenido = (
      <div className="rp-ag-elegir rp-ag-fantasma" aria-busy="true">
        <div>
          <div className="rp-ag-filete" />
          <div className="rp-ag-cols" style={{ '--cols': 5 } as CSSProperties} aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => <span key={`h${i}`} className="rp-ag-sem-h" data-c={i} />)}
            {Array.from({ length: 15 }, (_, i) => <span key={i} className="rp-ag-dia rp-ag-dia-off" data-c={i % 5} />)}
          </div>
        </div>
        <div>
          <div className="rp-ag-filete" />
          <p className="rp-mono rp-ag-estado" role="status" tabIndex={-1} data-ag-foco="estado">{copia.cargando}</p>
          <div className="rp-ag-horas" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => <span key={i} className="rp-ag-fantasma-fila" />)}
          </div>
        </div>
      </div>
    )
  } else if (vista === 'vacio' || vista === 'error') {
    const malo = vista === 'error'
    contenido = (
      <div className="rp-ag-aparte">
        <div className="rp-ag-filete" data-ag="filete" />
        <p className="rp-ag-aparte-t" role={malo ? 'alert' : 'status'} tabIndex={-1} data-ag-foco="estado" data-ag="fade">{malo ? copia.errorCarga : copia.sinHuecos}</p>
        {malo
          ? <button type="button" className="rp-btn rp-btn-linea rp-btn-chico" onClick={reintentar} data-ag="fade">{copia.reintentar}</button>
          : <button type="button" className="rp-enlace" onClick={alFormulario} data-ag="fade">{copia.irFormulario}<Flecha /></button>}
      </div>
    )
  } else if (vista === 'elegir' && dia) {
    const [sem, restoFecha] = [semana(dia.fecha), fechaCorta(dia.fecha)]
    const primera = filas[0]?.[0]?.fecha
    const ultima = filas[filas.length - 1]?.[0]?.fecha
    const mes = primera && ultima
      ? (primera.getUTCMonth() === ultima.getUTCMonth() && primera.getUTCFullYear() === ultima.getUTCFullYear()
        ? fmtDia(primera, locale, { month: 'long', year: 'numeric' })
        : `${fmtDia(primera, locale, { month: 'long' })} – ${fmtDia(ultima, locale, { month: 'long', year: 'numeric' })}`)
      : ''
    const mayus = mes.charAt(0).toUpperCase() + mes.slice(1)
    contenido = (
      <div className="rp-ag-elegir">
        <div className="rp-ag-cal">
          <div className="rp-ag-filete" data-ag="filete" />
          <div className="rp-ag-cal-cab">
            <p className="rp-mono" id={idDias}>{copia.elegirDia}</p>
            <p className="rp-nota" data-ag="fade">{mayus}</p>
          </div>
          <div className="rp-ag-cols" role="group" aria-labelledby={idDias} style={{ '--cols': cols.length } as CSSProperties} onKeyDown={flechas}>
            {cols.map((c, i) => (
              <span key={c} className="rp-ag-sem-h rp-mono" data-c={i} aria-hidden="true" data-ag="fade">{fmtDia(filas[0][i].fecha, locale, { weekday: 'short' })}</span>
            ))}
            {filas.flat().map((c, k) => {
              const i = k % cols.length
              const num = String(c.fecha.getUTCDate())
              const primeroDelMes = c.fecha.getUTCDate() === 1 || (k === 0)
              const marca = primeroDelMes ? <small className="rp-ag-mes">{fmtDia(c.fecha, locale, { month: 'short' }).replace(/\.$/, '')}</small> : null
              if (!c.dia) {
                return <span key={c.clave} className="rp-ag-dia rp-ag-dia-off" data-c={i} aria-hidden="true"><span className="rp-ag-m"><span className="rp-ag-n">{num}</span></span></span>
              }
              const n = c.dia.franjas.length
              return (
                <button key={c.clave} type="button" className="rp-ag-dia" data-c={i} aria-pressed={c.clave === activa} aria-label={`${larga(c.fecha)}, ${copia.horasLibres(n)}`} onClick={() => escogerDia(c.clave)}>
                  <span className="rp-ag-m"><span className="rp-ag-n" data-ag="sube">{num}</span>{marca}</span>
                  <span className="rp-ag-t">{copia.horasCorto(n)}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div key={activa} className="rp-ag-horas-bloque" ref={horasRef}>
          <div className="rp-ag-filete" data-ag="filete" />
          <div className="rp-ag-dia-cab">
            <h3 className="rp-ag-dia-t" tabIndex={-1} data-ag-foco="horas" aria-label={larga(dia.fecha)}>
              <span className="rp-ag-m"><span data-ag="sube"><span className="rp-ag-sem">{sem}</span> {restoFecha}</span></span>
            </h3>
            <p className="rp-mono" data-ag="fade">{copia.elegirHora}</p>
          </div>
          <p className="rp-nota rp-ag-zona" data-ag="fade">{copia.frase(copia.horasLibres(dia.franjas.length), copia.zona(zonaTxt))}</p>
          {aviso && <p className="rp-ag-aviso" role="alert">{aviso}</p>}
          <div role="group" aria-label={`${copia.elegirHora}, ${larga(dia.fecha)}`} onKeyDown={flechas}>
            <ul className="rp-ag-horas">
              {dia.franjas.map((f) => {
                const h = fmtHora(f.inicio, locale)
                const hm = fmtHora(f.inicio, locale, zonaMax)
                const max = hm !== h ? hm : null
                const [t, ap] = partirHora(h)
                return (
                  <li key={f.inicio}>
                    <button type="button" className="rp-ag-hora" aria-pressed={f.inicio === sel?.inicio} aria-label={`${h}, ${larga(dia.fecha)}${max ? `, ${copia.horaMax(max)}` : ''}`} onClick={() => escogerHora(f)}>
                      <span className="rp-ag-hora-col">
                        <span className="rp-ag-m"><span className="rp-ag-hora-t" data-ag="sube">{t}{ap && <small>{ap}</small>}</span></span>
                        {max && <span className="rp-ag-hora-max">({copia.horaMaxCorta(max)})</span>}
                      </span>
                      <Flecha className="rp-flecha rp-ag-flecha" />
                      <span className="rp-ag-fil" data-ag="filete" aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    )
  } else if (vista === 'datos' && sel) {
    const h = fmtHora(sel.inicio, locale)
    const hm = fmtHora(sel.inicio, locale, zonaMax)
    const campo = (k: keyof Errores) => ({ 'aria-invalid': !!errores[k], 'aria-describedby': errores[k] ? `ag-e-${k}` : undefined })
    contenido = (
      <div className="rp-ag-datos">
        <aside className="rp-ag-ficha" aria-label={copia.tuHora}>
          <div className="rp-ag-filete" data-ag="filete" />
          <p className="rp-mono rp-ag-ficha-k" data-ag="fade">{copia.tuHora}</p>
          <p className="rp-ag-ficha-g">
            <span className="rp-ag-m"><span className="rp-ag-sem" data-ag="sube">{semana(sel.fecha)}</span></span>
            <span className="rp-ag-m"><span data-ag="sube">{fechaCorta(sel.fecha)}</span></span>
            <span className="rp-ag-m"><span data-ag="sube"><mark>{h}</mark></span></span>
          </p>
          <p className="rp-nota" data-ag="fade">{copia.reunion(duracion)}</p>
          <p className="rp-nota" data-ag="fade">{copia.zona(zonaTxt)}{hm !== h ? ` (${copia.horaMax(hm)})` : ''}</p>
          <button type="button" className="rp-enlace rp-ag-cambiar" onClick={volver} data-ag="fade"><Chevron izquierda />{copia.cambiar}</button>
        </aside>

        <form className="rp-ag-form" onSubmit={enviar} noValidate>
          <div className="rp-ag-filete rp-ag-ancho" data-ag="filete" />
          <div className="rp-campo" data-ag="campo">
            <label><span className="rp-meta">{copia.nombre}</span>
              <input name="nombre" type="text" autoComplete="name" placeholder={copia.nombreEj} required value={campos.nombre} onChange={(e) => setCampos({ ...campos, nombre: e.target.value })} {...campo('nombre')} />
            </label>
            {errores.nombre && <em id="ag-e-nombre" role="alert">{errores.nombre}</em>}
          </div>
          <div className="rp-campo" data-ag="campo">
            <label><span className="rp-meta">{copia.email}</span>
              <input name="email" type="email" inputMode="email" autoComplete="email" placeholder={copia.emailEj} required value={campos.email} onChange={(e) => setCampos({ ...campos, email: e.target.value })} {...campo('email')} />
            </label>
            {errores.email && <em id="ag-e-email" role="alert">{errores.email}</em>}
          </div>
          <div className="rp-campo rp-ag-ancho" data-ag="campo">
            <label><span className="rp-meta">{copia.marca}</span>
              <input name="marca" type="text" autoComplete="organization" placeholder={copia.marcaEj} value={campos.marca} onChange={(e) => setCampos({ ...campos, marca: e.target.value })} />
            </label>
          </div>
          <div className="rp-campo rp-ag-ancho" data-ag="campo">
            <label><span className="rp-meta">{copia.mensaje}</span>
              <textarea name="mensaje" rows={3} placeholder={copia.mensajeEj} value={campos.mensaje} onChange={(e) => setCampos({ ...campos, mensaje: e.target.value })} />
            </label>
          </div>
          {/* Campo trampa: una persona no lo ve ni lo toca; un bot lo rellena. */}
          <input className="rp-ag-trampa" name="sitio_web_hp" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={campos.trampa} onChange={(e) => setCampos({ ...campos, trampa: e.target.value })} />
          <div className="rp-ag-ancho" data-ag="campo">
            <label className="rp-ag-ok">
              <input name="consent" type="checkbox" checked={campos.consent} onChange={(e) => setCampos({ ...campos, consent: e.target.checked })} required {...campo('consent')} />
              <span className="rp-ag-caja" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m3 8.5 3.2 3.2L13 4.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" pathLength="1" /></svg></span>
              <span>{copia.consentimiento} <a href={PRIVACIDAD} target="_blank" rel="noopener noreferrer">{copia.aviso}</a></span>
            </label>
            {errores.consent && <em className="rp-ag-err" id="ag-e-consent" role="alert">{errores.consent}</em>}
          </div>
          <div className="rp-ag-ancho" data-ag="campo">
            <button type="submit" className="rp-btn rp-btn-pri rp-enviar" aria-busy={enviando} disabled={enviando}>
              {enviando ? copia.enviando : <>{copia.confirmar}<Flecha /></>}
            </button>
            {falloEnvio && <p className="rp-error" role="alert">{falloEnvio}</p>}
          </div>
        </form>
      </div>
    )
  } else if (vista === 'confirmada' && reserva) {
    const h = fmtHora(reserva.inicio, locale)
    const enlace = reserva.meet
    contenido = (
      <div className="rp-ag-conf">
        <div className="rp-ag-recorte-caja">
          <article className="rp-ag-recorte" aria-labelledby="ag-conf-t">
            <Tijera />
            <h3 id="ag-conf-t" className="rp-ag-conf-t" tabIndex={-1} data-ag-foco="listo"><span className="rp-ag-m"><span data-ag="sube">{copia.listo}</span></span></h3>
            <div className="rp-ag-filete rp-ag-conf-sep" data-ag="filete" />
            <p className="rp-ag-conf-g">
              <span className="rp-ag-m"><span className="rp-ag-sem" data-ag="sube">{semana(reserva.fecha)}</span></span>
              <span className="rp-ag-m"><span data-ag="sube">{fechaCorta(reserva.fecha)}</span></span>
              <span className="rp-ag-m"><span data-ag="sube"><mark>{h}</mark></span></span>
            </p>
            <p className="rp-nota" data-ag="fade">{copia.frase(copia.reunion(duracion), copia.zona(zonaTxt))}</p>
            <p className="rp-ag-conf-det" data-ag="fade">{copia.listoDetalle}</p>
            <div className="rp-ag-conf-acc" data-ag="fade">
              {enlace && <a className="rp-btn rp-btn-pri" href={enlace} target="_blank" rel="noopener noreferrer">{copia.meet}<Flecha /></a>}
              <button type="button" className="rp-enlace" onClick={otra}>{copia.otra}</button>
            </div>
            {enlace && <p className="rp-nota rp-ag-conf-url" data-ag="fade"><span className="rp-sr">{copia.meetNota}: </span>{enlace.replace(/^https:\/\//i, '')}</p>}
          </article>
          <Sello dia={String(reserva.fecha.getUTCDate())} mes={fmtDia(reserva.fecha, locale, { month: 'short' }).replace(/\.$/, '')} texto={copia.sello} />
        </div>
      </div>
    )
  }

  return (
    <div className="rp-ag" ref={raiz} lang={locale}>
      <Cabecera copia={copia} duracion={dias.length ? duracion : null} paso={paso} />
      <div className="rp-ag-cuerpo" ref={cuerpo}>
        <div key={vista} className="rp-ag-panel" ref={panel}>{contenido}</div>
      </div>
      <p className="rp-sr" role="status" aria-live="polite" aria-atomic="true">{anuncio}</p>
    </div>
  )
}

