// Una sola vez: saca el permiso permanente (refresh token) de tu Google Calendar para la agenda de maxfolio.dev (api/agenda.ts) y lo
// guarda en Vercel, sin que el token pase por ningún chat ni archivo.
//   node scripts/agenda-google-token.mjs <CLIENT_ID> <CLIENT_SECRET>
// El cliente OAuth es de tipo «App de escritorio» en Google Cloud (acepta 127.0.0.1 sin registrarlo). Se abre Google en el navegador,
// autorizas con maxbustamanteg@gmail.com y el script escribe GOOGLE_AGENDA_CLIENT_ID, GOOGLE_AGENDA_CLIENT_SECRET y
// GOOGLE_AGENDA_REFRESH_TOKEN en Vercel (producción y vistas previas) con la CLI ya autenticada. Si la CLI falla, imprime los valores
// para pegarlos a mano en Vercel → max-folio → Settings → Environment Variables.
import { createServer } from 'node:http'
import { exec, spawnSync } from 'node:child_process'

const [id, secreto] = process.argv.slice(2)
if (!id || !secreto) {
  console.error('uso: node scripts/agenda-google-token.mjs <CLIENT_ID> <CLIENT_SECRET>')
  process.exit(2)
}
// Solo ver la disponibilidad (no lee tus eventos) y crear o editar los eventos de las citas.
const SCOPES = ['https://www.googleapis.com/auth/calendar.freebusy', 'https://www.googleapis.com/auth/calendar.events']
const PUERTO = 53682
const vuelta = `http://127.0.0.1:${PUERTO}`
const url = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: id,
  redirect_uri: vuelta,
  response_type: 'code',
  scope: SCOPES.join(' '),
  access_type: 'offline',
  prompt: 'consent', // fuerza a Google a devolver el refresh token aunque ya hubieras autorizado antes
  login_hint: 'maxbustamanteg@gmail.com',
})}`

const codigo = await new Promise((resolver, fallar) => {
  const servidor = createServer((req, res) => {
    const q = new URL(req.url, vuelta).searchParams
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(q.get('code') ? '<p style="font:16px system-ui">Listo. Ya puedes cerrar esta pestaña y volver a la terminal.</p>' : `<p>Google respondió: ${q.get('error')}</p>`)
    servidor.close()
    q.get('code') ? resolver(q.get('code')) : fallar(new Error(`Google respondió: ${q.get('error')}`))
  }).listen(PUERTO, '127.0.0.1', () => {
    console.log('Abriendo Google… si no se abre, pega esto en el navegador:\n' + url + '\n')
    exec(process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`)
  })
})

const r = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ code: codigo, client_id: id, client_secret: secreto, redirect_uri: vuelta, grant_type: 'authorization_code' }),
})
const j = await r.json()
if (!j.refresh_token) {
  console.error('Google no devolvió el permiso permanente:', j)
  process.exit(1)
}
const faltan = SCOPES.filter((s) => !j.scope?.split(' ').includes(s))
if (faltan.length) console.warn('Ojo: no se concedieron', faltan.join(', '), '— vuelve a correr el script y marca todas las casillas.')

// Proyecto max-folio en Vercel (ids públicos del enlace .vercel/project.json): así la CLI no necesita estar en la carpeta enlazada.
const entorno = { ...process.env, VERCEL_ORG_ID: 'team_l5q3LDPFS4qTeuiAlWMwAl50', VERCEL_PROJECT_ID: 'prj_TTef6usP9qKWxHqryqPtUEfgF3JV' }
const valores = { GOOGLE_AGENDA_CLIENT_ID: id, GOOGLE_AGENDA_CLIENT_SECRET: secreto, GOOGLE_AGENDA_REFRESH_TOKEN: j.refresh_token }
let fallos = 0
for (const [nombre, valor] of Object.entries(valores)) {
  for (const destino of ['production', 'preview']) {
    spawnSync('vercel', ['env', 'rm', nombre, destino, '--yes'], { env: entorno, shell: true, stdio: 'ignore' })
    const p = spawnSync('vercel', ['env', 'add', nombre, destino], { env: entorno, shell: true, input: valor, encoding: 'utf8' })
    const ok = p.status === 0
    if (!ok) fallos++
    console.log(`${ok ? '✓' : '✗'} ${nombre} → ${destino}${ok ? '' : `\n${p.stderr || p.stdout}`}`)
  }
}
if (fallos) {
  console.log('\nLa CLI no pudo guardar todo. Pega estos valores en Vercel → max-folio → Settings → Environment Variables (Production y Preview):')
  for (const [nombre, valor] of Object.entries(valores)) console.log(`${nombre}=${valor}`)
} else {
  console.log('\nGuardado en Vercel. Avísale a Claude para que vuelva a desplegar y pruebe la agenda.')
}
