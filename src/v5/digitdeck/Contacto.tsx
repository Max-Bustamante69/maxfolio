// Contacto: la única banda de papel. Formulario compacto (URL de la tienda · correo · motivo con preset) sobre Web3Forms con
// respaldo mailto, canales directos y la FAQ pública. El punto «cae» al confirmar el envío.
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'
import { useV5 } from '../data'
import { MOTIVOS, evento, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useCopy } from './copy'
import { EASE } from './movimiento'
import { Pagina } from './Pagina'
import { Titulo } from './piezas'

const ORDEN = Object.keys(MOTIVOS) as Motivo[]
const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

function Faq() {
  const { faq } = useV5()
  const [abierta, setAbierta] = useState<number | null>(null)
  return (
    <ul className="dd-faq">
      {faq.map((f, i) => (
        <li key={f.q} className="dd-faq__item" data-in="fila">
          <h3>
            <button type="button" className="dd-faq__q" aria-expanded={abierta === i} aria-controls={`dd-faq-${i}`} onClick={() => setAbierta(abierta === i ? null : i)}>
              <span>{f.q}</span>
              <span className="dd-faq__mas" aria-hidden="true" />
            </button>
          </h3>
          <div id={`dd-faq-${i}`} className="dd-faq__a" data-abierta={abierta === i} inert={abierta !== i}>
            <p>{f.a}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Contacto() {
  const c = useCopy()
  const { strings, personal, locale } = useV5()
  const [params] = useSearchParams()
  const inicial = (params.get('motivo') as Motivo | null) ?? 'revision'
  const [motivo, setMotivo] = useState<Motivo>(ORDEN.includes(inicial) ? inicial : 'revision')
  const [tienda, setTienda] = useState('')
  const [correo, setCorreo] = useState('')
  const [mensaje, setMensaje] = useState(() => c.contacto.preset[ORDEN.includes(inicial) ? inicial : 'revision'])
  const [invalido, setInvalido] = useState(false)
  const { estado, enviar } = useEnviarContacto('digitdeck')
  const { copiar, copiado } = useCopiarCorreo('digitdeck')
  const hora = useMedellinTime(locale)
  const cae = useRef<HTMLSpanElement>(null)
  const presetPrevio = useRef(mensaje)

  useEffect(() => evento('digitdeck', 'contact_open'), [])

  // Al elegir el motivo se prerrellena el mensaje con su preset, salvo que el visitante ya haya escrito algo propio.
  const elegir = (m: Motivo) => {
    setMotivo(m)
    if (mensaje === presetPrevio.current || !mensaje.trim()) {
      presetPrevio.current = c.contacto.preset[m]
      setMensaje(c.contacto.preset[m])
    }
  }

  useEffect(() => {
    if (estado !== 'ok' || !cae.current) return
    const tween = gsap.fromTo(cae.current, { y: -64, opacity: 0 }, { y: 0, opacity: 1, duration: 0.48, ease: EASE.out })
    return () => void tween.kill()
  }, [estado])

  const alEnviar = (e: FormEvent) => {
    e.preventDefault()
    if (!emailOk(correo)) return setInvalido(true)
    setInvalido(false)
    void enviar({ correo, tienda: tienda.trim() || undefined, motivo, mensaje: mensaje.trim() || undefined })
  }

  return (
    <Pagina titulo={`${strings.hero.ctaContact} · ${c.marca}`}>
      <header className="dd-cabpag">
        <Titulo as="h1" className="dd-display" lineas={[strings.hero.ctaContact]} />
        <p className="dd-lede" data-in>{strings.sections.contact.lead}</p>
      </header>

      <section className="dd-papel" data-tono="papel" aria-label={c.contacto.canales}>
        <form className="dd-form" onSubmit={alEnviar} noValidate data-in>
          <label className="dd-campo">
            <span className="dd-micro">{c.contacto.tienda}</span>
            <input type="text" inputMode="url" autoComplete="url" placeholder={c.contacto.tiendaEjemplo} value={tienda} onChange={(e) => setTienda(e.target.value)} />
          </label>
          <label className="dd-campo">
            <span className="dd-micro">{c.contacto.correo}</span>
            <input type="email" autoComplete="email" required aria-invalid={invalido} aria-describedby={invalido ? 'dd-err' : undefined} value={correo} onChange={(e) => setCorreo(e.target.value)} />
            {invalido && <span id="dd-err" className="dd-campo__error">{c.contacto.correoInvalido}</span>}
          </label>
          <fieldset className="dd-motivos">
            <legend className="dd-micro">{c.contacto.motivo}</legend>
            {ORDEN.map((m) => (
              <label key={m} className="dd-motivo">
                <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => elegir(m)} />
                <span>{c.contacto.motivos[m]}</span>
              </label>
            ))}
          </fieldset>
          <label className="dd-campo">
            <span className="dd-micro">{c.contacto.mensaje}</span>
            <textarea rows={3} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
          </label>
          <div className="dd-form__envio">
            <button type="submit" className="dd-boton dd-boton--grande" disabled={estado === 'enviando'}>
              {estado === 'enviando' ? c.contacto.enviando : c.contacto.enviar}
            </button>
            <p role="status" className="dd-estado">
              {estado === 'ok' && (
                <>
                  <span ref={cae} className="dd-dot dd-dot--cae" aria-hidden="true" />
                  <span>{c.contacto.ok}</span>
                </>
              )}
              {estado === 'error' && c.contacto.error}
            </p>
          </div>
        </form>

        <div className="dd-canales" data-in>
          <h2 className="dd-micro dd-canales__t">{c.contacto.canales}</h2>
          <ul>
            <li>
              <button type="button" className="dd-canal" onClick={copiar}>
                <span>{personal.email}</span>
                <span className="dd-micro" role="status">{copiado ? c.contacto.copiado : c.contacto.copiar}</span>
              </button>
            </li>
            <li>
              <a className="dd-canal" href={personal.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => evento('digitdeck', 'contact_click', { canal: 'whatsapp' })}>
                <span>{c.contacto.whatsapp}</span>
                <span className="dd-micro">{personal.whatsapp} ↗</span>
              </a>
            </li>
            <li>
              <a className="dd-canal" href={personal.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => evento('digitdeck', 'contact_click', { canal: 'linkedin' })}>
                <span>{c.contacto.linkedin}</span>
                <span className="dd-micro">↗</span>
              </a>
            </li>
            <li>
              <a className="dd-canal" href={personal.cv} download onClick={() => evento('digitdeck', 'contact_click', { canal: 'cv' })}>
                <span>{c.contacto.cv}</span>
                <span className="dd-micro">PDF</span>
              </a>
            </li>
          </ul>
          <p className="dd-micro">{c.medellin(hora)}</p>
        </div>
      </section>

      <section className="dd-seccion" aria-labelledby="dd-faq-t">
        <Titulo id="dd-faq-t" className="dd-h2" lineas={[c.contacto.preguntas]} />
        <Faq />
      </section>
    </Pagina>
  )
}
