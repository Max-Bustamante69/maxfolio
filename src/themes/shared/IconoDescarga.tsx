/** Flecha que baja a la bandeja: el gesto de «descargar» del botón del CV en el héroe de los tres temas. Hereda el color del texto. */
export default function IconoDescarga({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" />
    </svg>
  )
}
