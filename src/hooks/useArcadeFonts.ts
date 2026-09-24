import { useEffect } from 'react'

const ARCADE_FONTS_ID = 'arcade-fonts-link'
// Same family list index.html used to combine into the shared SPA-shell stylesheet — Anton +
// Rajdhani, `display=swap` so a font swap never blocks first paint here either.
const ARCADE_FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Anton&family=Rajdhani:wght@400;500;600;700&display=swap'

/**
 * Loads the Persona/Arcade theme's Google Fonts (Anton, Rajdhani) on demand — once, idempotently,
 * only from a screen that actually renders Arcade type (`/arcade` and `/menu`, the two places a
 * visitor sees the real faces rather than the `font-persona-display`/`font-persona-label` fallback
 * stack). Round 45 combined these two families into index.html's own shared Google Fonts link so
 * every route — including `/` and `/luxury`, which never render a single Arcade glyph — paid for a
 * bigger font CSS response on first paint; moving the request here instead keeps it scoped to the
 * two routes that need it and off the SPA shell entirely (measured mobile LCP regression, round 45
 * A/B: reverting just this line closed the gap on both `/` and `/luxury`).
 *
 * `PersonaPreview` thumbnails rendered elsewhere (the other four themes' "explore other designs"
 * grids, and this same preview before its own route has mounted) keep using the fallback until a
 * visit to `/arcade` or `/menu` loads the real fonts — no layout jump, since the fallback stack
 * (`Archivo Black` / `Rajdhani`'s own sans-serif fallback) is already sized for the swap in
 * tailwind.config.js's `persona-display`/`persona-label` entries.
 */
export function useArcadeFonts() {
  useEffect(() => {
    if (document.getElementById(ARCADE_FONTS_ID)) return
    const link = document.createElement('link')
    link.id = ARCADE_FONTS_ID
    link.rel = 'stylesheet'
    link.href = ARCADE_FONTS_HREF
    document.head.appendChild(link)
  }, [])
}
