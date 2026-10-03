import { useSyncExternalStore } from 'react'

// Efectos de sonido de Persona: APAGADOS por defecto, generados con WebAudio (ni un archivo), sin lazo ni rAF.
const KEY = 'v5-persona-sfx'
let activo = false
try {
  activo = localStorage.getItem(KEY) === '1'
} catch {
  /* almacenamiento bloqueado: se queda en silencio */
}
let ctx: AudioContext | null = null
const oyentes = new Set<() => void>()

export const sfx = {
  get activo() {
    return activo
  },
  alternar() {
    activo = !activo
    try {
      localStorage.setItem(KEY, activo ? '1' : '0')
    } catch {
      /* ignorar */
    }
    oyentes.forEach((f) => f())
    if (activo) sfx.tono(900, 0.07)
  },
  /** Un «blip» cuadrado corto (selección ≈ 760 Hz, confirmación más grave y largo). */
  tono(frecuencia = 760, duracion = 0.08) {
    if (!activo) return
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return
      ctx = ctx ?? new Ctx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = frecuencia
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duracion)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duracion + 0.01)
    } catch {
      /* política de autoplay o sin AudioContext */
    }
  },
}

export const useSfx = () =>
  useSyncExternalStore(
    (f) => {
      oyentes.add(f)
      return () => void oyentes.delete(f)
    },
    () => activo,
    () => false,
  )
