import { useEffect, useState } from 'react'

/** Hora de Medellín (America/Bogota) que cambia una vez por minuto: un setTimeout alineado al minuto, sin intervalos de 1 s. */
export function useMedellinTime(locale: string) {
  const fmt = () => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' }).format(new Date())
  const [hora, setHora] = useState(fmt)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const tick = () => {
      setHora(fmt())
      t = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50)
    }
    t = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])
  return hora
}
