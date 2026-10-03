import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as TeclaReact } from 'react'
import { Link } from 'react-router-dom'
import { SHOT_DATE, SHOT_SIZE, v5path, type Obra } from '../data'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { Camara, Z_MAX, type Pose } from './Camara'
import { capturasDe, guardarSesion, LOD_ANCHO, leerSesion, type Captura, type Por } from './datos'
import { Disposicion } from './Disposicion'
import { useHoja } from './Lectura'
import { Lod, type Nivel } from './Lod'
import { CURVA, gsap, origenMesa, prepararVuelo } from './movimiento'
import { HUECO, PAD, SD, SM, disponer, type Pieza } from './mundo'
import { Reglas, type ReglasApi } from './Reglas'
import type { Copy } from './copy'
import { useC } from './useC'

// La Mesa: un lienzo bidimensional con arrastre, zoom y tres niveles de detalle. Se carga solo al pulsar «Abrir la mesa» (chunk lazy).
// Una sola capa con transform; las diapositivas se reubican entre disposiciones; la cámara tiene inercia y resorte, sin lazo en reposo.

const SUAVE = 'power3.out'
/** Cuánto se inclina una pieza en pleno vuelo entre disposiciones (determinista por su orden): la maqueta las cruza ligeramente torcidas sobre la mesa. */
const inclinacion = (i: number) => (((i * 7) % 5) - 2) * 0.9
/** Cuánto hay que desplazar el tramo [a0, a1] para que quepa en [lo, hi]; si no cabe, se alinea su principio. */
const dentro = (a0: number, a1: number, lo: number, hi: number) => (a1 - a0 > hi - lo || a0 < lo ? lo - a0 : a1 > hi ? hi - a1 : 0)

interface Props {
  por: Por
  onPor: (p: Por) => void
  onSalir: () => void
  inicial?: string | null
}

const clave = (id: string) => id.split('~')[0]
const nivelPara = (anchoPantalla: number, vp: Captura['vp']): Nivel => {
  const px = anchoPantalla * Math.min(2, window.devicePixelRatio || 1)
  return px <= LOD_ANCHO[0][vp] ? 0 : px <= LOD_ANCHO[1][vp] ? 1 : 2
}

/** Rectángulo de mundo de la diapositiva `i` de un paquete. */
function rectDe(p: Pieza, caps: Captura[], i: number) {
  let x = p.x + PAD
  for (let k = 0; k < i; k++) x += (caps[k].vp === 'desktop' ? SD.w : SM.w) + HUECO
  return { x, y: p.y + PAD, w: caps[i].vp === 'desktop' ? SD.w : SM.w, h: SD.h }
}

