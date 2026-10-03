import { useState } from 'react'
import { config } from '../../config'
import { track } from '../../lib/track'
import * as registry from '../../data/registry'

// Contacto compacto de la v5 (research/DIRECCIONES.md contrato 11): misma ruta que ContactFormModal (Web3Forms con
// VITE_WEB3FORMS_KEY, nunca en el código; si falla, abre mailto:) y eventos sin datos personales.

export type Motivo = 'revision' | 'proyecto' | 'continuo' | 'empleo'
export const MOTIVOS: Record<Motivo, { es: string; en: string }> = {
  revision: { es: 'Revisión gratis de 20 minutos', en: 'Free 20-minute review' },
  proyecto: { es: 'Construir un proyecto', en: 'Build a project' },
  continuo: { es: 'Trabajo continuo', en: 'Ongoing work' },
  empleo: { es: 'Empleo', en: 'Hiring' },
}

/** Evento de la v5 (ledger propio: solo cuenta en el dominio real, nunca en localhost). Sin URL ni correo del visitante. */
export const evento = (dir: string, nombre: 'contact_open' | 'contact_submit' | 'contact_click' | 'obra_open', props: Record<string, string> = {}) =>
  track(nombre, { theme: dir, ...props })

export function useEnviarContacto(dir: string) {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')
  const enviar = async (d: { correo: string; tienda?: string; motivo: Motivo; mensaje?: string }) => {
    setEstado('enviando')
    const asunto = `${MOTIVOS[d.motivo].en} · via ${dir}`
    const cuerpo = [d.tienda && `Store: ${d.tienda}`, d.mensaje].filter(Boolean).join('\n\n')
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_key: config.web3formsKey, email: d.correo, subject: asunto, message: cuerpo || asunto, to: registry.personal.email, theme: dir, page: location.pathname }),
      })
      if (!(await r.json()).success) throw new Error('web3forms')
      setEstado('ok')
      evento(dir, 'contact_submit', { motivo: d.motivo })
    } catch {
      setEstado('error')
      window.location.href = `mailto:${registry.personal.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
    }
  }
  return { estado, enviar }
}

/** Copia el correo de Max con aviso para un role="status" y mailto: de respaldo. */
export function useCopiarCorreo(dir: string) {
  const [copiado, setCopiado] = useState(false)
  const copiar = async () => {
    evento(dir, 'contact_click', { canal: 'correo' })
    try {
      await navigator.clipboard.writeText(registry.personal.email)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2400)
    } catch {
      window.location.href = `mailto:${registry.personal.email}`
    }
  }
  return { copiar, copiado, correo: registry.personal.email }
}
