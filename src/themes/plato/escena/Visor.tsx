import { useEffect, useRef, useState } from 'react'
import {
  EquirectangularReflectionMapping, ImageBitmapLoader, NeutralToneMapping, PerspectiveCamera, PMREMGenerator, Scene, SRGBColorSpace, Texture, TextureLoader, WebGLRenderer,
} from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { altosFranjas, PANTALLAS, urlFranja } from './pantallas'
import { tex } from './sets'
import { crearTelefono } from './telefono'

/**
 * «Ver en 3D» en el móvil: el mismo teléfono de la ficha en un visor aparte, pedido solo al tocar el botón (la portada y la ficha móvil siguen siendo 2D
 * ligeros). Un solo dibujo por estímulo: arrastrar lo gira, el control recorre la tienda; después de la ventana VIVO no pide más fotogramas.
 */
const VIVO = 1000
const COLA = 1000

export default function Visor({ slug, vista, etiqueta, recorrer, arrastra, cerrarEtq, cerrar }: { slug: string; vista: 'home' | 'pdp'; etiqueta: string; recorrer: string; arrastra: string; cerrarEtq: string; cerrar: () => void }) {
  const cont = useRef<HTMLDivElement>(null)
  const rango = useRef<HTMLInputElement>(null)
  const alRango = useRef<(v: number) => void>(() => {})
  const [lista, setLista] = useState(false)
  const info = PANTALLAS[slug]
  const conRecorrido = !!info && vista === 'home'

  useEffect(() => {
    const el = cont.current!
    const canvas = document.createElement('canvas')
    el.appendChild(canvas)
    let renderer: WebGLRenderer
    try { renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }) } catch { canvas.remove(); cerrar(); return }
    renderer.setPixelRatio(Math.max(1, Math.min(window.devicePixelRatio || 1, 2)))
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = NeutralToneMapping
    const scene = new Scene()
    const cam = new PerspectiveCamera(32, 1, 0.1, 50)
    const telefono = crearTelefono()
    scene.add(telefono.grupo)
    const aniso = renderer.capabilities.getMaxAnisotropy()
    const bitmap = typeof createImageBitmap === 'function' ? new ImageBitmapLoader().setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' }) : null
    const clasico = new TextureLoader()
    const texturas: Texture[] = []
    const cargar = (url: string, listo: (t: Texture) => void) => {
      const fin = (t: Texture) => { t.colorSpace = SRGBColorSpace; t.anisotropy = aniso; if (bitmap) t.flipY = false; t.needsUpdate = true; texturas.push(t); listo(t); estimulo() }
      if (bitmap) bitmap.load(url, (b) => fin(new Texture(b as unknown as HTMLImageElement)), undefined, () => {})
      else clasico.load(url, fin, undefined, () => {})
    }

    const e = { yaw: -0.5, pitch: 0.06, ty: -0.5, tp: 0.06, s: 0, ts: 0 }
    let raf = 0, vivoHasta = 0, colaHasta = 0, salto = 0, vivo = true, ancho = 1, alto = 1
    const dibujar = () => {
      raf = 0
      if (!vivo) return
      const ahora = performance.now()
      if (ahora > vivoHasta && ahora <= colaHasta && (salto++ & 1)) { raf = requestAnimationFrame(dibujar); return }
      const T = ahora / 1000
      e.yaw += (e.ty - e.yaw) * 0.16; e.pitch += (e.tp - e.pitch) * 0.16; e.s += (e.ts - e.s) * 0.2
      const mueve = Math.abs(e.ty - e.yaw) > 0.001 || Math.abs(e.tp - e.pitch) > 0.001 || Math.abs(e.ts - e.s) > 0.0004
      if (!mueve) { e.yaw = e.ty; e.pitch = e.tp; e.s = e.ts }
      telefono.grupo.rotation.set(e.pitch + Math.sin(T * 0.7) * 0.025, e.yaw + Math.sin(T * 0.55) * 0.08, Math.sin(T * 0.45) * 0.015)
      telefono.grupo.position.y = Math.sin(T * 0.9) * 0.04
      telefono.pantalla.scroll(e.s * telefono.pantalla.rango())
      renderer.render(scene, cam)
      if (mueve) estimulo(false)
      if (ahora < colaHasta) raf = requestAnimationFrame(dibujar)
    }
    function estimulo(despertar = true) {
      if (!vivo) return
      const ahora = performance.now()
      vivoHasta = Math.max(vivoHasta, ahora + VIVO); colaHasta = Math.max(colaHasta, vivoHasta + COLA)
      if (despertar && !raf) raf = requestAnimationFrame(dibujar)
    }
    const tam = () => {
      ancho = el.clientWidth; alto = el.clientHeight
      if (ancho < 2 || alto < 2) return
      renderer.setSize(ancho, alto, false)
      cam.aspect = ancho / alto
      // Encuadre vertical: el teléfono (1,76 de alto) ocupa ~70 % de la altura; en pantallas muy estrechas se aleja para que quepa el ancho.
      const d = Math.max(4.3, (0.86 * 1.55) / (2 * Math.tan((32 * Math.PI) / 360) * cam.aspect))
      cam.position.set(0, 0, d)
      cam.updateProjectionMatrix()
      estimulo()
    }
    const ro = new ResizeObserver(tam)
    ro.observe(el)

    // El contenido: la captura del pliegue enseguida; si la tienda tiene recorrido, sus franjas.
    cargar(tex(slug, vista === 'pdp' ? 'pm' : 'hm'), (t) => { telefono.pantalla.imagen(t, (t.image as { height: number }).height) })
    if (info && vista === 'home') {
      const altos = altosFranjas(info.h)
      const ts: Texture[] = []
      let n = 0
      altos.forEach((_, i) => cargar(urlFranja(slug, i), (t) => { ts[i] = t; if (++n === altos.length) telefono.pantalla.franjas(ts, altos, info.h) }))
    }
    // Entorno de estudio CC0, después del primer dibujo (el teléfono ya se ve sin él, solo sin reflejos).
    const alEntorno = window.setTimeout(() => {
      new RGBELoader().load('/v5/plato/3d/studio_small_09_512.hdr', (hdr) => {
        hdr.mapping = EquirectangularReflectionMapping
        const pmrem = new PMREMGenerator(renderer)
        const env = pmrem.fromEquirectangular(hdr).texture
        hdr.dispose(); pmrem.dispose()
        telefono.aplicarEnv(env)
        texturas.push(env)
        setLista(true)
        estimulo()
      }, undefined, () => setLista(true))
    }, 60)

    // Arrastrar gira el teléfono; el control recorre la tienda.
    let ult: { x: number; y: number } | null = null
    const abajo = (ev: PointerEvent) => { ult = { x: ev.clientX, y: ev.clientY }; canvas.setPointerCapture(ev.pointerId) }
    const mueve = (ev: PointerEvent) => {
      if (!ult) return
      e.ty += (ev.clientX - ult.x) * 0.012
      e.tp = Math.max(-0.5, Math.min(0.5, e.tp + (ev.clientY - ult.y) * 0.008))
      ult = { x: ev.clientX, y: ev.clientY }
      estimulo()
    }
    const suelta = () => { ult = null }
    canvas.addEventListener('pointerdown', abajo); canvas.addEventListener('pointermove', mueve); canvas.addEventListener('pointerup', suelta); canvas.addEventListener('pointercancel', suelta)
    alRango.current = (v) => { e.ts = v; estimulo() }
    const perdido = (ev: Event) => { ev.preventDefault(); cerrar() }
    canvas.addEventListener('webglcontextlost', perdido)
    const tecla = (ev: KeyboardEvent) => { if (ev.key === 'Escape') cerrar() }
    window.addEventListener('keydown', tecla)

    return () => {
      vivo = false
      window.clearTimeout(alEntorno)
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('keydown', tecla)
      canvas.removeEventListener('webglcontextlost', perdido)
      texturas.forEach((t) => t.dispose())
      telefono.dispose()
      renderer.dispose(); renderer.forceContextLoss()
      canvas.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, vista])

  useEffect(() => {
    const b = document.querySelector<HTMLElement>('.pl-visor-x')
    b?.focus()
    const antes = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = antes }
  }, [])

  return (
    <div className="pl-visor" role="dialog" aria-modal="true" aria-label={etiqueta} data-lista={lista ? 'si' : 'no'}>
      <div className="pl-visor-lienzo" ref={cont} />
      <button type="button" className="pl-redondo pl-visor-x" onClick={cerrar} aria-label={cerrarEtq}>
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
      <p className="pl-mono pl-visor-pie">{arrastra}</p>
      {conRecorrido && (
        <label className="pl-visor-rango">
          <span className="pl-mono">{recorrer}</span>
          <input ref={rango} type="range" min={0} max={1000} defaultValue={0} onChange={(ev) => alRango.current(Number(ev.target.value) / 1000)} />
        </label>
      )}
    </div>
  )
}
