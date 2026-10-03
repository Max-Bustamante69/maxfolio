import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { v5path, useV5 } from '../data'
import { evento } from '../shared/contacto'
import { useCopy } from './copy'
import { type ObraLibro } from './datos'
import { Datos, Texto, Tira } from './Hoja'
import { aperturaDeFila, cierreDeFila, fotoDelFlujo, gsap, guardarCompartido, reflujo, traerAVista } from './movimiento'
import { Chevron, Flecha } from './piezas'
import { publicarAbiertas, recordarSitio, recordarVolver, useSitio } from './sitio'

// El libro: una obra = una fila (Nº · nombre · rubro · año · rol · periodo). La fila es un <button aria-expanded>
// y se despliega en línea al toque o al Enter; el enlace «Abrir ficha» vive dentro del panel (un solo enlace real por fila).

const EJE_INICIO = 2022 * 12
const EJE_MESES = 60 // 2022-01 a 2026-12
const mes = (ym: string) => { const [y, m] = ym.split('-').map(Number); return y * 12 + (m - 1) - EJE_INICIO }

/** Ventana de construcción real sobre el eje 2022-2026. Decorativa: el periodo en texto va para lectores de pantalla. */
function BarraPeriodo({ o }: { o: ObraLibro }) {
  const { formatPeriod } = useV5()
  if (!o.period) return <span className="a-barra" />
  const a = Math.max(0, mes(o.period.start))
  const b = Math.min(EJE_MESES - 1, mes(o.period.end))
  return (
    <span className="a-barra">
      <span className="a-sr">{formatPeriod(o.period.start, o.period.end)}</span>
      <span className="a-barra-eje" aria-hidden="true">
        <span style={{ insetInlineStart: `${(a / EJE_MESES) * 100}%`, width: `${((b - a + 1) / EJE_MESES) * 100}%` }} />
      </span>
    </span>
  )
}

/** Estado de las filas abiertas. Abrir: la altura cambia en el acto y lo de abajo se acomoda con Flip (solo transform) y la fila
 *  se trae a la vista; cerrar: el panel se recorta y después se desmonta. Con el teclado (click sin ratón, detail 0) no se anima:
 *  la casa no anima lo que dispara el teclado. `inicial` es la fila que nace abierta (la entrada de la vista la anima); si se llega
 *  por Atrás o «← Libro», manda lo que había abierto al salir, tal cual y sin animar. */
export function useDespliegue(inicial?: string) {
  const sitio = useSitio()
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set(sitio ? sitio.abiertas : inicial ? [inicial] : []))
  const animar = useRef(false) // lo que ya está abierto al montar no se anima aquí
  const ocupado = useRef(false)
  useEffect(() => {
    publicarAbiertas(abiertas) // para recordarlas al salir (sitio.ts)
    return () => publicarAbiertas([])
  }, [abiertas])
  const alternar = (clave: string, e: MouseEvent<HTMLElement>, alAbrir?: () => void) => {
    if (ocupado.current) return
    const li = e.currentTarget.closest('li') as HTMLElement
    const abre = !abiertas.has(clave)
    if (abre) alAbrir?.()
    const cambia = () => setAbiertas((prev) => { const n = new Set(prev); if (!n.delete(clave)) n.add(clave); return n })
    animar.current = e.detail !== 0
    if (!animar.current) {
      cambia()
      if (abre) traerAVista(li, true)
      return
    }
    const foto = fotoDelFlujo()
    const aplicar = () => { flushSync(cambia); reflujo(foto); ocupado.current = false; if (abre) traerAVista(li, false) }
    if (abre) return aplicar()
    ocupado.current = true
    cierreDeFila(li, aplicar)
  }
  return { abiertas, alternar, animar }
}

