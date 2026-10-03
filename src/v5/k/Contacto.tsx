import { useEffect, useRef, useState, type FormEvent } from 'react'
import { sinPuntoFinal, useV5, v5path } from '../data'
import { evento, MOTIVOS, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { Cabeza, frases } from './Cabeza'
import { useCopy } from './copy'
import { WHATSAPP_SVG } from './iconos'
import { centroDe, formatoN, idTabla, placaDe } from './medicion'
import { CORTE, gsap, revelar, useEscena } from './motion'
import { KLink } from './nav'
import { Placa, type PlacaApi } from './Placa'
import { useMedia } from './useMedia'

const INTL = { es: 'es-ES', en: 'en-GB', ja: 'ja-JP' } as const
const MOTIVOS_ORDEN: Motivo[] = ['revision', 'proyecto', 'continuo', 'empleo']

export default function Contacto() {
  const c = useCopy()
  const { strings, personal, faq, locale } = useV5()
  const l2 = locale === 'es' ? 'es' : 'en'
  const ct = strings.sections.contact
  const fmt = formatoN(locale)
  const { estado, enviar } = useEnviarContacto('k')
  const { copiar, copiado, correo } = useCopiarCorreo('k')
  const hora = useMedellinTime(INTL[locale])
  const raiz = useRef<HTMLDivElement>(null)
  const [paso, setPaso] = useState<0 | 1>(0)
  const [tienda, setTienda] = useState('')
  const [mail, setMail] = useState('')
  const [motivo, setMotivo] = useState<Motivo>('revision')
  const [mensaje, setMensaje] = useState(c.contacto.presets.revision)
  const [tocado, setTocado] = useState(false)
  useEffect(() => {
    if (paso === 1) document.getElementById('k-correo')?.focus()
  }, [paso])
  const lineas = frases(`${ct.title} ${ct.titleAccent}`, sinPuntoFinal)
  // La idea de la dirección también vive aquí: la placa de NOS Café junto al formulario, y «Qué miro» mueve su línea.
  const movil = useMedia('(max-width: 767px)')
  const nos = placaDe('nos-cafe', 'home', movil && placaDe('nos-cafe', 'home', 'mobile') ? 'mobile' : 'desktop')
  const sec = (clave: string) => nos.secs.find((s) => s.k.startsWith(clave))
  const idx = (clave: string) => nos.secs.findIndex((s) => s.k.startsWith(clave))
  const api = useRef<PlacaApi>(null)
  const [activa, setActiva] = useState(0)
  const t0 = centroDe(nos.secs, Math.max(idx('hero'), 0)) / nos.alto

  useEscena(raiz, () => {
    const a = api.current
    const tl = gsap.timeline({ defaults: { ease: 'k-out', clearProps: 'clipPath,transform,opacity' } })
    tl.from('.k-h1 .k-l', { clipPath: CORTE.bloque.from, yPercent: 28, duration: 0.65, stagger: 0.1 }, 0)
    tl.from('.k-bajada, .k-forma', { clipPath: CORTE.bloque.from, duration: 0.55, stagger: 0.1 }, 0.2)
    if (a) {
      a.irT(0)
      tl.from(a.marco(), { clipPath: 'inset(0 100% 0 0)', duration: 0.6 }, 0.3)
      a.barrer(t0, { delay: 0.5, duration: 0.8 })
    }
    tl.from('.k-der > section, .k-fija > section', { clipPath: CORTE.bloque.from, duration: 0.55, stagger: 0.09 }, 0.45)
    return revelar(raiz.current!, '.k-faq details, .k-canales')
  }, [])

  const alEnviarUrl = (e: FormEvent) => {
    e.preventDefault()
    if (!tienda.trim()) return
    evento('k', 'contact_open', { paso: 'url' })
    setPaso(1)
  }
  const alEnviar = (e: FormEvent) => {
    e.preventDefault()
    void enviar({ correo: mail, tienda, motivo, mensaje })
  }
  const elegir = (m: Motivo) => {
    setMotivo(m)
    if (!tocado) setMensaje(c.contacto.presets[m])
  }
  const wa = `${personal.whatsappHref}?text=${encodeURIComponent(c.contacto.waTexto)}`

  const puntos = [
    { id: 'velocidad', ...c.contacto.puntos.velocidad, s: sec('hero'), idx: idx('hero'), clave: sec('hero')?.k },
    { id: 'ofertas', ...c.contacto.puntos.ofertas, s: sec('combos'), idx: idx('combos'), clave: sec('combos')?.k },
    // El carrito es un cajón: no ocupa un tramo de la página, así que su fila no mueve la línea (solo lleva a la ficha).
    { id: 'checkout', ...c.contacto.puntos.checkout, s: undefined, idx: -1, clave: nos.cajones.find((x) => x.startsWith('cart')) },
  ]

  return (
    <div ref={raiz} className="k-contacto k-pag">
      <Cabeza titulo={c.contacto.titulo} />
      <div className="k-izq">
        <h1 className="k-h1 k-h1--sec">
          {lineas.map((f, i) => (
            <span key={i}><span className="k-l">{f}</span>{' '}</span>
          ))}
        </h1>
        <p className="k-bajada">{ct.lead}</p>

        <form className="k-forma" onSubmit={paso === 0 ? alEnviarUrl : alEnviar} aria-label={ct.cta}>
          <label className="k-campo k-campo--grande">
            <span className="k-mono">{ct.urlLabel}</span>
            <input type="text" inputMode="url" autoComplete="url" name="tienda" placeholder={ct.urlPlaceholder} value={tienda} onChange={(e) => setTienda(e.target.value)} required />
          </label>
          {paso === 0 ? (
            <button type="submit" className="k-btn">{c.pedir}</button>
          ) : (
            <div className="k-forma-2">
              <label className="k-campo">
                <span className="k-mono">{c.contacto.correo}</span>
                <input id="k-correo" type="email" autoComplete="email" name="correo" value={mail} onChange={(e) => setMail(e.target.value)} required />
              </label>
              <label className="k-campo">
                <span className="k-mono">{c.contacto.motivo}</span>
                <select value={motivo} onChange={(e) => elegir(e.target.value as Motivo)}>
                  {MOTIVOS_ORDEN.map((m) => <option key={m} value={m}>{MOTIVOS[m][l2]}</option>)}
                </select>
              </label>
              <label className="k-campo k-campo--ancho">
                <span className="k-mono">{c.contacto.mensaje}</span>
                <textarea rows={3} name="mensaje" value={mensaje} onChange={(e) => { setTocado(true); setMensaje(e.target.value) }} />
              </label>
              <div className="k-forma-pie">
                <button type="submit" className="k-btn" disabled={estado === 'enviando'}>{estado === 'enviando' ? c.contacto.enviando : c.contacto.enviar}</button>
                <button type="button" className="k-btn k-btn--linea" onClick={() => setPaso(0)}>{c.contacto.atras}</button>
              </div>
            </div>
          )}
          <p className="k-estado k-mono" role="status">
            {estado === 'ok' ? c.contacto.ok : estado === 'error' ? c.contacto.error : paso === 0 ? c.pedirNota : ''}
          </p>
        </form>

        <section className="k-despues-s" aria-labelledby="k-despues-t">
          <h2 id="k-despues-t" className="k-h2">{ct.nextLabel}</h2>
          <ol className="k-despues">
            {ct.next.map((t, i) => <li key={i}><span className="k-mono">{String(i + 1).padStart(2, '0')}</span>{t}</li>)}
          </ol>
        </section>

        <section className="k-canales" aria-labelledby="k-canales-t">
          <h2 id="k-canales-t" className="k-h2">{c.contacto.canales}</h2>
          <ul>
            <li>
              <button type="button" className="k-canal" onClick={copiar}>
                <span className="k-mono">{c.contacto.correo}</span>
                <b>{correo}</b>
                <em className="k-mono" role="status">{copiado ? c.contacto.copiado : c.contacto.copiar}</em>
              </button>
            </li>
            <li>
              <a className="k-canal" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => evento('k', 'contact_click', { canal: 'whatsapp' })}>
                <span className="k-mono">WhatsApp</span>
                <b><span className="k-wa" aria-hidden="true" dangerouslySetInnerHTML={{ __html: WHATSAPP_SVG }} />{personal.whatsapp}</b>
                <em className="k-mono">{c.contacto.textoListo}</em>
              </a>
            </li>
            <li>
              <a className="k-canal" href={personal.phoneHref} onClick={() => evento('k', 'contact_click', { canal: 'llamada' })}>
                <span className="k-mono">{c.contacto.llamadas}</span>
                <b>{personal.phone}</b>
                <em className="k-mono">{c.contacto.llamar}</em>
              </a>
            </li>
            <li>
              <a className="k-canal" href={personal.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => evento('k', 'contact_click', { canal: 'linkedin' })}>
                <span className="k-mono">LinkedIn</span>
                <b>Maximiliano Bustamante</b>
                <em className="k-mono">{c.contacto.abrir}</em>
              </a>
            </li>
            <li>
              <a className="k-canal" href={personal.github} target="_blank" rel="noopener noreferrer" onClick={() => evento('k', 'contact_click', { canal: 'github' })}>
                <span className="k-mono">GitHub</span>
                <b>Max-Bustamante69</b>
                <em className="k-mono">{c.contacto.abrir}</em>
              </a>
            </li>
          </ul>
          <p className="k-hora k-mono">{c.medellin} <time>{hora}</time></p>
        </section>
        <section className="k-faq" aria-labelledby="k-faq-t">
          <h2 id="k-faq-t" className="k-h2">{c.contacto.faq}</h2>
          {faq.map((f, i) => (
            <details key={i}>
              <summary>{f.q}<span className="k-mas" aria-hidden="true" /></summary>
              <div className="k-det"><div><p>{f.a}</p></div></div>
            </details>
          ))}
        </section>
      </div>

      <div className="k-der">
        <div className="k-fija">
          <Placa
            ref={api}
            clase="k-placa--contacto"
            placa={nos}
            nombre="NOS Café"
            titulo={c.inicio.placaTitulo('01', 'NOS Café')}
            activa={activa}
            onActiva={setActiva}
            resaltada={null}
            prioridad
            t0={t0}
            tablaId={idTabla(nos)}
          />
          <section aria-labelledby="k-mira-t">
            <h2 id="k-mira-t" className="k-h2">{c.contacto.mira}</h2>
            <ol className="k-mira">
              {puntos.map((p, i) => (
                <li key={p.id} data-on={p.idx >= 0 && p.idx === activa ? 'true' : undefined}>
                  <span className="k-mono k-mira-n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    {p.idx >= 0 ? (
                      <button type="button" className="k-mira-b" aria-pressed={p.idx === activa} onClick={() => api.current?.irA(p.idx)}>
                        <b>{p.titulo}</b>
                        <span className="k-mono">{c.contacto.moverLinea}</span>
                      </button>
                    ) : (
                      <b className="k-mira-t">{p.titulo}</b>
                    )}
                    <p>{p.texto}</p>
                    <KLink className="k-donde k-mono" to={`${v5path('k', 'obra', 'nos-cafe')}${p.s ? `?seccion=${encodeURIComponent(p.s.k)}` : ''}`}>
                      {p.clave ? c.contacto.dondeSeVe(p.clave, p.s ? `${fmt(p.s.h)} px` : c.contacto.cajon) : c.contacto.verPlaca}
                    </KLink>
                  </div>
                </li>
              ))}
            </ol>
            <p className="k-nota">{c.contacto.noPromete}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
