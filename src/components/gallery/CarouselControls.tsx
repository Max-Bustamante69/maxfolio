import { CarouselArrowButton, CarouselDotPagination, type CarouselControlsState } from '../../vendor/carousel'
import type { Skin } from './skins'

interface GlassControlsProps {
  state: CarouselControlsState
  skin: Skin
  labels: { prev: string; next: string }
}

/**
 * iOS-style control row for the house carousel, rendered through its `renderControls` slot so the
 * behaviour (page math, step-by-one, mobile visibility) stays the carousel's. The five-dot moving
 * window is the house `CarouselDotPagination`, sitting in a glass capsule; the arrows are the house
 * `CarouselArrowButton` in glass discs. Apple keeps the pill; luxury and brutalist square it off.
 */
export function GlassControls({ state, skin, labels }: GlassControlsProps) {
  const { page, pages, goToPage, step } = state
  if (pages <= 1) return null
  const d = skin.dark
  const shape = skin.frame === 'apple' ? 'rounded-full' : 'rounded-none'
  const surface = d
    ? 'glass bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_24px_rgba(0,0,0,0.35)]'
    : 'glass bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.08)]'
  const edge = skin.frame === 'brutalist' ? (d ? 'border-2 border-stone-700' : 'border-2 border-stone-900') : d ? 'border border-white/15' : 'border border-white/80'
  const disc = `inline-flex h-8 w-8 items-center justify-center ${shape} ${surface} ${edge} transition-transform duration-150 ease-out-strong`

  return (
    <div className="flex items-center justify-between gap-4" data-carousel-controls>
      <div className={`flex h-8 items-center px-3 ${shape} ${surface} ${edge}`}>
        <CarouselDotPagination count={pages} activeIndex={page} onSelect={goToPage} dotSize={6} activeWidth={18} activeHeight={6} gap={6} />
      </div>
      <div className="flex items-center gap-2">
        <span className={`${disc} ${page === 0 ? '' : 'press'}`}>
          <CarouselArrowButton dir={-1} disabled={page === 0} onClick={() => step(-1)} label={labels.prev} size={32} iconWidth={14} />
        </span>
        <span className={`${disc} ${page >= pages - 1 ? '' : 'press'}`}>
          <CarouselArrowButton dir={1} disabled={page >= pages - 1} onClick={() => step(1)} label={labels.next} size={32} iconWidth={14} />
        </span>
      </div>
    </div>
  )
}