export default function Mesa({ por, onPor, onSalir, inicial }: Props) {
  const { t, obras } = useC()
  const ancho = useMediaQuery('(min-width: 900px)')
  const { nr, grupos } = useHoja(por, true)
  const porSlug = useMemo(() => new Map(obras.map((o) => [o.slug, o])), [obras])
  const mundoDatos = useMemo(
    () => disponer(grupos, por, porSlug, (y) => t.mesa.sinCapturas(String(y)), (window.innerWidth - 90) / Math.max(300, window.innerHeight - 190), !ancho),
    [grupos, por, porSlug, t, ancho],
  )
  const datos = useRef(mundoDatos)
  datos.current = mundoDatos

  const raiz = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLDivElement>(null)
  const mundo = useRef<HTMLDivElement>(null)
  const reglas = useRef<ReglasApi>(null)
  const zTxt = useRef<HTMLSpanElement>(null)
  const camara = useRef<Camara>(null!)
  const [niveles, setNiveles] = useState<Map<string, Nivel>>(() => new Map())
  const [sel, setSel] = useState<string | null>(null)
  const [diaSel, setDiaSel] = useState(0)
  const [pista, setPista] = useState(() => leerSesion('pista') !== '1')
  // La pista del móvil no tapa el mapa: asoma sobre el HUD unos segundos y se va (o con el primer gesto).
  useEffect(() => {
    if (!pista) return
    const t = window.setTimeout(() => {
      setPista(false)
      guardarSesion('pista', '1')
    }, 4200)
    return () => clearTimeout(t)
  }, [pista])
  const selRef = useRef(sel)
  selRef.current = sel
  const diaRef = useRef(diaSel)
  diaRef.current = diaSel
  const selEl = useRef<HTMLElement | null>(null)
  const anchoRef = useRef(ancho)
  anchoRef.current = ancho
  // Qué encuadre mantiene la cámara: «todo» (la mesa entera) o «lectura» (el móvil: el ancho de una columna, desde arriba). Un cambio de tamaño o de disposición lo repone.
  const encuadre = useRef<'todo' | 'lectura' | null>(ancho ? 'todo' : 'lectura')
  const primera = useRef(true)
  const visorBox = useRef<{ l: number; t: number; r: number; b: number } | null>(null)
  const guia = useRef<SVGGElement>(null)
  const guiaD = useRef<SVGPathElement>(null)
  const guiaPin = useRef<SVGRectElement>(null)
  const guiaGrad = useRef<SVGLinearGradientElement>(null)

  const tam = () => ({ w: lienzo.current?.clientWidth ?? 1200, h: lienzo.current?.clientHeight ?? 800 })

  /** Parte libre de la mesa. En escritorio el visor ocupa la izquierda; en el móvil es una hoja inferior y el botón de salir y el HUD ocupan arriba y abajo. */
  const margen = useCallback((visor: boolean) => {
    if (anchoRef.current) return { l: visor ? 396 : 44, t: 40, r: 40, b: 92 }
    const alto = lienzo.current?.clientHeight ?? 800
    return { l: 12, t: 64, r: 12, b: visor && visorBox.current ? Math.max(136, alto - visorBox.current.t + 12) : 136 }
  }, [])

  /** Pose que encuadra un rectángulo de mundo dentro de la parte libre de la mesa. */
  const poseDe = useCallback(
    (r: { x: number; y: number; w: number; h: number }, zTope = Z_MAX, visor = !!selRef.current): Pose => {
      const { w, h } = tam()
      const m = margen(visor)
      const W = w - m.l - m.r
      const H = h - m.t - m.b
      const z = Math.min(zTope, W / r.w, H / r.h)
      return { z, x: m.l + (W - r.w * z) / 2 - r.x * z, y: m.t + (H - r.h * z) / 2 - r.y * z }
    },
    [margen],
  )
  // +140 por arriba: las etiquetas de grupo crecen hacia arriba desde su bloque y deben caber en «ver todo».
  const todo = useCallback(() => {
    const pose = poseDe({ x: 0, y: -140, w: datos.current.w, h: datos.current.h + 140 }, Z_MAX, false)
    // Móvil: la mesa es una sola columna; pegada a la izquierda deja sitio a las etiquetas, que en «ver todo» se leen a su derecha.
    return anchoRef.current ? pose : { ...pose, x: margen(false).l + 24 * pose.z }
  }, [poseDe, margen])
  // Móvil: el zoom de lectura es el ancho de una columna (≈ 0,28), no la mesa entera (≈ 0,06): las miniaturas se leen y los grupos se recorren con un dedo.
  const lectura = useCallback((): Pose => {
    const { w } = tam()
    const m = margen(false)
    const z = Math.min(Z_MAX, (w - m.l - m.r) / (datos.current.w + 48))
    return { z, x: m.l + 24 * z, y: m.t + 16 }
  }, [margen])
  const reencuadrar = useCallback(() => (encuadre.current === 'todo' ? todo() : encuadre.current === 'lectura' ? lectura() : null), [todo, lectura])

  /* ---- etiquetas a tamaño de pantalla (pies de código y títulos de grupo): contraescala 1/z solo de lo visible ---- */
  const escalables = useRef<{ el: HTMLElement; x: number; y: number; w: number; h: number; z: number; prop?: boolean; grp?: boolean }[]>([])
  const escalar = (c: Camara) => {
    const { w, h } = tam()
    const x0 = -c.x / c.z - 200
    const y0 = -c.y / c.z - 200
    const x1 = (w - c.x) / c.z + 200
    const y1 = (h - c.y) / c.z + 200
    const inv = 1 / c.z
    for (const e of escalables.current) {
      if (e.x > x1 || e.x + e.w < x0 || e.y > y1 || e.y + e.h < y0 || Math.abs(e.z - c.z) < 0.0005) continue
      e.z = c.z
      if (e.prop) e.el.style.setProperty('--iz', String(inv))
      else e.el.style.transform = `scale(${inv})`
      // Móvil, mesa entera: las etiquetas de grupo (a tamaño de pantalla) no caben sobre su miniatura; se leen a la derecha de la columna.
      if (e.grp) e.el.style.translate = !anchoRef.current && c.z < 0.12 ? `${datos.current.w + 160}px ${23 * inv}px` : ''
    }
    const lejos = c.z < (anchoRef.current ? 0.5 : 0.2) ? '1' : '0'
    if (mundo.current && mundo.current.getAttribute('data-lejos') !== lejos) mundo.current.setAttribute('data-lejos', lejos)
    selEl.current?.style.setProperty('--iz', String(inv))
  }

  /* ---- niveles de detalle: por tamaño en pantalla, como mucho 6 en LOD 2 (la memoria decodificada), fuera de vista → LOD 0 ---- */
  const ultimoLod = useRef(0)
  const calcularNiveles = (c: Camara) => {
    const { w, h } = tam()
    const x0 = -c.x / c.z
    const y0 = -c.y / c.z
    const x1 = (w - c.x) / c.z
    const y1 = (h - c.y) / c.z
    const cx = (x0 + x1) / 2
    const cy = (y0 + y1) / 2
    const sig = new Map<string, Nivel>()
    const altos: { id: string; d: number }[] = []
    for (const p of datos.current.piezas) {
      if (p.copia > 0) continue
      if (p.x > x1 || p.x + p.w < x0 || p.y > y1 || p.y + p.h < y0) continue
      const obra = porSlug.get(p.slug)
      if (!obra) continue
      const n = Math.max(...capturasDe(obra).map((cp) => nivelPara((cp.vp === 'desktop' ? SD.w : SM.w) * c.z, cp.vp)))
      if (n === 2) altos.push({ id: p.id, d: Math.hypot(p.x + p.w / 2 - cx, p.y + p.h / 2 - cy) })
      else sig.set(p.id, n as Nivel)
    }
    altos.sort((a, b) => a.d - b.d).forEach((a, i) => sig.set(a.id, i < 6 ? 2 : 1))
    setNiveles((prev) => {
      if (prev.size === sig.size && [...sig].every(([k, v]) => prev.get(k) === v)) return prev
      return sig
    })
  }

  /* ---- estado de la cámara en la URL: #x=…&y=…&z=…, con replaceState y como mucho 5 veces por segundo ---- */
  const hashTimer = useRef(0)
  const escribirHash = () => {
    hashTimer.current = 0
    const c = camara.current
    if (!c) return
    history.replaceState(history.state, '', `${location.pathname}${location.search}#x=${Math.round(c.x)}&y=${Math.round(c.y)}&z=${c.z.toFixed(3)}`)
  }

  const fotograma = (c: Camara) => {
    if (mundo.current) mundo.current.style.transform = `translate3d(${c.x}px,${c.y}px,0) scale(${c.z})`
    reglas.current?.actualizar(c.x, c.y, c.z)
    if (zTxt.current) zTxt.current.textContent = `z ${c.z.toFixed(2).replace('.', ',')}`
    escalar(c)
    if (selRef.current) dibujarGuia(c)
    const ahora = performance.now()
    if (ahora - ultimoLod.current > 120) {
      ultimoLod.current = ahora
      calcularNiveles(c)
    }
    if (!hashTimer.current) hashTimer.current = window.setTimeout(escribirHash, 200)
  }
  const reposo = (c: Camara) => {
    calcularNiveles(c)
    if (!hashTimer.current) hashTimer.current = window.setTimeout(escribirHash, 200)
  }
  const fotogramaRef = useRef(fotograma)
  fotogramaRef.current = fotograma
  const reposoRef = useRef(reposo)
  reposoRef.current = reposo

  /* ---- cámara: se crea una vez; arranca en «ver todo» un poco más cerca y se asienta con el resorte ---- */
  useLayoutEffect(() => {
    const cam = new Camara(
      (c) => fotogramaRef.current(c),
      (en) => {
        if (mundo.current) mundo.current.style.willChange = en ? 'transform' : ''
        raiz.current?.toggleAttribute('data-moviendo', en)
      },
      (c) => reposoRef.current(c),
    )
    camara.current = cam
    cam.zMin = todo().z * 0.55
    const fin = reencuadrar()!
    const m = /x=(-?\d+)&y=(-?\d+)&z=([\d.]+)/.exec(location.hash)
    if (m) {
      cam.poner({ x: Number(m[1]), y: Number(m[2]), z: Number(m[3]) })
      encuadre.current = null
    } else {
      const { w, h } = tam()
      const z0 = fin.z * 1.3
      cam.poner({ z: z0, x: w / 2 - ((w / 2 - fin.x) / fin.z) * z0, y: h / 2 - ((h / 2 - fin.y) / fin.z) * z0 })
      cam.irA(fin)
    }
    return () => {
      cam.destruir()
      clearTimeout(hashTimer.current)
      history.replaceState(history.state, '', `${location.pathname}${location.search}`)
    }
  }, [])

  /* ---- apertura: el iris lo abre el marco (Inicio) en cuanto se pide la mesa; aquí las diapositivas llegan en cascada ---- */
  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    const ctx = gsap.context(() => {
      // Las diapositivas se asientan sobre sus marcos en cascada (el marco conserva su transform: es la posición en el mundo).
      gsap.from('.c-paq', { opacity: 0, duration: 0.3, stagger: { each: 0.012, amount: 0.3 }, delay: 0.08, ease: SUAVE, clearProps: 'opacity' })
      gsap.from('.c-paq__slides', { opacity: 0, y: 26, duration: 0.5, stagger: { each: 0.012, amount: 0.3 }, delay: 0.12, ease: SUAVE, clearProps: 'opacity,transform' })
    }, el)
    el.focus({ preventScroll: true })
    const html = document.documentElement
    const antes = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      ctx.revert()
      html.style.overflow = antes
    }
  }, [])

  /* ---- posición de cada paquete (gsap.x/y) y reubicación entre disposiciones: FLIP de 520 ms con escalón de 6 ms ---- */
  const previas = useRef(new Map<string, { x: number; y: number }>())
  useEffect(
    () => () => {
      // Al desmontar (también el simulado de StrictMode) se olvida lo colocado: el montaje siguiente vuelve a colocar todo.
      previas.current = new Map()
      primera.current = true
    },
    [],
  )
  useLayoutEffect(() => {
    const m = mundo.current
    if (!m) return
    const { piezas, etiquetas, huecos, cajas } = mundoDatos
    piezas.forEach((p, i) => {
      const el = m.querySelector<HTMLElement>(`[data-paq="${p.id}"]`)
      if (!el) return
      const antes = previas.current.get(p.id)
      if (!antes) {
        gsap.set(el, { x: p.x, y: p.y })
        if (!primera.current) gsap.from(el, { opacity: 0, duration: 0.3, delay: 0.25, ease: 'power3.out', clearProps: 'opacity' })
      } else if (antes.x !== p.x || antes.y !== p.y) {
        // La pieza cruza la mesa con la curva de la dirección y, en pleno vuelo, ligeramente torcida (vuelve a 0° al asentarse).
        const delay = Math.min(i * 0.006, 0.22)
        gsap.fromTo(el, { x: antes.x, y: antes.y, rotation: 0 }, { x: p.x, y: p.y, duration: 0.52, ease: CURVA, delay, overwrite: true })
        gsap.to(el, { keyframes: { rotation: [0, inclinacion(i), 0], easeEach: 'sine.inOut' }, duration: 0.52, delay })
      }
    })
    if (!primera.current) gsap.from(m.querySelectorAll('.c-grp, .c-hueco, .c-grp__caja'), { opacity: 0, duration: 0.3, delay: 0.2, stagger: 0.03, ease: SUAVE, clearProps: 'opacity' })
    previas.current = new Map(piezas.map((p) => [p.id, { x: p.x, y: p.y }]))
    escalables.current = [
      ...piezas.flatMap((p) => [...m.querySelectorAll<HTMLElement>(`[data-paq="${p.id}"] [data-et]`)].map((el) => ({ el, x: p.x, y: p.y, w: p.w, h: p.h, z: 0 }))),
      ...etiquetas.flatMap((e) => [...m.querySelectorAll<HTMLElement>(`[data-grp="${e.id}"] [data-et]`)].map((el) => ({ el, x: e.x, y: e.y - 700, w: 2400, h: 760, z: 0, grp: true }))),
      ...huecos.map((h) => ({ el: m.querySelector<HTMLElement>(`[data-hueco="${h.id}"]`)!, x: h.x, y: h.y, w: h.w, h: h.h, z: 0, prop: true })).filter((h) => h.el),
      ...cajas.map((b) => ({ el: m.querySelector<HTMLElement>(`[data-caja="${b.id}"]`)!, x: b.x, y: b.y, w: b.w, h: b.h, z: 0, prop: true })).filter((b) => b.el),
    ]
    const c = camara.current
    if (c) {
      escalar(c)
      calcularNiveles(c)
      const e = reencuadrar()
      if (!primera.current && e) c.irA(e)
    }
    primera.current = false
  }, [mundoDatos])

  /* ---- selección: el visor, el aro de lápiz y el enfoque ---- */
  const piezaDe = (id: string | null) => (id ? datos.current.piezas.find((p) => p.id === id) : undefined)
  const elegir = useCallback(
    (id: string | null, dia?: number) => {
      setSel(id)
      if (id) {
        const o = porSlug.get(clave(id))
        const caps = o ? capturasDe(o) : []
        const pdpM = caps.findIndex((c) => c.vista === 'pdp' && c.vp === 'mobile')
        setDiaSel(dia ?? (pdpM >= 0 ? pdpM : 0))
      }
    },
    [porSlug],
  )
  /** Mide el visor (su caja en coordenadas de la mesa, sin contar su animación de entrada). */
  const medirVisor = () => {
    const v = raiz.current?.querySelector<HTMLElement>('.c-visor')
    visorBox.current = v ? { l: v.offsetLeft, t: v.offsetTop, r: v.offsetLeft + v.offsetWidth, b: v.offsetTop + v.offsetHeight } : null
  }

  /** La línea de lápiz que une el paquete elegido con su visor (la maqueta la dibuja con un pin cuadrado): en pantalla, sigue a la cámara cuadro a cuadro.
   *  Solo en escritorio, donde el visor es lateral: en el móvil es una hoja inferior y la línea cruzaría otras obras. */
  const dibujarGuia = (c: Camara) => {
    const g = guia.current
    const d = guiaD.current
    const pin = guiaPin.current
    const grad = guiaGrad.current
    if (!g || !d || !pin || !grad) return
    const p = piezaDe(selRef.current)
    const v = visorBox.current
    if (!p || !v || !anchoRef.current) {
      g.style.visibility = 'hidden'
      return
    }
    const x0 = c.x + p.x * c.z
    const y0 = c.y + p.y * c.z
    const sx = x0 - 20
    const sy = y0 + (p.h * c.z) / 2
    const ey = Math.min(Math.max(sy, v.t + 28), v.b - 28)
    const mx = v.r + (sx - v.r) / 2
    if (sx - 8 <= v.r) return void (g.style.visibility = 'hidden')
    const trazo = Math.abs(ey - sy) < 1 ? `M${sx} ${sy}H${v.r}` : `M${sx} ${sy}H${mx}V${ey}H${v.r}`
    g.style.visibility = 'visible'
    d.setAttribute('d', trazo)
    grad.setAttribute('x1', String(sx)) // la línea se desvanece hacia el visor: cuando cruza otros paquetes no los tapa
    grad.setAttribute('x2', String(v.r))
    pin.setAttribute('x', String(sx - 6))
    pin.setAttribute('y', String(sy - 6))
  }

  /** Si el visor o el borde tapan el paquete, la cámara se desplaza lo mínimo para dejarlo a la vista (mismo resorte; nunca cambia el zoom). */
  const despejar = (p: Pieza) => {
    const c = camara.current
    const { w, h } = tam()
    const m = margen(true)
    const x0 = c.x + p.x * c.z
    const y0 = c.y + p.y * c.z
    const dx = dentro(x0, x0 + p.w * c.z, m.l + (anchoRef.current ? 28 : 8), w - m.r)
    const dy = dentro(y0, y0 + p.h * c.z, m.t + 8, h - m.b)
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
    encuadre.current = null
    c.irA({ z: c.z, x: c.x + dx, y: c.y + dy })
  }

  useLayoutEffect(() => {
    const m = raiz.current
    m?.querySelectorAll('[data-sel]').forEach((e) => e.removeAttribute('data-sel'))
    const el = sel ? m?.querySelector<HTMLElement>(`[data-paq="${sel}"]`) : null
    selEl.current = el ?? null
    medirVisor()
    const c = camara.current
    if (!el || !c) {
      if (c) dibujarGuia(c)
      return
    }
    el.setAttribute('data-sel', '')
    el.style.setProperty('--iz', String(1 / c.z))
    const p = piezaDe(sel)
    if (p) despejar(p)
    dibujarGuia(c)
    const ctx = gsap.context(() => void gsap.fromTo(guia.current, { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.3, delay: 0.1, ease: SUAVE, clearProps: 'opacity,transform' }), raiz)
    const visor = m?.querySelector('.c-visor')
    const ro = new ResizeObserver(() => {
      medirVisor()
      if (camara.current) dibujarGuia(camara.current)
    })
    if (visor) ro.observe(visor)
    return () => {
      ctx.revert()
      ro.disconnect()
    }
  }, [sel])

  /** Vuela la cámara a una diapositiva (`dia`) o, sin ella, al paquete entero. */
  const enfocar = useCallback(
    (id: string | null = selRef.current, dia?: number) => {
      const p = piezaDe(id)
      const o = p && porSlug.get(p.slug)
      if (!p || !o || !camara.current) return
      const caps = capturasDe(o)
      encuadre.current = null
      const r = dia === undefined ? { x: p.x, y: p.y, w: p.w, h: p.h } : rectDe(p, caps, Math.min(dia, caps.length - 1))
      camara.current.irA(poseDe(r, Z_MAX, true))
    },
    [poseDe, porSlug],
  )

  // Con el foco del teclado en un paquete que no cabe en la parte libre de la mesa (ni fuera de pantalla ni bajo el visor), la cámara lo centra.
  const alEnfocar = useCallback(
    (p: Pieza) => {
      const c = camara.current
      const { w, h } = tam()
      const m = margen(!!selRef.current)
      const x0 = c.x + p.x * c.z
      const y0 = c.y + p.y * c.z
      if (x0 >= m.l - 1 && y0 >= m.t - 1 && x0 + p.w * c.z <= w - m.r + 1 && y0 + p.h * c.z <= h - m.b + 1) return
      encuadre.current = null
      c.irA({ z: c.z, x: m.l + (w - m.l - m.r) / 2 - (p.x + p.w / 2) * c.z, y: m.t + (h - m.t - m.b) / 2 - (p.y + p.h / 2) * c.z })
    },
    [margen],
  )

  const centro = () => {
    const { w, h } = tam()
    const m = margen(!!selRef.current)
    return { x: (m.l + w - m.r) / 2, y: (m.t + h - m.b) / 2 }
  }
  const zoomBoton = (f: number) => {
    const c = camara.current
    const o = centro()
    encuadre.current = null
    c.zoomA(o.x, o.y, c.z * f)
  }
  const verTodo = () => {
    encuadre.current = 'todo'
    camara.current.irA(todo())
  }

  /* ---- salir: el iris se cierra sobre el botón de origen; la Lectura vuelve con la hoja donde estaba ---- */
  const salir = useCallback(() => {
    const el = raiz.current
    if (!el) return onSalir()
    const marco = el.closest<HTMLElement>('[data-marco-mesa]') ?? el
    const { x: ox, y: oy } = origenMesa()
    gsap.to(marco, { clipPath: `circle(0px at ${ox}px ${oy - marco.getBoundingClientRect().top}px)`, duration: 0.32, ease: 'power3.out', onComplete: onSalir })
  }, [onSalir])
  useEffect(() => {
    const f = () => salir()
    window.addEventListener('c:salir-mesa', f)
    return () => window.removeEventListener('c:salir-mesa', f)
  }, [salir])

  /* ---- teclado: solo con el foco dentro de la mesa (WCAG 2.1.4) ---- */
  const teclas = (e: TeclaReact) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    const c = camara.current
    const p = e.shiftKey ? 256 : 64
    const dir: Record<string, [number, number]> = { ArrowLeft: [p, 0], ArrowRight: [-p, 0], ArrowUp: [0, p], ArrowDown: [0, -p] }
    if (dir[e.key]) {
      e.preventDefault()
      encuadre.current = null
      c.empujar(...dir[e.key])
    } else if (e.key === '+' || e.key === '=') zoomBoton(1.5)
    else if (e.key === '-' || e.key === '_') zoomBoton(1 / 1.5)
    else if (e.key === '0') verTodo()
    else if (e.key === 'f' || e.key === 'F') enfocar(selRef.current, diaRef.current)
    else if (e.key === 'l' || e.key === 'L') salir()
    else if (e.key === 'Escape') (selRef.current ? elegir(null) : salir())
    else return
    e.stopPropagation()
  }

  /* ---- punteros: un dedo o el ratón desplazan (con inercia), dos dedos hacen pellizco, un doble toque acerca ---- */
  useEffect(() => {
    const l = lienzo.current!
    const punteros = new Map<number, { x: number; y: number }>()
    const g = { mov: 0, t0: 0, destino: null as Element | null, muestras: [] as { t: number; x: number; y: number }[], ultimoToque: 0, ultimoId: '' }
    const rel = (e: PointerEvent) => {
      const r = l.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const par = () => {
      const [a, b] = [...punteros.values()]
      return { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }
    }
    let prevPar = { d: 0, cx: 0, cy: 0 }
    const abajo = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      l.setPointerCapture(e.pointerId)
      punteros.set(e.pointerId, rel(e))
      camara.current.parar()
      if (punteros.size === 1) {
        g.mov = 0
        g.t0 = e.timeStamp
        g.destino = e.target as Element
        g.muestras = [{ t: e.timeStamp, ...rel(e) }]
        l.setAttribute('data-arrastrando', '')
      } else if (punteros.size === 2) prevPar = par()
      setPista(false)
      guardarSesion('pista', '1')
    }
    const mueve = (e: PointerEvent) => {
      const antes = punteros.get(e.pointerId)
      if (!antes) return
      const ahora = rel(e)
      punteros.set(e.pointerId, ahora)
      encuadre.current = null
      if (punteros.size === 1) {
        g.mov += Math.hypot(ahora.x - antes.x, ahora.y - antes.y)
        camara.current.arrastrar(ahora.x - antes.x, ahora.y - antes.y)
        g.muestras.push({ t: e.timeStamp, ...ahora })
        while (g.muestras.length > 2 && e.timeStamp - g.muestras[0].t > 90) g.muestras.shift()
      } else if (punteros.size === 2) {
        const p = par()
        g.mov = 99
        camara.current.arrastrar(p.cx - prevPar.cx, p.cy - prevPar.cy)
        if (prevPar.d > 0) camara.current.zoomDirecto(p.cx, p.cy, p.d / prevPar.d)
        prevPar = p
      }
    }
    const arriba = (e: PointerEvent) => {
      if (!punteros.delete(e.pointerId)) return
      if (punteros.size > 0) {
        // Quedó un dedo: el arrastre sigue desde donde está, sin saltos.
        g.muestras = [{ t: e.timeStamp, ...[...punteros.values()][0] }]
        return
      }
      l.removeAttribute('data-arrastrando')
      const esClic = g.mov < 6 && e.timeStamp - g.t0 < 600 && e.type === 'pointerup'
      if (esClic) {
        camara.current.parar()
        const paq = g.destino?.closest<HTMLElement>('[data-paq]')
        const dia = g.destino?.closest<HTMLElement>('[data-sd]')
        const id = paq?.dataset.paq ?? null
        const doble = id !== null && id === g.ultimoId && e.timeStamp - g.ultimoToque < 380
        g.ultimoId = id ?? ''
        g.ultimoToque = e.timeStamp
        if (id) {
          const i = dia ? Number(dia.dataset.sd) : undefined
          elegir(id, i)
          if (doble) enfocar(id, i ?? diaRef.current)
        } else elegir(null)
      } else {
        const m = g.muestras
        const a = m[0]
        const b = m[m.length - 1]
        const dt = b.t - a.t
        if (dt > 0 && e.timeStamp - b.t < 120) camara.current.soltar((b.x - a.x) / dt, (b.y - a.y) / dt)
        else reposoRef.current(camara.current)
      }
    }
    const rueda = (e: WheelEvent) => {
      e.preventDefault()
      encuadre.current = null
      const r = l.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) camara.current.zoomDirecto(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.01))
      else camara.current.arrastrar(-e.deltaX, -e.deltaY)
      window.clearTimeout(ruedaFin)
      ruedaFin = window.setTimeout(() => reposoRef.current(camara.current), 140)
    }
    let ruedaFin = 0
    l.addEventListener('pointerdown', abajo)
    l.addEventListener('pointermove', mueve)
    l.addEventListener('pointerup', arriba)
    l.addEventListener('pointercancel', arriba)
    l.addEventListener('wheel', rueda, { passive: false })
    const ro = new ResizeObserver(() => {
      const e = reencuadrar()
      if (e && camara.current) camara.current.poner(e)
    })
    ro.observe(l)
    return () => {
      l.removeEventListener('pointerdown', abajo)
      l.removeEventListener('pointermove', mueve)
      l.removeEventListener('pointerup', arriba)
      l.removeEventListener('pointercancel', arriba)
      l.removeEventListener('wheel', rueda)
      window.clearTimeout(ruedaFin)
      ro.disconnect()
    }
  }, [elegir, enfocar, reencuadrar])

  // Llegar con ?obra=slug (desde «Ver en la mesa»): la diapositiva queda elegida y enfocada.
  useEffect(() => {
    if (!inicial) return
    const id = `${inicial}~0`
    if (!datos.current.piezas.some((p) => p.id === id)) return
    elegir(id)
    const espera = window.setTimeout(() => enfocar(id), 560)
    return () => clearTimeout(espera)
  }, [inicial])

  const pSel = piezaDe(sel)
  const oSel = pSel && porSlug.get(pSel.slug)
  const capsSel = oSel ? capturasDe(oSel) : []
  const nGrupos = mundoDatos.etiquetas.length

  return (
    <div className="c-mesa" ref={raiz} role="region" aria-label={t.mesa.region} aria-describedby="c-mesa-teclas" tabIndex={-1} onKeyDown={teclas} data-movil={!ancho || undefined}>
      <p id="c-mesa-teclas" className="c-sr">
        {t.mesa.teclas}
      </p>
      <div className="c-lienzo" ref={lienzo}>
        <Reglas ref={reglas} />
        <div className="c-mundo" ref={mundo} data-lejos="1">
          {mundoDatos.cajas.map((b) => (
            <div key={b.id} className="c-grp__caja" data-caja={b.id} style={{ left: b.x, top: b.y, width: b.w, height: b.h }} aria-hidden="true" />
          ))}
          {mundoDatos.etiquetas.map((e) => (
            <div key={e.id} className="c-grp" data-grp={e.id} style={{ left: e.x, top: e.y }}>
              <span className="c-grp__et" data-et="">
                {e.titulo} <b>{e.n}</b>
              </span>
            </div>
          ))}
          {mundoDatos.huecos.map((h) => (
            <div key={h.id} className="c-hueco" data-hueco={h.id} style={{ left: h.x, top: h.y, width: h.w, height: h.h }} aria-hidden="true">
              <span>{h.titulo}</span>
            </div>
          ))}
          {mundoDatos.piezas.map((p) => (
            <Paquete
              key={p.id}
              pieza={p}
              obra={porSlug.get(p.slug)!}
              nr={nr.get(p.slug) ?? ''}
              nivel={p.copia > 0 ? 0 : (niveles.get(p.id) ?? 0)}
              onEnfocar={alEnfocar}
              onElegir={elegir}
              t={t}
            />
          ))}
        </div>
      </div>

      <svg className="c-guia" aria-hidden="true">
        <defs>
          <linearGradient id="c-guia-grad" ref={guiaGrad} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" />
            <stop offset="1" />
          </linearGradient>
        </defs>
        <g ref={guia}>
          <path ref={guiaD} />
          <rect ref={guiaPin} width="12" height="12" rx="2.5" />
        </g>
      </svg>

      <button type="button" className="c-btn c-btn--linea c-mesa__salir" onClick={salir}>
        <Flecha izq />
        {t.mesa.salir}
      </button>

      {pSel && oSel && capsSel[diaSel] && (
        <Visor
          key={pSel.id}
          paq={pSel.id}
          obra={oSel}
          nr={nr.get(oSel.slug) ?? ''}
          caps={capsSel}
          dia={Math.min(diaSel, capsSel.length - 1)}
          onDia={setDiaSel}
          onCerrar={() => elegir(null)}
          onEnfocar={() => enfocar(pSel.id, diaSel)}
        />
      )}

      {pista && ancho === false && (
        <p className="c-pista" role="note">
          {t.mesa.pista}
        </p>
      )}

      <div className="c-hud" role="group" aria-label={t.mesa.camara}>
        {!ancho && <Disposicion por={por} onChange={onPor} />}
        <p className="c-hud__estado" role="status">
          <Flecha cruce />
          {t.mesa.anuncio(t.por[por], nGrupos)}
        </p>
        <p className="c-hud__leyenda">{t.mesa.leyenda}</p>
        <div className="c-hud__zoom">
          <button type="button" className="c-ctl" aria-label={t.mesa.alejar} onClick={() => zoomBoton(1 / 1.5)}>
            −
          </button>
          <button type="button" className="c-ctl" aria-label={t.mesa.acercar} onClick={() => zoomBoton(1.5)}>
            +
          </button>
          <button type="button" className="c-ctl c-ctl--txt" onClick={verTodo}>
            {t.mesa.verTodo}
          </button>
          <span className="c-mono c-hud__z" ref={zTxt} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

const Flecha = ({ izq, cruce }: { izq?: boolean; cruce?: boolean }) => (
  <svg className="c-ico" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {cruce ? <path d="M2.5 5.5h11M11 3l2.5 2.5L11 8M15.5 12.5h-11M7 10l-2.5 2.5L7 15" /> : izq ? <path d="M15 9H3m5-5L3 9l5 5" /> : <path d="M3 9h12m-5-5 5 5-5 5" />}
  </svg>
)

/* ---- un paquete: las cuatro diapositivas de una obra en su marco; un solo tab stop, el foco lo sigue la cámara ---- */
interface PaqueteProps {
  pieza: Pieza
  obra: Obra
  nr: string
  nivel: Nivel
  t: Copy
  onEnfocar: (p: Pieza) => void
  onElegir: (id: string | null) => void
}
const Paquete = memo(function Paquete({ pieza: p, obra, nr, nivel, t, onEnfocar, onElegir }: PaqueteProps) {
  const caps = capturasDe(obra)
  const etiqueta = t.mesa.paquete(obra.name, p.grupo)
  return (
    <div
      className="c-paq"
      data-paq={p.id}
      data-copia={p.copia > 0 || undefined}
      role="group"
      aria-label={p.copia > 0 ? `${etiqueta} (${t.mesa.copia})` : etiqueta}
      tabIndex={0}
      style={{ width: p.w, height: p.h }}
      onFocus={() => onEnfocar(p)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          onElegir(p.id)
        }
      }}
    >
      <div className="c-paq__slides">
        {caps.map((c, i) => (
          <span key={`${c.vista}-${c.vp}`} className={`c-sd c-sd--${c.vp}`} data-sd={i} data-vuelo={`${obra.slug}:${c.vista}-${c.vp}`}>
            <Lod slug={obra.slug} c={c} nivel={nivel} alt={t.capturaAlt(obra.name, t.vistas[c.vista], t.vps[c.vp], SHOT_DATE)} />
          </span>
        ))}
      </div>
      <p className="c-paq__cod" aria-hidden="true">
        <span data-et="" className="c-paq__izq">
          <b>Nº {nr}</b> · {obra.name}
        </span>
        <span data-et="" className="c-paq__der">
          {SHOT_DATE}
        </span>
      </p>
    </div>
  )
})

