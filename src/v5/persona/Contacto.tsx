import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sinPuntoFinal } from '../data'
import { evento, MOTIVOS, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import { Cabeza } from './Cabeza'
import { ID, usePersona } from './contexto'
import { entradaTitulos } from './efectos'
import { limpio } from './limpio'
import { Acordeon, Boton, Fondo, Titulo } from './piezas'
import { gsap, OUT, parallaxFondo, revelarPaneles, SLAM, useGsap } from './motion'

const ORDEN: Motivo[] = ['revision', 'proyecto', 'continuo', 'empleo']

export default function Contacto() {
  const { v5, c } = usePersona()
  const [params] = useSearchParams()
  const raiz = useRef<HTMLElement>(null)
  const inicial = params.get('motivo')
  const [motivo, setMotivo] = useState<Motivo>(ORDEN.includes(inicial as Motivo) ? (inicial as Motivo) : 'revision')
  const [tienda, setTienda] = useState('')
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const { estado, enviar } = useEnviarContacto(ID)
  const { copiar, copiado } = useCopiarCorreo(ID)
  const { personal, strings } = v5
  const k = strings.sections.contact
  const lang = v5.locale === 'es' ? 'es' : 'en'
  const pasos = k.next.filter((p) => limpio(p))

  useEffect(() => {
    evento(ID, 'contact_open')
  }, [])

  useGsap(raiz, () => {
    const r = raiz.current
    entradaTitulos(r)
    parallaxFondo(r)
    revelarPaneles(r, '[data-pr-panel]', 0.3)
    gsap.from('.pr-campo, .pr-form .pr-btnhost', { opacity: 0, x: -32, skewX: -6, duration: 0.5, ease: SLAM, stagger: 0.07, delay: 0.4 })
  }, [v5.locale])

  // Cambiar de motivo «calza» el formulario: el enlace de la tienda deja de ser obligatorio para el empleo.
  useGsap(raiz, () => {
    gsap.fromTo('.pr-campo--mensaje', { x: -10 }, { x: 0, duration: 0.3, ease: OUT, clearProps: 'transform' })
  }, [motivo])

  const alEnviar = (e: FormEvent) => {
    e.preventDefault()
    void enviar({ correo, tienda: tienda || undefined, motivo, mensaje: mensaje || undefined })
  }
  const canal = (nombre: string) => () => evento(ID, 'contact_click', { canal: nombre })
  const ocupado = estado === 'enviando'

  return (
    <main id="contenido" className="pr-pagina" tabIndex={-1} ref={raiz}>
      <Cabeza titulo={`${c.contacto.titulo} · ${personal.name}`} />
      <section className="pr-banda pr-banda--primera" aria-labelledby="pr-contacto">
        <Fondo src="/v5/persona/art/contact-bg-ice.webp" className="pr-fondo--rasgado" />
        <div className="pr-wrap">
          <Titulo id="pr-contacto" eyebrow={k.eyebrow} texto={sinPuntoFinal(k.title)} acento={sinPuntoFinal(k.titleAccent)} lead={k.lead} />

          <div className="pr-dialogo" data-pr-panel>
            <form className="pr-form" onSubmit={alEnviar} aria-label={c.contacto.formulario}>
              <fieldset className="pr-campo">
                <legend>{c.contacto.motivo}</legend>
                <div className="pr-motivos">
                  {ORDEN.map((m) => (
                    <label className="pr-motivo" key={m}>
                      <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => setMotivo(m)} />
                      <span>{MOTIVOS[m][lang]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="pr-campo">
                <label htmlFor="pr-tienda">
                  {motivo === 'empleo' ? c.contacto.enlace : k.urlLabel} {motivo === 'empleo' && <small>({c.contacto.opcional})</small>}
                </label>
                <input id="pr-tienda" className="pr-input" type="text" inputMode="url" autoComplete="url" placeholder={k.urlPlaceholder} required={motivo !== 'empleo'} value={tienda} onChange={(e) => setTienda(e.target.value)} />
              </div>
              <div className="pr-campo">
                <label htmlFor="pr-correo">{c.contacto.correo}</label>
                <input id="pr-correo" className="pr-input" type="email" autoComplete="email" placeholder={c.contacto.correoPlaceholder} required value={correo} onChange={(e) => setCorreo(e.target.value)} />
              </div>
              <div className="pr-campo pr-campo--mensaje">
                <label htmlFor="pr-mensaje">
                  {c.contacto.mensaje} <small>({c.contacto.opcional})</small>
                </label>
                <textarea id="pr-mensaje" className="pr-input" placeholder={c.contacto.placeholders[motivo]} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
              </div>
              <Boton type="submit" disabled={ocupado}>
                {ocupado ? c.contacto.enviando : c.contacto.enviar}
              </Boton>
              <p className="pr-estado-form" role="status" data-t={estado === 'ok' ? 'ok' : estado === 'error' ? 'error' : undefined}>
                {estado === 'ok' ? c.contacto.ok : estado === 'error' ? c.contacto.error : ''}
              </p>
            </form>

            <div className="pr-lado">
              <div>
                <h2>{k.nextLabel}</h2>
                <ol className="pr-pasos">
                  {pasos.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h2>{c.contacto.canales}</h2>
                <div className="pr-canales">
                  <button type="button" className="pr-canal" onClick={copiar}>
                    {copiado ? c.correoCopiado : `${k.email}: ${personal.email}`}
                  </button>
                  <span className="sr-only" role="status">
                    {copiado ? c.correoCopiado : ''}
                  </span>
                  <a className="pr-canal" href={personal.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={canal('whatsapp')}>
                    {c.contacto.whatsapp}
                  </a>
                  <a className="pr-canal" href={personal.linkedin} target="_blank" rel="noopener noreferrer" onClick={canal('linkedin')}>
                    {c.contacto.linkedin}
                  </a>
                  <a className="pr-canal" href={personal.github} target="_blank" rel="noopener noreferrer" onClick={canal('github')}>
                    {c.contacto.github}
                  </a>
                  <a className="pr-canal" href={personal.cv} download onClick={canal('cv')}>
                    {c.contacto.cv}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pr-banda pr-banda--papel" aria-labelledby="pr-faq">
        <div className="pr-wrap">
          <Titulo id="pr-faq" nivel={2} eyebrow={strings.sections.faq.eyebrow} texto={sinPuntoFinal(strings.sections.faq.title)} acento={sinPuntoFinal(strings.sections.faq.titleAccent)} />
          <Acordeon items={v5.faq} />
        </div>
      </section>
    </main>
  )
}
