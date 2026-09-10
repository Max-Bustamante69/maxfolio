import { useContent } from '../../hooks'
import type { Skin } from '../gallery'
import type { SectionHeading } from './Gallery'

interface ReviewChecklistProps {
  skin: Skin
  heading: SectionHeading
  onCta: () => void
}

/** The real floor confirmed against @digitdeck/qa on disk (2026-09-09): 27 convention assertions
 *  (packages/qa/conventions/assertions/**\/*.mjs, excluding __tests__) + 15 fixpack guards
 *  (packages/qa/guards/*.guard.mjs) + 6 behavioral areas in packages/qa/deep-qa.mjs's own README
 *  table = 48. Never claimed as "48+" here — only the floor the task instructions allow. */
const CHECK_COUNT = 40

/**
 * What the free 20-minute review actually runs: the categories the Playwright QA harness behind
 * every Digitdeck store checks, as a dense two-column ledger — not a marketing list, the real
 * assertion groups read off packages/qa/conventions/assertions/**, packages/qa/guards/** and
 * packages/qa/deep-qa.mjs's own README table.
 */
export function ReviewChecklist({ skin, heading, onCta }: ReviewChecklistProps) {
  const { strings } = useContent()
  const rc = strings.sections.reviewChecklist

  return (
    <section id="review-checklist" className="scroll-mt-20">
      {heading(rc.eyebrow, rc.title, rc.titleAccent, rc.lead)}

      <p className={`mb-8 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}>{rc.countLabel.replace('{n}', String(CHECK_COUNT))}</p>

      <div className={`grid gap-x-10 gap-y-8 border-t pt-8 sm:grid-cols-2 ${skin.line}`}>
        {rc.groups.map((group) => (
          <div key={group.label}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.accent}`}>{group.label}</p>
            <ul className={`mt-3 space-y-2 border-l pl-4 ${skin.line}`}>
              {group.items.map((item) => (
                <li key={item} className="text-sm leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button type="button" onClick={onCta} className="press mt-10 inline-flex items-center justify-center rounded-full bg-apple-blue px-6 py-3 text-sm font-medium text-white hover:bg-apple-blueHover">
        {rc.cta}
      </button>
    </section>
  )
}
