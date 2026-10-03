import { useId, useState, type ReactNode } from 'react'

/** Acordeón de botón + región: abre y cierra animando el alto real (grid-template-rows 0fr → 1fr, la técnica de la casa;
 *  sin max-height). Cerrado, el contenido es `inert`. Un solo botón por fila: nativo, con teclado y aria-expanded. */
export function Acordeon({ titulo, nivel = 3, children, abiertoInicial = false }: { titulo: ReactNode; nivel?: 2 | 3 | 4; children: ReactNode; abiertoInicial?: boolean }) {
  const [abierto, setAbierto] = useState(abiertoInicial)
  const id = useId()
  const H = `h${nivel}` as 'h2' | 'h3' | 'h4'
  return (
    <div className="d-capa" data-abierto={abierto}>
      <H className="d-capa-t">
        <button type="button" className="d-capa-b" aria-expanded={abierto} aria-controls={id} onClick={() => setAbierto((v) => !v)}>
          <span>{titulo}</span>
          <span className="d-mas-menos" aria-hidden="true" />
        </button>
      </H>
      <div id={id} className="d-acordeon" inert={!abierto}>
        <div className="d-acordeon-in">{children}</div>
      </div>
    </div>
  )
}
