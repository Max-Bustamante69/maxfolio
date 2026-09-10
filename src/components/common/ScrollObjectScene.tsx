import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ScrollObjectVariant, SkylineBarDatum } from './ScrollObject'

interface Props {
  variant: ScrollObjectVariant
  /** Whether the object is currently in view — the render loop pauses entirely (no rAF churn) when false. */
  active: boolean
  /** 'skyline' only: the real per-bar layout to instance. */
  data?: SkylineBarDatum[]
}

/** Cheap deterministic 3-lobe value noise (no external noise library) used only to displace the
 * Soft UI blob's vertices once at build time — doesn't need to be true Perlin/Simplex, just smooth
 * and seed-stable. */
function fakeNoise3(x: number, y: number, z: number) {
  return (Math.sin(x * 2.1 + y * 1.3) + Math.sin(y * 1.7 + z * 2.3) + Math.sin(z * 1.9 + x * 1.1)) / 3
}

function buildGeometryAndMaterial(variant: ScrollObjectVariant, data?: SkylineBarDatum[]): { mesh: THREE.Object3D; extras: THREE.Object3D[] } {
  const extras: THREE.Object3D[] = []

  if (variant === 'skyline') {
    const bars = data && data.length > 0 ? data : [{ x: 0, z: 0, height: 1, peak: true }]
    const geo = new THREE.BoxGeometry(0.42, 1, 0.42)
    // Flat graphite/navy body — the reserved cyan lands only on the one real-data instance color set below.
    const mat = new THREE.MeshStandardMaterial({ color: 0x2a3448, roughness: 0.6, metalness: 0.25, flatShading: true })
    const mesh = new THREE.InstancedMesh(geo, mat, bars.length)
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(bars.length * 3), 3)
    const dummy = new THREE.Object3D()
    const navy = new THREE.Color(0x3c4a68)
    const cyan = new THREE.Color(0x4fd1ff)
    bars.forEach((b, i) => {
      const h = Math.max(0.12, b.height)
      dummy.position.set(b.x, h / 2 - 1.25, b.z)
      dummy.scale.set(1, h, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, b.peak ? cyan : navy)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    const groundGeo = new THREE.PlaneGeometry(7, 5)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0d1420, roughness: 1, metalness: 0 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.25
    extras.push(ground)
    return { mesh, extras }
  }

  if (variant === 'luxury') {
    const geo = new THREE.TorusKnotGeometry(1.05, 0.32, 180, 24)
    const mat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 1, envMapIntensity: 1.2 })
    const mesh = new THREE.Mesh(geo, mat)
    const groundGeo = new THREE.CircleGeometry(4.2, 48)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xf3ead9, roughness: 0.95, metalness: 0 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.7
    extras.push(ground)
    return { mesh, extras }
  }

  if (variant === 'brutalist') {
    const geo = new THREE.DodecahedronGeometry(1.35, 0)
    const mat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.85, metalness: 0.05, flatShading: true })
    const mesh = new THREE.Mesh(geo, mat)
    const edges = new THREE.EdgesGeometry(geo)
    const wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xdc2626 }))
    mesh.add(wire)
    return { mesh, extras }
  }

  // softui: icosahedron with vertex-noise displacement -> matte blob
  const geo = new THREE.IcosahedronGeometry(1.25, 4)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = fakeNoise3(v.x * 1.6, v.y * 1.6, v.z * 1.6)
    v.multiplyScalar(1 + n * 0.13)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  const mat = new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.92, metalness: 0 })
  const mesh = new THREE.Mesh(geo, mat)
  return { mesh, extras }
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh | THREE.LineSegments
    if ('geometry' in mesh && mesh.geometry) mesh.geometry.dispose()
    const material = (mesh as THREE.Mesh).material
    if (Array.isArray(material)) material.forEach((m) => m.dispose())
    else if (material) (material as THREE.Material).dispose()
  })
}

const FRAME_INTERVAL = 1000 / 60 // cap ≤60fps

