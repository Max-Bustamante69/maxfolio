// The sub-1024px (and reduced-motion) gate `OrbitLayout` renders instead of the orbit itself.
// 2026-09-11 owner feedback: "in mobile this section is still horrible, find another way... you can
// present me options to choose from, maybe accordions." Default (no `?skillsMobile=` in the URL) stays
// exactly the current ledger — nothing changes for a real visitor until the owner picks one of the four
// candidates below from the contact sheet. The four are code-split (`React.lazy`): a phone that never
// loads `?skillsMobile=` never downloads any of their code, only this dispatcher and the switcher.
import { lazy, Suspense, useState } from 'react'
import { LedgerLayout } from '../LedgerLayout'
import { isMobileLayoutId, type MobileLayoutId } from '../types'
import type { SkillsLayoutProps } from '../types'
import { MobileLayoutSwitcher } from './MobileLayoutSwitcher'

const AccordionMobile = lazy(() => import('./AccordionMobile').then((m) => ({ default: m.AccordionMobile })))
const RailMobile = lazy(() => import('./RailMobile').then((m) => ({ default: m.RailMobile })))
const RankedListMobile = lazy(() => import('./RankedListMobile').then((m) => ({ default: m.RankedListMobile })))
const ConstellationMobile = lazy(() => import('./ConstellationMobile').then((m) => ({ default: m.ConstellationMobile })))

const readInitialMobileLayout = (): { layout: MobileLayoutId; hasParam: boolean } => {
  if (typeof window === 'undefined') return { layout: 'a', hasParam: false }
  try {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('skillsMobile')) return { layout: 'a', hasParam: false }
    const v = params.get('skillsMobile')
    return { layout: isMobileLayoutId(v) ? v : 'a', hasParam: true }
  } catch {
    return { layout: 'a', hasParam: false }
  }
}

export function MobileSkillsLayout({ data }: SkillsLayoutProps) {
  const [{ layout: initialLayout, hasParam }] = useState(readInitialMobileLayout)
  const [layout, setLayout] = useState<MobileLayoutId>(initialLayout)

  const onSelect = (id: MobileLayoutId) => {
    setLayout(id)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('skillsMobile', id)
      window.history.replaceState(null, '', url)
    } catch {
      // preview-only convenience; never block the switch on it
    }
  }

  // No param at all: the real, shipped default — the ledger, unchanged. The switcher (and every
  // candidate's own extra weight) never renders or loads for an ordinary visitor.
  if (!hasParam) return <LedgerLayout data={data} />

  return (
    <div>
      <MobileLayoutSwitcher skin={data.skin} sk={data.sk} active={layout} onSelect={onSelect} />
      <Suspense fallback={null}>
        {layout === 'a' && <AccordionMobile data={data} />}
        {layout === 'b' && <RailMobile data={data} />}
        {layout === 'c' && <RankedListMobile data={data} />}
        {layout === 'd' && <ConstellationMobile data={data} />}
      </Suspense>
    </div>
  )
}
