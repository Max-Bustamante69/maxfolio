const DEFAULT_MAX_VISIBLE = 5

/**
 * Return the visible carousel-page window. Hidden pages are represented by a
 * softened edge dot, so the control never grows beyond the agreed five dots.
 */
export function getCarouselDotWindow(activeIndex, count, maxVisible = DEFAULT_MAX_VISIBLE) {
  const safeCount = Math.max(0, Number(count) || 0)
  const safeMax = Math.max(1, Number(maxVisible) || DEFAULT_MAX_VISIBLE)
  const safeIndex = Math.min(Math.max(0, Number(activeIndex) || 0), Math.max(0, safeCount - 1))

  if (safeCount <= safeMax) {
    return Array.from({ length: safeCount }, (_, index) => ({ index, opacity: 0.3, blur: false }))
  }

  const windowStart = Math.max(0, Math.min(safeCount - safeMax, safeIndex - Math.floor(safeMax / 2)))
  const hasHiddenBefore = windowStart > 0
  const hasHiddenAfter = windowStart + safeMax < safeCount

  return Array.from({ length: safeMax }, (_, visibleIndex) => {
    const index = windowStart + visibleIndex
    let opacity = 0.3
    let blur = false

    if (visibleIndex === 0 && hasHiddenBefore) {
      opacity = 0.14
      blur = true
    } else if (visibleIndex === 1 && hasHiddenBefore) {
      opacity = 0.24
    } else if (visibleIndex === safeMax - 2 && hasHiddenAfter) {
      opacity = 0.24
    } else if (visibleIndex === safeMax - 1 && hasHiddenAfter) {
      opacity = 0.14
      blur = true
    }

    return { index, opacity, blur }
  })
}

/**
 * Canonical carousel pagination. Consumers may skin size and colour, but the
 * five-dot moving window and hidden-page edge treatment stay invariant.
 */
export function CarouselDotPagination({
  count,
  activeIndex = 0,
  onSelect,
  maxVisible = DEFAULT_MAX_VISIBLE,
  activeWidth = 22,
  activeHeight = 6,
  dotSize = 6,
  activeColor = 'var(--color-control-dot-active, currentColor)',
  color = 'var(--color-control-dot, currentColor)',
  className = '',
  gap = 8,
  ariaLabel = 'Paginación',
}) {
  if (count <= 1) return null

  return (
    <div
      className={`flex items-center justify-center ${className}`.trim()}
      style={{ gap }}
      role="tablist"
      aria-label={ariaLabel}
      data-carousel-dot-pagination
    >
      {getCarouselDotWindow(activeIndex, count, maxVisible).map((dot) => {
        const active = dot.index === activeIndex
        return (
          <button
            key={dot.index}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Ir a la página ${dot.index + 1}`}
            onClick={() => onSelect?.(dot.index)}
            // Portfolio adaptation: the button keeps a 24px hit box (WCAG target size) and the
            // visual dot lives in an inner span, so the five-dot window looks exactly the same.
            className="flex shrink-0 items-center justify-center bg-transparent p-0"
            style={{ width: Math.max(24, active ? activeWidth : dotSize), height: 24 }}
            data-carousel-dot-index={dot.index}
          >
            <span
              className="block rounded-pill transition-all duration-[var(--duration-base)]"
              style={{
                width: active ? activeWidth : dotSize,
                height: active ? activeHeight : dotSize,
                backgroundColor: active ? activeColor : color,
                opacity: active ? 1 : dot.opacity,
                filter: dot.blur ? 'blur(0.35px)' : 'none',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
