import {
  AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry, CircleGeometry, Color, CylinderGeometry, DirectionalLight, DoubleSide, EquirectangularReflectionMapping,
  FogExp2, Group, HemisphereLight, ImageBitmapLoader, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, NeutralToneMapping, Object3D, PerspectiveCamera,
  PlaneGeometry, PMREMGenerator, Points, PointsMaterial, RingGeometry, Scene, ShaderMaterial, SRGBColorSpace, Texture, TextureLoader, Vector3, WebGLRenderer,
} from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { control, type Objetivo } from './control'
import { altosFranjas, PANTALLAS, urlFranja } from './pantallas'
import { SETS, tex, type SetDef } from './sets'
import { crearTelefono } from './telefono'
import { TINTES } from './tintes'

// El plató: una sala negra con niebla, 19 sets (una pantalla real con su cono de luz y su charco) y un pedestal con anillos que SUBE DEL SUELO
// delante del set elegido: la pantalla del set se convierte en el teléfono (el teléfono nace en su centro y viaja al pedestal mientras la
// cámara entra), así la ficha es la misma sala y no otro lugar. El teléfono es un modelo propio (telefono.ts) con un HDRI de estudio CC0.
// Un solo renderer y SIN lazo perpetuo: cada estímulo (entrada, scroll, hover, puntero) da una ventana VIVO de reloj de pared a pleno ritmo,
// luego una cola ambiental a media tasa y después reposo = 0 fotogramas (storefront-3d-product-scene-standard §3 puntos 10 y 11).

const MED = { W: 6.4, H: 4.0, Y: 2.7 }
const PLATO = '#0a0b0d'
const TUNGSTENO = '#f2b04e'
const N = SETS.length
/** Ventana VIVO a pleno ritmo tras cada estímulo, y la cola ambiental a media tasa que la sigue. Después, ningún fotograma. */
const VIVO = 1200
const COLA = 1200
const ALT_TEL = 1.58 // altura del centro del teléfono sobre la plataforma
const DELANTE = 8.2 // el pedestal queda 8,2 m delante de la pantalla del set elegido

type V3 = [number, number, number]
interface Pose { pos: V3; look: V3; fov: number }
const POSTER: Pose = { pos: [-1.5, 1.5, 9.5], look: [-0.6, 5.0, -22], fov: 34 }
/** Póster vertical (solo para el cartel del móvil, que no carga el 3D): al lado del primer set, con su cono arriba y el corredor al fondo. */
const POSTER_M: Pose = { pos: [-3.4, 1.8, -3.2], look: [-6.2, 2.5, -13], fov: 52 }
const estacion = (k: number): Pose => { const s = SETS[Math.max(0, Math.min(N - 1, k))]; return { pos: [0.06 * s.x, 1.75, s.z + 16], look: [0.52 * s.x, 2.45, s.z], fov: 31 } }
/** Dónde se levanta el pedestal para la estación t (real): en el pasillo, delante de su set y 2,5 m hacia el eje, así el teléfono queda ante SU pantalla. */
const pedPos = (t: number): V3 => {
  const c = Math.max(0, Math.min(N - 1, t)); const i = Math.floor(c); const j = Math.min(N - 1, i + 1); const f = c - i
  const a = SETS[i], b = SETS[j]
  return [0.61 * (a.x * (1 - f) + b.x * f), 0, (a.z + DELANTE) * (1 - f) + (b.z + DELANTE) * f]
}
const poseEscenario = (t: number): Pose => { const p = pedPos(t); return { pos: [p[0] + 2.7, 1.9, p[2] + 5.5], look: [p[0] - 1.9, 1.7, p[2]], fov: 30 } }

