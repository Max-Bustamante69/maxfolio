import { Children, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { animate, m, useReducedMotion } from 'framer-motion'
import { CarouselArrowButton } from './CarouselNav.jsx'
import { CarouselDotPagination } from './CarouselDotPagination.jsx'

// Drag-throw feel (see useDragScroll). DRAG_PROJECT = seconds of release
// velocity projected to pick the landing slide (bigger = a flick carries
// further). DRAG_FLICK = min px/s for a flick to count as a deliberate
// one-slide advance even with little travel.
const DRAG_PROJECT = 0.12
const DRAG_FLICK = 350
// Mouse-drag smoothing: the track EASES toward the pointer target each frame
// instead of jumping 1:1 (lower = heavier/smoother lag, higher = tighter follow).
const DRAG_FOLLOW = 0.2
const DRAGGING_ROOT_CLASS = 'is-carousel-dragging'
const MOBILE_SNAP_MAX = 767

function setCarouselDraggingRoot(active) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle(DRAGGING_ROOT_CLASS, active)
  document.dispatchEvent(new CustomEvent('digitdeck:carousel-drag', { detail: { active } }))
}

/**
 * Carousel — reusable, content-agnostic horizontal carousel (BEHAVIOR only).
 *
 * Library component: store-agnostic, styled ONLY with design-system tokens.
 * It owns the *mechanics* — scroll-snap, drag-to-scroll, responsive slides-per-view,
 * the configurable "sneak peek" of the next slide, and pagination dots — while WHAT
 * goes inside each slide is whatever you pass as children. A best-sellers carousel,
 * a category carousel, a reviews carousel… all reuse this same behavior.
 *
 *   <Carousel slidesPerView={{ base: 1, md: 2, lg: 4 }} peek={30}>
 *     {items.map((it) => <MyCard key={it.id} {...it} />)}
 *   </Carousel>
 *
 * Props
 * - children        slides (each direct child becomes one snap slide).
 * - slidesPerView   how many WHOLE slides are visible. Number, or a responsive
 *                   object { base, md, lg, xl } (base <768px, md ≥768px,
 *                   lg ≥1024px, xl ≥1200px — xl matches the common Framer
 *                   desktop breakpoint, NOT Tailwind's 1280).
 * - peek            the "sneak peek": how much of the NEXT slide pokes in, as a
 *                   percentage of one slide's width. 0.1–100 (clamped). 0 = no peek.
 *                   Number or responsive object { base, md, lg, xl }.
 *                   ⚠️ Applies ONLY when full edgeBleed frame-fitting is OFF.
 *                   In default edgeBleed="both" mode the REST-ALIGNMENT RULE
 *                   sizes the slides and peek is ignored. One-sided rail bleed
 *                   may still use peek so narrow PDP rails get a real preview.
 * - mobilePeek      MOBILE SNEAK-PEEK (agency default, user-confirmed 2026-07-10):
 *                   in edgeBleed frame-fit mode the desktop peek is the bleed
 *                   gutter, but on mobile (≤767px) a full-frame card shows only
 *                   that gutter sliver — no real "there's more" cue. So the
 *                   frame-fit MOBILE slide is narrowed to reveal this % of the
 *                   next card (default 15). Applies ONLY on mobile, ONLY in
 *                   frame-fit, and ONLY when the resolved base is a WHOLE number —
 *                   a fractional base (e.g. 1.4) already encodes its own peek and
 *                   is left untouched (no double-peek). Set 0 to opt out.
 * - REST-ALIGNMENT RULE (agency-wide, user-confirmed 2026-06): in edgeBleed mode
 *                   exactly `slidesPerView` slides + gaps fill the FRAME width,
 *                   so at EVERY rest point the last fully-visible card's right
 *                   edge sits ON the page margin; the sneak peek is whatever
 *                   shows in the bleed zone beyond it (gutter + centering slack)
 *                   — geometry, not a knob.
 * - renderControls  CUSTOM CONTROLS SLOT — the carousel abstraction: behavior
 *                   (scroll/drag/pagination math) stays in here, the control UI
 *                   varies per design. When provided it REPLACES the built-in
 *                   dots/progress and receives
 *                   ({ page, pages, ratio, goToPage, step }) → ReactNode.
 *                   It follows `controlsOnMobile`: custom controls are desktop-
 *                   only by default, with no hidden row reserving mobile space.
 * - trackClassName  extra classes on the scrolling <ul>.
 * - edgeBleed       AGENCY RULE (default true): carousels do NOT obey the page
 *                   margin. The track is stretched to the physical viewport
 *                   edges so the next card pokes in at the right edge and, once
 *                   scrolling starts, cards slide under the page margin on BOTH
 *                   sides — but slides always REST aligned to the page frame
 *                   (padding-left + scroll-padding-left = measured bleed), and
 *                   the last slide closes aligned (margin-right = bleed).
 *                   Measured in JS from the wrapper, so it works inside any
 *                   centered container. Set false ONLY when the carousel does
 *                   not sit in the page flow (modal, drawer, inside a card).
 * - edgeBleedSides  'both' | 'right' | 'left'. Use 'right' for narrow PDP rails:
 *                   the track breaks the right margin for the sneak peek without
 *                   sliding left across the main media column.
 * - gap             px gap between slides (default 16).
 * - STEP-BY-ONE RULE (agency-wide, user-confirmed 2026-06-11): arrows and
 *                   step() ALWAYS advance exactly ONE slide per click — never a
 *                   viewport/"page". Dots = one per snap position
 *                   (count - cols + 1). Hard-coded on purpose: there is NO
 *                   stepBy/page-mode prop and none must be reintroduced —
 *                   page-stepping reads as "the carousel skipped several cards"
 *                   and kept being re-fixed section by section.
 * - controls        'dots' | 'progress' | 'none' (default 'dots').
 *                   'progress' = the agency convention for rich carousels: dot
 *                   pagination + prev/next arrows in a control row (see
 *                   design-system/layout.md §3). 'dots' = pagination dots only.
 * - controlsOnMobile  AGENCY CONVENTION: mobile is pure drag/swipe with NO
 *                   controls — so controls render md+ only by default (false).
 *                   Set true only when a design explicitly shows mobile controls.
 * - reveal          AGENCY CONVENTION (default true): slides reveal only when
 *                   the carousel content mounts/renders, and replay when the
 *                   slide set changes after filtering/tabs. This is NOT a
 *                   viewport/whileInView reveal; scrolling horizontally or
 *                   vertically must not re-trigger it. Reduced motion disables
 *                   this layer.
 * - dragSpring      optional mouse-drag release tuning for specific carousels.
 *                   Defaults preserve the shared agency feel; use only when a
 *                   section needs a softer release without changing global snap.
 * - touchDrag       opt-in enhanced touch drag. Defaults to false so existing
 *                   carousels retain their native touch scrolling behavior.
 *                   When enabled, horizontal touch drags use the same snap and
 *                   release mechanics as mouse drags while vertical gestures
 *                   remain available to the page.
 * - mobileSnap      'center' (default) | 'start'. Override MOVIL compatible
 *                   hacia atras: el reposo global es centrado en todos los
 *                   anchos; 'start' apunta solo el movil (≤767px) a la linea
 *                   del frame, con la siguiente tarjeta asomando por la derecha.
 * - desktopSnap     'center' (default) | 'start'. Lo mismo para ≥768px.
 *                   'start' apoya el grupo visible EN la linea del frame, para
 *                   que una banda de N tarjetas enteras quede a ras del margen
 *                   de la pagina en vez de centrarse dentro de la pista con
 *                   sangrado — que es lo que deja una astilla de tarjeta
 *                   asomando por AMBOS bordes, el fallo del "se ve raro y no se
 *                   por que".
 *
 *                   REGLA DE CASA (carousel-snap-alignment-standard.md):
 *                   escritorio a la IZQUIERDA, movil CENTRADO. Se aplica pasando
 *                   la prop en cada uso, NO cambiando este default. Se intento
 *                   invertirlo y se descarto con el numero delante: hay 576 usos
 *                   de <Carousel> en la flota y solo UNO pasa desktopSnap, asi
 *                   que mover el default reencuadraria ~575 carruseles de todas
 *                   las tiendas sin que nadie los haya mirado. Una convencion no
 *                   justifica un cambio silencioso de esa talla; la migracion,
 *                   si se hace, va tienda por tienda y con QA.
 * - showDots / showArrows  (legacy) kept for back-compat; prefer `controls`.
 * - className       extra classes on the outer wrapper.
 * - ariaLabel       accessible label for the scroll region.
 */
