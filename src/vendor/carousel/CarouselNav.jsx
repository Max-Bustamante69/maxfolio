/**
 * CarouselNav — the carousel control row (dots LEFT, canonical icon arrows RIGHT).
 * Plugs into <Carousel renderControls={(api) => <CarouselNav {...api} />}>.
 *
 * Geometry is 1-to-1 with the TGB Framer export (product-carousel §5 /
 * ingredients §6, shared "Carousel Arrows" r5UqLATtB):
 * - One space-between row: dots LEFT, arrows RIGHT.
 * - Dots: active 12×12 opacity 1 / inactive 8×8 opacity 0.4, radius 9999,
 *   gap 15px.
 * - Arrows: canonical long-arrow glyph, icon-only by default. Legacy variants
 *   remain available for older sections, but new carousel movement controls use
 *   `CarouselArrowButton` / `CarouselArrowIcon`.
 *
 * ── COLOR (QA #15) — customizable, BACKWARD-COMPATIBLE ──────────────────────
 * Every color resolves through a CSS custom property whose *fallback* is the
 * component's ORIGINAL black/white literal. So:
 *   • A store that defines none of the `--color-control-*` tokens (e.g. TGB)
 *     renders EXACTLY as before — pixel-identical black dots / black-solid next
 *     arrow / outlined prev. No call-site change, no regression.
 *   • A store can re-skin EVERY carousel at once just by defining the tokens in
 *     its theme (no per-call props):
 *         --color-control-dot         inactive dot      (e.g. var(--color-brand-primary))
 *         --color-control-dot-active  active dot        (e.g. var(--color-heading))
 *         --color-control-arrow       arrow accent      (border + icon + solid fill)
 *         --color-control-arrow-on    icon on a solid   (e.g. var(--color-surface))
 *   • Or opt a single call into the design-system brand tokens with `brand`,
 *     and/or override any individual color/icon/shape with a prop.
 *
 * Legacy `invert` (white-on-dark Variant 2) is unchanged and still wins, so
 * TGB's `<CarouselNav invert />` (lightbox / before-after on dark) is untouched.
 *
 * Props (all optional except the Carousel renderControls API):
 *   Carousel API : page, pages, ratio?, goToPage, step
 *   className    : extra classes on the row
 *   maxDots      : windowed-dots cap (default 5)
 *   invert       : legacy Variant-2 (white-on-dark) shortcut. Wins over tokens.
 *   brand        : resolve the default palette from the design-system brand
 *                  tokens (--color-brand-primary / --color-heading /
 *                  --color-surface) instead of the black/white default. The
 *                  Nalua look: sage dots, deep-green arrows.
 *   icon         : 'arrow' (long TGB arrow, default) | 'chevron' (short chevron,
 *                  the Nalua `< >` look) | custom ({ width, className }) => node.
 *   shape        : 'circle' (default) | 'pill' | 'square' — arrow button shape.
 *   variant      : 'minimal' (default: same icon-only carousel arrow everywhere) |
 *                  'outline-solid' (prev outline + next solid) |
 *                  'outline' (both outline) | 'solid' (both solid) | 'minimal'
 *                  (bare icons, no button chrome — e.g. the Nalua inline `< >`).
 *   dotShape     : 'dot' (default; active = 12px circle) | 'bar' (active = 22px
 *                  pill, the agency "growing bar").
 *   dotColor / activeDotColor / arrowColor / arrowIconColor
 *                : per-call color overrides (any CSS color or token). Win over
 *                  `brand`, `invert`, and the token defaults.
 */

// Default color chain. Each token falls back to the ORIGINAL literal so a store
// that defines nothing renders byte-identical to the pre-#15 component.
const DEFAULT = {
  dot: 'var(--color-control-dot, rgb(0,0,0))',
  dotActive: 'var(--color-control-dot-active, rgb(0,0,0))',
  arrow: 'var(--color-control-arrow, rgb(0,0,0))',
  arrowOn: 'var(--color-control-arrow-on, rgb(255,255,255))',
}
// `brand` opt-in: same token names, but fall back to the design-system brand
// tokens (which themselves fall back to nalua's literals).
const BRAND = {
  dot: 'var(--color-control-dot, var(--color-brand-primary, #788f65))',
  dotActive: 'var(--color-control-dot-active, var(--color-heading, #254525))',
  arrow: 'var(--color-control-arrow, var(--color-heading, #254525))',
  arrowOn: 'var(--color-control-arrow-on, var(--color-surface, #ffffff))',
}
const INVERT = {
  dot: 'rgb(255,255,255)',
  dotActive: 'rgb(255,255,255)',
  arrow: 'rgb(255,255,255)',
  arrowOn: 'rgb(0,0,0)',
}

