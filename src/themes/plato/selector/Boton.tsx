import { forwardRef } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { Rod } from '../piezas'
import { textosTemas } from './textos'
import './boton.css'

/** La claqueta del disparador: el brazo se levanta al apuntar y vuelve de golpe (CSS; nada se mueve en reposo). */
const Claqueta = () => (
  <svg className="pl-clap" viewBox="0 0 22 22" width="20" height="20" aria-hidden="true" focusable="false">
    <path className="pl-clap-cuerpo" d="M3.5 9.6h15v8.4a1.6 1.6 0 0 1-1.6 1.6H5.1a1.6 1.6 0 0 1-1.6-1.6z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path className="pl-clap-cuerpo" d="M3.5 13.4h15" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <g className="pl-clap-brazo">
      <path d="M3.2 4.5 18.9 2.4l.7 3.7-15.7 2.1z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7.2 8 8.6 4.2M11.4 7.5l1.4-3.8M15.6 6.9 17 3.1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  </svg>
)

/** Disparador del selector de temas, dentro de la cabecera. Bajo 1300 px es un botón redondo; el nombre accesible es siempre el mismo. */
export const TemasBoton = forwardRef<HTMLButtonElement, { abierto: boolean; onClick: () => void; /** Al apuntar o enfocar: el momento de pedir el trozo del panel. */ alApuntar?: () => void }>(function TemasBoton({ abierto, onClick, alApuntar }, ref) {
  const { locale } = useLanguage()
  const t = textosTemas(locale)
  return (
    <button ref={ref} type="button" className="pl-temas" aria-expanded={abierto} aria-controls="pl-temas" aria-haspopup="dialog" title={t.boton} onClick={onClick} onPointerEnter={alApuntar} onFocus={alApuntar}>
      <Claqueta />
      <span className="pl-temas-t"><Rod>{t.boton}</Rod></span>
    </button>
  )
})
