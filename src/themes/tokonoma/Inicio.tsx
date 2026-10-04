import { useLayoutEffect, useRef } from 'react'
import { sinPuntoFinal, type Obra } from '../data'
import { evento } from '../shared/contacto'
import { useMedellinTime } from '../shared/useMedellinTime'
import { useCopy } from './copy'
import { escalaDe, figurasDe, GRANDES, limpio, MEDIAS, periodoDe, unidad, usePublico, type Fig } from './limpio'
import { useVista } from './motion'
import { Cifra, Cifras, Enlace, EnlaceObra, Foto, ID, Mascara, Nicho, Pares, Sello, Tarjeta, ruta } from './piezas'

/** El tríptico del pliegue (sanpukutsui): tres tiendas colgadas; la del centro, la principal, cuelga más larga. */
const ROLLOS = ['the-gummy-box', 'nos-cafe', 'nalua']

/** «Tu tienda tiene tráfico. Yo encuentro…» → [primera frase, resto]. */
const partir = (s: string): [string, string] => {
  const m = s.match(/^(.+?[.。!?！？])\s*(.*)$/s)
  return m ? [m[1], m[2]] : [s, '']
}

/** Tres kakejiku con la captura móvil real: varilla arriba, papel de montura, varilla abajo. Al cargar se desenrollan, el del centro primero. */
function Rollos() {
  const c = useCopy()
  const { obra } = usePublico()
  const ref = useRef<HTMLDivElement>(null)
  const lista = ROLLOS.map(obra).filter((o): o is Obra => !!o)
  // En el teléfono los rollos corren en una fila deslizable; arranca centrada en el del medio.
  useLayoutEffect(() => {
    const el = ref.current
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
  }, [])
  const retraso = [0.42, 0.22, 0.6]
  return (
    <div className="tk-rollos-caja">
      <div className="tk-rollos" ref={ref} role="group" aria-label={c.inicio.rollos}>
        {lista.map((o, i) => (
          <figure key={o.slug} className="tk-rollo" data-pos={i}>
            <Enlace to={ruta('obra', o.slug)} className="tk-rollo-a" aria-label={`${o.name} · ${o.industry ?? ''}`}>
              <span className="tk-rollo-pieza" data-tk="rollo" data-tk-r={retraso[i]}>
                <i className="tk-varilla tk-varilla-s" aria-hidden="true" />
                <span className="tk-rollo-papel"><Foto slug={o.slug} vista="home" solo="mobile" alt="" prioridad /></span>
                <i className="tk-varilla tk-varilla-i" aria-hidden="true" />
              </span>
            </Enlace>
            <figcaption className="tk-rotulo" data-tk="sube" data-tk-r={retraso[i] + 0.9}>{o.name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

/** Una sala grande: la captura desnuda a todo el ancho de la página y, debajo, la cartela en tres columnas —quién es, lo que mide, sus datos—. */
function SalaGrande({ o, n, figuras }: { o: Obra; n: number; figuras: Fig[] }) {
  const c = useCopy()
  const { locale } = usePublico()
  // Las cifras de catálogo son de la tienda y de un día: la sala lo dice con su fecha.
  const esc = figuras.some((f) => !f.hecho) ? escalaDe(o, c.escala, locale) : null
  const pares = [
    [c.ficha.sector, o.industry],
    [c.ficha.rol, o.rolLabel],
    [c.ficha.periodo, o.period && periodoDe(o.period, locale)],
    [c.ficha.pila, o.stack.slice(0, 3).join(' · ')],
  ].filter((p): p is [string, string] => !!p[1])
  return (
    <article className="tk-sala" aria-labelledby={`sala-${o.slug}`}>
      <div className="tk-fr">
        <p className="tk-sala-cab tk-rotulo">
          <span data-tk="sube" data-tk-y="10">{c.no} {String(n).padStart(2, '0')} · {o.year}</span>
          <i className="tk-linea" data-tk="filete" data-tk-r="0.1" aria-hidden="true" />
        </p>
        <EnlaceObra o={o} className="tk-pieza" tabIndex={-1} aria-hidden="true">
          <Nicho slug={o.slug} vista={o.views[0]} alt="" vuelo />
        </EnlaceObra>
        <div className="tk-12 tk-sala-pie">
          <div className="tk-sala-id" data-tk="grupo">
            <h3 id={`sala-${o.slug}`} className="tk-nombre tk-nombre-g">{o.name}</h3>
            <p className="tk-lema">{o.tagline}</p>
          </div>
          {figuras.length > 0 && (
            <div className="tk-sala-figs">
              <Cifras figuras={figuras} />
              {esc && <p className="tk-fig-n" data-tk="sube" data-tk-y="10" data-tk-r="0.4">{c.escala.fuente.replace('{fecha}', esc.fecha)}</p>}
            </div>
          )}
          <div className="tk-sala-datos" data-tk="grupo">
            <Pares items={pares} />
            <EnlaceObra o={o} className="tk-ver">{c.verObra}</EnlaceObra>
          </div>
        </div>
      </div>
    </article>
  )
}

/** Quién: el trabajo en seis cifras con su fuente, la voz de Max en primera persona (el resumen de su cargo actual, del vivo) y el «ahora». */
function Quien() {
  const c = useCopy()
  const { strings: s, trayectoria, cifras, locale } = usePublico()
  const hora = useMedellinTime(locale === 'ja' ? 'ja-JP' : locale === 'es' ? 'es-CO' : 'en-US')
  const actual = trayectoria[0]
  const banda = s.sections.statBand
  return (
    <section className="tk-quien tk-fr" aria-labelledby="tk-quien-t">
      <div className="tk-12 tk-quien-cab">
        <div className="tk-quien-id">
          <p className="tk-rotulo" data-tk="sube" data-tk-y="10">{c.inicio.quien} · {banda.asOf}</p>
          <h2 id="tk-quien-t" className="tk-h2 tk-h2-grande" data-tk="titulo">{banda.label}</h2>
          <p className="tk-nota" data-tk="sube" data-tk-y="12" data-tk-r="0.1">{banda.note}</p>
        </div>
        <p className="tk-abre tk-quien-voz" data-tk="sube" data-tk-r="0.1">{limpio(actual.summary)}</p>
        <div className="tk-ahora" data-tk="grupo" data-tk-r="0.15">
          <p className="tk-rotulo"><i className="tk-punto" aria-hidden="true" />{c.inicio.ahora}</p>
          <p className="tk-ahora-t">{s.hero.availability}</p>
          <p className="tk-nota">{s.hero.location} · {c.pie.medellin} <time>{hora}</time></p>
        </div>
      </div>
      <ol className="tk-cifras-l">
        {cifras.map((f, i) => (
          <li key={f.id}>
            <p className="tk-cifra"><Mascara r={i * 0.07}><Cifra valor={unidad(f.valor, locale)} /></Mascara></p>
            <p className="tk-cifra-e" data-tk="sube" data-tk-y="10" data-tk-r={0.1 + i * 0.07}>{f.etiqueta}</p>
            <p className="tk-cifra-f" data-tk="sube" data-tk-y="10" data-tk-r={0.15 + i * 0.07}>{banda.sourceLabel} · {f.fuente}</p>
          </li>
        ))}
      </ol>
      <p className="tk-quien-pie"><Enlace to={ruta('trayectoria')} className="tk-ver">{c.inicio.verTrayectoria}</Enlace></p>
    </section>
  )
}

export default function Inicio() {
  const c = useCopy()
  const v = usePublico()
  const { strings: s, personal, obra, locale } = v
  const ref = useVista<HTMLElement>([locale])
  const [uno, dos] = partir(s.hero.positioning)
  const conCaptura = (slug: string) => { const o = obra(slug); return o && o.views.length > 0 ? o : null }
  const grandes = GRANDES.map(conCaptura).filter((o): o is Obra => !!o)
  const medias = MEDIAS.map(conCaptura).filter((o): o is Obra => !!o)
  // Las cifras de cada obra se deciden aquí, de una vez y en orden, para que un mismo hecho no salga dos veces en la página.
  const usadas = new Set<string>()
  const figGrandes = grandes.map((o) => figurasDe(o, c.escala, locale, usadas))
  const figMedias = medias.map((o) => figurasDe(o, c.escala, locale, usadas, 2))
  const proc = s.sections.process
  const kit = s.sections.buildKit
  const cierre = s.sections.contact

  return (
    <main id="contenido" tabIndex={-1} ref={ref} className="tk-vista">
      <title>{`${personal.name} · ${s.hero.eyebrow}`}</title>
      <meta name="robots" content="noindex" />

      <section className="tk-portada tk-fr tk-12" aria-labelledby="tk-h1">
        <div className="tk-portada-txt">
          <p className="tk-rotulo" data-tk="sube">{s.hero.eyebrow}</p>
          <h1 id="tk-h1" className="tk-titular" data-tk="barrido">
            <span data-b className="tk-b">{uno}</span>
            {dos && <> <span data-b className="tk-b tk-b2">{sinPuntoFinal(dos)}</span></>}
          </h1>
        </div>
        <Rollos />
        <div className="tk-portada-pie" data-tk="grupo" data-tk-r="0.1">
          <p className="tk-sub">{limpio(s.hero.lead)}</p>
          <p className="tk-acciones">
            <Enlace to={`${ruta('contacto')}#agenda`} className="tk-boton" onClick={() => evento(ID, 'contact_click', { canal: 'hero' })}>{s.hero.ctaPrimary}</Enlace>
            <Enlace to={ruta('obra')} className="tk-enlace">{s.hero.ctaSecondary}</Enlace>
          </p>
          <p className="tk-nota">{s.hero.ctaNote}</p>
        </div>
      </section>

      <section className="tk-salas" aria-labelledby="tk-salas-t">
        <div className="tk-fr tk-salas-cab">
          <div className="tk-salas-t">
            <p className="tk-rotulo" data-tk="sube" data-tk-y="10">{c.inicio.obraDestacada}</p>
            <h2 id="tk-salas-t" className="tk-h2 tk-h2-grande" data-tk="titulo">{c.inicio.obraT}</h2>
          </div>
        </div>
        {grandes.map((o, i) => <SalaGrande key={o.slug} o={o} n={i + 1} figuras={figGrandes[i]} />)}
        {medias.length > 0 && (
          <div className="tk-fr tk-medias-caja">
            <h3 className="tk-rotulo tk-sec-t" data-tk="sube" data-tk-y="10">{c.inicio.otras}</h3>
            <ul className="tk-rejilla tk-medias">
              {medias.map((o, i) => <Tarjeta key={o.slug} o={o} figuras={figMedias[i]} />)}
            </ul>
          </div>
        )}
        <p className="tk-fr tk-todas">
          <Enlace to={ruta('obra')} className="tk-ver">{c.inicio.verToda}</Enlace>
        </p>
      </section>

      <Quien />

      <section className="tk-proceso tk-fr" aria-labelledby="tk-proc-t">
        <div className="tk-12 tk-proceso-cab">
          <div className="tk-proceso-t">
            <p className="tk-rotulo" data-tk="sube" data-tk-y="10">{proc.eyebrow}</p>
            <h2 id="tk-proc-t" className="tk-h2" data-tk="titulo">{sinPuntoFinal(proc.title)} <span className="tk-tenue">{proc.titleAccent}</span></h2>
          </div>
          <div className="tk-proceso-txt" data-tk="grupo" data-tk-r="0.1">
            <p><span className="tk-rotulo">{sinPuntoFinal(proc.problemLabel)}</span>{proc.problem}</p>
            <p><span className="tk-rotulo">{sinPuntoFinal(proc.fixLabel)}</span>{proc.fix}</p>
          </div>
        </div>
        <ol className="tk-pasos" data-tk="grupo">
          {proc.steps.map((p, i) => (
            <li key={p.title} className="tk-paso">
              <p className="tk-paso-n">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="tk-paso-t">{p.title}</h3>
              <p className="tk-paso-c">{p.body}</p>
              <p className="tk-paso-r"><span>{proc.deliverableLabel}</span> {p.deliverable}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="tk-kit tk-fr" aria-labelledby="tk-kit-t">
        <div className="tk-12 tk-kit-cab">
          <p className="tk-rotulo" data-tk="sube" data-tk-y="10">{kit.eyebrow}</p>
          <h2 id="tk-kit-t" className="tk-h2" data-tk="titulo">{kit.title} <span className="tk-tenue">{kit.titleAccent}</span></h2>
        </div>
        <ol className="tk-kit-l" data-tk="grupo">
          {[kit.tiles.repo, kit.tiles.checks, kit.tiles.editor, kit.tiles.tracking].map((t, i) => (
            <li key={t.title}>
              <p className="tk-rotulo">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="tk-kit-t">{t.title}</h3>
              <p className="tk-kit-c">{t.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="tk-cierre tk-fr tk-12" aria-labelledby="tk-cierre-t">
        <h2 id="tk-cierre-t" className="tk-h2 tk-h2-grande" data-tk="titulo">{cierre.title} <span className="tk-tenue">{sinPuntoFinal(cierre.titleAccent)}</span></h2>
        <div className="tk-cierre-pie" data-tk="grupo">
          <p className="tk-sub">{cierre.promise}</p>
          <p className="tk-acciones">
            <Enlace to={`${ruta('contacto')}#agenda`} className="tk-boton" onClick={() => evento(ID, 'contact_click', { canal: 'cierre' })}>{cierre.cta}</Enlace>
            <Enlace to={ruta('contacto')} className="tk-enlace">{c.inicio.cierreSub}</Enlace>
          </p>
        </div>
        <div className="tk-cierre-sello"><Sello tam={104} tk="sello" /></div>
      </section>
    </main>
  )
}
