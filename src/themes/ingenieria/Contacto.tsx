import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sinPuntoFinal } from '../data'
import { evento, MOTIVOS, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import { useCopy } from './copy'
import { gsap, SALE, useVista } from './motion'
import { Cabecera, Flecha } from './piezas'
import { partirFrase, prohibido, usePublico } from './publico'
import { CanonicalPlato } from '../shared/canonical'

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Los tres modelos de trabajo del vivo, cada uno con el motivo del formulario que le corresponde. */
const MODELO_MOTIVO: Motivo[] = ['revision', 'proyecto', 'continuo']

function Acordeon({ q, a }: { q: string; a: string }) {
  const [abierto, setAbierto] = useState(false)
  const id = useId()
  const panel = useRef<HTMLDivElement>(null)
  const alternar = () => {
    const sig = !abierto
    setAbierto(sig)
    if (sig && panel.current) gsap.fromTo(panel.current.firstElementChild, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.5, ease: SALE, clearProps: 'transform,opacity' })
  }
  return (
    <div className="ing-acc" data-abierto={abierto}>
      <h3>
        <button type="button" className="ing-acc-b" aria-expanded={abierto} aria-controls={id} onClick={alternar}>
          <span>{q}</span>
          <span className="ing-mas" aria-hidden="true" />
        </button>
      </h3>
      <div id={id} ref={panel} className="ing-acc-cuerpo" hidden={!abierto}><p>{a}</p></div>
    </div>
  )
}

