import type { ReactNode } from 'react'
import { supportedLocales, useLanguage } from '../../context/LanguageContext'
import { useCopy } from './copy'

/** <title> y noindex de cada vista (React 19 los sube al <head>). */
export function Cabeza({ titulo }: { titulo: string }) {
  return (
    <>
      <title>{titulo}</title>
      <meta name="robots" content="noindex" />
    </>
  )
}

// Las flechas y el chevron van en SVG: el subconjunto latin de las fuentes no trae esos signos.
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const }

/** Flecha en diagonal (enlace externo), hacia la derecha (abrir) o hacia la izquierda (volver). */
export function Flecha({ tipo }: { tipo: 'externa' | 'atras' | 'derecha' | 'abajo' }) {
  return (
    <svg className="a-flecha" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false" {...trazo}>
      {tipo === 'externa' && <path d="M3 11 11 3M4.5 3H11v6.5" />}
      {tipo === 'atras' && <path d="M12 7H2M6.5 2.5 2 7l4.5 4.5" />}
      {tipo === 'derecha' && <path d="M2 7h10M7.5 2.5 12 7l-4.5 4.5" />}
      {tipo === 'abajo' && <path d="M7 2v10M2.5 7.5 7 12l4.5-4.5" />}
    </svg>
  )
}

/** Triángulo de la fila (▸): gira 90° al abrir (solo transform). */
export function Chevron() {
  return (
    <svg className="a-chev" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M4.5 2.5 12 8l-7.5 5.5z" fill="currentColor" />
    </svg>
  )
}

/** Una línea de titular con cabeza de impresión: el texto se descubre de izquierda a derecha y una barra de tinta lo lidera (movimiento.ts). */
export function Linea({ children, flipId }: { children: ReactNode; flipId?: string }) {
  return (
    <span className="a-linea" data-a="linea">
      <span className="a-linea-txt" data-flip-id={flipId}>{children}</span>
      <i className="a-cabeza" aria-hidden="true" />
    </span>
  )
}

/** Selector ES/EN/JA (ja cae a inglés en las etiquetas de la dirección; los textos del registro sí vienen en japonés). */
export function Idiomas({ clase }: { clase: string }) {
  const c = useCopy()
  const { locale, setLocale } = useLanguage()
  return (
    <div className={`a-idiomas ${clase}`} role="group" aria-label={c.idioma}>
      {[...supportedLocales].sort((a, b) => ['es', 'en', 'ja'].indexOf(a) - ['es', 'en', 'ja'].indexOf(b)).map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={locale === l} onClick={() => setLocale(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  )
}
