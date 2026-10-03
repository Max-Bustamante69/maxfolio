import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PLANTILLA, altoDe, esFina, hex, pielDe, recortesDe, type Recorte, type RolId, ROLES } from './datos'
import { consumirVuelo, gsap, volverA } from './motion'
import { claveDe, useNombreDe } from './Tira'
import { Enlace, Equis, Flecha, conParam, ruta, useL } from './ui'

// El visor de un recorte: diálogo modal con URL propia (?ver=<pieza>.<tienda>). Esc y Atrás lo cierran, el foco vuelve al tile,
// las flechas y el deslizamiento avanzan dentro de la MISMA pieza: cambia la tienda, la pieza se queda donde está.
// Las piezas finas (anuncio, cabecera) no se enseñan una a una: se apilan todas las barras de la pieza bajo una misma línea y la
// actual queda marcada; las flechas mueven la marca. El visor es entonces el comparador de la pieza.

type Vars = CSSProperties & Record<`--${string}`, string | number>

const parse = (ver: string | null): { rol: RolId; slug: string } | null => {
  const [rol, ...resto] = (ver ?? '').split('.')
  return (ROLES as string[]).includes(rol) && resto.length ? { rol: rol as RolId, slug: resto.join('.') } : null
}

export default function Visor() {
  const { c, v5, movil } = useL()
  const loc = useLocation()
  const navigate = useNavigate()
  const nombreDe = useNombreDe()
  const dlg = useRef<HTMLDialogElement>(null)
  const caja = useRef<HTMLDivElement>(null)
  const previaLoc = useRef(loc)
  const cierraConAtras = useRef(false)
  const cerrando = useRef(false)
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const p = parse(new URLSearchParams(loc.search).get('ver'))
  const items = p ? recortesDe(p.rol) : []
  const idx = p ? items.findIndex((r) => r.slug === p.slug) : -1
  const actual: Recorte | undefined = idx >= 0 ? items[idx] : undefined

  // Cómo se cerrará: si el visor se abrió desde esta misma página con un enlace, «Atrás» vuelve; si se llegó directo, se reemplaza.
  useEffect(() => {
    const antes = previaLoc.current
    if (actual && !new URLSearchParams(antes.search).get('ver')) cierraConAtras.current = antes.pathname === loc.pathname
    previaLoc.current = loc
  }, [loc, actual])

  const sinVer = useCallback(() => {
    const destino = { pathname: loc.pathname, search: conParam(loc.search, 'ver', null) }
    if (cierraConAtras.current && (window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate(destino, { replace: true, preventScrollReset: true })
  }, [loc.pathname, loc.search, navigate])

  // Abrir / cerrar el diálogo según haya recorte pedido en la URL.
  const abierto = !!actual
  const tileRef = useRef<Element | null>(null)
  useLayoutEffect(() => {
    const d = dlg.current
    if (!d) return
    if (abierto && !d.open) {
      cerrando.current = false
      d.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!abierto && d.open) {
      d.close()
      document.documentElement.style.overflow = ''
      const tile = tileRef.current
      if (tile instanceof HTMLElement && document.contains(tile)) tile.focus({ preventScroll: true })
    }
  }, [abierto])
  // Animación de apertura: el recorte vuela desde su tile y el resto encaja (con contexto GSAP propio, reversible).
  useLayoutEffect(() => {
    const d = dlg.current
    if (!abierto || !d) return
    const ctx = gsap.context(() => {
      gsap.fromTo(d, { '--fondo': 0 }, { '--fondo': 1, duration: 0.3, ease: 'power2.out' })
      gsap.from(d.querySelectorAll('.l-vside > *, .l-vbar > *'), { opacity: 0, y: 10, duration: 0.45, ease: 'l-encaje', stagger: 0.03, delay: 0.12, clearProps: 'opacity,transform' })
      gsap.from(d.querySelector('.l-vbg'), { opacity: 0, duration: 0.2, ease: 'power2.out' })
      consumirVuelo(d)
    }, d)
    return () => ctx.revert()
  }, [abierto])
  useEffect(() => () => void (document.documentElement.style.overflow = ''), [])
  useEffect(() => {
    if (p) tileRef.current = document.querySelector(`[data-tile="${p.rol}.${p.slug}"]`) ?? tileRef.current
  }, [p?.rol, p?.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cierre propio: el recorte vuelve volando a su tile; después se quita ?ver de la URL.
  const cerrar = useCallback(() => {
    const d = dlg.current
    if (!d || cerrando.current) return
    cerrando.current = true
    const foto = d.querySelector<HTMLElement>('[data-vuelo]')
    const tile = p ? document.querySelector(`[data-tile="${p.rol}.${p.slug}"] .l-pic`) : null
    const fin = () => sinVer()
    const tl = gsap.timeline({ onComplete: fin })
    tl.to(d.querySelectorAll('.l-vside > *, .l-vbar > *'), { opacity: 0, duration: 0.14, ease: 'power2.out' }, 0)
    tl.to(d.querySelector('.l-vbg'), { opacity: 0, duration: 0.24, ease: 'power2.out' }, 0.06)
    tl.to(d, { '--fondo': 0, duration: 0.26, ease: 'power2.out' }, 0)
    if (foto && tile && tile.getBoundingClientRect().height > 0) tl.add(volverA(foto, tile), 0)
    else tl.to(foto, { opacity: 0, duration: 0.2 }, 0)
  }, [p, sinVer])

  // Cambio de tienda dentro de la misma pieza: cruce por opacidad de 160 ms; la cota y la línea se reajustan.
  const [previo, setPrevio] = useState<Recorte | null>(null)
  const ultimo = useRef<Recorte | undefined>(undefined)
  useLayoutEffect(() => {
    const ant = ultimo.current
    ultimo.current = actual
    if (ant && actual && ant.rol === actual.rol && ant.slug !== actual.slug && !esFina(actual.rol)) setPrevio(ant)
  }, [actual])
  useLayoutEffect(() => {
    if (!previo || !caja.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.l-vcur', { opacity: 0 }, { opacity: 1, duration: 0.16, ease: 'power1.out' })
      gsap.fromTo('.l-vprev', { opacity: 1 }, { opacity: 0, duration: 0.16, ease: 'power1.out', onComplete: () => setPrevio(null) })
      gsap.from('.l-vside .l-vsw, .l-vside .l-vnm, .l-vside .l-vkv', { opacity: 0, y: 6, duration: 0.3, ease: 'l-encaje', stagger: 0.025 })
    }, caja.current)
    return () => ctx.revert()
  }, [previo])

  const irA = useCallback(
    (r: Recorte) => navigate({ pathname: loc.pathname, search: conParam(loc.search, 'ver', `${r.rol}.${r.slug}`) }, { replace: true, preventScrollReset: true }),
    [navigate, loc.pathname, loc.search],
  )
  const ir = useCallback(
    (delta: number) => {
      if (!p || !items.length) return
      irA(items[(idx + delta + items.length) % items.length])
    },
    [p, items, idx, irA],
  )
  // En la pila de barras finas, la marca viaja a la barra elegida: se trae a la vista si hace falta.
  useLayoutEffect(() => {
    if (!actual || !esFina(actual.rol)) return
    caja.current?.querySelector<HTMLElement>('.l-vrow[data-actual="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [actual])

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(-1) }
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(1) }
  }
  const abajo = (e: PointerEvent) => { swipe.current = { x: e.clientX, y: e.clientY } }
  const arriba = (e: PointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x, dy = e.clientY - s.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) ir(dx < 0 ? 1 : -1)
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.4 && (caja.current?.querySelector('.l-vmain')?.scrollTop ?? 0) <= 0) cerrar()
  }

  const vis = actual
  const nombre = vis ? nombreDe(vis.slug) : ''
  const pieza = p ? c.piezas[p.rol].nombre : ''
  const fina = p ? esFina(p.rol) : false
  const maxh = items.length ? Math.max(...items.map((r) => altoDe(r, movil))) : 0
  const piel = vis ? pielDe(vis.slug) : null
  const o = vis ? v5.obra(vis.slug) : undefined
  const imgDe = (r: Recorte) => ({ src: `/v5/l/${movil && r.m ? 'm' : 'd'}/${r.slug}-${r.rol}.webp`, w: (movil && r.m ? r.m : r.d!).imgW, h: (movil && r.m ? r.m : r.d!).imgH })

  return (
    <dialog ref={dlg} className="l-dlg-v" aria-labelledby="l-v-t" onCancel={(e) => { e.preventDefault(); cerrar() }} onClick={(e) => { if (e.target === dlg.current) cerrar() }} onKeyDown={teclas}>
      {vis && p && (
        <div className="l-vbox" ref={caja}>
          <span className="l-vbg" aria-hidden="true" />
          <div className="l-vbar">
            <span className="l-mono l-vcount">
              {pieza} · {c.visor.de(idx + 1, items.length)}
            </span>
            <span className="l-sp" />
            <button type="button" className="l-vbtn" onClick={() => ir(-1)} aria-label={c.visor.anterior}>
              <Flecha dir="izq" />
            </button>
            <button type="button" className="l-vbtn" onClick={() => ir(1)} aria-label={c.visor.siguiente}>
              <Flecha />
            </button>
            <button type="button" className="l-vbtn l-vclose" onClick={cerrar} aria-label={c.visor.cerrar}>
              <Equis />
            </button>
          </div>
          <div className="l-vmain" onPointerDown={abajo} onPointerUp={arriba}>
            <div className="l-vstagewrap">
              {fina ? (
                <div className="l-vstage l-vpila" data-fina="true">
                  <ol className="l-vrows" aria-label={pieza}>
                    {items.map((r) => {
                      const act = r.slug === vis.slug
                      const im = imgDe(r)
                      return (
                        <li key={r.slug} className="l-vrow" data-actual={act}>
                          <button type="button" className="l-vrl" aria-current={act ? 'true' : undefined} onClick={() => irA(r)}>
                            <span className="l-vnom">{nombreDe(r.slug)}</span>
                            <span className="l-mono l-t">{altoDe(r, movil)} px</span>
                          </button>
                          <div className="l-vpicwrap" data-vuelo={act ? `${r.rol}.${r.slug}` : undefined}>
                            <img src={im.src} width={im.w} height={im.h} alt={act ? c.tira.alt(pieza, nombre, altoDe(r, movil)) : ''} />
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              ) : (
                <div className="l-vstage" style={{ '--maxh': maxh, '--h': altoDe(vis, movil), '--iw': movil ? 390 : 1440 } as Vars}>
                  <span className="l-vdatum" aria-hidden="true" />
                  <span className="l-vdim" aria-hidden="true" />
                  <b className="l-vcota" aria-hidden="true">
                    {altoDe(vis, movil)} px
                  </b>
                  <div className="l-vpicwrap" data-vuelo={`${vis.rol}.${vis.slug}`}>
                    {previo && <img className="l-vprev" src={imgDe(previo).src} width={imgDe(previo).w} height={imgDe(previo).h} alt="" />}
                    <img className="l-vcur" key={vis.slug} src={imgDe(vis).src} width={imgDe(vis).w} height={imgDe(vis).h} alt={c.tira.alt(pieza, nombre, altoDe(vis, movil))} />
                  </div>
                </div>
              )}
            </div>
            <p className="l-sr" role="status">
              {pieza} · {nombre} · {c.visor.de(idx + 1, items.length)}
            </p>
            <aside className="l-vside">
              <p className="l-mono l-ink2 l-vnm">{pieza}</p>
              <h2 id="l-v-t" className="l-vh l-vnm">
                {nombre}
              </h2>
              <dl className="l-vkvs">
                <div className="l-vkv">
                  <dt>{c.visor.clave}</dt>
                  <dd className="l-mono l-t">{vis.clave}</dd>
                </div>
                <div className="l-vkv">
                  <dt>{c.visor.isla}</dt>
                  <dd className="l-mono l-t">{vis.isla ?? c.visor.sinIsla}</dd>
                </div>
                <div className="l-vkv">
                  <dt>{c.visor.cota}</dt>
                  <dd className="l-mono l-t">{altoDe(vis, movil)} px</dd>
                </div>
                {piel && (
                  <>
                    <div className="l-vkv">
                      <dt>{c.visor.titulares}</dt>
                      <dd className="l-mono l-t">{piel.titulares}</dd>
                    </div>
                    <div className="l-vkv">
                      <dt>{c.visor.cuerpo}</dt>
                      <dd className="l-mono l-t">{piel.cuerpo}</dd>
                    </div>
                    <div className="l-vkv">
                      <dt>{c.visor.fondo}</dt>
                      <dd className="l-mono l-t l-vsw">
                        <i className={piel.fondo ? 'l-sw' : 'l-sw l-sw-none'} style={piel.fondo ? { background: hex(piel.fondo) } : undefined} />
                        {piel.fondo ? hex(piel.fondo) : c.visor.sinFondo}
                      </dd>
                    </div>
                  </>
                )}
                <div className="l-vkv">
                  <dt>{c.visor.medido}</dt>
                  <dd className="l-mono l-t">{vis.fecha}</dd>
                </div>
              </dl>
              <p className="l-mono l-t l-ink2 l-vnote">
                {claveDe(vis, c)} · {c.visor.plantilla(PLANTILLA.nombre)}
              </p>
              <p className="l-vhint l-ink2">{c.visor.mismaPieza}</p>
              {o && (
                <Enlace className="l-btn l-vlink" to={ruta('obra', vis.slug)} origen={() => dlg.current?.querySelector('[data-vuelo]')} vuelo={`foto.${vis.slug}`} onClick={() => { document.documentElement.style.overflow = '' }}>
                  {c.visor.verObra}
                </Enlace>
              )}
            </aside>
          </div>
        </div>
      )}
    </dialog>
  )
}
