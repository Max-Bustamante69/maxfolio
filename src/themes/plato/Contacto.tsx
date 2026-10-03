import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sinPuntoFinal } from '../data'
import { evento, MOTIVOS, useCopiarCorreo, useEnviarContacto, type Motivo } from '../shared/contacto'
import { ID, usePlato } from './contexto'
import { gsap, useVista } from './motion'
import { Flecha, Rod } from './piezas'
import { limpioTexto, partirFrase } from './publico'

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Los tres modelos de trabajo del vivo, cada uno con el motivo del formulario que le corresponde. */
const MODELO_MOTIVO: Motivo[] = ['revision', 'proyecto', 'continuo']

function Acordeon({ q, a }: { q: string; a: string }) {
  const [abierto, setAbierto] = useState(false)
  const id = useId()
  return (
    <div className="pl-acc" data-abierto={abierto}>
      <h3>
        <button type="button" className="pl-acc-b" aria-expanded={abierto} aria-controls={id} onClick={() => setAbierto(!abierto)}>
          <span>{q}</span>
          <span className="pl-mas-i" aria-hidden="true" />
        </button>
      </h3>
      <div id={id} className="pl-acc-cuerpo" inert={!abierto}>
        <div className="pl-acc-in"><p>{a}</p></div>
      </div>
    </div>
  )
}

