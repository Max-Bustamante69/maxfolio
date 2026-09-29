import { evaluarCapacidad } from './capacidad'
import { fijarFase, leerEstado, suscribir } from './estado3d'
import { modo3d } from './modo3d'

const primeraPieza = () =>
  new Promise<void>((listo) => {
    if (leerEstado().cerca > 0) return listo()
    const baja = suscribir(() => {
      if (leerEstado().cerca > 0) {
        baja()
        listo()
      }
    })
  })

const idle = () =>
  new Promise<void>((listo) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => listo(), { timeout: 1500 })
    else setTimeout(listo, 250)
  })

/**
 * Lo único que corre (como import dinámico desde main.tsx) cuando el 3D está permitido. Decide, sin descargar
 * three, si este equipo lo merece; si sí, espera a que haya una pieza cerca del viewport y a un momento idle, y
 * solo entonces pide Escena3D (three + R3F + drei). Sin ninguna `<Pieza3D>` en la página nunca llega a pedirla.
 */
export default async function arrancar() {
  const modo = modo3d()
  if (!modo.activo) return
  // El laboratorio se monta siempre (con el equipo degradado enseña los pósters); las piezas reales, solo si el equipo lo merece.
  let eventSource: HTMLElement | null = document.getElementById('root')
  if (modo.lab) eventSource = (await import('./Laboratorio3D')).montarLab()
  const veredicto = evaluarCapacidad(modo.forzar)
  if (!veredicto.ok) {
    fijarFase('degradada', veredicto.motivo)
    return
  }
  fijarFase('cargando')
  await primeraPieza()
  await idle()
  const { montarEscena } = await import('./Escena3D')
  montarEscena({ eventSource, z: modo.lab ? 50 : undefined })
}
