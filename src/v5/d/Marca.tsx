/** Monograma MB grabado: un solo trazo de tinta, sin relleno, sin esfera ni perla (la marca es plana: sobre la plata
 *  clara un cromo 3D casi desaparece). Hereda el color del texto. */
export function Marca({ ancho = 34 }: { ancho?: number }) {
  return (
    <svg className="d-mb" width={ancho} height={(ancho * 24) / 46} viewBox="0 0 46 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" aria-hidden="true" focusable="false">
      <path d="M2.5 22.5V2.5L12 13.5l9.5-11v20M29.5 22.5V2.5h9L43 6v3l-4 3.5h-9.5M39 12.5l5 3.5v3l-4.5 3.5h-10" />
    </svg>
  )
}
