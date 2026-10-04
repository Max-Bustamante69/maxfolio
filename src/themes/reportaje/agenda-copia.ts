import { useLanguage, type Locale } from '../../context/LanguageContext'

// Textos de la Agenda de El Reportaje, con la voz de la revista. El sentido es el del contrato (shared/agenda.ts): una videollamada,
// horas en la zona del visitante, el consentimiento nombra a Digitdeck y enlaza su aviso. Ni plazos de respuesta ni promesas que la
// guardia de afirmaciones no deja pasar. Los títulos van sin punto final.

export interface CopiaAgenda {
  titulo: string
  dek: (min: number) => string
  pasosEtiqueta: string
  pasos: [string, string, string]
  elegirDia: string
  elegirHora: string
  horasLibres: (n: number) => string
  horasCorto: (n: number) => string
  zona: (z: string) => string
  horaMax: (t: string) => string
  /** La nota corta que va entre paréntesis bajo cada hora. */
  horaMaxCorta: (t: string) => string
  /** Une dos frases de una línea de apoyo (con el punto de cada idioma). */
  frase: (a: string, b: string) => string
  cargando: string
  sinHuecos: string
  irFormulario: string
  errorCarga: string
  reintentar: string
  tuHora: string
  cambiar: string
  reunion: (min: number) => string
  nombre: string
  nombreEj: string
  email: string
  emailEj: string
  marca: string
  marcaEj: string
  mensaje: string
  mensajeEj: string
  consentimiento: string
  aviso: string
  confirmar: string
  enviando: string
  faltaNombre: string
  faltaCorreo: string
  faltaConsent: string
  listo: string
  listoDetalle: string
  meet: string
  meetNota: string
  otra: string
  sello: string
  fallos: { ocupada: string; datos: string; limite: string; red: string }
  /** Anuncios para lectores de pantalla (región aria-live). */
  anuncio: {
    dia: (dia: string, n: string) => string
    datos: (dia: string, hora: string) => string
    listo: (dia: string, hora: string) => string
    horas: string
  }
}

const es: CopiaAgenda = {
  titulo: 'Agenda tu llamada',
  dek: (m) => `Videollamada de ${m} minutos por Google Meet. Elige un día con huecos y la hora que te quede bien.`,
  pasosEtiqueta: 'Pasos de la reserva',
  pasos: ['Hora', 'Datos', 'Listo'],
  elegirDia: 'Elige un día',
  elegirHora: 'Elige una hora',
  horasLibres: (n) => (n === 1 ? '1 hora libre' : `${n} horas libres`),
  horasCorto: (n) => `${n} horas`,
  zona: (z) => `Horas en tu zona (${z})`,
  horaMax: (t) => `hora de Max: ${t}`,
  horaMaxCorta: (t) => `Max: ${t}`,
  frase: (a, b) => `${a}. ${b}`,
  cargando: 'Cargando la agenda',
  sinHuecos: 'No hay huecos libres en las próximas tres semanas. Escríbeme y buscamos uno.',
  irFormulario: 'Escribirme desde el formulario',
  errorCarga: 'No pude cargar la agenda. Inténtalo de nuevo o escríbeme.',
  reintentar: 'Reintentar',
  tuHora: 'Tu hora',
  cambiar: 'Cambiar la hora',
  reunion: (m) => `Videollamada de ${m} minutos por Google Meet`,
  nombre: 'Tu nombre',
  nombreEj: 'Nombre y apellido',
  email: 'Tu correo',
  emailEj: 'tu@tienda.com',
  marca: 'Marca o tienda (opcional)',
  marcaEj: 'tutienda.com',
  mensaje: '¿De qué quieres hablar? (opcional)',
  mensajeEj: 'Con una línea basta',
  consentimiento: 'Acepto que Digitdeck use estos datos para agendar la llamada y contactarme, según su',
  aviso: 'aviso de privacidad',
  confirmar: 'Confirmar la llamada',
  enviando: 'Reservando',
  faltaNombre: 'Escribe tu nombre.',
  faltaCorreo: 'Escribe un correo válido.',
  faltaConsent: 'Marca la casilla para poder agendar.',
  listo: 'Tu llamada quedó en la agenda',
  listoDetalle: 'Te llega la invitación de Google Calendar a tu correo.',
  meet: 'Abrir Google Meet',
  meetNota: 'El enlace de la videollamada',
  otra: 'Agendar otra llamada',
  sello: 'CONFIRMADO',
  fallos: {
    ocupada: 'Alguien acaba de tomar esa hora. Elige otra.',
    datos: 'Revisa tu nombre, tu correo y la casilla del aviso.',
    limite: 'Demasiados intentos seguidos. Espera unos minutos.',
    red: 'No hubo conexión. Inténtalo de nuevo.',
  },
  anuncio: {
    dia: (d, n) => `${d}: ${n}`,
    datos: (d, h) => `Elegiste ${d}, ${h}. Paso 2 de 3: tus datos`,
    listo: (d, h) => `Paso 3 de 3: la llamada quedó agendada para ${d}, ${h}`,
    horas: 'Paso 1 de 3: elige una hora',
  },
}

