import { useMemo } from 'react'
import { useContent } from '../hooks/useContent'
import type { ExperienceId, RoleWorkId, StoreRole, StoreStatus } from '../data/registry'

// Contrato de datos de la v5: una sola lista de obra armada desde el registro real (src/data/registry.ts)
// y los textos del idioma activo (src/content/<locale>.ts). Las direcciones leen de aquí y nunca copian
// cifras, nombres ni textos a mano.

export type ObraKind = 'store' | 'product' | 'personal' | 'role'
export type Vista = 'home' | 'pdp'
export type Viewport = 'desktop' | 'mobile'

/** Capturas reales en /public/gallery: escritorio 1200×750, móvil 780×1688 (2x de 390×844). */
export const SHOT_SIZE: Record<Viewport, { w: number; h: number }> = { desktop: { w: 1200, h: 750 }, mobile: { w: 780, h: 1688 } }
export const shot = (slug: string, vista: Vista, vp: Viewport) => `/gallery/${slug}/${vista}-${vp}.webp`

export interface Obra {
  slug: string
  kind: ObraKind
  name: string
  year: number
  period?: { start: string; end: string } // YYYY-MM
  status?: StoreStatus
  role?: StoreRole
  employer?: ExperienceId // obra hecha dentro de un empleo (kind 'role')
  stack: string[]
  url?: string
  repo?: string
  legacy?: boolean
  commits?: number
  sections?: number
  /** Vistas con captura real; vacío = sin capturas (se muestra sin imagen, nunca con una inventada). */
  views: Vista[]
  facts: { label: string; value: string }[]
  industry?: string
  tagline: string
  description: string
}

/** Contenido real de la v5 en el idioma activo: obra, trayectoria, datos personales y textos ya escritos. */
export function useV5() {
  const content = useContent()
  const { strings, registry } = content
  return useMemo(() => {
    const obras: Obra[] = [
      ...registry.stores.map((s): Obra => {
        const t = strings.stores[s.slug]
        return {
          slug: s.slug, kind: 'store', name: s.name, year: s.year, period: s.timeline, status: s.status, role: s.role,
          stack: s.stack, url: s.url || undefined, legacy: s.legacy, commits: s.commits, sections: s.sections,
          views: s.gallery ? ['home', 'pdp'] : [],
          facts: s.facts.map((f) => ({ label: t?.factLabels?.[f.id] ?? f.id, value: f.value })),
          industry: t?.industry, tagline: t?.tagline ?? '', description: t?.description ?? '',
        }
      }),
      ...registry.products.map((p): Obra => ({
        slug: p.id, kind: 'product', name: p.name, year: p.year, stack: p.stack, url: p.url,
        views: p.gallery ? ['home'] : [], facts: [],
        tagline: strings.products[p.id]?.tagline ?? '', description: strings.products[p.id]?.description ?? '',
      })),
      ...registry.roleWork.map((w): Obra => {
        const job = registry.experience.find((e) => e.id === w.role)
        return {
          slug: w.id, kind: 'role', name: strings.roleWork[w.id as RoleWorkId], year: Number(w.timeline.end.slice(0, 4)),
          period: w.timeline, employer: w.role, stack: w.stack, url: job?.website, views: [], facts: [],
          tagline: job ? `${job.company} · ${strings.experience[w.role].title}` : '', description: '',
        }
      }),
      ...registry.personalProjects.map((p): Obra => ({
        slug: p.id, kind: 'personal', name: p.name, year: p.year, stack: p.stack, url: p.url, repo: p.repo,
        views: [], facts: [],
        tagline: strings.projects[p.id]?.tagline ?? '', description: strings.projects[p.id]?.description ?? '',
      })),
    ]
    const trayectoria = registry.experience.map((e) => ({
      ...e,
      title: strings.experience[e.id].title,
      summary: strings.experience[e.id].summary,
      highlights: strings.experience[e.id].highlights,
      metrics: e.metrics.map((m) => ({ label: strings.experience[e.id].metricLabels[m.id] ?? m.id, value: m.value })),
      period: content.formatPeriod(e.start, e.end),
    }))
    return {
      ...content,
      obras,
      obra: (slug: string) => obras.find((o) => o.slug === slug),
      trayectoria,
      personal: registry.personal,
      /** Única cifra pública de tiendas (registry.PUBLIC_STORE_COUNT): nunca obras.length. */
      storeCount: `${registry.PUBLIC_STORE_COUNT}+`,
    }
  }, [content, strings, registry])
}

/** Ruta de una vista dentro de una dirección: v5path('a', 'obra', 'nos-cafe') → /v5/a/obra/nos-cafe */
export const v5path = (dir: string, view: '' | 'obra' | 'trayectoria' | 'contacto' = '', slug?: string) =>
  `/v5/${dir}${view ? `/${view}` : ''}${slug ? `/${slug}` : ''}`

export interface DirectionMeta {
  id: string
  nombre: string
  idea: string
  mecanica: string
  referentes: string[]
}
