import { m, useReducedMotion } from 'framer-motion'

const EASE = [0.23, 1, 0.32, 1] as const

interface RevealTextProps {
  text: string
  className?: string
  delay?: number
}

/**
 * Heading choreography: each word rises out of its own clip as the heading scrolls into view
 * (transform + opacity only, once). Screen readers get the whole sentence; reduced motion gets it static.
 */
export function RevealText({ text, className = '', delay = 0 }: RevealTextProps) {
  const reduced = useReducedMotion()
  const words = text.split(' ')
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <m.span
            aria-hidden="true"
            className="inline-block"
            initial={reduced ? false : { y: '105%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: delay + i * 0.05, ease: EASE }}
          >
            {word}
          </m.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}