export function Carousel({
  children,
  slidesPerView = { base: 1, md: 2, lg: 4 },
  peek = 30,
  mobilePeek = 15,
  gap = 16,
  controls,
  controlsOnMobile = false,
  showDots = true,
  showArrows = false,
  renderControls,
  trackClassName = '',
  edgeBleed = true,
  edgeBleedSides = 'both',
  // Enclosed surfaces (drawers, modals, cards) still need the carousel "bleed"
  // feel, but clipped to their own panel instead of the physical viewport. This
  // extends the track under the local padding while keeping controls/content
  // anchored in the panel frame. Use a px number or responsive object.
  containerBleed = 0,
  // fill: when true the track stretches to its parent's height (flex-1) and the
  // slides become full-height, so a fixed-height carousel column can have its
  // slides fill the space. Opt-in — the caller must give an ancestor a definite
  // height (e.g. a fixed-height flex column) or the track collapses. Default off
  // → byte-identical to before for every existing caller.
  fill = false,
  startIndex = 0,
  reveal = true,
  dragSpring = null,
  touchDrag = false,
  mobileSnap = 'center',
  /* Se queda en 'center' a proposito. Ver la nota de desktopSnap arriba: la
     regla de casa es escritorio a la izquierda, pero se aplica por uso, no
     moviendo este default, que arrastraria ~575 carruseles sin QA. */
  desktopSnap = 'center',
  className = '',
  ariaLabel = 'Carrusel',
  // Built-in 'dots' / 'progress' control colors (QA #15 — customizable). Default
  // through the same `--color-control-*` token chain as <CarouselNav>, falling
  // back to the original `--color-brand-primary` look, so a store re-skins every
  // built-in control by defining the tokens once (or per-call via these props).
  dotColor = 'var(--color-control-dot, var(--color-brand-primary))',
  activeDotColor = 'var(--color-control-dot-active, var(--color-brand-primary))',
  arrowColor = 'var(--color-control-arrow, var(--color-brand-primary))',
}) {
  const wrapRef = useRef(null)
  const trackRef = useRef(null)
  const slides = Children.toArray(children)
  const count = slides.length
  const labelId = useId()
  const reducedMotion = useReducedMotion()

  const cols = useResponsive(slidesPerView)
  // Nothing to peek at when every slide already fits — without this a
  // single-slide carousel (e.g. one featured review) still reserved a sliver
  // of "next slide" space via mobilePeek, reading as an unfinished carousel.
  const hasOverflow = count > cols
  const mobileViewport = useViewportMax(MOBILE_SNAP_MAX)
  // Alignment of the ACTIVE breakpoint. This drives the JS side (drag release,
  // arrows/dots targets, scroll-padding); the CSS side is the per-slide
  // snap-start/snap-center classes below, and the two must agree or a drag lands
  // on a line the arrows would never pick.
  const centerSnap = mobileViewport ? mobileSnap !== 'start' : desktopSnap !== 'start'
  const bleed = useEdgeBleed(wrapRef, edgeBleed)
  /* 🔴 `'right'` SANGRA SOLO EN MÓVIL, igual que su `frameFit` de más abajo. Era la
     mitad que faltaba de aquel arreglo: se condicionó el encaje al marco pero NO el
     sangrado en sí, y `bleed.right` es la distancia del riel al borde de la VENTANA. En
     un riel de columna estrecha —que es para lo que existe este modo, según su propia
     documentación— esa distancia en escritorio es enorme, así que la pista se estiraba
     hasta el filo de la pantalla y la tarjeta se salía de su columna.
     Medido en la PDP de TierraMont: la sección mide 393 px y la tarjeta 554 (sobran 161)
     a 1440, y 525 contra 740 (sobran 215) a 1920. En móvil sobraban −62, o sea que ahí
     nunca hubo desbordamiento y el asomo de la tríada seguía correcto.
     `'both'` no se toca: es lo que usan los ~576 carruseles de secciones a todo ancho,
     donde `bleed.right` vale el margen de página y sangrar es justo lo que se quiere. */
  const sangraDerecha = edgeBleedSides !== 'left' && (edgeBleedSides !== 'right' || mobileViewport)
  const bleedLeft = edgeBleedSides === 'right' ? 0 : bleed.left
  const bleedRight = sangraDerecha ? bleed.right : 0
  const containerBleedValue = Math.max(0, useResponsive(containerBleed, 0))
  const localBleedLeft = edgeBleed ? 0 : edgeBleedSides === 'right' ? 0 : containerBleedValue
  const localBleedRight = edgeBleed ? 0 : sangraDerecha ? containerBleedValue : 0
  const closingInset = bleedRight || localBleedRight

  // Effective columns include the sneak peek so slides get narrower and the next
  // one is partially revealed. peek is a % of ONE slide → /100 of a column.
  // (Non-bleed mode only — see REST-ALIGNMENT RULE.)
  const peekValue = useResponsive(peek, 0)
  const peekFrac = hasOverflow ? Math.min(100, Math.max(0, peekValue)) / 100 : 0
  const effCols = cols + peekFrac

  // REST-ALIGNMENT RULE: in edgeBleed mode the slide width derives from the
  // FRAME (wrapper) width — `cols` slides + gaps = frame exactly, so the last
  // fully-visible card rests ON the page margin and the peek lives in the
  // bleed zone. Do not shrink frame-fitted slides by `peek`; that makes a
  // four-up carousel show five-ish cards inside the content frame.
  /* 🔴 En MÓVIL, `'right'` TAMBIÉN encaja al marco (2026-09-05). `'right'` existe para
     los rieles de columna estrecha de la PDP, y en móvil esa columna ocupa el ancho
     completo: su borde izquierdo YA es el de la pantalla, así que no hay nada que
     sangrar por ahí. Negarle el encaje dejaba la tarjeta al 100 % del riel —medido en
     TierraMont: asomo 1,00— y con ello sin el ASOMO de la tríada de móvil
     (`horizontal-rail-carousel-standard`). En escritorio no cambia nada:
     `mobileViewport` es falso y sigue exigiéndose 'both', que es lo que protege la
     geometría de reposo de los ~576 carruseles de la flota. */
  const frameFit =
    edgeBleed &&
    (edgeBleedSides === 'both' || (edgeBleedSides === 'right' && mobileViewport)) &&
    bleed.width > 0

  // MOBILE SNEAK-PEEK (frame-fit only): a whole-number `cols` fills the frame
  // edge-to-edge, so on mobile only the gutter sliver of the next card shows —
  // no "there's more" affordance. Narrow the mobile frame-fit slide so
  // ~`mobilePeek`% of the next card peeks in. Skipped for a fractional base,
  // which already carries a caller-defined peek (adding more would double it),
  // and gated on `mobileViewport` so the desktop REST-ALIGNMENT geometry is
  // untouched whatever `desktopSnap` says.
  const mobilePeekValue = useResponsive(mobilePeek, 0)
  const mobilePeekFrac =
    frameFit && mobileViewport && hasOverflow && Number.isInteger(cols)
      ? Math.min(100, Math.max(0, mobilePeekValue)) / 100
      : 0
  const frameCols = cols + mobilePeekFrac

  const basis = frameFit
    ? `${Math.round(((bleed.width - gap * (frameCols - 1)) / frameCols) * 100) / 100}px`
    : `calc((100% - ${gap}px * ${effCols - 1}) / ${effCols})`

  // STEP-BY-ONE RULE: every snap position is a "page" (count - cols + 1), so
  // arrows/dots move ONE slide at a time. Never compute ceil(count/cols) here —
  // that's viewport-stepping, which skips cards (see docblock).
  const indexedCols = Math.max(1, Math.floor(cols))
  const pages = Math.max(1, count - indexedCols + 1)
  // A centered multi-column viewport needs a stable page↔slide mapping. The
  // first/last pages pin to the physical ends; intermediate pages center the
  // middle card in their visible window. Without this offset, the first two or
  // three cards can all clamp to scrollLeft=0 on desktop, producing a dead
  // first arrow and duplicate page indices.
  const centerPageOffset = Math.floor((indexedCols - 1) / 2)
  // Start the active page at startIndex so controls are in sync when the
  // carousel opens pre-scrolled (e.g. a lightbox opening on a chosen slide);
  // the initial programmatic scroll's event can land before the scroll listener
  // attaches, so we can't rely on onScroll to seed it.
  const [page, setPage] = useState(() => Math.max(0, startIndex))
  const [ratio, setRatio] = useState(0) // continuous 0..1, available to custom controls

  // Resolve the control style: explicit `controls` wins; else legacy props.
  // HOUSE RULE (#69): a track that cannot scroll shows NO controls — no arrows,
  // no dots — whatever the caller asked for. Three cards in a four-up carousel
  // is not a carousel, and a pager that pages nothing is worse than absent: the
  // shopper clicks it, nothing moves, and they conclude the page is broken.
  // `hasOverflow` is the same count>cols test the peek and frame-fit maths use,
  // so the affordance and the geometry can never disagree.
  const askedForControls = controls
    ? controls !== 'none'
    : Boolean(showDots || showArrows)
  const controlStyle = !hasOverflow
    ? 'none'
    : controls ?? (showDots ? 'dots' : showArrows ? 'progress' : 'none')
  // CONTROL-SPACE STANDARD: #69 removes the affordance, not the SPACE. When the caller asked
  // for controls and this particular slide set has nothing to paginate, the row still occupies
  // its height — hidden, inert, out of the a11y tree. Otherwise a filterable carousel jumps
  // every time the shopper picks a tab whose set happens to fit: measured on the EAMD home,
  // the section went 864 → 817 → 864 → 793 px across five tabs, and everything below it moved
  // with it. The empty row is cheap; the jump is the thing people notice.
  const reserveControlRow = askedForControls && controlStyle === 'none'
  const mobileVis = controlsOnMobile ? 'flex' : 'hidden md:flex'
  const revealSlides = reveal && !reducedMotion
  const revealSignature = useMemo(
    () => slides.map((child, i) => getChildKey(child, i)).join('|'),
    [slides],
  )

  // One slide's stride in scroll px (slide width + gap), measured from the DOM
  // so peek/edge-bleed/gap are all accounted for.
  const getStride = () => {
    const el = trackRef.current
    if (!el || el.children.length < 2) return 0
    return el.children[1].offsetLeft - el.children[0].offsetLeft
  }

  const getSnapTarget = useCallback(
    (i) => {
      const el = trackRef.current
      if (!el) return 0
      return getSlideSnapTarget(el, i, { center: centerSnap })
    },
    [centerSnap],
  )

  // Track the active dot + continuous ratio from scroll position.
  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const r = max > 0 ? el.scrollLeft / max : 0
    setRatio(r)
    const stride = getStride()
    // END-OF-SCROLL PIN (fixes the "last dot never activates" bug): in
    // edge-bleed/frame-fit mode the final slide carries margin-right = bleed and
    // frame-fitted widths, so the real scroll maximum (scrollWidth - clientWidth)
    // is SHORTER than stride * (pages - 1). Trusting round(scrollLeft / stride)
    // therefore tops out one (or more) pages early — the dot indicator forever
    // claims "there's more". So when we're within ~2px of the actual end (sub-
    // pixel rounding + fractional device pixels), force the LAST page. Likewise
    // pin the first page at the very start. Only the in-between positions use the
    // stride estimate. EPS is a couple of CSS px so a fully-snapped end always
    // counts as "end" without false-positiving mid-scroll.
    const EPS = 2
    let p
    if (max <= 0) p = 0
    else if (el.scrollLeft >= max - EPS) p = pages - 1
    else if (el.scrollLeft <= EPS) p = 0
    else if (centerSnap) p = getNearestSnapIndex(el, el.scrollLeft, { center: true }) - centerPageOffset
    else p = stride > 0 ? Math.round(el.scrollLeft / stride) : 0
    setPage(Math.min(pages - 1, Math.max(0, p)))
  }, [centerPageOffset, centerSnap, pages])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  // Initial position: jump (no animation) to `startIndex` once on mount — e.g.
  // a lightbox carousel that opens on the slide the user clicked. Retries via
  // rAF until the stride is measurable (slides laid out). Remount the Carousel
  // (key) to re-apply on a fresh open.
  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el || startIndex <= 0) return
    let raf
    const jump = () => {
      if (!el.children.length) return
      const target = getSnapTarget(Math.max(0, Math.min(startIndex, el.children.length - 1)))
      if (el.children.length > 1 || target === 0) el.scrollLeft = target
      else raf = requestAnimationFrame(jump)
    }
    jump()
    return () => raf && cancelAnimationFrame(raf)
    // mount-only: startIndex is an initial position, not a controlled prop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // One snap position per page → goToPage(page ± 1) scrolls exactly ONE stride.
  const goToPage = useCallback((p) => {
    const el = trackRef.current
    if (!el) return
    const boundedPage = Math.min(pages - 1, Math.max(0, p))
    const max = Math.max(0, el.scrollWidth - el.clientWidth)
    const target = centerSnap
      ? boundedPage === 0
        ? 0
        : boundedPage === pages - 1
          ? max
          : getSnapTarget(boundedPage + centerPageOffset)
      : getSnapTarget(boundedPage)
    const from = el.scrollLeft
    el.scrollTo({ left: target, behavior: 'smooth' })
    if (Math.abs(target - from) < 1) return
    // Some environments silently drop SMOOTH programmatic scrolls (WebViews,
    // chrome --disable-smooth-scrolling). If nothing moved shortly after the
    // call, jump instantly — dead arrows are worse than an unanimated step.
    setTimeout(() => {
      if (Math.abs(el.scrollLeft - from) < 1) el.scrollTo({ left: target })
    }, 150)
  }, [centerPageOffset, centerSnap, getSnapTarget, pages])

  const step = useCallback(
    (dir) => goToPage(Math.min(pages - 1, Math.max(0, page + dir))),
    [goToPage, page, pages],
  )

  const drag = useDragScroll(trackRef, { centerSnap, dragSpring, touchDrag })

  if (count === 0) return null

  return (
    <div
      ref={wrapRef}
      className={`flex w-full flex-col gap-[15px] ${className}`}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      data-carousel-edge-bleed-sides={edgeBleed ? edgeBleedSides : 'none'}
    >
      <div className={`relative${fill ? ' min-h-0 flex-1' : ''}`}>
        {!renderControls && controlStyle === 'dots' && showArrows && pages > 1 && (
          <Arrow side="left" disabled={page === 0} onClick={() => step(-1)} />
        )}

        <ul
          ref={trackRef}
          id={labelId}
          className={`no-scrollbar flex list-none snap-x snap-mandatory overflow-x-auto p-0${fill ? ' h-full' : ''} ${trackClassName}`}
          style={{
            gap: `${gap}px`,
            scrollbarWidth: 'none',
            // Enhanced touch drag is opt-in. Preserve native touch scrolling
            // everywhere else, while allowing vertical page scrolling here.
            ...(touchDrag ? { touchAction: 'pan-y' } : {}),
            // Edge-bleed: track spans the full viewport; padding restores the
            // resting alignment, scroll-padding keeps the SNAP on that line.
            ...(bleedLeft || bleedRight
              ? {
                  marginLeft: -bleedLeft,
                  marginRight: -bleedRight,
                  paddingLeft: bleedLeft,
                  scrollPaddingLeft: centerSnap ? 0 : bleedLeft,
                }
              : {}),
            ...(localBleedLeft || localBleedRight
              ? {
                  marginLeft: -localBleedLeft,
                  marginRight: -localBleedRight,
                  paddingLeft: localBleedLeft,
                  scrollPaddingLeft: centerSnap ? 0 : localBleedLeft,
                }
              : {}),
          }}
          {...drag.handlers}
          tabIndex={0}
          aria-label={ariaLabel}
        >
          {slides.map((child, i) => {
            const slideKey = getChildKey(child, i)
            return (
              <li
                key={reveal ? `${revealSignature}::${slideKey}` : slideKey}
                data-carousel-slide
                // EQUAL-HEIGHT CONVENTION (digitdeck-shopify/STANDARDS-INDEX §
                // Global band rules): li + inner wrapper are flex containers so
                // every card stretches to the tallest slide via the default
                // align-items:stretch — a child's `h-full` alone can't resolve
                // (% height needs a definite parent height, which a plain li
                // never has). `[&>*]:w-full` keeps the single child at full
                // slide width (flex items otherwise shrink-wrap horizontally).
                className={`flex shrink-0 ${mobileSnap === 'start' ? 'snap-start' : 'snap-center'} ${desktopSnap === 'start' ? 'md:snap-start' : 'md:snap-center'} [&>*]:w-full`}
                style={{
                  flex: `0 0 ${basis}`,
                  maxWidth: basis,
                  // Closing alignment: only the LAST slide recovers the right
                  // inset, so intermediate cards run to the physical edge.
                  // The inset must be part of the slide's scrollable box:
                  // iOS Safari can omit a last flex item's trailing margin from
                  // scrollWidth, leaving the final card flush with the viewport.
                  ...(i === count - 1 && closingInset
                    ? { boxSizing: 'content-box', paddingRight: closingInset }
                    : {}),
                }}
              >
                <m.div
                  className={`flex [&>*]:w-full${fill ? ' h-full' : ''}`}
                  initial={revealSlides ? { opacity: 0, y: 12 } : false}
                  animate={revealSlides ? { opacity: 1, y: 0 } : undefined}
                  transition={
                    revealSlides
                      ? {
                          duration: 0.4,
                          ease: [0, 0, 0.2, 1],
                          delay: Math.min(i, 8) * 0.045,
                        }
                      : undefined
                  }
                  // No manual `will-change` here: Motion adds/removes it only for
                  // the duration of the reveal animation. A static
                  // `will-change: opacity, transform` on every slide left dozens of
                  // GPU layers promoted permanently (measured ~50 on a content page),
                  // which raised compositing cost on every scroll frame long after
                  // the one-time reveal finished. See carousel-control-space-standard.md.
                  style={{
                    // A slide wrapper is itself a flex item. Relying only on
                    // the generated `[&>*]:w-full` utility can leave this
                    // wrapper at its min-content width in consumers that use
                    // natural-height cards. Keep the behavioral slide box
                    // explicitly full-width so cards never collapse around
                    // their thumbnail/content minimum.
                    width: '100%',
                    flexShrink: 0,
                    height: fill ? '100%' : undefined,
                  }}
                >
                  {child}
                </m.div>
              </li>
            )
          })}
        </ul>

        {!renderControls && controlStyle === 'dots' && showArrows && pages > 1 && (
          <Arrow side="right" disabled={page >= pages - 1} onClick={() => step(1)} />
        )}
      </div>

      {/* Los controles a medida obedecen la misma regla (#69). */}
      {hasOverflow && renderControls &&
        (controlsOnMobile ? (
          renderControls({ page, pages, ratio, goToPage, step })
        ) : (
          <div className="hidden md:contents" data-carousel-controls-visibility="desktop">
            {renderControls({ page, pages, ratio, goToPage, step })}
          </div>
        ))}

      {!renderControls && controlStyle === 'dots' && pages > 1 && (
        <CarouselDotPagination
          count={pages}
          activeIndex={page}
          onSelect={goToPage}
          activeColor={activeDotColor}
          color={dotColor}
          className={mobileVis}
        />
      )}

      {!renderControls && controlStyle === 'progress' && pages > 1 && (
        <div className={`${mobileVis} items-center justify-between gap-lg`} aria-hidden="false">
          <CarouselDotPagination
            count={pages}
            activeIndex={page}
            onSelect={goToPage}
            activeColor={activeDotColor}
            color={dotColor}
          />
          <div className="flex items-center gap-xs">
            <ControlArrow dir={-1} disabled={page === 0} onClick={() => step(-1)} color={arrowColor} />
            <ControlArrow dir={1} disabled={page >= pages - 1} onClick={() => step(1)} color={arrowColor} />
          </div>
        </div>
      )}

      {/* La fila RESERVADA: misma altura que la real (32px, el alto del botón de flecha), sin
          nada dentro. `visibility: hidden` y no `display: none`, porque lo que hace falta es
          justo el espacio; y `aria-hidden` + `inert` para que un lector de pantalla no anuncie
          una fila de controles que no existe. */}
      {reserveControlRow && (
        <div
          className={mobileVis}
          style={{ minHeight: 32, visibility: 'hidden' }}
          aria-hidden="true"
          data-carousel-controls-reserved="true"
        />
      )}
    </div>
  )
}

