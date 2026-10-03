import { CLIP_PLENO, enVista, gsap, OUT, ScrollTrigger, SLAM } from './motion'

/** Entrada de cada título «cut-in»: el eyebrow se rebana en su sitio, una losa de tinta se desliza detrás y las letras
 *  se pegan una a una. Los que ya se ven al montar entran de inmediato; los demás, una vez, al llegar. */
export function entradaTitulos(scope: HTMLElement | null, retraso = 0.12) {
  if (!scope) return
  gsap.utils.toArray<HTMLElement>('[data-pr-titulo]', scope).forEach((t) => {
    const eyebrow = t.querySelector('[data-pr-eyebrow]')
    const losa = t.querySelector('.pr-losa')
    const letras = t.querySelectorAll('.pr-letra')
    const lead = t.querySelector('[data-pr-lead]')
    const tl = gsap.timeline({ paused: true })
    if (eyebrow) tl.fromTo(eyebrow, { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' }, { clipPath: CLIP_PLENO, duration: 0.45, ease: 'expo.out', clearProps: 'clipPath' }, 0)
    if (losa) tl.from(losa, { scaleX: 0, duration: 0.36, ease: 'expo.out' }, 0.08)
    if (letras.length) tl.from(letras, { opacity: 0, yPercent: -70, rotation: () => gsap.utils.random(-32, 32), scale: 1.55, duration: 0.5, ease: SLAM, stagger: { each: 0.022, from: 'start' } }, 0.1)
    if (lead) tl.from(lead, { opacity: 0, y: 14, duration: 0.5, ease: OUT }, 0.3)
    if (enVista(t)) tl.delay(retraso).play()
    else ScrollTrigger.create({ trigger: t, start: 'top 90%', once: true, onEnter: () => void tl.play() })
  })
}

/** Ráfaga de esquirlas en rombo (la confirmación del menú y la pulsación de un botón). Se limpia sola.
 *  Cada esquirla sale disparada con un tamaño propio, se mantiene opaca durante la primera mitad del vuelo y solo entonces se
 *  desvanece: así la ráfaga se lee entera en los primeros 120 ms en vez de apagarse al nacer. */
export function rafaga(host: HTMLElement, opciones: { x?: string; y?: string; n?: number; rx?: number; ry?: number; dur?: number } = {}) {
  const { x = '50%', y = '50%', n = 8, rx = 60, ry = 40, dur = 0.34 } = opciones
  const base = Math.max(9, Math.min(20, rx * 0.14))
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span')
    s.className = 'pr-esquirla'
    s.setAttribute('aria-hidden', 'true')
    Object.assign(s.style, { left: x, top: y, width: `${base}px`, height: `${base}px`, margin: `${-base / 2}px 0 0 ${-base / 2}px` })
    host.appendChild(s)
    const a = ((i + gsap.utils.random(-0.25, 0.25)) / n) * Math.PI * 2
    const alcance = gsap.utils.random(0.7, 1.15)
    gsap
      .timeline({ onComplete: () => s.remove() })
      .fromTo(s, { x: 0, y: 0, scale: 0.5, rotation: 0 }, { x: Math.cos(a) * rx * alcance, y: Math.sin(a) * ry * alcance, scale: gsap.utils.random(1, 1.7), rotation: gsap.utils.random(70, 200), duration: dur, ease: 'power3.out' })
      .to(s, { opacity: 0, duration: dur * 0.45, ease: 'power1.in' }, dur * 0.55)
  }
}
