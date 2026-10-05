import { useLocation } from 'react-router-dom'

/** El dominio canónico del sitio: el canonical y el og:url de cada vista. */
export const ORIGEN = 'https://www.maxfolio.dev'

/**
 * Digitdeck e Ingeniería son variantes del reparto A/B del mismo portafolio: cada vista apunta con canonical a su equivalente en Plató
 * (el tema indexable, el único del sitemap), que es lo que Google pide para las URL de un test A/B en lugar de noindex. Los tres temas
 * tienen las mismas rutas (inicio, obra, obra/:slug, trayectoria, contacto).
 */
export function CanonicalPlato() {
  const { pathname } = useLocation()
  return <link rel="canonical" href={ORIGEN + pathname.replace(/^\/(digitdeck|ingenieria)(?=\/|$)/, '/plato').replace(/(.)\/$/, '$1')} />
}
