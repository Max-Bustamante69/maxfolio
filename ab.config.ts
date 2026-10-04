/**
 * Los temas de maxfolio.dev y el reparto de tráfico entre ellos, compartido por el middleware de Vercel (asignación)
 * y el cliente (selector de temas y atribución).
 *
 * Cada tema es una experiencia completa bajo su prefijo (`/plato`, `/digitdeck`, `/ingenieria`). Un visitante nuevo de `/` recibe uno
 * al azar con la MISMA probabilidad (pedido de Max, 2026-10-03: «servir todos con la misma frecuencia para ver con
 * cuál se interactúa más») y la cookie lo fija 90 días; elegir otro tema en el selector reescribe la cookie. Los
 * rastreadores y las auditorías reciben siempre el tema por defecto (Plató). La atribución sale sola: cada visita
 * vive bajo el prefijo de su tema (Vercel Web Analytics por ruta) y los eventos propios llevan `theme`.
 */
// Max (2026-10-04): de los ocho quedan tres, elegidos con crítica a ciegas + Lighthouse. La medición proponía Maison en lugar
// de Plató; Max eligió mantener Plató, y como predeterminado. Los retirados redirigen a la misma vista en Plató (vercel.json).
export const THEMES = ['plato', 'digitdeck', 'ingenieria'] as const
export type ThemeId = (typeof THEMES)[number]
/** El tema por defecto (Max, 2026-10-03): el que ven los rastreadores, Lighthouse y quien llega sin cookie a un enlace roto. */
export const DEFAULT_THEME: ThemeId = 'plato'

export const AB = {
  cookie: 'mf_v',
  /** 90 días: un visitante que vuelve cae en la misma experiencia. */
  maxAge: 60 * 60 * 24 * 90,
}

export const isTheme = (v: unknown): v is ThemeId => typeof v === 'string' && (THEMES as readonly string[]).includes(v)

/** Rastreadores, previsualizaciones de enlaces y auditorías: siempre el tema por defecto, nunca entran al sorteo. */
export const BOT = /bot|crawl|spider|slurp|lighthouse|pagespeed|chrome-lighthouse|headless|preview|facebookexternalhit|whatsapp|telegram|discord|linkedin|twitter|pinterest|vercel-screenshot/i

/**
 * El tema de una visita a `/` (lo usan el middleware y, si este no corrió, el cliente): `?v=` manda, luego un bot va al
 * tema por defecto, luego la cookie, y si no hay nada, sorteo uniforme. `fijar` dice si hay que (re)escribir la cookie.
 */
export function asignar(ua: string, forzado: string | null, fijado: string | undefined, azar: number) {
  const bot = BOT.test(ua)
  if (isTheme(forzado)) return { id: forzado, fijar: !bot && forzado !== fijado }
  if (bot) return { id: DEFAULT_THEME, fijar: false }
  if (isTheme(fijado)) return { id: fijado, fijar: false }
  return { id: THEMES[Math.floor(azar * THEMES.length) % THEMES.length], fijar: true }
}
