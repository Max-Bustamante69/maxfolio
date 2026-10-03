export interface Veredicto {
  ok: boolean
  motivo?: string
}

interface NavegadorExtra extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

/** Crea un contexto WebGL2 desechable: comprueba soporte y si el renderizador es por software (SwiftShader/llvmpipe = gama baja). */
function sondaWebgl(): { webgl2: boolean; software: boolean } {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2')
    if (!gl) return { webgl2: false, software: false }
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext() // no gastar uno de los ~16 contextos de la pestaña
    return { webgl2: true, software: /swiftshader|llvmpipe|software|basic render/i.test(renderer) }
  } catch {
    return { webgl2: false, software: false }
  }
}

/**
 * ¿Merece la pena descargar three? No para: prefers-reduced-motion (accesibilidad, ni siquiera con `forzar`),
 * Save-Data, red 2G/3G, < 4 GB de RAM o < 4 núcleos. Todo eso = póster. Son comprobaciones baratas: no crean ningún
 * contexto WebGL, así que se hacen antes de saber si la página tiene alguna pieza.
 * `forzar` (solo laboratorio) se salta las heurísticas de equipo, no la de accesibilidad.
 */
export function evaluarEquipo(forzar = false): Veredicto {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return { ok: false, motivo: 'prefers-reduced-motion' }
  if (forzar) return { ok: true }
  const nav = navigator as NavegadorExtra
  if (nav.connection?.saveData) return { ok: false, motivo: 'save-data' }
  if (/^(slow-2g|2g|3g)$/.test(nav.connection?.effectiveType ?? '')) return { ok: false, motivo: 'red-lenta' }
  if ((nav.deviceMemory ?? 8) < 4) return { ok: false, motivo: 'memoria-baja' }
  if ((nav.hardwareConcurrency ?? 8) < 4) return { ok: false, motivo: 'cpu-baja' }
  return { ok: true }
}

/**
 * Sin WebGL2 o con renderizado por software = póster. Crea un contexto desechable, así que solo se llama cuando ya hay
 * una pieza cerca del viewport: una página con el flag y sin piezas (`/menu`, `/arcade`) no crea ninguno.
 */
export function evaluarWebgl(forzar = false): Veredicto {
  const sonda = sondaWebgl()
  if (!sonda.webgl2) return { ok: false, motivo: 'sin-webgl2' }
  if (!forzar && sonda.software) return { ok: false, motivo: 'render-por-software' }
  return { ok: true }
}
