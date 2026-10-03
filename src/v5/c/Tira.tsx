import { SHOT_DATE, SHOT_SIZE, type Obra } from '../data'
import { capturasDe, LOD_ANCHO, lodSrc } from './datos'
import { useAncho, useC } from './useC'

const BASE = 2 * 480 + 2 * 139 // flex de un paquete completo: escritorio·escritorio·móvil·móvil

/** Tira de diapositivas de una obra (home y PDP, escritorio y móvil) en LOD 0/1, con la proporción real, en su marco con código de borde.
 *  Con menos de 900 px es una tira que se desplaza (scroll-snap, la siguiente asoma) y entonces es un solo tab stop. */
export function Tira({ obra, nr, prioridad }: { obra: Obra; nr: string; prioridad?: boolean }) {
  const { t } = useC()
  const ancho = useAncho()
  const caps = capturasDe(obra)
  if (!caps.length) return null
  const frac = caps.reduce((s, c) => s + (c.vp === 'desktop' ? 480 : 139), 0) / BASE
  return (
    <div
      className="c-tira"
      style={{ ['--c-frac' as string]: frac }}
      role={ancho ? undefined : 'group'}
      aria-label={ancho ? undefined : t.inicio.capturasDe(obra.name)}
      tabIndex={ancho ? undefined : 0}
    >
      <div className="c-tira__slides">
        {caps.map((c) => {
          const l0 = lodSrc(0, obra.slug, c)
          return (
            <span key={`${c.vista}-${c.vp}`} className={`c-marco c-marco--${c.vp}`} data-vuelo={`${obra.slug}:${c.vista}-${c.vp}`}>
              <img
                src={l0}
                srcSet={`${l0} ${LOD_ANCHO[0][c.vp]}w, ${lodSrc(1, obra.slug, c)} ${LOD_ANCHO[1][c.vp]}w`}
                sizes={c.vp === 'desktop' ? '(min-width: 900px) 300px, 272px' : '(min-width: 900px) 86px, 80px'}
                width={SHOT_SIZE[c.vp].w}
                height={SHOT_SIZE[c.vp].h}
                alt={t.capturaAlt(obra.name, t.vistas[c.vista], t.vps[c.vp], SHOT_DATE)}
                loading={prioridad ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />
            </span>
          )
        })}
      </div>
      <p className="c-cod" aria-hidden="true">
        <span>
          <b>{t.ficha.numero(nr)}</b> · {obra.name}
        </span>
        <span>{SHOT_DATE}</span>
      </p>
    </div>
  )
}
