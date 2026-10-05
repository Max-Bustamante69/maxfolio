// Agenda de llamadas de maxfolio.dev contra el Google Calendar de Max, sin nadie en medio: esta función pide a la API de Google Calendar
// lo ocupado y crea la cita con Meet; Google envía la invitación y el recordatorio. La verdad es el calendario (no hay tabla propia).
//   GET  /api/agenda?desde=<iso>&hasta=<iso>  → { ok, timezone, duracion, slots: [{ startAt, endAt }] }
//   POST /api/agenda { inicio, nombre, email, … } → { ok, meetingUrl } | 400 datos · 409 ocupada · 429 límite · 5xx sin agenda
// Credenciales en Vercel (Settings → Environment Variables): GOOGLE_AGENDA_CLIENT_ID, GOOGLE_AGENDA_CLIENT_SECRET y
// GOOGLE_AGENDA_REFRESH_TOKEN (scripts/agenda-google-token.mjs lo saca una vez). Sin ellas responde 503 y cada tema muestra la página
// de reservas de Google en su marco (src/themes/shared/ReservaGoogle.tsx).
export const config = { runtime: 'edge' }
import { json, pipeline } from './_kv'

const ZONA = 'America/Bogota'
// ponytail: Colombia no tiene horario de verano, así que el desfase es fijo; si la agenda se abre a otra zona, pasar a Intl.
const DESFASE_H = 5
const DURACION_MIN = 20
const PASO_MIN = 30 // un hueco cada media hora: 20 de llamada y 10 de margen
const DESDE_H = 9
const HASTA_H = 17
const AVISO_MIN_MS = 4 * 3600_000 // no se reserva con menos de 4 horas de antelación
const DIAS = 21
const DIA_MS = 86400_000

export interface Franja { inicio: number; fin: number }

/** Huecos candidatos (lunes a viernes, 9:00–17:00 de Bogotá) entre `desde` y `hasta`, con el aviso mínimo y a 21 días vista. */
export function rejilla(desde: number, hasta: number, ahora: number): Franja[] {
  const tope = Math.min(hasta, ahora + DIAS * DIA_MS)
  const minimo = Math.max(desde, ahora + AVISO_MIN_MS)
  const out: Franja[] = []
  const d0 = new Date(minimo - DESFASE_H * 3600_000) // día local de Bogotá del primer instante
  for (let dia = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), d0.getUTCDate()); dia <= tope; dia += DIA_MS) {
    const semana = new Date(dia).getUTCDay()
    if (semana === 0 || semana === 6) continue
    for (let m = DESDE_H * 60; m + DURACION_MIN <= HASTA_H * 60; m += PASO_MIN) {
      const inicio = dia + (m + DESFASE_H * 60) * 60_000
      if (inicio >= minimo && inicio <= tope) out.push({ inicio, fin: inicio + DURACION_MIN * 60_000 })
    }
  }
  return out
}

/** Quita los huecos que se cruzan con algo ocupado. */
export const libres = (franjas: Franja[], ocupado: { start: string; end: string }[]) =>
  franjas.filter((f) => !ocupado.some((o) => Date.parse(o.start) < f.fin && Date.parse(o.end) > f.inicio))

/* ------------------------------------------------------------------ Google */

class SinAgenda extends Error {}
let acceso: { token: string; vence: number } | null = null

/** Token de acceso a partir del permiso permanente de Max (se renueva solo, ~1 h de vida). */
async function token() {
  const { GOOGLE_AGENDA_CLIENT_ID: id, GOOGLE_AGENDA_CLIENT_SECRET: secreto, GOOGLE_AGENDA_REFRESH_TOKEN: refresco } = process.env
  if (!id || !secreto || !refresco) throw new SinAgenda('sin credenciales')
  if (acceso && acceso.vence > Date.now() + 60_000) return acceso.token
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: secreto, refresh_token: refresco, grant_type: 'refresh_token' }),
  })
  if (!r.ok) throw new SinAgenda(`token ${r.status} ${await r.text()}`)
  const j = (await r.json()) as { access_token: string; expires_in: number }
  acceso = { token: j.access_token, vence: Date.now() + j.expires_in * 1000 }
  return acceso.token
}