const en: CopiaAgenda = {
  titulo: 'Book your call',
  dek: (m) => `A ${m}-minute video call on Google Meet. Pick a day with openings and the time that suits you.`,
  pasosEtiqueta: 'Booking steps',
  pasos: ['Time', 'Details', 'Done'],
  elegirDia: 'Pick a day',
  elegirHora: 'Pick a time',
  horasLibres: (n) => (n === 1 ? '1 open slot' : `${n} open slots`),
  horasCorto: (n) => `${n} slots`,
  zona: (z) => `Times in your time zone (${z})`,
  horaMax: (t) => `Max's time: ${t}`,
  horaMaxCorta: (t) => `Max: ${t}`,
  frase: (a, b) => `${a}. ${b}`,
  cargando: 'Loading the calendar',
  sinHuecos: 'No open slots in the next three weeks. Write to me and we will find one.',
  irFormulario: 'Write to me from the form',
  errorCarga: "Couldn't load the calendar. Try again or write to me.",
  reintentar: 'Try again',
  tuHora: 'Your time',
  cambiar: 'Change the time',
  reunion: (m) => `${m}-minute video call on Google Meet`,
  nombre: 'Your name',
  nombreEj: 'First and last name',
  email: 'Your email',
  emailEj: 'you@store.com',
  marca: 'Brand or store (optional)',
  marcaEj: 'yourstore.com',
  mensaje: 'What would you like to talk about? (optional)',
  mensajeEj: 'One line is enough',
  consentimiento: 'I agree that Digitdeck may use this data to book the call and contact me, under its',
  aviso: 'privacy notice',
  confirmar: 'Confirm the call',
  enviando: 'Booking',
  faltaNombre: 'Enter your name.',
  faltaCorreo: 'Enter a valid email.',
  faltaConsent: 'Tick the box to book.',
  listo: 'Your call is in the calendar',
  listoDetalle: 'A Google Calendar invite is on its way to your inbox.',
  meet: 'Open Google Meet',
  meetNota: 'The video call link',
  otra: 'Book another call',
  sello: 'CONFIRMED',
  fallos: {
    ocupada: 'Someone just took that time. Pick another one.',
    datos: 'Check your name, your email and the notice checkbox.',
    limite: 'Too many attempts in a row. Wait a few minutes.',
    red: 'No connection. Try again.',
  },
  anuncio: {
    dia: (d, n) => `${d}: ${n}`,
    datos: (d, h) => `You picked ${d}, ${h}. Step 2 of 3: your details`,
    listo: (d, h) => `Step 3 of 3: the call is booked for ${d}, ${h}`,
    horas: 'Step 1 of 3: pick a time',
  },
}

const ja: CopiaAgenda = {
  titulo: '通話を予約',
  dek: (m) => `Google Meetで${m}分のビデオ通話。空きのある日と、ご都合のよい時間をお選びください。`,
  pasosEtiqueta: '予約の手順',
  pasos: ['時間', '情報', '完了'],
  elegirDia: '日付を選択',
  elegirHora: '時間を選択',
  horasLibres: (n) => `空き${n}枠`,
  horasCorto: (n) => `${n}枠`,
  zona: (z) => `お住まいのタイムゾーンで表示 (${z})`,
  horaMax: (t) => `Maxの現地時間：${t}`,
  horaMaxCorta: (t) => `Max ${t}`,
  frase: (a, b) => `${a}。${b}`,
  cargando: '予約枠を読み込み中',
  sinHuecos: '今後3週間に空き枠がありません。メッセージをいただければ調整します。',
  irFormulario: 'フォームからメッセージを送る',
  errorCarga: '予約枠を読み込めませんでした。もう一度お試しいただくか、メッセージをお送りください。',
  reintentar: '再試行',
  tuHora: 'ご予約の時間',
  cambiar: '時間を変更',
  reunion: (m) => `Google Meetで${m}分のビデオ通話`,
  nombre: 'お名前',
  nombreEj: '姓名',
  email: 'メールアドレス',
  emailEj: 'you@store.com',
  marca: 'ブランド・ストア名（任意）',
  marcaEj: 'yourstore.com',
  mensaje: 'ご相談内容（任意）',
  mensajeEj: '一行で十分です',
  consentimiento: '通話の予約と連絡のために、Digitdeckが以下に従ってこの情報を使用することに同意します：',
  aviso: 'プライバシー通知',
  confirmar: '予約を確定',
  enviando: '予約中',
  faltaNombre: 'お名前を入力してください。',
  faltaCorreo: '有効なメールアドレスを入力してください。',
  faltaConsent: '予約するにはチェックを入れてください。',
  listo: '予約が完了しました',
  listoDetalle: 'Google カレンダーの招待がメールに届きます。',
  meet: 'Google Meet を開く',
  meetNota: 'ビデオ通話のリンク',
  otra: '別の通話を予約',
  sello: '確認済み',
  fallos: {
    ocupada: 'その時間はちょうど埋まりました。別の時間をお選びください。',
    datos: 'お名前、メールアドレス、同意のチェックをご確認ください。',
    limite: '試行回数が多すぎます。数分お待ちください。',
    red: '接続できませんでした。もう一度お試しください。',
  },
  anuncio: {
    dia: (d, n) => `${d}：${n}`,
    datos: (d, h) => `${d} ${h}を選択しました。手順2/3：情報の入力`,
    listo: (d, h) => `手順3/3：${d} ${h}に予約が完了しました`,
    horas: '手順1/3：時間を選択',
  },
}

const COPIAS: Record<Locale, CopiaAgenda> = { es, en, ja }
export const useCopiaAgendaRp = (): CopiaAgenda => COPIAS[useLanguage().locale]
