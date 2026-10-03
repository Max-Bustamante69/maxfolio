import { useRef } from 'react'
import { sinPuntoFinal, v5path } from '../data'
import { evento } from '../shared/contacto'
import { PalabrasContacto } from './Contacto'
import { useCopy } from './copy'
import { useLibro } from './datos'
import { Libro } from './Libro'
import { useEntrada } from './movimiento'
import { Cabeza, Flecha, Linea } from './piezas'
import { Enlace } from './transicion'

/** La fila que nace abierta, como en la maqueta aprobada (la 3.ª del libro): su tinta cae al terminar de imprimirse la entrada y
 *  enseña, sin que nadie toque nada, que cada fila se abre. Nace abierta (no se abre después) para no mover el layout ni sumar CLS. */
const FILA_DE_FIRMA = 'en-amor-a-dos'

/** Home: el nombre a dos líneas, la oferta y, ya dentro del primer pliegue, las primeras filas del libro. Sin imagen de portada. */
export default function Inicio() {
  const c = useCopy()
  const { personal, strings, tiendas, storeCount } = useLibro()
  const raiz = useRef<HTMLElement>(null)
  useEntrada(raiz)
  const h = strings.hero
  // «20+ tiendas, una suite de apps…» → «20+ tiendas construidas» en negrita y el resto de la primera frase del registro.
  const resto = h.lead.split(/(?<=[.。])\s*/)[0].replace(/^[^,、]*[,、]\s*/, '')
  return (
    <main id="contenido" tabIndex={-1} ref={raiz}>
      <Cabeza titulo={`${personal.name} · ${sinPuntoFinal(strings.footer.tagline)}`} />
      <div className="a-pag">
        <div className="a-nombre-zona">
          <h1 className="a-nombre"><Linea>{personal.firstName}</Linea>{' '}<Linea>{personal.lastName}</Linea></h1>
          <p className="a-nota" data-a="entra"><b>{c.libro.construidas(storeCount)}</b>, {resto}</p>
        </div>
        <section className="a-intro" aria-label={c.oferta}>
          <p className="a-eyebrow a-sec" data-a="entra">{h.eyebrow}</p>
          <p className="a-lema" data-a="entra">{h.positioning}</p>
          <div className="a-intro-acc" data-a="entra">
            <Enlace className="a-boton" to={`${v5path('a', 'contacto')}?motivo=revision`}>{c.hero.cta}<Flecha tipo="derecha" /></Enlace>
            <a className="a-enlace" href={personal.cv} target="_blank" rel="noopener noreferrer" onClick={() => evento('a', 'contact_click', { canal: 'cv' })}>{h.ctaCv}<Flecha tipo="abajo" /></a>
          </div>
          <p className="a-intro-nota" data-a="entra"><b>{c.hero.gratis}</b> {h.ctaNote}</p>
        </section>
        <Libro obras={tiendas} agrupar abiertaInicial={FILA_DE_FIRMA} titulo={`${c.libro.titulo} · ${c.libro.construidas(storeCount)}`} />
        <p className="a-mas" data-a-flip data-a="entra"><Enlace className="a-enlace" to={v5path('a', 'obra')}>{c.libro.verTodo}<Flecha tipo="derecha" /></Enlace></p>
        <div data-a-flip><PalabrasContacto /></div>
      </div>
    </main>
  )
}
