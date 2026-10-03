import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sinPuntoFinal, useV5 } from '../data'
import { evento, MOTIVOS, useEnviarContacto, type Motivo } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useCopy } from './copy'
import { useEntrada } from './movimiento'
import { Cabeza, Flecha, Linea } from './piezas'

const INTL = { es: 'es-ES', en: 'en-GB', ja: 'ja-JP' } as const

/** Las tres palabras-enlace del contacto: Archivo 800 a todo el ancho; al pasar el cursor la fila se invierte (papel sobre tinta).
 *  «Correo» es un enlace mailto: que, si el navegador deja copiar, copia la dirección: la fila se invierte 1,6 s y la palabra
 *  pasa a «Copiado» (el aviso para lectores de pantalla es un hermano del enlace, no un hijo). Sin portapapeles, mailto: normal. */
export function PalabrasContacto() {
  const c = useCopy().contacto
  const { personal } = useV5()
  const [copiado, setCopiado] = useState(false)
  const temporizador = useRef<number | undefined>(undefined)
  useEffect(() => () => clearTimeout(temporizador.current), [])
  const canal = (nombre: string) => () => evento('a', 'contact_click', { canal: nombre })
  const copiar = (e: MouseEvent<HTMLAnchorElement>) => {
    canal('correo')()
    if (!navigator.clipboard?.writeText || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigator.clipboard.writeText(personal.email).then(
      () => { setCopiado(true); clearTimeout(temporizador.current); temporizador.current = window.setTimeout(() => setCopiado(false), 1600) },
      () => { location.href = `mailto:${personal.email}` },
    )
  }
  return (
    <section className="a-palabras" aria-label={c.canales}>
      <ul>
        <li>
          <a className="a-palabra" href={`mailto:${personal.email}`} data-copiado={copiado || undefined} onClick={copiar}>
            <span className="a-palabra-txt">{copiado ? c.copiado : c.correo}</span>
            <span className="a-palabra-dato a-sec">{personal.email}</span>
          </a>
          <span className="a-sr" role="status">{copiado ? `${c.copiado}: ${personal.email}` : ''}</span>
        </li>
        <li>
          <a className="a-palabra" href={`${personal.whatsappHref}?text=${encodeURIComponent(c.waTexto)}`} target="_blank" rel="noopener noreferrer" onClick={canal('whatsapp')}>
            <span className="a-palabra-txt">{c.whatsapp}</span>
            <span className="a-palabra-dato a-sec">{personal.whatsapp}<Flecha tipo="externa" /></span>
          </a>
        </li>
        <li>
          <a className="a-palabra" href={personal.linkedin} target="_blank" rel="noopener noreferrer" onClick={canal('linkedin')}>
            <span className="a-palabra-txt">{c.linkedin}</span>
            <span className="a-palabra-dato a-sec">{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, '').replace(/\/$/, '')}<Flecha tipo="externa" /></span>
          </a>
        </li>
      </ul>
    </section>
  )
}

