import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { sinPuntoFinal } from '../data'
import { evento, MOTIVOS, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import AgendaSeccion from './Agenda'
import { useCopy } from './copy'
import { gsap, useVista } from './motion'
import { Acordeon, ID, Pieza, Tri } from './piezas'
import { limpioTexto, prohibido, usePublico } from './publico'

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Los tres modelos de trabajo del vivo, cada uno con el motivo del formulario que le corresponde. */
const MODELO_MOTIVO: Motivo[] = ['revision', 'proyecto', 'continuo']

export default function Contacto() {
  const c = useCopy()
  const v = usePublico()
  const { strings: s, personal, faq, obra } = v
  const [params] = useSearchParams()
  const pedido = params.get('motivo') as Motivo | null
  const [motivo, setMotivo] = useState<Motivo>(pedido && pedido in MOTIVOS ? pedido : 'revision')
  const [errores, setErrores] = useState<{ correo?: string; tienda?: string }>({})
  const [abierta, setAbierta] = useState(-1)
  const { estado, enviar } = useEnviarContacto(ID)
  const { copiar, copiado, correo } = useCopiarCorreo(ID)
  const form = useRef<HTMLFormElement>(null)
  const ok = useRef<HTMLDivElement>(null)
  const wa = `${personal.whatsappHref}?text=${encodeURIComponent(c.contacto.waTexto)}`
  const modelos = s.sections.engagement
  const kit = s.sections.buildKit.tiles
  // El vivo promete aquí un plazo de respuesta: esta dirección no imprime plazos, así que ese paso no sale.
  const despues = s.sections.contact.next.filter((p) => !prohibido(p))
  const foto = obra('mindfuel')

  const ref = useVista<HTMLElement>([])
  useEffect(() => { evento(ID, 'contact_open') }, [])
  // Con #agenda (los llamados a reservar) la vista abre en el libro de citas. Se reintenta cuando llegan las fuentes y al asentarse
  // el titular, porque el alto de lo de arriba cambia un poco; si la persona ya movió la página, no se le quita de donde está.
  const { hash, key } = useLocation()
  useLayoutEffect(() => {
    if (hash !== '#agenda') return
    let movido = false
    const mover = () => { movido = true }
    const ir = () => { if (!movido) document.getElementById('agenda')?.scrollIntoView({ block: 'start' }) }
    ir()
    const eventos = ['wheel', 'touchstart', 'keydown'] as const
    eventos.forEach((e) => window.addEventListener(e, mover, { passive: true, once: true }))
    void document.fonts?.ready.then(ir)
    const t = window.setTimeout(ir, 700)
    return () => { window.clearTimeout(t); eventos.forEach((e) => window.removeEventListener(e, mover)) }
  }, [hash, key])
  // El panel de éxito entra con un fundido y una subida corta.
  useEffect(() => {
    if (estado === 'ok' && ok.current) gsap.from(ok.current, { opacity: 0, y: 16, duration: 0.7, ease: 'velo', clearProps: 'all' })
  }, [estado])

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

  const canales: Array<{ k: string; v: string; href?: string; al?: () => void; accion: string; id: string }> = [
    { id: 'correo', k: c.contacto.canalCorreo, v: correo, al: copiar, accion: copiado ? c.contacto.copiado : c.contacto.copiar },
    { id: 'whatsapp', k: c.contacto.whatsapp, v: personal.whatsapp, href: wa, accion: '' },
    { id: 'linkedin', k: c.contacto.linkedin, v: personal.name, href: personal.linkedin, accion: '' },
    { id: 'github', k: c.contacto.github, v: 'Max-Bustamante69', href: personal.github, accion: '' },
    { id: 'cv', k: c.contacto.cvCanal, v: 'PDF', href: personal.cv, accion: '' },
  ]

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="mz-vista">
      <title>{`${c.contacto.h1} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="mz-marco mz-contacto mz-contacto-cab" aria-labelledby="mz-h1">
        <div className="mz-contacto-tit">
          <p className="mz-etq" data-mz="subir">{s.sections.contact.eyebrow}</p>
          <h1 id="mz-h1" className="mz-titulo" data-mz="linea"><span className="mz-bloque">{s.sections.contact.title}</span><em className="mz-bloque">{sinPuntoFinal(s.sections.contact.titleAccent)}</em></h1>
          <p className="mz-nota mz-contacto-lead">{s.sections.contact.lead}</p>
        </div>
      </section>

      <AgendaSeccion />

      <section className="mz-marco mz-contacto mz-contacto-2" aria-labelledby="mz-alt-t">
        <i className="mz-contacto-2-sep" aria-hidden="true" />
        <div className="mz-formulario" id="mz-form">
          <h2 id="mz-alt-t" className="mz-display mz-alterna" data-mz="linea">{c.agenda.alterna}</h2>
          {estado === 'ok' ? (
            <div className="mz-ok" ref={ok} role="status">
              <p className="mz-display">{c.contacto.ok}</p>
            </div>
          ) : (
            <form ref={form} onSubmit={alEnviar} noValidate aria-label={c.contacto.form}>
              <fieldset className="mz-motivos">
                <legend className="mz-etq">{c.contacto.motivo}</legend>
                <div className="mz-modelos-l">
                  {modelos.models.map((m, i) => (
                    <label key={m.title} className="mz-modelo">
                      <input type="radio" name="motivo" value={MODELO_MOTIVO[i]} checked={motivo === MODELO_MOTIVO[i]} onChange={() => { setMotivo(MODELO_MOTIVO[i]); setErrores({}); evento(ID, 'contact_click', { canal: `modelo-${MODELO_MOTIVO[i]}` }) }} />
                      <span className="mz-modelo-c">
                        <span className="mz-modelo-n">{String(i + 1).padStart(2, '0')}</span>
                        <span className="mz-modelo-t">{m.title}</span>
                        <span className="mz-modelo-b">{m.body}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <label className="mz-chip">
                  <input type="radio" name="motivo" value="empleo" checked={motivo === 'empleo'} onChange={() => { setMotivo('empleo'); setErrores({}) }} />
                  <span>{c.contacto.motivos.empleo}</span>
                </label>
              </fieldset>
              <div className="mz-campo">
                <label>
                  <span className="mz-etq">{c.contacto.tienda}</span>
                  <input name="tienda" type="url" inputMode="url" autoComplete="url" placeholder={c.contacto.tiendaEj} aria-invalid={!!errores.tienda} aria-describedby={errores.tienda ? 'mz-e-tienda' : undefined} required={motivo === 'revision'} />
                  <i className="mz-campo-linea" aria-hidden="true" />
                </label>
                {errores.tienda && <em id="mz-e-tienda" role="alert">{errores.tienda}</em>}
              </div>
              <div className="mz-campo">
                <label>
                  <span className="mz-etq">{c.contacto.correo}</span>
                  <input name="correo" type="email" inputMode="email" autoComplete="email" placeholder={c.contacto.correoEj} aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'mz-e-correo' : undefined} required />
                  <i className="mz-campo-linea" aria-hidden="true" />
                </label>
                {errores.correo && <em id="mz-e-correo" role="alert">{errores.correo}</em>}
              </div>
              <button type="submit" className="mz-btn mz-enviar" aria-busy={estado === 'enviando'} disabled={estado === 'enviando'}>
                {estado === 'enviando' ? c.contacto.enviando : c.contacto.enviar[motivo]}
              </button>
              {estado === 'error' && <p className="mz-error" role="alert">{c.contacto.error}</p>}
            </form>
          )}
          <p className="mz-cuerpo mz-apagado mz-promesa">{s.sections.contact.promise}</p>
        </div>

        <div className="mz-contacto-lado">
          {foto && <Pieza o={foto} clase="mz-contacto-pieza" />}
          <ul className="mz-canales">
            {canales.map((k) => (
              <li key={k.id}>
                {k.al ? (
                  <button type="button" className="mz-canal" onClick={k.al}>
                    <span className="mz-etq">{k.k}</span><span className="mz-canal-v">{k.v}</span><span className="mz-canal-a">{k.accion}</span>
                  </button>
                ) : (
                  <a className="mz-canal" href={k.href} target="_blank" rel="noopener noreferrer" download={k.href === personal.cv ? true : undefined}
                    onClick={() => evento(ID, 'contact_click', { canal: k.id })}>
                    <span className="mz-etq">{k.k}</span><span className="mz-canal-v">{k.v}</span><span className="mz-canal-a"><Tri /></span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
        <p className="mz-sr" role="status">{copiado ? c.contacto.copiado : ''}</p>
      </section>

      <section className="mz-marco mz-sec mz-despues-sec" aria-labelledby="mz-desp-t">
        <div className="mz-cab-sec">
          <h2 id="mz-desp-t" className="mz-etq" data-mz="subir">{s.sections.contact.nextLabel}</h2>
        </div>
        <ol className="mz-despues">{despues.map((p) => <li key={p} className="mz-nota">{p}</li>)}</ol>
      </section>

      <section className="mz-marco mz-sec mz-kit" aria-labelledby="mz-kit-t">
        <div className="mz-cab-sec">
          <p className="mz-etq" data-mz="subir">{s.sections.buildKit.eyebrow}</p>
          <h2 id="mz-kit-t" className="mz-titulo-sec" data-mz="linea"><span className="mz-bloque">{s.sections.buildKit.title}</span><em className="mz-bloque">{s.sections.buildKit.titleAccent}</em></h2>
        </div>
        <ul className="mz-kit-l">
          {[kit.repo, kit.checks].map((t) => (
            <li key={t.title}>
              <i className="mz-filete" aria-hidden="true" />
              <h3 className="mz-kit-t">{t.title}</h3>
              <p className="mz-cuerpo">{t.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mz-marco mz-sec mz-faq" aria-labelledby="mz-faq-t">
        <div className="mz-cab-sec">
          <p className="mz-etq" data-mz="subir">{s.sections.faq.eyebrow}</p>
          <h2 id="mz-faq-t" className="mz-titulo-sec" data-mz="linea">{c.contacto.faq}</h2>
        </div>
        <div className="mz-faq-l">
          {faq.map((f, i) => (
            <Acordeon key={f.q} abierto={abierta === i} alternar={() => setAbierta(abierta === i ? -1 : i)} cabeza={<span className="mz-acc-t">{f.q}</span>}>
              <p className="mz-nota">{limpioTexto(f.a)}</p>
            </Acordeon>
          ))}
        </div>
      </section>
    </main>
  )
}
