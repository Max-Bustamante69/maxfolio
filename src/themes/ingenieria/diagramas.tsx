import type { ReactNode } from 'react'
import { ShotImg } from '../shared/ShotImg'
import { useCopy } from './copy'

// Las figuras de «Cómo trabajo»: FIG 0.1 anota una página real (clara) y FIG 0.2, la suite de apps, vive en la ficha de Digitdeck Apps (noche). Lenguaje común (medido en el diagrama de integraciones de Stripe y en las
// figuras de Linear): lienzo de noche con rejilla de puntos, nodos de filete fino y un pie «FIG 0.x». Todo lo que lleva data-p entra
// en secuencia (ver `figura` en motion.ts): los nodos suben, los conectores se dibujan con clip-path y las islas se encienden.
// En móvil el dibujo se rehace en vertical (los conectores giran), no se encoge.

function FilaFigura({ id, etq, titulo, acento, texto, hecho, pie, repetir, children }: { id: string; etq: string; titulo: string; acento: string; texto: string; hecho?: { t: string; f: string }; pie: string; repetir: string; children: ReactNode }) {
  return (
    <article className="ing-fig" aria-labelledby={id}>
      <div className="ing-fig-txt">
        <p className="ing-etq ing-etq-noche" data-ing="subir">{etq}</p>
        <h3 id={id} className="ing-h3" data-ing="linea"><span>{titulo}</span> <em>{acento}</em></h3>
        <p className="ing-fig-p" data-ing="subir" data-ing-retraso="0.1">{texto}</p>
        {hecho && (
          <p className="ing-fig-hecho" data-ing="subir" data-ing-retraso="0.2">
            <span>{hecho.t}</span>
            <span className="ing-fuente">{hecho.f}</span>
          </p>
        )}
      </div>
      <figure className="ing-fig-lienzo" data-ing="figura">
        <div className="ing-fig-cuadro">{children}</div>
        <figcaption className="ing-fig-pie">
          <span>{pie}</span>
          <button type="button" className="ing-replay" data-repetir>{repetir}</button>
        </figcaption>
      </figure>
    </article>
  )
}

/**
 * FIG 0.1 · La página real del armador de NOS Café con tres zonas marcadas: qué es Liquid (se edita en el tema) y qué es una isla
 * React (lo que se mueve). La figura es el producto con su captura, no una maqueta de cajas; las zonas se encienden en secuencia
 * (solo opacidad) y «Repetir» las vuelve a jugar.
 */
export function FigPagina({ url, alt }: { url: string; alt: string }) {
  const c = useCopy()
  const s = c.sistema
  const f = s.fig1
  return (
    <div className="ing-pagina" data-ing="figura">
      <div className="ing-pagina-txt">
        <p className="ing-etq" data-ing="subir">{s.etq}</p>
        <h2 id="ing-sis-t" className="ing-h2" data-ing="linea"><span>{s.titulo}</span> <em>{s.acento}</em></h2>
        <p className="ing-pagina-p" data-ing="subir" data-ing-retraso="0.12">{s.texto}</p>
      </div>
      <figure className="ing-pagina-cuadro">
        <div className="ing-ventana">
          <div className="ing-ventana-barra" aria-hidden="true">
            <i /><i /><i />
            <span className="ing-ventana-url">{url}</span>
          </div>
          <div className="ing-ventana-pantalla">
            <ShotImg slug="digitdeck-apps" vista="home" vp="desktop" alt={alt} className="ing-cap is-on" />
            <i className="ing-zona ing-zona-liq ing-zona-1" aria-hidden="true" data-p={0.3} data-luz><b>1</b></i>
            <i className="ing-zona ing-zona-liq ing-zona-2" aria-hidden="true" data-p={1.1} data-luz><b>2</b></i>
            <i className="ing-zona ing-zona-isla ing-zona-3" aria-hidden="true" data-p={2} data-luz><b>3</b></i>
          </div>
        </div>
        <figcaption className="ing-pagina-fin">
          <span className="ing-fuente">{f.etq.split(' · ')[0]} · {f.pie}</span>
          <button type="button" className="ing-replay ing-replay-claro" data-repetir>{c.repetir}</button>
        </figcaption>
      </figure>
      <ol className="ing-pagina-ley">
        {f.leyenda.map((l, i) => (
          <li key={l.n} data-p={0.6 + i * 0.8}>
            <b className={l.isla ? 'is-isla' : ''} aria-hidden="true">{l.n}</b>
            <span><strong>{l.t}</strong><em>{l.d}</em></span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** FIG 0.2 · Cinco módulos → un hub multi-tenant → las superficies de Shopify. */
export function Fig2() {
  const c = useCopy()
  const f = c.sistema.fig2
  return (
    <FilaFigura id="ing-f2" etq={f.etq} titulo={f.titulo} acento={f.acento} texto={f.texto} pie={f.etq.split(' · ')[0]} repetir={c.repetir}>
      <div className="ing-f2">
        <div className="ing-f2-col">
          <p className="ing-nodo-d ing-f2-etq" data-p={0}>{f.modulosEtq}</p>
          <ul className="ing-f2-lista">
            {f.modulos.map((m, i) => (
              <li key={m} className="ing-f2-fila">
                <span className="ing-nodo" data-p={0.4 + i * 0.4}><span className="ing-nodo-n">{m}</span></span>
                <span className="ing-con ing-f2-c" aria-hidden="true" data-trazo data-p={1.4 + i * 0.3} />
              </li>
            ))}
          </ul>
        </div>
        <span className="ing-con ing-con-v" aria-hidden="true" data-trazo data-p={2.4} />
        <div className="ing-hub is-activo" data-p={3}>
          <p className="ing-nodo-d">{f.hub.d}</p>
          <p className="ing-hub-n">{f.hub.n}</p>
          <p className="ing-nodo-d ing-hub-pila">{f.hub.pila}</p>
        </div>
        <span className="ing-con ing-con-v" aria-hidden="true" data-trazo data-p={3.6} />
        <div className="ing-f2-col">
          <p className="ing-nodo-d ing-f2-etq" data-p={3.4}>{f.superficiesEtq}</p>
          <ul className="ing-f2-lista ing-f2-der">
            {f.superficies.map((s, i) => (
              <li key={s.n} className="ing-f2-fila">
                <span className="ing-con ing-f2-c" aria-hidden="true" data-trazo data-p={3.8 + i * 0.4} />
                <span className="ing-nodo" data-p={4.3 + i * 0.4}>
                  <span className="ing-nodo-n">{s.n}</span>
                  <span className="ing-nodo-d">{s.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FilaFigura>
  )
}
