// La marca de Max Bustamante, «Bloque»: un bloque macizo cuya V de la M baja hasta la B, tallada en blanco y abierta por el pie.
// Dibujo exacto sobre la retícula de 32 (las dos piezas se tocan en la punta de la V); aquí con la caja ajustada al bloque (26 × 24)
// para que se alinee con el texto. Usa currentColor: cada tema la pinta con su tinta. public/favicon.svg es el mismo trazado.
export default function MarcaMB({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="3 4 26 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M3 4H9.85L16 10.3H10.84V28H3ZM22.15 4H29V28H16.62A5.135 5.135 0 0 0 16.62 17.73H17.51A3.715 3.715 0 0 0 17.51 10.3H16Z" />
    </svg>
  )
}
