import type { ReactNode } from 'react'

/** Rellena los huecos {clave} de un texto del contenido. */
export const llenar = (t: string, v: Record<string, string | number>) => Object.entries(v).reduce((s, [k, x]) => s.split(`{${k}}`).join(String(x)), t)

/** Una cifra del vivo en tipografía de título: «70→95+» lleva una flecha dibujada (Anton no trae el glifo →) y «-30–40%» un menos de verdad.
 *  El lector de pantalla recibe el texto original, no las piezas. */
export function Valor({ v }: { v: string }): ReactNode {
  const partes = v.replace(/^-/, '−').split('→')
  return (
    <>
      <span aria-hidden="true">
        {partes[0]}
        {partes.length > 1 && (
          <>
            <svg className="pr-flecha" viewBox="0 0 44 24" aria-hidden="true">
              <path d="M2 12h34M26 3l11 9-11 9" />
            </svg>
            {partes[1]}
          </>
        )}
      </span>
      <span className="sr-only">{v.replace('→', ' → ')}</span>
    </>
  )
}
