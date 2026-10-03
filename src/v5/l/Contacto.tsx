import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { sinPuntoFinal } from '../data'
import { MOTIVOS, evento, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { ROLES } from './datos'
import { entrada, useGsap } from './motion'
import { WhatsApp } from './social'
import { Flecha, Palabras, useL } from './ui'

/** Pregunta frecuente: botón + región que se abre con la técnica grid-template-rows (0fr → 1fr), sin alturas mágicas. */
function Pregunta({ q, a }: { q: string; a: string }) {
  const [abierta, setAbierta] = useState(false)
  const id = useId()
  return (
    <li className="l-q" data-open={abierta} data-rv>
      <h3>
        <button type="button" aria-expanded={abierta} aria-controls={id} onClick={() => setAbierta((v) => !v)}>
          <span>{q}</span>
          <i aria-hidden="true" />
        </button>
      </h3>
      <div id={id} role="region" aria-label={q} className="l-q-body">
        <div>
          <p>{a}</p>
        </div>
      </div>
    </li>
  )
}

export default function Contacto() {
  const { c, v5, locale } = useL()
  const raiz = useRef<HTMLDivElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)
  const [eleg, setEleg] = useState<string[]>([])
  const [url, setUrl] = useState('')
  const [correo, setCorreo] = useState('')
  const [motivo, setMotivo] = useState<Motivo>('revision')
  const [errores, setErrores] = useState<{ url?: string; correo?: string }>({})
  const { estado, enviar } = useEnviarContacto('l')
  const { copiar, copiado, correo: miCorreo } = useCopiarCorreo('l')
  const hora = useMedellinTime(v5.intlLocale)
  const idUrl = useId()
  const idCorreo = useId()
  const idMotivo = useId()
  const lang: 'es' | 'en' = locale === 'es' ? 'es' : 'en'

  useGsap(raiz, entrada, [])
  useEffect(() => {
    evento('l', 'contact_open')
  }, [])

  const piezas = ROLES.map((r) => ({ id: r, nombre: c.piezas[r].nombre }))
  const fugas = c.contacto.fugas.map((n) => ({ id: `f-${n}`, nombre: n }))
  const todos = [...piezas, ...fugas]
  const nombresElegidos = todos.filter((t) => eleg.includes(t.id)).map((t) => t.nombre)
  const lista = nombresElegidos.join(', ')
  const cuerpo = c.contacto.cuerpo(lista)
  const mailto = `mailto:${miCorreo}?subject=${encodeURIComponent(c.contacto.asunto)}&body=${encodeURIComponent(cuerpo)}`
  const wa = `${v5.personal.whatsappHref}?text=${encodeURIComponent(`${c.contacto.asunto}. ${cuerpo}`)}`
  const alternar = (id: string) => setEleg((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]))

  const enviarForm = (e: FormEvent) => {
    e.preventDefault()
    const err: typeof errores = {}
    if (!url.trim()) err.url = c.contacto.errorUrl
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) err.correo = c.contacto.errorCorreo
    setErrores(err)
    if (err.url) return urlRef.current?.focus()
    if (err.correo) return document.getElementById(idCorreo)?.focus()
    void enviar({ correo: correo.trim(), tienda: url.trim(), motivo, mensaje: lista ? `${c.contacto.elegiste(lista)}` : undefined })
  }

  const titulo = sinPuntoFinal(v5.strings.sections.contact.title)
  return (
    <div ref={raiz}>
      <title>{`${c.nav.contacto} · ${v5.personal.name}`}</title>
      <meta name="robots" content="noindex" />
      <section className="l-hero l-hero-s">
        <p className="l-mono l-eyebrow" data-rv>
          {v5.strings.sections.contact.eyebrow}
        </p>
        <h1 className="l-h1 l-h1-s">
          <Palabras texto={titulo} />
        </h1>
        <span className="l-rule" data-regla aria-hidden="true" />
        <p className="l-lead" data-rv>
          {v5.strings.sections.contact.lead}
        </p>
      </section>

      <section className="l-sheet l-pedir" aria-labelledby="l-pedir-t">
        <div className="l-pedir-in">
          <div className="l-pedir-col">
            <h2 id="l-pedir-t" className="l-h2" data-rv>
              {c.contacto.pedir}
            </h2>
            <p className="l-sub" data-rv>
              {c.contacto.pedirNota}
            </p>
            <fieldset className="l-fs" data-rv>
              <legend className="l-mono">{c.nav.piezas}</legend>
              <ul className="l-chips">
                {piezas.map((p) => (
                  <li key={p.id}>
                    <button type="button" className="l-chip" aria-pressed={eleg.includes(p.id)} onClick={() => alternar(p.id)}>
                      {p.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            </fieldset>
            <fieldset className="l-fs" data-rv>
              <legend className="l-mono">{c.contacto.fuga}</legend>
              <ul className="l-chips">
                {fugas.map((p) => (
                  <li key={p.id}>
                    <button type="button" className="l-chip" aria-pressed={eleg.includes(p.id)} onClick={() => alternar(p.id)}>
                      {p.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            </fieldset>
            <p className="l-live" role="status" data-rv>
              {lista ? c.contacto.elegiste(lista) : c.contacto.ninguna}
            </p>
            <div className="l-acts" data-rv>
              <a className="l-btn l-btn-lg" href={mailto} onClick={() => evento('l', 'contact_click', { canal: 'correo-compuesto', piezas: String(eleg.length) })}>
                {c.contacto.porCorreo}
              </a>
              <a className="l-btn l-btn-ghost l-btn-lg" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => evento('l', 'contact_click', { canal: 'whatsapp-compuesto', piezas: String(eleg.length) })}>
                <WhatsApp />
                {c.contacto.porWhatsApp}
              </a>
            </div>
          </div>

          <form className="l-form" onSubmit={enviarForm} noValidate data-rv>
            <h2 className="l-h3">{c.contacto.formulario}</h2>
            <div className="l-field">
              <label htmlFor={idUrl}>{v5.strings.sections.contact.urlLabel}</label>
              <input ref={urlRef} id={idUrl} name="tienda" type="text" inputMode="url" autoComplete="url" placeholder={c.contacto.urlEjemplo} value={url} onChange={(e) => setUrl(e.target.value)} aria-invalid={!!errores.url} aria-describedby={errores.url ? `${idUrl}-e` : undefined} />
              {errores.url && (
                <p id={`${idUrl}-e`} className="l-err" role="alert">
                  {errores.url}
                </p>
              )}
            </div>
            <div className="l-field">
              <label htmlFor={idCorreo}>{c.contacto.correo}</label>
              <input id={idCorreo} name="correo" type="email" inputMode="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} aria-invalid={!!errores.correo} aria-describedby={errores.correo ? `${idCorreo}-e` : undefined} />
              {errores.correo && (
                <p id={`${idCorreo}-e`} className="l-err" role="alert">
                  {errores.correo}
                </p>
              )}
            </div>
            <div className="l-field">
              <label htmlFor={idMotivo}>{c.contacto.motivo}</label>
              <select id={idMotivo} name="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value as Motivo)}>
                {(Object.keys(MOTIVOS) as Motivo[]).map((m) => (
                  <option key={m} value={m}>
                    {MOTIVOS[m][lang]}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="l-btn l-btn-lg" disabled={estado === 'enviando'} aria-busy={estado === 'enviando'}>
              {estado === 'enviando' ? c.contacto.enviando : c.contacto.enviar}
            </button>
            <p className="l-live" role="status">
              {estado === 'ok' ? c.contacto.enviado : estado === 'error' ? c.contacto.fallo : ''}
            </p>
          </form>
        </div>
      </section>

      <section className="l-canales" aria-labelledby="l-can-t">
        <h2 id="l-can-t" className="l-mono l-sheet-t" data-rv>
          {c.contacto.canales}
        </h2>
        <ul className="l-can-list">
          <li data-rv>
            <button type="button" className="l-can" onClick={copiar}>
              <span className="l-mono">{c.contacto.copiar}</span>
              <span className="l-can-v">{miCorreo}</span>
            </button>
            <span role="status" className="l-mono l-copiado">
              {copiado ? c.contacto.copiado : ''}
            </span>
          </li>
          <li data-rv>
            <a className="l-can" href={v5.personal.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => evento('l', 'contact_click', { canal: 'whatsapp' })}>
              <span className="l-mono">{c.contacto.whatsapp}</span>
              <span className="l-can-v">
                <WhatsApp /> {v5.personal.whatsapp}
              </span>
            </a>
          </li>
          <li data-rv>
            <a className="l-can" href={v5.personal.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => evento('l', 'contact_click', { canal: 'linkedin' })}>
              <span className="l-mono">{c.contacto.linkedin}</span>
              <span className="l-can-v">in/maximiliano-bustamante</span>
            </a>
          </li>
          <li data-rv>
            <a className="l-can" href={v5.personal.cv} download onClick={() => evento('l', 'contact_click', { canal: 'cv' })}>
              <span className="l-mono">{c.contacto.cv}</span>
              <span className="l-can-v">PDF</span>
            </a>
          </li>
          <li data-rv>
            <a className="l-can" href={v5.personal.phoneHref}>
              <span className="l-mono">{c.contacto.llamadas}</span>
              <span className="l-can-v">{v5.personal.phone}</span>
            </a>
          </li>
          <li data-rv>
            <div className="l-can l-can-hora">
              <span className="l-mono">{c.contacto.hora}</span>
              <span className="l-can-v l-mono-n">{hora}</span>
            </div>
          </li>
        </ul>
      </section>

      <section className="l-sheet l-faq" aria-labelledby="l-faq-t">
        <div className="l-faq-in">
          <h2 id="l-faq-t" className="l-h2" data-rv>
            {c.contacto.preguntas}
          </h2>
          <ul className="l-qs">
            {v5.faq.map((f) => (
              <Pregunta key={f.q} q={f.q} a={f.a} />
            ))}
          </ul>
        </div>
      </section>

      <section className="l-close" aria-labelledby="l-close-t">
        <h2 id="l-close-t" className="l-close-h" data-rv>
          {c.contacto.cierre}
        </h2>
        <p className="l-close-p" data-rv>
          {v5.strings.sections.engagement.models[0].body}
        </p>
        <button
          type="button"
          className="l-btn l-btn-lg l-btn-inv"
          data-rv
          onClick={() => {
            urlRef.current?.scrollIntoView({ block: 'center' })
            urlRef.current?.focus({ preventScroll: true })
          }}
        >
          {c.contacto.cierreCta} <Flecha dir="arriba" />
        </button>
      </section>
    </div>
  )
}