export default function Contacto() {
  const { c, v } = usePlato()
  const { strings: s, personal, faq } = v
  const [params] = useSearchParams()
  const pedido = params.get('motivo') as Motivo | null
  const [motivo, setMotivo] = useState<Motivo>(pedido && pedido in MOTIVOS ? pedido : 'revision')
  const [errores, setErrores] = useState<{ correo?: string; tienda?: string }>({})
  const { estado, enviar } = useEnviarContacto(ID)
  const { copiar, copiado, correo } = useCopiarCorreo(ID)
  const form = useRef<HTMLFormElement>(null)
  const ok = useRef<HTMLDivElement>(null)
  const modelos = s.sections.engagement
  const cont = s.sections.contact
  const [, invitacion = modelos.lead] = partirFrase(modelos.lead)
  const wa = `${personal.whatsappHref}?text=${encodeURIComponent(c.contacto.waTexto)}`
  const proceso = s.sections.process
  // Los tres puntos donde casi toda tienda pierde ingresos (velocidad, ofertas, checkout), cada uno con lo que ya medí en ese punto y su fuente.
  const cifra = (id: string) => v.cifras.find((f) => f.id === id)
  const oferta = v.obra('the-gummy-box')?.facts[0]
  const pruebas = [
    cifra('loadTime') && { valor: cifra('loadTime')!.valor, etq: cifra('loadTime')!.etiqueta, fuente: cifra('loadTime')!.fuente },
    oferta && { valor: oferta.value, etq: oferta.label, fuente: c.contacto.ofertaFuente },
    cifra('conversion') && { valor: cifra('conversion')!.valor, etq: cifra('conversion')!.etiqueta, fuente: cifra('conversion')!.fuente },
  ]

  const ref = useVista<HTMLElement>([])
  useEffect(() => { evento(ID, 'contact_open') }, [])
  useEffect(() => {
    if (estado === 'ok' && ok.current) gsap.from(ok.current, { opacity: 0, scale: 0.96, y: 18, duration: 0.8, ease: 'pl', clearProps: 'all' })
  }, [estado])

  // Elegir un modelo de trabajo deja el formulario listo con su motivo y lleva hasta él.
  const elegir = (m: Motivo) => {
    setMotivo(m)
    setErrores({})
    evento(ID, 'contact_click', { canal: `modelo-${m}` })
    document.getElementById('pl-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

  const canales: Array<{ k: string; v: string; href?: string; al?: () => void; accion: string; canal?: string }> = [
    { k: c.contacto.canalCorreo, v: correo, al: copiar, accion: copiado ? c.contacto.copiado : c.contacto.copiar },
    { k: c.contacto.whatsapp, v: personal.whatsapp, href: wa, accion: '', canal: 'whatsapp' },
    { k: c.contacto.linkedin, v: personal.name, href: personal.linkedin, accion: '', canal: 'linkedin' },
    { k: c.contacto.github, v: 'Max-Bustamante69', href: personal.github, accion: '', canal: 'github' },
    { k: c.contacto.cvCanal, v: 'PDF', href: personal.cv, accion: '', canal: 'cv' },
  ]

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="pl-vista pl-contacto">
      <title>{`${c.nav.contacto} · ${personal.name}`}</title>
      <meta name="robots" content="noindex" />

      <section className="pl-pedir" data-tono="oscuro" aria-labelledby="pl-h1">
        <div className="pl-pedir-panel">
          <div className="pl-pedir-tit">
            <p className="pl-mono pl-kicker pl-pedir-eyebrow" data-pl="subir">{cont.eyebrow}</p>
            <h1 id="pl-h1" className="pl-pedir-h1" data-pl="linea">{cont.title} <em>{sinPuntoFinal(cont.titleAccent)}</em></h1>
            <p className="pl-pedir-lead" data-pl="subir" data-pl-retraso="0.2">{cont.lead}</p>
            <p className="pl-pedir-prom" data-pl="subir" data-pl-retraso="0.3">{cont.promise}</p>
          </div>
          <div className="pl-form" id="pl-form" data-pl="subir" data-pl-retraso="0.2">
            {estado === 'ok' ? (
              <div className="pl-ok" ref={ok} role="status">
                <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--tungsteno)" /><path d="m7 12.5 3.2 3.2L17 8.8" fill="none" stroke="var(--tinta)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <p>{c.contacto.ok}</p>
              </div>
            ) : (
              <form ref={form} onSubmit={alEnviar} noValidate>
                <fieldset className="pl-motivos">
                  <legend className="pl-mono">{c.contacto.motivo}</legend>
                  {(Object.keys(MOTIVOS) as Motivo[]).map((m) => (
                    <label key={m} className="pl-chip">
                      <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => { setMotivo(m); setErrores({}) }} />
                      <span>{c.contacto.motivos[m]}</span>
                    </label>
                  ))}
                </fieldset>
                <div className="pl-campo">
                  <label>
                    <span className="pl-mono">{c.contacto.tienda}</span>
                    <input name="tienda" type="url" inputMode="url" autoComplete="url" placeholder={c.contacto.tiendaEj} aria-invalid={!!errores.tienda} aria-describedby={errores.tienda ? 'pl-e-tienda' : undefined} required={motivo === 'revision'} />
                  </label>
                  {errores.tienda && <em id="pl-e-tienda" role="alert">{errores.tienda}</em>}
                </div>
                <div className="pl-campo">
                  <label>
                    <span className="pl-mono">{c.contacto.correo}</span>
                    <input name="correo" type="email" inputMode="email" autoComplete="email" placeholder={c.contacto.correoEj} aria-invalid={!!errores.correo} aria-describedby={errores.correo ? 'pl-e-correo' : undefined} required />
                  </label>
                  {errores.correo && <em id="pl-e-correo" role="alert">{errores.correo}</em>}
                </div>
                <button type="submit" className="pl-pil pl-pil--tung pl-pil--grande pl-enviar" aria-busy={estado === 'enviando'} disabled={estado === 'enviando'}>
                  <Rod>{estado === 'enviando' ? c.contacto.enviando : c.contacto.enviar[motivo]}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span>
                </button>
                {estado === 'error' && <p className="pl-error" role="alert">{c.contacto.error}</p>}
              </form>
            )}
          </div>
          <div className="pl-veinte">
            <p className="pl-mono pl-kicker" data-pl="subir">{c.contacto.veinte.kicker}</p>
            <h2 className="pl-veinte-t" data-pl="linea">{c.contacto.veinte.titulo}</h2>
            <ol className="pl-veinte-l" data-pl="grupo">
              {c.contacto.veinte.items.map((it, i) => (
                <li key={it.k} className="pl-v-item">
                  <span className="pl-mono pl-v-n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{it.k}</h3>
                  <p>{it.t}</p>
                  {pruebas[i] && (
                    <p className="pl-v-prueba">
                      <b>{pruebas[i]!.valor}</b>
                      <span>{pruebas[i]!.etq}</span>
                      <small className="pl-mono">{pruebas[i]!.fuente}</small>
                    </p>
                  )}
                </li>
              ))}
            </ol>
            <p className="pl-veinte-recibes" data-pl="subir"><span className="pl-mono">{proceso.deliverableLabel}</span> {limpioTexto(proceso.steps[0].deliverable)}</p>
          </div>
        </div>
      </section>

      <section className="pl-proceso" id="pl-proceso" data-tono="claro" aria-labelledby="pl-proc-t">
        <div className="pl-proceso-cab">
          <p className="pl-mono pl-kicker pl-kicker--claro" data-pl="subir">{proceso.eyebrow}</p>
          <h2 id="pl-proc-t" className="pl-h-l" data-pl="linea">{proceso.title} <em>{sinPuntoFinal(proceso.titleAccent)}</em></h2>
          <p className="pl-lista-lead" data-pl="subir" data-pl-retraso="0.15">{limpioTexto(proceso.fix)}</p>
        </div>
        <ol className="pl-proceso-l" data-pl="grupo">
          {proceso.steps.map((p, i) => (
            <li key={p.title} className="pl-paso-c">
              <span className="pl-paso-linea" aria-hidden="true" />
              <span className="pl-mono pl-paso-n">{String(i + 1).padStart(2, '0')} / {String(proceso.steps.length).padStart(2, '0')}</span>
              <h3>{p.title}</h3>
              <p>{limpioTexto(p.body)}</p>
              <p className="pl-paso-r"><span className="pl-mono">{proceso.deliverableLabel}</span> {limpioTexto(p.deliverable)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pl-modelos" data-tono="oscuro" aria-labelledby="pl-mod-t">
        <div className="pl-modelos-cab">
          <h2 id="pl-mod-t" className="pl-h-l pl-h-l--osc" data-pl="linea">{modelos.title} <em>{sinPuntoFinal(modelos.titleAccent)}</em></h2>
          <p className="pl-proc-lead" data-pl="subir" data-pl-retraso="0.1">{invitacion}</p>
        </div>
        <ul className="pl-modelos-l" data-pl="grupo">
          {modelos.models.map((m, i) => (
            <li key={m.title} className="pl-modelo">
              <span className="pl-modelo-linea" aria-hidden="true" />
              <span className="pl-mono pl-modelo-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{m.title}</h3>
              <p>{limpioTexto(m.body)}</p>
              <button type="button" className="pl-pil pl-pil--clara" onClick={() => elegir(MODELO_MOTIVO[i])} aria-controls="pl-form">
                <Rod>{c.contacto.elegir}</Rod><span className="pl-puntos" aria-hidden="true"><i /></span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="pl-canales-s" data-tono="claro" aria-labelledby="pl-can-t">
        <h2 id="pl-can-t" className="pl-h-l" data-pl="linea">{c.contacto.canales}</h2>
        <ul className="pl-canales" data-pl="grupo">
          {canales.map((k) => (
            <li key={k.k}>
              {k.al ? (
                <button type="button" className="pl-canal" onClick={k.al}>
                  <span className="pl-mono pl-canal-k">{k.k}</span><span className="pl-canal-v">{k.v}</span>
                  <span className="pl-mono pl-canal-a">{k.accion}</span>
                </button>
              ) : (
                <a className="pl-canal" href={k.href} target={k.href?.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer" download={k.canal === 'cv' ? true : undefined}
                  onClick={() => evento(ID, 'contact_click', { canal: k.canal ?? '' })}>
                  <span className="pl-mono pl-canal-k">{k.k}</span><span className="pl-canal-v">{k.v}</span>
                  <span className="pl-canal-a"><Flecha /></span>
                </a>
              )}
            </li>
          ))}
        </ul>
        <p className="pl-sr" role="status">{copiado ? c.contacto.copiado : ''}</p>
      </section>

      <section className="pl-faq" data-tono="claro" aria-labelledby="pl-faq-t">
        <h2 id="pl-faq-t" className="pl-h-l" data-pl="linea">{c.contacto.faq}</h2>
        <div className="pl-faq-l" data-pl="subir">
          {faq.map((f) => <Acordeon key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>
    </main>
  )
}
