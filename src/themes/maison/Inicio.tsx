import { useState } from 'react'
import { sinPuntoFinal, v5path } from '../data'
import { casoGummy } from './caso'
import { useCopy } from './copy'
import { COLECCIONES, DIPTICO, PASARELA } from './colecciones'
import { escena, gsap, useVista } from './motion'
import { Acordeon, Enlace, ID, Marco, menos, Pantalla, Pieza, Tri, useMq } from './piezas'
import { limpioTexto, sinMeta, usePublico } from './publico'

const sinComa = (s: string) => s.replace(/[,，、]\s*$/, '')
/** «Un diagnóstico escrito: dónde se fuga la tienda…» → título y cuerpo (también con los dos puntos del japonés). */
const partirEntrega = (t: string): [string, string] => { const m = t.match(/^(.+?)[:：]\s*(.+)$/); return m ? [m[1], m[2].replace(/^./u, (x) => x.toUpperCase())] : [t, ''] }

export default function Inicio() {
  const c = useCopy()
  const v = usePublico()
  const { strings: s, personal, obra, cifras, trayectoria } = v
  const ancha = useMq('(min-width: 768px)')
  const [abierto, setAbierto] = useState(-1)
  const diptico = DIPTICO.map(obra).filter((o) => !!o?.views.length)
  const pasarela = PASARELA.map(obra).filter((o) => !!o?.views.length)
  const gummy = obra('the-gummy-box')
  const colecciones = COLECCIONES.map((col) => {
    const piezas = col.slugs.map(obra).filter((o) => !!o?.views.length)
    return { id: col.id, piezas, muestra: piezas[0] }
  }).filter((col) => col.muestra)
  const caso = gummy && casoGummy(v, gummy.link)
  const fb = s.sections.featuredBuild
  const p = s.sections.process
  const y = s.sections.years
  const kit = s.sections.buildKit.tiles
  const cargos = trayectoria.slice(0, 3)
  const [entTit, entCuerpo] = partirEntrega(p.steps[0].deliverable)
  // Lo que queda en tus manos: tres entregas del vivo dichas por su resultado, no por la herramienta.
  const recibes = [{ t: entTit, b: entCuerpo || p.steps[0].body }, { t: kit.editor.title, b: kit.editor.body }, { t: kit.tracking.title, b: kit.tracking.body }]
  const fichaGummy = v5path(ID, 'obra', 'the-gummy-box')

  const ref = useVista<HTMLElement>([], (raiz, limpiar) => {
    // La cabecera cede su marca mientras el rótulo grande está a la vista.
    const app = raiz.closest<HTMLElement>('.mz-raiz')
    const rotulo = raiz.querySelector('.mz-portada .mz-rotulo')
    if (app && rotulo) {
      const io = new IntersectionObserver(([en]) => { app.dataset.sobre = en.isIntersecting ? '1' : '' }, { rootMargin: '-64px 0px 0px 0px' })
      io.observe(rotulo)
      limpiar.push(() => { io.disconnect(); delete app.dataset.sobre })
    }

    // Índice de colecciones: una placa con la fotografía de la colección sigue al cursor (solo con puntero fino; cero fotogramas en reposo).
    const ind = raiz.querySelector<HTMLElement>('.mz-indice')
    const placa = ind?.querySelector<HTMLElement>('.mz-indice-placa')
    const lista = ind?.querySelector<HTMLElement>('.mz-indice-l')
    if (ind && placa && lista && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const marcos = Array.from(placa.querySelectorAll<HTMLElement>('.mz-indice-img'))
      const xTo = gsap.quickTo(placa, 'x', { duration: 0.7, ease: 'maison' })
      const yTo = gsap.quickTo(placa, 'y', { duration: 0.7, ease: 'maison' })
      let dentro = false
      let piso = 0 // la placa nunca tapa el título de la fila que se mira ni los nombres de la derecha: queda entre los dos
      const poner = (e: PointerEvent) => {
        const r = ind.getBoundingClientRect()
        const x = Math.min(Math.max(e.clientX - r.left + 36, piso), piso + 200)
        const y = e.clientY - r.top - placa.offsetHeight / 2
        if (!dentro) { gsap.set(placa, { x, y }); dentro = true } else { xTo(x); yTo(y) }
      }
      const activa = (i: number | null) => { placa.dataset.activa = i === null ? '' : '1'; marcos.forEach((m, k) => { m.dataset.on = String(k === i) }) }
      const filas = Array.from(lista.querySelectorAll<HTMLElement>('.mz-indice-a'))
      const alEntrar = (e: Event) => {
        const fila = e.currentTarget as HTMLElement
        const rg = document.createRange()
        const t = fila.querySelector('.mz-indice-t')
        if (t) rg.selectNodeContents(t)
        piso = rg.getBoundingClientRect().right - ind.getBoundingClientRect().left + 40
        activa(filas.indexOf(fila))
      }
      filas.forEach((f) => f.addEventListener('pointerenter', alEntrar))
      const alSalir = () => { dentro = false; activa(null) }
      lista.addEventListener('pointermove', poner)
      lista.addEventListener('pointerleave', alSalir)
      limpiar.push(() => { filas.forEach((f) => f.removeEventListener('pointerenter', alEntrar)); lista.removeEventListener('pointermove', poner); lista.removeEventListener('pointerleave', alSalir) })
    }

    // La pasarela: en escritorio una escena fijada recorre la fila de piezas con el scroll (momento firma). En móvil es un riel nativo.
    const sec = raiz.querySelector<HTMLElement>('.mz-pasarela')
    const pista = sec?.querySelector<HTMLElement>('.mz-pasarela-pista')
    const cont = sec?.querySelector<HTMLElement>('[data-contador]')
    const linea = sec?.querySelector<HTMLElement>('.mz-pasarela-linea i')
    if (sec && pista) {
      const mq = window.matchMedia('(min-width: 1024px)')
      let suelta: (() => void) | undefined
      let tl: gsap.core.Timeline | undefined
      const total = pista.querySelectorAll('.mz-pasarela-p').length
      const atar = () => {
        suelta?.(); tl?.kill(); suelta = undefined
        sec.style.height = ''
        gsap.set(pista, { clearProps: 'transform' })
        if (!mq.matches) return
        const esc = sec.firstElementChild as HTMLElement
        const recorrido = Math.max(0, pista.scrollWidth - esc.clientWidth)
        sec.style.height = `${esc.offsetHeight + recorrido * 0.9}px`
        tl = gsap.timeline({ onUpdate: () => { if (cont && tl) cont.textContent = String(Math.min(total, 1 + Math.floor(tl.progress() * total * 0.999))).padStart(2, '0') } })
        tl.to(pista, { x: -recorrido, ease: 'none', duration: 1 }, 0)
        if (linea) tl.fromTo(linea, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0)
        suelta = escena(sec, tl, { fijo: true, suave: 0.5 })
      }
      atar()
      mq.addEventListener('change', atar)
      window.addEventListener('resize', atar)
      limpiar.push(() => { mq.removeEventListener('change', atar); window.removeEventListener('resize', atar); suelta?.(); tl?.kill(); sec.style.height = '' })
    }
  })

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="mz-vista">
      <title>{s.meta.title}</title>
      <meta name="robots" content="noindex" />

      <section className="mz-marco mz-portada" aria-labelledby="mz-h1">
        <p className="mz-etq mz-p-etq" data-mz="subir">{s.hero.eyebrow}</p>
        <p className="mz-etq mz-p-disp" data-mz="subir"><span className="mz-punto" aria-hidden="true" />{s.hero.availability}</p>
        <p className="mz-rotulo mz-p-rotulo"><span className="mz-sr">{personal.firstName} </span><span className="mz-rotulo-txt" data-mz="letras">Bustamante</span></p>
        <h1 id="mz-h1" className="mz-display mz-p-h1" data-mz="linea" data-mz-retraso="0.2">{sinPuntoFinal(s.hero.positioning)}</h1>
        <p className="mz-cuerpo mz-p-lead" data-mz="subir" data-mz-retraso="0.3">{s.hero.lead}</p>
        <div className="mz-acciones mz-p-cta" data-mz="subir" data-mz-retraso="0.4">
          <Enlace className="mz-btn" to={`${v5path(ID, 'contacto')}?motivo=revision#agenda`}>{s.hero.ctaPrimary}</Enlace>
          <Enlace className="mz-enlace" to={v5path(ID, 'obra')}>{s.hero.ctaSecondary}<Tri /></Enlace>
        </div>
        <div className="mz-p-foto">
          <h2 className="mz-sr">{c.inicio.dipticoSr}</h2>
          <div className="mz-diptico">
            {diptico.map((o, i) => o && <Pieza key={o.slug} o={o} texto={o.tagline} prioridad={i === 0} clase="mz-pieza-diptico" />)}
          </div>
        </div>
      </section>

      <section className="mz-marco mz-sec mz-cifras" aria-labelledby="mz-cif-t">
        <div className="mz-cab-sec">
          <p className="mz-etq" data-mz="subir">{s.sections.statBand.asOf}</p>
          <h2 id="mz-cif-t" className="mz-titulo-sec" data-mz="linea">{s.sections.statBand.label}</h2>
        </div>
        <ul className="mz-cifras-l" data-mz="grupo">
          {cifras.map((f) => (
            <li key={f.id} className="mz-cifra">
              <i className="mz-filete" aria-hidden="true" />
              <p className="mz-cifra-v">{menos(f.valor)}</p>
              <p className="mz-cifra-e">{f.etiqueta}</p>
              <p className="mz-cifra-f"><span>{s.sections.statBand.sourceLabel}.</span> {f.fuente}</p>
            </li>
          ))}
        </ul>
        <p className="mz-nota-pie">{s.sections.statBand.note}</p>
      </section>

      <section className="mz-pasarela" aria-labelledby="mz-pas-t">
        <div className="mz-pasarela-esc">
          <div className="mz-marco mz-pasarela-cab">
            <div>
              <p className="mz-etq">{c.inicio.obraEtq}</p>
              <h2 id="mz-pas-t" className="mz-titulo-sec">{c.inicio.obraTit}</h2>
            </div>
            <div className="mz-pasarela-ctrl">
              <p className="mz-contador" aria-hidden="true"><b data-contador>01</b> {c.inicio.de} {String(pasarela.length).padStart(2, '0')}</p>
              <Enlace className="mz-enlace" to={v5path(ID, 'obra')}>{c.verObra}<Tri /></Enlace>
            </div>
          </div>
          <div className="mz-pasarela-pista">
            {pasarela.map((o) => o && <Pieza key={o.slug} o={o} texto={o.tagline} clase="mz-pasarela-p" velo={false} />)}
            <Enlace to={v5path(ID, 'obra')} className="mz-pasarela-fin"><span className="mz-display">{c.verObra}</span><Tri /></Enlace>
          </div>
          <div className="mz-marco"><div className="mz-pasarela-linea" aria-hidden="true"><i /></div></div>
        </div>
      </section>

      <section className="mz-marco mz-sec mz-casa" aria-labelledby="mz-casa-t">
        <div className="mz-casa-txt">
          <p className="mz-etq" data-mz="subir">{c.inicio.casaEtq}</p>
          <h2 id="mz-casa-t" className="mz-titulo-sec" data-mz="linea"><span className="mz-bloque">{sinComa(y.title)}</span><em className="mz-bloque">{y.titleAccent}</em></h2>
          <p className="mz-nota">{sinMeta(y.lead)}</p>
          <p className="mz-etq mz-apagado">{s.hero.location}</p>
          <div className="mz-acciones">
            <Enlace className="mz-btn mz-btn-vacio" to={v5path(ID, 'trayectoria')}>{c.verTrayectoria}</Enlace>
            <a className="mz-enlace" href={personal.cv} download>{c.cv}<Tri /></a>
          </div>
        </div>
        <ol className="mz-casa-cargos">
          {cargos.map((t) => (
            <li key={t.id} className="mz-casa-cargo">
              <i className="mz-filete" data-mz="trazo" aria-hidden="true" />
              <p className="mz-etq mz-casa-per">{t.period}</p>
              <div className="mz-casa-quien">
                <h3 className="mz-casa-emp">{t.company}</h3>
                <p className="mz-casa-tit">{t.title}</p>
              </div>
              <p className="mz-cuerpo mz-casa-res">{limpioTexto(t.summary)}</p>
              <ul className="mz-casa-met">
                {t.metrics.map((m) => (
                  <li key={m.label}>
                    <p className="mz-cifra-v mz-cifra-s">{menos(m.value)}</p>
                    <p className="mz-cifra-e">{m.label}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mz-marco mz-sec mz-indice" aria-labelledby="mz-ind-t">
        <div className="mz-cab-sec">
          <p className="mz-etq" data-mz="subir">{c.inicio.coleccionesEtq}</p>
          <h2 id="mz-ind-t" className="mz-titulo-sec" data-mz="linea">{c.inicio.coleccionesTit}</h2>
        </div>
        <ul className="mz-indice-l">
          {colecciones.map((col, i) => (
            <li key={col.id}>
              <i className="mz-filete" data-mz="trazo" aria-hidden="true" />
              <Enlace to={`${v5path(ID, 'obra')}#coleccion-${col.id}`} className="mz-indice-a">
                <span className="mz-indice-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="mz-indice-t">{c.obra.colecciones[col.id]}</span>
                <span className="mz-indice-p">{col.piezas.slice(0, 3).map((o) => o?.name).join(' · ')}</span>
                <Tri />
              </Enlace>
            </li>
          ))}
        </ul>
        <div className="mz-indice-placa" aria-hidden="true">
          {colecciones.map((col) => col.muestra && <Marco key={col.id} o={col.muestra} velo={false} clase="mz-indice-img" />)}
        </div>
      </section>

      {caso && gummy && (
        <section className="mz-marco mz-sec mz-caso" aria-labelledby="mz-caso-t">
          <div className="mz-caso-foto">
            {ancha ? (
              <Enlace to={fichaGummy} className="mz-caso-d" aria-label={gummy.name}>
                <Pantalla slug={gummy.slug} vista="home" vp="desktop" alt={`${gummy.name} · ${c.ficha.home}, ${c.ficha.escritorio}`} />
              </Enlace>
            ) : (
              <Enlace to={fichaGummy} className="mz-caso-m" aria-label={gummy.name}>
                <Pantalla slug={gummy.slug} vista="home" vp="mobile" alt={`${gummy.name} · ${c.ficha.home}, ${c.ficha.movil}`} />
                <Pantalla slug={gummy.slug} vista="pdp" vp="mobile" alt={`${gummy.name} · ${c.ficha.pdp}, ${c.ficha.movil}`} />
              </Enlace>
            )}
          </div>
          <div className="mz-caso-txt">
            <p className="mz-etq" data-mz="subir">{c.inicio.casoEtq}</p>
            <h2 id="mz-caso-t" className="mz-titulo-sec" data-mz="linea"><span className="mz-bloque">{sinComa(fb.title)}</span><em className="mz-bloque">{fb.titleAccent}</em></h2>
            <div className="mz-caso-par">
              {[caso[0], caso[1]].map((b) => b && (
                <div key={b.label}>
                  <p className="mz-etq">{b.label}</p>
                  <p className="mz-cuerpo">{b.body}</p>
                </div>
              ))}
            </div>
            <Enlace className="mz-enlace" to={fichaGummy}>{c.verFicha}<Tri /></Enlace>
          </div>
        </section>
      )}

      <section className="mz-marco mz-sec mz-recibes-sec" aria-labelledby="mz-rec-t">
        <div className="mz-cab-sec">
          <p className="mz-etq" data-mz="subir">{c.inicio.recibesEtq}</p>
          <h2 id="mz-rec-t" className="mz-titulo-sec" data-mz="linea">{c.inicio.recibesTit}</h2>
        </div>
        <ol className="mz-recibes-l">
          {recibes.map((r, i) => (
            <li key={r.t} className="mz-recibe">
              <i className="mz-filete" data-mz="trazo" aria-hidden="true" />
              <span className="mz-recibe-n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mz-recibe-t">{r.t}</h3>
              <p className="mz-cuerpo">{r.b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mz-marco mz-sec mz-proceso" aria-labelledby="mz-proc-t">
        <div className="mz-proceso-cab">
          <p className="mz-etq" data-mz="subir">{p.eyebrow}</p>
          <h2 id="mz-proc-t" className="mz-titulo-sec" data-mz="linea"><span className="mz-bloque">{sinComa(p.title)}</span><em className="mz-bloque">{p.titleAccent}</em></h2>
          <div className="mz-proceso-nota">
            <p className="mz-cuerpo"><b>{p.problemLabel}</b> {p.problem}</p>
            <p className="mz-cuerpo"><b>{p.fixLabel}</b> {p.fix}</p>
          </div>
        </div>
        <div className="mz-proceso-lista">
          {p.steps.map((st, i) => (
            <Acordeon key={st.title} abierto={abierto === i} alternar={() => setAbierto(abierto === i ? -1 : i)}
              cabeza={<><span className="mz-acc-n">{String(i + 1).padStart(2, '0')}</span><span className="mz-acc-t">{st.title}</span></>}>
              <p className="mz-nota">{st.body}</p>
              <p className="mz-recibes"><span className="mz-etq">{p.deliverableLabel}</span> {st.deliverable}</p>
            </Acordeon>
          ))}
        </div>
      </section>

      <section className="mz-marco mz-cierre" aria-labelledby="mz-cierre-t">
        <h2 id="mz-cierre-t" className="mz-titulo" data-mz="linea"><span className="mz-bloque">{s.sections.contact.title}</span><em className="mz-bloque">{sinPuntoFinal(s.sections.contact.titleAccent)}</em></h2>
        <div className="mz-acciones">
          <Enlace className="mz-btn" to={`${v5path(ID, 'contacto')}?motivo=revision#agenda`}>{s.sections.contact.cta}</Enlace>
          <Enlace className="mz-enlace" to={v5path(ID, 'trayectoria')}>{c.verTrayectoria}<Tri /></Enlace>
        </div>
      </section>
    </main>
  )
}
