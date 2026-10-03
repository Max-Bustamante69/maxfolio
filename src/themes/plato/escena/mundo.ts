import {
  ACESFilmicToneMapping, AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry, CircleGeometry, Color, CylinderGeometry, DirectionalLight, DoubleSide,
  FogExp2, Group, HemisphereLight, ImageBitmapLoader, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry,
  Points, PointsMaterial, RingGeometry, Scene, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader, Vector3, WebGLRenderer,
} from 'three'
import { control, type Objetivo } from './control'
import { SETS, tex, type SetDef } from './sets'
import { TINTES } from './tintes'

// El plató: una sala negra con niebla, 19 sets (una pantalla real con su cono de luz y su charco) y una plataforma con anillos para la ficha.
// Todo procedural (0 GLB, 0 audio), un solo renderer, SIN lazo de render: se dibuja mientras la cámara se mueve y se detiene al llegar
// (frameloop «a demanda»; cero fotogramas en reposo). Medidas del look-dev de estilo/plato/lookdev (ESTILO.md §6.4).

const MED = { W: 6.4, H: 4.0, Y: 2.7 }
const PLATO = '#0a0b0d'
const TUNGSTENO = '#f2b04e'
/** El escenario del pedestal queda aparte del pasillo, al este: la cámara cruza en grúa por encima de los sets. */
const ESCENARIO = { x: 46, z: -60 }
const N = SETS.length
const REL_STAGE = { pos: [3.0, 1.85, 6.4], look: [-2.0, 1.85, 0], fov: 30 } // cámara respecto del pedestal (look-dev)

type V3 = [number, number, number]
interface Pose { pos: V3; look: V3; fov: number }
const POSTER: Pose = { pos: [-1.5, 1.5, 9.5], look: [-0.6, 5.0, -22], fov: 34 }
/** Póster vertical (solo para el cartel del móvil, que no carga el 3D): al lado del primer set, con su cono arriba y el corredor al fondo. */
const POSTER_M: Pose = { pos: [-3.4, 1.8, -3.2], look: [-6.2, 2.5, -13], fov: 52 }
const estacion = (k: number): Pose => { const s = SETS[Math.max(0, Math.min(N - 1, k))]; return { pos: [0.06 * s.x, 1.75, s.z + 16], look: [0.52 * s.x, 2.45, s.z], fov: 31 } }

