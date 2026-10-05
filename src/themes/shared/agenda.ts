import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage, type Locale } from '../../context/LanguageContext'
import { track } from '../../lib/track'

// Agenda de llamadas contra el Google Calendar de Max (la cuenta conectada como «agenda de reservas» en la Plataforma,
// app.digitdeck.co, módulo reservas de la v3). Los huecos son de 20 min, lunes a viernes, menos lo que Max tenga ocupado;
// reservar crea el evento con Meet y Google envía la invitación. Este archivo es el contrato: cada tema dibuja su
// propio calendario encima de useAgenda(). La API solo acepta por CORS https://(www.)maxfolio.dev.

const API = import.meta.env.DEV ? '/agenda-api' : 'https://app.digitdeck.co/api/reservas'
/** Aviso de datos que acepta quien reserva (lo exige la API: consentimientoDatos). */
export const PRIVACIDAD = 'https://app.digitdeck.co/privacy'
const DIAS_VISTA = 21

export interface Franja { inicio: string; fin: string }
export interface Dia {
  /** YYYY-MM-DD en la zona horaria del visitante. */
  clave: string
  fecha: Date
  franjas: Franja[]
}
export type Estado = 'cargando' | 'listo' | 'vacio' | 'error'
export type Fallo = 'ocupada' | 'datos' | 'limite' | 'red'
export interface DatosReserva {
  inicio: string
  nombre: string
  email: string
  marca?: string
  sitioWeb?: string
  mensaje?: string
  consentimiento: boolean
  /** Campo trampa: un input oculto que una persona deja vacío. */
  trampa?: string
}
export type Resultado = { ok: true; meet?: string } | { ok: false; fallo: Fallo; detalle?: string }

/** Zona horaria del visitante: los huecos se muestran en su hora local, con la de Max al lado si difiere. */
export const zonaVisitante = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
const claveDia = (iso: string, zona: string) => new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))

const BCP: Record<Locale, string> = { es: 'es-CO', en: 'en-US', ja: 'ja-JP' }
export const fmtHora = (iso: string, locale: Locale, zona = zonaVisitante()) =>
  new Intl.DateTimeFormat(BCP[locale], { timeZone: zona, hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
export const fmtDia = (fecha: Date, locale: Locale, opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }) =>
  new Intl.DateTimeFormat(BCP[locale], { timeZone: 'UTC', ...opciones }).format(fecha)

/**
 * Huecos libres de las próximas tres semanas agrupados por día local del visitante, duración real de la cita y
 * reservar(). Mide booking_open al montar (el calendario solo se monta cuando se ve), booking_slot al elegir una
 * franja y booking_submit al confirmar, todo con el tema.
 */
export function useAgenda(tema: string) {
  const [franjas, setFranjas] = useState<Franja[] | null>(null)
  const [estado, setEstado] = useState<Estado>('cargando')
  const [zonaMax, setZonaMax] = useState('America/Bogota')
  const zona = useMemo(zonaVisitante, [])

  const cargar = useCallback(async () => {
    setEstado('cargando')
    const desde = new Date()
    const hasta = new Date(desde.getTime() + DIAS_VISTA * 864e5)
    try {
      const r = await fetch(`${API}/huecos?desde=${desde.toISOString()}&hasta=${hasta.toISOString()}`)
      const j = (await r.json()) as { ok: boolean; timezone?: string; slots?: { startAt: string; endAt: string }[] }
      if (!j.ok || !j.slots) throw new Error('slots')
      if (j.timezone) setZonaMax(j.timezone)
      setFranjas(j.slots.map((s) => ({ inicio: s.startAt, fin: s.endAt })))
      setEstado(j.slots.length ? 'listo' : 'vacio')
    } catch {
      setEstado('error')
    }
  }, [])

  useEffect(() => {
    track('booking_open', { theme: tema })
    void cargar()
  }, [tema, cargar])

  const dias = useMemo<Dia[]>(() => {
    const porDia = new Map<string, Franja[]>()
    for (const f of franjas ?? []) {
      const k = claveDia(f.inicio, zona)
      porDia.set(k, [...(porDia.get(k) ?? []), f])
    }
    return [...porDia].map(([clave, fs]) => ({ clave, fecha: new Date(`${clave}T12:00:00Z`), franjas: fs }))
  }, [franjas, zona])

  const duracion = franjas?.[0] ? Math.round((Date.parse(franjas[0].fin) - Date.parse(franjas[0].inicio)) / 60000) : 30

  const reservar = useCallback(
    async (d: DatosReserva): Promise<Resultado> => {
      const q = new URLSearchParams(location.search)
      try {
        const r = await fetch(API, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            inicio: d.inicio,
            nombre: d.nombre,
            email: d.email,
            marca: d.marca || undefined,
            sitioWeb: d.sitioWeb || undefined,
            mensaje: d.mensaje || undefined,
            consentimientoDatos: d.consentimiento,
            sitio_web_hp: d.trampa ?? '',
            utmSource: q.get('utm_source') ?? 'maxfolio',
            utmMedium: q.get('utm_medium') ?? 'portafolio',
            utmCampaign: q.get('utm_campaign') ?? tema,
            paginaOrigen: `maxfolio.dev${location.pathname}`,
          }),
        })
        const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; meetingUrl?: string }
        if (r.ok && j.ok) {
          track('booking_submit', { theme: tema })
          setFranjas((fs) => fs?.filter((f) => f.inicio !== d.inicio) ?? null)
          return { ok: true, meet: j.meetingUrl }
        }
        if (r.status === 409) {
          void cargar()
          return { ok: false, fallo: 'ocupada' }
        }
        return { ok: false, fallo: r.status === 429 ? 'limite' : 'datos', detalle: j.error }
      } catch {
        return { ok: false, fallo: 'red' }
      }
    },
    [tema, cargar],
  )

  const elegir = useCallback(() => track('booking_slot', { theme: tema }), [tema])

  return { estado, dias, duracion, zona, zonaMax, recargar: cargar, reservar, elegir }
}

