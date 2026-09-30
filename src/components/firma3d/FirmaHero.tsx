import './firma-hero.css'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { Pieza3D } from '../../three/Pieza3D'
import type { SkinId } from '../../three/tipos'

/**
 * Firma de la primera pantalla: el monograma MB de obsidiana (estudio, p1) con el punto del color de la skin.
 * Solo existe con `?3d=1`: las páginas lo importan con `lazy()` y lo montan tras `modo3dActivo()`, así que sin el flag
 * este archivo (ni su CSS) no se descarga y el DOM del hero no cambia.
 *
 * Sale del flujo (`position: absolute` sobre la rejilla del hero): no ocupa ni empuja nada, así que ni el LCP ni el
 * primer render del hero (que también trae `index.html` como cascarón estático) se mueven. Dónde va en cada skin lo
 * dice `firma-hero.css`, con la geometría medida del hueco de esa skin; aquí solo se decide qué se pinta:
 *  - escritorio y tableta: 3D en tiempo real (flotación lenta + parallax con el puntero); reduced-motion, gama baja y
 *    Save-Data se quedan en el póster por las compuertas de `src/three`;
 *  - teléfono (< 640 px): póster de Cycles sin más, ni three ni bucle de dibujo por una firma decorativa.
 * Decorativa (`alt=""`, `aria-hidden`): el nombre ya está en el titular a su lado.
 * `oscuro`: la obsidiana sobre un fondo casi negro solo se lee por sus cantos; un halo de contraluz (CSS, detrás de la
 * pieza) le da el fondo contra el que se recorta. No toca la pieza ni sus pósters.
 */
/** Ancho mínimo de pantalla (px) por skin: por debajo no hay hueco libre en su hero y la firma no se pinta (ni se pide su póster). */
const ANCHO_MINIMO: Partial<Record<SkinId, number>> = { luxury: 380, brutalist: 380 }

export default function FirmaHero({ skin, oscuro = false }: { skin: SkinId; oscuro?: boolean }) {
  const telefono = useMediaQuery('(max-width: 639px)')
  const cabe = useMediaQuery(`(min-width: ${ANCHO_MINIMO[skin] ?? 0}px)`, true)
  if (!cabe) return null
  return (
    <div className="firma-hero" data-firma={skin} data-tema={oscuro ? 'oscuro' : undefined} aria-hidden="true">
      {/* La caja de Pieza3D lleva `position: relative` en línea: la que se coloca es esta, la pieza solo la llena. */}
      <div className="firma-hero__caja">
        <Pieza3D
          slug="monograma-mb"
          acento={skin}
          interactiva={!telefono}
          animar={!telefono}
          soloPoster={telefono}
          prioridad
          alt=""
          sizes="(min-width: 640px) 320px, 140px"
          className="firma-hero__pieza"
        />
      </div>
    </div>
  )
}
