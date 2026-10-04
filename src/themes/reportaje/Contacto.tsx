import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { evento, MOTIVOS, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import Agenda from './Agenda'
import { useCopy } from './copy'
import { gsap, useVista } from './motion'
import { Acordeon, Flecha } from './piezas'
import { limpioTexto, partirFrase, prohibido, sinPunto, usePublico } from './publico'

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Los tres modelos de trabajo del vivo, cada uno con el motivo del formulario que le corresponde. */
const MODELO_MOTIVO: Motivo[] = ['revision', 'proyecto', 'continuo']

export default function Contacto() {
  const c = useCopy()
  const { locale } = useLanguage()
  const v = usePublico()
  const { strings: s, personal, faq } = v
  const [params] = useSearchParams()
  const pedido = params.get('motivo') as Motivo | null
  const [motivo, setMotivo] = useState<Motivo>(pedido && pedido in MOTIVOS ? pedido : 'revision')
  const [errores, setErrores] = useState<{ correo?: string; tienda?: string }>({})
  const { estado, enviar } = useEnviarContacto('reportaje')
  const { copiar, copiado, correo } = useCopiarCorreo('reportaje')
  const form = useRef<HTMLFormElement>(null)
  const ok = useRef<HTMLDivElement>(null)
  const wa = `${personal.whatsappHref}?text=${encodeURIComponent(c.contacto.waTexto)}`
  const modelos = s.sections.engagement
  // El vivo promete aquí un plazo de respuesta: esta dirección no imprime plazos, así que ese paso no sale.
  const despues = s.sections.contact.next.filter((p) => !prohibido(p))
  const [, invitacion = modelos.lead] = partirFrase(modelos.lead)

  const ref = useVista<HTMLElement>([locale])
  useEffect(() => { evento('reportaje', 'contact_open') }, [])

  // «Pedir revisión» llega aquí con #agenda: la vista entra ya en el calendario. La primera vez salta sin animar (la hoja de papel aún
  // tapa la vista) y se recoloca cuando llegan las fuentes y al cabo de un instante, mientras la persona no haya movido la página;
  // si ya estaba en Contacto, baja con suavidad.
  const { hash, key } = useLocation()
  const ultimaClave = useRef<string | undefined>(undefined)
  useLayoutEffect(() => {
    // Inicial = la primera entrada de esta vista (también el segundo disparo de StrictMode, que repite la misma clave de ubicación).
    const inicial = ultimaClave.current === undefined || ultimaClave.current === key
    ultimaClave.current = key
    if (hash !== '#agenda') return
    const ir = (suave: boolean) => document.getElementById('agenda')?.scrollIntoView({ behavior: suave ? 'smooth' : 'instant', block: 'start' })
    ir(!inicial)
    if (!inicial) return
    let movido = false
    const marca = () => { movido = true }
    const eventos = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const
    eventos.forEach((e) => window.addEventListener(e, marca, { passive: true, once: true }))
    const recolocar = () => { if (!movido) ir(false) }
    void document.fonts?.ready.then(recolocar)
    const t = window.setTimeout(recolocar, 700)
    return () => { clearTimeout(t); eventos.forEach((e) => window.removeEventListener(e, marca)) }
  }, [hash, key])
  // El panel de éxito entra con escala suave (nunca desde 0).
  useEffect(() => {
    if (estado === 'ok' && ok.current) gsap.from(ok.current, { opacity: 0, scale: 0.96, y: 16, duration: 0.8, ease: 'rep', clearProps: 'all' })
  }, [estado])

  // Elegir un modelo de trabajo deja el formulario listo con su motivo y lleva hasta él.
  const elegir = (m: Motivo) => {
    setMotivo(m)
    setErrores({})
    evento('reportaje', 'contact_click', { canal: `modelo-${m}` })
    document.getElementById('rp-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => form.current?.querySelector<HTMLInputElement>(m === 'revision' ? '[name=tienda]' : '[name=correo]')?.focus({ preventScroll: true }), 450)
  }

  const alEnviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    const tienda = String(d.get('tienda') ?? '').trim()
    const mail = String(d.get('correo') ?? '').trim()
    const nuevos = {
      correo: CORREO_OK.test(mail) ? undefined : c.contacto.falta,
      tienda: motivo === 'revision' && !tienda ? c.contacto.faltaTienda : undefined,
    }
    setErrores(nuevos)
    if (nuevos.tienda || nuevos.correo) {
      form.current?.querySelector<HTMLInputElement>(nuevos.tienda ? '[name=tienda]' : '[name=correo]')?.focus()
      return
    }
    void enviar({ correo: mail, tienda: tienda || undefined, motivo })
  }

  const canales: Array<{ k: string; v: string; href?: string; al?: () => void; accion: string; canal: string }> = [
    { k: c.contacto.canalCorreo, v: correo, al: copiar, accion: copiado ? c.contacto.copiado : c.contacto.copiar, canal: 'correo' },
    { k: c.contacto.whatsapp, v: personal.whatsapp, href: wa, accion: '', canal: 'whatsapp' },
    { k: c.contacto.linkedin, v: personal.name, href: personal.linkedin, accion: '', canal: 'linkedin' },
    { k: c.contacto.github, v: 'Max-Bustamante69', href: personal.github, accion: '', canal: 'github' },
    { k: c.contacto.cv, v: 'PDF', href: personal.cv, accion: '', canal: 'cv' },
  ]

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="rp-vista">
      <title>{`${c.nav.contacto} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <div className="rp-contacto rp-marco">
        <header className="rp-contacto-cab">
          <div className="rp-cab-t">
            <p className="rp-kicker rp-mono" data-rp="subir">IV · {s.sections.contact.eyebrow}</p>
            <h1 className="rp-h1 rp-h1-medio" data-rp="linea">{s.sections.contact.title} {sinPunto(s.sections.contact.titleAccent)}</h1>
          </div>
          <div className="rp-cab-d">
            <p className="rp-dek" data-rp="subir" data-rp-retraso="0.2">{s.sections.contact.lead}</p>
            <p className="rp-nota-cta" data-rp="subir" data-rp-retraso="0.3">{s.sections.contact.promise}</p>
          </div>
        </header>

        {/* El camino principal: elegir día y hora en el calendario. El formulario de abajo queda como segunda vía. */}
        <Agenda />

        {/* La segunda vía: escribir con el formulario o por cualquier canal. */}
        <div className="rp-contacto-lado">
          <div className="rp-formulario" id="rp-form" data-rp="subir" data-rp-retraso="0.15">
            <div className="rp-fig-filete" />
            <h2 className="rp-formulario-t">{c.contacto.formulario}</h2>
            <p className="rp-meta rp-formulario-i">{c.contacto.viaEscrita}</p>
            {estado === 'ok' ? (
              <div className="rp-ok" ref={ok} role="status">
                <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--gold-fill)" stroke="var(--gold-deep)" strokeWidth="1.2" /><path d="m7 12.5 3.2 3.2L17 8.8" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <p>{c.contacto.ok}</p>
              </div>
            ) : (
              <form ref={form} onSubmit={alEnviar} noValidate>
                <fieldset className="rp-motivos">
                  <legend className="rp-meta">{c.contacto.motivo}</legend>
                  {(Object.keys(MOTIVOS) as Motivo[]).map((m) => (
                    <label key={m} className="rp-opcion">
                      <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => { setMotivo(m); setErrores({}) }} />
                      <span>{c.contacto.motivos[m]}</span>
                    </label>
                  ))}
                </fieldset>
                <div className="rp-campo">
                  <label>
                    <span className="rp-meta">{c.contacto.tienda}</span>
                    <input name="tienda" type="url" inputMode="url" autoComplete="url" placeholder={c.contacto.tiendaEj} aria-invalid={!!errores.tienda} aria-describedby={errores.tienda ? 'e-tienda' : undefined} required={motivo === 'revision'} />
                  </label>
                  {errores.tienda && <em id="e-tienda" role="alert">{errores.tienda}</em>}
                </div>
                <div className="rp-campo">
                  <label>
                    <span className="rp-meta">{c.contacto.correo}</span>
                    <input name="correo" type="email" inputMode="email" autoComplete="email" placeholder={c.contacto.correoEj} aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'e-correo' : undefined} required />
                  </label>
                  {errores.correo && <em id="e-correo" role="alert">{errores.correo}</em>}
                </div>
                <button type="submit" className="rp-btn rp-btn-pri rp-enviar" aria-busy={estado === 'enviando'} disabled={estado === 'enviando'}>
                  {estado === 'enviando' ? c.contacto.enviando : <>{c.contacto.enviar[motivo]}<Flecha /></>}
                </button>
                {estado === 'error' && <p className="rp-error" role="alert">{c.contacto.error}</p>}
              </form>
            )}
          </div>

          <div data-rp="subir" data-rp-retraso="0.32">
            <h2 className="rp-mono rp-despues-t">{c.contacto.canales}</h2>
            <ul className="rp-canales">
              {canales.map((k) => (
                <li key={k.k}>
                  {k.al ? (
                    <button type="button" className="rp-canal" onClick={k.al}>
                      <span className="rp-mono">{k.k}</span><span className="rp-canal-v">{k.v}</span><span className="rp-canal-a rp-mono">{k.accion}</span>
                    </button>
                  ) : (
                    <a className="rp-canal" href={k.href} target={k.href?.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer" download={k.href === personal.cv ? true : undefined}
                      onClick={() => evento('reportaje', 'contact_click', { canal: k.canal })}>
                      <span className="rp-mono">{k.k}</span><span className="rp-canal-v">{k.v}</span><span className="rp-canal-a"><Flecha /></span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <p className="rp-sr" role="status">{copiado ? c.contacto.copiado : ''}</p>
        </div>

        <section className="rp-modelos-bloque" aria-labelledby="rp-mod-t">
          <p className="rp-kicker rp-mono" data-rp="subir">{c.contacto.modelosKicker}</p>
          <h2 id="rp-mod-t" className="rp-h2" data-rp="linea">{modelos.title} {sinPunto(modelos.titleAccent)}</h2>
          <p className="rp-lead" data-rp="subir" data-rp-retraso="0.12">{invitacion}</p>
          <ol className="rp-modelos" data-rp="grupo">
            {modelos.models.map((m, i) => (
              <li key={m.title} className="rp-modelo">
                <span className="rp-modelo-n rp-mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{m.title}</h3>
                <p>{limpioTexto(m.body)}</p>
                <button type="button" className="rp-enlace" onClick={() => elegir(MODELO_MOTIVO[i])} aria-controls="rp-form">{c.contacto.elegir}<Flecha /></button>
              </li>
            ))}
          </ol>
          {despues.length > 0 && (
            <div className="rp-despues" data-rp="subir">
              <h3 className="rp-mono rp-despues-t">{s.sections.contact.nextLabel}</h3>
              <ol>{despues.map((p) => <li key={p}>{p}</li>)}</ol>
            </div>
          )}
        </section>

        <section className="rp-faq-bloque" aria-labelledby="rp-faq-t">
          <p className="rp-kicker rp-mono" data-rp="subir">{c.contacto.faqKicker}</p>
          <h2 id="rp-faq-t" className="rp-h2" data-rp="linea">{c.contacto.faq}</h2>
          <div className="rp-faq" data-rp="subir">
            {faq.map((f) => <Acordeon key={f.q} q={f.q} a={limpioTexto(f.a).replace('{n}', String(v.registry.PUBLIC_STORE_COUNT))} />)}
          </div>
        </section>
      </div>
    </main>
  )
}
