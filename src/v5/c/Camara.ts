// La cámara de la Mesa: pantalla = mundo·z + (x, y). Una sola capa con transform.
//   · Resorte críticamente amortiguado (rigidez 170, amortiguación 26, masa 1: sin rebote) para los vuelos, el zoom por botón y «ver todo».
//   · Inercia del arrastre: fricción exponencial, y el lazo SOLO existe mientras la velocidad > 0,05 px/ms; al parar se suelta (0 fotogramas en reposo).
// No hay lazo perpetuo: requestAnimationFrame se pide al empezar a moverse y se deja de pedir al asentarse.

const K = 170
const C = 26
const PASO = 1 / 240
const TAU = 325 // ms de la fricción de la inercia
const V_MIN = 0.05 // px/ms
export const Z_MAX = 3

export interface Pose {
  x: number
  y: number
  z: number
}
interface Ancla {
  sx: number
  sy: number
  wx: number
  wy: number
}

export class Camara implements Pose {
  x = 0
  y = 0
  z = 1
  zMin = 0.05
  private lz = 0
  private v = { x: 0, y: 0, z: 0 } // velocidades del resorte (px/s; z en log/s)
  private meta = { x: 0, y: 0, z: 0 }
  private modo: 'quieta' | 'resorte' | 'inercia' = 'quieta'
  private vi = { x: 0, y: 0 } // velocidad de la inercia (px/ms)
  private ancla: Ancla | null = null
  private raf = 0
  private ultimo = 0

  constructor(
    private alFotograma: (c: Camara) => void,
    private alMover: (en: boolean) => void,
    private alReposo: (c: Camara) => void,
  ) {}

  get moviendose() {
    return this.modo !== 'quieta'
  }

  /** Pose instantánea (sin animar): la apertura desde la URL o un reencuadre tras cambiar el tamaño. */
  poner(p: Pose) {
    this.parar()
    this.x = p.x
    this.y = p.y
    this.z = this.acotarZ(p.z)
    this.lz = Math.log(this.z)
    this.alFotograma(this)
  }

  /** Arrastre directo con el puntero: sigue al dedo sin resorte. */
  arrastrar(dx: number, dy: number) {
    this.parar()
    this.x += dx
    this.y += dy
    this.alFotograma(this)
  }

  /** Suelta el arrastre con la velocidad (px/ms) del último tramo: arranca la inercia si pasa del umbral. */
  soltar(vx: number, vy: number) {
    if (Math.hypot(vx, vy) <= V_MIN) {
      this.alReposo(this)
      return
    }
    this.vi = { x: vx, y: vy }
    this.arrancar('inercia')
  }

  /** Zoom directo alrededor de un punto de pantalla (rueda, pellizco). */
  zoomDirecto(sx: number, sy: number, factor: number) {
    this.parar()
    const z = this.acotarZ(this.z * factor)
    const wx = (sx - this.x) / this.z
    const wy = (sy - this.y) / this.z
    this.z = z
    this.lz = Math.log(z)
    this.x = sx - wx * z
    this.y = sy - wy * z
    this.alFotograma(this)
  }

  /** Zoom animado (resorte) alrededor de un punto de pantalla: los botones + y − (×1,5). */
  zoomA(sx: number, sy: number, z: number) {
    const objetivo = this.acotarZ(z)
    this.ancla = { sx, sy, wx: (sx - this.x) / this.z, wy: (sy - this.y) / this.z }
    this.meta = { x: this.x, y: this.y, z: Math.log(objetivo) }
    this.arrancar('resorte')
  }

  /** Vuelo a una pose (resorte): «ver todo», enfocar una diapositiva, seguir el foco del teclado. */
  irA(p: Pose) {
    this.ancla = null
    this.meta = { x: p.x, y: p.y, z: Math.log(this.acotarZ(p.z)) }
    this.arrancar('resorte')
  }

  /** Desplazamiento por teclado: el objetivo se mueve y el resorte lo alcanza. */
  empujar(dx: number, dy: number) {
    const base = this.modo === 'resorte' && !this.ancla ? this.meta : { x: this.x, y: this.y, z: this.lz }
    this.ancla = null
    this.meta = { x: base.x + dx, y: base.y + dy, z: base.z }
    this.arrancar('resorte')
  }

  parar() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
    this.v = { x: 0, y: 0, z: 0 }
    this.ancla = null
    if (this.modo !== 'quieta') {
      this.modo = 'quieta'
      this.alMover(false)
    }
  }

  destruir() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  private acotarZ(z: number) {
    return Math.min(Z_MAX, Math.max(this.zMin, z))
  }

  private arrancar(modo: 'resorte' | 'inercia') {
    const venia = this.modo
    this.modo = modo
    if (venia === 'quieta') this.alMover(true)
    if (!this.raf) {
      this.ultimo = performance.now()
      this.raf = requestAnimationFrame(this.tick)
    }
  }

  private tick = (t: number) => {
    const dt = Math.min(64, t - this.ultimo)
    this.ultimo = t
    if (this.modo === 'inercia') this.inercia(dt)
    else this.resorte(dt)
    this.alFotograma(this)
    if (this.modo === 'quieta') {
      this.raf = 0
      this.alMover(false)
      this.alReposo(this)
    } else this.raf = requestAnimationFrame(this.tick)
  }

  private inercia(dt: number) {
    this.x += this.vi.x * dt
    this.y += this.vi.y * dt
    const f = Math.exp(-dt / TAU)
    this.vi.x *= f
    this.vi.y *= f
    if (Math.hypot(this.vi.x, this.vi.y) <= V_MIN) this.modo = 'quieta'
  }

  private resorte(dt: number) {
    let restante = Math.min(dt, 64) / 1000
    while (restante > 0) {
      const h = Math.min(PASO, restante)
      restante -= h
      this.v.x += (-K * (this.x - this.meta.x) - C * this.v.x) * h
      this.v.y += (-K * (this.y - this.meta.y) - C * this.v.y) * h
      this.v.z += (-K * (this.lz - this.meta.z) - C * this.v.z) * h
      this.x += this.v.x * h
      this.y += this.v.y * h
      this.lz += this.v.z * h
    }
    this.z = this.acotarZ(Math.exp(this.lz))
    if (this.ancla) {
      this.x = this.ancla.sx - this.ancla.wx * this.z
      this.y = this.ancla.sy - this.ancla.wy * this.z
    }
    const quieto =
      Math.abs(this.lz - this.meta.z) < 0.0004 &&
      Math.abs(this.v.z) < 0.001 &&
      (this.ancla || (Math.abs(this.x - this.meta.x) < 0.05 && Math.abs(this.y - this.meta.y) < 0.05 && Math.hypot(this.v.x, this.v.y) < 0.5))
    if (quieto) {
      this.z = Math.exp(this.meta.z)
      this.lz = this.meta.z
      if (this.ancla) {
        this.x = this.ancla.sx - this.ancla.wx * this.z
        this.y = this.ancla.sy - this.ancla.wy * this.z
      } else {
        this.x = this.meta.x
        this.y = this.meta.y
      }
      this.v = { x: 0, y: 0, z: 0 }
      this.ancla = null
      this.modo = 'quieta'
    }
  }
}
