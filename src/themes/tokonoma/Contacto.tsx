import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sinPuntoFinal, useV5 } from '../data'
import { evento, MOTIVOS, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import Agenda from './Agenda'
import { useCopy } from './copy'
import { dice, limpio } from './limpio'
import { gsap, useVista } from './motion'
import { ID, Pares } from './piezas'

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Los tres modos de trabajo del vivo, cada uno con el motivo del formulario que le corresponde: elegir el modo ES elegir el motivo. */
const MODO_MOTIVO: Motivo[] = ['revision', 'proyecto', 'continuo']

/** Pregunta de la FAQ: la respuesta se abre con la altura real del contenido (grid 0fr → 1fr, el acordeón de la casa). */
function Pregunta({ q, a }: { q: string; a: string }) {
  const [abierta, setAbierta] = useState(false)
  const id = useId()
  return (
    <li className="tk-pregunta" data-abierta={abierta}>
      <h3>
        <button type="button" aria-expanded={abierta} aria-controls={id} onClick={() => setAbierta(!abierta)}>
          <span>{q}</span>
          <i className="tk-mas-i" aria-hidden="true" />
        </button>
      </h3>
      <div id={id} className="tk-pliega" inert={!abierta}>
        <div className="tk-pliega-in"><p className="tk-respuesta">{a}</p></div>
      </div>
    </li>
  )
}

export default function Contacto() {
  const c = useCopy()
  const { strings: s, personal, faq, locale } = useV5()
  const [params] = useSearchParams()
  const pedido = params.get('motivo') as Motivo | null
  const [motivo, setMotivo] = useState<Motivo>(pedido && pedido in MOTIVOS ? pedido : 'revision')
  const [errores, setErrores] = useState<{ correo?: string; tienda?: string }>({})
  const { estado, enviar } = useEnviarContacto(ID)
  const { copiar, copiado, correo } = useCopiarCorreo(ID)
  const form = useRef<HTMLFormElement>(null)
  const ok = useRef<HTMLDivElement>(null)
  const ref = useVista<HTMLElement>([locale])
  const ct = s.sections.contact
  const modos = s.sections.engagement
  const despues = ct.next.filter((p) => !dice(p))

  useEffect(() => { evento(ID, 'contact_open') }, [])
  useEffect(() => {
    if (estado === 'ok' && ok.current) gsap.from(ok.current, { opacity: 0, y: 10, duration: 0.8, ease: 'tk-expo', clearProps: 'all' })
  }, [estado])

  const alEnviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    const tienda = String(d.get('tienda') ?? '').trim()
    const mail = String(d.get('correo') ?? '').trim()
    const mensaje = String(d.get('mensaje') ?? '').trim()
    const nuevos = { correo: CORREO_OK.test(mail) ? undefined : c.contacto.correoFalta, tienda: motivo === 'revision' && !tienda ? c.contacto.tiendaFalta : undefined }
    setErrores(nuevos)
    if (nuevos.tienda || nuevos.correo) {
      form.current?.querySelector<HTMLInputElement>(nuevos.tienda ? '[name=tienda]' : '[name=correo]')?.focus()
      return
    }
    void enviar({ correo: mail, tienda: tienda || undefined, motivo, mensaje: mensaje || undefined })
  }

  const alCanal = (canal: string) => () => evento(ID, 'contact_click', { canal })
  const canales: Array<[string, ReactNode]> = [
    [c.contacto.correo, <button type="button" className="tk-copiar" onClick={copiar}>{correo}<span>{copiado ? c.contacto.copiado : c.contacto.copiar}</span></button>],
    [c.contacto.whatsapp, <a href={personal.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={alCanal('whatsapp')}>{personal.whatsapp}</a>],
    [c.contacto.linkedin, <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" onClick={alCanal('linkedin')}>{personal.name}</a>],
    [c.contacto.github, <a href={personal.github} target="_blank" rel="noopener noreferrer" onClick={alCanal('github')}>Max-Bustamante69</a>],
    [c.contacto.cv, <a href={personal.cv} download onClick={alCanal('cv')}>PDF</a>],
  ]

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="tk-vista">
      <title>{`${c.contacto.titulo} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <header className="tk-contacto-cab tk-fr">
        <p className="tk-rotulo" data-tk="sube">{ct.eyebrow}</p>
        <h1 className="tk-titular tk-titular-c" data-tk="barrido">
          <span data-b className="tk-b">{ct.title}</span>{' '}
          <span data-b className="tk-b tk-b2">{sinPuntoFinal(ct.titleAccent)}</span>
        </h1>
        <p className="tk-sub" data-tk="sube" data-tk-r="0.1">{ct.lead} {ct.promise}</p>
      </header>

      {/* El camino principal: elegir una hora y agendar la llamada. El mensaje de abajo es la segunda vía. */}
      <Agenda />

      <section id="escribeme" className="tk-contacto tk-fr tk-12" aria-labelledby="tk-escribeme-t">
        <h2 id="tk-escribeme-t" className="tk-h2 tk-escribeme-t" data-tk="titulo">{c.contacto.formulario}</h2>
        <div className="tk-contacto-lado" data-tk="grupo">
          <div>
            <h2 className="tk-h3">{c.contacto.canales}</h2>
            <Pares items={canales} className="tk-canales" />
          </div>
          <div>
            <h2 className="tk-h3">{ct.nextLabel}</h2>
            <ol className="tk-despues">{despues.map((p) => <li key={p}>{p}</li>)}</ol>
          </div>
        </div>

        <div className="tk-formulario" data-tk="sube" data-tk-r="0.1">
          {estado === 'ok' ? (
            <div ref={ok} role="status" className="tk-ok"><p>{c.contacto.ok}</p></div>
          ) : (
            <form ref={form} onSubmit={alEnviar} noValidate>
              <fieldset className="tk-motivos">
                <legend>{c.contacto.motivo}</legend>
                {MODO_MOTIVO.map((m, i) => (
                  <label key={m} className="tk-modo">
                    <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => { setMotivo(m); setErrores({}) }} />
                    <span className="tk-modo-t">{modos.models[i].title}</span>
                    <span className="tk-modo-c">{limpio(modos.models[i].body)}</span>
                  </label>
                ))}
                <label className="tk-modo">
                  <input type="radio" name="motivo" value="empleo" checked={motivo === 'empleo'} onChange={() => { setMotivo('empleo'); setErrores({}) }} />
                  <span className="tk-modo-t">{c.contacto.motivos.empleo}</span>
                  <span className="tk-modo-c">{c.contacto.empleoNota}</span>
                </label>
              </fieldset>
              <div className="tk-campo">
                <label htmlFor="tk-tienda">{c.contacto.tienda}</label>
                <input id="tk-tienda" name="tienda" type="url" inputMode="url" autoComplete="url" placeholder={c.contacto.tiendaEj} aria-invalid={!!errores.tienda} aria-describedby={errores.tienda ? 'tk-e-tienda' : undefined} />
                {errores.tienda && <em id="tk-e-tienda" role="alert">{errores.tienda}</em>}
              </div>
              <div className="tk-campo">
                <label htmlFor="tk-correo">{c.contacto.correoL}</label>
                <input id="tk-correo" name="correo" type="email" inputMode="email" autoComplete="email" placeholder={c.contacto.correoEj} aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'tk-e-correo' : undefined} />
                {errores.correo && <em id="tk-e-correo" role="alert">{errores.correo}</em>}
              </div>
              <div className="tk-campo">
                <label htmlFor="tk-mensaje">{c.contacto.mensaje}</label>
                <textarea id="tk-mensaje" name="mensaje" rows={3} />
              </div>
              <button type="submit" className="tk-boton tk-enviar" aria-busy={estado === 'enviando'} disabled={estado === 'enviando'}>
                {estado === 'enviando' ? c.contacto.enviando : c.contacto.enviar[motivo]}
              </button>
              {estado === 'error' && <p className="tk-error" role="alert">{c.contacto.error}</p>}
            </form>
          )}
        </div>
      </section>

      <section className="tk-faq tk-fr tk-12" aria-labelledby="tk-faq-t">
        <h2 id="tk-faq-t" className="tk-h2" data-tk="sube">{s.sections.faq.title} <span className="tk-tenue">{s.sections.faq.titleAccent}</span></h2>
        <ul className="tk-preguntas" data-tk="grupo">
          {faq.map((f) => <Pregunta key={f.q} q={f.q} a={limpio(f.a)} />)}
        </ul>
      </section>
    </main>
  )
}
