import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'framer-motion'

export interface LightboxItem {
  key: string
  label: string
  src: string
  kind: 'desktop' | 'mobile'
}

interface GalleryLightboxProps {
  open: boolean
  title: string
  items: LightboxItem[]
  onClose: () => void
  closeLabel: string
}

export function GalleryLightbox({ open, title, items, onClose, closeLabel }: GalleryLightboxProps) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (open) setI(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI((v) => (v + 1) % items.length)
      if (e.key === 'ArrowLeft') setI((v) => (v - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, items.length, onClose])

  const current = items[i]

  const content = (
    <AnimatePresence>
      {open && current && (
        <m.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[9998] bg-black/85 backdrop-blur-sm flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 text-white" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium truncate">
              {title} · <span className="text-white/60">{current.label}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setI((v) => (v - 1 + items.length) % items.length)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 compact-touch"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setI((v) => (v + 1) % items.length)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 compact-touch"
                aria-label="Next"
              >
                ›
              </button>
              <button type="button" onClick={onClose} className="px-3 h-9 text-sm rounded-full bg-white/10 hover:bg-white/20 compact-touch">
                {closeLabel}
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center px-4 pb-2" onClick={(e) => e.stopPropagation()}>
            <m.img
              key={current.key}
              src={current.src}
              alt={`${title} — ${current.label}`}
              className={`max-h-full max-w-full object-contain ${current.kind === 'mobile' ? 'rounded-[28px]' : 'rounded-lg'}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            />
          </div>
          <div className="flex justify-center gap-2 py-3" onClick={(e) => e.stopPropagation()}>
            {items.map((it, idx) => (
              <button
                key={it.key}
                type="button"
                onClick={() => setI(idx)}
                aria-label={it.label}
                aria-current={idx === i}
                className={`h-1.5 rounded-full transition-all compact-touch min-h-0 ${idx === i ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                style={{ minHeight: 6 }}
              />
            ))}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}
