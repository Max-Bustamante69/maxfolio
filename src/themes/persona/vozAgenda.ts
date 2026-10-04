import type { Locale } from '../../context/LanguageContext'
import type { useCopiaAgenda } from '../shared/agenda'

// Voz de Persona para la agenda: textos propios del calendario de juego (es/en/ja) encima de los comunes de
// shared/agenda.ts. Lo que aquí no se reescribe (fallos, consentimiento, enlace de Meet…) se hereda tal cual.
type Base = ReturnType<typeof useCopiaAgenda>

interface Voz {
  cargando: string
  pista: string
  libres: (n: number) => string
  horasDe: (n: number, dia: string) => string
  tomate: string
  sello: string
  datosTitulo: string
  otra: string
  escribirme: string
  errNombre: string
  errCorreo: string
  errAviso: string
  agendada: (dia: string, hora: string) => string
  ticket: string
}

const VOZ: Record<Locale, Voz> = {
  es: {
    cargando: 'Cargando huecos',
    pista: 'Cuando elijas un día, aquí salen sus horas.',
    libres: (n) => (n === 1 ? '1 hora libre' : `${n} horas libres`),
    horasDe: (n, dia) => `${n === 1 ? '1 hora libre' : `${n} horas libres`} el ${dia}`,
    tomate: 'Tómate tu tiempo',
    sello: 'Llamada agendada',
    datosTitulo: 'Tus datos',
    otra: 'Agendar otra',
    escribirme: 'Escribirme un mensaje',
    errNombre: 'Escribe tu nombre.',
    errCorreo: 'Escribe un correo válido, como tu@correo.com.',
    errAviso: 'Marca la casilla para continuar.',
    agendada: (dia, hora) => `Llamada agendada para ${dia} a las ${hora}`,
    ticket: 'Tu llamada',
  },
  en: {
    cargando: 'Loading open slots',
    pista: 'Pick a day and its times show up here.',
    libres: (n) => (n === 1 ? '1 open time' : `${n} open times`),
    horasDe: (n, dia) => `${n === 1 ? '1 open time' : `${n} open times`} on ${dia}`,
    tomate: 'Take your time',
    sello: 'Call booked',
    datosTitulo: 'Your details',
    otra: 'Book another',
    escribirme: 'Send me a message',
    errNombre: 'Enter your name.',
    errCorreo: 'Enter a valid email, like you@email.com.',
    errAviso: 'Tick the box to continue.',
    agendada: (dia, hora) => `Call booked for ${dia} at ${hora}`,
    ticket: 'Your call',
  },
  ja: {
    cargando: '空き枠を読み込み中',
    pista: '日付を選ぶと、ここに時間が表示されます。',
    libres: (n) => `空き${n}枠`,
    horasDe: (n, dia) => `${dia}の空き${n}枠`,
    tomate: 'ゆっくりどうぞ',
    sello: '予約完了',
    datosTitulo: 'お客様の情報',
    otra: 'もう一件予約',
    escribirme: 'メッセージを送る',
    errNombre: 'お名前を入力してください。',
    errCorreo: '有効なメールアドレスを入力してください。',
    errAviso: '続けるにはチェックを入れてください。',
    agendada: (dia, hora) => `${dia} ${hora} に予約しました`,
    ticket: 'あなたの通話',
  },
}

export const vozAgenda = (locale: Locale, base: Base) => ({ ...base, ...VOZ[locale] })