/** Formulario compacto: URL de la tienda · correo · motivo (con texto de partida) sobre el Web3Forms de la v5. */
function Formulario() {
  const c = useCopy().contacto
  const { strings, locale } = useV5()
  const [params] = useSearchParams()
  const inicial = (params.get('motivo') as Motivo | null) ?? 'revision'
  const [motivo, setMotivo] = useState<Motivo>(inicial in MOTIVOS ? inicial : 'revision')
  const [mensaje, setMensaje] = useState(c.presets[motivo])
  const { estado, enviar } = useEnviarContacto('a')
  const idioma = locale === 'es' ? 'es' : 'en'
  // El texto de partida sigue al motivo mientras la persona no haya escrito el suyo.
  const [partida, setPartida] = useState(c.presets[motivo])
  const elegir = (m: Motivo) => {
    setMotivo(m)
    if (mensaje === '' || mensaje === partida) { setPartida(c.presets[m]); setMensaje(c.presets[m]) }
  }
  const alEnviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    enviar({ correo: String(f.get('correo')), tienda: String(f.get('tienda') ?? '') || undefined, motivo, mensaje })
  }
  return (
    <form className="a-form" onSubmit={alEnviar} aria-describedby="a-form-estado">
      <label className="a-campo">
        <span className="a-sec">{strings.sections.contact.urlLabel}</span>
        <input name="tienda" type="text" inputMode="url" autoComplete="url" placeholder={strings.sections.contact.urlPlaceholder} />
      </label>
      <label className="a-campo">
        <span className="a-sec">{c.form.correo}</span>
        <input name="correo" type="email" required autoComplete="email" placeholder={c.form.correoEjemplo} />
      </label>
      <fieldset className="a-motivos">
        <legend className="a-sec">{c.form.motivo}</legend>
        {(Object.keys(MOTIVOS) as Motivo[]).map((m) => (
          <label className="a-chip" key={m}>
            <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => elegir(m)} />
            <span>{MOTIVOS[m][idioma]}</span>
          </label>
        ))}
      </fieldset>
      <label className="a-campo">
        <span className="a-sec">{c.form.mensaje}</span>
        <textarea name="mensaje" rows={4} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
      </label>
      <div className="a-form-pie">
        <button className="a-boton" type="submit" disabled={estado === 'enviando'}>{estado === 'enviando' ? c.form.enviando : c.form.enviar}<Flecha tipo="derecha" /></button>
        <p id="a-form-estado" role="status" className="a-form-estado">{estado === 'ok' ? c.form.ok : estado === 'error' ? c.form.error : ''}</p>
      </div>
    </form>
  )
}

export default function Contacto() {
  const c = useCopy()
  const { strings, faq, personal, locale } = useV5()
  const k = strings.sections.contact
  const raiz = useRef<HTMLElement>(null)
  useEntrada(raiz)
  useEffect(() => { evento('a', 'contact_open') }, [])
  const hora = useMedellinTime(INTL[locale])
  const modelos = strings.sections.engagement.models
  const mailto = (asunto: string) => `mailto:${personal.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(`${c.contacto.urlTienda} `)}`
  return (
    <main id="contenido" tabIndex={-1} ref={raiz}>
      <Cabeza titulo={`${c.nav.contacto} · ${personal.name}`} />
      <div className="a-pag">
        <header className="a-vista-cab">
          <h1 className="a-h1"><Linea>{sinPuntoFinal(k.title)}</Linea></h1>
          <p className="a-lead" data-a="entra">{k.lead}</p>
        </header>
        <PalabrasContacto />
        <div className="a-contacto-cols">
          <section aria-labelledby="a-h-form" data-a="entra">
            <h2 id="a-h-form" className="a-h2">{c.contacto.form.titulo}</h2>
            <Formulario />
          </section>
          <section aria-labelledby="a-h-vias" data-a="entra">
            <h2 id="a-h-vias" className="a-h2">{c.contacto.vias}</h2>
            <ul className="a-vias">
              {modelos.map((m) => (
                <li key={m.title}>
                  <a href={mailto(m.title)} onClick={() => evento('a', 'contact_click', { canal: 'via' })}>
                    <span className="a-via-titulo">{m.title}</span>
                    <span className="a-via-cuerpo">{m.body}</span>
                    <span className="a-via-elegir a-sec">{c.contacto.elegir}<Flecha tipo="derecha" /></span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="a-contacto-cols a-contacto-despues">
          <section aria-labelledby="a-h-pasos" data-a="entra">
            <h2 id="a-h-pasos" className="a-h2">{k.nextLabel}</h2>
            <ol className="a-pasos">{k.next.map((p) => <li key={p}>{p}</li>)}</ol>
          </section>
          <section aria-label={c.contacto.llamadas} data-a="entra">
            <p className="a-nota-contacto">{k.note}</p>
            <p className="a-telefono"><span className="a-sec">{c.contacto.llamadas}</span> <a href={personal.phoneHref} onClick={() => evento('a', 'contact_click', { canal: 'llamada' })}>{personal.phone}</a></p>
            <p className="a-hora-contacto a-sec">{c.medellin} <time>{hora}</time></p>
          </section>
        </div>
        <section className="a-faq" aria-labelledby="a-h-faq" data-a="entra">
          <h2 id="a-h-faq" className="a-h2">{c.contacto.faq}</h2>
          {faq.map((f) => (
            <details key={f.q}>
              <summary><span>{f.q}</span><i className="a-mas-menos" aria-hidden="true" /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      </div>
    </main>
  )
}
