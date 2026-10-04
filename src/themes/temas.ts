import { useLocation, useNavigate } from 'react-router-dom'
import { AB, THEMES, DEFAULT_THEME, isTheme, type ThemeId } from '../../ab.config'
import { useLanguage, type Locale } from '../context/LanguageContext'
import { track } from '../lib/track'

// Contrato del selector de temas: cada tema dibuja su propio selector con su lenguaje, pero todos leen la misma lista
// y cambian de tema con la misma función, así que el cambio conserva la vista y queda medido igual en los ocho.

/** Nombre y lema PÚBLICOS de cada tema (los `meta.ts` son notas internas de diseño, no copy para visitantes). */
const PUBLICO: Record<ThemeId, { nombre: Record<Locale, string>; lema: Record<Locale, string> }> = {
  plato: {
    nombre: { es: 'Plató', en: 'Soundstage', ja: 'スタジオ' },
    lema: { es: 'Un plató de cine: cada tienda es un set con su luz.', en: 'A film set: every store is a lit stage.', ja: '映画のセット。ストアごとに照明が当たる。' },
  },
  digitdeck: {
    nombre: { es: 'Digitdeck', en: 'Digitdeck', ja: 'Digitdeck' },
    lema: { es: 'Tinta negra y un verde eléctrico, a la manera de Digitdeck.', en: 'Black ink and electric green, the Digitdeck way.', ja: '黒とエレクトリックグリーン、Digitdeck流。' },
  },
  ingenieria: {
    nombre: { es: 'Ingeniería', en: 'Engineering', ja: 'エンジニアリング' },
    lema: { es: 'Una página de producto de ingeniería, con su ficha técnica.', en: 'An engineering product page, with its spec sheet.', ja: '仕様書付きのエンジニアリング製品ページ。' },
  },
}

export interface Tema {
  id: ThemeId
  nombre: string
  lema: string
  /** Primer pliegue del tema a 1440 (720×450) y a 390 (390×844), en WebP: public/themes/<id>.webp y <id>-m.webp. */
  preview: string
  previewMovil: string
  href: string
}

export { DEFAULT_THEME, isTheme, type ThemeId }

/**
 * Lista de temas en el idioma activo, tema actual (por el prefijo de la ruta) y cambio de tema que conserva la vista:
 * /apple/obra/nos-cafe → /plato/obra/nos-cafe. Elegir un tema reescribe la cookie del reparto (la próxima visita a `/`
 * vuelve aquí) y registra `theme_switch` con el par de → a.
 */
export function useCambioDeTema() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const { locale } = useLanguage()
  const [, primero = '', ...resto] = pathname.split('/')
  const actual: ThemeId = isTheme(primero) ? primero : DEFAULT_THEME
  const temas: Tema[] = THEMES.map((id) => ({
    id,
    nombre: PUBLICO[id].nombre[locale],
    lema: PUBLICO[id].lema[locale],
    preview: `/themes/${id}.webp`,
    previewMovil: `/themes/${id}-m.webp`,
    href: `/${id}${resto.length ? `/${resto.join('/')}` : ''}${search}`,
  }))
  const cambiar = (id: ThemeId) => {
    if (id === actual) return
    document.cookie = `${AB.cookie}=${id}; Path=/; Max-Age=${AB.maxAge}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    track('theme_switch', { from: actual, to: id })
    navigate(`/${id}${resto.length ? `/${resto.join('/')}` : ''}${search}`)
  }
  return { temas, actual, cambiar }
}
