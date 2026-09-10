// Owner-only comparison switcher: only rendered when the page loaded with `?featured=` present at
// all, so visitors never see it. Lets the owner flip between the four candidate variants on one live
// preview without editing the URL by hand. Updates the query string too, so a reload or a shared link
// keeps the chosen variant.
import type { Skin } from '../../gallery'
import { VARIANT_IDS, VARIANT_META, type VariantId } from './types'

interface VariantSwitcherProps {
  skin: Skin
  active: VariantId
  onSelect: (id: VariantId) => void
}

export function VariantSwitcher({ skin, active, onSelect }: VariantSwitcherProps) {
  return (
    <div role="group" aria-label="Featured build variant switcher (preview only)" className={`-mx-4 mb-6 flex flex-wrap gap-1.5 border-b px-4 pb-4 text-xs md:mx-0 md:px-0 ${skin.line}`}>
      <span className={`mr-1 self-center text-[10px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>variant:</span>
      {VARIANT_IDS.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={active === id}
          onClick={() => onSelect(id)}
          className={`rounded-full px-2.5 py-1 transition-colors ${active === id ? skin.chipOn : skin.chip}`}
        >
          {id.toUpperCase()} · {VARIANT_META[id]}
        </button>
      ))}
    </div>
  )
}
