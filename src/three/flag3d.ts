// Interruptor del 3D: lo ÚNICO de `src/three` que viaja en el chunk inicial (main.tsx y las páginas lo importan), así que
// se queda diminuto y sin imports pesados. `?3d=1` activa y guarda `maxfolio:3d=1` en localStorage (sigue activo en todas
// las rutas y visitas); `?3d=0` lo apaga y lo borra. Sin ninguno de los dos el sitio es EXACTAMENTE el de siempre.
import { lazy, type ComponentType } from 'react'

let activo: boolean | undefined

export function modo3dActivo() {
  if (activo === undefined) {
    const p = new URLSearchParams(location.search).get('3d')
    activo = p === '1'
    try {
      if (p === '1') localStorage.setItem('maxfolio:3d', '1')
      else if (p === '0') localStorage.removeItem('maxfolio:3d')
      else activo = localStorage.getItem('maxfolio:3d') === '1'
    } catch {
      /* almacenamiento bloqueado: solo vale el parámetro de esta carga */
    }
  }
  return activo
}

/**
 * `lazy()` que solo existe con el flag: `null` sin él (no se descarga ni se renderiza nada). Se decide al PRIMER USO, no
 * al evaluar el módulo: un `const X = flag ? lazy(...) : null` a nivel de módulo es un efecto secundario y obliga a
 * incluir el módulo entero (y su import dinámico) en quien lo reexporte, aunque nadie lo use. Por eso la llamada a esta
 * función lleva delante la anotación PURE de Rollup: así puede quitar el módulo si nadie lo importa.
 */
export function lazySiFlag<P extends object>(carga: () => Promise<{ default: ComponentType<P> }>) {
  let c: ComponentType<P> | null | undefined
  return () => (c === undefined ? (c = modo3dActivo() ? lazy(carga) : null) : c)
}
