import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sinPuntoFinal, useV5 } from '../data'
import { evento, MOTIVOS, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import { useCopy } from './copy'
import { gsap, useVista } from './motion'
import { Chevron } from './piezas'
import { partirFrase, prohibido } from './publico'

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Los tres modelos de trabajo del vivo, cada uno con el motivo del formulario que le corresponde. */
const MODELO_MOTIVO: Motivo[] = ['revision', 'proyecto', 'continuo']

function Acordeon({ q, a }: { q: string; a: string }) {
  const [abierto, setAbierto] = useState(false)
  const id = useId()
  return (
    <div className="ap-acc" data-abierto={abierto}>
      <h3>
        <button type="button" className="ap-acc-b" aria-expanded={abierto} aria-controls={id} onClick={() => setAbierto(!abierto)}>
          <span>{q}</span>
          <span className="ap-mas" aria-hidden="true" />
        </button>
      </h3>
      <div id={id} className="ap-acc-cuerpo" inert={!abierto}>
        <div className="ap-acc-in"><p>{a}</p></div>
      </div>
    </div>
  )
}

export default function Contacto() {
  const c = useCopy()
  const { strings: s, personal, faq } = useV5()
  const [params] = useSearchParams()
  const pedido = params.get('motivo') as Motivo | null
  const [motivo, setMotivo] = useState<Motivo>(pedido && pedido in MOTIVOS ? pedido : 'revision')
  const [errores, setErrores] = useState<{ correo?: string; tienda?: string }>({})
  const { estado, enviar } = useEnviarContacto('apple')
  const { copiar, copiado, correo } = useCopiarCorreo('apple')
  const form = useRef<HTMLFormElement>(null)
  const ok = useRef<HTMLDivElement>(null)
  const wa = `${personal.whatsappHref}?text=${encodeURIComponent(c.contacto.waTexto)}`
  const modelos = s.sections.engagement
  // El vivo promete aquí un plazo de respuesta: esta dirección no imprime plazos, así que ese paso no sale.
  const despues = s.sections.contact.next.filter((p) => !prohibido(p))
  const [, invitacion = modelos.lead] = partirFrase(modelos.lead)

  const ref = useVista<HTMLElement>([])
  useEffect(() => { evento('apple', 'contact_open') }, [])
  // El panel de éxito entra con escala suave (nunca desde 0).
  useEffect(() => {
    if (estado === 'ok' && ok.current) gsap.from(ok.current, { opacity: 0, scale: 0.96, y: 18, duration: 0.8, ease: 'apple', clearProps: 'all' })
  }, [estado])

  // Elegir un modelo de trabajo deja el formulario listo con su motivo y lleva hasta él.
  const elegir = (m: Motivo) => {
    setMotivo(m)
    setErrores({})
    evento('apple', 'contact_click', { canal: `modelo-${m}` })
    const f = document.getElementById('ap-form')
    f?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

  const canales: Array<{ k: string; v: string; href?: string; al?: () => void; accion: string }> = [
    { k: c.contacto.canalCorreo, v: correo, al: copiar, accion: copiado ? c.contacto.copiado : c.contacto.copiar },
    { k: c.contacto.whatsapp, v: personal.whatsapp, href: wa, accion: '' },
    { k: c.contacto.linkedin, v: personal.name, href: personal.linkedin, accion: '' },
    { k: c.contacto.github, v: 'Max-Bustamante69', href: personal.github, accion: '' },
    { k: c.contacto.cv, v: 'PDF', href: personal.cv, accion: '' },
  ]

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="ap-vista">
      <title>{`${c.nav.contacto} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="ap-contacto ap-frame" aria-labelledby="ap-h1">
        <div className="ap-contacto-tit">
          <p className="ap-eyebrow" data-ap="subir">{s.sections.contact.eyebrow}</p>
          <h1 id="ap-h1" className="ap-titulo" data-ap="linea">
            <span className="ap-bloque">{s.sections.contact.title}</span>{' '}
            <span className="ap-bloque ap-tenue">{sinPuntoFinal(s.sections.contact.titleAccent)}</span>
          </h1>
          <p className="ap-contacto-lead" data-ap="subir" data-ap-retraso="0.2">{s.sections.contact.lead}</p>
          <p className="ap-contacto-prom" data-ap="subir" data-ap-retraso="0.3">{s.sections.contact.promise}</p>
        </div>

        <div className="ap-formulario" id="ap-form" data-ap="escala" data-ap-retraso="0.25">
          {estado === 'ok' ? (
            <div className="ap-ok" ref={ok} role="status">
              <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--v5-ok)" /><path d="m7 12.5 3.2 3.2L17 8.8" fill="none" stroke="var(--v5-on-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <p>{c.contacto.ok}</p>
            </div>
          ) : (
            <form ref={form} onSubmit={alEnviar} noValidate>
              <fieldset className="ap-motivos">
                <legend>{c.contacto.motivo}</legend>
                {(Object.keys(MOTIVOS) as Motivo[]).map((m) => (
                  <label key={m} className="ap-chip">
                    <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => { setMotivo(m); setErrores({}) }} />
                    <span>{c.contacto.motivos[m]}</span>
                  </label>
                ))}
              </fieldset>
              <div className="ap-campo">
                <label>
                  <span>{c.contacto.tienda}</span>
                  <input name="tienda" type="url" inputMode="url" autoComplete="url" placeholder={c.contacto.tiendaEj} aria-invalid={!!errores.tienda} aria-describedby={errores.tienda ? 'e-tienda' : undefined} required={motivo === 'revision'} />
                </label>
                {errores.tienda && <em id="e-tienda" role="alert">{errores.tienda}</em>}
              </div>
              <div className="ap-campo">
                <label>
                  <span>{c.contacto.correo}</span>
                  <input name="correo" type="email" inputMode="email" autoComplete="email" placeholder={c.contacto.correoEj} aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'e-correo' : undefined} required />
                </label>
                {errores.correo && <em id="e-correo" role="alert">{errores.correo}</em>}
              </div>
              <button type="submit" className="ap-btn ap-btn-pri ap-enviar" aria-busy={estado === 'enviando'} disabled={estado === 'enviando'}>
                {estado === 'enviando' ? c.contacto.enviando : c.contacto.enviar[motivo]}
              </button>
              {estado === 'error' && <p className="ap-error" role="alert">{c.contacto.error}</p>}
            </form>
          )}
        </div>

        <div className="ap-contacto-lado">
          <div className="ap-despues" data-ap="subir" data-ap-retraso="0.3">
            <h2 className="ap-despues-t">{s.sections.contact.nextLabel}</h2>
            <ol>{despues.map((p) => <li key={p}>{p}</li>)}</ol>
          </div>
          <ul className="ap-canales" data-ap="grupo" data-ap-retraso="0.3">
            {canales.map((k) => (
              <li key={k.k}>
                {k.al ? (
                  <button type="button" className="ap-canal" onClick={k.al}>
                    <span className="ap-canal-k">{k.k}</span><span className="ap-canal-v">{k.v}</span>
                    <span className="ap-canal-a">{k.accion}</span>
                  </button>
                ) : (
                  <a className="ap-canal" href={k.href} target={k.href?.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer" download={k.href === personal.cv ? true : undefined}
                    onClick={() => evento('apple', 'contact_click', { canal: k.k === c.contacto.whatsapp ? 'whatsapp' : k.k === c.contacto.linkedin ? 'linkedin' : k.k === c.contacto.github ? 'github' : 'cv' })}>
                    <span className="ap-canal-k">{k.k}</span><span className="ap-canal-v">{k.v}</span>
                    <span className="ap-canal-a"><Chevron /></span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
        <p className="ap-sr" role="status">{copiado ? c.contacto.copiado : ''}</p>
      </section>

      <section className="ap-modelos ap-frame" aria-labelledby="ap-mod-t">
        <div className="ap-modelos-cab">
          <h2 id="ap-mod-t" className="ap-subtitulo" data-ap="linea">
            <span className="ap-bloque">{modelos.title}</span>
            <span className="ap-bloque ap-tenue">{modelos.titleAccent}</span>
          </h2>
          <p className="ap-modelos-lead" data-ap="subir" data-ap-retraso="0.1">{invitacion}</p>
        </div>
        <ul className="ap-modelos-l" data-ap="grupo">
          {modelos.models.map((m, i) => (
            <li key={m.title} className="ap-modelo">
              <span className="ap-modelo-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
              <button type="button" className="ap-enlace" onClick={() => elegir(MODELO_MOTIVO[i])} aria-controls="ap-form">{c.contacto.elegir}<Chevron /></button>
            </li>
          ))}
        </ul>
      </section>

      <section className="ap-faq ap-frame" aria-labelledby="ap-faq-t">
        <h2 id="ap-faq-t" className="ap-subtitulo" data-ap="linea">{c.contacto.faq}</h2>
        <div data-ap="subir">
          {faq.map((f) => <Acordeon key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>
    </main>
  )
}
