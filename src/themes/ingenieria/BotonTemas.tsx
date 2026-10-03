import { forwardRef } from 'react'
import { THEMES } from '../../../ab.config'
import { ID_PANEL, useCopySelector } from './selector-copy'

/** El panel va en su propio chunk: se pide al apuntar, enfocar o tocar el disparador, nunca antes (cero coste en la carga). */
export const cargarPanel = () => import('./PanelTemas')

/** Disparador del selector: cuatro casillas (una rellena = la variante elegida), el nombre y el número de variantes. */
export const BotonTemas = forwardRef<HTMLButtonElement, { abierto: boolean; alPulsar: () => void }>(function BotonTemas({ abierto, alPulsar }, ref) {
  const c = useCopySelector()
  return (
    <button
      ref={ref}
      type="button"
      className="ing-tema-btn"
      aria-expanded={abierto}
      aria-controls={ID_PANEL}
      aria-haspopup="dialog"
      onClick={alPulsar}
      onPointerEnter={cargarPanel}
      onFocus={cargarPanel}
      onTouchStart={cargarPanel}
    >
      <svg className="ing-tema-ico" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1" className="ing-tema-ico-on" />
        <rect x="9" y="1" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1" y="9" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <span className="ing-tema-t">{c.boton}</span>
      <span className="ing-tema-n" aria-hidden="true">{String(THEMES.length).padStart(2, '0')}</span>
    </button>
  )
})