/** Textos comunes de la agenda en es/en/ja; cada tema los puede reescribir con su voz. */
export function useCopiaAgenda() {
  const { locale } = useLanguage()
  return COPIA[locale]
}

const COPIA = {
  es: {
    titulo: 'Agenda una llamada',
    duracion: (m: number) => `${m} min por videollamada`,
    zona: (z: string) => `Horas en tu zona (${z})`,
    sinHuecos: 'No hay huecos libres en las próximas tres semanas. Escríbeme y buscamos uno.',
    errorCarga: 'No pude cargar la agenda. Inténtalo de nuevo o escríbeme.',
    reintentar: 'Reintentar',
    elegirDia: 'Elige un día',
    elegirHora: 'Elige una hora',
    nombre: 'Nombre',
    email: 'Correo',
    marca: 'Marca o tienda (opcional)',
    sitio: 'Sitio web (opcional)',
    mensaje: '¿De qué quieres hablar? (opcional)',
    consentimiento: 'Acepto que Digitdeck use estos datos para agendar la llamada y contactarme, según su',
    aviso: 'aviso de privacidad',
    confirmar: 'Confirmar la llamada',
    enviando: 'Reservando…',
    listo: 'Listo, la llamada quedó agendada',
    listoDetalle: 'Te llega la invitación de Google Calendar a tu correo.',
    meet: 'Enlace de Google Meet',
    cambiar: 'Cambiar la hora',
    fallos: {
      ocupada: 'Alguien acaba de tomar esa hora. Elige otra.',
      datos: 'Revisa tu nombre, tu correo y la casilla del aviso.',
      limite: 'Demasiados intentos seguidos. Espera unos minutos.',
      red: 'No hubo conexión. Inténtalo de nuevo.',
    },
  },
  en: {
    titulo: 'Book a call',
    duracion: (m: number) => `${m} min video call`,
    zona: (z: string) => `Times in your time zone (${z})`,
    sinHuecos: 'No open slots in the next three weeks. Write to me and we will find one.',
    errorCarga: "Couldn't load the calendar. Try again or write to me.",
    reintentar: 'Try again',
    elegirDia: 'Pick a day',
    elegirHora: 'Pick a time',
    nombre: 'Name',
    email: 'Email',
    marca: 'Brand or store (optional)',
    sitio: 'Website (optional)',
    mensaje: 'What would you like to talk about? (optional)',
    consentimiento: 'I agree that Digitdeck may use this data to book the call and contact me, under its',
    aviso: 'privacy notice',
    confirmar: 'Confirm the call',
    enviando: 'Booking…',
    listo: 'Done, the call is booked',
    listoDetalle: 'A Google Calendar invite is on its way to your inbox.',
    meet: 'Google Meet link',
    cambiar: 'Change the time',
    fallos: {
      ocupada: 'Someone just took that time. Pick another one.',
      datos: 'Check your name, your email and the notice checkbox.',
      limite: 'Too many attempts in a row. Wait a few minutes.',
      red: 'No connection. Try again.',
    },
  },
  ja: {
    titulo: '通話を予約',
    duracion: (m: number) => `${m}分のビデオ通話`,
    zona: (z: string) => `お住まいのタイムゾーンで表示 (${z})`,
    sinHuecos: '今後3週間に空き枠がありません。メッセージをいただければ調整します。',
    errorCarga: '予約枠を読み込めませんでした。もう一度お試しいただくか、メッセージをお送りください。',
    reintentar: '再試行',
    elegirDia: '日付を選択',
    elegirHora: '時間を選択',
    nombre: 'お名前',
    email: 'メールアドレス',
    marca: 'ブランド・ストア名（任意）',
    sitio: 'ウェブサイト（任意）',
    mensaje: 'ご相談内容（任意）',
    consentimiento: '通話の予約と連絡のために、Digitdeckが以下に従ってこの情報を使用することに同意します：',
    aviso: 'プライバシー通知',
    confirmar: '予約を確定',
    enviando: '予約中…',
    listo: '予約が完了しました',
    listoDetalle: 'Google カレンダーの招待がメールに届きます。',
    meet: 'Google Meet のリンク',
    cambiar: '時間を変更',
    fallos: {
      ocupada: 'その時間はちょうど埋まりました。別の時間をお選びください。',
      datos: 'お名前、メールアドレス、同意のチェックをご確認ください。',
      limite: '試行回数が多すぎます。数分お待ちください。',
      red: '接続できませんでした。もう一度お試しください。',
    },
  },
}
