import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useCopy } from './copy'
import { anillos, centroDe, formatoN, seccionEn, type Placa as Datos } from './medicion'
import { EASE_LINEA, gsap } from './motion'
import { Flecha, SegCapa, useK } from './nav'

// La placa: la captura de página completa de una tienda con tres capas (Piel, Esqueleto, Medición) y una línea de
// escaneo que se arrastra de arriba abajo. Un solo escalar t ∈ [0,1] manda todo: la línea está en el punto t de la
// ventana y la hoja se desplaza en proporción, así que el puntero siempre tiene la línea bajo el dedo y no hace falta
// auto-desplazamiento ni lazo de fotogramas. Por encima de la línea se ve la capa elegida (clip-path); por debajo,
// la piel. Cada movimiento escribe transform y clip-path directamente: sin getBoundingClientRect en pointermove
// (las cajas vienen premedidas) y sin rAF propio (idle-frame-budget Z-1 y Z-5).

export interface PlacaApi {
  /** Lleva la línea a la sección i (animado por defecto). */
  irA: (i: number, animar?: boolean) => void
  /** Pone la línea en t sin animar (scroll móvil). */
  irT: (t: number) => void
  paso: (d: number) => void
  /** La línea baja sola hasta t: el gesto que enseña la placa. Una sola vez, sin bucle. */
  barrer: (t: number, o?: { delay?: number; duration?: number; vuelta?: boolean }) => gsap.core.Tween
  /** Recibe el índice de cada sección la primera vez que la línea la cruza (la tabla del inspector se descubre a su paso). */
  alTrazar: (f: ((i: number) => void) | null) => void
  marco: () => HTMLElement | null
  /** La ventana que enseña la hoja: el destino del vuelo tarjeta → ficha. */
  ventana: () => HTMLElement | null
  t: () => number
}

interface Props {
  placa: Datos
  nombre: string
  /** Texto a la izquierda de la fila de capas (título de la placa o «Capa sobre la línea»). */
  titulo: ReactNode
  /** Fila superior opcional (pestañas Inicio | Producto × Escritorio | Móvil). */
  fila1?: ReactNode
  activa: number
  onActiva: (i: number) => void
  resaltada: number | null
  prioridad?: boolean
  t0?: number
  clase?: string
  /** id de la tabla del inspector equivalente: el asa lo declara en aria-controls. */
  tablaId?: string
}