export function CarouselNav({
  page,
  pages,
  goToPage,
  step,
  invert = false,
  brand = false,
  className = '',
  maxDots = 5,
  /* SIN valor por defecto, a proposito (Max, 2026-08-29). Un `icon = 'arrow'`
     aqui cuenta como valor EXPLICITO y pisa al defecto de la tienda: Para Machos
     llamaba a `setDefaultCarouselArrowIcon('caret')` en su entrypoint y aun asi
     esta fila salia con flecha, porque el defecto de parametro llegaba antes.
     Sin valor, `ArrowIcon` cae al defecto de la tienda, que es lo que se queria. */
  icon,
  shape = 'circle',
  variant = 'minimal',
  dotShape = 'dot',
  dotColor,
  activeDotColor,
  arrowColor,
  arrowIconColor,
}) {
  const hidden = pages <= 1
  const capped = !hidden && pages > maxDots
  const windowStart = capped ? Math.max(0, Math.min(pages - maxDots, page - Math.floor(maxDots / 2))) : 0
  const visibleDots = capped
    ? Array.from({ length: maxDots }, (_, i) => windowStart + i)
    : Array.from({ length: pages }, (_, i) => i)

  // Resolve the palette: explicit per-call props win, then `invert`, then
  // `brand`, then the black/white token default.
  const base = invert ? INVERT : brand ? BRAND : DEFAULT
  const C = {
    dot: dotColor ?? base.dot,
    dotActive: activeDotColor ?? base.dotActive,
    arrow: arrowColor ?? base.arrow,
    arrowOn: arrowIconColor ?? base.arrowOn,
  }
  const bar = dotShape === 'bar'

  return (
    <div
      className={`flex w-full items-center justify-between ${className}`}
      style={{
        // ALWAYS reserve the control-row height so a carousel with too few
        // slides to paginate (controls hidden) leaves the SAME space as one with
        // controls — no layout shift between tabs/filters. Convention:
        // carousel-control-space-standard.md.
        minHeight: variant === 'minimal' ? 24 : 36,
        ...(hidden ? { visibility: 'hidden', pointerEvents: 'none' } : null),
      }}
      aria-hidden={hidden || undefined}
    >
      <div
        className="relative overflow-hidden"
        style={capped ? { minHeight: 16 } : undefined}
      >
        <div
          className="flex items-center gap-[15px]"
          role="tablist"
          aria-label="Paginación"
        >
          {visibleDots.map((i, visibleIndex) => {
            const active = i === page
            let dotOpacity = active ? 1 : 0.4
            let dotFilter = 'none'
            if (capped) {
              const hasHiddenBefore = windowStart > 0
              const hasHiddenAfter = windowStart + maxDots < pages
              if (!active && visibleIndex === 0 && hasHiddenBefore) {
                dotOpacity = 0.16
                dotFilter = 'blur(0.35px)'
              } else if (!active && visibleIndex === 1 && hasHiddenBefore) {
                dotOpacity = 0.26
              } else if (!active && visibleIndex === maxDots - 2 && hasHiddenAfter) {
                dotOpacity = 0.26
              } else if (!active && visibleIndex === maxDots - 1 && hasHiddenAfter) {
                dotOpacity = 0.16
                dotFilter = 'blur(0.35px)'
              } else if (!active) {
                dotOpacity = 0.4
              }
            }
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Ir a la página ${i + 1}`}
                onClick={() => goToPage(i)}
                className="shrink-0 rounded-full transition-all duration-[var(--duration-base)]"
                style={{
                  width: bar ? (active ? 22 : 6) : active ? 12 : 8,
                  height: bar ? 6 : active ? 12 : 8,
                  opacity: dotOpacity,
                  filter: dotFilter,
                  backgroundColor: active ? C.dotActive : C.dot,
                }}
              />
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-[20px]">
        <NavArrow dir={-1} disabled={page === 0} onClick={() => step(-1)} icon={icon} shape={shape} variant={variant} colors={C} />
        <NavArrow dir={1} disabled={page >= pages - 1} onClick={() => step(1)} icon={icon} shape={shape} variant={variant} colors={C} />
      </div>
    </div>
  )
}

/**
 * CarouselArrowButton — canonical icon-only carousel arrow.
 *
 * Use this anywhere a carousel/slideshow/product-media rail needs prev/next
 * controls but owns its own layout. It keeps the glyph, sizing, disabled state,
 * and hover feel consistent while letting the caller decide placement and color.
 */
export function CarouselArrowButton({
  dir,
  direction,
  side,
  disabled = false,
  onClick,
  label,
  color = 'var(--color-control-arrow, #050505)',
  // `icon` sin valor cae al defecto de la tienda (ver `ArrowIcon` /
  // `setDefaultCarouselArrowIcon`). Antes este botón hardcodeaba la flecha
  // larga, y por eso era el único control de carrusel que no seguía el glifo del
  // tema — el cajón del carrito y el modal de reseña salían con flecha mientras
  // el resto de la tienda ya usaba caret.
  icon,
  iconWidth = 24,
  size = 32,
  className = '',
  style,
  ...rest
}) {
  const isPrev = dir < 0 || direction === 'prev' || direction === 'left' || side === 'left'
  const resolvedLabel = label || (isPrev ? 'Anterior' : 'Siguiente')

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={resolvedLabel}
      className={`inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0 transition-[opacity,transform] duration-[var(--duration-base)] ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current ${
        disabled ? 'pointer-events-none cursor-default opacity-25' : 'cursor-pointer opacity-100 hover:opacity-60'
      } ${className}`}
      style={{
        width: size,
        height: size,
        color,
        ...style,
      }}
      {...rest}
    >
      <ArrowIcon icon={icon} flip={isPrev} width={iconWidth} />
    </button>
  )
}

const SHAPE_CLASS = {
  circle: 'rounded-full',
  pill: 'rounded-pill',
  square: 'rounded-[10px]',
}

function NavArrow({ dir, disabled, onClick, icon, shape, variant, colors }) {
  const isPrev = dir < 0
  // Per-variant chrome. A `solid` button is filled with the accent and the icon
  // is the contrast color (arrowOn); outline/minimal buttons use the accent for
  // border + icon. Default 'outline-solid' = original look (prev outline / next
  // solid) so existing call sites are visually unchanged.
  const filled = variant === 'solid' || (variant === 'outline-solid' && !isPrev)
  const minimal = variant === 'minimal'

  const style = minimal
    ? { backgroundColor: 'transparent', border: 'none', color: colors.arrow }
    : filled
      ? { backgroundColor: colors.arrow, border: `1px solid ${colors.arrow}`, color: colors.arrowOn }
      : { backgroundColor: 'transparent', border: `1px solid ${colors.arrow}`, color: colors.arrow }

  const sizeCls = minimal ? 'size-[24px]' : 'size-[36px]'
  const shapeCls = minimal ? '' : SHAPE_CLASS[shape] ?? SHAPE_CLASS.circle

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? 'Anterior' : 'Siguiente'}
      className={`flex ${sizeCls} items-center justify-center ${shapeCls} transition-opacity duration-[var(--duration-base)] ${
        disabled ? 'opacity-40' : 'opacity-100'
      }`}
      style={style}
    >
      <ArrowIcon icon={icon} flip={isPrev} />
    </button>
  )
}

/**
 * DEFECTO DE GLIFO POR TIENDA
 * ---------------------------------------------------------------------------
 * Un store puede fijar de una vez el glifo de TODAS sus flechas de carrusel, en
 * vez de pasar `icon` en cada punto de llamada. La razón es la arquitectura de
 * islas: cada isla es su propia raíz de React, así que un context provider
 * habría que envolverlo isla por isla — que es exactamente el hilado que se
 * quiere evitar. Todas las islas de una página comparten el MISMO módulo de
 * este chunk, así que un defecto de módulo sí llega a todas.
 *
 * Se llama UNA vez desde el entrypoint del tema:
 *     setDefaultCarouselArrowIcon('caret')
 *
 * El defecto de la casa es el CARET. La flecha larga ('arrow') queda como opción
 * HEREDADA: sigue disponible, pero hay que pedirla expresamente. Un `icon`
 * explícito en el punto de llamada siempre gana sobre el defecto.
 */
/* El CARET es el glifo de la casa (Max, 2026-08-29: «las flechas ya estan
   deprecadas, haz que los carets sean la nueva convencion»). La flecha larga se
   conserva como opcion HEREDADA: una tienda que la quiera la pide expresamente
   con `setDefaultCarouselArrowIcon('arrow')`, pero no la hereda nadie por
   omision. */
let glifoPorDefecto = 'caret'

/** Fija el glifo de flecha de carrusel para toda la tienda: 'arrow' | 'chevron' | 'caret' | función. */
export function setDefaultCarouselArrowIcon(icon) {
  glifoPorDefecto = icon || 'arrow'
}

export function getDefaultCarouselArrowIcon() {
  return glifoPorDefecto
}

/**
 * Resuelve el `icon` a un elemento. Sin `icon`, cae al defecto de la tienda.
 *
 * `width` es OPCIONAL y va por glifo: cada uno tiene su propia proporción, así
 * que un mismo número no da el mismo tamaño óptico. Quien no lo pase se queda
 * con el tamaño canónico de cada glifo, que es lo que ya usaban los controles.
 */
function ArrowIcon({ icon, flip, width }) {
  const cls = flip ? 'rotate-180' : ''
  const resolved = icon ?? glifoPorDefecto
  if (typeof resolved === 'function') return resolved({ width: width ?? 14, className: cls })
  if (resolved === 'chevron') return <CarouselChevronIcon width={width ? Math.round(width / 3) : 8} className={cls} />
  // El caret apunta ABAJO en su path, así que la rotación es otra: -90 para
  // "siguiente" y +90 para "anterior". Con `rotate-180` (lo que usan los otros
  // dos glifos) las dos flechas acabarían apuntándose la una a la otra.
  if (resolved === 'caret') {
    return <CarouselCaretIcon width={width ? Math.round(width * 0.6) : 14} className={flip ? 'rotate-90' : '-rotate-90'} />
  }
  return <CarouselArrowIcon width={width ?? 14} className={cls} />
}

/** Canonical TGB long-arrow icon reused across all carousel controls. */
export function CarouselArrowIcon({ width = 24, className = '' }) {
  const height = Math.round(width * 13 / 24)
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 27 14"
      fill="none"
      aria-hidden="true"
      className={className || undefined}
    >
      <path
        d="M1.5 7h24m0 0s-3.835-.971-5.813-2.143C17.71 3.686 15.375 1 15.375 1M25.5 7s-3.835.971-5.813 2.143C17.71 10.314 15.375 13 15.375 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Phosphor "CaretDown" bold — el caret de la casa. La punta mira ABAJO, así que
 * se orienta rotando: `-rotate-90` = derecha (siguiente), `rotate-90` =
 * izquierda (anterior). Invertirlas deja las dos flechas apuntándose entre sí.
 * Nació en el tema de Para Machos (`CarouselControls.jsx`), verificado contra el
 * sitio publicado; se sube aquí para que haya UN solo path y cualquier tienda
 * pueda adoptarlo con `setDefaultCarouselArrowIcon('caret')`.
 */
export function CarouselCaretIcon({ width = 14, className = '' }) {
  return (
    <svg width={width} height={width} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" className={className || undefined}>
      <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
    </svg>
  )
}

/** Short chevron (the Nalua `< >` controls). Points RIGHT; flip for prev. */
export function CarouselChevronIcon({ width = 8, className = '' }) {
  const height = width * 1.75
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 8 14"
      fill="none"
      aria-hidden="true"
      className={className || undefined}
    >
      <path
        d="M1 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
