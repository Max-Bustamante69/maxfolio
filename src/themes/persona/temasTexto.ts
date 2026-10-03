import type { Locale } from '../../context/LanguageContext'

// Palabras del selector de temas de Persona («SELECT STAGE»). Viven aparte del resto del copy porque el disparador está
// en el cromo (carga con la página) y el panel en un trozo perezoso: el disparador solo necesita `boton`.
// A diferencia de copy.ts, aquí `ja` tiene su propio texto (el nombre accesible del disparador debe estar en japonés).
export interface TextoTemas {
  /** Nombre del disparador (visible y accesible). */
  boton: string
  /** Nombre accesible del diálogo. */
  dialogo: string
  eyebrow: string
  titulo: string
  actual: string
  cerrar: string
  lista: string
  /** [elegir, entrar, cerrar] para la pista de teclas. */
  hint: readonly [string, string, string]
  /** Antes del nombre del tema elegido, en el barrido que lo estrena. */
  entrando: string
}

const TEXTO: Record<Locale, TextoTemas> = {
  es: { boton: 'Temas', dialogo: 'Elegir un tema', eyebrow: 'Selecciona un nivel', titulo: 'Elige tu tema', actual: 'Actual', cerrar: 'Cerrar', lista: 'Temas del portafolio', hint: ['elegir', 'entrar', 'cerrar'], entrando: 'Entrando a' },
  en: { boton: 'Themes', dialogo: 'Choose a theme', eyebrow: 'Pick a theme', titulo: 'Select stage', actual: 'Current', cerrar: 'Close', lista: 'Portfolio themes', hint: ['select', 'enter', 'close'], entrando: 'Entering' },
  ja: { boton: 'テーマ', dialogo: 'テーマを選ぶ', eyebrow: 'テーマを選ぶ', titulo: 'ステージ選択', actual: '現在', cerrar: '閉じる', lista: 'ポートフォリオのテーマ', hint: ['選択', '決定', '閉じる'], entrando: '突入' },
}

export const textoTemas = (locale: string): TextoTemas => TEXTO[locale as Locale] ?? TEXTO.en
