import { useLayoutEffect, useRef, useState } from 'react'
import { sinPuntoFinal, useV5, v5path } from '../data'
import { evento } from '../shared/contacto'
import { Cabeza, frases } from './Cabeza'
import { useCopy } from './copy'
import { Inspector } from './Inspector'
import { centroDe, idTabla, placaDe } from './medicion'
import { CORTE, filasAlPaso, gsap, revelar, useEscena } from './motion'
import { KLink } from './nav'
import { Placa, type PlacaApi } from './Placa'
import { Regleta } from './Regleta'
import { useMedia } from './useMedia'

/** La línea reposa en esta sección de la placa 01 (NOS Café, inicio) cuando termina de enseñar el gesto. Con el modelo 1:1 de la placa
 *  (la sección bajo la línea es t·alto) 'favoritos-carousel' deja la línea al 16 % de la ventana: solo 76 px de rayos X, sin rótulo ni anillo.
 *  'categorias' (t = 0,25) enseña rótulo, anillo ×2, lectura y las cuatro categorías legibles bajo la línea. */
const REPOSO = 'categorias'
/** Barra inferior fija del móvil (64 px) y respiro bajo la placa: lo que la primera pantalla no puede usar. */
const BARRA = 64

export default function Inicio() {
  const c = useCopy()
  const { strings, obra, storeCount } = useV5()
  const nos = obra('nos-cafe')
  // En móvil la placa es la captura de 390 px (legible a escala 0,8); la de escritorio a 288 px de ancho quedaba a escala 0,2.
  const movil = useMedia('(max-width: 767px)')
  const p = placaDe('nos-cafe', 'home', movil && placaDe('nos-cafe', 'home', 'mobile') ? 'mobile' : 'desktop')
  const iReposo = Math.max(p.secs.findIndex((s) => s.k === REPOSO), 0)
  const t0 = centroDe(p.secs, iReposo) / p.alto
  const [activa, setActiva] = useState(iReposo)
  const [hover, setHover] = useState<number | null>(null)
  const api = useRef<PlacaApi>(null)
  const raiz = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const lineas = frases(strings.hero.positioning, sinPuntoFinal)

  // Móvil: la placa ocupa lo que queda de la primera pantalla bajo el titular (mínimo 46 svh) y su pie entra en el pliegue.
  useLayoutEffect(() => {
    const g = grid.current
    if (!g) return
    if (!movil) {
      g.style.removeProperty('--ph')
      return
    }
    const medir = () => {
      const libre = window.innerHeight - BARRA - (g.getBoundingClientRect().top + window.scrollY) - 12
      g.style.setProperty('--ph', `${Math.round(Math.max(libre, window.innerHeight * 0.46))}px`)
    }
    medir()
    const ro = new ResizeObserver(medir)
    for (const e of raiz.current!.querySelectorAll('.k-meta, .k-h1')) ro.observe(e)
    window.addEventListener('resize', medir)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [movil])

  useEscena(raiz, () => {
    const a = api.current
    if (!a) return
    const filas = filasAlPaso(raiz.current!, a.alTrazar)
    a.irT(0)
    const tl = gsap.timeline({ defaults: { ease: 'k-out', clearProps: 'clipPath,transform,opacity' } })
    // Todo se descubre con cortes: lo largo de izquierda a derecha, lo alto de arriba abajo. La línea manda el resto.
    tl.from('.k-meta > *', { clipPath: CORTE.etiqueta.from, duration: 0.5, stagger: 0.08 }, 0)
    tl.from('.k-h1 .k-l', { clipPath: CORTE.bloque.from, yPercent: 28, duration: 0.7, stagger: 0.1 }, 0.06)
    tl.from('.k-lee', { clipPath: CORTE.bloque.from, duration: 0.55 }, 0.4)
    tl.from(a.marco(), { clipPath: 'inset(0 100% 0 0)', duration: 0.6 }, 0.28)
    tl.from('.k-inicio-grid > .k-insp', { clipPath: CORTE.bloque.from, duration: 0.5 }, 0.3)
    a.barrer(t0, { delay: 0.34, duration: 0.82 })
    tl.from('.k-prov, .k-accion', { clipPath: CORTE.etiqueta.from, duration: 0.5, stagger: 0.08 }, 0.7)
    tl.from('.k-rg-l', { clipPath: CORTE.etiqueta.from, duration: 0.5 }, 0.55)
    tl.from('.k-rg-u li', { clipPath: 'inset(100% 0 0 0)', duration: 0.45, stagger: 0.02 }, 0.55)
    tl.call(filas.resto, [], 1.2)
    const fin = revelar(raiz.current!, '.k-regleta')
    return () => {
      filas.limpiar()
      fin()
    }
  }, [])

  return (
    <div ref={raiz} className="k-inicio k-pag">
      <Cabeza titulo={c.inicio.titulo} />
      <div className="k-meta k-mono">
        <span>{strings.hero.eyebrow}</span>
        <span>{c.inicio.meta(storeCount)}</span>
      </div>
      <div className="k-titular">
        <h1 className="k-h1">
          {lineas.map((f, i) => (
            <span key={i}>
              <span className="k-l">{f}</span>{' '}
            </span>
          ))}
        </h1>
        <div className="k-lee">
          <p className="k-mono k-lee-t">{c.inicio.comoSeLee}</p>
          <p>{c.inicio.comoSeLeeTexto}</p>
        </div>
      </div>
      <div ref={grid} className="k-inicio-grid">
        <Placa
          ref={api}
          clase="k-placa--inicio"
          placa={p}
          nombre={nos?.name ?? 'NOS Café'}
          titulo={c.inicio.placaTitulo('01', nos?.name ?? 'NOS Café')}
          activa={activa}
          onActiva={setActiva}
          resaltada={hover}
          prioridad
          t0={t0}
          tablaId={idTabla(p)}
        />
        <Inspector placa={p} activa={activa} onIr={(i) => api.current?.irA(i)} onHover={setHover} compacto titulo={c.insp.titulo(c.vistas.home)}>
          <div className="k-accion">
            <KLink className="k-btn" to={v5path('k', 'contacto')} onClick={() => evento('k', 'contact_click', { canal: 'cta_inicio' })}>{c.pedir}</KLink>
            <p className="k-nota">{c.pedirNota}</p>
          </div>
        </Inspector>
      </div>
      <Regleta activo="nos-cafe" />
    </div>
  )
}
