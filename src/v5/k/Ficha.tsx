import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { datosDe, useV5, v5path, type Obra } from '../data'
import { evento } from '../shared/contacto'
import { pieDeCaptura, ShotImg } from '../shared/ShotImg'
import { Cabeza } from './Cabeza'
import { useCopy } from './copy'
import { Inspector } from './Inspector'
import { centroDe, formatoN, idTabla, motivoDe, placaDe, placasDe, RADIOGRAFIADAS, type Disp, type Vista } from './medicion'
import { CORTE, filasAlPaso, gsap, tomarOrigen, useEscena, volar } from './motion'
import { KLink } from './nav'
import { Placa, type PlacaApi } from './Placa'
import { Tira } from './Regleta'

export default function Ficha() {
  const { slug = '' } = useParams()
  const { obra } = useV5()
  const o = obra(slug)
  if (!o) return <NoExiste />
  return o.kind === 'store' && placaDe(slug) ? <FichaPlaca key={slug} o={o} /> : <FichaSimple key={slug} o={o} />
}

function NoExiste() {
  const c = useCopy()
  return (
    <div className="k-pag k-simple">
      <Cabeza titulo={c.ficha.noExiste} />
      <h1 className="k-h1 k-h1--sec"><span className="k-l">{c.ficha.noExiste}</span></h1>
      <KLink className="k-btn" to={v5path('k', 'obra')}>{c.ficha.volver}</KLink>
    </div>
  )
}

/** Celdas de la ficha de datos: cada cifra con rótulo, fuente y fecha (O6). */
function useCeldas(o: Obra) {
  const c = useCopy()
  const { formatPeriod, locale } = useV5()
  const mes = new Intl.DateTimeFormat(locale === 'es' ? 'es-CO' : locale === 'ja' ? 'ja-JP' : 'en-US', { month: 'long', year: 'numeric' })
  const d = datosDe(o.slug)
  const celdas: { k: string; v: string; s: string; href?: string }[] = []
  if (o.industry) celdas.push({ k: c.datos.rubro, v: o.industry, s: c.datos.registro })
  if (o.rolLabel) celdas.push({ k: c.datos.rol, v: o.rolLabel, s: `${c.datos.registro}${o.period ? ` · ${formatPeriod(o.period.start, o.period.end)}` : ''}` })
  else if (o.kind === 'product' || o.kind === 'personal') celdas.push({ k: c.datos.tipo, v: o.kind === 'product' ? c.tipos.product : c.tipos.personal, s: `${c.datos.registro} · ${o.year}` })
  if (o.stack.length) celdas.push({ k: c.datos.pila, v: o.stack.join(' · '), s: c.datos.registro })
  if (d.git) celdas.push({ k: c.datos.git, v: `${d.git.commits} commits · ${d.git.sections} ${c.datos.secciones}`, s: c.datos.gitNota(mes.format(new Date(`${d.git.fecha}T12:00:00`))) })
  if (d.lighthouse) {
    const m = d.lighthouse.movil
    celdas.push({ k: `${c.datos.lighthouse} ${c.datos.movil.toLowerCase()}`, v: `${c.datos.acc} ${m.a11y} · SEO ${m.seo} · ${c.datos.rend} ${m.perf}`, s: `${c.datos.lhNota(d.lighthouse.fecha)}` })
  }
  if (d.comercio) celdas.push({ k: c.datos.catalogo, v: c.datos.catalogoValor(d.comercio.products, d.comercio.collections ?? 0), s: `${c.datos.catalogoNota} · ${d.comercio.fecha}` })
  for (const f of o.facts.slice(0, 2)) celdas.push({ k: c.datos.hecho, v: `${f.label}: ${f.value}`, s: c.datos.registro })
  if (o.link) celdas.push({ k: c.datos.sitio, v: new URL(o.link).hostname.replace(/^www\./, ''), s: c.datos.sitioNota, href: o.link })
  return celdas.slice(0, 9)
}

