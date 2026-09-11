// Direction A — "console replay" (axis: time). The review reads as a log a QA harness would
// actually print: one line per check, typed out in order at a fixed pace, auto-scrolling, with a
// header line and a blinking cursor that stops the moment the log is done. A themed monospace panel
// (skin tokens, not a hardcoded terminal palette — this has to look right on every skin, including
// the ones that are not the `terminal` frame) replaces the device-frame-and-scanline metaphor with a
// literal replay: the elapsed-ms figure next to each line is the real pacing of this animation, never
// a claimed measurement of the visitor's own store — the caption under the panel says so.
import { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { EASE, ICON_PATHS, type ReviewData } from './types'

/** One log line every 80ms — the task's own pacing for this direction. */
const STEP_MS = 80

export function ConsoleReplay({ data }: { data: ReviewData }) {
  const { skin, rc, checkCount, reduced, flat, started, total } = data
  const [runStep, setRunStep] = useState(reduced ? total : 0)
  const [cursorOn, setCursorOn] = useState(true)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) {
      setRunStep(total)
      return
    }
    if (!started || runStep >= total) return
    const t = setTimeout(() => setRunStep((s) => Math.min(total, s + 1)), STEP_MS)
    return () => clearTimeout(t)
  }, [started, runStep, reduced, total])

  // Auto-scroll to the newest line as it prints.
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [runStep])

  // Blinking cursor while the log is still typing, off (solid, no blink) once it's done.
  useEffect(() => {
    if (reduced || runStep >= total) {
      setCursorOn(runStep < total)
      return
    }
    const t = setInterval(() => setCursorOn((v) => !v), 480)
    return () => clearInterval(t)
  }, [runStep, total, reduced])

  const complete = runStep >= total
  const panelBg = skin.dark ? 'bg-black' : 'bg-[#0d0f10]'
  const panelInk = skin.dark ? 'text-[#e4e7e4]' : 'text-[#e4e7e4]'

  const replay = () => {
    if (reduced) return
    setRunStep(0)
  }

  return (
    <div className={`grid gap-6 border-t pt-8 md:grid-cols-[minmax(0,1fr)_200px] ${skin.line}`}>
      {/* The log itself. */}
      <div>
        <div className={`flex items-center justify-between rounded-t-[14px] border border-b-0 px-4 py-2.5 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-black/[0.03]'}`}>
          <p className={`truncate font-mono text-[11px] tracking-tight ${skin.accent}`}>{rc.consoleHeaderLine.replace('{n}', String(checkCount))}</p>
          <button type="button" onClick={replay} disabled={reduced} className={`press shrink-0 rounded-full px-3 py-1 font-mono text-[11px] disabled:opacity-40 ${skin.chip}`}>
            {rc.replayLabel}
          </button>
        </div>
        <div ref={logRef} className={`h-72 overflow-y-auto rounded-b-[14px] border px-4 py-3 font-mono text-[12px] leading-[1.7] ${skin.line} ${panelBg} ${panelInk}`} aria-live="off">
          {flat.slice(0, runStep).map((f, idx) => {
            const elapsedMs = (idx + 1) * STEP_MS
            const code = rc.groups[f.gi].label.slice(0, 3).toUpperCase()
            return (
              <m.div
                key={`${f.gi}-${f.ii}`}
                className="flex gap-2 whitespace-pre-wrap break-words"
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.18, ease: EASE }}
              >
                <span className="shrink-0 text-[#39ff88]">✓</span>
                <span className="shrink-0 opacity-60">[{code}]</span>
                <span className="min-w-0 flex-1">{f.item}</span>
                <span className="shrink-0 opacity-40 tabular-nums">{elapsedMs}ms</span>
              </m.div>
            )
          })}
          {!complete && (
            <span aria-hidden="true" className={`inline-block h-3.5 w-2 translate-y-0.5 bg-[#39ff88] ${cursorOn ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </div>
        <p className={`mt-4 text-xs leading-relaxed ${skin.muted}`}>{rc.runCaption}</p>
      </div>

      {/* The 7 groups as a legend, counts on the right. */}
      <div className={`grid grid-cols-2 gap-2 self-start md:grid-cols-1 md:gap-1.5`}>
        {rc.groups.map((group, gi) => (
          <div key={group.label} className={`flex items-center gap-2 rounded-[10px] border px-2.5 py-2 ${skin.line} ${skin.dark ? 'bg-white/[0.03]' : 'bg-white'}`}>
            <svg viewBox="0 0 24 24" fill="none" className={`h-3.5 w-3.5 shrink-0 ${skin.accent}`} aria-hidden="true">
              <path d={ICON_PATHS[gi]} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={`min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-[0.1em] ${skin.body}`}>{group.label}</span>
            <span className={`shrink-0 text-[11px] tabular-nums ${skin.muted}`}>{group.items.length}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