export const Placa = forwardRef<PlacaApi, Props>(function Placa({ placa, nombre, titulo, fila1, activa, onActiva, resaltada, prioridad, t0 = 0.15, clase = '', tablaId }, ref) {
  const c = useCopy()
  const { locale } = useLanguage()
  const fmt = useMemo(() => formatoN(locale), [locale])
  const { capa } = useK()
  const marco = useRef<HTMLElement>(null)
  const ventana = useRef<HTMLDivElement>(null)
  const hoja = useRef<HTMLDivElement>(null)
  const regla = useRef<HTMLDivElement>(null)
  const xray = useRef<HTMLDivElement>(null)
  const asa = useRef<HTMLDivElement>(null)
  const grip = useRef<HTMLDivElement>(null)
  const lec = useRef<HTMLParagraphElement>(null)
  const lecH = useRef(30)
  const traza = useRef<((i: number) => void) | null>(null)
  const banda = useRef<HTMLElement>(null)
  const marca = useRef<HTMLElement>(null)
  const grupos = useRef<(SVGGElement | null)[]>([])
  const [dim, setDim] = useState({ w: 0, h: 0 })
  const dimRef = useRef(dim)
  const tRef = useRef(t0)
  const actRef = useRef(-1)
  const dibujado = useRef<boolean[]>([])
  const tween = useRef<gsap.core.Tween | null>(null)
  const arr = useRef(false)
  const guia = useRef({ top: 0, span: 1 })
  const onActivaRef = useRef(onActiva)
  onActivaRef.current = onActiva
  const [bloq, setBloq] = useState(false)
  const [pista, setPista] = useState(true)

  const k = dim.w ? dim.w / placa.ancho : 0
  const alto = placa.alto * k
  const id = `${placa.slug}-${placa.vista}-${placa.vp}`

  const aplicar = useCallback(
    (t0n: number) => {
      const t = Math.min(1, Math.max(0, t0n))
      tRef.current = t
      const { w, h } = dimRef.current
      if (!w || !hoja.current || !xray.current || !asa.current || !grip.current || !lec.current || !regla.current) return
      const kk = w / placa.ancho
      const H = placa.alto * kk
      const pan = t * Math.max(H - h, 0)
      const ly = t * Math.min(h, H)
      const tr = `translate3d(0,${-pan}px,0)`
      hoja.current.style.transform = tr
      regla.current.style.transform = tr
      xray.current.style.clipPath = `inset(0 0 ${Math.max(H - pan - ly, 0)}px 0)`
      asa.current.style.transform = `translate3d(0,${ly}px,0)`
      grip.current.style.transform = `translate3d(0,${Math.min(Math.max(ly, 23), Math.max(h - 23, 23))}px,0)`
      // La lectura va sobre la línea (dentro del asa); bajo ella solo cuando no cabe arriba. La altura la cachea un ResizeObserver.
      const abajo = ly < lecH.current + 14 ? '1' : '0'
      if (lec.current.dataset.ab !== abajo) lec.current.dataset.ab = abajo
      if (marca.current) marca.current.style.transform = `translate3d(0,${t * h}px,0)`
      if (banda.current) banda.current.style.transform = `translate3d(0,${(pan / H) * h}px,0)`
      const yPag = t * placa.alto
      const gs = grupos.current
      for (let i = 0; i < placa.secs.length; i++) {
        if (!dibujado.current[i] && placa.secs[i].y <= yPag) {
          dibujado.current[i] = true
          gs[i]?.setAttribute('data-dib', '1')
          traza.current?.(i)
        }
      }
      const idx = seccionEn(placa.secs, yPag)
      if (idx !== actRef.current) {
        actRef.current = idx
        onActivaRef.current(idx)
      }
    },
    [placa],
  )

  // Medida de la ventana: síncrona al montar y por ResizeObserver después (nunca en pointermove).
  useLayoutEffect(() => {
    const el = ventana.current
    if (!el) return
    const medir = () => {
      const r = el.getBoundingClientRect()
      const n = { w: Math.round(r.width), h: Math.round(r.height) }
      if (n.w !== dimRef.current.w || n.h !== dimRef.current.h) {
        dimRef.current = n
        setDim(n)
      }
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Cada vez que cambia la medida o la placa, la línea se recoloca (y la placa nueva empieza sin secciones dibujadas).
  useLayoutEffect(() => {
    actRef.current = -1
    if (dibujado.current.length) dibujado.current = []
    aplicar(tRef.current)
  }, [dim, id, aplicar])

  useEffect(() => () => void tween.current?.kill(), [])
  useEffect(() => {
    const el = lec.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => { lecH.current = e.borderBoxSize?.[0]?.blockSize ?? e.contentRect.height })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const irT = useCallback((t: number) => {
    tween.current?.kill()
    aplicar(t)
  }, [aplicar])
  const aT = useCallback((i: number) => centroDe(placa.secs, Math.min(Math.max(i, 0), placa.secs.length - 1)) / placa.alto, [placa])
  const irA = useCallback(
    (i: number, animar = true) => {
      tween.current?.kill()
      const t = aT(i)
      if (!animar) return aplicar(t)
      const prox = { v: tRef.current }
      tween.current = gsap.to(prox, { v: t, duration: 0.45, ease: 'k-out', onUpdate: () => aplicar(prox.v) })
    },
    [aT, aplicar],
  )
  useImperativeHandle(
    ref,
    () => ({
      irA,
      irT,
      paso: (d) => irA(Math.min(Math.max(actRef.current + d, 0), placa.secs.length - 1)),
      barrer: (t, o = {}) => {
        tween.current?.kill()
        const prox = { v: tRef.current }
        tween.current = gsap.to(prox, { v: t, duration: o.duration ?? 1.2, delay: o.delay ?? 0, ease: EASE_LINEA, yoyo: !!o.vuelta, repeat: o.vuelta ? 1 : 0, onUpdate: () => aplicar(prox.v) })
        return tween.current
      },
      alTrazar: (f) => { traza.current = f },
      marco: () => marco.current,
      ventana: () => ventana.current,
      t: () => tRef.current,
    }),
    [irA, irT, aplicar, placa],
  )

  // ---- arrastre: pointerdown captura, pointermove escribe, pointerup suelta
  const empezar = (e: PointerEvent<HTMLElement>, tipo: 'ventana' | 'mini') => {
    if (e.button !== 0) return
    if (e.pointerType === 'touch' && tipo === 'ventana' && !bloq) return // el scroll de la página sigue siendo del dedo
    const v = ventana.current
    if (!v) return
    tween.current?.kill()
    const r = v.getBoundingClientRect()
    const { h, w } = dimRef.current
    guia.current = { top: r.top, span: tipo === 'mini' ? h : Math.min(h, placa.alto * (w / placa.ancho)) }
    e.currentTarget.setPointerCapture(e.pointerId)
    arr.current = true
    v.classList.add('arr')
    setPista(false)
    aplicar((e.clientY - guia.current.top) / guia.current.span)
  }
  const mover = (e: PointerEvent<HTMLElement>) => {
    if (arr.current) aplicar((e.clientY - guia.current.top) / guia.current.span)
  }
  const soltar = () => {
    arr.current = false
    ventana.current?.classList.remove('arr')
  }
  const tecla = (e: KeyboardEvent) => {
    const n = placa.secs.length
    const a = Math.max(actRef.current, 0)
    const dest = e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? a - 1 : e.key === 'ArrowDown' || e.key === 'ArrowRight' ? a + 1 : e.key === 'PageUp' ? a - 3 : e.key === 'PageDown' ? a + 3 : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null
    if (dest === null) return
    e.preventDefault()
    setPista(false)
    irA(dest)
  }

  const secs = placa.secs
  const sec = secs[Math.min(Math.max(activa, 0), secs.length - 1)]
  const aros = useMemo(() => anillos(secs), [secs])
  const ticks = useMemo(() => {
    const out: number[] = []
    for (let y = 100; y < placa.alto; y += 100) out.push(y)
    return out
  }, [placa])
  const txtSec = sec ? `${sec.k}, ${fmt(sec.h)} px${sec.islas.length ? `, ${c.placa.isla}` : ''}${sec.dd.length ? `, ${c.placa.medida}` : ''}` : ''
  const fecha = placa.fecha

  return (
    <figure ref={marco} className={`k-placa ${clase}`} data-capa={capa} data-bloq={bloq || undefined} aria-label={c.placa.aria(nombre)}>
      {fila1}
      <div className="k-ph">
        <span className="k-ph-t">{titulo}</span>
        <SegCapa className="k-seg--placa" />
      </div>
      <div className="k-pbody">
        <div className="k-regla">
          <div ref={regla} className="k-regla-i" aria-hidden="true">
            {k > 0 &&
              ticks.map((y) => (
                <i key={y} className={y % 500 === 0 ? 'l' : undefined} style={{ top: y * k }}>
                  {y % 500 === 0 && <em>{fmt(y)}</em>}
                </i>
              ))}
          </div>
          <div
            ref={grip}
            className="k-grip"
            role="slider"
            tabIndex={0}
            aria-orientation="vertical"
            aria-label={c.placa.asa}
            aria-valuemin={1}
            aria-valuemax={secs.length}
            aria-valuenow={Math.max(activa, 0) + 1}
            aria-valuetext={txtSec}
            aria-describedby={`${id}-ayuda`}
            aria-controls={tablaId}
            onKeyDown={tecla}
            onPointerDown={(e) => empezar(e, 'ventana')}
            onPointerMove={mover}
            onPointerUp={soltar}
            onPointerCancel={soltar}
          >
            <i /><i /><i />
          </div>
        </div>
        <div
          ref={ventana}
          className="k-ventana"
          onPointerDown={(e) => empezar(e, 'ventana')}
          onPointerMove={mover}
          onPointerUp={soltar}
          onPointerCancel={soltar}
        >
          {k > 0 && (
            <div ref={hoja} key={id} className="k-hoja" style={{ width: dim.w, height: alto }}>
              <img
                className="k-piel"
                src={placa.img}
                width={placa.imgAncho}
                height={placa.imgAlto}
                alt={c.placa.alt(nombre, placa.vista, fecha)}
                loading={prioridad ? 'eager' : 'lazy'}
                fetchPriority={prioridad ? 'high' : undefined}
                decoding="async"
                draggable={false}
              />
              <div ref={xray} className="k-xray">
                <div className="k-esq" aria-hidden="true">
                  <svg width={dim.w} height={alto}>
                    {secs.map((s, i) => (
                      <g key={i} ref={(el) => { grupos.current[i] = el }} className="k-sec" data-on={i === activa} data-hl={i === resaltada}>
                        <rect className="k-skh" pathLength={1} x={0.5} y={s.y * k + 0.5} width={dim.w - 1} height={Math.max(s.h * k - 1, 1)} />
                        <rect className="k-ski" pathLength={1} x={0.5} y={s.y * k + 0.5} width={dim.w - 1} height={Math.max(s.h * k - 1, 1)} />
                      </g>
                    ))}
                  </svg>
                  {secs.map((s, i) =>
                    s.h * k >= 30 ? (
                      <b key={i} className="k-chip" data-on={i === activa} data-hl={i === resaltada} style={{ top: s.y * k + 8 }}>
                        <span className="k-k">{s.k}</span>
                        <span className="k-h">{fmt(s.h)} px</span>
                        {s.islas.length > 0 && <u>{c.placa.isla}</u>}
                      </b>
                    ) : null,
                  )}
                </div>
                <div className="k-med" aria-hidden="true">
                  <svg width={dim.w} height={alto}>
                    {aros.map((a, i) =>
                      a.w * k >= 10 && a.h * k >= 10 ? (
                        <g key={i}>
                          <rect className="k-aroh" x={a.x * k + 4} y={a.y * k + 4} width={Math.max(a.w * k - 8, 1)} height={Math.max(a.h * k - 8, 1)} />
                          <rect className="k-aroi" x={a.x * k + 4} y={a.y * k + 4} width={Math.max(a.w * k - 8, 1)} height={Math.max(a.h * k - 8, 1)} />
                        </g>
                      ) : null,
                    )}
                  </svg>
                  {aros.map((a, i) =>
                    a.w * k >= 44 && a.h * k >= 36 ? (
                      <b key={i} className="k-aro-n" title={a.nombres.join(' · ')} style={{ left: (a.x + a.w) * k - 8, top: a.y * k + 9 }}>
                        {a.n > 1 ? `×${a.n}` : '1'}
                      </b>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          )}
          <div ref={asa} className="k-asa" aria-hidden="true">
            <p ref={lec} className="k-lec" data-ab="0">
              {sec && (
                <>
                  <b>{sec.k}</b>
                  <i>·</i>
                  <span>{fmt(sec.h)} px</span>
                  {sec.islas.length > 0 && <u>{c.placa.isla}</u>}
                  {sec.dd.length > 0 && <u>{c.placa.medida}</u>}
                </>
              )}
            </p>
          </div>
          {pista && <p className="k-pista" aria-hidden="true">{c.placa.arrastra}<Flecha dir="abajo" /></p>}
        </div>
        <div className="k-mini" aria-hidden="true" onPointerDown={(e) => empezar(e, 'mini')} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}>
          {secs.map((s, i) => (
            <i key={i} className="k-mini-b" style={{ top: `${(s.y / placa.alto) * 100}%`, height: `calc(${(s.h / placa.alto) * 100}% - 2px)` }} />
          ))}
          <b ref={banda} className="k-mini-banda" style={{ height: dim.h && alto ? `${Math.min(dim.h / alto, 1) * 100}%` : '100%' }} />
          <b ref={marca} className="k-mini-marca" />
        </div>
      </div>
      <figcaption className="k-pf">
        <span className="k-leyenda" aria-hidden="true">
          <span><i className="g-as" />{c.placa.leyAsa}</span>
          <span><i className="g-sk" />{c.placa.leySec}</span>
          <span><i className="g-rg" />{c.placa.leyMed}</span>
        </span>
        <span className="k-pasos">
          <button type="button" className="k-ico" aria-label={c.placa.anterior} onClick={() => { setPista(false); irA(Math.max(actRef.current - 1, 0)) }}><Flecha dir="arriba" /></button>
          <button type="button" className="k-ico" aria-label={c.placa.siguiente} onClick={() => { setPista(false); irA(Math.min(actRef.current + 1, secs.length - 1)) }}><Flecha dir="abajo" /></button>
          <button type="button" className="k-bloq" aria-pressed={bloq} onClick={() => setBloq((b) => !b)}>{bloq ? c.placa.desbloquear : c.placa.bloquear}</button>
        </span>
        <span className="k-pf-d">{fmt(placa.alto)} px · {fecha}</span>
        <span id={`${id}-ayuda`} className="k-sr">{c.placa.ayuda}</span>
      </figcaption>
    </figure>
  )
})
