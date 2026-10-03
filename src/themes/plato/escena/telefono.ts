import {
  AdditiveBlending, CapsuleGeometry, CircleGeometry, Color, CylinderGeometry, DoubleSide, DynamicDrawUsage, ExtrudeGeometry, Group, InstancedMesh, Material,
  Matrix4, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, Object3D, ShaderMaterial, Shape, ShapeGeometry, Texture, TorusGeometry, Vector3, type BufferGeometry,
} from 'three'

// Un teléfono genérico, modelado a mano con las proporciones de uno actual (71,5 × 146,6 × 8,25 mm): marco metálico biselado,
// cristal frontal con clearcoat y bisel fino, pantalla con esquinas de radio, píldora frontal, botones laterales, USB-C y altavoces,
// trasera esmerilada con isla de cámara de tres lentes. Sin logotipo de marca. No se descargó ningún modelo: public/v5/plato/3d/LICENCIA.md
// explica la búsqueda y por qué se construyó. Unidades de modelado: milímetros, con el frente en +Z; el grupo exterior escala a la escena.

export const MM = { W: 71.5, H: 146.6, D: 8.25 }
/** Escala mm → unidades de la escena: el teléfono mide 0,86 de ancho (igual que el de la ronda anterior). */
export const K = 0.86 / MM.W
/** Pantalla visible (mm) con la proporción exacta de las capturas móviles (390 × 844): nada se estira. */
const PANT = { w: 65.0, h: 65.0 * (844 / 390) }

const rrect = (w: number, h: number, r: number, s = new Shape()) => {
  const x = -w / 2, y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return s
}
const extruido = (s: Shape, depth: number, bevel: number, segs = 6, curva = 28) =>
  new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: segs, curveSegments: curva })
/** UV 0..1 sobre la caja de la forma (ShapeGeometry trae las coordenadas crudas). */
const conUvDeCaja = (g: ShapeGeometry, w: number, h: number) => {
  const p = g.attributes.position, uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5)
  return g
}

export interface Pantalla {
  mat: ShaderMaterial
  /** Una sola imagen (la captura móvil de un pliegue). */
  imagen: (t: Texture | null, alto: number) => void
  /** Varias franjas de una misma página (franja i cubre las filas [i·4088, i·4088+alto_i)). */
  franjas: (ts: Texture[], altos: number[], total: number) => void
  /** Filas de página que la ventana del teléfono recorre: total − ventana. */
  rango: () => number
  scroll: (px: number) => void
  brillo: (b: number) => void
}

const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }'
// Tres muestreos incondicionales (derivadas bien definidas: nada de mip erróneo en el borde de una franja) y selección por fila de página.
const FRAG = /* glsl */ `
uniform sampler2D t0; uniform sampler2D t1; uniform sampler2D t2;
uniform vec3 uh; uniform float uN; uniform float uScroll; uniform float uWin; uniform float uTotal; uniform float uBri; uniform float uTiene; uniform vec3 uVacio;
varying vec2 vUv;
void main(){
  float r = clamp(uScroll + (1.0 - vUv.y) * uWin, 0.0, max(uTotal - 0.01, 0.0));
  float i = clamp(floor((r - 4.0) / 4088.0), 0.0, uN - 1.0);
  vec3 c0 = texture2D(t0, vec2(vUv.x, 1.0 - r / uh.x)).rgb;
  vec3 c1 = texture2D(t1, vec2(vUv.x, 1.0 - (r - 4088.0) / uh.y)).rgb;
  vec3 c2 = texture2D(t2, vec2(vUv.x, 1.0 - (r - 8176.0) / uh.z)).rgb;
  vec3 c = i < 0.5 ? c0 : (i < 1.5 ? c1 : c2);
  c = mix(uVacio, c, uTiene);
  gl_FragColor = vec4(c * uBri, 1.0);
  #include <colorspace_fragment>
}`

