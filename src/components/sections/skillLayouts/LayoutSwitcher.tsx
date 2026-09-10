// Dev-only comparison switcher: only rendered when the page loaded with `?skills=` present at all,
// so shoppers never see it. Lets the owner flip between the six candidate layouts (plus the current
// tiles) on one live preview without editing the URL by hand. Updates the query string too, so a
// reload or a shared link keeps the chosen layout.
import type { LayoutId } from './types'
import { LAYOUT_IDS, LAYOUT_META } from './types'
import type { Skin } from '../../gallery'

interface LayoutSwitcherProps {
  skin: Skin
  active: LayoutId
  onSelect: (id: LayoutId) => void
}

export function LayoutSwitcher({ skin, active, onSelect }: LayoutSwitcherProps) {
  return (
    <div role="group" aria-label="Skills layout switcher (preview only)" className={`-mx-4 mb-6 flex flex-wrap gap-1.5 border-b px-4 pb-4 text-xs md:mx-0 md:px-0 ${skin.line}`}>
      <span className={`mr-1 self-center text-[10px] font-semibold uppercase tracking-[0.14em] ${skin.muted}`}>layout:</span>
      {LAYOUT_IDS.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={active === id}
          onClick={() => onSelect(id)}
          className={`rounded-full px-2.5 py-1 transition-colors ${active === id ? skin.chipOn : skin.chip}`}
        >
          {LAYOUT_META[id]}
        </button>
      ))}
    </div>
  )
}