async function google<T>(ruta: string, cuerpo: unknown): Promise<T> {
  const r = await fetch(`https://www.googleapis.com/calendar/v3${ruta}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${await token()}`, 'content-type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  if (!r.ok) throw new SinAgenda(`google ${ruta} ${r.status} ${await r.text()}`)
  return (await r.json()) as T
}

async function ocupado(desde: number, hasta: number) {
  const j = await google<{ calendars: { primary?: { busy?: { start: string; end: string }[]; errors?: unknown[] } } }>('/freeBusy', {
    timeMin: new Date(desde).toISOString(),
    timeMax: new Date(hasta).toISOString(),
    items: [{ id: 'primary' }],
  })
  if (j.calendars.primary?.errors?.length) throw new SinAgenda(`freeBusy ${JSON.stringify(j.calendars.primary.errors)}`)
  return j.calendars.primary?.busy ?? []
}

/* ------------------------------------------------------------------ límites y validación */

// Límite por IP: con KV (Upstash) vale para todas las instancias; sin él, en la memoria de cada una.
// ponytail: sin KV el límite es por instancia de Edge; al añadir Upstash al proyecto pasa a ser global sin tocar nada.
const memoria = new Map<string, number[]>()
async function dentroDelLimite(clave: string, max: number, ventanaS: number) {
  try {
    const r = await pipeline([['INCR', `ag:${clave}`], ['EXPIRE', `ag:${clave}`, ventanaS, 'NX']])
    if (r) return Number(r[0]?.result) <= max
  } catch { /* KV caído: se cae al límite en memoria */ }
  const ahora = Date.now()
  const recientes = (memoria.get(clave) ?? []).filter((t) => ahora - t < ventanaS * 1000)
  recientes.push(ahora)
  memoria.set(clave, recientes)
  return recientes.length <= max
}

const texto = (v: unknown, max: number) => (typeof v === 'string' && v.trim() && v.length <= max ? v.trim() : undefined)
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ------------------------------------------------------------------ rutas */

async function huecos(url: URL) {
  const ahora = Date.now()
  const desde = Date.parse(url.searchParams.get('desde') ?? '') || ahora
  const hasta = Date.parse(url.searchParams.get('hasta') ?? '') || ahora + DIAS * DIA_MS
  const candidatos = rejilla(desde, hasta, ahora)
  const busy = candidatos.length ? await ocupado(candidatos[0].inicio, candidatos[candidatos.length - 1].fin) : []
  const slots = libres(candidatos, busy).map((f) => ({ startAt: new Date(f.inicio).toISOString(), endAt: new Date(f.fin).toISOString() }))
  return json({ ok: true, timezone: ZONA, duracion: DURACION_MIN, slots })
}

async function reservar(b: Record<string, unknown>) {
  if (b.sitio_web_hp) return json({ ok: true }) // campo trampa: una persona lo deja vacío
  const nombre = texto(b.nombre, 120)
  const email = texto(b.email, 200)
  const inicio = typeof b.inicio === 'string' ? Date.parse(b.inicio) : NaN
  if (!nombre || nombre.length < 2 || !email || !CORREO.test(email) || b.consentimientoDatos !== true || Number.isNaN(inicio)) {
    return json({ ok: false, error: 'Revisa tu nombre, tu correo y la casilla del aviso.' }, 400)
  }
  // Solo se acepta un inicio que la rejilla habría ofrecido (nada de horas sueltas ni fuera de horario), y libre en este momento.
  // ponytail: dos reservas a la vez sobre la misma franja pueden pasar ambas la comprobación; con el tráfico de un portafolio no compensa un candado.
  const franja = rejilla(inicio, inicio, Date.now()).find((f) => f.inicio === inicio)
  if (!franja || (await ocupado(franja.inicio, franja.fin)).length) return json({ ok: false, error: 'Esa franja ya no está disponible.' }, 409)
  const marca = texto(b.marca, 200)
  const sitio = texto(b.sitioWeb, 300)
  const mensaje = texto(b.mensaje, 2000)
  const origen = [b.utmSource, b.utmMedium, b.utmCampaign].map((v) => texto(v, 120)).filter(Boolean)
  const descripcion = [
    `Reserva desde ${texto(b.paginaOrigen, 300) ?? 'maxfolio.dev'}`,
    marca && `Marca o tienda: ${marca}`,
    sitio && `Sitio: ${sitio}`,
    mensaje && `\n${mensaje}`,
    origen.length && `\nOrigen: ${origen.join(' / ')}`,
    `\nAceptó el aviso de datos el ${new Date().toISOString()}.`,
  ].filter(Boolean)
  const evento = await google<{ hangoutLink?: string }>('/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all', {
    summary: `Revisión de tienda · ${nombre}`,
    description: descripcion.join('\n'),
    start: { dateTime: new Date(franja.inicio).toISOString(), timeZone: ZONA },
    end: { dateTime: new Date(franja.fin).toISOString(), timeZone: ZONA },
    attendees: [{ email, displayName: nombre }],
    conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
  })
  return json({ ok: true, meetingUrl: evento.hangoutLink })
}

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '?'
  try {
    if (req.method === 'GET') {
      if (!(await dentroDelLimite(`h:${ip}`, 30, 60))) return json({ ok: false, error: 'Demasiadas solicitudes.' }, 429)
      return await huecos(url)
    }
    if (req.method === 'POST') {
      // Solo desde el propio sitio: un formulario en otra página no puede llenar la agenda de Max.
      const origen = req.headers.get('origin')
      if (origen && new URL(origen).host !== url.host) return json({ ok: false, error: 'Origen no permitido.' }, 403)
      if (!(await dentroDelLimite(`r:${ip}`, 5, 3600))) return json({ ok: false, error: 'Demasiados intentos. Espera unos minutos.' }, 429)
      const cuerpo = (await req.json().catch(() => null)) as Record<string, unknown> | null
      if (!cuerpo || typeof cuerpo !== 'object') return json({ ok: false, error: 'Revisa tu nombre, tu correo y la casilla del aviso.' }, 400)
      return await reservar(cuerpo)
    }
    return json({ ok: false, error: 'Método no permitido.' }, 405)
  } catch (e) {
    if (e instanceof SinAgenda) {
      console.error('agenda:', e.message)
      return json({ ok: false, error: 'La agenda no está disponible ahora.' }, e.message === 'sin credenciales' ? 503 : 502)
    }
    throw e
  }
}