export default function ScrollObjectScene({ variant, active, data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active
  const startRef = useRef<(() => void) | null>(null)
  // Re-entering the viewport restarts the paused loop (the scene effect above only starts it once).
  useEffect(() => { if (active) startRef.current?.() }, [active])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let width = container.clientWidth || 1
    let height = container.clientHeight || 1

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(1) // cap at 1x DPR
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    // Windows Chromium can promote a WebGL canvas to a hardware "direct composition" overlay plane
    // that paints above every other layer regardless of CSS z-index/stacking-context (the same class
    // of bug historically seen with <video>). Forcing the canvas onto the regular GPU layer tree
    // (transform + isolation right on the element, not just an ancestor) makes it respect normal
    // paint order again — confirmed by A/B test against a plain z-0 div in the same slot.
    renderer.domElement.style.transform = 'translateZ(0)'
    renderer.domElement.style.isolation = 'isolate'
    // Defensive: on top of the layering fix above, keep the render itself translucent. Every
    // placement of this object sits close to real copy (stat numerals, readout tiles), and a solid
    // opaque mesh is a text-legibility risk should the browser ever composite it above content again
    // — an ambient, ghosted object reads as intentional and never fights the numbers behind/under it.
    renderer.domElement.style.opacity = '0.5'
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100)
    // Skyline's bars spread across a wider x/z grid than the other themes' single centered object,
    // so its camera sits back and slightly above to keep every year's cluster in frame.
    if (variant === 'skyline') camera.position.set(0, 1.3, 9)
    else camera.position.set(0, 0, 6)

    const key = new THREE.DirectionalLight(0xffffff, 1.3)
    key.position.set(3, 4, 5)
    scene.add(key)
    const fill = new THREE.DirectionalLight(variant === 'brutalist' ? 0xff4444 : 0xffffff, 0.3)
    fill.position.set(-3, -1, 2)
    scene.add(fill)
    scene.add(new THREE.AmbientLight(0xffffff, variant === 'brutalist' ? 0.45 : 0.65))

    const { mesh, extras } = buildGeometryAndMaterial(variant, data)
    scene.add(mesh)
    extras.forEach((e) => scene.add(e))

    let pointerX = 0
    let pointerY = 0
    const onPointerMove = (e: PointerEvent) => {
      const r = container.getBoundingClientRect()
      pointerX = Math.min(1, Math.max(-1, ((e.clientX - r.left) / r.width) * 2 - 1))
      pointerY = Math.min(1, Math.max(-1, ((e.clientY - r.top) / r.height) * 2 - 1))
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    // Scroll progress across the containing section, 0 (entering bottom) -> 1 (leaving top).
    const sectionEl = (container.closest('[data-scroll-object-track]') as HTMLElement) || container.parentElement
    let scrollProgress = 0
    const updateScroll = () => {
      const rect = sectionEl?.getBoundingClientRect()
      if (!rect) return
      const vh = window.innerHeight || 1
      const total = rect.height + vh
      const passed = vh - rect.top
      scrollProgress = Math.min(1, Math.max(0, passed / total))
    }
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll)

    const clock = new THREE.Clock()
    let raf = 0
    let lastFrameTime = 0
    const MAX_ROT_FROM_POINTER = 0.1 // ~±6deg

    // The loop only lives while the object is in view: when `active` drops, the next frame exits without
    // rescheduling (no idle 60 Hz wake-ups), and the `[active]` effect below restarts it on re-entry.
    const animate = (now: number) => {
      if (!activeRef.current) { raf = 0; return }
      raf = requestAnimationFrame(animate)
      if (now - lastFrameTime < FRAME_INTERVAL) return
      lastFrameTime = now
      const t = clock.getElapsedTime()
      if (variant === 'skyline') {
        // Scroll orbits the CAMERA slowly around the fixed skyline (the bars themselves stay put,
        // like walking past real buildings); the pointer only tilts the whole block ±6°.
        const angle = (scrollProgress - 0.5) * (Math.PI / 2.2)
        const radius = 9
        camera.position.x = Math.sin(angle) * radius
        camera.position.z = Math.cos(angle) * radius
        camera.position.y = 1.3 + Math.sin(t * 0.15) * 0.08
        camera.lookAt(0, -0.2, 0)
        mesh.rotation.x = pointerY * MAX_ROT_FROM_POINTER
        mesh.rotation.y = pointerX * MAX_ROT_FROM_POINTER
      } else {
        mesh.rotation.y = scrollProgress * Math.PI * 2 + t * 0.08 + pointerX * MAX_ROT_FROM_POINTER
        mesh.rotation.x = scrollProgress * Math.PI * 0.55 + Math.sin(t * 0.3) * 0.05 + pointerY * MAX_ROT_FROM_POINTER
        mesh.position.y = Math.sin(scrollProgress * Math.PI) * 0.15 - scrollProgress * 0.25
      }
      renderer.render(scene, camera)
    }
    startRef.current = () => { if (!raf && activeRef.current) raf = requestAnimationFrame(animate) }
    startRef.current()

    const onResize = () => {
      width = container.clientWidth || 1
      height = container.clientHeight || 1
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)

    return () => {
      startRef.current = null
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
      ro.disconnect()
      disposeObject(mesh)
      extras.forEach(disposeObject)
      renderer.dispose()
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement)
    }
  }, [variant])

  return <div ref={containerRef} className="h-full w-full" />
}
