// Exercises api/agenda.ts against a fake Google (token, freeBusy, events.insert): real Request objects, real handler code, no network.
// Run with `bun scripts/test-agenda-api.mjs` (same reason as test-event-api.mjs: Bun resolves and type-strips the api/*.ts files).
import assert from 'node:assert/strict'

const llamadas = []
let ocupadoFalso = []
globalThis.fetch = async (url, init = {}) => {
  const u = String(url)
  const cuerpo = init.body ? (typeof init.body === 'string' ? JSON.parse(init.body) : Object.fromEntries(init.body)) : null
  llamadas.push({ u, cuerpo })
  const r = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })
  if (u === 'https://oauth2.googleapis.com/token') return r({ access_token: 'acceso', expires_in: 3600 })
  if (u.endsWith('/freeBusy')) return r({ calendars: { primary: { busy: ocupadoFalso } } })
  if (u.includes('/calendars/primary/events')) return r({ id: 'ev1', hangoutLink: 'https://meet.google.com/abc-defg-hij' })
  throw new Error(`fetch inesperado: ${u}`)
}

const { default: handler, rejilla, libres } = await import('../api/agenda.ts')
const pedir = (metodo, ruta, cuerpo, cab = {}) =>
  handler(new Request(`https://maxfolio.dev${ruta}`, { method: metodo, headers: { 'content-type': 'application/json', 'x-forwarded-for': `1.2.3.${Math.random()}`, ...cab }, body: cuerpo ? JSON.stringify(cuerpo) : undefined }))

// ---- La rejilla: lunes a viernes, 9:00–17:00 de Bogotá (UTC-5), cada 30 min, 4 h de aviso, 21 días vista.
const lunes = Date.parse('2026-10-05T05:00:00Z') // lunes 5 de octubre, 00:00 en Bogotá
const dia = rejilla(lunes, lunes + 86400_000 - 1, lunes - 86400_000)
assert.equal(dia.length, 16, '16 huecos en un día laborable (9:00 a 16:30)')
assert.equal(new Date(dia[0].inicio).toISOString(), '2026-10-05T14:00:00.000Z', 'el primero a las 9:00 de Bogotá')
assert.equal(new Date(dia.at(-1).inicio).toISOString(), '2026-10-05T21:30:00.000Z', 'el último a las 16:30 (termina 16:50)')
assert.equal(dia[0].fin - dia[0].inicio, 20 * 60_000, '20 minutos')
const sabado = Date.parse('2026-10-10T05:00:00Z')
assert.equal(rejilla(sabado, sabado + 2 * 86400_000 - 1, sabado - 86400_000).length, 0, 'sin huecos el fin de semana')
const ahora = Date.parse('2026-10-05T15:10:00Z') // 10:10 en Bogotá → el primero posible es 14:30 (4 h después)
assert.equal(new Date(rejilla(ahora, ahora + 86400_000, ahora)[0].inicio).toISOString(), '2026-10-05T19:30:00.000Z', 'respeta las 4 h de aviso')
assert.ok(rejilla(ahora, ahora + 60 * 86400_000, ahora).every((f) => f.inicio <= ahora + 21 * 86400_000), 'nunca más allá de 21 días')
assert.equal(libres(dia, [{ start: '2026-10-05T14:10:00Z', end: '2026-10-05T14:40:00Z' }]).length, 14, 'quita los que se cruzan con lo ocupado')

// ---- Sin credenciales: 503 (cada tema muestra la página de reservas de Google).
let res = await pedir('GET', '/api/agenda')
assert.equal(res.status, 503)

process.env.GOOGLE_AGENDA_CLIENT_ID = 'id'
process.env.GOOGLE_AGENDA_CLIENT_SECRET = 'secreto'
process.env.GOOGLE_AGENDA_REFRESH_TOKEN = 'refresco'

// ---- GET: huecos libres, con lo ocupado fuera.
const prox = rejilla(Date.now(), Date.now() + 21 * 86400_000, Date.now())
ocupadoFalso = [{ start: new Date(prox[0].inicio).toISOString(), end: new Date(prox[0].fin).toISOString() }]
res = await pedir('GET', '/api/agenda')
let j = await res.json()
assert.equal(res.status, 200)
assert.equal(j.timezone, 'America/Bogota')
assert.equal(j.slots.length, prox.length - 1, 'el hueco ocupado no se ofrece')
assert.ok(!j.slots.some((s) => s.startAt === new Date(prox[0].inicio).toISOString()))
assert.equal(llamadas.find((l) => l.u.endsWith('/freeBusy')).cuerpo.items[0].id, 'primary')

// ---- POST: validación, trampa, origen ajeno, ocupado y reserva real.
const valido = { inicio: new Date(prox[1].inicio).toISOString(), nombre: 'Ana Pérez', email: 'ana@tienda.com', marca: 'Tienda', consentimientoDatos: true, utmCampaign: 'plato' }
res = await pedir('POST', '/api/agenda', { ...valido, email: 'sin-arroba' })
assert.equal(res.status, 400, 'correo inválido')
res = await pedir('POST', '/api/agenda', { ...valido, consentimientoDatos: false })
assert.equal(res.status, 400, 'sin la casilla del aviso')
res = await pedir('POST', '/api/agenda', { ...valido, inicio: new Date(prox[1].inicio + 60_000).toISOString() })
assert.equal(res.status, 409, 'una hora que la rejilla no ofrece')
res = await pedir('POST', '/api/agenda', valido, { origin: 'https://otro-sitio.com' })
assert.equal(res.status, 403, 'otro origen')
llamadas.length = 0
res = await pedir('POST', '/api/agenda', { ...valido, sitio_web_hp: 'bot' })
assert.equal(res.status, 200)
assert.ok(!llamadas.some((l) => l.u.includes('/events')), 'la trampa no crea nada')
ocupadoFalso = [{ start: new Date(prox[1].inicio).toISOString(), end: new Date(prox[1].fin).toISOString() }]
res = await pedir('POST', '/api/agenda', valido, { origin: 'https://maxfolio.dev' })
assert.equal(res.status, 409, 'ocupada justo antes de reservar')
ocupadoFalso = []
llamadas.length = 0
res = await pedir('POST', '/api/agenda', valido, { origin: 'https://maxfolio.dev' })
j = await res.json()
assert.equal(res.status, 200)
assert.equal(j.meetingUrl, 'https://meet.google.com/abc-defg-hij')
const ev = llamadas.find((l) => l.u.includes('/events'))
assert.ok(ev.u.includes('conferenceDataVersion=1') && ev.u.includes('sendUpdates=all'), 'pide Meet y que Google envíe la invitación')
assert.equal(ev.cuerpo.attendees[0].email, 'ana@tienda.com')
assert.equal(ev.cuerpo.conferenceData.createRequest.conferenceSolutionKey.type, 'hangoutsMeet')
assert.equal(ev.cuerpo.start.dateTime, valido.inicio)
assert.match(ev.cuerpo.description, /Marca o tienda: Tienda/)

// ---- Límite: 5 reservas por IP y hora.
const ip = { 'x-forwarded-for': '9.9.9.9', origin: 'https://maxfolio.dev' }
const estados = []
for (let i = 0; i < 6; i++) estados.push((await pedir('POST', '/api/agenda', { ...valido, email: 'x' }, ip)).status)
assert.deepEqual(estados, [400, 400, 400, 400, 400, 429])

console.log('api/agenda.ts: ok')
