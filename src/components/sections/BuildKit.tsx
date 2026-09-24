import { useRef, type ReactNode } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { RevealText } from '../common'
import { CountUp } from '../gallery/charts'
import { sheetTokens, type Skin } from '../gallery'

const EASE = [0.23, 1, 0.32, 1] as const

interface BuildKitProps {
  skin: Skin
}

// Reveal + the eyebrow/h2/lead markup below are reproduced from Apple.tsx's own page-local `Reveal`
// and `Heading` — this section can't import a closure defined inside AppleContent, so these two stay
// byte-for-byte in step with Apple.tsx's own classes on purpose (round-47 brief).
const Reveal = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <m.div
    initial={{ opacity: 0, y: 20, scale: 0.985 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, delay, ease: EASE }}
    className={className}
  >
    {children}
  </m.div>
)

/** Six-dot drag handle — the one recurring "this row is reorderable" affordance in every theme editor. */
const DragDots = ({ dark }: { dark: boolean }) => (
  <svg viewBox="0 0 10 16" className="h-3.5 w-2.5 shrink-0" aria-hidden="true">
    {[2, 8].map((x) =>
      [2, 8, 14].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill={dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.28)'} />),
    )}
  </svg>
)

const Chevron = ({ open, dark }: { open: boolean; dark: boolean }) => (
  <svg viewBox="0 0 16 16" className={`h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke={dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)'} strokeWidth={1.8} aria-hidden="true">
    <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Tile 1 — "Your repo, your history": a small git-log timeline, one row per store, real commit
 *  counts read live from the registry (never copy). The dot/line/bar are decorative (aria-hidden);
 *  each real number stays in the accessible text via a `sr-only` twin, same convention MeasuredBand
 *  and StatBand already use for their own CountUp numerals. */
function RepoGraphic({ rows, unit, dark, accent, show, reduced }: { rows: { name: string; commits: number }[]; unit: string; dark: boolean; accent: string; show: boolean; reduced: boolean }) {
  const max = Math.max(...rows.map((r) => r.commits), 1)
  const [pre, post] = unit.split('{n}').length === 2 ? unit.split('{n}') : ['', ` ${unit}`]
  const line = dark ? 'bg-white/15' : 'bg-black/10'
  const track = dark ? 'bg-white/10' : 'bg-black/[0.06]'
  return (
    <div className="relative pl-5">
      <div className={`absolute left-[3px] top-1.5 bottom-1.5 w-px ${line}`} aria-hidden="true" />
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.name} className="relative">
            <span className="absolute -left-5 top-1 h-[7px] w-[7px] rounded-full" style={{ background: accent }} aria-hidden="true" />
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[13px] font-medium">{r.name}</span>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                <span className="sr-only">{`${r.commits}${post}`}</span>
                <span aria-hidden="true">
                  {pre}
                  {show ? <CountUp value={r.commits} duration={0.8} delay={0.1 + i * 0.1} /> : r.commits}
                  {post}
                </span>
              </span>
            </div>
            <div className={`mt-1.5 h-1 overflow-hidden rounded-full ${track}`} aria-hidden="true">
              {reduced ? (
                <div className="h-full rounded-full" style={{ width: `${(r.commits / max) * 100}%`, background: accent }} />
              ) : (
                <m.div
                  className="h-full rounded-full"
                  style={{ background: accent }}
                  initial={{ width: '0%' }}
                  animate={{ width: show ? `${(r.commits / max) * 100}%` : '0%' }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.7, ease: EASE }}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Tile 2 — "40+ Shopify checks before launch": a handful of the real names `packages/qa` covers
 *  (deep-qa.mjs's behavioral crawl + the fixpack guards), each with a drawn checkmark that draws in
 *  once on view. Text is real content, not decorative — only the check-glyph itself is aria-hidden. */
function ChecklistGraphic({ items, dark, accent, show, reduced }: { items: string[]; dark: boolean; accent: string; show: boolean; reduced: boolean }) {
  const ring = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={item} className="flex items-start gap-2.5 text-[13px] leading-snug">
          <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill="none" stroke={ring} strokeWidth="1.4" />
            {reduced ? (
              <path d="M4.6 8.2 7 10.6 11.4 5.8" fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <m.path
                d="M4.6 8.2 7 10.6 11.4 5.8"
                fill="none"
                stroke={accent}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: EASE }}
              />
            )}
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Tile 3 — "Sections you edit without a developer": a minimal theme-editor sidebar mock (section
 *  list with drag handles, one block expanded to a single field). Purely illustrative of a UI shape
 *  the copy already states in words, so the whole mock is aria-hidden. */
function EditorGraphic({ items, blockLabel, fieldLabel, dark, accent }: { items: string[]; blockLabel: string; fieldLabel: string; dark: boolean; accent: string }) {
  const line = dark ? 'border-white/10' : 'border-black/10'
  const rowOn = dark ? 'bg-white/[0.06]' : 'bg-black/[0.035]'
  return (
    <div className={`overflow-hidden rounded-[14px] border text-[12px] ${line}`} aria-hidden="true">
      {items.map((label, i) => {
        const active = label === blockLabel
        return (
          <div key={label} className={i > 0 ? `border-t ${line}` : ''}>
            <div className={`flex items-center gap-2 px-3 py-2 ${active ? rowOn : ''}`}>
              <DragDots dark={dark} />
              <span className="flex-1 truncate font-medium">{label}</span>
              <Chevron open={active} dark={dark} />
            </div>
            {active && (
              <div className={`border-t px-3 py-2.5 pl-8 ${line} ${dark ? 'bg-black/20' : 'bg-black/[0.02]'}`}>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide opacity-60">{fieldLabel}</p>
                <div className={`flex h-6 items-center rounded-md border px-2 ${line} ${dark ? 'bg-white/5' : 'bg-white'}`}>
                  <span className="h-[7px] w-16 rounded-sm" style={{ background: accent, opacity: 0.55 }} />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Tile 4 — "Measured from day one": a small illustrative event-stream (bar heights are decorative,
 *  aria-hidden — never a stand-in for real per-event counts) under the one real, sourced figure: a
 *  store's own tracked-element count, read from its registry fact rather than typed into copy. */
function TrackingGraphic({ caption, factValue, dark, accent, show, reduced }: { caption: string; factValue: string; dark: boolean; accent: string; show: boolean; reduced: boolean }) {
  const bars = [38, 62, 28, 78, 48, 68, 42]
  const track = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
  const parsed = factValue.match(/^(\d[\d,]*)(.*)$/)
  const num = parsed ? Number(parsed[1].replace(/,/g, '')) : 0
  const suffix = parsed ? parsed[2] : ''
  const [pre, post] = caption.split('{n}').length === 2 ? caption.split('{n}') : ['', ` ${caption}`]
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-14 items-end gap-1" aria-hidden="true">
        {bars.map((h, i) =>
          reduced ? (
            <div key={i} className="w-full rounded-t-sm" style={{ height: `${h}%`, background: i % 2 ? accent : track }} />
          ) : (
            <m.div
              key={i}
              className="w-full rounded-t-sm"
              style={{ background: i % 2 ? accent : track }}
              initial={{ height: '0%' }}
              animate={{ height: show ? `${h}%` : '0%' }}
              transition={{ delay: 0.06 * i, duration: 0.5, ease: EASE }}
            />
          ),
        )}
      </div>
      <p className="text-[13px] font-semibold leading-snug">
        <span className="sr-only">{caption.replace('{n}', factValue)}</span>
        <span aria-hidden="true">
          {pre}
          {show ? <CountUp value={num} suffix={suffix} duration={0.8} /> : factValue}
          {post}
        </span>
      </p>
    </div>
  )
}

/**
 * "Every build ships with" — four concrete, checkable deliverables (repo history, launch checks,
 * editable sections, first-party tracking) that replaced the Manifesto band's four abstract lines on
 * the Apple theme only (round 47; every other theme still renders Manifesto.tsx unchanged). Apple-only
 * markup throughout (frame width, `font-sf`, `apple-*` tokens) — gated on `skin.frame === 'apple'`
 * defensively, since the page only ever mounts this on that skin.
 */
export function BuildKit({ skin }: BuildKitProps) {
  const { strings, registry } = useContent()
  // Hooks run unconditionally on every render (Rules of Hooks) — the `skin.frame` guard below is a
  // defensive no-op in practice, since Apple.tsx is the only caller, but a prop-gated early return has
  // to come after every hook call, not before.
  const gridRef = useRef<HTMLUListElement>(null)
  const inView = useInView(gridRef, { once: true, margin: '-80px' })
  const reduced = useReducedMotion() ?? false
  const show = inView || reduced

  if (skin.frame !== 'apple') return null
  const bk = strings.sections.buildKit
  const dark = skin.dark
  const { accent } = sheetTokens(skin)
  const muted = dark ? 'text-apple-darkMuted' : 'text-apple-muted'
  const surface = dark ? 'bg-apple-darkSurface' : 'bg-apple-surface'
  const card = `rounded-[22px] ${dark ? 'bg-white/5' : 'bg-white shadow-tile'}`

  const bySlug = (slug: string) => registry.stores.find((s) => s.slug === slug)
  const repoRows = (['nos-cafe', 'millennio', 'luxe-shine'] as const)
    .map((slug) => bySlug(slug))
    .filter((s): s is NonNullable<typeof s> => !!s && typeof s.commits === 'number')
    .map((s) => ({ name: s.name, commits: s.commits as number }))
  const trackedFact = bySlug('millennio')?.facts.find((f) => f.id === 'tracked')?.value ?? '260+'

  const tiles = [
    { key: 'repo', title: bk.tiles.repo.title, body: bk.tiles.repo.body, graphic: repoRows.length > 0 && <RepoGraphic rows={repoRows} unit={bk.tiles.repo.unit} dark={dark} accent={accent} show={show} reduced={reduced} /> },
    { key: 'checks', title: bk.tiles.checks.title, body: bk.tiles.checks.body, graphic: <ChecklistGraphic items={bk.tiles.checks.items} dark={dark} accent={accent} show={show} reduced={reduced} /> },
    { key: 'editor', title: bk.tiles.editor.title, body: bk.tiles.editor.body, graphic: <EditorGraphic items={bk.tiles.editor.items} blockLabel={bk.tiles.editor.blockLabel} fieldLabel={bk.tiles.editor.fieldLabel} dark={dark} accent={accent} /> },
    { key: 'tracking', title: bk.tiles.tracking.title, body: bk.tiles.tracking.body, graphic: <TrackingGraphic caption={bk.tiles.tracking.caption} factValue={trackedFact} dark={dark} accent={accent} show={show} reduced={reduced} /> },
  ] as const

  return (
    <section id="build-kit" data-track-section="build-kit" className={`py-14 md:py-20 scroll-mt-20 lg:scroll-mt-[92px] ${surface}`} aria-labelledby="build-kit-heading">
      <div className="frame">
        <Reveal className="mb-10 md:mb-14">
          <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${dark ? 'text-apple-blueDark' : 'text-[#0066cc]'} mb-3`}>{bk.eyebrow}</p>
          <h2 id="build-kit-heading" className="font-sf text-4xl md:text-6xl font-semibold tracking-[-0.025em] leading-[1.05]">
            <RevealText text={bk.title} /> <RevealText text={bk.titleAccent} className={muted} delay={0.1} />
          </h2>
          <p className={`${muted} text-lg md:text-xl mt-5 max-w-2xl leading-relaxed`}>{bk.lead}</p>
        </Reveal>

        <ul ref={gridRef} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tiles.map((tile, i) => (
            <m.li
              key={tile.key}
              className={`${card} flex flex-col gap-5 p-6`}
              initial={reduced ? false : { opacity: 0, y: 18, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
            >
              {/* One stage height for every artifact (the editor mock is the tallest, ~12.8rem), so the
                  four titles start on the same line wherever tiles sit side by side. */}
              <div className="flex flex-col justify-center md:min-h-[13rem]">{tile.graphic}</div>
              <div>
                <h3 className="font-sf text-[15px] font-semibold tracking-[-0.01em]">{tile.title}</h3>
                <p className={`${muted} mt-1.5 text-[13px] leading-relaxed`}>{tile.body}</p>
              </div>
            </m.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
