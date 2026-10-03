import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useV5 } from '../data'
import { MOTIVOS, evento, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import { useHora } from './hora'
import { Acordeon } from './Acordeon'
import { Cabeza } from './Cabeza'
import { useAnimaAlMontar } from './ajustes'
import { DISPONIBILIDAD_AL, disponibilidadVencida } from './datos'
import { CORTE, CORTE_H, LIMPIAR, SNAP, enTransicion, esPrimeraCarga, gsap, revelar, useCoreografia } from './movimiento'
import { llenar, useCopy } from './copy'

const MODOS: Motivo[] = ['revision', 'proyecto', 'continuo']
/** Plazos de respuesta: pregunta abierta Q7, no se imprimen. */
const PLAZO = /d[ií]a h[aá]bil|business day|営業日/i

/** Los seis zócalos del panel trasero, cada uno distinto sobre la misma retícula de 56 × 28: USB-C, jack de 3,5 mm, RJ45,
 *  conector DC, HDMI y ranura SD. */
const ZOCALOS: Record<string, ReactNode> = {
  correo: (
    <>
      <rect x="11" y="8" width="34" height="12" rx="6" />
      <path d="M19 14h18" strokeDasharray="2 3" />
    </>
  ),
  whatsapp: (
    <>
      <circle cx="28" cy="14" r="8.5" />
      <circle cx="28" cy="14" r="3" />
    </>
  ),
  llamada: (
    <>
      <path d="M14 5h28v16h-8v-3H22v3h-8z" />
      <path d="M20 8v4M24 8v4M28 8v4M32 8v4M36 8v4" />
    </>
  ),
  linkedin: (
    <>
      <circle cx="28" cy="14" r="9" />
      <circle cx="28" cy="14" r="2.2" />
      <path d="M28 5v4M28 19v4" />
    </>
  ),
  github: (
    <>
      <path d="M12 7h32v8l-5 6H17l-5-6z" />
      <path d="M18 12h20" strokeDasharray="2 3" />
    </>
  ),
  cv: (
    <>
      <path d="M16 4h19l5 5v15H16z" />
      <path d="M21 4v6M25 4v6M29 4v6M33 4v5" />
    </>
  ),
}

/** Un puerto del panel trasero: botón o enlace de ≥ 88 px con su zócalo y su LED, que se enciende con el foco, el puntero y la pulsación. */
function Puerto({ id, nombre, valor, href, onClick, download, encendido }: { id: keyof typeof ZOCALOS; nombre: string; valor: string; href?: string; onClick?: () => void; download?: boolean; encendido?: boolean }) {
  const dentro = (
    <>
      <svg className="d-socket" viewBox="0 0 56 28" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="1" y="1" width="54" height="26" />
        {ZOCALOS[id]}
      </svg>
      <span className="d-puerto-led" aria-hidden="true" />
      <span className="d-puerto-n">{nombre}</span>
      <span className="d-puerto-v">{valor}</span>
    </>
  )
  return href ? (
    <a className="d-puerto" data-encendido={encendido} href={href} onClick={onClick} download={download || undefined} {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {dentro}
    </a>
  ) : (
    <button type="button" className="d-puerto" data-encendido={encendido} onClick={onClick}>
      {dentro}
    </button>
  )
}

export default function Contacto() {
  const t = useCopy()
  const c = t.contacto
  const { locale } = useLanguage()
  const { strings, personal, faq, intlLocale } = useV5()
  const anima = useAnimaAlMontar()
  const hora = useHora(intlLocale)
  const { copiar, copiado } = useCopiarCorreo('d')
  const { estado, enviar } = useEnviarContacto('d')
  const [modo, setModo] = useState<Motivo>('revision')
  const [motivo, setMotivo] = useState<Motivo>('revision')
  const [tienda, setTienda] = useState('')
  const [correo, setCorreo] = useState('')
  const [falta, setFalta] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const lang = locale === 'es' ? 'es' : 'en'
  const sc = strings.sections.contact
  const modelos = strings.sections.engagement.models
  const pasos = strings.sections.process.steps
  const siguientes = sc.next.filter((n) => !PLAZO.test(n))
  const vencida = disponibilidadVencida()

  useEffect(() => {
    evento('d', 'contact_open')
  }, [])

  const elegirModo = (m: Motivo) => {
    setModo(m)
    setMotivo(m)
  }
  const asunto = encodeURIComponent(`${MOTIVOS[modo][lang]}`)
  const github = personal.github.split('/').filter(Boolean).pop() ?? 'GitHub'
  const canal = (nombre: string) => () => evento('d', 'contact_click', { canal: nombre })

  const alEnviar = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) {
      setFalta(true)
      return
    }
    setFalta(false)
    void enviar({ correo: correo.trim(), tienda: tienda.trim() || undefined, motivo })
  }

  // Entrada: el panel trasero se barre en pantalla y los seis LEDs hacen su autodiagnóstico (se encienden en cascada y
  // se apagan); después, lo que sigue se revela al llegar. Si la vista llega dentro de una View Transition, el barrido de la
  // página ya es la entrada: solo queda el parpadeo del LCD y un autodiagnóstico corto (≤ 0,4 s).
  useCoreografia(
    raiz,
    () => {
      const bajoVT = enTransicion()
      const tl = gsap.timeline({ defaults: { ease: SNAP, clearProps: LIMPIAR }, delay: bajoVT ? 0 : esPrimeraCarga() ? 0.12 : 0.04 })
      if (bajoVT) {
        tl.from('.d-lcd-chico', { opacity: 0, duration: 0.09, ease: 'steps(3)' }, 0.08)
          .to('.d-puerto', { keyframes: [{ '--on': 1, duration: 0.07 }, { '--on': 0, duration: 0.09 }], ease: 'none', stagger: 0.035, clearProps: '--on' }, 0.12)
      } else {
        tl.from('.d-pagina-cab > *', { clipPath: CORTE.oculto, y: 18, duration: 0.45, stagger: 0.07 }, 0)
          .from('.d-lcd-chico', { opacity: 0, duration: 0.09, ease: 'steps(3)' }, 0.2)
          .from('.d-lcd-chico p', { clipPath: CORTE_H.oculto, duration: 0.34, ease: 'steps(16)', stagger: 0.1 }, 0.26)
          .from('.d-modos', { clipPath: CORTE.oculto, duration: 0.34 }, 0.22)
          .from('.d-placa', { clipPath: CORTE_H.oculto, duration: 0.4 }, 0.3)
          .from('.d-puerto', { y: 10, opacity: 0, duration: 0.3, stagger: 0.06 }, 0.36)
          .to('.d-puerto', { keyframes: [{ '--on': 1, duration: 0.1 }, { '--on': 0, duration: 0.16 }], ease: 'none', stagger: 0.07, clearProps: '--on' }, 0.5)
      }
      revelar('.d-proceso > li', { escalon: 0.06 })
      revelar('.d-siguiente > li', { escalon: 0.06 })
      revelar('.d-formulario > *', { escalon: 0.05 })
      revelar('.d-faq > *', { escalon: 0.05 })
    },
    anima,
  )

  return (
    <div ref={raiz} className="d-vista">
      <Cabeza titulo={`${t.titulos.contacto} · ${t.nav.contacto[1]} · ${personal.name}`} />
      <section className="d-banda" aria-labelledby="d-h1">
        <div className="d-celda d-pagina-cab d-contacto-cab">
          <div>
            <p className="d-cap">{t.nav.contacto[1]}</p>
            <h1 id="d-h1" className="d-h1 d-h1-pagina">{t.titulos.contacto}</h1>
            <p className="d-lead">{`${sc.title} ${sc.titleAccent}`}</p>
            <p className="d-nota-chica">{sc.promise}</p>
          </div>
          <div className="d-lcd d-lcd-chico" role="group" aria-label={c.hora}>
            <p className="d-lcd-l1"><span className="d-led" data-vencido={vencida} aria-hidden="true" />{sc.status}{vencida ? ` · ${llenar(t.inicio.datoAl, { f: DISPONIBILIDAD_AL.slice(0, 7) })}` : ''}</p>
            <p className="d-lcd-l2"><span>{t.inicio.medellin}</span> <time>{hora}</time></p>
          </div>
        </div>

        <div className="d-celda d-modos" role="group" aria-label={c.modos}>
          <p className="d-cap">{c.modos}</p>
          <div className="d-chips">
            {MODOS.map((m, i) => (
              <button key={m} type="button" aria-pressed={modo === m} className="d-chip" onClick={() => elegirModo(m)}>{modelos[i].title}</button>
            ))}
          </div>
          <p className="d-nota-chica" aria-live="polite">{modelos[MODOS.indexOf(modo)]?.body ?? c.modosAyuda}</p>
        </div>

        <div className="d-celda d-puertos" role="group" aria-label={c.puertosAria}>
          <div className="d-placa" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M7 7l10 10M17 7L7 17" /></svg>
            <span className="d-placa-ranuras">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</span>
            <svg viewBox="0 0 24 24" width="22" height="22" focusable="false"><circle cx="12" cy="12" r="9" /><path d="M7 7l10 10M17 7L7 17" /></svg>
          </div>
          <p className="d-leyenda d-cap">{c.puertos} · {c.leadPuertos}</p>
          <div className="d-puertos-grid">
            <Puerto id="correo" nombre={c.correo} valor={copiado ? c.copiado : personal.email} encendido={copiado} onClick={() => void copiar()} />
            <Puerto id="whatsapp" nombre={c.whatsapp} valor={personal.whatsapp} href={personal.whatsappHref} onClick={canal('whatsapp')} />
            <Puerto id="llamada" nombre={c.llamada} valor={personal.phone} href={personal.phoneHref} onClick={canal('llamada')} />
            <Puerto id="linkedin" nombre={c.linkedin} valor={c.perfil} href={personal.linkedin} onClick={canal('linkedin')} />
            <Puerto id="github" nombre={c.github} valor={github} href={personal.github} onClick={canal('github')} />
            <Puerto id="cv" nombre={c.cv} valor={c.cvValor} href={personal.cv} download onClick={canal('cv')} />
          </div>
          <p role="status" className="d-dato d-puertos-aviso">{copiado ? c.copiado : ''}</p>
          <p className="d-nota-chica"><a className="d-enlace-flecha" href={`mailto:${personal.email}?subject=${asunto}`}>{c.abrirCorreo}</a></p>
        </div>

        <div className="d-contacto-dos">
          <form className="d-celda d-formulario" onSubmit={alEnviar} noValidate aria-labelledby="d-form-t">
            <h2 id="d-form-t" className="d-h2">{c.formularioTitulo}</h2>
            <p className="d-nota-chica">{c.formularioAyuda}</p>
            <label className="d-campo">
              <span className="d-cap">{sc.urlLabel} <em>{c.tiendaAyuda}</em></span>
              <input type="text" inputMode="url" autoComplete="url" name="tienda" value={tienda} placeholder={sc.urlPlaceholder} onChange={(e) => setTienda(e.target.value)} />
            </label>
            <label className="d-campo">
              <span className="d-cap">{c.correoCampo}</span>
              <input type="email" inputMode="email" autoComplete="email" name="correo" required aria-invalid={falta} aria-describedby={falta ? 'd-falta' : undefined} value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </label>
            {falta && <p id="d-falta" role="alert" className="d-error">{c.camposRequeridos}</p>}
            <label className="d-campo">
              <span className="d-cap">{c.motivo}</span>
              <select name="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value as Motivo)}>
                {(Object.keys(MOTIVOS) as Motivo[]).map((m) => <option key={m} value={m}>{MOTIVOS[m][lang]}</option>)}
              </select>
            </label>
            <button type="submit" className="d-cta d-cta-form" disabled={estado === 'enviando'} aria-busy={estado === 'enviando'}>
              <span>{estado === 'enviando' ? c.enviando : c.enviar}</span>
              <span className="d-cta-flecha" aria-hidden="true">→</span>
            </button>
            <p role="status" className="d-dato">{estado === 'ok' ? c.ok : estado === 'error' ? c.error : ''}</p>
          </form>

          <div className="d-celda d-siguiente-caja">
            <h2 className="d-h2">{c.siguiente}</h2>
            <ol className="d-siguiente">
              {siguientes.map((n, i) => (
                <li key={n}><span className="d-cap">{String(i + 1).padStart(2, '0')}</span> <span>{n}</span></li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="d-banda" aria-labelledby="d-proc-t">
        <div className="d-celda d-como-cab">
          <h2 id="d-proc-t" className="d-h2">{c.procedimiento}</h2>
          <p className="d-nota-chica">{strings.sections.process.eyebrow}</p>
        </div>
        <ol className="d-proceso">
          {pasos.map((p, i) => (
            <li key={p.title} className="d-celda d-paso">
              <span className="d-cap">{llenar(strings.sections.process.stepOf, { n: i + 1, total: pasos.length })}</span>
              <h3 className="d-h3">{p.title}</h3>
              <p>{p.body}</p>
              <p className="d-entregable"><span className="d-cap">{strings.sections.process.deliverableLabel}</span> {p.deliverable}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="d-banda" aria-labelledby="d-faq-t">
        <div className="d-celda d-como-cab">
          <h2 id="d-faq-t" className="d-h2">{c.faq}</h2>
        </div>
        <div className="d-faq">
          {faq.map((f) => (
            <Acordeon key={f.q} titulo={f.q}>
              <p>{f.a}</p>
            </Acordeon>
          ))}
        </div>
      </section>
    </div>
  )
}
