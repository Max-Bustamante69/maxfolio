import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useCopy } from './copy'
import { formatoN, idTabla, type Placa } from './medicion'

// El inspector: tabla accesible con las MISMAS secciones que la placa (clave · alto · isla · medición). Es el
// equivalente de teclado, de lector de pantalla y de pantalla táctil de la línea: una <table> completa.
// Cada fila lleva un <button> con la clave; pasar o enfocar una fila ilumina su caja en la placa (y al revés).

interface Props {
  placa: Placa
  activa: number
  onIr: (i: number) => void
  onHover: (i: number | null) => void
  /** Inicio: altura fija y la fila activa siempre a la vista. */
  compacto?: boolean
  titulo: string
  children?: ReactNode
}

export function Inspector({ placa, activa, onIr, onHover, compacto, titulo, children }: Props) {
  const c = useCopy()
  const { locale } = useLanguage()
  const fmt = useMemo(() => formatoN(locale), [locale])
  const caja = useRef<HTMLDivElement>(null)
  const dominio = new URL(placa.url).hostname.replace(/^www\./, '')

  // En el inspector corto, la fila activa se mantiene dentro de la caja (scrollTop de la caja, nunca de la página).
  useEffect(() => {
    if (!compacto || !caja.current) return
    const fila = caja.current.querySelector<HTMLElement>(`tr[data-i="${activa}"]`)
    if (!fila) return
    const el = caja.current
    const top = fila.offsetTop
    const cabecera = el.querySelector<HTMLElement>('thead')?.offsetHeight ?? 0
    if (top - cabecera < el.scrollTop) el.scrollTop = top - cabecera + 1
    else if (top + fila.offsetHeight > el.scrollTop + el.clientHeight) el.scrollTop = top + fila.offsetHeight - el.clientHeight
  }, [activa, compacto])

  return (
    <section className="k-insp" aria-label={c.insp.aria}>
      <div className="k-insp-h">
        <b>{titulo}</b>
        <span>{c.insp.resumen(fmt(placa.secs.length), fmt(placa.nIslas), fmt(placa.nMedidos), fmt(placa.alto))}</span>
      </div>
      <div ref={caja} className={`k-insp-caja${compacto ? ' k-insp-caja--corta' : ''}`}>
        <table id={idTabla(placa)} className="k-tabla">
          <caption className="k-sr">{c.insp.aria}</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">{c.insp.clave}</th>
              <th scope="col" className="r">{c.insp.alto}</th>
              <th scope="col">{c.insp.isla}</th>
              <th scope="col">{c.insp.medicion}</th>
            </tr>
          </thead>
          <tbody onPointerLeave={() => onHover(null)}>
            {placa.secs.map((s, i) => (
              <tr
                key={i}
                data-i={i}
                className={i === activa ? 'on' : undefined}
                aria-current={i === activa ? 'true' : undefined}
                onPointerEnter={() => onHover(i)}
                onClick={() => onIr(i)}
              >
                <td className="n">{String(i + 1).padStart(2, '0')}</td>
                <td className="c">
                  <button type="button" onFocus={() => onHover(i)} onBlur={() => onHover(null)} onClick={(e) => { e.stopPropagation(); onIr(i) }}>{s.k}</button>
                </td>
                <td className="r">{fmt(s.h)} px</td>
                <td>{s.islas.length ? c.insp.siIsla : '—'}</td>
                <td>
                  {s.dd.length ? (
                    <>
                      <span className="k-aro" aria-hidden="true" />
                      <span className="k-w">{c.insp.medida} </span>×{s.dd.length}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {placa.cajones.length > 0 && (
        <p className="k-cajones">
          {c.insp.cajones(placa.cajones.length)}: {placa.cajones.join(' · ')}
        </p>
      )}
      <p className="k-prov">{c.insp.prov(placa.fecha, placa.tema ?? placa.esquema ?? dominio, dominio, placa.cajones.length)}</p>
      {children}
    </section>
  )
}
