import { useState, type FormEvent } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useContent } from '../../hooks'
import { Magnetic, RevealText } from '../common'
import type { Skin } from '../gallery'

interface ContactProps {
  skin: Skin
  ctaClass: string
  /** Opens the contact form, optionally with the message prefilled (the store URL). */
  onContact: (prefill?: string) => void
  /** Overrides the store-URL field's classes, e.g. a recessed Neo field instead of the default bordered one. */
  fieldClassName?: string
}

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * The close, as a typographic moment: one large second-person line, the offer under it, the
 * lowest-friction action first (paste a store URL), the form and plain email as the two ways in,
 * the reassurance beside them, then "what happens next" as a numbered ladder — and the channels
 * on a hairline row below. No card around any of it.
 */
export function Contact({ skin, ctaClass, onContact, fieldClassName }: ContactProps) {
  const { strings, registry } = useContent()
  const reduced = useReducedMotion()
  const c = strings.sections.contact
  const [url, setUrl] = useState('')
  const label = `text-[11px] font-semibold uppercase tracking-[0.18em] ${skin.muted}`
  const field = fieldClassName ?? (skin.dark ? 'border-white/15 bg-white/5 placeholder:text-[#6e6e73] focus:border-[#2997ff]' : 'border-black/15 bg-white placeholder:text-[#a1a1a6] focus:border-[#0071e3]')

  const submitUrl = (e: FormEvent) => {
    e.preventDefault()
    const v = url.trim()
    onContact(v ? `${c.urlLabel}: ${v}\n\n` : undefined)
  }

  return (
    <section id="contact" className="scroll-mt-20" aria-labelledby="contact-heading">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <m.div className="lg:col-span-8" initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease: EASE }}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${skin.accent}`}>{c.eyebrow}</p>
          <h2 id="contact-heading" className="mt-4 max-w-4xl font-sf text-5xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-7xl lg:text-[84px]">
            <RevealText text={c.title} /> <RevealText text={c.titleAccent} className={skin.muted} delay={0.15} />
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed md:text-2xl md:leading-relaxed">{c.lead}</p>

          {/* lowest-friction action: the store URL */}
          <form onSubmit={submitUrl} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch">
            <label htmlFor="store-url" className="sr-only">
              {c.urlLabel}
            </label>
            <input
              id="store-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={c.urlPlaceholder}
              className={`h-12 flex-1 rounded-full border px-5 text-base outline-none transition-colors ${field}`}
            />
            <Magnetic>
              <button type="submit" className={`${ctaClass} h-12 w-full whitespace-nowrap sm:w-auto`}>
                {c.cta}
              </button>
            </Magnetic>
          </form>
          <p className={`${skin.muted} mt-3 max-w-xl text-sm leading-relaxed`}>{c.promise}</p>
          <p className="mt-4 text-sm">
            <a href={`mailto:${registry.personal.email}`} className={`${skin.accent} font-medium`}>
              {c.ctaSecondary} ›
            </a>
          </p>
          <p className="mt-6 text-sm">
            <span className="inline-flex items-center gap-2 font-medium">
              <span className="h-2 w-2 rounded-full bg-[#34c759]" aria-hidden="true" />
              {c.status}
            </span>
            <span className={`${skin.muted} block sm:ml-2 sm:inline`}>
              <span className="hidden sm:inline">· </span>
              {c.note}
            </span>
          </p>
        </m.div>

        {/* what happens next — a numbered ladder, so the click has no unknowns */}
        <div className="lg:col-span-4 lg:pt-10">
          <p className={label}>{c.nextLabel}</p>
          <ol className={`mt-4 border-t ${skin.line}`}>
            {c.next.map((step, i) => (
              <m.li
                key={step}
                className={`flex gap-4 border-b py-4 ${skin.line}`}
                initial={reduced ? false : { opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: EASE }}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums text-white ${skin.accentBg}`}>{i + 1}</span>
                <span className="text-sm leading-relaxed md:text-base">{step}</span>
              </m.li>
            ))}
          </ol>
        </div>
      </div>

      <dl className={`mt-14 grid gap-x-8 gap-y-6 border-t pt-8 sm:grid-cols-2 lg:grid-cols-4 ${skin.line}`}>
        <div>
          <dt className={label}>{c.email}</dt>
          <dd className="mt-2 text-base">
            <a href={`mailto:${registry.personal.email}`} className={`${skin.accent} break-all`}>
              {registry.personal.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className={label}>{c.phone}</dt>
          <dd className="mt-2 text-base">
            <a href={registry.personal.phoneHref} className={skin.accent}>
              {registry.personal.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt className={label}>{c.location}</dt>
          <dd className="mt-2 text-base">{strings.location}</dd>
        </div>
        <div>
          <dt className={label}>{c.elsewhere}</dt>
          <dd className="mt-2 flex gap-5 text-base">
            <a href={registry.personal.linkedin} target="_blank" rel="noopener noreferrer" className={skin.accent}>
              LinkedIn ›
            </a>
            <a href={registry.personal.github} target="_blank" rel="noopener noreferrer" className={skin.accent}>
              GitHub ›
            </a>
          </dd>
        </div>
      </dl>
    </section>
  )
}
