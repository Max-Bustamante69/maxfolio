import { useLanguage } from '../../context/LanguageContext'

/** Id del panel: el disparador lo nombra en aria-controls y el diálogo lo lleva. */
export const ID_PANEL = 'ing-selector-temas'

// Textos del selector de temas de la dirección Ingeniería, en los tres idiomas (el diccionario del tema trata ja como en;
// aquí sí hay japonés). El nombre y el lema de cada tema vienen de useCambioDeTema(), ya en el idioma activo.
const es = {
  boton: 'Temas',
  eyebrow: (n: string) => `Temas · ${n} variantes`,
  titulo: 'Elige tu variante',
  acento: 'del mismo portafolio',
  cerrar: 'Cerrar',
  cerrarAria: 'Cerrar el selector de temas',
  variante: 'Variante',
  actual: 'Actual',
  nombre: 'Nombre',
  lema: 'Lema',
  vista: 'Vista',
  variantes: 'Variantes',
  inicio: 'Inicio',
  nota: 'Cambiar de variante conserva la vista en la que estás',
  esc: 'Esc',
  lista: 'Variantes del portafolio',
}

const en: typeof es = {
  boton: 'Themes',
  eyebrow: (n: string) => `Themes · ${n} variants`,
  titulo: 'Choose your variant',
  acento: 'of the same portfolio',
  cerrar: 'Close',
  cerrarAria: 'Close the theme picker',
  variante: 'Variant',
  actual: 'Current',
  nombre: 'Name',
  lema: 'Motto',
  vista: 'View',
  variantes: 'Variants',
  inicio: 'Home',
  nota: 'Switching variant keeps the view you are on',
  esc: 'Esc',
  lista: 'Portfolio variants',
}

const ja: typeof es = {
  boton: 'テーマ',
  eyebrow: (n: string) => `テーマ · ${n}種`,
  titulo: 'テーマを選ぶ',
  acento: '同じ内容を、別の見せ方で',
  cerrar: '閉じる',
  cerrarAria: 'テーマの選択を閉じる',
  variante: 'テーマ',
  actual: '現在',
  nombre: '名称',
  lema: '説明',
  vista: 'ページ',
  variantes: '種類',
  inicio: 'ホーム',
  nota: 'テーマを切り替えても、今見ているページはそのままです',
  esc: 'Esc',
  lista: 'ポートフォリオのテーマ',
}

export type CopySelector = typeof es
const DICCIONARIOS: Record<'es' | 'en' | 'ja', CopySelector> = { es, en, ja }
export const useCopySelector = (): CopySelector => DICCIONARIOS[useLanguage().locale]
