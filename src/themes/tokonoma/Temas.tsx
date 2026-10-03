import { useLayoutEffect, useRef, type MouseEvent } from 'react'
import { useCambioDeTema, type Tema } from '../temas'
import { useCopy } from './copy'
import { gsap } from './motion'
import { Sello } from './piezas'
import './temas.css'

// El selector de temas de Tokonoma: una fila de rollos colgantes (kakejiku) sobre blanco, uno por tema, cada uno con su cartela.
// Va en su propio chunk (lazy desde la cabecera): ni las ocho capturas ni este código existen hasta que se abre. Solo se mueven
// opacity, transform y clip-path, una vez, al entrar y al salir: con el panel quieto no hay un solo fotograma pedido.

const n2 = (n: number) => String(n).padStart(2, '0')
const SALIDA = 0.35

export default function Temas({ id, cerrar }: { id: string; cerrar: () => void }) {
  const c = useCopy()
  const { temas, actual, cambiar } = useCambioDeTema()
  const capa = useRef<HTMLDivElement>(null)
  const pista = useRef<HTMLOListElement>(null)
  const cuenta = useRef<HTMLSpanElement>(null)
  const ctx = useRef<gsap.Context | null>(null)
  const saliendo = useRef(false)
  const liberar = useRef<() => void>(() => undefined)
  // `cerrar`, `cambiar` y la lista cambian de identidad en cada render: los efectos de montaje leen siempre lo último desde aquí.
  const vivo = useRef({ cerrar, cambiar, actual })
  vivo.current = { cerrar, cambiar, actual }

  /** Sale con un fundido corto; al terminar suelta el aislamiento (para que el foco pueda volver al disparador) y avisa. */
  const salir = () => {
    if (saliendo.current) return
    saliendo.current = true
    ctx.current?.add(() => {
      gsap.killTweensOf(capa.current, 'opacity') // si Esc llega con la entrada a medias, el fundido de salida parte de donde esté
      gsap.to(capa.current, { opacity: 0, duration: SALIDA, ease: 'none', onComplete: () => { liberar.current(); vivo.current.cerrar() } })
    })
  }
  const salirRef = useRef(salir)
  salirRef.current = salir

  useLayoutEffect(() => {
    const el = capa.current
    const fila = pista.current
    if (!el || !fila) return
    const html = document.documentElement

    // 1) Modal de verdad: todo lo demás de la página queda inerte y sin scroll (el hueco de la barra se reserva para que nada salte).
    const aislados = Array.from(el.parentElement?.children ?? []).filter((x) => x !== el)
    aislados.forEach((x) => x.setAttribute('inert', ''))
    const previo = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter }
    if (window.innerWidth - html.clientWidth > 0) html.style.scrollbarGutter = 'stable' // solo si hay barra clásica: sin ella no hay nada que reservar
    html.style.overflow = 'hidden'
    liberar.current = () => {
      aislados.forEach((x) => x.removeAttribute('inert'))
      html.style.overflow = previo.overflow
      html.style.scrollbarGutter = previo.gutter
      liberar.current = () => undefined
    }

    // 2) En la fila deslizable (< 1100) el rollo del tema actual queda centrado antes de pintar.
    const items = Array.from(fila.children) as HTMLElement[]
    const aqui = items.find((li) => li.dataset.actual === '1') ?? items[0]
    if (fila.scrollWidth > fila.clientWidth + 1 && aqui) fila.scrollTo({ left: aqui.offsetLeft - (fila.clientWidth - aqui.offsetWidth) / 2, behavior: 'instant' })

    // 3) El contador «03 / 08» sigue al rollo centrado (IntersectionObserver: sin escuchar el scroll ni leer layout por evento).
    const io = new IntersectionObserver(
      (es) => es.forEach((en) => { if (en.isIntersecting && cuenta.current) cuenta.current.textContent = `${n2(items.indexOf(en.target as HTMLElement) + 1)} / ${n2(items.length)}` }),
      { root: fila, threshold: 0.6 },
    )
    items.forEach((li) => io.observe(li))

    // 4) Entrada: el blanco se funde, el riel se dibuja, cada rollo cuelga de su cuerda y se desenrolla (la varilla baja con el borde
    // del papel, misma curva y recorrido), la cartela asienta y, en el tema actual, se estampa el sello.
    const g = gsap.context(() => {
      const tl = gsap.timeline()
      tl.from(el, { opacity: 0, duration: 0.45, ease: 'none', clearProps: 'opacity' }, 0)
      tl.from('.tk-tp-sub', { opacity: 0, y: 12, duration: 1, ease: 'tk-expo', clearProps: 'transform,opacity' }, 0.15)
      tl.from('.tk-tp-riel', { scaleX: 0, transformOrigin: '50% 50%', duration: 1.6, ease: 'tk-expo', clearProps: 'transform' }, 0.2)
      items.forEach((li, i) => {
        const t0 = 0.3 + i * 0.07
        const papel = li.querySelector<HTMLElement>('.tk-tema-papel')
        const varilla = li.querySelector<HTMLElement>('.tk-tema-v-inf')
        const foto = li.querySelector<HTMLElement>('.tk-tema-img picture')
        const h = papel?.offsetHeight ?? 0
        tl.from(li, { opacity: 0, y: -12, duration: 1.2, ease: 'tk-expo', clearProps: 'transform,opacity' }, t0)
        if (papel) tl.fromTo(papel, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'tk-expo', clearProps: 'clipPath' }, t0)
        if (varilla) tl.fromTo(varilla, { y: -h }, { y: 0, duration: 1.6, ease: 'tk-expo', clearProps: 'transform' }, t0)
        if (foto) tl.from(foto, { scale: 1.08, transformOrigin: '50% 0%', duration: 2, ease: 'tk-expo', clearProps: 'transform' }, t0)
        tl.from(li.querySelectorAll('.tk-tema-cartela > *'), { opacity: 0, y: 8, duration: 0.9, ease: 'tk-expo', stagger: 0.08, clearProps: 'transform,opacity' }, t0 + 0.55)
        if (li.dataset.actual === '1') tl.from(li.querySelector('.tk-sello'), { opacity: 0, scale: 1.6, rotate: -14, duration: 0.55, ease: 'tk-asienta', clearProps: 'opacity' }, t0 + 1.1)
      })
    }, el)
    ctx.current = g

    // 5) Teclado: el foco entra en el rollo del tema actual, queda atrapado, Esc sale y ← → Inicio Fin recorren la fila.
    ;(aqui?.querySelector<HTMLElement>('a') ?? el.querySelector<HTMLElement>('a,button'))?.focus({ preventScroll: true })
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); salirRef.current(); return }
      const foco = Array.from(el.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'))
      const ahora = foco.indexOf(document.activeElement as HTMLElement)
      if (e.key === 'Tab') {
        if (!foco.length) return
        if (e.shiftKey && ahora <= 0) { e.preventDefault(); foco[foco.length - 1].focus() }
        else if (!e.shiftKey && (ahora === -1 || ahora === foco.length - 1)) { e.preventDefault(); foco[0].focus() }
        return
      }
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
      const enlaces = Array.from(el.querySelectorAll<HTMLElement>('.tk-tema-a'))
      const i = enlaces.indexOf(document.activeElement as HTMLElement)
      e.preventDefault()
      const aEl = i < 0 ? enlaces.find((x) => x.getAttribute('aria-current') === 'true') ?? enlaces[0] : enlaces[e.key === 'Home' ? 0 : e.key === 'End' ? enlaces.length - 1 : Math.min(enlaces.length - 1, Math.max(0, i + (e.key === 'ArrowRight' ? 1 : -1)))]
      aEl?.focus()
    }
    window.addEventListener('keydown', tecla)

    return () => {
      window.removeEventListener('keydown', tecla)
      io.disconnect()
      g.revert()
      ctx.current = null
      liberar.current()
    }
  }, [])

  /** Un clic normal cambia de tema (con su salida); Ctrl/Cmd/Mayús o el botón del medio dejan actuar al navegador sobre el href real. */
  const elegir = (e: MouseEvent<HTMLAnchorElement>, t: Tema) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    if (t.id === vivo.current.actual) return salir()
    if (saliendo.current) return
    saliendo.current = true
    const li = e.currentTarget.closest('li')
    ctx.current?.add(() => {
      // Los demás rollos se funden y queda el elegido sobre el blanco; el cambio de ruta llega con la hoja ya quieta.
      const otros = Array.from(pista.current?.children ?? []).filter((x) => x !== li)
      gsap.to([...otros, '.tk-tp-cab', '.tk-tp-sub'], { opacity: 0, duration: 0.3, ease: 'none' })
      gsap.delayedCall(0.32, () => vivo.current.cambiar(t.id))
    })
  }

  return (
    <div className="tk-tp" ref={capa} id={id} role="dialog" aria-modal="true" aria-labelledby={`${id}-t`}>
      <div className="tk-fr tk-tp-cab">
        <p className="tk-rotulo tk-tp-tit">
          <span id={`${id}-t`}>{c.temas.titulo}</span>
          <span className="tk-tp-cuenta" aria-hidden="true" ref={cuenta}>{`${n2(Math.max(1, temas.findIndex((t) => t.id === actual) + 1))} / ${n2(temas.length)}`}</span>
        </p>
        <button type="button" className="tk-tp-cerrar" aria-label={c.temas.cerrarAria} onClick={salir}>{c.temas.cerrar}</button>
      </div>
      <div className="tk-tp-cuerpo">
        <p className="tk-fr tk-tp-sub">{c.temas.sub}</p>
        <div className="tk-tp-caja">
          <span className="tk-tp-riel" aria-hidden="true" />
          <ol className="tk-temas" role="list" aria-label={c.temas.lista} ref={pista}>
            {temas.map((t, i) => {
              const aqui = t.id === actual
              return (
                <li key={t.id} className="tk-tema" data-actual={aqui ? '1' : undefined}>
                  <a className="tk-tema-a" href={t.href} aria-label={t.nombre} aria-describedby={`${id}-l-${t.id}`} aria-current={aqui ? 'true' : undefined} onClick={(e) => elegir(e, t)}>
                    <svg className="tk-tema-cuerda" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                      <path d="M3 34 50 0 97 34" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <span className="tk-tema-v tk-tema-v-sup" aria-hidden="true" />
                    <span className="tk-tema-papel">
                      <span className="tk-tema-img">
                        <picture>
                          <source media="(max-width: 767px)" srcSet={t.previewMovil} width={390} height={844} />
                          <img src={t.preview} width={720} height={450} alt={t.nombre} loading="lazy" decoding="async" />
                        </picture>
                      </span>
                      <span className="tk-tema-cartela">
                        <span className="tk-rotulo tk-tema-n">{c.no} {n2(i + 1)}</span>
                        <span className="tk-tema-nombre">{t.nombre}</span>
                        <span className="tk-tema-lema" id={`${id}-l-${t.id}`}>{t.lema}</span>
                        <span className="tk-tema-pie">
                          {aqui ? (
                            <>
                              <Sello tam={22} />
                              <span className="tk-rotulo tk-tema-act">{c.temas.actual}</span>
                            </>
                          ) : (
                            <span className="tk-tema-elegir">{c.temas.elegir}</span>
                          )}
                        </span>
                      </span>
                    </span>
                    <span className="tk-tema-v tk-tema-v-inf" aria-hidden="true" />
                  </a>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
