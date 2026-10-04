import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { fmtDia, fmtHora, PRIVACIDAD, useAgenda, type Dia, type Franja } from '../shared/agenda'
import { useCopiaIng } from './agenda-copy'
import { useCopy } from './copy'
import { gsap, SALE } from './motion'
import { Flecha } from './piezas'
import { usePublico } from './publico'
import './agenda.css'

// «Programar sesión técnica»: la reserva de la dirección Ingeniería dibujada como una ficha de especificación.
// Tabla de días y de franjas con filas tipo configurador (check al elegir), bloque de título con lo que la API da de verdad
// (duración, zona, canal) y, al confirmar, una orden de trabajo. Los datos salen de useAgenda('ingenieria'); aquí solo se dibuja.
// El componente se monta cuando la sección se acerca a la vista (useAgenda mide booking_open al montarse).

type Paso = 'franja' | 'datos' | 'orden'
type Vista = Paso | 'cargando' | 'error' | 'vacio'
type Foco = 'nombre' | 'hora' | 'titulo' | 'aviso'
interface Errores { nombre?: string; correo?: string; acepto?: string }
interface Elegida { fecha: Date; f: Franja }

const ORDEN: Record<Paso, number> = { franja: 0, datos: 1, orden: 2 }
const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BCP: Record<Locale, string> = { es: 'es-CO', en: 'en-US', ja: 'ja-JP' }
const DATOS_VACIOS = { nombre: '', correo: '', marca: '', mensaje: '', acepto: false, trampa: '' }

const claveDia = (iso: string, zona: string) => new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))

/** La hora de Max para una franja, solo si difiere de la del visitante (con el día corto si cae en otro día). */
function horaMax(f: Franja, locale: Locale, zona: string, zonaMax: string): string {
  if (zona === zonaMax) return ''
  const h = fmtHora(f.inicio, locale, zonaMax)
  const otroDia = claveDia(f.inicio, zona) !== claveDia(f.inicio, zonaMax)
  if (!otroDia && h === fmtHora(f.inicio, locale, zona)) return ''
  return otroDia ? `${new Intl.DateTimeFormat(BCP[locale], { timeZone: zonaMax, weekday: 'short' }).format(new Date(f.inicio))} ${h}` : h
}

const lunesDe = (f: Date) => {
  const d = new Date(f)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d
}
/** Los días con huecos agrupados por semana (lunes a domingo): una semana por página de la tabla. */
function semanasDe(dias: Dia[]) {
  const m = new Map<number, Dia[]>()
  for (const d of dias) {
    const k = lunesDe(d.fecha).getTime()
    m.set(k, [...(m.get(k) ?? []), d])
  }
  return [...m].sort((a, b) => a[0] - b[0]).map(([k, ds]) => ({ lunes: new Date(k), dias: ds }))
}

/* ------------------------------------------------------------------ piezas */

const Tilde = () => (
  <svg className="ag-tilde" viewBox="0 0 12 10" width="12" height="10" aria-hidden="true" focusable="false">
    <path d="M1.4 5.3 4.5 8.2 10.6 1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/** La zona horaria puede partirse tras la barra (Europe/ Madrid) en pantallas estrechas; el texto copiado sigue entero. */
const Zona = ({ z }: { z: string }) => <>{z.split('/').map((t, i, a) => (i < a.length - 1 ? <span key={i}>{t}/<wbr /></span> : t))}</>
const Marca = () => <span className="ag-marca" aria-hidden="true"><Tilde /></span>
const Alerta = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 4.5v4.2M8 11v.1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

/** Marcador de lugar mientras la sección no está cerca: la misma altura que la ficha, sin movimiento. */
function Esqueleto() {
  return (
    <div className="ag-esq" aria-hidden="true">
      <span className="ag-esq-b ag-esq-t" />
      <div className="ag-esq-ficha">{[0, 1, 2, 3].map((i) => <span key={i} className="ag-esq-b" />)}</div>
      <div className="ag-esq-cuerpo">
        <div className="ag-esq-col">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="ag-esq-b ag-esq-f" />)}</div>
        <div className="ag-esq-col"><span className="ag-esq-b ag-esq-et" /><div className="ag-esq-hg">{Array.from({ length: 12 }, (_, i) => <span key={i} className="ag-esq-b ag-esq-f" />)}</div></div>
      </div>
    </div>
  )
}

