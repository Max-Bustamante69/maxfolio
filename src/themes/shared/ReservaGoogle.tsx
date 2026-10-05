import { useLanguage, type Locale } from '../../context/LanguageContext'

// Respaldo de la agenda: la «agenda de citas» del Google Calendar de Max (20 min, L–V 9–17 h Bogotá, Meet), con el mismo calendario
// detrás. Cada tema la muestra en su marco cuando useAgenda queda en 'error' (api/agenda.ts sin credenciales o Google sin responder):
// así reservar nunca se rompe. Horario o formulario se cambian en Google Calendar → Páginas de reserva.

const INCRUSTADA = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3xl68OyYpREMQ9CsAX0rzyezbkiutugLbcgoHJ56RnR35gaExYHwHfR09_o0aiL0ZoAx4O0toS?gv=true'
const TITULO: Record<Locale, string> = { es: 'Agenda de Max en Google Calendar', en: "Max's Google Calendar booking page", ja: 'Google カレンダーの予約ページ' }

/** La página de reservas de Google en un iframe perezoso, sobre blanco (Google la dibuja en claro: sin destello mientras carga). */
export default function ReservaGoogle({ className }: { className?: string }) {
  const { locale } = useLanguage()
  return (
    <iframe
      src={`${INCRUSTADA}&hl=${locale}`}
      title={TITULO[locale]}
      loading="lazy"
      className={className}
      style={{ display: 'block', width: '100%', height: 'clamp(600px, 84svh, 780px)', border: 0, background: '#fff', colorScheme: 'light' }}
    />
  )
}
