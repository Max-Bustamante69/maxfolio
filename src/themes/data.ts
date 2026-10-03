import { useMemo } from 'react'
import { useContent } from '../hooks/useContent'
import type { ExperienceId, RoleWorkId, StoreRole, StoreStatus } from '../data/registry'
import { telemetry } from '../data/telemetry'
import { commerce, isLiveCommerce } from '../data/commerce'
import lighthouseJson from '../data/lighthouse.json'

// Contrato de datos de la v5: una sola lista de obra armada desde el registro real (src/data/registry.ts)
// y los textos del idioma activo (src/content/<locale>.ts). Las direcciones leen de aquí y nunca copian
// cifras, nombres ni textos a mano.
//
// Capa pública (research/DIRECCIONES.md, contrato común 3, 4, 9 y K.0): TODO lo que llega a pantalla pasa
// por aquí, así que ninguna dirección puede imprimir por descuido un claim que el repo no sostiene.

/** Tema que servía el dominio de cada tienda al medirla (2026-09-10). Solo `digitdeck` atribuye su Lighthouse a Max.
 *  Clasificación propuesta (CONTENIDO-VERDAD §2.7); la confirma Max (preguntas Q15/Q16). */
export type Tema = 'digitdeck' | 'cliente' | 'por-confirmar' | 'sin-medicion'
const TEMA: Record<string, Tema> = {
  'the-gummy-box': 'digitdeck', 'nos-cafe': 'digitdeck', millennio: 'digitdeck', mindfuel: 'digitdeck', nalua: 'digitdeck',
  sebum: 'digitdeck', 'valdo-cafe': 'digitdeck', 'factores-2x2': 'digitdeck', pixxiesx: 'digitdeck', 'luxe-shine': 'digitdeck',
  atmosfera: 'digitdeck', 'saint-theory': 'digitdeck',
  unik: 'cliente', 'en-amor-a-dos': 'cliente', joystaz: 'cliente', 'new-urban': 'cliente',
  peluna: 'por-confirmar', 'origen-vital': 'por-confirmar', 'para-machos': 'por-confirmar', tierramont: 'por-confirmar', 'alma-de-aviador': 'por-confirmar',
}
/** Temas que no son de Max desde cero: se rotulan «personalizada sobre…», nunca «Construida». */
const BASE_DE_TERCERO: Record<string, string> = { millennio: 'Xclusive', pixxiesx: 'Flawless' }
/** Fecha de las capturas de public/gallery (scripts/capture-gallery.mjs). */
export const SHOT_DATE = '2026-09-07'

// Textos del registro que afirman algo sin fuente: se reescriben aquí (es/en; ja cae a en).
const TAGLINE: Record<string, { es: string; en: string }> = {
  pixxiesx: { es: 'Quiz de producto y PDP guiada por metaobjetos.', en: 'Product quiz and a metaobject-driven PDP.' },
  'factores-2x2': { es: 'De Framer a Liquid, con una pasada de calidad web.', en: 'Framer to Liquid, then a web-quality pass.' },
}
const STACK_FUERA = new Set(['Web quality 95+'])
const FACT_FUERA: Record<string, string[]> = {}
// Max (2026-10-03): «quiero que tengas ese contenido [el de maxfolio.dev], mostrar mucho más de mí». La FAQ es la del
// vivo menos la 6 («¿Lo hizo una IA?» dice «construido a mano», que no es cierto).
const FAQ_PUBLICAS = [0, 1, 2, 3, 4, 5]

/** Un título compuesto de una frase del registro sin el punto final (LISTON-V4 §4 A3/A5). */
export const sinPuntoFinal = (s: string) => s.replace(/[.。]\s*$/, '')

/** Telemetría de git (2026-09-08), catálogo público (2026-09-09) y Lighthouse local (2026-09-10) por tienda, con su fecha.
 *  Lighthouse es null si la tienda no servía un tema de Digitdeck al medir: ese número no es obra de Max. */
export function datosDe(slug: string) {
  const lh = (lighthouseJson as Record<string, { fetchedAt: string; source: string; mobile: LH; desktop: LH }>)[slug]
  const c = commerce[slug]
  return {
    git: telemetry[slug] ? { ...telemetry[slug], fecha: '2026-09-08' } : null,
    comercio: isLiveCommerce(c) ? { ...c, fecha: c.fetchedAt.slice(0, 10) } : null,
    lighthouse: lh && TEMA[slug] === 'digitdeck' ? { movil: lh.mobile, escritorio: lh.desktop, fecha: lh.fetchedAt.slice(0, 10), fuente: lh.source } : null,
  }
}
interface LH { perf: number; a11y: number; bp: number; seo: number; lcp: number | null; tbt: number | null; cls: number | null; finalUrl: string }

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
  /** Rótulo del rol para mostrar: «Construida», «Migrada» o «Personalizada sobre Xclusive». */
  rolLabel?: string
  tema?: Tema
  /** URL externa SOLO si se puede enlazar (tienda que sirve un tema de Digitdeck, producto o proyecto con DNS). Q5: la lista la confirma Max. */
  link?: string
}