/** Las capturas son la prueba: sin niebla encima, el set activo brilla un poco por encima del resto, que espera justo por debajo. */
const BRILLO = (luz: number) => 0.86 + 0.26 * Math.min(1, luz)
const acota = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const suave = (a: number, b: number, x: number) => { const t = acota((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const mezcla = (a: Pose, b: Pose, k: number): Pose => ({
  pos: [lerp(a.pos[0], b.pos[0], k), lerp(a.pos[1], b.pos[1], k), lerp(a.pos[2], b.pos[2], k)],
  look: [lerp(a.look[0], b.look[0], k), lerp(a.look[1], b.look[1], k), lerp(a.look[2], b.look[2], k)],
  fov: lerp(a.fov, b.fov, k),
})
/** Meseta: la cámara se detiene en cada estación (0 hasta 0,3 · salto suave · 1 desde 0,7). */
const meseta = (f: number) => { const x = acota((f - 0.3) / 0.4); return x * x * x * (x * (x * 6 - 15) + 10) }
const col = (h: string) => new Color(h)
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}'

interface Elemento { def: SetDef | null; grupo: Group; cuerpo: Group; pantalla: MeshBasicMaterial; espejo: ShaderMaterial; cono: ShaderMaterial; charco: ShaderMaterial; luz: Luz; clave: string | null }
interface Luz { v: number; de: number; a: number; t0: number; dur: number }
export interface InformeTextura { url: string; w: number; h: number; anisotropia: number; colorSpace: string; mipmaps: boolean }

export interface Mundo { pedir: () => void; estimulo: () => void; tam: (w: number, h: number) => void; dispose: () => void }
export interface Ganchos { alListo: () => void; alFallo: () => void }

export function crearMundo(canvas: HTMLCanvasElement, g: Ganchos): Mundo {
  performance.mark('pl-mundo-ini')
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false })
  // Escritorio: DPR hasta 2 (el gobernador lo baja si el equipo no da); nunca por debajo de 1.
  let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
  renderer.setPixelRatio(dpr)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NeutralToneMapping // Khronos PBR Neutral: el color de marca de la tienda y del titanio no se desatura
  renderer.toneMappingExposure = 1.0
  const scene = new Scene()
  scene.background = col(PLATO)
  scene.fog = new FogExp2(col('#0b0c0f'), 0.02)
  scene.add(new HemisphereLight(0x8892a8, 0x050506, 0.2))
  const rim = new DirectionalLight(0xffc98a, 0.5)
  rim.position.set(8, 9, 14)
  scene.add(rim)

  const camara = new PerspectiveCamera(30, 1, 0.1, 320)
  const aborrar: Array<{ dispose: () => void }> = []
  const reg = <T extends { dispose: () => void }>(x: T) => { aborrar.push(x); return x }

  // ---------- texturas bajo demanda: sRGB, anisotropía máxima, mipmaps, sin estirar; se informan para la sonda ----------
  const cache = new Map<string, Texture>()
  const pidiendo = new Map<string, Array<(t: Texture) => void>>()
  const aniso = renderer.capabilities.getMaxAnisotropy()
  const informe: Record<string, InformeTextura> = {}
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
      t.generateMipmaps = true
      if (bitmap) t.flipY = false
      t.needsUpdate = true
      cache.set(url, t)
      const im = t.image as { width: number; height: number }
      informe[url] = { url, w: im.width, h: im.height, anisotropia: t.anisotropy, colorSpace: t.colorSpace, mipmaps: t.generateMipmaps }
      pidiendo.get(url)?.forEach((f) => f(t))
      pidiendo.delete(url)
      pendientes--
      estimulo()
    }
    const mal = () => { pidiendo.delete(url); pendientes--; estimulo() }
    if (bitmap) bitmap.load(url, (b) => fin(new Texture(b as unknown as HTMLImageElement)), undefined, mal)
    else clasico.load(url, fin, undefined, mal)
  }
  const soltar = (url: string) => { const t = cache.get(url); if (t) { t.dispose(); cache.delete(url); delete informe[url] } }
  ;(window as unknown as { __pl3d?: unknown }).__pl3d = { texturas: () => Object.values(informe), dpr: () => dpr, anisotropiaMax: aniso, estado: () => ({ ...cur, giro: spin.activo, punt: { ...punt }, objetivo: { ...control.obj }, tel: tel.rotation.toArray().slice(0, 3), telPos: tel.position.toArray() }) }

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
    uniforms: { map: { value: null }, k: { value: 0.4 }, b: { value: 1 } },
    vertexShader: VERT,
    fragmentShader: 'uniform sampler2D map; uniform float k; uniform float b; varying vec2 vUv; void main(){ vec4 t = texture2D(map, vUv); float a = k*pow(vUv.y,2.4); gl_FragColor = vec4(t.rgb*b, a);\n#include <colorspace_fragment>\n}',
  }))

  // ---------- suelo pulido, cielo, cerchas y polvo (el orden de dibujo es explícito: suelo y reflejos, luces, y las pantallas al final) ----------
  const suelo = new Mesh(reg(new PlaneGeometry(240, 340)), reg(new MeshStandardMaterial({ color: col('#0c0d10'), roughness: 0.38, metalness: 0.1, transparent: true, opacity: 0.86, depthWrite: false })))
  suelo.rotation.x = -Math.PI / 2
  suelo.position.set(20, 0, -95)
  suelo.renderOrder = -3
  scene.add(suelo)
  const cielo = new Mesh(reg(new PlaneGeometry(260, 60)), reg(new ShaderMaterial({
    fog: false, depthWrite: false, transparent: true,
    uniforms: { c: { value: col('#15171c') } },
    vertexShader: VERT,
    fragmentShader: 'uniform vec3 c; varying vec2 vUv; void main(){ float a = smoothstep(0.0,0.55,vUv.y)*(1.0-smoothstep(0.55,1.0,vUv.y))*0.55; gl_FragColor = vec4(c, a);\n#include <colorspace_fragment>\n}',
  })))
  cielo.position.set(10, 14, -200)
  cielo.renderOrder = -2
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
    const p = new Points(geo, reg(new PointsMaterial({ color: col('#ffe3b8'), size: 0.045, transparent: true, opacity: 0.55, depthWrite: false, blending: AdditiveBlending, fog: true })))
    p.renderOrder = 0
    scene.add(p)
  }
  polvo(900, { x: 0, y: 0.2, z: -80, w: 30, h: 9, d: 200 }, 7)

  // ---------- un set: marco, pantalla con la captura, filo de tungsteno, patas, espejo, charco, cono y foco ----------
  function construirSet(tinte: string): Elemento {
    const grupo = new Group()
    const cuerpo = new Group()
    grupo.add(cuerpo)
    const marco = new Mesh(geoMarco, marcoMat); marco.position.y = MED.Y; cuerpo.add(marco)
    // Pantalla sin niebla y sin tone mapping: la captura se ve tal cual. Se dibuja DESPUÉS del cono (renderOrder 2): el cono no la vela.
    const pantalla = reg(new MeshBasicMaterial({ color: col('#0d0e11'), toneMapped: false, fog: false, transparent: true }))
    const p = new Mesh(geoPantalla, pantalla); p.position.set(0, MED.Y, 0.085); p.renderOrder = 2; cuerpo.add(p)
    const filo = new Mesh(geoFilo, filoMat); filo.position.set(0, MED.Y + MED.H / 2 + 0.115, 0); cuerpo.add(filo)
    for (const px of [-1.9, 1.9]) { const pata = new Mesh(geoPata, negro); pata.position.set(px, (MED.Y - MED.H / 2) / 2, -0.16); cuerpo.add(pata) }
    const espejo = matEspejo()
    const esp = new Mesh(geoPantalla, espejo); esp.scale.y = -1; esp.position.set(0, -MED.Y, 0.085); esp.renderOrder = -1; cuerpo.add(esp)
    const charco = matCharco(col(tinte).lerp(col('#e8c9a0'), 0.5).getStyle(), 1)
    const ch = new Mesh(geoCharco, charco); ch.rotation.x = -Math.PI / 2; ch.position.set(0, 0.012, 3.6); ch.renderOrder = 1; grupo.add(ch)
    const cono = matCono('#ffe0b2', 0.085)
    const co = new Mesh(geoCono, cono); co.position.set(0, 8.4 / 2 + 0.05, 3.6); co.renderOrder = 1; grupo.add(co)
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

  // ---------- el pedestal: plataforma con anillos de tungsteno, su cono y su charco; el teléfono flota encima ----------
  const ped = new Group()
  ped.visible = false
  const matBase = reg(new MeshStandardMaterial({ color: col('#0e0f12'), roughness: 0.28, metalness: 0.5 }))
  const base = new Mesh(reg(new CylinderGeometry(1.5, 1.6, 0.16, 64)), matBase)
  base.position.y = 0.08; ped.add(base)
  const matCanto = reg(new MeshBasicMaterial({ color: col(TUNGSTENO), transparent: true, opacity: 0.85, toneMapped: false, side: DoubleSide, fog: false }))
  const canto = new Mesh(reg(new RingGeometry(1.46, 1.5, 96)), matCanto)
  canto.rotation.x = -Math.PI / 2; canto.position.y = 0.162; ped.add(canto)
  const anillos: Array<{ m: MeshBasicMaterial; op: number }> = []
  for (const [r, op] of [[2.0, 0.55], [2.7, 0.32], [3.5, 0.18]] as const) {
    const m = reg(new MeshBasicMaterial({ color: col(TUNGSTENO), transparent: true, opacity: op, toneMapped: false, side: DoubleSide, fog: false }))
    const a = new Mesh(reg(new RingGeometry(r, r + 0.025, 128)), m)
    a.rotation.x = -Math.PI / 2; a.position.y = 0.014; ped.add(a)
    anillos.push({ m, op })
  }
  const charcoPed = matCharco('#ffc98a', 1)
  const poolPed = new Mesh(reg(new CircleGeometry(4.2, 48)), charcoPed); poolPed.rotation.x = -Math.PI / 2; poolPed.position.y = 0.02; poolPed.renderOrder = 1; ped.add(poolPed)
  const conoPed = matCono('#ffe6c2', 0.085)
  const cp = new Mesh(reg(new CylinderGeometry(0.2, 2.1, 8.0, 40, 1, true)), conoPed); cp.position.y = 4.0; cp.renderOrder = 1; ped.add(cp)
  // Sombra de contacto suave sobre la plataforma, bajo el teléfono flotante: se achica y se aclara cuando sube.
  const matSombra = reg(new ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: { a: { value: 0.5 } }, vertexShader: VERT,
    fragmentShader: 'uniform float a; varying vec2 vUv; void main(){ float d = distance(vUv, vec2(0.5))*2.0; float s = pow(1.0-smoothstep(0.0,1.0,d), 1.8); gl_FragColor = vec4(0.0,0.0,0.0,s*a); }',
  }))
  const sombra = new Mesh(reg(new CircleGeometry(1.0, 40)), matSombra); sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.175; sombra.renderOrder = 3; ped.add(sombra)
  // Luz de contorno tungsteno detrás-derecha del teléfono (marca el canto del titanio) y relleno frío a la izquierda.
  const contorno = new DirectionalLight(0xffb468, 2.6)
  const objContorno = new Object3D(); objContorno.position.set(0, ALT_TEL, 0)
  contorno.position.set(-2.4, 3.4, -3.6); contorno.target = objContorno
  const relleno = new DirectionalLight(0x9db4ff, 0.7)
  relleno.position.set(3.2, 2.2, 3.4); relleno.target = objContorno
  ped.add(contorno, relleno, objContorno)

  const telefono = crearTelefono()
  aborrar.push(telefono)
  const tel = new Group(); tel.add(telefono.grupo)
  tel.visible = false
  ped.add(tel)
  // El reflejo en el suelo: el mismo teléfono (comparte geometrías, materiales y pantalla) reflejado bajo la plataforma; el suelo, translúcido, lo tapa al 86 %.
  const espejoTel = new Group(); espejoTel.scale.y = -1
  const telEsp = new Group(); const telEspCuerpo = telefono.grupo.clone(true); telEsp.add(telEspCuerpo)
  espejoTel.add(telEsp); espejoTel.visible = false
  ped.add(espejoTel)
  scene.add(ped)

  // Entorno de estudio: HDRI CC0 (Poly Haven studio_small_09, 512×256) → PMREM, una sola vez; después se libera el equirrectangular.
  let envListo = false
  const cargarEnv = () => new Promise<void>((listo) => {
    new RGBELoader().load('/v5/plato/3d/studio_small_09_512.hdr', (hdr) => {
      hdr.mapping = EquirectangularReflectionMapping
      const pmrem = new PMREMGenerator(renderer)
      const env = pmrem.fromEquirectangular(hdr).texture
      hdr.dispose(); pmrem.dispose()
      telefono.aplicarEnv(env)
      matBase.envMap = env; matBase.envMapIntensity = 0.6; matBase.needsUpdate = true
      aborrar.push(env)
      envListo = true
      listo()
    }, undefined, () => { listo() /* sin entorno el teléfono sigue siendo legible: solo pierde reflejos */ })
  })

  // ---------- estado de cámara y del teléfono (todo amortiguado) ----------
  const cur = { ap: 0, t: 0, m: 0, sp: 0 }
  let primero = true
  let ult = performance.now()
  let raf = 0
  let activa = ''
  let vivo = true
  let lentos = 0
  let vivoHasta = 0
  let colaHasta = 0
  let salto = 0
  let vm = 0 // velocidad del muelle de la grúa
  const _p = new Vector3()
  const mirar = new Vector3()
  let ancho = 1
  let alto = 1
  let listoAvisado = false
  const punt = { x: 0, y: 0 }
  const spin = { activo: false, t0: 0, dur: 1000, cambiado: false }

  // El contenido de la pantalla del teléfono: la captura móvil del pliegue (mientras llega nada más) y, si la tienda la tiene, su home completa en franjas.
  const cont = { slug: null as string | null, vista: 'home' as 'home' | 'pdp', ficha: 0, franjasListas: false }
  const aplicarContenido = () => {
    const slug = cont.slug
    const ficha = ++cont.ficha
    cont.franjasListas = false
    if (!slug) { telefono.pantalla.imagen(null, 1688); return }
    const url = tex(slug, cont.vista === 'pdp' ? 'pm' : 'hm')
    cargar(url, (t) => { if (cont.ficha === ficha && !cont.franjasListas) telefono.pantalla.imagen(t, (t.image as { height: number }).height) })
    const info = PANTALLAS[slug]
    if (info && cont.vista === 'home') {
      const altos = altosFranjas(info.h)
      const ts: Texture[] = []
      let n = 0
      altos.forEach((_, i) => cargar(urlFranja(slug, i), (t) => {
        ts[i] = t
        if (++n === altos.length && cont.ficha === ficha) { cont.franjasListas = true; telefono.pantalla.franjas(ts, altos, info.h) }
      }))
    }
  }
  const liberarFranjas = (slug: string | null) => {
    if (!slug || !PANTALLAS[slug]) return
    altosFranjas(PANTALLAS[slug].h).forEach((_, i) => soltar(urlFranja(slug, i)))
  }

  const poseObjetivo = (): Pose => {
    const base = control.obj.modo === 'poster' ? mezcla(ancho / alto < 0.9 ? POSTER_M : POSTER, estacion(0), suave(0, 1, cur.ap)) : (() => {
      const tc = acota(cur.t, 0, N - 1)
      const i = Math.min(N - 2, Math.floor(tc))
      return mezcla(estacion(i), estacion(i + 1), meseta(tc - i))
    })()
    if (cur.m < 0.0005) return base
    // De la fachada al pedestal: la cámara se adelanta hacia la pantalla del set (entra en ella) y asienta junto a la plataforma.
    const e = suave(0, 1, cur.m)
    const dest = poseEscenario(cur.t)
    const a = base.pos, b = dest.pos
    const c: V3 = [lerp(a[0], b[0], 0.5), Math.max(a[1], b[1]) + 0.25, Math.min(a[2], b[2]) - 2.4] // punto de control: hacia el set
    const q = 1 - e
    const pos: V3 = [q * q * a[0] + 2 * q * e * c[0] + e * e * b[0], q * q * a[1] + 2 * q * e * c[1] + e * e * b[1], q * q * a[2] + 2 * q * e * c[2] + e * e * b[2]]
    const el = suave(0, 0.55, cur.m) // la mirada llega antes que el cuerpo
    const look: V3 = [lerp(base.look[0], dest.look[0], el), lerp(base.look[1], dest.look[1], el), lerp(base.look[2], dest.look[2], el)]
    return { pos, look, fov: lerp(base.fov, dest.fov, e) - 3.5 * Math.sin(Math.PI * e) }
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
  const luzPed: Luz = { v: 0, de: 0, a: 0, t0: 0, dur: 1 }
  let slugPed: string | null = null
  let vistaPed: 'home' | 'pdp' = 'home'

  // Las texturas de los sets se piden por cercanía: ±3 lotes de la cámara; las demás se sueltan para no acumular memoria de GPU.
  function asegurar() {
    const o = control.obj
    const centro = o.modo === 'poster' ? 2 : Math.round(acota(cur.t, 0, N - 1))
    const radio = o.modo === 'poster' ? 2.5 : 3
    sets.forEach((e, i) => {
      const cerca = Math.abs(i - centro) <= radio
      const activoPed = o.modo === 'pedestal' && !!o.slug && e.def!.slug === o.slug
      if (cerca) asignar(e, tex(e.def!.slug, activoPed && o.vista === 'pdp' ? 'pd' : 'hd'))
      else if (Math.abs(i - centro) > radio + 3 && e.clave) { const k = e.clave; asignar(e, null); soltar(k) }
    })
    if (o.slug !== slugPed) {
      const antes = slugPed
      slugPed = o.slug
      if (o.slug) {
        encender(luzPed, 0, 1); luzPed.v = luzPed.a = 0; encender(luzPed, 1, 520)
        // El charco de la plataforma toma el color de la obra, mezclado con luz cálida (la marca colorea el suelo, nunca el cono).
        charcoPed.uniforms.c.value.copy(col(TINTES[o.slug] ?? '#e8c9a0').lerp(col('#e8c9a0'), 0.5))
      }
      // Si ya estaba en el pedestal con otra obra: el teléfono da una vuelta y el contenido cambia cuando la trasera mira a cámara.
      if (antes && o.slug && cur.m > 0.5) { spin.activo = true; spin.t0 = performance.now(); spin.cambiado = false }
      else if (o.slug) { liberarFranjas(cont.slug); cont.slug = o.slug; cont.vista = o.vista; vistaPed = o.vista; aplicarContenido() }
    } else if (o.slug && o.vista !== vistaPed && !spin.activo) {
      vistaPed = o.vista; cont.vista = o.vista; aplicarContenido()
    }
    if (!o.slug && cur.m < 0.004 && cont.slug) { liberarFranjas(cont.slug); cont.slug = null; telefono.pantalla.imagen(null, 1688) }
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
  /** Caja del teléfono en pantalla (zona táctil del DOM). */
  function cajaTel() {
    tel.updateMatrixWorld(true)
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, delante = true
    const w = telefono.dim.w / 2, h = telefono.dim.h / 2, d = telefono.dim.d / 2
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      _p.set(sx * w, sy * h, sz * d).applyMatrix4(telefono.grupo.matrixWorld).project(camara)
      if (_p.z > 1) delante = false
      const px = (_p.x * 0.5 + 0.5) * ancho, py = (-_p.y * 0.5 + 0.5) * alto
      x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py)
    }
    return { ok: delante, caja: [x0, y0, x1, y1] as [number, number, number, number] }
  }

  function tick() {
    raf = 0
    if (!vivo) return
    const ahora = performance.now()
    // Cola ambiental: con nada moviéndose deprisa se pinta 1 de cada 2 fotogramas (sin avanzar el reloj en el saltado).
    if (ahora > vivoHasta && ahora <= colaHasta && (salto++ & 1)) { raf = requestAnimationFrame(tick); return }
    const dt = Math.min(0.1, (ahora - ult) / 1000)
    const o: Objetivo = control.obj
    const tm = o.modo === 'pedestal' ? 1 : 0
    const mover = (a: number, b: number, lam: number) => (primero ? b : a + (b - a) * (1 - Math.exp(-lam * dt)))
    cur.ap = mover(cur.ap, o.apertura, 6)
    cur.t = mover(cur.t, o.t, 7)
    // La grúa al pedestal es un muelle críticamente amortiguado: arranca suave (el teléfono nace sobre la pantalla del set), acelera y asienta sin rebote.
    if (primero) { cur.m = tm; vm = 0 } else {
      const w = 5.4, n = Math.max(1, Math.ceil(dt / 0.016)), hh = dt / n
      for (let i = 0; i < n; i++) { vm += (w * w * (tm - cur.m) - 2 * w * vm) * hh; cur.m += vm * hh }
    }
    cur.sp = mover(cur.sp, o.pantalla, 9)
    const pt = control.puntero
    punt.x = mover(punt.x, pt ? pt.x : 0, 6); punt.y = mover(punt.y, pt ? pt.y : 0, 6)
    let enMarcha = Math.abs(cur.ap - o.apertura) > 0.0008 || Math.abs(cur.t - o.t) > 0.0008 || Math.abs(cur.m - tm) > 0.0008 || Math.abs(vm) > 0.002 || Math.abs(cur.sp - o.pantalla) > 0.00012 ||
      Math.abs(punt.x - (pt ? pt.x : 0)) > 0.004 || Math.abs(punt.y - (pt ? pt.y : 0)) > 0.004 || spin.activo
    if (!enMarcha) { cur.ap = o.apertura; cur.t = o.t; cur.m = tm; cur.sp = o.pantalla; vm = 0 }

    // La estación activa: el foco que se enciende. En el pedestal el set elegido queda atenuado detrás, como telón.
    const nueva = (o.modo === 'pedestal' ? 'p' : o.modo === 'poster' ? 'q' : 'r') + (o.modo === 'poster' ? 0 : Math.round(acota(cur.t, 0, N - 1)))
    if (nueva !== activa) {
      activa = nueva
      const idx = Number(nueva.slice(1))
      sets.forEach((e, i) => encender(e.luz, o.modo === 'poster' ? 0.85 : o.modo === 'pedestal' ? (i === idx ? 0.5 : 0.3) : i === idx ? 1 : 0.5))
      if (o.modo === 'recorrido') control.alEstacion?.(idx)
    }
    asegurar()

    // El teléfono: nace en el centro de la pantalla del set, viaja al pedestal mientras la cámara entra, flota y se inclina.
    const m = cur.m
    const pp = pedPos(cur.t)
    ped.position.set(pp[0], 0, pp[2])
    ped.visible = espejoTel.visible = tel.visible = m > 0.012
    if (ped.visible) {
      const s = SETS[Math.round(acota(cur.t, 0, N - 1))]
      const u = suave(0.02, 0.9, m)
      const T = ahora / 1000
      const flote = Math.sin(T * 0.9) * 0.05 * u
      const alza = Math.sin(Math.PI * u) * 0.35
      tel.position.set(lerp(s.x - pp[0], 0, u), lerp(MED.Y, ALT_TEL, u) + flote + alza, lerp(s.z + 0.4 - pp[2], 0, u))
      let giro = 0
      if (spin.activo) {
        const x = acota((ahora - spin.t0) / spin.dur)
        giro = Math.PI * 2 * (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)
        if (x >= 0.5 && !spin.cambiado) { spin.cambiado = true; liberarFranjas(cont.slug); cont.slug = o.slug; cont.vista = o.vista; vistaPed = o.vista; if (o.slug) aplicarContenido() }
        if (x >= 1) { spin.activo = false; giro = 0 }
      }
      const yaw = lerp(s.yaw, -0.42, u) + Math.sin(T * 0.55) * 0.1 * u + punt.x * 0.38 + giro
      tel.rotation.set(Math.sin(T * 0.7) * 0.03 * u - punt.y * 0.2, yaw, Math.sin(T * 0.45) * 0.018 * u)
      const esc = lerp(2.2, 1, u) * suave(0, 0.2, m)
      tel.scale.setScalar(Math.max(0.0001, esc))
      telEsp.position.copy(tel.position); telEsp.rotation.copy(tel.rotation); telEsp.scale.copy(tel.scale)
      // Sombra de contacto: más chica y clara cuanto más alto flota.
      const alturaRel = (tel.position.y - ALT_TEL) * 3
      sombra.scale.setScalar((0.95 - alturaRel * 0.5) * suave(0.1, 0.9, m))
      matSombra.uniforms.a.value = (0.55 - alturaRel * 0.6) * suave(0.1, 0.9, m)
      // El pedestal sube del suelo y sus anillos se encienden.
      const sube = suave(0.12, 0.8, m)
      base.scale.y = Math.max(0.02, sube); base.position.y = 0.08 * base.scale.y
      matCanto.opacity = 0.85 * sube
      anillos.forEach((a) => { a.m.opacity = a.op * sube })
      // La pantalla del teléfono recorre la tienda con la lectura (amortiguada).
      telefono.pantalla.scroll(cur.sp * telefono.pantalla.rango())
      telefono.pantalla.brillo(0.35 + 0.65 * suave(0, 0.3, m))
    }

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
    const dimPed = 1 - 0.6 * suave(0.05, 0.85, cur.m) // en el pedestal los sets quedan de telón, atenuados
    sets.forEach((e) => {
      if (avanzaLuz(e.luz, ahora)) luces = true
      e.cono.uniforms.k.value = 0.085 * e.luz.v
      e.charco.uniforms.k.value = e.luz.v
      // Sin niebla: la pantalla se ve tal cual; solo se apaga con la distancia (los sets lejanos esperan en la oscuridad).
      const d = e.grupo.position.distanceTo(camara.position)
      const lejos = 1 - 0.9 * suave(34, 100, d)
      const b = BRILLO(e.luz.v) * lejos * dimPed
      if (e.pantalla.map) e.pantalla.color.setScalar(b)
      e.espejo.uniforms.b.value = b
    })
    if (avanzaLuz(luzPed, ahora)) luces = true
    const lp = luzPed.v * suave(0.02, 0.5, cur.m)
    conoPed.uniforms.k.value = 0.085 * lp
    charcoPed.uniforms.k.value = lp
    contorno.intensity = 2.6 * suave(0.1, 0.9, cur.m); relleno.intensity = 0.7 * suave(0.1, 0.9, cur.m)

    // Visibilidad: lo que está fuera de la vista no se dibuja (el mundo es largo).
    sets.forEach((e) => {
      const d2 = e.grupo.position.distanceToSquared(camara.position)
      e.grupo.visible = true
      e.cuerpo.visible = d2 < 10000
    })

    renderer.render(scene, camara)

    // Gobernador de DPR: tres fotogramas lentos seguidos en movimiento bajan la resolución interna (2 → 1,5 → 1 → 0,75).
    if (enMarcha && !primero) {
      lentos = dt * 1000 > 26 ? lentos + 1 : 0
      if (lentos >= 3 && dpr > 0.75) { dpr = dpr > 1.5 ? 1.5 : dpr > 1 ? 1 : 0.75; renderer.setPixelRatio(dpr); renderer.setSize(ancho, alto, false); lentos = 0 }
    }

    // Anclas del rótulo del set activo y caja del teléfono (solo se escriben al dibujar).
    if (control.alAncla) {
      const idx = Number(activa.slice(1))
      const e = o.modo === 'recorrido' ? sets[idx] : o.modo === 'poster' ? sets[0] : null
      if (e && e.def && ancho > 0) {
        const lado = e.def.x < 0 ? -1 : 1
        const pr = proyectar(e, lado, ancho, alto)
        const dist = Math.abs(cur.t - Math.round(cur.t))
        const alfa = o.modo === 'recorrido' ? 1 - suave(0.14, 0.3, dist) : 0
        control.alAncla({ ...pr, ok: pr.ok && cur.m < 0.01, a: alfa, lado })
      } else control.alAncla({ x: 0, y: 0, ok: false, a: 0, lado: 1, caja: [0, 0, 0, 0] })
    }
    if (control.alTelefono) control.alTelefono(o.modo === 'pedestal' && cur.m > 0.9 ? cajaTel() : { ok: false, caja: [0, 0, 0, 0] })

    if (primero) performance.mark('pl-mundo-1er-fotograma')
    primero = false
    ult = ahora
    if (!listoAvisado && pendientes === 0) { listoAvisado = true; g.alListo(); window.setTimeout(precalentar, 350) }
    // Lo que se mueve (cámara, luces, carga) abre la ventana VIVO; al asentar quedan el VIVO y la cola, y después nada.
    if (enMarcha || luces || pendientes > 0) estimuloInterno(ahora)
    if (ahora < colaHasta) raf = requestAnimationFrame(tick)
  }

  const estimuloInterno = (ahora: number) => { vivoHasta = Math.max(vivoHasta, ahora + VIVO); colaHasta = Math.max(colaHasta, vivoHasta + COLA) }
  /** Un estímulo: entrada, scroll, hover, rueda, carga de una textura. Abre la ventana VIVO de reloj de pared y despierta el lazo. */
  function estimulo() {
    if (!vivo) return
    estimuloInterno(performance.now())
    if (!raf) { ult = performance.now() - 16; raf = requestAnimationFrame(tick) }
  }
  function pedir() { estimulo() }

  // Precalentado: compila los shaders del teléfono y del pedestal ANTES de que el lector abra una ficha (sin tirón al empezar la grúa).
  async function precalentar() {
    if (!vivo) return
    await cargarEnv() // primero el entorno: así los shaders se compilan UNA vez, ya con el mapa de reflejos
    if (!vivo) return
    const antes = [ped.visible, tel.visible, espejoTel.visible] as const
    ped.visible = tel.visible = espejoTel.visible = true
    const escAnt = tel.scale.x; tel.scale.setScalar(0.001)
    try { await renderer.compileAsync(scene, camara) } catch { /* sin compilación asíncrona: se compila en el primer uso */ }
    tel.scale.setScalar(escAnt)
    ;[ped.visible, tel.visible, espejoTel.visible] = antes // sin estímulo: precalentar no mueve nada y no debe abrir una ventana VIVO
  }

  const perdido = (e: Event) => { e.preventDefault(); g.alFallo() }
  canvas.addEventListener('webglcontextlost', perdido)
  const unsubEst = control.subscribeEstimulo(estimulo)
  void envListo

  return {
    pedir,
    estimulo,
    tam(w, h) {
      if (w < 2 || h < 2) return
      ancho = w; alto = h
      renderer.setSize(w, h, false)
      pedir()
    },
    dispose() {
      vivo = false
      unsubEst()
      if (raf) cancelAnimationFrame(raf)
      canvas.removeEventListener('webglcontextlost', perdido)
      cache.forEach((t) => t.dispose())
      cache.clear()
      aborrar.forEach((x) => x.dispose())
      scene.traverse((o) => { const m = (o as Mesh).material as Material | undefined; if (m && 'dispose' in m) m.dispose() })
      renderer.dispose()
      renderer.forceContextLoss()
      delete (window as unknown as { __pl3d?: unknown }).__pl3d
    },
  }
}
