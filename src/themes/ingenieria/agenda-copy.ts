import { useLanguage, type Locale } from '../../context/LanguageContext'
import { useCopiaAgenda } from '../shared/agenda'

// Textos de «Programar sesión técnica». La base común (huecos, errores, consentimiento, fallos) viene de useCopiaAgenda();
// aquí solo lo que la ficha de especificación dice con su propia voz: bloque de título, pasos, orden de trabajo.
// Nada de plazos de respuesta ni promesas: la ficha dice lo que la API da (duración real, zona, enlace de Meet).
const es = {
  titulo: 'Programar sesión técnica',
  pasos: { etq: 'Pasos de la reserva', lista: ['Franja', 'Datos', 'Orden'] },
  ficha: { con: 'Con', duracion: 'Duración', canal: 'Canal', zona: 'Tu zona', canalV: 'Google Meet', min: (m: number) => `${m} min` },
  dia: 'Día',
  franjasEtq: 'Franjas',
  franjas: (n: number) => `${n} ${n === 1 ? 'franja' : 'franjas'}`,
  dias: (n: number) => `${n} ${n === 1 ? 'día' : 'días'} con franjas libres`,
  semana: { anterior: 'Semana anterior', siguiente: 'Semana siguiente', de: (i: number, n: number) => `Semana ${i} de ${n}` },
  max: (h: string) => `Max ${h}`,
  elegida: 'Franja elegida',
  confirmar: 'Confirmar la sesión',
  enviando: 'Reservando',
  consentimiento: 'Acepto que Digitdeck use estos datos para agendar la sesión y contactarme, según su',
  errores: { nombre: 'Escribe tu nombre.', correo: 'Escribe un correo válido.', acepto: 'Marca la casilla para continuar.' },
  cargando: 'Cargando las franjas libres',
  listo: 'Sesión agendada',
  otra: 'Agendar otra',
  orden: {
    titulo: 'Orden de trabajo',
    estado: 'Confirmada',
    fecha: 'Fecha',
    hora: 'Hora',
    duracion: 'Duración',
    canal: 'Canal',
    invitacion: 'Invitación',
    abrir: 'Abrir Google Meet',
    sinEnlace: 'Google Meet, el enlace va en la invitación',
    calendario: (correo: string) => `Google Calendar a ${correo}`,
  },
}

const en: typeof es = {
  titulo: 'Schedule a technical session',
  pasos: { etq: 'Booking steps', lista: ['Slot', 'Details', 'Order'] },
  ficha: { con: 'With', duracion: 'Duration', canal: 'Channel', zona: 'Your zone', canalV: 'Google Meet', min: (m: number) => `${m} min` },
  dia: 'Day',
  franjasEtq: 'Slots',
  franjas: (n: number) => `${n} ${n === 1 ? 'slot' : 'slots'}`,
  dias: (n: number) => `${n} ${n === 1 ? 'day' : 'days'} with open slots`,
  semana: { anterior: 'Previous week', siguiente: 'Next week', de: (i: number, n: number) => `Week ${i} of ${n}` },
  max: (h: string) => `Max ${h}`,
  elegida: 'Chosen slot',
  confirmar: 'Confirm the session',
  enviando: 'Booking',
  consentimiento: 'I agree that Digitdeck may use this data to book the session and contact me, under its',
  errores: { nombre: 'Enter your name.', correo: 'Enter a valid email.', acepto: 'Tick the box to continue.' },
  cargando: 'Loading open slots',
  listo: 'Session booked',
  otra: 'Book another',
  orden: {
    titulo: 'Work order',
    estado: 'Confirmed',
    fecha: 'Date',
    hora: 'Time',
    duracion: 'Duration',
    canal: 'Channel',
    invitacion: 'Invite',
    abrir: 'Open Google Meet',
    sinEnlace: 'Google Meet, the link comes with the invite',
    calendario: (correo: string) => `Google Calendar to ${correo}`,
  },
}

const ja: typeof es = {
  titulo: '技術セッションを予約',
  pasos: { etq: '予約の手順', lista: ['枠', '情報', '確認'] },
  ficha: { con: 'お相手', duracion: '所要時間', canal: 'チャネル', zona: 'お住まいの時間帯', canalV: 'Google Meet', min: (m: number) => `${m}分` },
  dia: '日付',
  franjasEtq: '空き枠',
  franjas: (n: number) => `${n}枠`,
  dias: (n: number) => `空き枠のある日：${n}日`,
  semana: { anterior: '前の週', siguiente: '次の週', de: (i: number, n: number) => `${i} / ${n} 週` },
  max: (h: string) => `Max ${h}`,
  elegida: '選択した枠',
  confirmar: '予約を確定',
  enviando: '予約中',
  consentimiento: '技術セッションの予約と連絡のために、Digitdeckが以下に従ってこの情報を使用することに同意します：',
  errores: { nombre: 'お名前を入力してください。', correo: '有効なメールアドレスを入力してください。', acepto: '続けるにはチェックを入れてください。' },
  cargando: '空き枠を読み込み中',
  listo: '予約が完了しました',
  otra: '別の枠を予約',
  orden: {
    titulo: '作業指示書',
    estado: '確定',
    fecha: '日付',
    hora: '時間',
    duracion: '所要時間',
    canal: 'チャネル',
    invitacion: '招待',
    abrir: 'Google Meet を開く',
    sinEnlace: 'Google Meet、リンクは招待に含まれます',
    calendario: (correo: string) => `Google カレンダー → ${correo}`,
  },
}

const PROPIA: Record<Locale, typeof es> = { es, en, ja }

/** Base común de la agenda con la voz de la ficha encima: lo que esta dirección reescribe gana, el resto sale del contrato. */
export function useCopiaIng() {
  const base = useCopiaAgenda()
  const { locale } = useLanguage()
  return { ...base, ...PROPIA[locale] }
}
