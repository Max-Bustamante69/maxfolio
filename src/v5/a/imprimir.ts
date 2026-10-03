// «Imprimir y cortar»: las filas visibles entran de arriba abajo, una sola vez por sesión (sessionStorage con try/catch:
// sin almacenamiento simplemente se imprime en cada carga). El movimiento vive en libro.css; aquí solo se recuerda.
const CLAVE = 'v5-a-impreso'

export function yaImpreso() {
  try {
    return sessionStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

export function marcarImpreso() {
  try {
    sessionStorage.setItem(CLAVE, '1')
  } catch {
    /* sin almacenamiento: se imprime de nuevo la próxima vez */
  }
}
