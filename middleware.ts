// Vercel Routing Middleware: reparte a cada visitante nuevo de `/` entre los temas con la misma probabilidad, lo fija en
// una cookie y lo redirige al prefijo de su tema (`/plato`, `/apple`, …). Rastreadores y herramientas de auditoría van
// siempre al tema por defecto para que haya una página canónica estable. `?v=<tema>` fuerza un tema (y re-fija la cookie).
import { AB, asignar } from './ab.config'

export const config = { matcher: ['/'] }

const readCookie = (header: string, name: string) => {
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return decodeURIComponent(rest.join('='))
  }
  return undefined
}

export default function middleware(req: Request) {
  const url = new URL(req.url)
  const azar = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32
  const { id, fijar } = asignar(req.headers.get('user-agent') || '', url.searchParams.get('v'), readCookie(req.headers.get('cookie') || '', AB.cookie), azar)

  url.searchParams.delete('v')
  const headers = new Headers({ location: new URL(`/${id}${url.search}`, url).toString(), 'x-mf-variant': id, 'cache-control': 'no-store' })
  if (fijar) headers.append('set-cookie', `${AB.cookie}=${id}; Path=/; Max-Age=${AB.maxAge}; SameSite=Lax; Secure`)
  return new Response(null, { status: 307, headers })
}