/** Filas de relleno mientras llegan los huecos (misma retícula que la tabla real: 5 días y 18 franjas). */
function Cargando() {
  return (
    <div className="ag-p" data-cargando>
      <div className="ag-col ag-esq-col">
        <span className="ag-esq-b ag-esq-et" />
        {[0, 1, 2, 3, 4].map((i) => <span key={i} className="ag-esq-b ag-esq-f" />)}
      </div>
      <div className="ag-col">
        <span className="ag-esq-b ag-esq-et" />
        <div className="ag-esq-hg">{Array.from({ length: 18 }, (_, i) => <span key={i} className="ag-esq-b ag-esq-f" />)}</div>
      </div>
    </div>
  )
}

/** Raíz de la sección: ancla #agenda; monta la ficha al acercarse (o ya, si la URL trae #agenda). */
export default function Agenda() {
  const c = useCopiaIng()
  const ref = useRef<HTMLElement>(null)
  const { hash } = useLocation()
  const [montada, setMontada] = useState(hash === '#agenda')

  useEffect(() => { if (hash === '#agenda') setMontada(true) }, [hash])
  useEffect(() => {
    const el = ref.current
    if (montada || !el) return
    if (!('IntersectionObserver' in window)) { setMontada(true); return }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setMontada(true); io.disconnect() } }, { rootMargin: '600px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [montada])

  return (
    <section id="agenda" ref={ref} className="ag-sec" aria-label={c.titulo}>
      {montada ? <Hoja /> : <Esqueleto />}
    </section>
  )
}

/* ------------------------------------------------------------------ la ficha */

function Hoja() {
  const { locale } = useLanguage()
  const c = useCopiaIng()
  const copy = useCopy()
  const { personal } = usePublico()
  const { estado, dias, duracion, zona, zonaMax, recargar, reservar, elegir } = useAgenda('ingenieria')

  const [paso, setPaso] = useState<Paso>('franja')
  const [diaSel, setDiaSel] = useState<string | null>(null)
  const [elegida, setElegida] = useState<Elegida | null>(null)
  const [foco, setFoco] = useState(0)
  const [datos, setDatos] = useState(DATOS_VACIOS)
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [falla, setFalla] = useState('')
  const [meet, setMeet] = useState<string | undefined>()
  const [anuncio, setAnuncio] = useState('')

  const raiz = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const horas = useRef<HTMLDivElement>(null)
  const ctx = useRef<gsap.Context | null>(null)
  const saliendo = useRef(false)
  const enviandoRef = useRef(false)
  const enfocar = useRef<Foco | null>(null)
  const dir = useRef(0)
  const vistaPrev = useRef<Vista | null>(null)
  const selPrev = useRef<{ dia?: string; sem: number } | null>(null)
  const nombreRef = useRef<HTMLInputElement>(null)
  const correoRef = useRef<HTMLInputElement>(null)
  const aceptoRef = useRef<HTMLInputElement>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const avisoRef = useRef<HTMLParagraphElement>(null)
  const pasosRef = useRef<HTMLOListElement>(null)
  const barraRef = useRef<HTMLSpanElement>(null)

  const semanas = useMemo(() => semanasDe(dias), [dias])
  const dia = dias.find((d) => d.clave === diaSel) ?? dias[0]
  const semIdx = Math.max(0, semanas.findIndex((s) => s.dias.some((d) => d.clave === dia?.clave)))
  const semana = semanas[semIdx]
  const vista: Vista = paso !== 'franja' ? paso : estado === 'cargando' ? 'cargando' : estado === 'error' ? 'error' : dias.length ? 'franja' : 'vacio'

  // Todo lo que anima vive en un gsap.context y se revierte al desmontar.
  useLayoutEffect(() => {
    ctx.current = gsap.context(() => {}, raiz.current ?? undefined)
    return () => { ctx.current?.revert(); ctx.current = null }
  }, [])

  /** Deja la parte alta de la ficha a la vista (bajo la barra fija) cuando un paso la dejó arriba del borde. */
  const asegurar = (v: Vista) => {
    // En pantallas estrechas el panel de los pasos 2 y 3 queda bajo la cabecera y el bloque de título: se lleva al panel.
    const el = window.innerWidth < 1024 && (v === 'datos' || v === 'orden') ? panel.current : raiz.current
    if (!el) return
    const nav = parseFloat(getComputedStyle(el.closest('.v5-ingenieria') ?? document.body).getPropertyValue('--ing-nav')) || 64
    const top = el.getBoundingClientRect().top
    if (top < nav) window.scrollTo({ top: window.scrollY + top - nav - 12, behavior: 'smooth' })
  }

  /** Cambia de paso: el panel actual sale (rápido), el nuevo entra desde su lado con sus filas escalonadas. */
  const ir = (sig: Paso, o: { enfocar?: Foco; espera?: number } = {}) => {
    if (saliendo.current) return
    enfocar.current = o.enfocar ?? null
    dir.current = ORDEN[sig] > ORDEN[paso] ? 1 : -1
    const p = panel.current
    if (!p) { setPaso(sig); return }
    saliendo.current = true
    ctx.current?.add(() => {
      gsap.to(p, { opacity: 0, x: -18 * dir.current, duration: 0.14, delay: o.espera ?? 0, ease: 'power2.out', onComplete: () => { saliendo.current = false; setPaso(sig) } })
    })
  }

  // Entrada de cada vista nueva: el panel entra y sus filas (data-fila) suben una tras otra. Desde el esqueleto, solo las filas.
  useLayoutEffect(() => {
    const p = panel.current
    if (vista === 'cargando' || !p) { vistaPrev.current = vista; return }
    const nueva = vistaPrev.current !== vista
    vistaPrev.current = vista
    if (!nueva) return
    const lado = dir.current
    dir.current = 0
    ctx.current?.add(() => {
      gsap.fromTo(p, { opacity: 0, x: 24 * lado }, { opacity: 1, x: 0, duration: 0.5, ease: SALE, clearProps: 'transform,opacity' })
      const filas = p.querySelectorAll('[data-fila]')
      if (filas.length) gsap.from(filas, { opacity: 0, y: 10, duration: 0.5, ease: SALE, stagger: { amount: 0.3 }, clearProps: 'transform,opacity' })
    })
    const f = enfocar.current
    enfocar.current = null
    if (f === 'nombre') nombreRef.current?.focus({ preventScroll: true })
    else if (f === 'hora') p.querySelector<HTMLElement>('[aria-pressed="true"], input:checked')?.focus({ preventScroll: true })
    else if (f === 'titulo') tituloRef.current?.focus({ preventScroll: true })
    else if (f === 'aviso') avisoRef.current?.focus({ preventScroll: true })
    if (f) asegurar(vista)
  }, [vista])

  // Cambiar de día vuelve a escalonar las horas; cambiar de semana, los días.
  useLayoutEffect(() => {
    const p = panel.current
    const previo = selPrev.current
    selPrev.current = { dia: dia?.clave, sem: semIdx }
    if (vista !== 'franja' || !p || !previo || previo.dia === undefined) return
    ctx.current?.add(() => {
      if (previo.sem !== semIdx) gsap.fromTo(p.querySelectorAll('.ag-fila-dia'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: SALE, stagger: { amount: 0.12 }, overwrite: 'auto', clearProps: 'transform,opacity' })
      if (previo.dia !== dia?.clave) gsap.fromTo(p.querySelectorAll('.ag-hora'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: SALE, stagger: { amount: 0.2 }, overwrite: 'auto', clearProps: 'transform,opacity' })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia?.clave, semIdx])

  // La barra de acento del paso activo se desliza hasta su etiqueta (transición CSS: nada pide fotogramas en reposo).
  useLayoutEffect(() => {
    const ol = pasosRef.current
    const barra = barraRef.current
    if (!ol || !barra) return
    const medir = () => {
      const li = ol.querySelector<HTMLElement>('[aria-current="step"]')
      if (!li) return
      barra.style.setProperty('--x', `${li.offsetLeft}px`)
      barra.style.setProperty('--w', String(li.offsetWidth))
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(ol)
    const t = window.setTimeout(() => barra.setAttribute('data-lista', ''), 80)
    return () => { ro.disconnect(); window.clearTimeout(t) }
  }, [paso])

  // Lo que anuncia la región en vivo: la carga y el resultado de cada día elegido.
  useEffect(() => {
    if (estado === 'cargando') setAnuncio(c.cargando)
    else if (estado === 'listo' && dias.length) setAnuncio(c.dias(dias.length))
    else if (estado === 'vacio') setAnuncio(c.sinHuecos)
    else if (estado === 'error') setAnuncio(c.errorCarga)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  const elegirDia = (d: Dia) => {
    setDiaSel(d.clave)
    setFoco(0)
    setAnuncio(`${fmtDia(d.fecha, locale)}: ${c.franjas(d.franjas.length)}`)
    // En pantallas estrechas las horas quedan debajo de la tabla: se acercan si quedaron lejos.
    window.setTimeout(() => {
      const r = horas.current?.getBoundingClientRect()
      if (r && window.innerWidth < 1024 && r.top > window.innerHeight * 0.6) window.scrollBy({ top: r.top - window.innerHeight * 0.3, behavior: 'smooth' })
    }, 60)
  }
  const cambiarSemana = (i: number) => {
    const s = semanas[i]
    if (s) elegirDia(s.dias[0])
  }
  const elegirHora = (d: Dia, f: Franja) => {
    if (saliendo.current) return
    setElegida({ fecha: d.fecha, f })
    setAviso('')
    elegir()
    ir('datos', { enfocar: 'nombre', espera: 0.12 })
  }
  const volver = () => {
    if (dia && elegida) setFoco(Math.max(0, dia.franjas.findIndex((f) => f.inicio === elegida.f.inicio)))
    ir('franja', { enfocar: 'hora' })
  }
  const otra = () => {
    setElegida(null)
    setMeet(undefined)
    setFalla('')
    setErrores({})
    setDatos((d) => ({ ...DATOS_VACIOS, nombre: d.nombre, correo: d.correo, marca: d.marca }))
    ir('franja', { enfocar: 'hora' })
  }

  /** Flechas, inicio y fin entre las horas (una sola parada de tabulación, como en una barra de herramientas). */
  const teclasHoras = (e: KeyboardEvent<HTMLDivElement>) => {
    const bs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'))
    const i = bs.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    const cols = getComputedStyle(e.currentTarget).gridTemplateColumns.split(' ').length
    const mover: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + cols, ArrowUp: i - cols, Home: 0, End: bs.length - 1 }
    if (!(e.key in mover)) return
    e.preventDefault()
    const j = Math.max(0, Math.min(bs.length - 1, mover[e.key]))
    setFoco(j)
    bs[j].focus()
  }

  const cambia = (k: 'nombre' | 'correo' | 'marca' | 'mensaje' | 'trampa') => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value
    setDatos((d) => ({ ...d, [k]: v }))
    if (k === 'nombre' || k === 'correo') setErrores((x) => ({ ...x, [k]: undefined }))
  }

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (enviandoRef.current || !elegida) return
    const nuevos: Errores = {
      nombre: datos.nombre.trim().length < 2 ? c.errores.nombre : undefined,
      correo: CORREO_OK.test(datos.correo.trim()) ? undefined : c.errores.correo,
      acepto: datos.acepto ? undefined : c.errores.acepto,
    }
    setErrores(nuevos)
    setFalla('')
    const primero = nuevos.nombre ? nombreRef : nuevos.correo ? correoRef : nuevos.acepto ? aceptoRef : null
    if (primero) { primero.current?.focus(); return }
    enviandoRef.current = true
    setEnviando(true)
    const r = await reservar({
      inicio: elegida.f.inicio,
      nombre: datos.nombre.trim(),
      email: datos.correo.trim(),
      marca: datos.marca.trim() || undefined,
      mensaje: datos.mensaje.trim() || undefined,
      consentimiento: true,
      trampa: datos.trampa,
    })
    enviandoRef.current = false
    setEnviando(false)
    if (r.ok) { setMeet(r.meet); setAviso(''); ir('orden', { enfocar: 'titulo' }); return }
    if (r.fallo === 'ocupada') { setAviso(c.fallos.ocupada); setElegida(null); ir('franja', { enfocar: 'aviso' }); return }
    setFalla(c.fallos[r.fallo])
  }

  const irAlFormulario = () => {
    const f = document.getElementById('ing-form')
    f?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => f?.querySelector<HTMLInputElement>('[name=tienda]')?.focus({ preventScroll: true }), 450)
  }

  const meetOk = meet && /^https:\/\//.test(meet) ? meet : undefined

  return (
    <div className="ag-hoja" ref={raiz} aria-busy={estado === 'cargando'}>
      <p className="ing-sr" role="status" aria-live="polite" aria-atomic="true">{anuncio}</p>

      <header className="ag-cab">
        <h2 id="ag-titulo" className="ag-titulo">{c.titulo}</h2>
        <div className="ag-pasos-w">
          <ol className="ag-pasos" aria-label={c.pasos.etq} ref={pasosRef}>
            {c.pasos.lista.map((t, i) => (
              <li key={t} className="ag-paso" aria-current={ORDEN[paso] === i ? 'step' : undefined} data-hecho={ORDEN[paso] > i || undefined}>
                <b>{String(i + 1).padStart(2, '0')}</b>{t}
              </li>
            ))}
          </ol>
          <span className="ag-barra" ref={barraRef} aria-hidden="true" />
        </div>
      </header>

      <dl className="ag-ficha">
        <div><dt>{c.ficha.con}</dt><dd>{personal.name}</dd></div>
        <div><dt>{c.ficha.duracion}</dt><dd>{c.ficha.min(duracion)}</dd></div>
        <div><dt>{c.ficha.canal}</dt><dd>{c.ficha.canalV}</dd></div>
        <div><dt>{c.ficha.zona}</dt><dd><Zona z={zona} /></dd></div>
      </dl>

      {aviso && (
        <p className="ag-aviso" role="alert" tabIndex={-1} ref={avisoRef}><Alerta />{aviso}</p>
      )}

      <div className="ag-cuerpo" data-vista={vista}>
        {vista === 'cargando' && <Cargando />}

        {vista === 'error' && (
          <div className="ag-p ag-p-msg" ref={panel}>
            <div className="ag-msg">
              <p className="ag-msg-t" role="alert" data-fila>{c.errorCarga}</p>
              <div className="ag-msg-a" data-fila>
                <button type="button" className="ing-btn ing-btn-sec" onClick={() => void recargar()}>{c.reintentar}</button>
                <button type="button" className="ing-enlace" onClick={irAlFormulario}>{copy.contacto.form}<Flecha /></button>
              </div>
            </div>
          </div>
        )}

        {vista === 'vacio' && (
          <div className="ag-p ag-p-msg" ref={panel}>
            <div className="ag-msg">
              <p className="ag-msg-t" role="status" data-fila>{c.sinHuecos}</p>
              <div className="ag-msg-a" data-fila>
                <button type="button" className="ing-btn ing-btn-sec" onClick={irAlFormulario}>{copy.contacto.form}<Flecha /></button>
              </div>
            </div>
          </div>
        )}

        {vista === 'franja' && dia && semana && (
          <div className="ag-p" ref={panel}>
            <div className="ag-col">
              <p className="ag-etq" id="ag-d-et">{c.elegirDia}</p>
              <div role="radiogroup" aria-labelledby="ag-d-et" className="ag-tabla">
                <div className="ag-th" aria-hidden="true"><span>{c.dia}</span><span>{c.franjasEtq}</span></div>
                {semana.dias.map((d) => {
                  const sel = d.clave === dia.clave
                  return (
                    <label key={d.clave} className="ag-fila ag-fila-dia" data-fila data-sel={sel}>
                      <input type="radio" name="ag-dia" value={d.clave} checked={sel} onChange={() => elegirDia(d)} aria-label={`${fmtDia(d.fecha, locale)}, ${c.franjas(d.franjas.length)}`} />
                      <Marca />
                      <span className="ag-dia-s">{fmtDia(d.fecha, locale, { weekday: 'short' })}</span>
                      <span className="ag-dia-f">{fmtDia(d.fecha, locale, { day: 'numeric', month: 'short' })}</span>
                      <span className="ag-dia-n">{d.franjas.length}</span>
                    </label>
                  )
                })}
              </div>
              {semanas.length > 1 && (
                <div className="ag-pag" data-fila>
                  <button type="button" aria-label={c.semana.anterior} aria-disabled={semIdx === 0} onClick={() => semIdx > 0 && cambiarSemana(semIdx - 1)}><Flecha atras /></button>
                  <p className="ag-pag-t">
                    {fmtDia(semana.lunes, locale, { day: 'numeric', month: 'short' })} – {fmtDia(new Date(semana.lunes.getTime() + 6 * 864e5), locale, { day: 'numeric', month: 'short' })}
                    <span>{c.semana.de(semIdx + 1, semanas.length)}</span>
                  </p>
                  <button type="button" aria-label={c.semana.siguiente} aria-disabled={semIdx === semanas.length - 1} onClick={() => semIdx < semanas.length - 1 && cambiarSemana(semIdx + 1)}><Flecha /></button>
                </div>
              )}
            </div>

            <div className="ag-col ag-col-horas" ref={horas}>
              <p className="ag-etq" id="ag-h-et">{c.elegirHora}</p>
              <div className="ag-sub" id="ag-h-sub">
                <p>{fmtDia(dia.fecha, locale)}</p>
                <p className="ing-fuente">{c.zona(zona)}</p>
              </div>
              <div role="group" aria-labelledby="ag-h-et" aria-describedby="ag-h-sub" className="ag-horas-g" onKeyDown={teclasHoras}>
                {dia.franjas.map((f, i) => {
                  const max = horaMax(f, locale, zona, zonaMax)
                  return (
                    <button
                      key={f.inicio}
                      type="button"
                      className="ag-fila ag-hora"
                      aria-pressed={elegida?.f.inicio === f.inicio}
                      aria-label={max ? `${fmtHora(f.inicio, locale)}, ${c.max(max)}` : undefined}
                      tabIndex={i === Math.min(foco, dia.franjas.length - 1) ? 0 : -1}
                      onFocus={() => setFoco(i)}
                      onClick={() => elegirHora(dia, f)}
                    >
                      <Marca />
                      <span className="ag-hora-t">{fmtHora(f.inicio, locale)}{max && <span className="ag-hora-max">({c.max(max)})</span>}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {vista === 'datos' && elegida && (
          <div className="ag-p" ref={panel}>
            <div className="ag-col ag-resumen">
              <p className="ag-etq" data-fila>{c.elegida}</p>
              <p className="ag-serif ag-resumen-dia" data-fila>{fmtDia(elegida.fecha, locale)}</p>
              <p className="ag-resumen-hora" data-fila>{fmtHora(elegida.f.inicio, locale)} – {fmtHora(elegida.f.fin, locale)}</p>
              <p className="ing-fuente" data-fila><Zona z={zona} /></p>
              <button type="button" className="ing-enlace ag-cambiar" onClick={volver} data-fila><Flecha atras />{c.cambiar}</button>
            </div>

            <form className="ag-col ag-form" onSubmit={(e) => void enviar(e)} noValidate aria-labelledby="ag-titulo">
              <div className="ag-campos">
                <div className="ing-campo" data-fila>
                  <label>
                    <span>{c.nombre}</span>
                    <input ref={nombreRef} name="nombre" type="text" autoComplete="name" value={datos.nombre} onChange={cambia('nombre')} required aria-required="true" aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? 'ag-e-nombre' : undefined} />
                  </label>
                  {errores.nombre && <em id="ag-e-nombre" role="alert"><Alerta />{errores.nombre}</em>}
                </div>
                <div className="ing-campo" data-fila>
                  <label>
                    <span>{c.email}</span>
                    <input ref={correoRef} name="correo" type="email" inputMode="email" autoComplete="email" value={datos.correo} onChange={cambia('correo')} required aria-required="true" aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'ag-e-correo' : undefined} />
                  </label>
                  {errores.correo && <em id="ag-e-correo" role="alert"><Alerta />{errores.correo}</em>}
                </div>
              </div>
              <div className="ing-campo" data-fila>
                <label>
                  <span>{c.marca}</span>
                  <input name="marca" type="text" autoComplete="organization" value={datos.marca} onChange={cambia('marca')} />
                </label>
              </div>
              <div className="ing-campo" data-fila>
                <label>
                  <span>{c.mensaje}</span>
                  <textarea name="mensaje" rows={3} value={datos.mensaje} onChange={cambia('mensaje')} />
                </label>
              </div>

              {/* Trampa para bots: fuera de la vista, sin foco ni lectura; una persona nunca la rellena. */}
              <div className="ag-trampa" aria-hidden="true">
                <input name="sitio_web_hp" type="text" tabIndex={-1} autoComplete="off" value={datos.trampa} onChange={cambia('trampa')} />
              </div>

              <div className="ag-acepto" data-fila>
                <input
                  ref={aceptoRef}
                  id="ag-acepto"
                  type="checkbox"
                  checked={datos.acepto}
                  onChange={(e) => { const v = e.target.checked; setDatos((d) => ({ ...d, acepto: v })); if (v) setErrores((x) => ({ ...x, acepto: undefined })) }}
                  required
                  aria-required="true"
                  aria-invalid={!!errores.acepto}
                  aria-describedby={errores.acepto ? 'ag-e-acepto' : undefined}
                />
                <Marca />
                <label htmlFor="ag-acepto">{c.consentimiento} <a href={PRIVACIDAD} target="_blank" rel="noopener noreferrer">{c.aviso}</a></label>
              </div>
              {errores.acepto && <p className="ag-e-acepto" id="ag-e-acepto" role="alert"><Alerta />{errores.acepto}</p>}

              {falla && <p className="ing-error" role="alert" tabIndex={-1}>{falla}</p>}
              <button type="submit" className="ing-btn ing-btn-pri ag-enviar" aria-busy={enviando} disabled={enviando} data-fila>
                {enviando ? c.enviando : c.confirmar}<Flecha />
              </button>
            </form>
          </div>
        )}

        {vista === 'orden' && elegida && (
          <div className="ag-p" ref={panel}>
            <div className="ag-col ag-sello">
              <span className="ag-estampa" aria-hidden="true"><Tilde /></span>
              <h3 className="ag-serif ag-sello-t" tabIndex={-1} ref={tituloRef}>{c.listo}</h3>
              <p className="ag-sello-p">{c.listoDetalle}</p>
              <button type="button" className="ing-btn ing-btn-sec ag-otra" onClick={otra}>{c.otra}</button>
            </div>

            <div className="ag-orden">
              <div className="ag-orden-cab" data-fila>
                <p className="ag-etq">{c.orden.titulo}</p>
                <span className="ag-estado"><Tilde />{c.orden.estado}</span>
              </div>
              <dl>
                <div className="ag-orden-f" data-fila><dt>{c.orden.fecha}</dt><dd>{fmtDia(elegida.fecha, locale)}</dd></div>
                <div className="ag-orden-f" data-fila><dt>{c.orden.hora}</dt><dd>{fmtHora(elegida.f.inicio, locale)} – {fmtHora(elegida.f.fin, locale)}<span className="ing-fuente"><Zona z={zona} /></span></dd></div>
                <div className="ag-orden-f" data-fila><dt>{c.orden.duracion}</dt><dd>{c.ficha.min(duracion)}</dd></div>
                <div className="ag-orden-f" data-fila>
                  <dt>{c.orden.canal}</dt>
                  <dd>
                    {meetOk ? (
                      <>
                        <a className="ing-enlace ag-meet" href={meetOk} target="_blank" rel="noopener noreferrer">{c.orden.abrir}<Flecha /></a>
                        <span className="ing-fuente">{meetOk.replace(/^https:\/\//, '')}</span>
                      </>
                    ) : c.orden.sinEnlace}
                  </dd>
                </div>
                <div className="ag-orden-f" data-fila><dt>{c.orden.invitacion}</dt><dd>{c.orden.calendario(datos.correo.trim())}</dd></div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
