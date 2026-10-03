import type { Locale } from '../../../context/LanguageContext'

// Textos del selector de temas de Plató («Cambiar de set»), en español, inglés y japonés. Los nombres y lemas de los ocho temas no viven aquí:
// vienen de useCambioDeTema() ya en el idioma activo.
export interface TextosTemas {
  /** Nombre accesible (y rótulo visible) del disparador de la cabecera. */
  boton: string
  /** Título del diálogo. */
  titulo: string
  kicker: (n: number) => string
  lead: string
  lista: string
  toma: (i: number, n: number) => string
  enRodaje: string
  entrar: string
  cerrar: string
  ayudaTeclado: string
  ayudaTactil: string
}

const es: TextosTemas = {
  boton: 'Temas',
  titulo: 'Cambiar de set',
  kicker: (n) => `${n} sets, una sola obra`,
  lead: 'La misma obra, rodada en distintos escenarios. Te quedas en la página que estás viendo.',
  lista: 'Los sets disponibles',
  toma: (i, n) => `Toma ${String(i).padStart(2, '0')} / ${String(n).padStart(2, '0')}`,
  enRodaje: 'En rodaje',
  entrar: 'Entrar al set',
  cerrar: 'Cerrar',
  ayudaTeclado: '← → recorren los sets · Enter entra · Esc cierra',
  ayudaTactil: 'Desliza · toca un set para entrar',
}

const en: TextosTemas = {
  boton: 'Themes',
  titulo: 'Change the set',
  kicker: (n) => `${n} sets, one body of work`,
  lead: 'The same work, shot on different stages. You stay on the page you are viewing.',
  lista: 'Available sets',
  toma: (i, n) => `Take ${String(i).padStart(2, '0')} / ${String(n).padStart(2, '0')}`,
  enRodaje: 'Now shooting',
  entrar: 'Step onto this set',
  cerrar: 'Close',
  ayudaTeclado: '← → move between sets · Enter steps in · Esc closes',
  ayudaTactil: 'Swipe · tap a set to step in',
}

const ja: TextosTemas = {
  boton: 'テーマ',
  titulo: 'セットを変える',
  kicker: (n) => `${n}つのセット、ひとつの仕事`,
  lead: '同じ仕事を、さまざまな舞台で撮影。いま見ているページはそのままです。',
  lista: '選べるセット',
  toma: (i, n) => `テイク ${String(i).padStart(2, '0')} / ${String(n).padStart(2, '0')}`,
  enRodaje: '撮影中',
  entrar: 'このセットへ',
  cerrar: '閉じる',
  ayudaTeclado: '← → でセットを移動 · Enter で入る · Esc で閉じる',
  ayudaTactil: 'スワイプ · タップして入る',
}

export const textosTemas = (l: Locale): TextosTemas => (l === 'es' ? es : l === 'ja' ? ja : en)
