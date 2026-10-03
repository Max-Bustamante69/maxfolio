/** Sonda WebGL: la puerta única del 3D. Si dice «no», no se descarga `three` y se queda el camino 2D (0 bytes de escena). */
export function puedeEscena(): boolean {
  try {
    if (new URLSearchParams(location.search).has('pl3d')) return true // forzar (capturas del póster)
    if (matchMedia('(max-width: 1023px)').matches) return false
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    if (nav.connection?.saveData) return false
    if (nav.deviceMemory && nav.deviceMemory < 4) return false
    const gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true })
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const r = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return !/swiftshader|llvmpipe|software/i.test(r)
  } catch {
    return false
  }
}
