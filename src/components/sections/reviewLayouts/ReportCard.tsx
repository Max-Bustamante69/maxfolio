// Direction C — "report card" (axis: artifact). The section reads as the printed document a client
// actually receives after a review, not a visualization of one running: a header block, one ruled row
// per group with a meter, then the full 27-item list with a check column, and a footer stamp. A
// paper register on light (cream ground, printed rules) and an ink register on dark (near-black,
// same rules in reverse) — one bespoke pair of tones layered on top of the skin's own accent, so it
// still looks correct on every frame. The meter is a count, not a score: it shows how many checks a
// group carries relative to the largest group, never a pass rate, and nothing here is claimed as a
// live result for the visitor's own store — see the caption under the header block.
import { m } from 'framer-motion'
import { EASE, ICON_PATHS, type ReviewData } from './types'

export function ReportCard({ data }: { data: ReviewData }) {
  const { skin, rc, checkCount, reduced } = data
  const maxCount = Math.max(...rc.groups.map((g) => g.items.length))

  const paperBg = skin.dark ? 'bg-[#111110] text-[#e7e4dc]' : 'bg-[#faf7f0] text-[#1c1a15]'
  const ruleColor = skin.dark ? 'border-[#2a2823]' : 'border-[#dcd6c6]'

  return (
    <div className={`border-t pt-8 ${skin.line}`}>
      <m.div
        className={`overflow-hidden rounded-[10px] border shadow-[0_10px_40px_rgba(0,0,0,0.08)] ${ruleColor} ${paperBg}`}
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
      >
        {/* Header block. */}
        <div className={`flex flex-wrap items-start justify-between gap-4 border-b p-5 sm:p-7 ${ruleColor}`}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">{rc.reportStoreLabel}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">{rc.reportDateLabel}</p>
          </div>
          <p className={`rounded-full px-3 py-1.5 text-xs font-semibold ${skin.dark ? 'bg-white/10' : 'bg-black/5'}`}>{rc.countLabel.replace('{n}', String(checkCount))}</p>
        </div>

        {/* One ruled row per group, with a count meter. */}
        <div className={`divide-y ${ruleColor}`}>
          {rc.groups.map((group, gi) => {
            const pct = maxCount > 0 ? (group.items.length / maxCount) * 100 : 0
            return (
              <div key={group.label} className="p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="none" className={`h-4 w-4 shrink-0 ${skin.accent}`} aria-hidden="true">
                    <path d={ICON_PATHS[gi]} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-[0.08em]">{group.label}</p>
                  <span className="shrink-0 text-xs tabular-nums opacity-70">{group.items.length}</span>
                </div>
                <div className={`mt-2.5 h-1 overflow-hidden rounded-full ${skin.dark ? 'bg-white/10' : 'bg-black/[0.08]'}`} aria-hidden="true">
                  <m.div className={`h-full rounded-full ${skin.accentBg}`} initial={reduced ? false : { width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: reduced ? 0 : 0.5, ease: EASE }} />
                </div>
                <ul className="mt-3.5 space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] leading-snug">
                      <svg viewBox="0 0 16 16" className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${skin.accent}`} aria-hidden="true">
                        <circle cx="8" cy="8" r="7.25" fill="none" stroke="currentColor" strokeWidth={1.3} />
                        <path d="M4.8 8.3l2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="opacity-90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Footer stamp. */}
        <div className={`border-t p-5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70 sm:p-7 ${ruleColor}`}>{rc.reportFooterLabel}</div>
      </m.div>

      <p className={`mt-4 text-xs leading-relaxed ${skin.muted}`}>{rc.runCaption}</p>
    </div>
  )
}
