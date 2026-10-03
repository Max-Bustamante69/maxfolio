import { datosDe, type useV5 } from '../data'
import { limpio } from './limpio'
import { llenar } from './util'

export interface Beat {
  label: string
  body: string
  metric: string
}

/** El caso completo del vivo («Un build, completo»): cuatro tiempos con las cifras reales de la tienda (registro, telemetría de git,
 *  catálogo y Lighthouse de escritorio con fecha), exactamente las mismas variables con que lo arma FeaturedBuild.tsx del vivo.
 *  Solo hay caso contado de esta tienda; las demás cuentan su historia en su descripción. */
export const CASO_SLUG = 'the-gummy-box'

export function casoDe(v5: ReturnType<typeof useV5>, slug: string): Beat[] | null {
  if (slug !== CASO_SLUG) return null
  const tienda = v5.registry.stores.find((s) => s.slug === slug)
  if (!tienda) return null
  const d = datosDe(slug)
  const lh = d.lighthouse?.escritorio
  const vars = {
    sections: d.git?.sections ?? tienda.sections ?? 0,
    blocks: d.git?.blocks ?? 0,
    trackedComponents: d.git?.trackedComponents ?? 0,
    url: tienda.url.replace(/^https?:\/\//, ''),
    ladder: tienda.facts.find((f) => f.id === 'ladder')?.value ?? '',
    perfDesktop: lh?.perf ?? 0,
    a11yDesktop: lh?.a11y ?? 0,
    seoDesktop: lh?.seo ?? 0,
    lcpDesktop: (lh?.lcp ?? 0).toFixed(2),
  }
  // Sin la medición de Lighthouse no se cuenta el resultado: nunca un 0/0/0 impreso.
  if (!lh) return null
  return v5.strings.sections.featuredBuild.beats
    .map((b) => ({ label: b.label, body: llenar(b.body, vars), metric: llenar(b.metric, vars) }))
    .filter((b) => limpio(b.body))
}
