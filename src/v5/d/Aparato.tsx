import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { SHOT_DATE, useV5 } from '../data'
import { useHora } from './hora'
import { SelectorIdioma } from './Barra'
import { Marca } from './Marca'
import { useAjustes } from './ajustes'
import { DISPONIBILIDAD_AL, disponibilidadVencida, fechasDeDatos } from './datos'
import { llenar, useCopy } from './copy'

/** Interruptor de dos posiciones: la palanca se asienta con el clic mecánico (1 px). `activo` = la segunda opción. */
function Interruptor({ etiqueta, opciones, activo, nombre, alCambiar }: { etiqueta: string; opciones: [string, string]; activo: boolean; nombre: string; alCambiar: () => void }) {
  return (
    <div className="d-sw">
      <span className="d-cap">{etiqueta}</span>
      <button type="button" role="switch" aria-checked={activo} aria-label={nombre} className="d-trk" style={{ '--n': 2, '--i': activo ? 1 : 0 } as CSSProperties} onClick={alCambiar}>
        <i className="d-knob" aria-hidden="true" />
        <span className="d-opt" data-on={!activo}>{opciones[0]}</span>
        <span className="d-opt" data-on={activo}>{opciones[1]}</span>
      </button>
    </div>
  )
}

/** La única pieza de aparato (PATRONES H7): un panel con pantalla de puntos —datos reales con su fecha— y tres
 *  interruptores que funcionan. La pantalla cambia SOLO cuando el visitante acciona el mando o un interruptor. */
export function Aparato() {
  const t = useCopy()
  const c = t.inicio
  const { locale } = useLanguage()
  const { strings, storeCount, obras, intlLocale } = useV5()
  const { reducido, compacta, setReducido, setCompacta } = useAjustes()
  const hora = useHora(intlLocale)
  const [dato, setDato] = useState(0)
  const [aviso, setAviso] = useState<string | null>(null)
  const [cambios, setCambios] = useState(0)
  const [anuncio, setAnuncio] = useState('')
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(temporizador.current), [])

  const vencida = disponibilidadVencida()
  const fechas = useMemo(() => fechasDeDatos(obras), [obras])
  const datos = [llenar(c.lcdTiendas, { n: storeCount }), llenar(c.lcdCapturas, { fecha: SHOT_DATE }), llenar(c.lcdLighthouse, { fecha: fechas.lh })]

  const avisar = (texto: string) => {
    setAviso(texto)
    setAnuncio(texto)
    setCambios((n) => n + 1)
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setAviso(null), 2600)
  }
  const siguiente = () => {
    const i = (dato + 1) % datos.length
    setAviso(null)
    setDato(i)
    setAnuncio(datos[i])
    setCambios((n) => n + 1)
  }

  return (
    <figure className="d-fig">
      <figcaption className="d-fig-cab d-cap">
        <span><b>{c.figura.split(' · ')[0]}</b> · {c.figura.split(' · ')[1]}</span>
        <span>{c.figuraAyuda}</span>
      </figcaption>

      <div className="d-aparato" role="group" aria-label={c.aparato}>
        <div className="d-fila">
          <span className="d-fila-l"><b className="d-pin">1</b><span className="d-cap">{c.pantalla}</span></span>
          <button type="button" className="d-tecla-dato" onClick={siguiente} aria-label={`${c.mando}. ${llenar(c.mandoEstado, { i: dato + 1, n: datos.length })}`}>
            <span>{llenar(c.datoN, { i: dato + 1, n: datos.length })}</span> <span aria-hidden="true">▸</span>
          </button>
        </div>

        <div className="d-bisel">
          <div className="d-lcd" role="group" aria-label={c.lcdAria} aria-live="off">
            <p className="d-lcd-l1">
              <span className="d-led" data-vencido={vencida} aria-hidden="true" />
              {strings.hero.availability}
              {vencida && ` · ${llenar(c.datoAl, { f: DISPONIBILIDAD_AL.slice(0, 7) })}`}
            </p>
            <p className="d-lcd-l2">
              <span>{c.medellin}</span> <time>{hora}</time>
            </p>
            <p className="d-lcd-l3" key={cambios} data-cambia={cambios > 0}>{aviso ?? datos[dato]}</p>
            <p className="d-lcd-st">
              <span lang={locale}>{locale.toUpperCase()}</span>
              <span>{c.lcdMov[reducido ? 1 : 0]}</span>
              <span>{c.lcdDens[compacta ? 1 : 0]}</span>
            </p>
          </div>
        </div>

        <div className="d-fila d-fila-b">
          <span className="d-fila-l"><b className="d-pin">2</b><span className="d-cap">{c.interruptores}</span></span>
          <span className="d-cap d-oculto-movil">{c.interruptoresAyuda}</span>
        </div>
        <div className="d-sws">
          <div className="d-sw d-sw-idioma">
            <span className="d-cap">{c.idioma}</span>
            <SelectorIdioma alCambiar={(l) => avisar(llenar(c.avisoIdioma, { v: l === 'ja' ? `JA · ${t.jaParcial}` : l.toUpperCase() }))} />
          </div>
          <Interruptor
            etiqueta={c.movimiento}
            nombre={`${c.movimiento}: ${c.reducido}`}
            opciones={[c.normal, c.reducido]}
            activo={reducido}
            alCambiar={() => {
              setReducido(!reducido)
              avisar(llenar(c.avisoMovimiento, { v: !reducido ? c.reducido : c.normal }))
            }}
          />
          <Interruptor
            etiqueta={c.densidad}
            nombre={`${c.densidad}: ${c.compacta}`}
            opciones={[c.comoda, c.compacta]}
            activo={compacta}
            alCambiar={() => {
              setCompacta(!compacta)
              avisar(llenar(c.avisoDensidad, { v: !compacta ? c.compacta : c.comoda }))
            }}
          />
        </div>

        <div className="d-pie-aparato">
          <Marca ancho={40} />
          <span className="d-agujeros" aria-hidden="true">
            {Array.from({ length: 14 }, (_, i) => <i key={i} />)}
          </span>
        </div>
      </div>
      <p className="d-solo-lector" role="status">{anuncio}</p>
    </figure>
  )
}
