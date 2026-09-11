// Dev-only comparison switcher for the four `?skillsMobile=` candidates — only rendered by
// `MobileSkillsLayout` when the page already loaded with the param present, so a real phone visitor
// never sees it. Mirrors the desktop `LayoutSwitcher` (`?skills=`) one level down.
import { MOBILE_LAYOUT_IDS, type MobileLayoutId } from '../types'
import type { Skin } from '../../../gallery'
import type { SkillsStrings } from '../../skillsFormat'

interface MobileLayoutSwitcherProps {
  skin: Skin
  sk: SkillsStrings
  active: MobileLayoutId
  onSelect: (id: MobileLayoutId) => void
}

const OPTION_LABEL: Record<MobileLayoutId, keyof SkillsStrings['mobile']> = {
  a: 'optionAccordion',
  b: 'optionRail',
  c: 'optionRanked',
  d: 'optionConstellation',
}

export function MobileLayoutSwitcher({ skin, sk, active, onSelect }: MobileLayoutSwitcherProps) {
  return (
    <div role="group" aria-label={sk.mobile.switcherLabel} className={`mb-5 flex flex-wrap gap-1.5 border-b pb-4 text-xs ${skin.line}`}>
      {MOBILE_LAYOUT_IDS.map((id) => (
        <button key={id} type="button" aria-pressed={active === id} onClick={() => onSelect(id)} className={`rounded-full px-2.5 py-1 transition-colors ${active === id ? skin.chipOn : skin.chip}`}>
          {sk.mobile[OPTION_LABEL[id]]}
        </button>
      ))}
    </div>
  )
}