function getChildKey(child, index) {
  return child && typeof child === 'object' && child.key != null ? child.key : index
}

/** Inline arrow for the progress control row (not the overlay variant). */
function ControlArrow({ dir, onClick, disabled, color }) {
  return (
    <CarouselArrowButton
      dir={dir}
      onClick={onClick}
      disabled={disabled}
      label={dir < 0 ? 'Anterior' : 'Siguiente'}
      color={color}
      size={32}
      iconWidth={24}
    />
  )
}

/**
 * AGENCY RULE — carousels ignore the page margin (edge-bleed).
 * Measures the distance from the wrapper (which sits ON the page frame) to the
 * physical viewport edges. The track then cancels it with negative margins and
 * restores it as padding-left/scroll-padding-left, so cards bleed edge-to-edge
 * while scrolling but always rest aligned to the frame. Measuring in JS (vs the
 * `calc((100vw-100%)/2)` CSS trick) sidesteps scroll-padding's %-of-scrollport
 * resolution and works in ANY centered container, with no hardcoded frame values.
 * The wrapper itself is never mutated, so there is no measure→apply feedback loop.
 */
function useEdgeBleed(ref, enabled) {
  const [bleed, setBleed] = useState({ left: 0, right: 0, width: 0 })

  useLayoutEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      const styles = window.getComputedStyle(el)
      const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0
      const paddingRight = Number.parseFloat(styles.paddingRight) || 0
      const contentLeft = rect.left + paddingLeft
      const contentRight = rect.right - paddingRight
      // clientWidth excludes the scrollbar (100vw does not — the usual flaw).
      const vw = document.documentElement.clientWidth
      // SAFETY CLAMP: the wrapper measures its own live rect, which can
      // transiently report a runaway value during hydration (fonts/images
      // still loading, or a parent flex/grid item without a definite width
      // yet) — that bad reading gets written to state, re-triggers this same
      // ResizeObserver, and feeds an even bigger number back in, spiraling
      // into a multi-million-px carousel (observed on the Nalua PDP gallery).
      // A wrapper in normal page flow can never legitimately be wider than
      // the viewport, so clamp every measurement to `vw` — this can only
      // correct an impossible reading, never affect a real one.
      setBleed({
        left: Math.max(0, Math.min(Math.round(contentLeft), vw)),
        right: Math.max(0, Math.min(Math.round(vw - contentRight), vw)),
        // Frame content width — drives the REST-ALIGNMENT slide sizing. The
        // Carousel wrapper is often the `.frame` utility itself, whose rect
        // includes the gutters; sizing from the border box makes 4-up carousels
        // behave like 4-up across the viewport. The rest line is the content
        // edge, so measure that box instead.
        width: Math.max(0, Math.min(contentRight - contentLeft, vw)),
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [ref, enabled])

  return enabled ? bleed : { left: 0, right: 0, width: 0 }
}

/** Resolve a responsive value (number | {base,md,lg,xl}) against the viewport width. */
function useResponsive(value, min = 1) {
  const resolve = useCallback(() => {
    if (typeof value === 'number') return value
    const { base = min, md, lg, xl } = value || {}
    if (typeof window === 'undefined') return xl ?? lg ?? md ?? base
    const w = window.innerWidth
    if (w >= 1200 && xl != null) return xl
    if (w >= 1024 && lg != null) return lg
    if (w >= 768 && md != null) return md
    return base
  }, [value, min])

  const [resolved, setResolved] = useState(resolve)
  useEffect(() => {
    const onResize = () => setResolved(resolve())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [resolve])
  return Math.max(min, resolved)
}

function useViewportMax(maxWidth) {
  const resolve = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= maxWidth
  }, [maxWidth])

  const [matches, setMatches] = useState(resolve)
  useEffect(() => {
    const onResize = () => setMatches(resolve())
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [resolve])
  return matches
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getSlideSnapTarget(el, index, { center = false } = {}) {
  const max = Math.max(0, el.scrollWidth - el.clientWidth)
  const count = el.children.length
  if (!count) return 0
  const i = clamp(Math.round(index), 0, count - 1)
  const slide = el.children[i]
  if (!slide) return 0

  if (center) {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2
    return clamp(slideCenter - el.clientWidth / 2, 0, max)
  }

  const stride = count > 1 ? el.children[1].offsetLeft - el.children[0].offsetLeft : 0
  const target = stride > 0 ? stride * i : slide.offsetLeft
  return clamp(target, 0, max)
}

function getNearestSnapIndex(el, scrollLeft, { center = false } = {}) {
  const count = el.children.length
  if (!count) return 0
  let best = 0
  let bestDistance = Number.POSITIVE_INFINITY
  for (let i = 0; i < count; i += 1) {
    const target = getSlideSnapTarget(el, i, { center })
    const distance = Math.abs(target - scrollLeft)
    if (distance < bestDistance) {
      best = i
      bestDistance = distance
    }
  }
  return best
}

/** Pointer drag-to-scroll for mouse users and explicit touch-drag callers.
 *  Touch stays native by default; a caller opts in only when it needs the
 *  same horizontal drag/release behavior on a touch surface.
 *  A naive drag (raw scrollLeft writes) feels awful for three reasons, and this
 *  fixes all three:
 *   1. CSS `snap-mandatory` FIGHTS a JS-driven scrollLeft — the browser keeps
 *      yanking the track to a snap line mid-drag (the jitter). So scroll-snap is
 *      switched OFF for the duration of the drag + throw, and back on only once
 *      we've landed exactly on a slide (a no-op snap, so no jump).
 *   2. The release glides with ONE velocity-seeded Framer Motion spring. We pick
 *      the slide to land on (small momentum projection, snapped to a slide) and
 *      animate to it; the release velocity is handed to the spring so the throw
 *      flows out of the drag and the spring is overdamped (no overshoot), so the
 *      motion is a single smooth deceleration — never a chopped, hard snap.
 *      (NOT `inertia` + `modifyTarget`: its default landing spring is stiff and
 *      reads as an aggressive snap that cuts the glide.)
 *   3. No `grab`/`grabbing` cursor — the pointer stays the normal arrow; links
 *      and buttons inside slides keep their own pointer cursor.
 *  Pointer capture stops child links stealing events mid-drag; native HTML5
 *  image/anchor ghost-drag is suppressed (another classic source of jank). */
function normalizeDragSpring(config = {}) {
  const cfg = config || {}
  return {
    stiffness: Number.isFinite(cfg.stiffness) ? cfg.stiffness : 60,
    damping: Number.isFinite(cfg.damping) ? cfg.damping : 17,
    mass: Number.isFinite(cfg.mass) ? cfg.mass : 1,
    restDelta: Number.isFinite(cfg.restDelta) ? cfg.restDelta : 0.4,
    restSpeed: Number.isFinite(cfg.restSpeed) ? cfg.restSpeed : 10,
    velocityScale: Number.isFinite(cfg.velocityScale) ? clamp(cfg.velocityScale, 0.15, 1.25) : 1,
  }
}

export function useDragScroll(ref, { centerSnap = false, dragSpring = null, touchDrag = false } = {}) {
  const state = useRef({
    down: false,
    moved: false,
    pointerId: null,
    pointerType: null,
    startX: 0,
    startY: 0,
    startLeft: 0,
  })
  const vel = useRef({ x: 0, lastX: 0, lastT: 0 })
  const anim = useRef(null)
  const followTarget = useRef(0)
  const followRaf = useRef(0)

  // While the pointer is down, ease scrollLeft toward the pointer target each
  // frame (a weighted, smooth follow) instead of writing scrollLeft 1:1.
  const runFollow = () => {
    if (followRaf.current) return
    const tick = () => {
      const el = ref.current
      if (!el || !state.current.down) { followRaf.current = 0; return }
      const cur = el.scrollLeft
      const diff = followTarget.current - cur
      el.scrollLeft = Math.abs(diff) < 0.5 ? followTarget.current : cur + diff * DRAG_FOLLOW
      followRaf.current = requestAnimationFrame(tick)
    }
    followRaf.current = requestAnimationFrame(tick)
  }
  const stopFollow = () => {
    if (followRaf.current) { cancelAnimationFrame(followRaf.current); followRaf.current = 0 }
  }

  // Stop any in-flight throw if the carousel unmounts mid-animation.
  useEffect(() => () => {
    anim.current?.stop()
    stopFollow()
    setCarouselDraggingRoot(false)
  }, [])

  // One slide's stride (slide width + gap), measured from the live DOM.
  const stride = () => {
    const el = ref.current
    if (!el || el.children.length < 2) return 0
    return el.children[1].offsetLeft - el.children[0].offsetLeft
  }

  const onPointerDown = (e) => {
    const acceptsPointer = e.pointerType === 'mouse' || (touchDrag && e.pointerType === 'touch')
    if (!acceptsPointer) return
    const el = ref.current
    if (!el) return
    anim.current?.stop()
    setCarouselDraggingRoot(false)
    vel.current = { x: 0, lastX: e.clientX, lastT: e.timeStamp }
    followTarget.current = el.scrollLeft
    state.current = {
      down: true,
      moved: false,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: el.scrollLeft,
    }
  }
  const onPointerMove = (e) => {
    const s = state.current
    if (!s.down || e.pointerId !== s.pointerId) return
    const el = ref.current
    if (!el) return
    const dx = e.clientX - s.startX
    const dy = e.clientY - s.startY
    // On touch, let a vertical gesture stay entirely with page scrolling.
    // Do this before pointer capture or snap suspension so it leaves no drag
    // state to restore and never swallows a following tap/click.
    if (s.pointerType === 'touch' && !s.moved && Math.abs(dy) > 3 && Math.abs(dy) > Math.abs(dx)) {
      state.current = { ...s, down: false }
      return
    }
    if (Math.abs(dx) > 3) {
      if (!s.moved) {
        // First real drag movement — lock the pointer to this element and free
        // scroll-snap so raw scrollLeft writes don't fight the snap engine.
        // Delaying capture until here (not onPointerDown) is critical: if we
        // capture on every pointerdown, some browsers dispatch the subsequent
        // click on the capture element (<ul>) instead of the original target
        // (<a>), silently breaking child-link navigation.
        el.setPointerCapture(e.pointerId)
        el.style.scrollSnapType = 'none'
        el.style.userSelect = 'none'
        setCarouselDraggingRoot(true)
        runFollow() // ease the track toward the pointer (smooth, not 1:1)
      }
      s.moved = true
    }
    if (s.moved && s.pointerType === 'touch') e.preventDefault()
    // Track the pointer TARGET; the rAF follow eases scrollLeft toward it.
    followTarget.current = s.startLeft - dx
    // Velocity in px/ms, positive = scrollLeft increasing (toward next slides).
    const dt = e.timeStamp - vel.current.lastT
    if (dt > 0) vel.current.x = (vel.current.lastX - e.clientX) / dt
    vel.current.lastX = e.clientX
    vel.current.lastT = e.timeStamp
  }
  const end = () => {
    const s = state.current
    if (!s.down) return
    s.down = false
    const el = ref.current
    if (!el) return
    el.style.userSelect = ''
    // Plain click (no drag) — snap was never disabled, nothing to restore.
    if (!s.moved) {
      setCarouselDraggingRoot(false)
      return
    }
    stopFollow() // hand off from the follow loop to the release spring
    const st = stride()
    const max = Math.max(0, el.scrollWidth - el.clientWidth)
    const from = el.scrollLeft
    const spring = normalizeDragSpring(dragSpring)
    const v = vel.current.x * 1000 * spring.velocityScale // release velocity, px/s (+ = toward next)

    // Choose the slide to land on: project a little momentum, snap to the
    // nearest slide, and let a decisive flick always carry at least one slide.
    let target = from
    if (st > 0 || centerSnap) {
      const restIndex = getNearestSnapIndex(el, from, { center: centerSnap })
      let targetIndex = getNearestSnapIndex(el, from + v * DRAG_PROJECT, { center: centerSnap })
      if (targetIndex === restIndex) {
        targetIndex += v > DRAG_FLICK ? 1 : v < -DRAG_FLICK ? -1 : 0
      }
      target = getSlideSnapTarget(el, targetIndex, { center: centerSnap })
      target = Math.max(0, Math.min(max, target))
    }

    // ONE velocity-seeded spring glides there. Handing the spring the release
    // velocity makes the throw flow straight out of the drag; the spring is
    // overdamped (damping ratio >1) so it eases to rest with NO overshoot and
    // NO abrupt snap — the whole motion is a single smooth deceleration.
    anim.current = animate(from, target, {
      type: 'spring',
      velocity: v,
      stiffness: spring.stiffness,
      damping: spring.damping,
      mass: spring.mass,
      restDelta: spring.restDelta,
      restSpeed: spring.restSpeed,
      onUpdate: (val) => {
        el.scrollLeft = val
      },
      onComplete: () => {
        el.style.scrollSnapType = '' // landed on a slide → snap is a no-op
        setCarouselDraggingRoot(false)
        anim.current = null
      },
    })
  }
  // Swallow the click that follows a drag so slides don't navigate mid-swipe.
  const onClickCapture = (e) => {
    if (state.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      state.current.moved = false
    }
  }

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onPointerLeave: end,
      onClickCapture,
      onDragStart: (e) => e.preventDefault(), // kill native image/link ghost-drag
    },
  }
}

function Arrow({ side, onClick, disabled }) {
  const isLeft = side === 'left'
  const color = 'var(--color-control-arrow, var(--color-brand-primary))'
  return (
    <CarouselArrowButton
      dir={isLeft ? -1 : 1}
      onClick={onClick}
      disabled={disabled}
      label={isLeft ? 'Anterior' : 'Siguiente'}
      color={color}
      size={34}
      iconWidth={24}
      className={`absolute top-1/2 z-10 hidden -translate-y-1/2 md:inline-flex ${
        isLeft ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
      } ${disabled ? 'opacity-0' : ''}`}
    />
  )
}
