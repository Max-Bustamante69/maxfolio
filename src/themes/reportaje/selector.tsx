import { useEffect, useRef, useState, type ComponentType } from 'react'
import { useLocation } from 'react-router-dom'
import { useCopy } from './copy'
import './ediciones.css'

// Selector de temas de El Reportaje: «Otras ediciones». Aquí vive SOLO el disparador de la barra de capítulos (un glifo y una
// palabra). El quiosco —las ocho portadas, sus imágenes y su coreografía— es un chunk aparte que se pide al acercar el
// puntero, enfocar o pulsar: nada de imágenes ni de código del panel antes de abrirlo.

type Props = { origen: HTMLButtonElement; alSalir: () => void; alFin: () => void }
let Panel: ComponentType<Props> | null = null
let pidiendo: Promise<unknown> | null = null
const cargar = () => (pidiendo ??= import('./Quiosco').then((m) => { Panel = m.default }, () => { pidiendo = null }))

/** Dos portadas apiladas: la de atrás asoma por abajo-izquierda y se abre un poco al acercarse. */
const Pila = () => (
  <svg className="rp-ed-pila" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path className="rp-ed-pila-atras" d="M4.5 7.5v13.5h12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    <rect x="8.5" y="3" width="12.5" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M11.5 7h6.5" stroke="currentColor" strokeWidth="2.2" />
    <path d="M11.5 10.5h6.5M11.5 13.5h3.5" stroke="currentColor" strokeWidth="1" />
  </svg>
)

type Estado = 'cerrado' | 'abierto' | 'cerrando'

export function Ediciones({ antes }: { antes?: () => void }) {
  const c = useCopy().ediciones
  const { pathname } = useLocation()
  const [estado, setEstado] = useState<Estado>('cerrado')
  const boton = useRef<HTMLButtonElement>(null)

  // Atrás/Adelante del navegador con el quiosco abierto: la vista cambió debajo, se cierra sin ceremonia.
  useEffect(() => { setEstado('cerrado') }, [pathname])

  const abrir = () => {
    if (estado !== 'cerrado') return
    const montar = () => { antes?.(); setEstado('abierto') }
    if (Panel) montar()
    else cargar().then(() => { if (Panel) montar() })
  }

  return (
    <>
      <button
        ref={boton}
        type="button"
        className="rp-ed-b"
        aria-expanded={estado === 'abierto'}
        aria-controls="rp-ediciones"
        aria-haspopup="dialog"
        aria-label={c.etiqueta}
        onClick={abrir}
        onPointerEnter={cargar}
        onFocus={cargar}
      >
        <Pila />
        <span className="rp-mono rp-ed-b-txt">{c.boton}</span>
      </button>
      {Panel && estado !== 'cerrado' && boton.current && (
        <Panel origen={boton.current} alSalir={() => setEstado('cerrando')} alFin={() => setEstado('cerrado')} />
      )}
    </>
  )
}
