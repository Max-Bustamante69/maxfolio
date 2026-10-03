import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { useCambioDeTema, type Tema } from '../temas'
import { useCopy } from './copy'
import { gsap } from './motion'
import { Tri, useMq } from './piezas'
import './temas.css'

// El selector de temas de Maison: un LOOKBOOK. Los ocho temas son ocho piezas numeradas 01–08, en 4:5, sobre la misma losa; el
// nombre va en versales y el lema en una línea de nota. Se abre por cortina (una hoja oscura que cae y se retira hacia abajo,
// descubriendo el papel), las piezas se descubren con la persiana de la casa, y elegir una vuelve a bajar la cortina antes de
// navegar y la retira cuando el tema nuevo ya está debajo. En móvil es un carrusel vertical a pantalla completa, una pieza por pantalla.
// Se carga con lazy() al abrirlo: ni las imágenes ni este código cuestan nada antes. Quieto no pide ni un fotograma.

const par = (n: number) => String(n).padStart(2, '0')
/** Qué franja de la captura apaisada asoma en el marco 4:5 (% desde la izquierda): casi siempre el titular, que está a la izquierda; Plató, su escena, y Tokonoma, sus marcos colgados. */
const FRANJA: Record<string, number> = { plato: 50, tokonoma: 92 }
const FOCO = 'a[href], button:not([disabled])'