export interface Telefono {
  /** Grupo ya a escala de escena; el llamador lo mueve y lo gira. */
  grupo: Group
  /** Alto/ancho/fondo reales en unidades de escena. */
  dim: { w: number; h: number; d: number }
  pantalla: Pantalla
  aplicarEnv: (t: Texture | null, intensidad?: number) => void
  dispose: () => void
}

export function crearTelefono(): Telefono {
  const geos: BufferGeometry[] = []
  const mats: Material[] = []
  const fisicos: MeshPhysicalMaterial[] = []
  const g = <T extends BufferGeometry>(x: T) => { geos.push(x); return x }
  const fis = (p: ConstructorParameters<typeof MeshPhysicalMaterial>[0]) => { const m = new MeshPhysicalMaterial({ fog: false, ...p }); mats.push(m); fisicos.push(m); return m }
  const bas = (p: ConstructorParameters<typeof MeshBasicMaterial>[0]) => { const m = new MeshBasicMaterial({ fog: false, ...p }); mats.push(m); return m }

  // Materiales (titanio oscuro cepillado, cristal negro de clearcoat, trasera esmerilada, isla de vidrio pulido)
  const titanio = fis({ color: 0x7b7d83, metalness: 1, roughness: 0.3, envMapIntensity: 1.35 })
  const titanioOsc = fis({ color: 0x2c2d31, metalness: 0.9, roughness: 0.42, envMapIntensity: 1.0 })
  const aro = fis({ color: 0xb4b6bc, metalness: 1, roughness: 0.2, envMapIntensity: 1.5 })
  const vidrio = fis({ color: 0x040405, metalness: 0, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.7 })
  const trasera = fis({ color: 0x2a2b30, metalness: 0.1, roughness: 0.44, clearcoat: 0.4, clearcoatRoughness: 0.22, envMapIntensity: 1.05 })
  const isla = fis({ color: 0x121316, metalness: 0, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.6 })
  const lente = fis({ color: 0x020305, metalness: 0, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.01, envMapIntensity: 2.4 })
  const negroMate = bas({ color: 0x030304 })
  const pildoraLente = fis({ color: 0x0a0f1c, metalness: 0, roughness: 0.08, clearcoat: 1, envMapIntensity: 1.8 })
  // Reflejo sobre la pantalla: un cristal negro con brillo ADITIVO (solo suma el reflejo; la pantalla debajo sigue sin teñirse).
  const brillo = fis({ color: 0x000000, metalness: 0, roughness: 0.06, clearcoat: 0, envMapIntensity: 1.2, transparent: true, opacity: 0.3, blending: AdditiveBlending, depthWrite: false })

  // ---------------- pantalla (franjas de página con desplazamiento por filas, sin tone mapping, sin niebla) ----------------
  const pm = new ShaderMaterial({
    fog: false, toneMapped: false,
    uniforms: {
      t0: { value: null }, t1: { value: null }, t2: { value: null },
      uh: { value: new Vector3(1688, 1, 1) }, uN: { value: 1 }, uScroll: { value: 0 }, uWin: { value: 1688 }, uTotal: { value: 1688 },
      uBri: { value: 1 }, uTiene: { value: 0 }, uVacio: { value: new Color('#0d0e11') },
    },
    vertexShader: VERT, fragmentShader: FRAG,
  })
  mats.push(pm)
  const u = pm.uniforms
  const pantalla: Pantalla = {
    mat: pm,
    imagen(t, alto) {
      u.t0.value = t; u.t1.value = null; u.t2.value = null
      u.uh.value.set(alto || 1688, 1, 1); u.uN.value = 1; u.uTotal.value = alto || 1688; u.uWin.value = 1688; u.uTiene.value = t ? 1 : 0
    },
    franjas(ts, altos, total) {
      u.t0.value = ts[0] ?? null; u.t1.value = ts[1] ?? null; u.t2.value = ts[2] ?? null
      u.uh.value.set(altos[0] ?? 1, altos[1] ?? 1, altos[2] ?? 1); u.uN.value = ts.length; u.uTotal.value = total; u.uWin.value = 1688; u.uTiene.value = 1
    },
    rango: () => Math.max(0, u.uTotal.value - u.uWin.value),
    scroll(px) { u.uScroll.value = px },
    brillo(b) { u.uBri.value = b },
  }

  const raiz = new Group() // en mm
  const cuerpo = new Group()
  raiz.add(cuerpo)
  const add = (m: Mesh | Object3D) => { cuerpo.add(m); return m }

  // ---------------- marco: rectángulo redondeado extruido con bisel (el canto metálico) ----------------
  const BS = 1.35
  const prof = MM.D - 2 * BS
  const marcoGeo = g(extruido(rrect(MM.W, MM.H, 11.8), prof, BS, 9, 36))
  marcoGeo.translate(0, 0, -(MM.D / 2 - BS))
  add(new Mesh(marcoGeo, titanio))
  const zF = MM.D / 2 // plano de la cara frontal del marco
  const zB = -MM.D / 2

  // Cristal frontal (negro, con clearcoat) y trasero (esmerilado), sobre las tapas del marco
  const LAB = BS + 0.3
  const gw = MM.W - 2 * LAB, gh = MM.H - 2 * LAB
  const frontalGeo = g(extruido(rrect(gw, gh, 10.2), 0.18, 0.16, 4, 28))
  const frontal = new Mesh(frontalGeo, vidrio); frontal.position.z = zF - 0.08; add(frontal)
  const traseraGeo = g(extruido(rrect(gw, gh, 10.2), 0.18, 0.16, 4, 28))
  const tras = new Mesh(traseraGeo, trasera); tras.rotation.y = Math.PI; tras.position.z = zB + 0.08; add(tras)
  const zPant = zF + 0.28 + 0.08 // cara exterior del cristal frontal (≈ zF + 0.34)

  // Pantalla con esquinas de radio y el reflejo del cristal encima
  const pantGeo = g(conUvDeCaja(new ShapeGeometry(rrect(PANT.w, PANT.h, 9.2), 28), PANT.w, PANT.h))
  const pant = new Mesh(pantGeo, pm); pant.position.z = zPant + 0.06; add(pant) // los huecos entre capas (≥ 0,06 mm = 0,0007 u) bastan para el z-buffer a 7-15 m; sin polygonOffset (que se come a la píldora en ángulos rasantes)
  const bril = new Mesh(pantGeo, brillo); bril.position.z = zPant + 0.14; bril.renderOrder = 5; add(bril)

  // Píldora frontal genérica (cámara + sensores) a 3,2 mm del borde de la pantalla
  const yPill = PANT.h / 2 - 3.1 - 3.4
  const pilGeo = g(new ShapeGeometry(rrect(22.4, 6.8, 3.4), 20))
  const pil = new Mesh(pilGeo, negroMate); pil.position.set(0, yPill, zPant + 0.22); pil.renderOrder = 6; add(pil)
  const ojoGeo = g(new CircleGeometry(1.15, 24))
  const ojo = new Mesh(ojoGeo, pildoraLente); ojo.position.set(6.2, yPill, zPant + 0.26); ojo.renderOrder = 7; add(ojo)

  // Botones laterales (acción, volumen ×2 a la izquierda; encendido a la derecha)
  const botones: Array<[number, number, number]> = [[-1, 47, 8], [-1, 31, 13], [-1, 13, 13], [1, 28, 19]]
  for (const [lado, y, largo] of botones) {
    const cg = g(new CapsuleGeometry(1.25, Math.max(0.1, largo - 2.5), 6, 14))
    const b = new Mesh(cg, titanio)
    b.scale.x = 0.55; b.position.set(lado * (MM.W / 2 - 0.25), y, 0)
    add(b)
  }
  // USB-C y altavoces en el canto inferior (planos oscuros hundidos en la cara plana del marco)
  const usbGeo = g(new ShapeGeometry(rrect(9.0, 2.7, 1.3), 12))
  const usb = new Mesh(usbGeo, negroMate); usb.rotation.x = Math.PI / 2; usb.position.set(0, -MM.H / 2 - 0.03, 0); add(usb)
  const agujeroGeo = g(new CircleGeometry(0.62, 12))
  const agujeros = new InstancedMesh(agujeroGeo, negroMate, 12)
  agujeros.instanceMatrix.setUsage(DynamicDrawUsage)
  const m4 = new Matrix4(); const rotX = new Matrix4().makeRotationX(Math.PI / 2)
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) {
    const x = s * (13.5 + i * 2.2)
    m4.copy(rotX).setPosition(x, -MM.H / 2 - 0.03, 0)
    agujeros.setMatrixAt(i * 2 + (s < 0 ? 0 : 1), m4)
  }
  agujeros.instanceMatrix.needsUpdate = true
  add(agujeros)

  // ---------------- trasera: isla de cámara con tres lentes, flash y micrófono ----------------
  const cx = MM.W / 2 - LAB - 17.5, cy = MM.H / 2 - LAB - 17.5 // arriba a la izquierda MIRANDO la trasera (= +x en el modelo)
  const zIsla = zB - 0.34
  const islaGeo = g(extruido(rrect(35, 35, 8.4), 0.9, 0.35, 5, 24))
  const isl = new Mesh(islaGeo, isla); isl.rotation.y = Math.PI; isl.position.set(cx, cy, zIsla + 0.08); add(isl)
  const zLente = zIsla - 1.3 // cara exterior de la isla
  const anilloGeo = g(new TorusGeometry(5.45, 0.72, 14, 56))
  const biselGeo = g(new TorusGeometry(4.35, 0.22, 10, 48))
  const discoGeo = g(new CircleGeometry(4.55, 48))
  const nucleoGeo = g(new CircleGeometry(1.55, 28))
  const lentes: Array<[number, number]> = [[cx + 5.6, cy + 8.4], [cx + 5.6, cy - 8.4], [cx - 5.9, cy]]
  for (const [lx, ly] of lentes) {
    const aroM = new Mesh(anilloGeo, aro); aroM.position.set(lx, ly, zLente - 0.1); add(aroM)
    const disco = new Mesh(discoGeo, lente); disco.rotation.y = Math.PI; disco.position.set(lx, ly, zLente - 0.38); add(disco)
    const bis = new Mesh(biselGeo, titanioOsc); bis.position.set(lx, ly, zLente - 0.4); add(bis)
    const nuc = new Mesh(nucleoGeo, pildoraLente); nuc.rotation.y = Math.PI; nuc.position.set(lx, ly, zLente - 0.45); add(nuc)
  }
  const flashGeo = g(new CircleGeometry(1.7, 24))
  const flash = new Mesh(flashGeo, fis({ color: 0xcfcab8, metalness: 0.3, roughness: 0.28, envMapIntensity: 1.2 })); flash.rotation.y = Math.PI; flash.position.set(cx - 7.6, cy + 12.4, zLente - 0.05); add(flash)
  const micGeo = g(new CircleGeometry(0.7, 14))
  const mic = new Mesh(micGeo, negroMate); mic.rotation.y = Math.PI; mic.position.set(cx - 7.6, cy - 12.4, zLente - 0.05); add(mic)
  void CylinderGeometry; void DoubleSide

  raiz.scale.setScalar(K)
  const grupo = new Group()
  grupo.add(raiz)
  return {
    grupo,
    dim: { w: MM.W * K, h: MM.H * K, d: MM.D * K },
    pantalla,
    aplicarEnv(t, intensidad = 1) {
      fisicos.forEach((m) => { m.envMap = t; m.envMapRotation.y = 0.9; m.needsUpdate = true })
      void intensidad
    },
    dispose() { geos.forEach((x) => x.dispose()); mats.forEach((x) => x.dispose()) },
  }
}
