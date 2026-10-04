// Textos de la agenda con la voz de la dirección «A la manera de Digitdeck»: corta, directa y sin adornos. Parte de los comunes
// (useCopiaAgenda: es/en/ja, con el consentimiento que nombra a Digitdeck y los fallos de la API) y añade lo que solo esta
// dirección dice: la ruta tipo comando, las etiquetas de lectura de pantalla, los errores por campo y la confirmación.
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { useCopiaAgenda } from '../shared/agenda'

const es = {
  lede: 'Elige un día y una hora. Te llega la invitación de Google Calendar con el enlace de Meet.',
  ruta: { pasos: 'Pasos de la reserva', raiz: 'agenda', dia: 'día', hora: 'hora', datos: 'datos', listo: 'listo' },
  dias: 'Días con horas libres',
  semana: {
    anterior: 'Semana anterior',
    siguiente: 'Semana siguiente',
    de: (a: string, b: string) => `Semana del ${a} al ${b}`,
  },
  horasLibres: (n: number) => (n === 1 ? '1 hora libre' : `${n} horas libres`),
  sinHoras: 'sin horas libres',
  horasDe: (dia: string) => `Elige una hora, ${dia}`,
  max: (h: string) => `Max ${h}`,
  maxLargo: (h: string, z: string) => `Hora de Max: ${h} (${z})`,
  cargando: 'Cargando la agenda…',
  anuncioDia: (dia: string, n: string) => `${dia}, ${n}`,
  anuncioHora: (dia: string, hora: string) => `Elegiste ${dia} a las ${hora}. Completa tus datos.`,
  marcaEj: 'tutienda.com',
  mensajeEj: 'Tu tienda y lo que quieres mejorar',
  errores: {
    nombre: 'Escribe tu nombre.',
    email: 'Revisa el correo: falta la @ o el punto.',
    consentimiento: 'Marca la casilla para poder agendar.',
  },
  datos: 'Tus datos',
  filas: { invitacion: 'Invitación', videollamada: 'Videollamada' },
  otra: 'Agendar otra llamada',
  nuevaPestana: '(se abre en una pestaña nueva)',
  dejarMensaje: 'Dejar un mensaje',
  escribir: 'O déjame un mensaje',
  ocupadaTitulo: 'Esa hora ya no está',
}

type Extras = typeof es

const en: Extras = {
  lede: 'Pick a day and a time. A Google Calendar invite with the Meet link lands in your inbox.',
  ruta: { pasos: 'Booking steps', raiz: 'agenda', dia: 'day', hora: 'time', datos: 'details', listo: 'done' },
  dias: 'Days with open times',
  semana: {
    anterior: 'Previous week',
    siguiente: 'Next week',
    de: (a, b) => `Week of ${a} to ${b}`,
  },
  horasLibres: (n) => (n === 1 ? '1 open time' : `${n} open times`),
  sinHoras: 'no open times',
  horasDe: (dia) => `Pick a time, ${dia}`,
  max: (h) => `Max ${h}`,
  maxLargo: (h, z) => `Max’s time: ${h} (${z})`,
  cargando: 'Loading the calendar…',
  anuncioDia: (dia, n) => `${dia}, ${n}`,
  anuncioHora: (dia, hora) => `You picked ${dia} at ${hora}. Fill in your details.`,
  marcaEj: 'yourstore.com',
  mensajeEj: 'Your store and what you want to improve',
  errores: {
    nombre: 'Enter your name.',
    email: 'Check the email: the @ or the dot is missing.',
    consentimiento: 'Tick the box to book.',
  },
  datos: 'Your details',
  filas: { invitacion: 'Invite', videollamada: 'Video call' },
  otra: 'Book another call',
  nuevaPestana: '(opens in a new tab)',
  dejarMensaje: 'Leave a message',
  escribir: 'Or leave me a message',
  ocupadaTitulo: 'That time is gone',
}

const ja: Extras = {
  lede: '日付と時間を選んでください。Google カレンダーの招待に Meet のリンクが届きます。',
  ruta: { pasos: '予約の手順', raiz: 'agenda', dia: '日付', hora: '時間', datos: '情報', listo: '完了' },
  dias: '空きのある日',
  semana: {
    anterior: '前の週',
    siguiente: '次の週',
    de: (a, b) => `${a}から${b}までの週`,
  },
  horasLibres: (n) => `空き${n}枠`,
  sinHoras: '空きなし',
  horasDe: (dia) => `時間を選択、${dia}`,
  max: (h) => `Max ${h}`,
  maxLargo: (h, z) => `Maxの現地時間：${h}（${z}）`,
  cargando: '予約枠を読み込み中…',
  anuncioDia: (dia, n) => `${dia}、${n}`,
  anuncioHora: (dia, hora) => `${dia} ${hora} を選択しました。情報を入力してください。`,
  marcaEj: 'yourstore.com',
  mensajeEj: 'ストアと改善したいこと',
  errores: {
    nombre: 'お名前を入力してください。',
    email: 'メールアドレスをご確認ください。@ か . が足りません。',
    consentimiento: '予約するにはチェックボックスにチェックしてください。',
  },
  datos: 'ご入力内容',
  filas: { invitacion: '招待', videollamada: 'ビデオ通話' },
  otra: 'もう一件予約する',
  nuevaPestana: '（新しいタブで開きます）',
  dejarMensaje: 'メッセージを残す',
  escribir: 'またはメッセージを残す',
  ocupadaTitulo: 'その時間は埋まりました',
}

const EXTRAS: Record<Locale, Extras> = { es, en, ja }

/** Los textos comunes de la agenda más los de esta dirección, en el idioma activo. */
export function useCopiaDD() {
  const { locale } = useLanguage()
  return { ...useCopiaAgenda(), ...EXTRAS[locale] }
}

/** Solo lo que la página de contacto necesita fuera de la agenda (el título de la segunda vía). */
export function useEscribirDD() {
  const { locale } = useLanguage()
  return EXTRAS[locale].escribir
}