/** Las capturas son la prueba: la niebla y el cono les quitan ~10 %, así que se compensa (los sets vecinos esperan un poco por debajo del activo). */
const BRILLO = (luz: number) => 0.86 + 0.26 * Math.min(1, luz)
const acota = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const suave = (a: number, b: number, x: number) => { const t = acota((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const mezcla = (a: Pose, b: Pose, k: number): Pose => ({
  pos: [a.pos[0] + (b.pos[0] - a.pos[0]) * k, a.pos[1] + (b.pos[1] - a.pos[1]) * k, a.pos[2] + (b.pos[2] - a.pos[2]) * k],
  look: [a.look[0] + (b.look[0] - a.look[0]) * k, a.look[1] + (b.look[1] - a.look[1]) * k, a.look[2] + (b.look[2] - a.look[2]) * k],
  fov: a.fov + (b.fov - a.fov) * k,
})
/** Meseta: la cámara se detiene en cada estación (0 hasta 0,3 · salto suave · 1 desde 0,7). */
const meseta = (f: number) => { const x = acota((f - 0.3) / 0.4); return x * x * x * (x * (x * 6 - 15) + 10) }

const col = (h: string) => new Color(h)
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}'

interface Elemento { def: SetDef | null; grupo: Group; cuerpo: Group; pantalla: MeshBasicMaterial; espejo: ShaderMaterial; cono: ShaderMaterial; charco: ShaderMaterial; luz: Luz; clave: string | null }
interface Luz { v: number; de: number; a: number; t0: number; dur: number }

export interface Mundo { pedir: () => void; tam: (w: number, h: number) => void; dispose: () => void }
export interface Ganchos { alListo: () => void; alFallo: () => void }

export function crearMundo(canvas: HTMLCanvasElement, g: Ganchos): Mundo {
  performance.mark('pl-mundo-ini')
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false })
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  renderer.setPixelRatio(dpr)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  const scene = new Scene()
  scene.background = col(PLATO)
  scene.fog = new FogExp2(col('#0b0c0f'), 0.022)
  scene.add(new HemisphereLight(0x8892a8, 0x050506, 0.18))
  const rim = new DirectionalLight(0xffc98a, 0.55)
  rim.position.set(8, 9, 14)
  scene.add(rim)

  const camara = new PerspectiveCamera(30, 1, 0.1, 320)
  const aborrar: Array<{ dispose: () => void }> = []
  const reg = <T extends { dispose: () => void }>(x: T) => { aborrar.push(x); return x }

  // ---------- texturas bajo demanda (WebP reducidos de las capturas reales), sin bloquear el hilo principal ----------
  const cache = new Map<string, Texture>()
  const pidiendo = new Map<string, Array<(t: Texture) => void>>()
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  const bitmap = typeof createImageBitmap === 'function' ? new ImageBitmapLoader().setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' }) : null
  const clasico = new TextureLoader()
  let pendientes = 0
  const cargar = (url: string, listo: (t: Texture) => void) => {
    const hit = cache.get(url)
    if (hit) { listo(hit); return }
    const fila = pidiendo.get(url)
    if (fila) { fila.push(listo); return }
    pidiendo.set(url, [listo])
    pendientes++
    const fin = (t: Texture) => {
      t.colorSpace = SRGBColorSpace
      t.anisotropy = aniso
      if (bitmap) t.flipY = false
      t.needsUpdate = true
      cache.set(url, t)
      pidiendo.get(url)?.forEach((f) => f(t))
      pidiendo.delete(url)
      pendientes--
      pedir()
    }
    const mal = () => { pidiendo.delete(url); pendientes--; pedir() }
    if (bitmap) bitmap.load(url, (b) => fin(new Texture(b as unknown as HTMLImageElement)), undefined, mal)
    else clasico.load(url, fin, undefined, mal)
  }
  const soltar = (url: string) => { const t = cache.get(url); if (t) { t.dispose(); cache.delete(url) } }

  // ---------- geometrías y materiales compartidos ----------
  const negro = reg(new MeshStandardMaterial({ color: col('#050506'), roughness: 0.5, metalness: 0.6 }))
  const marcoMat = reg(new MeshStandardMaterial({ color: col('#08090b'), roughness: 0.4, metalness: 0.7 }))
  const filoMat = reg(new MeshBasicMaterial({ color: col(TUNGSTENO), toneMapped: false }))
  const geoMarco = reg(new BoxGeometry(MED.W + 0.22, MED.H + 0.22, 0.16))
  const geoPantalla = reg(new PlaneGeometry(MED.W, MED.H))
  const geoFilo = reg(new BoxGeometry(MED.W + 0.24, 0.02, 0.18))
  const geoPata = reg(new BoxGeometry(0.1, MED.Y - MED.H / 2, 0.1))
  const geoLata = reg(new CylinderGeometry(0.3, 0.38, 0.5, 24))
  const geoCono = reg(new CylinderGeometry(0.22, 4.1, 8.4, 40, 1, true))
  const geoCharco = reg(new CircleGeometry(5.6, 48))

  const matCono = (c: string, k: number) => reg(new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, fog: false,
    uniforms: { c: { value: col(c) }, k: { value: k } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vH; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vH = uv.y; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 c; uniform float k; varying vec3 vN; varying vec3 vV; varying float vH; void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.4); float h = pow(vH,1.3)*smoothstep(0.0,0.06,vH)*(1.0-smoothstep(0.97,1.0,vH)); gl_FragColor = vec4(c*k*f*h, 1.0);\n#include <colorspace_fragment>\n}',
  }))
  const matCharco = (c: string, k: number) => reg(new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending, fog: false,
    uniforms: { c: { value: col(c) }, k: { value: k } },
    vertexShader: VERT,
    fragmentShader: 'uniform vec3 c; uniform float k; varying vec2 vUv; void main(){ float d = distance(vUv, vec2(0.5))*2.0; float a = pow(1.0-smoothstep(0.0,1.0,d), 2.2)*0.26*k; gl_FragColor = vec4(c*a,1.0);\n#include <colorspace_fragment>\n}',
  }))
  const matEspejo = () => reg(new ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: { map: { value: null }, k: { value: 0.4 } },
    vertexShader: VERT,
    fragmentShader: 'uniform sampler2D map; uniform float k; varying vec2 vUv; void main(){ vec4 t = texture2D(map, vUv); float a = k*pow(vUv.y,2.4); gl_FragColor = vec4(t.rgb, a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
  }))

  // ---------- suelo pulido, cielo, cerchas y polvo ----------
  const suelo = new Mesh(reg(new PlaneGeometry(240, 340)), reg(new MeshStandardMaterial({ color: col('#0c0d10'), roughness: 0.38, metalness: 0.1, transparent: true, opacity: 0.86 })))
  suelo.rotation.x = -Math.PI / 2
  suelo.position.set(20, 0, -95)
  scene.add(suelo)
  const cielo = new Mesh(reg(new PlaneGeometry(260, 60)), reg(new ShaderMaterial({
    fog: false, depthWrite: false, transparent: true,
    uniforms: { c: { value: col('#15171c') } },
    vertexShader: VERT,
    fragmentShader: 'uniform vec3 c; varying vec2 vUv; void main(){ float a = smoothstep(0.0,0.55,vUv.y)*(1.0-smoothstep(0.55,1.0,vUv.y))*0.55; gl_FragColor = vec4(c, a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
  })))
  cielo.position.set(10, 14, -200)
  scene.add(cielo)
  const geoCercha = reg(new BoxGeometry(0.12, 0.12, 230))
  for (const x of [0, -13.2, 13.2]) { const c = new Mesh(geoCercha, negro); c.position.set(x, 8.4, -85); scene.add(c) }
  const polvo = (n: number, caja: { x: number; y: number; z: number; w: number; h: number; d: number }, semilla: number) => {
    const pos = new Float32Array(n * 3)
    let sd = semilla
    const r = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296)
    for (let i = 0; i < n; i++) { pos[i * 3] = caja.x + (r() - 0.5) * caja.w; pos[i * 3 + 1] = caja.y + r() * caja.h; pos[i * 3 + 2] = caja.z + (r() - 0.5) * caja.d }
    const geo = reg(new BufferGeometry())
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    scene.add(new Points(geo, reg(new PointsMaterial({ color: col('#ffe3b8'), size: 0.045, transparent: true, opacity: 0.55, depthWrite: false, blending: AdditiveBlending, fog: true }))))
  }
  polvo(900, { x: 0, y: 0.2, z: -80, w: 30, h: 9, d: 200 }, 7)
  polvo(180, { x: ESCENARIO.x, y: 0.2, z: ESCENARIO.z, w: 22, h: 9, d: 22 }, 11)

  // ---------- un set: marco, pantalla con la captura, filo de tungsteno, patas, espejo, charco, cono y foco ----------
  function construirSet(tinte: string): Elemento {
    const grupo = new Group()
    // El cuerpo (marco, pantalla, patas, espejo) se dibuja solo cerca; la luz (cono, charco y foco) se ve de lejos aunque la niebla se coma la pantalla.
    const cuerpo = new Group()
    grupo.add(cuerpo)
    const marco = new Mesh(geoMarco, marcoMat); marco.position.y = MED.Y; cuerpo.add(marco)
    const pantalla = reg(new MeshBasicMaterial({ color: col('#0d0e11'), toneMapped: false }))
    const p = new Mesh(geoPantalla, pantalla); p.position.set(0, MED.Y, 0.085); cuerpo.add(p)
    const filo = new Mesh(geoFilo, filoMat); filo.position.set(0, MED.Y + MED.H / 2 + 0.115, 0); cuerpo.add(filo)
    for (const px of [-1.9, 1.9]) { const pata = new Mesh(geoPata, negro); pata.position.set(px, (MED.Y - MED.H / 2) / 2, -0.16); cuerpo.add(pata) }
    const espejo = matEspejo()
    const esp = new Mesh(geoPantalla, espejo); esp.scale.y = -1; esp.position.set(0, -MED.Y, 0.085); cuerpo.add(esp)
    const charco = matCharco(col(tinte).lerp(col('#e8c9a0'), 0.5).getStyle(), 1)
    const ch = new Mesh(geoCharco, charco); ch.rotation.x = -Math.PI / 2; ch.position.set(0, 0.012, 3.6); grupo.add(ch)
    const cono = matCono('#ffe0b2', 0.085)
    const co = new Mesh(geoCono, cono); co.position.set(0, 8.4 / 2 + 0.05, 3.6); grupo.add(co)
    const lata = new Mesh(geoLata, negro); lata.position.set(0, 8.2, 3.6); grupo.add(lata)
    scene.add(grupo)
    return { def: null, grupo, cuerpo, pantalla, espejo, cono, charco, luz: { v: 0.8, de: 0.8, a: 0.8, t0: 0, dur: 1 }, clave: null }
  }
  const sets: Elemento[] = SETS.map((d) => {
    const e = construirSet(d.tinte)
    e.def = d
    e.grupo.position.set(d.x, 0, d.z)
    e.grupo.rotation.y = d.yaw
    return e
  })
  const asignar = (e: Elemento, url: string | null) => {
    if (e.clave === url) return
    e.clave = url
    if (!url) { e.pantalla.map = null; e.pantalla.color.set('#0d0e11'); e.pantalla.needsUpdate = true; e.espejo.uniforms.map.value = null; return }
    cargar(url, (t) => {
      if (e.clave !== url) return
      e.pantalla.map = t; e.pantalla.color.setScalar(e.def ? BRILLO(e.luz.v) : 1); e.pantalla.needsUpdate = true
      e.espejo.uniforms.map.value = t
    })
  }

  // ---------- el escenario del pedestal: una plataforma circular con anillos, el teléfono flotando y su pantalla de fondo ----------
  const fondo = construirSet('#e8c9a0')
  fondo.grupo.position.set(ESCENARIO.x - 5.0, 0, ESCENARIO.z - 8.6)
  fondo.grupo.rotation.y = 0.46
  const ped = new Group()
  ped.position.set(ESCENARIO.x, 0, ESCENARIO.z)
  const base = new Mesh(reg(new CylinderGeometry(1.5, 1.6, 0.16, 64)), reg(new MeshStandardMaterial({ color: col('#0e0f12'), roughness: 0.28, metalness: 0.5 })))
  base.position.y = 0.08; ped.add(base)
  const canto = new Mesh(reg(new RingGeometry(1.46, 1.5, 96)), reg(new MeshBasicMaterial({ color: col(TUNGSTENO), transparent: true, opacity: 0.85, toneMapped: false, side: DoubleSide })))
  canto.rotation.x = -Math.PI / 2; canto.position.y = 0.162; ped.add(canto)
  for (const [r, op] of [[2.0, 0.55], [2.7, 0.32], [3.5, 0.18]] as const) {
    const a = new Mesh(reg(new RingGeometry(r, r + 0.025, 128)), reg(new MeshBasicMaterial({ color: col(TUNGSTENO), transparent: true, opacity: op, toneMapped: false, side: DoubleSide })))
    a.rotation.x = -Math.PI / 2; a.position.y = 0.014; ped.add(a)
  }
  const charcoPed = matCharco('#ffc98a', 1)
  const poolPed = new Mesh(reg(new CircleGeometry(4.2, 48)), charcoPed); poolPed.rotation.x = -Math.PI / 2; poolPed.position.y = 0.02; ped.add(poolPed)
  const conoPed = matCono('#ffe6c2', 0.085)
  const cp = new Mesh(reg(new CylinderGeometry(0.2, 2.1, 8.0, 40, 1, true)), conoPed); cp.position.y = 4.0; ped.add(cp)
  const tel = new Group(); tel.position.y = 1.55; tel.rotation.y = -0.5
  tel.add(new Mesh(reg(new BoxGeometry(0.86, 1.82, 0.07)), reg(new MeshStandardMaterial({ color: col('#0a0a0c'), roughness: 0.25, metalness: 0.85 }))))
  const geoPant = reg(new PlaneGeometry(0.8, 1.74))
  const pantTel = reg(new MeshBasicMaterial({ color: col('#0d0e11'), toneMapped: false }))
  const pt = new Mesh(geoPant, pantTel); pt.position.z = 0.037; tel.add(pt)
  ped.add(tel)
  const espejoTel = matEspejo()
  const et = new Mesh(geoPant, espejoTel); et.scale.y = -1; et.position.set(0, -1.55, 0.037); et.rotation.y = -0.5; ped.add(et)
  scene.add(ped)
  let claveTel: string | null = null
  const asignarTel = (url: string | null) => {
    if (claveTel === url) return
    claveTel = url
    if (!url) { pantTel.map = null; pantTel.needsUpdate = true; espejoTel.uniforms.map.value = null; return }
    cargar(url, (t) => { if (claveTel !== url) return; pantTel.map = t; pantTel.color.set('#ffffff'); pantTel.needsUpdate = true; espejoTel.uniforms.map.value = t })
  }
  const luzPed: Luz = { v: 0, de: 0, a: 0, t0: 0, dur: 1 }
  let slugPed: string | null = null

  // ---------- estado de cámara (todo amortiguado) ----------
  const cur = { ap: 0, t: 0, m: 0 }
  let primero = true
  let ult = performance.now()
  let raf = 0
  let activa = -1
  let vivo = true
  let lentos = 0
  const _p = new Vector3()
  const mirar = new Vector3()
  let ancho = 1
  let alto = 1
  let listoAvisado = false

  const poseObjetivo = (): Pose => {
    const base = control.obj.modo === 'poster' ? mezcla(ancho / alto < 0.9 ? POSTER_M : POSTER, estacion(0), suave(0, 1, cur.ap)) : (() => {
      const tc = acota(cur.t, 0, N - 1)
      const i = Math.min(N - 2, Math.floor(tc))
      return mezcla(estacion(i), estacion(i + 1), meseta(tc - i))
    })()
    if (cur.m < 0.0005) return base
    // Grúa hasta el pedestal: la cámara sube por encima de los sets, cruza la niebla y rodea la plataforma (el giro se recoge al llegar).
    const e = cur.m * cur.m * (3 - 2 * cur.m)
    const ang = (1 - e) * -1.15
    const cs = Math.cos(ang), sn = Math.sin(ang)
    const rot = (v: V3): V3 => [v[0] * cs + v[2] * sn, v[1], -v[0] * sn + v[2] * cs]
    const rp = rot(REL_STAGE.pos as V3), rl = rot(REL_STAGE.look as V3)
    const dest: Pose = { pos: [ESCENARIO.x + rp[0], rp[1], ESCENARIO.z + rp[2]], look: [ESCENARIO.x + rl[0], rl[1], ESCENARIO.z + rl[2]], fov: REL_STAGE.fov }
    const m = mezcla(base, dest, e)
    // La mirada llega antes que el cuerpo: la cámara ya apunta a la luz del pedestal mientras cruza la niebla (no hay tramo a ciegas).
    const el = suave(0, 0.5, cur.m)
    for (let i = 0; i < 3; i++) m.look[i] = base.look[i] + (dest.look[i] - base.look[i]) * el
    const lift = Math.sin(Math.PI * cur.m)
    m.pos[1] += lift * 6
    m.look[1] += lift * 1.6
    return m
  }

  const encender = (l: Luz, a: number, dur = 380) => { l.de = l.v; l.a = a; l.t0 = performance.now(); l.dur = dur }
  const avanzaLuz = (l: Luz, ahora: number) => {
    if (l.v === l.a) return false
    const x = acota((ahora - l.t0) / l.dur)
    const fac = 1 - Math.pow(1 - x, 3)
    const bump = l.a > l.de ? 0.35 * Math.sin(Math.PI * x) : 0
    l.v = x >= 1 ? l.a : l.de + (l.a - l.de) * fac + bump
    return x < 1
  }

  // Las texturas se piden por cercanía: ±3 lotes de la cámara; las demás se sueltan para no acumular memoria de GPU.
  function asegurar() {
    const o = control.obj
    const centro = o.modo === 'poster' ? 2 : Math.round(acota(cur.t, 0, N - 1))
    const radio = o.modo === 'poster' ? 2.5 : 3
    sets.forEach((e, i) => {
      const cerca = Math.abs(i - centro) <= radio
      if (cerca && cur.m < 0.9) asignar(e, tex(e.def!.slug, 'hd'))
      else if (Math.abs(i - centro) > radio + 3 && e.clave) { const k = e.clave; asignar(e, null); soltar(k) }
    })
    if (o.slug !== slugPed) {
      slugPed = o.slug
      encender(luzPed, 0, 1); luzPed.v = 0; encender(luzPed, 1, 520)
      // El charco de la plataforma toma el color de la obra, mezclado con luz cálida (la marca colorea el suelo, nunca el cono).
      const t = col(TINTES[o.slug ?? ''] ?? '#e8c9a0').lerp(col('#e8c9a0'), 0.5)
      charcoPed.uniforms.c.value.copy(t)
      fondo.charco.uniforms.c.value.copy(t)
    }
    if (o.slug && (o.modo === 'pedestal' || cur.m > 0.02)) {
      asignar(fondo, tex(o.slug, o.vista === 'pdp' ? 'pd' : 'hd'))
      asignarTel(tex(o.slug, o.vista === 'pdp' ? 'pm' : 'hm'))
    }
  }

  function proyectar(e: Elemento, lado: number, pantallaX: number, pantallaY: number) {
    // Esquina interior superior de la pantalla del set activo y su caja, en píxeles de la ventana.
    e.grupo.updateMatrixWorld()
    const pts: Array<[number, number]> = []
    let delante = true
    for (const [sx, sy] of [[-1, 1], [1, 1], [1, -1], [-1, -1]] as const) {
      _p.set((sx * MED.W) / 2, MED.Y + (sy * MED.H) / 2, 0.1).applyMatrix4(e.grupo.matrixWorld).project(camara)
      if (_p.z > 1) delante = false
      pts.push([(_p.x * 0.5 + 0.5) * pantallaX, (-_p.y * 0.5 + 0.5) * pantallaY])
    }
    const ix = lado > 0 ? pts[0] : pts[1] // set a la derecha → esquina izquierda; set a la izquierda → esquina derecha
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
    return { x: ix[0], y: ix[1], ok: delante, caja: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as [number, number, number, number] }
  }

  function tick() {
    raf = 0
    if (!vivo) return
    const ahora = performance.now()
    const dt = Math.min(0.1, (ahora - ult) / 1000)
    const o: Objetivo = control.obj
    const tm = o.modo === 'pedestal' ? 1 : 0
    const mover = (a: number, b: number, lam: number) => (primero ? b : a + (b - a) * (1 - Math.exp(-lam * dt)))
    cur.ap = mover(cur.ap, o.apertura, 6)
    cur.t = mover(cur.t, o.t, 7)
    cur.m = mover(cur.m, tm, 4.2)
    const enMarcha = Math.abs(cur.ap - o.apertura) > 0.0008 || Math.abs(cur.t - o.t) > 0.0008 || Math.abs(cur.m - tm) > 0.0008
    if (!enMarcha) { cur.ap = o.apertura; cur.t = o.t; cur.m = tm }

    // La estación activa: la cuenta de lotes y el foco que se enciende.
    const nueva = o.modo === 'pedestal' ? -1 : o.modo === 'poster' ? 0 : Math.round(acota(cur.t, 0, N - 1))
    if (nueva !== activa) {
      activa = nueva
      sets.forEach((e, i) => encender(e.luz, o.modo === 'poster' ? 0.85 : i === nueva ? 1 : 0.5))
      if (o.modo === 'recorrido') control.alEstacion?.(nueva)
    }
    asegurar()

    const p = poseObjetivo()
    camara.position.set(...p.pos)
    mirar.set(...p.look)
    camara.lookAt(mirar)
    const a = ancho / alto
    // Un solo encuadre horizontal para todos los anchos (el del póster a 1,6:1): en pantallas más anchas se recorta arriba y abajo, como un object-fit: cover.
    camara.fov = a > 1.6 ? (2 * Math.atan((Math.tan((p.fov * Math.PI) / 360) * 1.6) / a) * 180) / Math.PI : p.fov
    camara.aspect = a
    camara.updateProjectionMatrix()
    camara.updateMatrixWorld()

    let luces = false
    sets.forEach((e) => {
      if (avanzaLuz(e.luz, ahora)) luces = true
      e.cono.uniforms.k.value = 0.085 * e.luz.v
      e.charco.uniforms.k.value = e.luz.v
      // El set encendido se ve a todo color; los demás esperan un poco por debajo (la luz dirige la mirada).
      if (e.pantalla.map) e.pantalla.color.setScalar(BRILLO(e.luz.v))
    })
    if (avanzaLuz(luzPed, ahora)) luces = true
    const lp = luzPed.v * suave(0.02, 0.5, cur.m)
    conoPed.uniforms.k.value = 0.085 * lp
    charcoPed.uniforms.k.value = lp
    fondo.cono.uniforms.k.value = 0.085 * lp
    fondo.charco.uniforms.k.value = lp

    // Visibilidad: lo que está fuera de la vista no se dibuja (el mundo es largo).
    ped.visible = fondo.grupo.visible = cur.m > 0.02
    // Más allá de ~80 m la niebla se come la pantalla (98 %): solo se dibuja su luz. El pasillo es largo y esto lo deja en ~110 llamadas con el fondo intacto.
    sets.forEach((e) => {
      const d2 = e.grupo.position.distanceToSquared(camara.position)
      e.grupo.visible = cur.m < 0.98
      e.cuerpo.visible = d2 < 6400
    })

    renderer.render(scene, camara)

    // Gobernador de DPR: tres fotogramas lentos seguidos en movimiento bajan la resolución interna (1,5 → 1 → 0,75).
    if (enMarcha && !primero) {
      lentos = dt * 1000 > 24 ? lentos + 1 : 0
      if (lentos >= 3 && dpr > 0.75) { dpr = dpr > 1 ? 1 : 0.75; renderer.setPixelRatio(dpr); renderer.setSize(ancho, alto, false); lentos = 0 }
    }

    // Anclas del rótulo del set activo (solo mientras se mueve o al asentar).
    if (control.alAncla) {
      const e = o.modo === 'recorrido' ? sets[nueva] : o.modo === 'poster' ? sets[0] : null
      if (e && e.def && ancho > 0) {
        const lado = e.def.x < 0 ? -1 : 1
        const pr = proyectar(e, lado, ancho, alto)
        const dist = Math.abs(cur.t - Math.round(cur.t))
        const alfa = o.modo === 'recorrido' ? 1 - suave(0.14, 0.3, dist) : 0
        control.alAncla({ ...pr, ok: pr.ok && cur.m < 0.01, a: alfa, lado })
      } else control.alAncla({ x: 0, y: 0, ok: false, a: 0, lado: 1, caja: [0, 0, 0, 0] })
    }

    if (primero) performance.mark('pl-mundo-1er-fotograma')
    primero = false
    ult = ahora
    if (!listoAvisado && pendientes === 0) { listoAvisado = true; g.alListo() }
    if (enMarcha || luces || pendientes > 0) raf = requestAnimationFrame(tick)
  }

  function pedir() {
    if (!vivo || raf) return
    ult = performance.now() - 16
    raf = requestAnimationFrame(tick)
  }

  const perdido = (e: Event) => { e.preventDefault(); g.alFallo() }
  canvas.addEventListener('webglcontextlost', perdido)

  return {
    pedir,
    tam(w, h) {
      if (w < 2 || h < 2) return
      ancho = w; alto = h
      renderer.setSize(w, h, false)
      pedir()
    },
    dispose() {
      vivo = false
      if (raf) cancelAnimationFrame(raf)
      canvas.removeEventListener('webglcontextlost', perdido)
      cache.forEach((t) => t.dispose())
      cache.clear()
      aborrar.forEach((x) => x.dispose())
      scene.traverse((o) => { const m = (o as Mesh).material as Material | undefined; if (m && 'dispose' in m) m.dispose() })
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