function FichaDatos({ o }: { o: Obra }) {
  const celdas = useCeldas(o)
  const relleno = (3 - (celdas.length % 3)) % 3
  return (
    <dl className="k-dl">
      {celdas.map((x, i) => (
        <div key={i}>
          <dt>{x.k}</dt>
          <dd>
            {x.href ? <a href={x.href} target="_blank" rel="noopener noreferrer">{x.v}</a> : x.v}
            <small>{x.s}</small>
          </dd>
        </div>
      ))}
      {Array.from({ length: relleno }, (_, i) => <div key={`r${i}`} className="k-dl-relleno" aria-hidden="true" />)}
    </dl>
  )
}

function FichaPlaca({ o }: { o: Obra }) {
  const c = useCopy()
  const { locale } = useV5()
  const fmt = useMemo(() => formatoN(locale), [locale])
  const [sp, setSp] = useSearchParams()
  const placas = placasDe(o.slug)
  const vistas = [...new Set(placas.map((p) => p.vista))] as Vista[]
  const vista = (sp.get('vista') as Vista) && vistas.includes(sp.get('vista') as Vista) ? (sp.get('vista') as Vista) : 'home'
  const dispOk = (v: Vista) => [...new Set(placas.filter((p) => p.vista === v).map((p) => p.vp))] as Disp[]
  const movilPorDefecto = typeof window !== 'undefined' && window.innerWidth < 768
  const vpPedido = sp.get('vp') as Disp | null
  const vp: Disp = vpPedido && dispOk(vista).includes(vpPedido) ? vpPedido : movilPorDefecto && dispOk(vista).includes('mobile') ? 'mobile' : dispOk(vista).includes('desktop') ? 'desktop' : dispOk(vista)[0]
  const p = placaDe(o.slug, vista, vp) ?? placas[0]
  const n = RADIOGRAFIADAS.indexOf(o.slug)
  const anterior = RADIOGRAFIADAS[(n + RADIOGRAFIADAS.length - 1) % RADIOGRAFIADAS.length]
  const siguiente = RADIOGRAFIADAS[(n + 1) % RADIOGRAFIADAS.length]
  const { obra } = useV5()

  const clave = sp.get('seccion')
  const iClave = clave ? p.secs.findIndex((s) => s.k === clave) : -1
  const t0 = iClave >= 0 ? centroDe(p.secs, iClave) / p.alto : 0.45
  const movil = typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches

  const [activa, setActiva] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const api = useRef<PlacaApi>(null)
  const raiz = useRef<HTMLDivElement>(null)
  const placaPrevia = useRef(`${p.vista}-${p.vp}`)

  useEscena(raiz, () => {
    const a = api.current
    if (!a) return
    window.scrollTo(0, 0)
    const filas = filasAlPaso(raiz.current!, a.alTrazar)
    a.irT(0)
    const marco = a.marco()
    const ventana = a.ventana()
    const vuelo = tomarOrigen(o.slug)
    const tl = gsap.timeline({ defaults: { ease: 'k-out', clearProps: 'clipPath,transform,opacity' } })
    tl.from('.k-crumb', { clipPath: CORTE.etiqueta.from, duration: 0.45 }, 0)
    tl.from('.k-tit .k-l', { clipPath: CORTE.bloque.from, yPercent: 28, duration: 0.7 }, 0.05)
    tl.from('.k-tit p', { clipPath: CORTE.bloque.from, duration: 0.5 }, 0.25)
    tl.from('.k-dl', { clipPath: CORTE.bloque.from, duration: 0.5 }, 0.3)
    let quitar: (() => void) | undefined
    if (vuelo && marco && ventana) quitar = volar(vuelo, ventana, marco)
    else if (marco) tl.from(marco, { clipPath: 'inset(0 100% 0 0)', duration: 0.6 }, 0.15)
    // La línea baja sola una vez para enseñar el gesto (con vuelo, cuando la captura ya aterrizó). En móvil el scroll manda: baja y vuelve al inicio.
    const inicio = vuelo ? 0.62 : 0.3
    if (movil) a.barrer(0.3, { delay: inicio, duration: 0.6, vuelta: true })
    else a.barrer(t0, { delay: inicio, duration: 1.1 })
    tl.from('.k-cuerpo > .k-insp', { clipPath: CORTE.bloque.from, duration: 0.5 }, 0.5)
    tl.from('.k-prov, .k-cajones', { clipPath: CORTE.etiqueta.from, duration: 0.45, stagger: 0.06 }, 0.7)
    tl.from('.k-pie-ficha', { clipPath: CORTE.etiqueta.from, duration: 0.45 }, 0.85)
    tl.call(filas.resto, [], 1.8)
    return () => {
      quitar?.()
      filas.limpiar()
    }
  }, [])

  // Cambiar de vista o de dispositivo reutiliza el marco: la línea vuelve a enseñar el recorrido, más corto.
  useEffect(() => {
    if (placaPrevia.current === `${p.vista}-${p.vp}`) return
    placaPrevia.current = `${p.vista}-${p.vp}`
    const a = api.current
    if (!a) return
    a.irT(0)
    setActiva(0)
    a.barrer(movil ? 0 : t0, { duration: 0.7 })
  }, [p.vista, p.vp, movil, t0])

  // Móvil: el scroll ES el escaneo. La fila que cruza la línea de referencia, bajo la placa fija, manda la sección.
  useEffect(() => {
    if (!movil) return
    let filas: number[] = []
    let ref = 0
    const centros = p.secs.map((_, i) => centroDe(p.secs, i) / p.alto)
    const medir = () => {
      filas = [...document.querySelectorAll<HTMLElement>('.k-tabla tbody tr')].map((tr) => tr.getBoundingClientRect().top + window.scrollY + tr.offsetHeight / 2)
      const m = api.current?.marco()
      ref = m ? m.getBoundingClientRect().bottom + 28 : 0
    }
    const scroll = () => {
      if (!filas.length) return
      const y = window.scrollY + ref
      const i = filas.findIndex((f) => f > y)
      let t: number
      if (i === -1) t = centros[centros.length - 1]
      else if (i === 0) t = centros[0]
      else t = centros[i - 1] + ((y - filas[i - 1]) / (filas[i] - filas[i - 1])) * (centros[i] - centros[i - 1])
      api.current?.irT(t)
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(document.body)
    window.addEventListener('scroll', scroll, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', scroll)
    }
  }, [movil, p])

  const nombre = o.name
  const ponerParam = (k: string, v: string) => setSp((prev) => { const x = new URLSearchParams(prev); x.set(k, v); x.delete('seccion'); return x }, { replace: true })
  const fila1 =
    vistas.length > 1 || dispOk(vista).length > 1 ? (
      <div className="k-ph k-ph--tabs">
        {vistas.length > 1 ? (
          <div className="k-tabs" role="group" aria-label={c.ficha.vista}>
            {vistas.map((v) => <button key={v} type="button" aria-pressed={vista === v} onClick={() => ponerParam('vista', v)}>{c.vistas[v][0].toUpperCase() + c.vistas[v].slice(1)}</button>)}
          </div>
        ) : <span />}
        {dispOk(vista).length > 1 && (
          <div className="k-tabs" role="group" aria-label={c.ficha.dispositivo}>
            {dispOk(vista).map((d) => <button key={d} type="button" aria-pressed={vp === d} onClick={() => ponerParam('vp', d)}>{d === 'desktop' ? c.ficha.escritorio : c.ficha.movil}</button>)}
          </div>
        )}
      </div>
    ) : undefined

  return (
    <div ref={raiz} className="k-ficha k-pag">
      <Cabeza titulo={c.ficha.titulo(nombre)} />
      <Placa
        ref={api}
        clase="k-placa--ficha"
        placa={p}
        nombre={nombre}
        titulo={fila1 ? c.capa.etiqueta : c.ficha.placaTitulo(String(n + 1).padStart(2, '0'), nombre, c.vistas[p.vista])}
        fila1={fila1}
        activa={activa}
        onActiva={setActiva}
        resaltada={hover}
        prioridad
        t0={t0}
        tablaId={idTabla(p)}
      />
      <div className="k-cuerpo">
        <nav className="k-crumb k-mono" aria-label={c.ficha.migas}>
          <KLink to={v5path('k', 'obra')}>{c.nav.obra}</KLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{nombre}</span>
        </nav>
        <div className="k-tit">
          <h1 className="k-h1 k-h1--ficha"><span className="k-l">{nombre}</span></h1>
          {o.tagline && <p>{o.tagline}</p>}
        </div>
        <FichaDatos o={o} />
        <Inspector placa={p} activa={activa} onIr={(i) => api.current?.irA(i)} onHover={setHover} titulo={c.insp.titulo(c.vistas[p.vista])} />
        <div className="k-pie-ficha">
          <KLink className="k-nx" to={v5path('k', 'obra', anterior)}><small className="k-mono">{c.ficha.anterior}</small><b>{obra(anterior)?.name}</b></KLink>
          <KLink className="k-btn k-btn--sm" to={v5path('k', 'contacto')} onClick={() => evento('k', 'contact_click', { canal: 'cta_ficha' })}>{c.pedir}</KLink>
          <KLink className="k-nx k-nx--der" to={v5path('k', 'obra', siguiente)}><small className="k-mono">{c.ficha.siguiente}</small><b>{obra(siguiente)?.name}</b></KLink>
        </div>
        <p className="k-sr" role="status">{fmt(p.secs.length)}</p>
      </div>
    </div>
  )
}

/** Obras sin radiografía (tema del cliente, base de terceros, productos y proyectos): la piel y el motivo, sin inventar nada. */
function FichaSimple({ o }: { o: Obra }) {
  const c = useCopy()
  const raiz = useRef<HTMLDivElement>(null)
  const foto = o.views.includes('home')
  const esTienda = o.kind === 'store'
  const motivo = esTienda ? c.motivos[motivoDe(o.slug)] : null
  useEscena(raiz, () => {
    window.scrollTo(0, 0)
    const tl = gsap.timeline({ defaults: { ease: 'k-out', clearProps: 'clipPath,transform,opacity' } })
    tl.from('.k-crumb', { clipPath: CORTE.etiqueta.from, duration: 0.45 }, 0)
    tl.from('.k-tit .k-l', { clipPath: CORTE.bloque.from, yPercent: 28, duration: 0.7 }, 0.05)
    tl.from('.k-tit p', { clipPath: CORTE.bloque.from, duration: 0.5 }, 0.25)
    tl.from('.k-placa--simple', { clipPath: 'inset(0 100% 0 0)', duration: 0.6 }, 0.15)
    tl.from('.k-dl', { clipPath: CORTE.bloque.from, duration: 0.5 }, 0.3)
    tl.from('.k-desc, .k-pie-ficha', { clipPath: CORTE.etiqueta.from, duration: 0.45, stagger: 0.08 }, 0.6)
  }, [])
  return (
    <div ref={raiz} className="k-ficha k-ficha--simple k-pag">
      <Cabeza titulo={c.ficha.titulo(o.name)} />
      <figure className="k-placa k-placa--simple" aria-label={c.placa.aria(o.name)}>
        <div className="k-ph">
          <span className="k-ph-t">{esTienda ? c.ficha.sinRadiografia : c.ficha.captura}</span>
        </div>
        <div className="k-simple-cuerpo">
          {foto ? <ShotImg slug={o.slug} vista="home" vp="desktop" alt={c.placa.alt(o.name, 'home', '2026-09-07')} prioridad /> : <p className="k-sincap k-mono">{motivo ?? c.obra.sinCaptura}</p>}
          {esTienda && <Tira alturas={[]} rayada />}
        </div>
        <figcaption className="k-pf">
          <span className="k-pf-d">{foto ? pieDeCaptura(o.name, 'home', 'desktop') : ''}</span>
        </figcaption>
      </figure>
      <div className="k-cuerpo">
        <nav className="k-crumb k-mono" aria-label={c.ficha.migas}>
          <KLink to={v5path('k', 'obra')}>{c.nav.obra}</KLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{o.name}</span>
        </nav>
        <div className="k-tit">
          <h1 className="k-h1 k-h1--ficha"><span className="k-l">{o.name}</span></h1>
          {o.tagline && <p>{o.tagline}</p>}
        </div>
        {motivo && <p className="k-aviso k-mono">{motivo}</p>}
        <FichaDatos o={o} />
        {o.description && <p className="k-desc">{o.description}</p>}
        <div className="k-pie-ficha">
          <KLink className="k-nx" to={v5path('k', 'obra')}><small className="k-mono">{c.ficha.volver}</small><b>{c.nav.obra}</b></KLink>
          <KLink className="k-btn k-btn--sm" to={v5path('k', 'contacto')} onClick={() => evento('k', 'contact_click', { canal: 'cta_ficha' })}>{c.pedir}</KLink>
        </div>
      </div>
    </div>
  )
}
