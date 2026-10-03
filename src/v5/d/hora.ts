import { useEffect, useState } from 'react'

/** Hora de Medellín en 24 h (America/Bogota) que cambia una vez por minuto, con un setTimeout alineado al minuto y nunca
 *  un intervalo de 1 s (idle-frame-budget Z-1). Es la de shared/useMedellinTime con hourCycle h23, que la dirección necesita. */
export function useHora(locale: string) {
  const fmt = () => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Bogota' }).format(new Date())
  const [hora, setHora] = useState(fmt)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const tick = () => {
      setHora(fmt())
      t = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50)
    }
    setHora(fmt())
    t = setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])
  return hora
}
