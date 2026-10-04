import { useLanguage, type Locale } from '../../context/LanguageContext'

// Rótulos propios del calendario de Tokonoma. Lo que ya dice la copia común de la agenda (useCopiaAgenda: título, duración, campos,
// consentimiento, estados y fallos) NO se repite aquí; esto es solo lo que la dirección añade con su voz: sobria, en frases cortas.
interface Textos {
  duracionL: string
  zonaL: string
  anterior: string
  siguiente: string
  cargando: string
  horasLibres: (n: number, dia: string) => string
  /** «hora de Max: 3:00 p. m.» (para el paréntesis de una hora cuando su zona difiere de la del visitante). */
  horaDeMax: (h: string) => string
  notaZona: (zonaMax: string) => string
  cuando: string
  dondeL: string
  paraL: string
  otra: string
  nombreFalta: string
  consentimientoFalta: string
}

const es: Textos = {
  duracionL: 'Duración',
  zonaL: 'Tu zona',
  anterior: 'Días anteriores',
  siguiente: 'Días siguientes',
  cargando: 'Cargando las horas libres',
  horasLibres: (n, d) => `${n} ${n === 1 ? 'hora libre' : 'horas libres'} el ${d}`,
  horaDeMax: (h) => `hora de Max: ${h}`,
  notaZona: (z) => `Entre paréntesis, la hora de Max (${z}).`,
  cuando: 'Cuándo',
  dondeL: 'Dónde',
  paraL: 'Invitación a',
  otra: 'Agendar otra llamada',
  nombreFalta: 'Escribe tu nombre.',
  consentimientoFalta: 'Acepta el aviso de privacidad para agendar.',
}

const en: Textos = {
  duracionL: 'Length',
  zonaL: 'Your zone',
  anterior: 'Earlier days',
  siguiente: 'Later days',
  cargando: 'Loading open times',
  horasLibres: (n, d) => `${n} ${n === 1 ? 'time' : 'times'} open on ${d}`,
  horaDeMax: (h) => `Max’s time: ${h}`,
  notaZona: (z) => `In parentheses, Max’s time (${z}).`,
  cuando: 'When',
  dondeL: 'Where',
  paraL: 'Invite sent to',
  otra: 'Book another call',
  nombreFalta: 'Enter your name.',
  consentimientoFalta: 'Accept the privacy notice to book.',
}

const ja: Textos = {
  duracionL: '所要時間',
  zonaL: 'タイムゾーン',
  anterior: '前の日付',
  siguiente: '次の日付',
  cargando: '空き時間を読み込み中',
  horasLibres: (n, d) => `${d}の空き時間は${n}件`,
  horaDeMax: (h) => `Maxの時間：${h}`,
  notaZona: (z) => `かっこ内はMaxの現地時間（${z}）です。`,
  cuando: '日時',
  dondeL: '場所',
  paraL: '招待の送信先',
  otra: '別の時間を予約',
  nombreFalta: 'お名前を入力してください。',
  consentimientoFalta: '予約にはプライバシー通知への同意が必要です。',
}

const TEXTOS: Record<Locale, Textos> = { es, en, ja }

export function useTextosAgenda(): Textos {
  const { locale } = useLanguage()
  return TEXTOS[locale] ?? en
}