/** Contenido real de la v5 en el idioma activo: obra, trayectoria, datos personales y textos ya escritos. */
export function useV5() {
  const content = useContent()
  const { strings, registry, locale } = content
  return useMemo(() => {
    const lang = locale === 'es' ? 'es' : 'en'
    const obras: Obra[] = [
      ...registry.stores.map((s): Obra => {
        const t = strings.stores[s.slug]
        const tema = TEMA[s.slug] ?? 'sin-medicion'
        const base = BASE_DE_TERCERO[s.slug]
        return {
          slug: s.slug, kind: 'store', name: s.name, year: s.year, period: s.timeline, status: s.status, role: s.role,
          stack: s.stack.filter((x) => !STACK_FUERA.has(x)), legacy: s.legacy, commits: s.commits, sections: s.sections,
          views: s.gallery ? ['home', 'pdp'] : [],
          facts: s.facts.filter((f) => !FACT_FUERA[s.slug]?.includes(f.id)).map((f) => ({ label: t?.factLabels?.[f.id] ?? f.id, value: f.value })),
          industry: t?.industry, tagline: TAGLINE[s.slug]?.[lang] ?? t?.tagline ?? '', description: t?.description ?? '',
          rolLabel: base ? (lang === 'es' ? `Personalizada sobre ${base}` : `Customized on ${base}`) : strings.badges.roles[s.role],
          tema,
          link: tema === 'digitdeck' && s.url ? s.url : undefined,
        }
      }),
      ...registry.products.map((p): Obra => ({
        slug: p.id, kind: 'product', name: p.name, year: p.year, stack: p.stack, link: p.id === 'digitdeck-platform' ? undefined : p.url,
        views: p.gallery && p.id !== 'audit-dashboard' ? ['home'] : [], facts: [], // la captura del Audit Dashboard es un informe de cliente (Q10)
        tagline: strings.products[p.id]?.tagline ?? '', description: strings.products[p.id]?.description ?? '',
      })),
      ...registry.roleWork.map((w): Obra => {
        const job = registry.experience.find((e) => e.id === w.role)
        return {
          slug: w.id, kind: 'role', name: strings.roleWork[w.id as RoleWorkId], year: Number(w.timeline.end.slice(0, 4)),
          period: w.timeline, employer: w.role, stack: w.stack, link: job?.website?.includes('digitdeck.co') ? undefined : job?.website, views: [], facts: [],
          tagline: job ? `${job.company} · ${strings.experience[w.role].title}` : '', description: '',
        }
      }),
      ...registry.personalProjects.map((p): Obra => ({
        slug: p.id, kind: 'personal', name: p.name, year: p.year, stack: p.stack, repo: p.repo,
        link: p.id === 'scorrea' ? undefined : p.url, // scorrea.dev sin DNS
        views: [], facts: [],
        tagline: strings.projects[p.id]?.tagline ?? '', description: strings.projects[p.id]?.description ?? '',
      })),
    ]
    // Cargos como en el vivo: título, resumen, logros y métricas del CV de Max, cada una dentro de su cargo y su periodo.
    const trayectoria = registry.experience.map((e) => {
      const s = strings.experience[e.id]
      return {
        ...e,
        title: s.title as string | null,
        summary: s.summary,
        highlights: s.highlights,
        metrics: e.metrics.map((m) => ({ label: s.metricLabels[m.id] ?? m.id, value: m.value })),
        period: content.formatPeriod(e.start, e.end),
      }
    })
    const eras = strings.sections.years.eras as Record<string, string | null>
    const faq = FAQ_PUBLICAS.map((i) => strings.sections.faq.items[i]).filter(Boolean)
    // Las cifras de la banda del vivo, cada una con su etiqueta y su FUENTE (el cargo y el periodo del CV de donde sale).
    const cifras = registry.stats.map((s) => ({ id: s.id, valor: s.value, etiqueta: strings.stats[s.id], fuente: strings.statSources[s.id] }))
    return {
      ...content,
      obras,
      obra: (slug: string) => obras.find((o) => o.slug === slug),
      trayectoria,
      eras,
      faq,
      cifras,
      /** Habilidades del vivo: grupos del registro y cuántas tiendas usan cada herramienta (skillUsage). */
      habilidades: registry.skillGroups,
      personal: registry.personal,
      /** Única cifra pública de tiendas (registry.PUBLIC_STORE_COUNT): nunca obras.length. Verbo: «construidas», no «en vivo». */
      storeCount: `${registry.PUBLIC_STORE_COUNT}+`,
    }
  }, [content, strings, registry, locale])
}

/** Ruta de una vista dentro de un tema: v5path('plato', 'obra', 'nos-cafe') → /plato/obra/nos-cafe */
export const v5path = (dir: string, view: '' | 'obra' | 'trayectoria' | 'contacto' = '', slug?: string) =>
  `/${dir}${view ? `/${view}` : ''}${slug ? `/${slug}` : ''}`

export interface DirectionMeta {
  id: string
  nombre: string
  idea: string
  mecanica: string
  referentes: string[]
}