export default function Temas({ id, cerrar }: { id: string; cerrar: () => void }) {
  const c = useCopy()
  const { temas, actual, cambiar } = useCambioDeTema()
  const movil = useMq('(max-width: 767px)')
  const raiz = useRef<HTMLDivElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  const ctx = useRef<gsap.Context | null>(null)
  const ocupado = useRef(false) // cerrando o eligiendo: una sola salida a la vez
  const inicial = Math.max(0, temas.findIndex((t) => t.id === actual))
  const [visible, setVisible] = useState(inicial)

  // Siempre la última versión de lo que cambia en cada render, para que los oyentes de ventana no se re-creen.
  const ultimo = useRef({ cerrar, cambiar, actual, temas })
  ultimo.current = { cerrar, cambiar, actual, temas }

  /** Salida por la cortina que sube: las piezas se apagan y la hoja se recoge hacia arriba. */
  const pedirCierre = useCallback(() => {
    const el = raiz.current
    if (!el || ocupado.current) return
    ocupado.current = true
    ctx.current?.add(() => {
      gsap.timeline({ onComplete: () => ultimo.current.cerrar() })
        .to(el.querySelectorAll('.mz-tem-foto, .mz-tem-pie, .mz-tem-intro'), { opacity: 0, duration: 0.22, ease: 'power2.out' }, 0)
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'velo' }, 0.08)
    })
  }, [])

  /** Elegir un tema: la cortina oscura cae sobre todo, se navega, y se retira cuando el tema nuevo ya está debajo. */
  const elegir = useCallback((t: Tema) => {
    if (ocupado.current) return
    if (t.id === ultimo.current.actual) { pedirCierre(); return }
    ocupado.current = true
    const tela = document.createElement('div')
    tela.setAttribute('aria-hidden', 'true')
    const cs = getComputedStyle(raiz.current!)
    const v = (n: string) => cs.getPropertyValue(n).trim()
    Object.assign(tela.style, { position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', zIndex: '2147483000', pointerEvents: 'none', background: v('--mz-suelo'), clipPath: 'inset(0% 0% 100% 0%)' })
    // Sobre la cortina asoma el nombre de la pieza elegida, como la etiqueta de una colección que se anuncia; dura lo que tarde en llegar.
    const rotulo = document.createElement('div')
    Object.assign(rotulo.style, { position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'grid', placeContent: 'center', justifyItems: 'center', gap: '14px', padding: '0 16px', textAlign: 'center', color: v('--mz-papel'), opacity: '0' })
    const num = document.createElement('span')
    num.textContent = `${par(ultimo.current.temas.findIndex((x) => x.id === t.id) + 1)} / ${par(ultimo.current.temas.length)}`
    Object.assign(num.style, { fontFamily: v('--mz-sans'), fontSize: '12px', fontWeight: '500', letterSpacing: '0.06em', color: v('--mz-papel-2') })
    const nom = document.createElement('span')
    nom.textContent = t.nombre
    Object.assign(nom.style, { fontFamily: v('--mz-serif'), fontSize: 'clamp(44px, 7vw, 96px)', fontWeight: '300', lineHeight: '1', letterSpacing: '-0.025em' })
    rotulo.append(num, nom)
    tela.append(rotulo)
    document.body.appendChild(tela)
    const quitar = () => tela.remove()
    const seguro = window.setTimeout(quitar, 9000)
    // La tela vive fuera de React: sobrevive al cambio de tema. Navegar es una transición (el tema nuevo llega con su trozo) y
    // el viejo sigue montado hasta entonces, así que la tela se retira SOLO cuando Maison ya no está (o a los 6 s, si algo tarda).
    gsap.to(rotulo, { opacity: 1, duration: 0.5, delay: 0.22, ease: 'maison' })
    gsap.to(tela, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 0.36, ease: 'velo',
      onComplete: () => {
        ultimo.current.cambiar(t.id)
        const desde = performance.now()
        const espera = window.setInterval(() => {
          if (document.querySelector('.v5-maison') && performance.now() - desde < 6000) return
          window.clearInterval(espera)
          gsap.to(rotulo, { opacity: 0, duration: 0.3, ease: 'maison' })
          gsap.to(tela, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.8, delay: 0.3, ease: 'velo', onComplete: () => { window.clearTimeout(seguro); quitar() } })
        }, 60)
      },
    })
  }, [pedirCierre])

  const alPulsar = (e: MouseEvent<HTMLAnchorElement>, t: Tema) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // abrir en otra pestaña es del navegador
    e.preventDefault()
    elegir(t)
  }

  useLayoutEffect(() => {
    const el = raiz.current!
    const ul = lista.current!
    ocupado.current = false
    const esMovil = window.matchMedia('(max-width: 767px)').matches
    const html = document.documentElement
    const [desborde, canal] = [html.style.overflow, html.style.scrollbarGutter]
    html.style.overflow = 'hidden'
    html.style.scrollbarGutter = 'stable' // con scrollbar clásico, el hueco se conserva: la página de atrás no salta al abrir ni al cerrar
    const detras = document.querySelectorAll('.mz-vista, .mz-pie, .mz-saltar')
    detras.forEach((n) => n.setAttribute('inert', ''))
    // En móvil el carrusel abre en la pieza que estás viendo, antes del primer pintado.
    if (esMovil) ul.scrollTop = inicial * ul.clientHeight

    const g = gsap.context(() => {
      const q = gsap.utils.selector(el)
      const orden = (i: number) => 0.52 + (esMovil ? Math.abs(i - inicial) : i) * 0.055
      gsap.timeline({ defaults: { ease: 'velo' } })
        // La cortina: la hoja cae y, desde arriba, una segunda hoja oscura se retira hacia abajo descubriendo el papel.
        .fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, clearProps: 'clipPath' }, 0)
        .fromTo(q('.mz-tem-cortina'), { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.85, clearProps: 'clipPath' }, 0.3)
        .fromTo(q('.mz-tem-filete'), { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: 'maison', clearProps: 'transform' }, 0.5)
        .from(q('.mz-tem-kick, .mz-tem-cuenta, .mz-tem-x'), { opacity: 0, duration: 0.5, ease: 'maison', clearProps: 'opacity' }, 0.6)
        .from(q('.mz-tem-h, .mz-tem-lead, .mz-tem-guia'), { opacity: 0, y: 22, duration: 0.9, stagger: 0.08, clearProps: 'transform,opacity' }, 0.62)
        .fromTo(q('.mz-tem-foto'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, delay: orden, clearProps: 'clipPath' }, 0)
        .from(q('.mz-tem-foto img'), { scale: 1.08, transformOrigin: '50% 0%', duration: 1.15, delay: orden, clearProps: 'transform' }, 0)
        .from(q('.mz-tem-pie'), { opacity: 0, y: 12, duration: 0.7, delay: (i: number) => orden(i) + 0.1, clearProps: 'transform,opacity' }, 0)
    }, el)
    ctx.current = g

    el.querySelectorAll<HTMLAnchorElement>('.mz-tem-a')[inicial]?.focus({ preventScroll: true })

    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); pedirCierre(); return }
      const focos = Array.from(el.querySelectorAll<HTMLElement>(FOCO))
      const dentro = el.contains(document.activeElement)
      if (e.key === 'Tab') {
        if (!focos.length) return
        const a = focos[0], z = focos[focos.length - 1]
        if (!dentro) { e.preventDefault(); a.focus(); return }
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
        return
      }
      // Flechas: recorren las piezas en orden (en la rejilla, arriba y abajo saltan una fila; en el carrusel, una pieza).
      const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.mz-tem-a'))
      const i = links.indexOf(document.activeElement as HTMLAnchorElement)
      const cols = Math.max(1, getComputedStyle(ul).gridTemplateColumns.split(' ').filter((v) => v.endsWith('px')).length)
      const paso: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }
      if (e.key in paso || e.key === 'Home' || e.key === 'End') {
        if (i < 0 && dentro && !(document.activeElement as HTMLElement).closest('.mz-tem-lista')) return // el foco está en «Cerrar»: las flechas no se tocan
        e.preventDefault()
        const destino = e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : Math.min(links.length - 1, Math.max(0, (i < 0 ? inicial : i) + paso[e.key]))
        links[destino]?.focus()
      }
    }
    window.addEventListener('keydown', tecla)

    return () => {
      window.removeEventListener('keydown', tecla)
      html.style.overflow = desborde
      html.style.scrollbarGutter = canal
      detras.forEach((n) => n.removeAttribute('inert'))
      g.revert()
      ctx.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Carrusel móvil: qué pieza ocupa la pantalla (un IntersectionObserver; ningún oyente de scroll ni fotograma).
  useEffect(() => {
    const ul = lista.current
    if (!movil || !ul) return
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) setVisible(Number((en.target as HTMLElement).dataset.i)) })
    }, { root: ul, threshold: 0.6 })
    ul.querySelectorAll('.mz-tem-li').forEach((li) => io.observe(li))
    return () => io.disconnect()
  }, [movil])

  return (
    <div id={id} className="mz-tem" role="dialog" aria-modal="true" aria-label={c.temas.abrir} ref={raiz}>
      <div className="mz-tem-cortina" aria-hidden="true" />
      <div className="mz-tem-barra mz-marco">
        <p className="mz-etq mz-tem-kick">{c.temas.abrir}</p>
        <p className="mz-etq mz-tem-cuenta" aria-hidden="true">{par(visible + 1)} / {par(temas.length)}</p>
        <button type="button" className="mz-tem-x" onClick={pedirCierre}>
          <span>{c.menu.cerrar}</span>
          <i className="mz-tem-cruz" aria-hidden="true" />
        </button>
      </div>
      <i className="mz-tem-filete" aria-hidden="true" />
      <div className="mz-tem-cuerpo mz-marco">
        <div className="mz-tem-intro">
          <div className="mz-tem-tit">
            <h2 className="mz-tem-h">{c.temas.titulo}</h2>
            <p className="mz-nota-grande mz-tem-lead">{c.temas.lead}</p>
          </div>
          <p className="mz-mini mz-tem-guia">{c.temas.guia}</p>
        </div>
        <ul className="mz-tem-lista" role="list" ref={lista}>
          {temas.map((t, i) => {
            const esActual = t.id === actual
            return (
              <li key={t.id} className="mz-tem-li" data-i={i}>
                <a className="mz-tem-a" href={t.href} aria-label={t.nombre} aria-describedby={`${id}-l${i}`} aria-current={esActual ? 'true' : undefined} onClick={(e) => alPulsar(e, t)}>
                  <span className="mz-tem-foto">
                    <picture>
                      <source media="(max-width: 767px)" srcSet={t.previewMovil} width={390} height={844} />
                      <img src={t.preview} width={720} height={450} alt={t.nombre} loading="lazy" decoding="async" style={{ objectPosition: `${FRANJA[t.id] ?? 0}% 0%` }} />
                    </picture>
                  </span>
                  <span className="mz-tem-pie">
                    <span className="mz-tem-n" aria-hidden="true">{par(i + 1)}</span>
                    <span className="mz-tem-cab">
                      <span className="mz-tem-nombre">{t.nombre}</span>
                      {esActual && <span className="mz-tem-actual"><i className="mz-tem-punto" aria-hidden="true" />{c.temas.actual}</span>}
                    </span>
                    <span className="mz-tem-lema" id={`${id}-l${i}`}>{t.lema}</span>
                    <span className="mz-tem-ver" aria-hidden="true">{esActual ? c.temas.aqui : c.temas.ver}{!esActual && <Tri />}</span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
      <ol className="mz-tem-ticks" aria-hidden="true">
        {temas.map((t, i) => <li key={t.id} data-on={i === visible ? '1' : undefined} />)}
      </ol>
    </div>
  )
}
