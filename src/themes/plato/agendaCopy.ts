import { useLanguage, type Locale } from '../../context/LanguageContext'
import { useCopiaAgenda } from '../shared/agenda'

// Textos de la agenda de Plató, con la voz del tema (hoja de rodaje: fecha de rodaje, toma, ficha, claqueta). Lo que no cambia de
// sentido (consentimiento, fallos, vacío, error, reintentar) sale de shared/agenda.useCopiaAgenda(); aquí solo viven los nombres propios
// del tema y las etiquetas que la copia común no trae. Los tres idiomas: es, en y ja (Plató usa el japonés de la copia común donde existe).
interface Extra {
  kicker: string
  dirigeK: string
  duracionK: string
  lugarK: string
  lugarV: string
  zonaK: string
  min: (m: number) => string
  fechaK: string
  tomaK: string
  prev: string
  next: string
  libres: (n: number) => string
  fechasLibres: (n: number) => string
  maxLeyenda: (z: string) => string
  horaMaxCorta: string
  horaMaxK: string
  toma: string
  fichaK: string
  nombreL: string
  emailL: string
  marcaL: string
  mensajeL: string
  emailEj: string
  marcaEj: string
  errores: { nombre: string; email: string; consent: string }
  listoK: string
  otra: string
  meetAbrir: string
  claqueta: { dirige: string; fecha: string; toma: string }
  cargando: string
  escribir: string
  otraVia: string
}

const es: Extra = {
  kicker: 'Hoja de rodaje',
  dirigeK: 'Dirige',
  duracionK: 'Duración',
  lugarK: 'Lugar',
  lugarV: 'Google Meet',
  zonaK: 'Tu zona',
  min: (m) => `${m} min`,
  fechaK: 'Fecha de rodaje',
  tomaK: 'Toma',
  prev: 'Ver fechas anteriores',
  next: 'Ver fechas siguientes',
  libres: (n) => (n === 1 ? '1 toma libre' : `${n} tomas libres`),
  fechasLibres: (n) => (n === 1 ? '1 fecha con tomas libres' : `${n} fechas con tomas libres`),
  maxLeyenda: (z) => `Entre paréntesis, la hora de Max (${z})`,
  horaMaxCorta: 'hora de Max',
  horaMaxK: 'Hora de Max',
  toma: 'Toma',
  fichaK: 'Ficha de la toma',
  nombreL: 'Tu nombre',
  emailL: 'Tu correo',
  marcaL: 'Tu tienda o marca (opcional)',
  mensajeL: '¿De qué quieres hablar? (opcional)',
  emailEj: 'tu@tienda.com',
  marcaEj: 'tutienda.com',
  errores: { nombre: 'Escribe tu nombre.', email: 'Escribe un correo válido.', consent: 'Acepta el aviso de privacidad para agendar.' },
  listoK: 'Rodaje confirmado',
  otra: 'Agendar otra llamada',
  meetAbrir: 'Abrir Google Meet',
  claqueta: { dirige: 'Dirige', fecha: 'Fecha', toma: 'Toma' },
  cargando: 'Cargando la hoja de rodaje',
  escribir: 'Escríbeme',
  otraVia: 'Si prefieres escribir',
}

const en: Extra = {
  kicker: 'Call sheet',
  dirigeK: 'Directed by',
  duracionK: 'Length',
  lugarK: 'Location',
  lugarV: 'Google Meet',
  zonaK: 'Your time zone',
  min: (m) => `${m} min`,
  fechaK: 'Shoot date',
  tomaK: 'Take',
  prev: 'Show earlier dates',
  next: 'Show later dates',
  libres: (n) => (n === 1 ? '1 open take' : `${n} open takes`),
  fechasLibres: (n) => (n === 1 ? '1 date with open takes' : `${n} dates with open takes`),
  maxLeyenda: (z) => `In brackets, Max's time (${z})`,
  horaMaxCorta: "Max's time",
  horaMaxK: "Max's time",
  toma: 'Take',
  fichaK: 'Take sheet',
  nombreL: 'Your name',
  emailL: 'Your email',
  marcaL: 'Your store or brand (optional)',
  mensajeL: 'What would you like to talk about? (optional)',
  emailEj: 'you@store.com',
  marcaEj: 'yourstore.com',
  errores: { nombre: 'Enter your name.', email: 'Enter a valid email.', consent: 'Accept the privacy notice to book.' },
  listoK: 'Shoot confirmed',
  otra: 'Book another call',
  meetAbrir: 'Open Google Meet',
  claqueta: { dirige: 'Director', fecha: 'Date', toma: 'Take' },
  cargando: 'Loading the call sheet',
  escribir: 'Write to me',
  otraVia: 'Prefer to write',
}

const ja: Extra = {
  kicker: '撮影スケジュール',
  dirigeK: '監督',
  duracionK: '所要時間',
  lugarK: '場所',
  lugarV: 'Google Meet',
  zonaK: 'タイムゾーン',
  min: (m) => `${m}分`,
  fechaK: '撮影日',
  tomaK: 'テイク',
  prev: '前の日付を表示',
  next: '次の日付を表示',
  libres: (n) => `空き${n}枠`,
  fechasLibres: (n) => `空きのある日付は${n}日`,
  maxLeyenda: (z) => `括弧内はMaxの時間（${z}）`,
  horaMaxCorta: 'Maxの時間',
  horaMaxK: 'Maxの時間',
  toma: 'テイク',
  fichaK: 'テイクの詳細',
  nombreL: 'お名前',
  emailL: 'メールアドレス',
  marcaL: 'ストア・ブランド名（任意）',
  mensajeL: 'ご相談内容（任意）',
  emailEj: 'you@store.com',
  marcaEj: 'yourstore.com',
  errores: { nombre: 'お名前を入力してください。', email: '有効なメールアドレスを入力してください。', consent: '予約にはプライバシー通知への同意が必要です。' },
  listoK: '撮影が確定しました',
  otra: 'もう1件予約する',
  meetAbrir: 'Google Meetを開く',
  claqueta: { dirige: '監督', fecha: '日付', toma: 'テイク' },
  cargando: '予約枠を読み込み中',
  escribir: 'メッセージを送る',
  otraVia: 'メッセージで連絡する',
}

const EXTRA: Record<Locale, Extra> = { es, en, ja }

/** Copia común de la agenda (consentimiento, fallos, vacío, error) más las etiquetas propias de Plató. */
export function useCopiaPlato() {
  const base = useCopiaAgenda()
  const { locale } = useLanguage()
  return { ...base, ...EXTRA[locale] }
}
export type CopiaPlato = ReturnType<typeof useCopiaPlato>
