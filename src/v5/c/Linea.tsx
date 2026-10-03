import type { ReactNode } from 'react'

/** Una línea de título dentro de su máscara: el texto sube desde abajo al entrar la vista (movimiento.ts). El DOM sigue siendo de React. */
export const Linea = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className="c-linea">
    <span className={className ? `c-linea__t ${className}` : 'c-linea__t'}>{children}</span>
  </span>
)
