import { useLanguage } from '../../context/LanguageContext'

// Textos de la agenda que son propios de la dirección Apple (es · en · ja). Los comunes (título, duración, zona, fallos,
// consentimiento, éxito) vienen de useCopiaAgenda() en shared/agenda.ts; aquí solo vive lo que el calendario de mes y la hoja necesitan.
// Ningún texto de aquí promete plazos ni cobros: lo que el vivo no sostiene no se imprime (publico.ts).
const es = {
  mesAnterior: 'Mes anterior',
  mesSiguiente: 'Mes siguiente',
  huecos: (n: number) => (n === 1 ? '1 horario disponible' : `${n} horarios disponibles`),
  partesEtq: 'Momento del día',
  partes: { manana: 'Mañana', tarde: 'Tarde', noche: 'Noche' },
  deMax: 'hora de Max',
  horaMax: (z: string) => `Entre paréntesis, la hora de Max (${z}).`,
  cargando: 'Cargando la agenda…',
  faltaNombre: 'Escribe tu nombre.',
  faltaConsent: 'Acepta el aviso de privacidad para agendar la llamada.',
  otra: 'Agendar otra llamada',
  cerrar: 'Cerrar',
  hoja: 'Confirma tu llamada',
  escribir: 'Dejar un mensaje',
  escribirTitulo: '¿Prefieres escribir?',
  escribirLead: 'Déjame la URL de tu tienda y tu correo, y te escribo.',
  zonas: { 'America/Bogota': 'Bogotá' } as Record<string, string>,
}

const en: typeof es = {
  mesAnterior: 'Previous month',
  mesSiguiente: 'Next month',
  huecos: (n: number) => (n === 1 ? '1 time available' : `${n} times available`),
  partesEtq: 'Time of day',
  partes: { manana: 'Morning', tarde: 'Afternoon', noche: 'Evening' },
  deMax: "Max's time",
  horaMax: (z: string) => `In parentheses: Max's time (${z}).`,
  cargando: 'Loading the calendar…',
  faltaNombre: 'Enter your name.',
  faltaConsent: 'Accept the privacy notice to book the call.',
  otra: 'Book another call',
  cerrar: 'Close',
  hoja: 'Confirm your call',
  escribir: 'Leave a message',
  escribirTitulo: 'Prefer to write?',
  escribirLead: "Leave your store URL and your email, and I'll write to you.",
  zonas: { 'America/Bogota': 'Bogotá' },
}

const ja: typeof es = {
  mesAnterior: '前の月',
  mesSiguiente: '次の月',
  huecos: (n: number) => `空き${n}件`,
  partesEtq: '時間帯',
  partes: { manana: '午前', tarde: '午後', noche: '夜' },
  deMax: 'Maxの時間',
  horaMax: (z: string) => `括弧内はMaxの時間（${z}）です。`,
  cargando: '予約枠を読み込み中…',
  faltaNombre: 'お名前を入力してください。',
  faltaConsent: 'ご予約にはプライバシー通知への同意が必要です。',
  otra: '別の通話を予約',
  cerrar: '閉じる',
  hoja: 'ご予約の確認',
  escribir: 'メッセージを送る',
  escribirTitulo: 'メッセージをご希望ですか？',
  escribirLead: 'ストアのURLとメールアドレスを残してください。こちらからご連絡します。',
  zonas: { 'America/Bogota': 'ボゴタ' },
}

const DICCIONARIOS = { es, en, ja }
export type Extra = typeof es
export const useExtra = (): Extra => DICCIONARIOS[useLanguage().locale]
