import { useLayoutEffect, useRef, useState } from 'react'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { Pieza3D } from '../../three/Pieza3D'

/**
 * Relieve real del Valle de Aburrá (estudio obsidiana, p4) junto al reloj en vivo de Medellín de la banda «Ahora».
 * Solo existe con `?3d=1`: las páginas lo importan con `lazy()` y lo montan tras `modo3dActivo()`, así que sin el flag
 * este archivo no se descarga ni cambia el DOM. El que lo monta reserva la caja (ancho + aspect-ratio 1200/858, el mismo
 * de las dos variantes) para que la llegada del chunk no mueva nada.
 *
 * La perla late a la cadencia REAL del reloj de esa skin (`periodoMs`: Apple lo refresca cada 30 s, Terminal cada 1 s).
 * La fase la deriva la gemela de `Date.now() % periodoMs`; el intervalo de cada reloj arranca al montar la página, así
 * que comparten cadencia pero no fase exacta (deuda declarada en la FICHA p4).
 *
 * Tamaño (FICHA p4): a partir de 200 px de caja, el relieve principal (3D en tiempo real); por debajo, la variante
 * «pequeña» (menos curvas y más anchas, solo póster). En teléfonos (< 640 px) siempre póster: una pieza decorativa no
 * justifica cargar three ni dibujar a 20 cuadros por segundo con la batería en juego.
 */
const ALT: Record<Locale, string> = {
  es: 'Relieve real del Valle de Aburrá en obsidiana, con una perla violeta sobre Medellín',
  en: 'Real relief of the Aburrá Valley in obsidian, with a violet pearl on Medellín',
  ja: 'メデジンに紫の珠を置いた、Aburrá渓谷の実際の地形を黒曜石で表した立体',
}

const MIN_PRINCIPAL = 200

export default function AhoraRelieve({ periodoMs }: { periodoMs: number }) {
  const { locale } = useLanguage()
  const telefono = useMediaQuery('(max-width: 639px)')
  const raiz = useRef<HTMLDivElement>(null)
  const [grande, setGrande] = useState(false)

  // El ancho lo decide la página (flex/col), no un breakpoint mío: se mide la caja y solo se re-renderiza al cruzar 200 px.
  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    const medir = () => setGrande(el.getBoundingClientRect().width >= MIN_PRINCIPAL - 0.5)
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={raiz}>
      <Pieza3D
        slug="relieve-medellin"
        estado={grande ? undefined : 'pequena'}
        interactiva
        animar
        soloPoster={telefono}
        periodoPulsoMs={periodoMs}
        alt={ALT[locale]}
        sizes={grande ? '200px' : '112px'}
        className="w-full"
      />
    </div>
  )
}
