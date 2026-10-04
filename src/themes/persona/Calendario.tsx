import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { fmtDia, fmtHora, PRIVACIDAD, useAgenda, useCopiaAgenda, type Dia, type Fallo, type Franja } from '../shared/agenda'
import { ID, usePersona } from './contexto'
import { rafaga } from './efectos'
import { enVista, gsap, ScrollTrigger, SLAM, useGsap } from './motion'
import { Boton } from './piezas'
import { Recorte, semillaDe } from './Recorte'
import { sfx } from './sfx'
import { vozAgenda } from './vozAgenda'
import './agenda.css'

// Calendario de reservas de Persona («Arcade»): los días son cartas pegadas a distinto ángulo con el número recortado como
// una nota de rescate; las horas son un menú de juego (la barra azul inclinada del menú de inicio); la confirmación es una
// «calling card». Todo sale de useAgenda(): nada de huecos, duraciones ni zonas inventados.
// Tres pasos (fecha → datos → listo) en un mismo panel: el paso que sale se rebana hacia la izquierda en 0,16 s y el que
// entra se pega con el golpe de la casa. Con la página quieta no se mueve nada.

type Paso = 'fecha' | 'datos' | 'listo'
interface Celda { clave: string; fecha: Date; dia?: Dia }
interface Elegida { inicio: string; fecha: Date }
interface Hecha { dia: string; num: string; hora: string; horaMax: string | null; clave: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DIA_MS = 864e5

/** Semanas completas (lunes a viernes, o hasta el último día de la semana que tenga huecos) con los días sin huecos como casillas vacías. */
function cuadricula(dias: Dia[]) {
  if (!dias.length) return { cols: 5, celdas: [] as Celda[] }
  const sem = (d: Date) => (d.getUTCDay() + 6) % 7 // 0 = lunes
  const cols = Math.max(5, ...dias.map((d) => sem(d.fecha) + 1))
  const primero = dias[0].fecha
  const ultimo = dias[dias.length - 1].fecha
  const desde = primero.getTime() - sem(primero) * DIA_MS
  const hasta = ultimo.getTime() + (6 - sem(ultimo)) * DIA_MS
  const mapa = new Map(dias.map((d) => [d.clave, d]))
  const celdas: Celda[] = []
  for (let t = desde; t <= hasta; t += DIA_MS) {
    const fecha = new Date(t)
    if (sem(fecha) >= cols) continue
    const clave = fecha.toISOString().slice(0, 10)
    celdas.push({ clave, fecha, dia: mapa.get(clave) })
  }
  return { cols, celdas }
}

const gmt = (zona: string) => {
  try {
    return new Intl.DateTimeFormat('en', { timeZone: zona, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value ?? ''
  } catch {
    return ''
  }
}
const sinPunto = (s: string) => s.replace(/\.$/, '')
const soloHttps = (u?: string | null) => {
  try {
    return u && new URL(u).protocol === 'https:' ? u : null
  } catch {
    return null
  }
}

export default function Calendario() {
  const { c } = usePersona()
  const { locale } = useLanguage()
  const base = useCopiaAgenda()
  const t = useMemo(() => vozAgenda(locale as Locale, base), [locale, base])
  const ag = useAgenda(ID)

  const raiz = useRef<HTMLDivElement>(null)
  const capa = useRef<HTMLDivElement>(null)
  const colHoras = useRef<HTMLDivElement>(null)
  const refsHoras = useRef<(HTMLButtonElement | null)[]>([])
  const host = useRef<HTMLDivElement>(null)
  const tarjeta = useRef<HTMLElement>(null)
  const saliendo = useRef(false)
  const porPuntero = useRef(false)
  const intacto = useRef(true)
  const pasoPrev = useRef<Paso>('fecha')
  const volviendo = useRef<'hora' | 'dia' | 'aviso' | null>(null)
  const duracionReal = useRef<number | null>(null)

  const [paso, setPaso] = useState<Paso>('fecha')
  const [diaClave, setDiaClave] = useState<string | null>(null)
  const [elegida, setElegida] = useState<Elegida | null>(null)
  const [aviso, setAviso] = useState<Fallo | null>(null)
  const [fallo, setFallo] = useState<Fallo | null>(null)
  const [foco, setFoco] = useState(0)
  const [vivo, setVivo] = useState('')
  const [hecha, setHecha] = useState<Hecha | null>(null)
  const [meet, setMeet] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [marca, setMarca] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [acepto, setAcepto] = useState(false)
  const [trampa, setTrampa] = useState('')
  const [err, setErr] = useState({ nombre: false, email: false, aviso: false })

  if (ag.estado === 'listo') duracionReal.current = ag.duracion
  const duracion = duracionReal.current
  const estado = ag.estado === 'listo' && !ag.dias.length ? 'vacio' : ag.estado
  const zonaTxt = [ag.zona.replace(/_/g, ' '), gmt(ag.zona)].filter(Boolean).join(' · ')
  const { cols, celdas } = useMemo(() => cuadricula(ag.dias), [ag.dias])
  const diaSel = ag.dias.find((d) => d.clave === diaClave)
  const franjas = diaSel?.franjas ?? []
  const filas = Math.ceil(franjas.length / 2)

  const cuando = (inicio: string, fecha: Date) => {
    const hora = fmtHora(inicio, locale as Locale, ag.zona)
    const hMax = fmtHora(inicio, locale as Locale, ag.zonaMax)
    return { dia: fmtDia(fecha, locale as Locale), hora, horaMax: ag.zona !== ag.zonaMax && hMax !== hora ? hMax : null }
  }

  // ---------- Cambio de paso: sale rebanado hacia la izquierda, entra pegado ----------
  const cambiar = (p: Paso) => {
    intacto.current = false
    if (saliendo.current || p === paso) return
    const el = capa.current
    if (!el) return void setPaso(p)
    saliendo.current = true
    gsap.to(el, {
      x: -48,
      skewX: -8,
      opacity: 0,
      duration: 0.16,
      ease: 'power2.in',
      overwrite: true,
      onComplete: () => {
        saliendo.current = false
        setPaso(p)
      },
    })
  }

  // Cabecera: la placa azul se rebana en su sitio, una sola vez.
  useGsap(raiz, () => {
    const r = raiz.current
    if (!r) return
    const tl = gsap.timeline({ paused: true })
    tl.from('.pr-ag__losa', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.4, ease: 'expo.out' }, 0)
      .from('.pr-ag__t-txt', { opacity: 0, x: -24, skewX: -8, duration: 0.45, ease: SLAM }, 0.1)
      .from('.pr-ag__zona', { opacity: 0, x: -24, skewX: -8, duration: 0.45, ease: SLAM, clearProps: 'transform,opacity' }, 0.25)
    if (enVista(r)) tl.delay(0.1).play()
    else ScrollTrigger.create({ trigger: r, start: 'top 85%', once: true, onEnter: () => void tl.play() })
  }, [])

  // La duración real llega con los huecos: su chip entra entonces (antes está oculto, sin sitio reservado que cambie).
  useGsap(raiz, () => {
    if (!duracion) return
    gsap.from('.pr-ag__dur', { opacity: 0, x: -24, skewX: -8, duration: 0.45, ease: SLAM, delay: 0.1, clearProps: 'transform,opacity' })
  }, [duracion])

  // Entrada de cada paso.
  useGsap(raiz, () => {
    const r = raiz.current
    if (!r) return
    const lista = (s: string) => gsap.utils.toArray<HTMLElement>(s, r)
    const arrancar = (tl: gsap.core.Timeline) => {
      // Mientras nadie ha tocado nada y el panel aún está lejos, espera a que se acerque; después entra al instante.
      if (intacto.current && !enVista(r)) ScrollTrigger.create({ trigger: r, start: 'top 85%', once: true, onEnter: () => void tl.play() })
      else tl.delay(intacto.current ? 0.2 : 0).play()
    }
    if (paso === 'fecha') {
      const tl = gsap.timeline({ paused: true })
      const dias = lista('.pr-ag__pila')
      if (dias.length) tl.from(dias, { opacity: 0, y: -30, rotation: () => gsap.utils.random(-16, 16), scale: 1.35, duration: 0.45, ease: SLAM, stagger: 0.02, clearProps: 'transform,opacity' }, 0.1)
      const vacios = lista('.pr-ag__vacio')
      if (vacios.length) tl.from(vacios, { opacity: 0, duration: 0.4, ease: 'power2.out', stagger: 0.01, clearProps: 'opacity' }, 0.2)
      const msg = lista('.pr-ag__aviso, .pr-ag__estado-caja')
      if (msg.length) tl.from(msg, { opacity: 0, x: -36, skewX: -8, duration: 0.45, ease: SLAM, clearProps: 'transform,opacity' }, 0)
      if (tl.getChildren().length) arrancar(tl)
    } else if (paso === 'datos') {
      const tl = gsap.timeline()
      tl.from('.pr-ag__resumen', { opacity: 0, x: -50, skewX: -8, duration: 0.5, ease: SLAM, clearProps: 'transform,opacity' }, 0).from('.pr-ag__campo, .pr-ag__acepto, .pr-ag__fila .pr-btnhost', { opacity: 0, x: -32, skewX: -6, duration: 0.5, ease: SLAM, stagger: 0.06, clearProps: 'transform,opacity' }, 0.1)
    } else {
      const tl = gsap.timeline()
      tl.from('.pr-ag__tarjeta', { opacity: 0, y: -80, rotation: -11, scale: 1.22, duration: 0.6, ease: SLAM, clearProps: 'transform,opacity' }, 0)
        .from('.pr-ag__cinta-ok', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.35, ease: 'expo.out' }, 0.25)
        .from(lista('.pr-ag__tomate .pr-rec__l'), { opacity: 0, yPercent: -70, rotation: () => gsap.utils.random(-32, 32), scale: 1.55, duration: 0.5, ease: SLAM, stagger: { each: 0.03, from: 'start' } }, 0.3)
        .from('.pr-ag__cuando > *, .pr-ag__ok-det, .pr-ag__acc > *', { opacity: 0, x: -30, skewX: -8, duration: 0.45, ease: SLAM, stagger: 0.07, clearProps: 'transform,opacity' }, 0.6)
        .add(() => {
          if (host.current) rafaga(host.current, { x: '50%', y: '34%', n: 14, rx: 170, ry: 110, dur: 0.55 })
          sfx.tono(900, 0.09)
        }, 0.35)
    }
  }, [paso, ag.estado])

  // Las horas del día elegido entran como filas de menú inclinadas.
  useGsap(raiz, () => {
    if (paso !== 'fecha' || !diaClave || !porPuntero.current) return
    const r = raiz.current
    if (!r) return
    const filasEl = gsap.utils.toArray<HTMLElement>('.pr-ag__hora', r)
    if (filasEl.length) gsap.from(filasEl, { opacity: 0, x: -40, skewX: -8, duration: 0.38, ease: SLAM, stagger: 0.018, clearProps: 'transform,opacity' })
    gsap.from('.pr-ag__fecha', { opacity: 0, x: -30, skewX: -8, duration: 0.4, ease: SLAM, clearProps: 'transform,opacity' })
  }, [diaClave, paso])

  // Foco y desplazamiento tras cada cambio (nunca en el primer pintado).
  useEffect(() => {
    if (pasoPrev.current === paso) return
    pasoPrev.current = paso
    if (paso === 'datos') document.getElementById('pr-ag-nombre')?.focus({ preventScroll: true })
    else if (paso === 'listo') tarjeta.current?.focus({ preventScroll: true })
    else if (volviendo.current) {
      const destino = volviendo.current
      volviendo.current = null
      if (destino === 'hora') {
        const pulsada = refsHoras.current.find((b) => b?.getAttribute('aria-pressed') === 'true')
        ;(pulsada ?? refsHoras.current[0])?.focus({ preventScroll: true })
      } else if (destino === 'dia') {
        const d = raiz.current?.querySelector<HTMLInputElement>('.pr-ag__dia input:checked') ?? raiz.current?.querySelector<HTMLInputElement>('.pr-ag__dia input')
        d?.focus({ preventScroll: true })
      } else raiz.current?.querySelector<HTMLElement>('.pr-ag__aviso')?.focus({ preventScroll: true })
    }
    const r = raiz.current
    if (r && r.getBoundingClientRect().top < 0) r.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [paso])

  // En una pantalla estrecha las horas quedan debajo de los días: al elegir un día con el puntero se baja hasta ellas.
  useEffect(() => {
    if (!porPuntero.current) return
    porPuntero.current = false
    if (!diaClave || window.matchMedia('(min-width: 900px)').matches) return
    const el = colHoras.current
    if (!el) return
    const { top } = el.getBoundingClientRect()
    if (top > window.innerHeight * 0.6 || top < 0) el.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [diaClave])

  // ---------- Acciones ----------
  const elegirDia = (d: Dia) => {
    intacto.current = false
    setDiaClave(d.clave)
    setFoco(0)
    setAviso(null)
    sfx.tono(760, 0.07)
    setVivo(t.horasDe(d.franjas.length, fmtDia(d.fecha, locale as Locale)))
  }

  const elegirHora = (f: Franja, fecha: Date) => {
    ag.elegir()
    sfx.tono(520, 0.12)
    setAviso(null)
    setFallo(null)
    setElegida({ inicio: f.inicio, fecha })
    cambiar('datos')
  }

  const volver = () => {
    volviendo.current = 'hora'
    cambiar('fecha')
  }

  const teclasHoras = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = franjas.length
    if (!n) return
    let sig = foco
    if (e.key === 'ArrowDown') sig = Math.min(n - 1, foco + 1)
    else if (e.key === 'ArrowUp') sig = Math.max(0, foco - 1)
    else if (e.key === 'ArrowRight') sig = Math.min(n - 1, foco + filas)
    else if (e.key === 'ArrowLeft') sig = Math.max(0, foco - filas)
    else if (e.key === 'Home') sig = 0
    else if (e.key === 'End') sig = n - 1
    else return
    e.preventDefault()
    setFoco(sig)
    refsHoras.current[sig]?.focus()
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    if (enviando || !elegida) return
    const nuevo = { nombre: !nombre.trim(), email: !EMAIL.test(email.trim()), aviso: !acepto }
    setErr(nuevo)
    if (nuevo.nombre || nuevo.email || nuevo.aviso) {
      setFallo(null)
      document.getElementById(nuevo.nombre ? 'pr-ag-nombre' : nuevo.email ? 'pr-ag-email' : 'pr-ag-acepto')?.focus()
      return
    }
    setEnviando(true)
    setFallo(null)
    const cu = cuando(elegida.inicio, elegida.fecha)
    const r = await ag.reservar({ inicio: elegida.inicio, nombre: nombre.trim(), email: email.trim(), marca: marca.trim() || undefined, mensaje: mensaje.trim() || undefined, consentimiento: true, trampa })
    setEnviando(false)
    if (r.ok) {
      setHecha({ ...cu, num: String(elegida.fecha.getUTCDate()), clave: elegida.fecha.toISOString().slice(0, 10) })
      setMeet(soloHttps(r.meet))
      setVivo(t.agendada(cu.dia, cu.hora))
      cambiar('listo')
    } else if (r.fallo === 'ocupada') {
      volviendo.current = 'aviso'
      setAviso('ocupada')
      setElegida(null)
      setFoco(0)
      cambiar('fecha')
    } else {
      setFallo(r.fallo)
    }
  }

  const otra = () => {
    setElegida(null)
    setHecha(null)
    setMeet(null)
    setMensaje('')
    setAcepto(false)
    setErr({ nombre: false, email: false, aviso: false })
    setFallo(null)
    volviendo.current = 'dia'
    cambiar('fecha')
  }

  const irAlFormulario = () => {
    const f = document.getElementById('pr-form')
    f?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => document.getElementById('pr-tienda')?.focus({ preventScroll: true }), 450)
  }

  // ---------- Piezas ----------
  const cabecera = (
    <header className="pr-ag__cab">
      <h2 id="pr-ag-t" className="pr-ag__t">
        <span className="pr-ag__losa" aria-hidden="true" />
        <span className="pr-ag__t-txt">{t.titulo}</span>
      </h2>
      <p className="pr-ag__dur" style={{ visibility: duracion ? 'visible' : 'hidden' }}>
        <i aria-hidden="true" />
        {t.duracion(duracion ?? ag.duracion)}
      </p>
      <p className="pr-ag__zona">{estado === 'cargando' ? t.cargando : t.zona(zonaTxt)}</p>
    </header>
  )

  const fantasmas = (
    <div className="pr-ag__rejilla" style={{ '--cols': 5 } as CSSProperties} aria-hidden="true">
      {Array.from({ length: 15 }, (_, i) => (
        <span key={i} className="pr-ag__vacio" />
      ))}
    </div>
  )

  const mensajeEstado = (texto: string, rol: 'alert' | 'status') => (
    <div className="pr-ag__estado-caja">
      <p role={rol}>{texto}</p>
      <div className="pr-ag__acc">
        {estado === 'error' && (
          <Boton onClick={() => void ag.recargar()}>{t.reintentar}</Boton>
        )}
        <Boton variante="contorno" onClick={irAlFormulario}>
          {t.escribirme}
        </Boton>
      </div>
    </div>
  )

  const diaCarta = (celda: Celda) => {
    const d = celda.dia
    const num = String(celda.fecha.getUTCDate())
    if (!d) {
      return (
        <span key={celda.clave} className="pr-ag__vacio" aria-hidden="true">
          {num}
        </span>
      )
    }
    const h = semillaDe(celda.clave)
    const giro = (((h % 7) - 3) * 0.9).toFixed(1)
    const sube = ((((h >>> 3) % 5) - 2) * 1.5).toFixed(1)
    const largo = fmtDia(d.fecha, locale as Locale)
    return (
      <label key={celda.clave} className="pr-ag__dia" style={{ '--giro': `${giro}deg`, '--sube': `${sube}px` } as CSSProperties}>
        <input
          type="radio"
          name="pr-ag-dia"
          value={d.clave}
          checked={diaClave === d.clave}
          aria-label={`${largo}, ${t.libres(d.franjas.length)}`}
          onPointerDown={() => (porPuntero.current = true)}
          onKeyDown={() => (porPuntero.current = false)}
          onChange={() => elegirDia(d)}
        />
        <span className="pr-ag__pila">
          <span className="pr-ag__sombra" aria-hidden="true" />
          <span className="pr-ag__carta" aria-hidden="true">
            <span className="pr-ag__sem">{sinPunto(fmtDia(d.fecha, locale as Locale, { weekday: 'short' }))}</span>
            <span className="pr-ag__cifras">
              <Recorte texto={num} semilla={d.clave} amp={0.8} />
            </span>
            <span className="pr-ag__mes">{sinPunto(fmtDia(d.fecha, locale as Locale, { month: 'short' }))}</span>
          </span>
        </span>
      </label>
    )
  }

  const pasoFecha = () => {
    if (estado === 'vacio') return mensajeEstado(t.sinHuecos, 'status')
    if (estado === 'error') return mensajeEstado(t.errorCarga, 'alert')
    return (
      <>
        {aviso && (
          <p className="pr-ag__aviso" role="alert" tabIndex={-1}>
            {t.fallos[aviso]}
          </p>
        )}
        <div className="pr-ag__cuerpo" aria-busy={estado === 'cargando'}>
          <div className="pr-ag__col pr-ag__col--dias">
            <h3 id="pr-ag-dt" className="pr-ag__sub">
              {t.elegirDia}
            </h3>
            {estado === 'cargando' ? (
              fantasmas
            ) : (
              <div role="radiogroup" aria-labelledby="pr-ag-dt" className={`pr-ag__rejilla ${cols > 5 ? 'pr-ag__rejilla--ancha' : ''}`} style={{ '--cols': cols } as CSSProperties}>
                {celdas.map((x) => diaCarta(x))}
              </div>
            )}
          </div>
          <div className="pr-ag__col pr-ag__col--horas" ref={colHoras}>
            <h3 id="pr-ag-ht" className="pr-ag__sub">
              {t.elegirHora}
            </h3>
            {diaSel ? (
              <>
                <p id="pr-ag-fecha" className="pr-ag__fecha">
                  {fmtDia(diaSel.fecha, locale as Locale)}
                </p>
                <div role="group" aria-labelledby="pr-ag-ht pr-ag-fecha" className="pr-ag__horas" style={{ '--filas': filas } as CSSProperties} onKeyDown={teclasHoras}>
                  {franjas.map((f, i) => {
                    const cu = cuando(f.inicio, diaSel.fecha)
                    return (
                      <button
                        key={f.inicio}
                        type="button"
                        className="pr-ag__hora"
                        ref={(el) => {
                          refsHoras.current[i] = el
                        }}
                        aria-pressed={elegida?.inicio === f.inicio}
                        tabIndex={foco === i ? 0 : -1}
                        onFocus={() => setFoco(i)}
                        onClick={() => elegirHora(f, diaSel.fecha)}
                      >
                        <span className="pr-ag__h">{cu.hora}</span>
                        {cu.horaMax && (
                          <span className="pr-ag__hmax">
                            ({c.hora} {cu.horaMax})
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                <p className="pr-ag__pista">{t.pista}</p>
                <div className="pr-ag__horas pr-ag__horas--f" aria-hidden="true" style={{ '--filas': 4 } as CSSProperties}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <span key={i} className="pr-ag__hora-f" />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </>
    )
  }

  const pasoDatos = () => {
    if (!elegida) return null
    const cu = cuando(elegida.inicio, elegida.fecha)
    const ocupado = enviando
    const campoErr = (id: string, texto: string, activo: boolean) =>
      activo ? (
        <p id={`${id}-e`} className="pr-ag__err">
          {texto}
        </p>
      ) : null
    return (
      <form className="pr-ag__form" noValidate onSubmit={enviar} aria-labelledby="pr-ag-dato-t" aria-busy={ocupado}>
        <div className="pr-ag__resumen">
          <span className="pr-ag__resumen-num" aria-hidden="true">
            <Recorte texto={String(elegida.fecha.getUTCDate())} semilla={elegida.fecha.toISOString().slice(0, 10)} amp={0.8} />
          </span>
          <p id="pr-ag-dato-t" className="pr-ag__resumen-txt">
            <b>{cu.dia}</b>
            <span>
              {cu.hora}
              {duracion ? ` · ${t.duracion(duracion)}` : ''}
            </span>
            {cu.horaMax && (
              <small>
                ({c.hora} {cu.horaMax})
              </small>
            )}
          </p>
          <button type="button" className="pr-ag__volver" onClick={volver}>
            ‹ {t.cambiar}
          </button>
        </div>

        <div className="pr-ag__campos">
          <div className="pr-ag__campo">
            <label htmlFor="pr-ag-nombre">{t.nombre}</label>
            <input
              id="pr-ag-nombre"
              className="pr-input"
              type="text"
              autoComplete="name"
              aria-required="true"
              aria-invalid={err.nombre || undefined}
              aria-describedby={err.nombre ? 'pr-ag-nombre-e' : undefined}
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                if (err.nombre) setErr((x) => ({ ...x, nombre: false }))
              }}
            />
            {campoErr('pr-ag-nombre', t.errNombre, err.nombre)}
          </div>
          <div className="pr-ag__campo">
            <label htmlFor="pr-ag-email">{t.email}</label>
            <input
              id="pr-ag-email"
              className="pr-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              aria-required="true"
              aria-invalid={err.email || undefined}
              aria-describedby={err.email ? 'pr-ag-email-e' : undefined}
              placeholder={c.contacto.correoPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (err.email) setErr((x) => ({ ...x, email: false }))
              }}
            />
            {campoErr('pr-ag-email', t.errCorreo, err.email)}
          </div>
          <div className="pr-ag__campo pr-ag__campo--ancho">
            <label htmlFor="pr-ag-marca">{t.marca}</label>
            <input id="pr-ag-marca" className="pr-input" type="text" autoComplete="organization" value={marca} onChange={(e) => setMarca(e.target.value)} />
          </div>
          <div className="pr-ag__campo pr-ag__campo--ancho">
            <label htmlFor="pr-ag-mensaje">{t.mensaje}</label>
            <textarea id="pr-ag-mensaje" className="pr-input" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
          </div>
        </div>

        {/* Campo trampa: una persona no lo ve ni lo enfoca; un robot que rellena todo lo delata. */}
        <div className="pr-ag__trampa" aria-hidden="true">
          <input type="text" name="sitio_web_hp" tabIndex={-1} autoComplete="off" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
        </div>

        <div className="pr-ag__consent">
          <label className="pr-ag__acepto">
            <input
              id="pr-ag-acepto"
              type="checkbox"
              checked={acepto}
              aria-required="true"
              aria-invalid={err.aviso || undefined}
              aria-describedby={err.aviso ? 'pr-ag-acepto-e' : undefined}
              onChange={(e) => {
                setAcepto(e.target.checked)
                if (err.aviso) setErr((x) => ({ ...x, aviso: false }))
              }}
            />
            <span className="pr-ag__caja" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="square">
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </span>
            <span>
              {t.consentimiento}{' '}
              <a href={PRIVACIDAD} target="_blank" rel="noopener noreferrer">
                {t.aviso}
              </a>
              .
            </span>
          </label>
          {campoErr('pr-ag-acepto', t.errAviso, err.aviso)}
        </div>

        {fallo && (
          <p className="pr-ag__aviso" role="alert">
            {t.fallos[fallo]}
          </p>
        )}
        <div className="pr-ag__fila">
          <Boton type="submit" disabled={ocupado}>
            {ocupado ? t.enviando : t.confirmar}
          </Boton>
        </div>
      </form>
    )
  }

  const pasoListo = () => {
    if (!hecha) return null
    return (
      <div className="pr-ag__tarjeta-host" ref={host}>
        <section className="pr-ag__tarjeta" tabIndex={-1} ref={tarjeta} aria-labelledby="pr-ag-ok-t">
          <p className="pr-ag__cinta-ok">
            <i aria-hidden="true" />
            {t.sello}
          </p>
          <h3 id="pr-ag-ok-t" className="pr-ag__tomate" aria-label={`${t.listo}. ${t.tomate}`}>
            <Recorte texto={t.tomate} semilla="calling-card" />
          </h3>
          <div className="pr-ag__cuando">
            <span className="pr-ag__cuando-num" aria-hidden="true">
              <Recorte texto={hecha.num} semilla={hecha.clave} />
            </span>
            <p className="pr-ag__cuando-dia">{hecha.dia}</p>
            <p className="pr-ag__cuando-hora">{hecha.hora}</p>
            {hecha.horaMax && (
              <p className="pr-ag__cuando-max">
                ({c.hora} {hecha.horaMax})
              </p>
            )}
          </div>
          <p className="pr-ag__ok-det">{t.listoDetalle}</p>
          <div className="pr-ag__acc">
            {meet && (
              <a className="pr-btn pr-btn--primario" href={meet} target="_blank" rel="noopener noreferrer">
                {t.meet}
              </a>
            )}
            <Boton variante="contorno" onClick={otra}>
              {t.otra}
            </Boton>
          </div>
          <span className="pr-marca__mb pr-ag__mb" aria-hidden="true">
            MB
          </span>
        </section>
      </div>
    )
  }

  return (
    <div className={`pr-ag ${paso === 'fecha' && (estado === 'vacio' || estado === 'error') ? 'pr-ag--breve' : ''}`} ref={raiz}>
      {cabecera}
      <p className="sr-only" role="status" aria-live="polite">
        {vivo}
      </p>
      <div key={paso} ref={capa} className="pr-ag__paso">
        {paso === 'fecha' ? pasoFecha() : paso === 'datos' ? pasoDatos() : pasoListo()}
      </div>
    </div>
  )
}
