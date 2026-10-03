import { useEffect, useId, useState } from 'react'
import { MOTIVOS, evento, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { sinPuntoFinal } from '../data'
import { Linea } from './Linea'
import { Registros } from './Reglas'
import { useC } from './useC'

/** Contacto: el brief por fichas compone un mensaje (nada se envía hasta que se manda), un formulario compacto y los canales directos. */
export default function Contacto() {
  const { t, strings, personal, faq, locale, intlLocale } = useC()
  const c = strings.sections.contact
  const servicios = strings.footer.services as readonly string[]
  const [fichas, setFichas] = useState<number[]>([])
  const [motivo, setMotivo] = useState<Motivo>('revision')
  const { estado, enviar } = useEnviarContacto('c')
  const { copiar, copiado } = useCopiarCorreo('c')
  const hora = useMedellinTime(intlLocale)
  const id = useId()
  const lista = fichas.map((i) => servicios[i]).join(', ')
  const texto = t.contacto.waTexto(lista)
  const idioma = locale === 'es' ? 'es' : 'en'

  useEffect(() => {
    evento('c', 'contact_open')
  }, [])

  const pulsa = (canal: string) => () => evento('c', 'contact_click', { canal })
  const correoHref = `mailto:${personal.email}?subject=${encodeURIComponent(t.contacto.waAsunto)}&body=${encodeURIComponent(texto)}`

  return (
    <main id="contenido" tabIndex={-1} className="c-pagina c-contacto">
      <title>{`${t.nav.contacto} · ${personal.name}`}</title>
      <section className="c-calco c-hoja c-hoja--ancha" aria-labelledby="c-con-h" data-c-calco>
        <span className="c-tab c-mono">{t.contacto.calco}</span>
        <Registros />
        <p className="c-eyebrow">{c.eyebrow}</p>
        <h1 id="c-con-h" className="c-nombre c-nombre--con" data-c-h1>
          <Linea className="c-nombre__l">{c.title}</Linea>
          <Linea>{sinPuntoFinal(c.titleAccent)}</Linea>
        </h1>
        <p className="c-apoyo">{c.lead}</p>
        <p className="c-nota">{c.promise}</p>
      </section>

      <div className="c-con__grid">
        <form
          className="c-calco c-form c-con__hoja"
          data-c-calco
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            void enviar({ correo: String(f.get('correo')), tienda: String(f.get('tienda') || ''), motivo, mensaje: lista ? t.contacto.interes(lista) : undefined })
          }}
        >
          <Registros />
          <fieldset className="c-brief">
            <legend className="c-h3">{t.contacto.brief}</legend>
            <p className="c-nota">{t.contacto.briefLead}</p>
            <div className="c-brief__chips">
              {servicios.map((s, i) => (
                <button key={s} type="button" className="c-chip c-chip--btn" aria-pressed={fichas.includes(i)} onClick={() => setFichas((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))}>
                  <span>{s}</span>
                </button>
              ))}
            </div>
            <output className="c-brief__salida">{texto}</output>
            <div className="c-brief__acc">
              <a className="c-btn c-btn--tinta" href={`${personal.whatsappHref}?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" onClick={pulsa('whatsapp')}>
                {t.contacto.whatsapp}
                <span className="c-sr"> ({t.ficha.nuevaPestana})</span>
              </a>
              <a className="c-btn c-btn--linea" href={correoHref} onClick={pulsa('correo-mailto')}>
                {t.contacto.correoLink}
              </a>
            </div>
          </fieldset>

          <div className="c-campos">
            <label className="c-campo">
              <span>{c.urlLabel}</span>
              <input name="tienda" type="text" inputMode="url" autoComplete="url" placeholder={c.urlPlaceholder} />
            </label>
            <label className="c-campo">
              <span>{t.contacto.correo}</span>
              <input name="correo" type="email" autoComplete="email" required />
            </label>
            <label className="c-campo">
              <span>{t.contacto.motivo}</span>
              <select value={motivo} onChange={(e) => setMotivo(e.target.value as Motivo)}>
                {(Object.keys(MOTIVOS) as Motivo[]).map((m) => (
                  <option key={m} value={m}>
                    {MOTIVOS[m][idioma]}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="c-btn c-btn--tinta" disabled={estado === 'enviando'}>
              {estado === 'enviando' ? t.contacto.enviando : t.contacto.enviar}
            </button>
          </div>
          <p className="c-form__estado" role="status">
            {estado === 'ok' ? t.contacto.ok : estado === 'error' ? t.contacto.error : ''}
          </p>
        </form>

        <div className="c-con__col">
          <section aria-labelledby={`${id}-d`} className="c-calco c-directo c-con__hoja" data-c-calco>
            <Registros />
            <h2 id={`${id}-d`} className="c-h3">
              {t.contacto.directo}
            </h2>
            <ul className="c-directo__lista">
              <li>
                <button type="button" className="c-btn c-btn--linea" onClick={copiar}>
                  {t.contacto.copiar}
                </button>
                <span className="c-mono c-directo__dato">{personal.email}</span>
                <span className="c-sr" role="status">
                  {copiado ? t.contacto.copiado : ''}
                </span>
              </li>
              <li>
                <a className="c-link" href={personal.linkedin} target="_blank" rel="noopener noreferrer" onClick={pulsa('linkedin')}>
                  {t.contacto.linkedin}
                  <span className="c-sr"> ({t.ficha.nuevaPestana})</span>
                </a>
              </li>
              <li>
                <a className="c-link" href={personal.cv} target="_blank" rel="noopener noreferrer" onClick={pulsa('cv')}>
                  {strings.hero.ctaCv}
                </a>
              </li>
              <li>
                <a className="c-link" href={personal.phoneHref} onClick={pulsa('llamar')}>
                  {t.contacto.llamar} <span className="c-mono">{personal.phone}</span>
                </a>
              </li>
            </ul>
            <p className="c-nota">
              {c.status}. {c.note}
            </p>
            <p className="c-mono c-hora">{t.contacto.hora(hora)}</p>
          </section>

          <section aria-labelledby={`${id}-n`} className="c-calco c-con__hoja" data-c-calco>
            <Registros />
            <h2 id={`${id}-n`} className="c-h3">
              {c.nextLabel}
            </h2>
            <ol className="c-pasos">
              {c.next.map((p: string) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <section aria-labelledby={`${id}-f`} className="c-calco c-faq c-con__hoja" data-c-calco>
        <Registros />
        <h2 id={`${id}-f`} className="c-h3">
          {t.contacto.faq}
        </h2>
        {faq.map((f) => (
          <Pregunta key={f.q} q={f.q} a={f.a} />
        ))}
      </section>
    </main>
  )
}

/** Pregunta de la FAQ: el cuerpo se abre con la técnica de filas de rejilla (0fr → 1fr), sin medir alturas. */
function Pregunta({ q, a }: { q: string; a: string }) {
  const [abierta, setAbierta] = useState(false)
  const id = useId()
  return (
    <div className="c-preg" data-abierta={abierta || undefined}>
      <h3>
        <button type="button" aria-expanded={abierta} aria-controls={id} onClick={() => setAbierta((v) => !v)}>
          <span>{q}</span>
          <svg className="c-ico" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 9h10M9 4v10" />
          </svg>
        </button>
      </h3>
      <div id={id} role="region" aria-label={q} className="c-preg__cuerpo" inert={!abierta}>
        <div>
          <p>{a}</p>
        </div>
      </div>
    </div>
  )
}
