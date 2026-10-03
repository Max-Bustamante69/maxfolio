import { useLanguage } from '../../context/LanguageContext'
import { useCopy } from './copy'
import { gsap } from './motion'

// Las figuras que dibujan un dato. Son HTML + CSS (no SVG con viewBox): el texto de una figura nunca escala con el ancho y a 390 px
// sigue siendo de 12 px reales. Cada figura nace ya dibujada (fail-open); un dibujo con tiempo (no con el scroll) la completa al
// llegar a la pantalla. Nada aquí inventa un dato: la mancuerna es la cifra del CV (~70 → 95+) y las barras son la medición local de
// Lighthouse de cada tienda con su fecha.

/** Fig. 2 · mancuerna de Lighthouse sobre un eje de 0 a 100 con el umbral de «bueno». */
export function Mancuerna() {
  const c = useCopy().cifras.lighthouse
  return (
    <div className="rp-f1">
      <div className="rp-f1-pista">
        <i className="rp-f1-base" />
        {[0, 25, 50, 75, 100].map((t) => <span key={t} className="rp-f1-tick" style={{ left: `${t}%` }}>{t}</span>)}
        <span className="rp-f1-umbral" data-f="umbral" style={{ left: '90%' }}><em>{c.umbral}</em></span>
        <i className="rp-f1-hilo" data-f="hilo" style={{ left: '70%', width: '25%' }} />
        <span className="rp-punto rp-punto-antes" data-f="p1" style={{ left: '70%' }}><b>~70</b><em className="rp-mono">{c.antes}</em></span>
        <span className="rp-punto rp-punto-despues" data-f="p2" style={{ left: '95%' }}><b>95+</b><em className="rp-mono">{c.despues}</em></span>
      </div>
    </div>
  )
}

/**
 * La línea de tiempo que dibuja la mancuerna dentro de `el` (el estado inicial se escribe al crearla; el final es el diseño en reposo).
 * Corre con tiempo propio, no atada al scroll: así la figura queda completa en cuanto se ve, sin importar dónde se detenga el lector.
 */
export function dibujarMancuerna(el: HTMLElement) {
  const q = (s: string) => el.querySelectorAll(`[data-f="${s}"]`)
  const punto = { opacity: 0, scale: 0.4 }
  return gsap.timeline({ paused: true })
    .fromTo(q('umbral'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'rep' })
    .fromTo(q('p1'), punto, { opacity: 1, scale: 1, duration: 0.55, ease: 'rep' }, 0.1)
    .fromTo(q('hilo'), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'rep' }, 0.5)
    .fromTo(q('p2'), punto, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)' }, 1.1)
}

interface Escritorio { perf: number; a11y: number; seo: number; lcp: number | null }

/**
 * Fig. de la ficha · la medición de Lighthouse de escritorio de la tienda (como el vivo): un tablero de cuatro lecturas, tres puntajes
 * con su barra de 0 a 100 y el LCP en segundos. El ancho de la barra es el dato y su dibujo al llegar es solo transform. La medición de
 * móvil, con su fecha, va en «Fuentes y método».
 */
export function Medido({ d }: { d: Escritorio }) {
  const c = useCopy().ficha
  const { locale } = useLanguage()
  const filas: Array<[string, 'perf' | 'a11y' | 'seo']> = [[c.rend, 'perf'], [c.acc, 'a11y'], [c.seo, 'seo']]
  const segundos = d.lcp == null ? null : new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(d.lcp)
  return (
    <div className="rp-m" data-rp="barras">
      {filas.map(([etq, k]) => (
        <div key={k} className="rp-m-c">
          <p className="rp-m-n">{d[k]}</p>
          <div className="rp-m-pista" aria-hidden="true"><i className="rp-m-lleno" style={{ width: `${d[k]}%` }}><i data-barra /></i></div>
          <p className="rp-m-e">{etq}</p>
        </div>
      ))}
      {segundos && (
        <div className="rp-m-c">
          <p className="rp-m-n">{segundos}<small>s</small></p>
          <div className="rp-m-pista" aria-hidden="true" />
          <p className="rp-m-e">{c.lcp}</p>
        </div>
      )}
    </div>
  )
}
