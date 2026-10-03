import { useCallback, useLayoutEffect, useRef, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useCambioDeTema, type Tema } from '../temas'
import { useCopy } from './copy'
import { cubrir, gsap, soltarVelo } from './motion'
import './quiosco.css'

// «Otras ediciones»: el quiosco de El Reportaje. Las ocho portadas de los temas como números de una revista (cabecera, número de
// edición, titular = el lema), la actual con su sello. Cae como la hoja de papel de la casa, las portadas se reparten sobre el
// estante una tras otra y la foto de cada una se descubre de arriba abajo (la misma «placa» del resto del reportaje). Elegir una
// baja la hoja con el nombre de la edición y recién entonces navega. Todo es GSAP dentro de un gsap.context; en reposo no corre
// ningún fotograma (el reloj de GSAP se duerme) y el hover es CSS.

interface Props { origen: HTMLButtonElement; alSalir: () => void; alFin: () => void }

export default function Quiosco({ origen, alSalir, alFin }: Props) {
  const c = useCopy().ediciones
  const { temas, actual, cambiar } = useCambioDeTema()
  const panel = useRef<HTMLDivElement>(null)
  const raiz = origen.closest<HTMLElement>('.v5-reportaje') ?? document.body
  const cb = useRef({ alSalir, alFin })
  const vivo = useRef({ saliendo: false, eligiendo: false, liberar: () => {}, ctx: null as gsap.Context | null, entrada: null as gsap.core.Timeline | null })
  useLayoutEffect(() => { cb.current = { alSalir, alFin } })

  /** Cierra: devuelve el foco al disparador de inmediato, sube la hoja y, al terminar, avisa para desmontar. */
  const salir = useCallback(() => {
    const v = vivo.current
    const p = panel.current
    if (!p || !v.ctx || v.saliendo || v.eligiendo) return
    v.saliendo = true
    v.entrada?.kill()
    v.liberar()
    cb.current.alSalir()
    origen.focus({ preventScroll: true })
    p.style.pointerEvents = 'none'
    v.ctx.add(() => {
      gsap.timeline({ onComplete: () => cb.current.alFin() })
        .to(p.querySelectorAll('.rp-ed-li'), { opacity: 0, y: 14, duration: 0.2, ease: 'power2.in', stagger: { each: 0.016, from: 'end' } }, 0)
        .to(p, { yPercent: -102, duration: 0.42, ease: 'rep-hoja' }, 0.06)
    })
  }, [origen])

  useLayoutEffect(() => {
    const p = panel.current!
    const v = vivo.current
    v.saliendo = false
    v.eligiendo = false

    // Modal de verdad: lo de atrás no recibe foco ni lector de pantalla, y la página no se mueve debajo.
    const inertados = Array.from(p.parentElement!.children).filter((el) => el !== p && !el.hasAttribute('inert'))
    inertados.forEach((el) => el.setAttribute('inert', ''))
    const html = document.documentElement
    const previo = { overflow: html.style.overflow, relleno: html.style.paddingRight }
    const barra = window.innerWidth - html.clientWidth // la barra de scroll que se va: se compensa para que la página no salte
    html.style.overflow = 'hidden'
    if (barra > 0) html.style.paddingRight = `${barra}px`
    let libre = false
    v.liberar = () => {
      if (libre) return
      libre = true
      inertados.forEach((el) => el.removeAttribute('inert'))
      html.style.overflow = previo.overflow
      html.style.paddingRight = previo.relleno
    }

    const ctx = gsap.context(() => {
      const portadas = gsap.utils.toArray<HTMLElement>('.rp-ed-li', p)
      const fotos = gsap.utils.toArray<HTMLElement>('.rp-ed-foto', p)
      v.entrada = gsap.timeline({ defaults: { ease: 'rep' } })
        .fromTo(p, { yPercent: -102 }, { yPercent: 0, duration: 0.6 }, 0)
        .from('.rp-ed-barra > *', { opacity: 0, y: -10, duration: 0.5, stagger: 0.06 }, 0.2)
        .fromTo('.rp-ed-filete', { scaleX: 0 }, { scaleX: 1, duration: 1.1, clearProps: 'transform' }, 0.25)
        .fromTo('.rp-ed-titulo-in', { yPercent: 108 }, { yPercent: 0, duration: 0.85, clearProps: 'transform' }, 0.22)
        .fromTo('.rp-ed-titulo-in', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: 0.9, clearProps: 'backgroundSize' }, 0.75)
        .from('.rp-ed-dek', { opacity: 0, y: 14, duration: 0.7, clearProps: 'transform,opacity' }, 0.32)
        .fromTo(portadas, { opacity: 0, y: 46, rotation: (i: number) => (i % 2 ? 1.4 : -1.4) }, { opacity: 1, y: 0, rotation: 0, duration: 0.85, stagger: 0.06, clearProps: 'transform,opacity' }, 0.38)
        .fromTo(fotos, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, stagger: 0.06, clearProps: 'clipPath' }, 0.42)
        .fromTo('.rp-ed-sello', { scale: 1.7, opacity: 0, rotation: -14 }, { scale: 1, opacity: 1, rotation: -4, duration: 0.4, ease: 'back.out(2.4)', clearProps: 'transform,opacity' }, 1.05)
    }, p)
    v.ctx = ctx

    p.querySelector<HTMLElement>('[aria-current="true"]')?.focus({ preventScroll: true })

    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); salir(); return }
      const a = document.activeElement as HTMLElement | null
      if (e.key === 'Tab') {
        // Foco atrapado: el ciclo da la vuelta dentro de la hoja.
        const f = Array.from(p.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
        if (!f.length) return
        if (!a || a === p || !p.contains(a)) { e.preventDefault(); f[e.shiftKey ? f.length - 1 : 0].focus(); return }
        if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus() }
        else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus() }
        return
      }
      // Flechas entre portadas (la lista es una rejilla: izquierda/derecha de a una, arriba/abajo de a una fila).
      if (!a?.classList.contains('rp-ed-portada')) return
      const links = Array.from(p.querySelectorAll<HTMLElement>('.rp-ed-portada'))
      const i = links.indexOf(a)
      const columnas = links.filter((l) => l.offsetTop === links[0].offsetTop).length
      const destino = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + columnas, ArrowUp: i - columnas, Home: 0, End: links.length - 1 }[e.key]
      if (destino === undefined) return
      e.preventDefault()
      links[Math.min(links.length - 1, Math.max(0, destino))].focus()
    }
    window.addEventListener('keydown', tecla)
    return () => {
      window.removeEventListener('keydown', tecla)
      v.liberar()
      ctx.revert()
      v.ctx = null
    }
  }, [salir])

  /** Elegir una portada: las demás se apagan, la elegida se levanta, cae la hoja con su número y su nombre y entonces se navega. */
  const elegir = (e: MouseEvent<HTMLAnchorElement>, t: Tema, n: number) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // abrir en otra pestaña lo resuelve el navegador
    e.preventDefault()
    if (t.id === actual) { salir(); return }
    const v = vivo.current
    const p = panel.current
    if (!p || !v.ctx || v.eligiendo || v.saliendo) return
    v.eligiendo = true
    v.entrada?.progress(1)
    const mia = e.currentTarget.closest('li')
    const otras = gsap.utils.toArray<HTMLElement>('.rp-ed-li', p).filter((li) => li !== mia)
    v.ctx.add(() => {
      gsap.to(otras, { opacity: 0.22, duration: 0.25, ease: 'power2.out' })
      gsap.to(mia, { y: -10, duration: 0.3, ease: 'rep' })
    })
    cubrir(c.numero(n), t.nombre, () => {
      cambiar(t.id)
      // Si la navegación no desmontó nada, la hoja no puede quedarse tapando la página.
      gsap.delayedCall(3, () => { soltarVelo(); v.eligiendo = false; gsap.to([...otras, mia], { opacity: 1, y: 0, duration: 0.3 }) })
    })
  }

  return createPortal(
    <div ref={panel} id="rp-ediciones" className="rp-ed" role="dialog" aria-modal="true" aria-labelledby="rp-ed-titulo" tabIndex={-1}>
      <div className="rp-ed-top">
        <div className="rp-marco rp-ed-barra">
          <p className="rp-mono rp-ed-kicker">{c.kicker(temas.length)}</p>
          <button type="button" className="rp-ed-x" aria-label={c.cerrarEtiqueta} onClick={salir}>
            <span className="rp-mono">{c.cerrar}</span>
            <span className="rp-ed-x-ic" aria-hidden="true" />
          </button>
        </div>
        <i className="rp-ed-filete" aria-hidden="true" />
      </div>
      <div className="rp-marco rp-ed-cuerpo">
        <header className="rp-ed-cab-t">
          <h2 id="rp-ed-titulo" className="rp-ed-titulo"><span className="rp-ed-titulo-mascara"><span className="rp-ed-titulo-in">{c.titulo}</span></span></h2>
          <p className="rp-ed-dek">{c.dek(temas.length)}</p>
        </header>
        <ul className="rp-ed-lista">
          {temas.map((t, i) => {
            const esActual = t.id === actual
            return (
              <li key={t.id} className="rp-ed-li">
                <a className="rp-ed-portada" href={t.href} aria-current={esActual ? 'true' : undefined} data-tema={t.id} onClick={(e) => elegir(e, t, i + 1)}>
                  <span className="rp-ed-cab" aria-hidden="true">
                    <b className="rp-ed-nombre"><span>{t.nombre}</span></b>
                    <span className="rp-mono rp-ed-num">{c.numero(i + 1)}</span>
                  </span>
                  <span className="rp-ed-foto">
                    <picture>
                      <source media="(max-width: 767px)" srcSet={t.previewMovil} />
                      <img src={t.preview} width={720} height={450} alt={t.nombre} loading="lazy" decoding="async" />
                    </picture>
                    {esActual && <span className="rp-ed-sello rp-mono">{c.actual}</span>}
                  </span>
                  <span className="rp-ed-lema">{t.lema}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>,
    raiz,
  )
}
