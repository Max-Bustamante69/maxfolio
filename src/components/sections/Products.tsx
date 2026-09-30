import { Suspense, useEffect, useState, type CSSProperties } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { ProjectFrame, type Skin } from '../gallery'
import { shotsFor } from './Gallery'
import type { ProductEntry } from '../../data/registry'
import { lazySiFlag } from '../../three/flag3d'
import type { Dispositivos3DProps, EstadoDispositivos } from './work3d/Dispositivos3D'

// 3D opt-in (?3d=1): laptop + teléfono del estudio con la captura real del producto. Sin el flag este módulo nunca se pide.
const dispositivosSiHay = /* @__PURE__ */ lazySiFlag<Dispositivos3DProps>(() => import('./work3d/Dispositivos3D'))
/** Oculto a la vista pero enfocable: el marco CSS queda `inert` mientras el 3D lo tapa, y el teclado necesita su propio botón. */
const SOLO_LECTOR: CSSProperties = { position: 'absolute', width: 1, height: 1, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }

/** A real link into this rail from elsewhere on the page (the orbit skill layout, see
 *  src/lib/sectionLinks.ts): which product to select. `nonce` changes on every request, including a
 *  repeat request for the same id already selected, so the effect below always re-applies it. */
export interface ProductSelectRequest {
  id: string
  nonce: number
}

interface ProductsProps {
  skin: Skin
  onOpen: (p: ProductEntry) => void
  select?: ProductSelectRequest | null
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * The apps and the platform as a split: a hairline rail of products on the left (a horizontal strip
 * on phones), one editorial panel on the right with the capture, the description and the stack as
 * a line of text — the same shape as Experience, so the page reads as one system, not five tiles.
 */
export function Products({ skin, onOpen, select }: ProductsProps) {
  const { strings, registry } = useContent()
  const reduced = useReducedMotion()
  const s = strings.sections.shopify
  const g = strings.sections.gallery
  const [current, setCurrent] = useState(registry.products[0])
  const c = strings.products[current.id]
  // Solo con ?3d=1: espera (marco CSS visible) -> 3d (el 3D ya dibuja, el marco se retira) | degradada (gama baja, reduced-motion, sin WebGL2: layout de siempre).
  const Dispositivos3D = dispositivosSiHay()
  const [estado3d, setEstado3d] = useState<EstadoDispositivos>('espera')
  const [foco3d, setFoco3d] = useState(false)
  const en3d = Dispositivos3D !== null && estado3d !== 'degradada'
  const marco = current.gallery ? (
    <ProjectFrame name={current.name} shots={shotsFor(current.id, false)} skin={skin} onOpen={() => onOpen(current)} alt={g.open} variant="laptop" />
  ) : null

  useEffect(() => {
    if (!select) return
    const p = registry.products.find((x) => x.id === select.id)
    if (p) setCurrent(p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [select?.id, select?.nonce])

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar lg:col-span-4 lg:mx-0 lg:overflow-visible lg:px-0" role="tablist" aria-label={s.tabProducts}>
        <div className={`flex gap-1 border-b lg:flex-col lg:gap-0 lg:border-b-0 lg:border-l ${skin.line}`}>
          {registry.products.map((p) => {
            const active = current.id === p.id
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCurrent(p)}
                className={`press relative shrink-0 py-3 pr-4 text-left transition-colors duration-150 lg:w-full lg:py-3.5 lg:pl-5 ${active ? '' : skin.muted}`}
              >
                {active && (
                  <m.span
                    layoutId="products-marker"
                    className={`absolute bottom-0 left-0 h-0.5 w-full lg:bottom-auto lg:top-0 lg:h-full lg:w-0.5 ${skin.accentBg}`}
                    transition={reduced ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.1 }}
                  />
                )}
                <span className="block text-sm font-semibold leading-snug">{p.name}</span>
                <span className={`${skin.muted} mt-0.5 block text-xs`}>{strings.products[p.id]?.tagline}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="lg:col-span-8">
        {/* ?3d=1: the devices live OUTSIDE the keyed panel, so switching product only swaps the screen texture (no remount).
            The CSS laptop stays underneath as the poster: it shows this product's real capture until the 3D draws. */}
        {en3d && current.gallery && Dispositivos3D && (
          <div className="relative mb-8 w-full" style={{ maxWidth: 600, aspectRatio: '1.25 / 1' }}>
            <div
              inert={estado3d === '3d'}
              style={{ position: 'absolute', left: '10.9%', top: '50%', width: '78.2%', transform: 'translateY(-50%)', opacity: estado3d === '3d' ? 0 : 1, transition: 'opacity 220ms ease-out' }}
            >
              {marco}
            </div>
            <Suspense fallback={null}>
              <Dispositivos3D
                capturaLaptop={`/gallery/${current.id}/home-desktop.webp`}
                capturaTelefono={`/gallery/${current.id}/home-mobile.webp`}
                precarga={registry.products.filter((x) => x.gallery && x.id !== current.id).flatMap((x) => [`/gallery/${x.id}/home-desktop.webp`, `/gallery/${x.id}/home-mobile.webp`])}
                alAbrir={() => onOpen(current)}
                alEstado={setEstado3d}
              />
            </Suspense>
            {estado3d === '3d' && (
              <button
                type="button"
                onClick={() => onOpen(current)}
                onFocus={() => setFoco3d(true)}
                onBlur={() => setFoco3d(false)}
                className={`${skin.chipOn} compact-touch`}
                style={foco3d ? { position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', zIndex: 35 } : SOLO_LECTOR}
              >
                {current.name}: {g.open}
              </button>
            )}
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={current.id} role="tabpanel" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.28, ease: EASE }}>
            {current.gallery && !en3d && <div className="mb-8 max-w-xl">{marco}</div>}
            <h3 className={`${skin.title} text-2xl leading-tight md:text-3xl`}>{current.name}</h3>
            <p className={`${skin.accent} mt-1 text-sm font-medium`}>{c?.tagline}</p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed md:text-lg">{c?.description}</p>
            <p className={`${skin.muted} mt-5 text-sm`}>
              <span className="font-semibold">{strings.sections.caseStudy.stack}:</span> {current.stack.join(' · ')}
            </p>
            {current.url && (
              <a href={current.url} target="_blank" rel="noopener noreferrer" className={`${skin.accent} mt-4 inline-block text-sm font-medium`}>
                {s.visit} ›
              </a>
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