/** Panel de una fila abierta: al montarse, la fila se entinta y su contenido se corta hacia dentro. */
export function Panel({ id, etiqueta, animar, clase, children }: { id: string; etiqueta: string; animar: boolean; clase: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const li = ref.current?.closest('li')
    if (!animar || !li) return
    const ctx = gsap.context(() => aperturaDeFila(li), li)
    return () => ctx.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return <div ref={ref} id={id} className={`a-panel ${clase}`} role="region" aria-label={etiqueta}>{children}</div>
}

/** «Abrir ficha»: el nombre y la tinta de la fila viajan a la ficha (vuelo); lo demás se apaga en 110 ms. Antes de salir se recuerda
 *  el sitio (posición y filas abiertas) y de dónde se vino, para que Atrás y «← Libro» devuelvan al mismo lugar. */
function useAbrirFicha() {
  const navigate = useNavigate()
  return (e: MouseEvent<HTMLAnchorElement>, a: string, slug: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    recordarSitio()
    recordarVolver(slug)
    const li = e.currentTarget.closest('li')
    if (!li) return navigate(a)
    guardarCompartido(li, a)
    const resto = Array.from(document.querySelectorAll('#contenido [data-a-flip], #contenido [data-a="entra"]')).filter((x) => x !== li && !li.contains(x))
    gsap.to(resto, { opacity: 0, duration: 0.11, ease: 'none', onComplete: () => navigate(a) })
  }
}

function PanelFicha({ id, o, animar }: { id: string; o: ObraLibro; animar: boolean }) {
  const c = useCopy().panel
  const abrir = useAbrirFicha()
  const a = v5path('a', 'obra', o.slug)
  return (
    <Panel id={id} etiqueta={o.name} animar={animar} clase="a-panel-obra">
      <div className="a-panel-izq">
        <Tira o={o} />
        <p className="a-enlaces">
          <a className="a-boton a-boton-inv" href={a} onClick={(e) => abrir(e, a, o.slug)}>{c.abrirFicha}<Flecha tipo="derecha" /></a>
          {o.link && (
            <a className="a-enlace" href={o.link} target="_blank" rel="noopener noreferrer">
              {o.kind === 'store' ? c.verTienda : c.verSitio}<Flecha tipo="externa" />
            </a>
          )}
        </p>
      </div>
      <div className="a-panel-der">
        <Datos o={o} compacto />
        <Texto o={o} />
      </div>
    </Panel>
  )
}

function Fila({ o, abierta, alTocar, animar }: { o: ObraLibro; abierta: boolean; alTocar: (e: MouseEvent<HTMLButtonElement>) => void; animar: boolean }) {
  const c = useCopy()
  const id = useId()
  return (
    <li className="a-item" data-a-flip data-clave={o.slug} data-abierta={abierta || undefined}>
      {abierta && <span className="a-tinta" data-flip-id="a-tinta" aria-hidden="true" />}
      <button type="button" className="a-fila" aria-expanded={abierta} aria-controls={abierta ? id : undefined} onClick={alTocar}>
        <span className="a-num">{o.n ?? ''}</span>
        <span className="a-nom"><span className="a-nom-txt" data-flip-id={abierta ? 'a-nombre' : undefined}>{o.name}</span></span>
        <span className="a-meta a-sec">
          <span className="a-rub">{o.industry ?? c.tipos[o.kind]}</span>
          <span className="a-ano">{o.year}</span>
          <span className="a-rol">{o.rolLabel ?? ''}</span>
        </span>
        <BarraPeriodo o={o} />
        <Chevron />
      </button>
      {abierta && <PanelFicha id={id} o={o} animar={animar} />}
      <span className="a-regla" aria-hidden="true" />
    </li>
  )
}

/** `abiertaInicial`: la fila que nace abierta (en el inicio, la fila de firma: se ve de entrada que cada fila se abre). */
export function Libro({ obras, agrupar, titulo, abiertaInicial }: { obras: ObraLibro[]; agrupar: boolean; titulo?: string; abiertaInicial?: string }) {
  const c = useCopy()
  const { eras } = useV5()
  const { abiertas, alternar, animar } = useDespliegue(abiertaInicial)
  const lista = (l: ObraLibro[]) => (
    <ol className="a-lista">
      {l.map((o) => (
        <Fila key={o.slug} o={o} abierta={abiertas.has(o.slug)} animar={animar.current} alTocar={(e) => alternar(o.slug, e, () => evento('a', 'obra_open', { slug: o.slug, via: 'fila' }))} />
      ))}
    </ol>
  )
  const grupos = agrupar ? [...new Set(obras.map((o) => o.year))].map((y) => ({ y, l: obras.filter((o) => o.year === y) })) : []
  return (
    <section className="a-libro" aria-label={titulo ?? c.libro.titulo}>
      <div className="a-cols a-sec" aria-hidden="true" data-a="entra">
        <span className="a-cols-titulo">{titulo ?? c.libro.titulo}</span>
        <span className="a-num">{c.libro.cols.num}</span><span className="a-nom">{c.libro.cols.obra}</span>
        <span className="a-rub">{c.libro.cols.rubro}</span><span className="a-ano">{c.libro.cols.anio}</span>
        <span className="a-rol">{c.libro.cols.rol}</span><span className="a-barra">{c.libro.cols.periodo}</span>
      </div>
      {obras.length === 0 && <p className="a-vacio">{c.libro.vacio}</p>}
      {agrupar ? (
        grupos.map(({ y, l }, i) => (
          <div className="a-grupo-anio" key={y}>
            <div className="a-anio a-sec" data-a-flip>
              <h2>
                <b>{y}</b>
                {eras[String(y)] && <span>{eras[String(y)]}</span>}
              </h2>
              {i === 0 && <span className="a-pista" aria-hidden="true">{c.libro.pista}<Chevron /></span>}
            </div>
            {lista(l)}
          </div>
        ))
      ) : (
        lista(obras)
      )}
    </section>
  )
}