export default function Contacto() {
  const c = useCopy()
  const { strings: s, personal, faq } = usePublico()
  const [params] = useSearchParams()
  const pedido = params.get('motivo') as Motivo | null
  const [motivo, setMotivo] = useState<Motivo>(pedido && pedido in MOTIVOS ? pedido : 'revision')
  const [errores, setErrores] = useState<{ correo?: string; tienda?: string }>({})
  const { estado, enviar } = useEnviarContacto('ingenieria')
  const { copiar, copiado, correo } = useCopiarCorreo('ingenieria')
  const form = useRef<HTMLFormElement>(null)
  const ok = useRef<HTMLDivElement>(null)
  const wa = `${personal.whatsappHref}?text=${encodeURIComponent(c.contacto.waTexto)}`
  const modelos = s.sections.engagement
  // El vivo promete aquí un plazo de respuesta: esta dirección no imprime plazos, así que ese paso no sale.
  const despues = s.sections.contact.next.filter((p) => !prohibido(p))
  const [, invitacion = modelos.lead] = partirFrase(modelos.lead)

  const ref = useVista<HTMLElement>([])
  useEffect(() => { evento('ingenieria', 'contact_open') }, [])
  useEffect(() => {
    if (estado === 'ok' && ok.current) gsap.from(ok.current, { opacity: 0, y: 18, duration: 0.8, ease: SALE, clearProps: 'all' })
  }, [estado])

  // Elegir un modelo de trabajo deja el formulario listo con su motivo y lleva hasta él.
  const elegir = (m: Motivo) => {
    setMotivo(m)
    setErrores({})
    evento('ingenieria', 'contact_click', { canal: `modelo-${m}` })
    document.getElementById('ing-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

  const canal = (k: string, v: string, href: string, id: string, extra?: { download?: boolean }) => (
    <li key={k}>
      <a className="ing-canal" href={href} target={extra?.download ? undefined : '_blank'} rel="noopener noreferrer" download={extra?.download ? true : undefined} onClick={() => evento('ingenieria', 'contact_click', { canal: id })}>
        <span className="ing-canal-k">{k}</span><span className="ing-canal-v">{v}</span><Flecha />
      </a>
    </li>
  )

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="ing-vista">
      <title>{`${c.nav.contacto} · ${personal.name}`}</title>
      <CanonicalPlato />

      <section className="ing-contacto" aria-labelledby="ing-h1">
        <div className="ing-marco ing-contacto-g">
          <div className="ing-contacto-izq">
            <Cabecera id="ing-h1" nivel={1} anim="titular" etq={s.sections.contact.eyebrow} titulo={s.sections.contact.title} acento={sinPuntoFinal(s.sections.contact.titleAccent)} />
            <p className="ing-lead" data-ing="subir" data-ing-retraso="0.25">{s.sections.contact.lead}</p>
            <p className="ing-nota" data-ing="subir" data-ing-retraso="0.35">{s.sections.contact.promise}</p>
          </div>

          <div className="ing-despues" data-ing="subir" data-ing-retraso="0.4">
            <p className="ing-etq">{s.sections.contact.nextLabel}</p>
            <ol>{despues.map((p, i) => <li key={p}><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{p}</li>)}</ol>
          </div>

          <div className="ing-contacto-der">
            <div className="ing-form" id="ing-form" data-ing="marco" data-ing-retraso="0.2">
              <p className="ing-etq">{c.contacto.form}</p>
              {estado === 'ok' ? (
                <div className="ing-ok" ref={ok} role="status">
                  <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--ing-accent)" /><path d="m7 12.5 3.2 3.2L17 8.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <p>{c.contacto.ok}</p>
                </div>
              ) : (
                <form ref={form} onSubmit={alEnviar} noValidate>
                  <fieldset className="ing-motivos">
                    <legend>{c.contacto.motivo}</legend>
                    {(Object.keys(MOTIVOS) as Motivo[]).map((m) => (
                      <label key={m} className="ing-chip">
                        <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => { setMotivo(m); setErrores({}) }} />
                        <span>{c.contacto.motivos[m]}</span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="ing-campo">
                    <label>
                      <span>{c.contacto.tienda}</span>
                      <input name="tienda" type="url" inputMode="url" autoComplete="url" placeholder={c.contacto.tiendaEj} aria-invalid={!!errores.tienda} aria-describedby={errores.tienda ? 'e-tienda' : undefined} required={motivo === 'revision'} />
                    </label>
                    {errores.tienda && <em id="e-tienda" role="alert">{errores.tienda}</em>}
                  </div>
                  <div className="ing-campo">
                    <label>
                      <span>{c.contacto.correo}</span>
                      <input name="correo" type="email" inputMode="email" autoComplete="email" placeholder={c.contacto.correoEj} aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'e-correo' : undefined} required />
                    </label>
                    {errores.correo && <em id="e-correo" role="alert">{errores.correo}</em>}
                  </div>
                  <button type="submit" className="ing-btn ing-btn-pri ing-enviar" aria-busy={estado === 'enviando'} disabled={estado === 'enviando'}>
                    {estado === 'enviando' ? c.contacto.enviando : c.contacto.enviar[motivo]}<Flecha />
                  </button>
                  {estado === 'error' && <p className="ing-error" role="alert">{c.contacto.error}</p>}
                </form>
              )}
            </div>

            <div className="ing-canales" data-ing="subir" data-ing-retraso="0.3">
              <p className="ing-etq">{c.contacto.canales}</p>
              <ul>
                <li>
                  <button type="button" className="ing-canal" onClick={copiar}>
                    <span className="ing-canal-k">{c.contacto.correoC}</span><span className="ing-canal-v">{correo}</span><span className="ing-canal-a">{copiado ? c.contacto.copiado : c.contacto.copiar}</span>
                  </button>
                </li>
                {canal(c.contacto.whatsapp, personal.whatsapp, wa, 'whatsapp')}
                {canal(c.contacto.linkedin, personal.name, personal.linkedin, 'linkedin')}
                {canal(c.contacto.github, 'Max-Bustamante69', personal.github, 'github')}
                {canal(c.contacto.cvC, 'PDF', personal.cv, 'cv', { download: true })}
              </ul>
              <p className="ing-sr" role="status">{copiado ? c.contacto.copiado : ''}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ing-sec ing-modelos" aria-labelledby="ing-mod-t">
        <div className="ing-marco">
          <Cabecera id="ing-mod-t" etq={modelos.eyebrow} titulo={modelos.title} acento={modelos.titleAccent} texto={invitacion} />
          <ul className="ing-modelos-l" data-ing="grupo">
            {modelos.models.map((m, i) => (
              <li key={m.title} className="ing-modelo">
                <span className="ing-modelo-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
                <button type="button" className="ing-enlace" onClick={() => elegir(MODELO_MOTIVO[i])} aria-controls="ing-form">{c.contacto.elegir}<Flecha /></button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ing-sec ing-faq" aria-labelledby="ing-faq-t">
        <div className="ing-marco ing-faq-g">
          <Cabecera id="ing-faq-t" etq={s.sections.faq.eyebrow} titulo={s.sections.faq.title} acento={s.sections.faq.titleAccent} />
          <div data-ing="subir">
            {faq.map((f) => <Acordeon key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>
    </main>
  )
}