/* ---- el visor: la diapositiva elegida a su tamaño, con los tres niveles de detalle a la vista ---- */
function Visor({ paq, obra, nr, caps, dia, onDia, onCerrar, onEnfocar }: { paq: string; obra: Obra; nr: string; caps: Captura[]; dia: number; onDia: (i: number) => void; onCerrar: () => void; onEnfocar: () => void }) {
  const { t } = useC()
  const [lod, setLod] = useState<Nivel>(2)
  const c = caps[dia]
  const { w, h } = SHOT_SIZE[c.vp]
  const el = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => void gsap.from(el.current, { opacity: 0, x: -16, duration: 0.28, ease: 'power3.out', clearProps: 'opacity,transform' }), el)
    return () => ctx.revert()
  }, [])
  return (
    <aside className="c-visor" ref={el} aria-label={t.mesa.visorDe(obra.name)}>
      <header className="c-visor__cab c-mono">
        <span>
          <b>Nº {nr}</b> · {obra.name}
        </span>
        <button type="button" className="c-ctl" onClick={onCerrar} aria-label={t.mesa.soltar}>
          <span aria-hidden="true">×</span>
        </button>
      </header>
      <div className="c-visor__vistas" role="group" aria-label={t.mesa.vistasDe}>
        {caps.map((cp, i) => (
          <button key={`${cp.vista}-${cp.vp}`} type="button" className="c-chip c-chip--btn" aria-pressed={i === dia} onClick={() => onDia(i)}>
            <span>
              {t.pieVista[cp.vista]} · {t.vps[cp.vp]}
            </span>
          </button>
        ))}
      </div>
      <div className="c-visor__pic" style={{ ['--asp' as string]: w / h }}>
        <Lod slug={obra.slug} c={c} nivel={lod} alt={t.capturaAlt(obra.name, t.vistas[c.vista], t.vps[c.vp], SHOT_DATE)} />
      </div>
      <p className="c-visor__pie c-mono">
        <span>
          LOD {lod} · {lod === 2 ? `${w}×${h}` : `${LOD_ANCHO[lod][c.vp]} px`}
        </span>
        <span>{SHOT_DATE}</span>
      </p>
      <div className="c-visor__lod" role="group" aria-label={t.mesa.nivel}>
        {([0, 1, 2] as Nivel[]).map((n) => (
          <button key={n} type="button" className="c-chip c-chip--btn" aria-pressed={lod === n} onClick={() => setLod(n)}>
            <span>{n === 2 ? `2 · ${t.mesa.original}` : `${n} · ${LOD_ANCHO[n][c.vp]} px`}</span>
          </button>
        ))}
      </div>
      <div className="c-visor__acc">
        <button type="button" className="c-btn c-btn--linea" onClick={onEnfocar}>
          {t.mesa.enfocar}
        </button>
        <Link className="c-btn c-btn--tinta" to={v5path('c', 'obra', obra.slug)} state={{ desde: 'mesa' }} onClick={() => prepararVuelo(obra.slug, paq)}>
          {t.mesa.abrirFicha}
          <Flecha />
        </Link>
      </div>
    </aside>
  )
}
