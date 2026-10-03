// Panel privado del reparto entre temas: lee `GET /api/event` (con STATS_TOKEN) y compara, tema por tema, vistas →
// interacción → apertura de obra → contacto, más de qué tema a cuál se cambia la gente. Sin enlace desde ninguna página,
// `noindex` y fuera de sitemap.xml. La taxonomía vive en api/event.ts; las visitas por ruta, en Vercel Web Analytics.
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { THEMES, type ThemeId } from '../../ab.config'

type Totales = Record<string, number>
interface Respuesta { configured: boolean; days?: string[]; totals?: Totales; daily?: Record<string, Totales> }

const CLAVE = 'mf-stats-token'
const leer = () => { try { return sessionStorage.getItem(CLAVE) ?? '' } catch { return '' } }
const guardar = (t: string) => { try { t ? sessionStorage.setItem(CLAVE, t) : sessionStorage.removeItem(CLAVE) } catch { /* ventana privada */ } }

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10} %` : '—')
const porPrefijo = (t: Totales, prefijo: string) =>
  Object.entries(t).filter(([k]) => k.startsWith(prefijo)).map(([k, v]) => ({ k: k.slice(prefijo.length), v })).sort((a, b) => b.v - a.v)

function Linea({ valores }: { valores: number[] }) {
  const w = 160, h = 32, max = Math.max(1, ...valores), n = valores.length
  const d = valores.map((v, i) => `${i ? 'L' : 'M'}${((i / Math.max(1, n - 1)) * w).toFixed(1)},${(h - (v / max) * (h - 4) - 2).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-40" preserveAspectRatio="none" role="img" aria-label={`${valores.reduce((a, b) => a + b, 0)} vistas en ${n} días`}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  )
}

export default function Stats() {
  const [token, setToken] = useState(leer)
  const [borrador, setBorrador] = useState('')
  const [datos, setDatos] = useState<Respuesta | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    let vivo = true
    fetch(`/api/event?token=${encodeURIComponent(token)}`)
      .then((r) => (r.status === 401 ? Promise.reject(new Error('Token incorrecto')) : r.json()))
      .then((j: Respuesta) => vivo && (setDatos(j), setError('')))
      .catch((e: Error) => { if (vivo) { setError(e.message); setDatos(null); guardar(''); setToken('') } })
    return () => { vivo = false }
  }, [token])

  const filas = useMemo(() => {
    const t = datos?.totals ?? {}
    return THEMES.map((id: ThemeId) => {
      const vistas = t[`theme_view:${id}`] ?? 0
      const salidas = porPrefijo(t, `theme_switch:${id}>`).reduce((a, b) => a + b.v, 0)
      return {
        id, vistas,
        interaccion: t[`theme_engaged:${id}`] ?? 0,
        obras: t[`obra_open:${id}`] ?? 0,
        abreContacto: t[`contact_open:${id}`] ?? 0,
        clicContacto: t[`contact_click:${id}`] ?? 0,
        envios: t[`contact_submit:${id}`] ?? 0,
        agendas: t[`booking_submit:${id}`] ?? 0,
        llegan: t[`theme_switch:${id}`] ?? 0,
        salidas,
        dias: (datos?.days ?? []).map((d) => datos?.daily?.[d]?.[`theme_view:${id}`] ?? 0),
      }
    }).sort((a, b) => b.vistas - a.vistas)
  }, [datos])

  const entrar = (e: FormEvent) => { e.preventDefault(); guardar(borrador.trim()); setToken(borrador.trim()) }
  const t = datos?.totals ?? {}

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-4 py-10 text-[#16181b] sm:px-8">
      <title>Stats · maxfolio</title>
      <meta name="robots" content="noindex, nofollow" />
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight">Reparto entre temas</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#5b6168]">
          Cada visitante nuevo de maxfolio.dev cae en uno de los {THEMES.length} temas con la misma probabilidad y se queda en él 90 días. Aquí se compara qué hace en cada uno.
          Las visitas por ruta (/plato, /apple…) también salen en Vercel Web Analytics.
        </p>

        {!token && (
          <form onSubmit={entrar} className="mt-8 flex max-w-md gap-2">
            <label className="sr-only" htmlFor="tk">Token</label>
            <input id="tk" type="password" value={borrador} onChange={(e) => setBorrador(e.target.value)} placeholder="STATS_TOKEN" className="h-11 flex-1 rounded-lg border border-[#d5d9de] bg-white px-3 text-sm" />
            <button className="h-11 rounded-lg bg-[#16181b] px-4 text-sm font-medium text-white">Ver</button>
          </form>
        )}
        {error && <p className="mt-4 text-sm text-[#b42318]" role="alert">{error}</p>}
        {datos && !datos.configured && (
          <p className="mt-8 rounded-lg border border-[#d5d9de] bg-white p-4 text-sm">
            El registro de eventos no tiene base de datos todavía: falta añadir Upstash Redis (KV) al proyecto en Vercel. Hasta entonces solo cuentan las visitas de Vercel Web Analytics.
          </p>
        )}

        {datos?.configured && (
          <>
            <div className="mt-8 overflow-x-auto rounded-xl border border-[#d5d9de] bg-white">
              <table className="w-full min-w-[960px] text-left text-sm tabular-nums">
                <thead className="border-b border-[#e3e6ea] text-xs uppercase tracking-wide text-[#5b6168]">
                  <tr>
                    {['Tema', 'Vistas', 'Interacción', 'Abren obra', 'Abren contacto', 'Clic a un canal', 'Envían', 'Agendan', 'Llegan por cambio', 'Se van a otro', '30 días'].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.map((f) => (
                    <tr key={f.id} className="border-b border-[#eef0f2] last:border-0">
                      <th scope="row" className="px-4 py-3 font-semibold">/{f.id}</th>
                      <td className="px-4 py-3">{f.vistas}</td>
                      <td className="px-4 py-3">{f.interaccion} <span className="text-[#5b6168]">· {pct(f.interaccion, f.vistas)}</span></td>
                      <td className="px-4 py-3">{f.obras}</td>
                      <td className="px-4 py-3">{f.abreContacto}</td>
                      <td className="px-4 py-3">{f.clicContacto} <span className="text-[#5b6168]">· {pct(f.clicContacto, f.vistas)}</span></td>
                      <td className="px-4 py-3">{f.envios} <span className="text-[#5b6168]">· {pct(f.envios, f.vistas)}</span></td>
                      <td className="px-4 py-3">{f.agendas} <span className="text-[#5b6168]">· {pct(f.agendas, f.vistas)}</span></td>
                      <td className="px-4 py-3">{f.llegan}</td>
                      <td className="px-4 py-3">{f.salidas} <span className="text-[#5b6168]">· {pct(f.salidas, f.vistas)}</span></td>
                      <td className="px-4 py-3 text-[#16181b]"><Linea valores={f.dias} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[#5b6168]">
              Interacción = la mitad de la página recorrida o 30 s visibles con algún gesto, una vez por carga. Los porcentajes son sobre las vistas del tema.
              Con pocas visitas por tema las diferencias son ruido: compara cuando cada tema pase de unos cientos de vistas.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { titulo: 'Cambios de tema (de → a)', items: porPrefijo(t, 'theme_switch:').filter((x) => x.k.includes('>')).map((x) => ({ ...x, k: x.k.replace('>', ' → ') })) },
                { titulo: 'Obras más abiertas', items: porPrefijo(t, 'obra_open:slug:') },
                { titulo: 'Canales de contacto', items: porPrefijo(t, 'contact_click:canal:') },
              ].map((b) => (
                <section key={b.titulo} className="rounded-xl border border-[#d5d9de] bg-white p-4">
                  <h2 className="text-sm font-semibold">{b.titulo}</h2>
                  {b.items.length ? (
                    <ol className="mt-3 space-y-1.5 text-sm tabular-nums">
                      {b.items.slice(0, 12).map((x) => (
                        <li key={x.k} className="flex justify-between gap-3"><span className="truncate">{x.k}</span><span>{x.v}</span></li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-3 text-sm text-[#5b6168]">Sin datos todavía.</p>
                  )}
                </section>
              ))}
            </div>
            <button onClick={() => { guardar(''); setToken(''); setDatos(null) }} className="mt-8 text-sm text-[#5b6168] underline">Salir</button>
          </>
        )}
      </div>
    </main>
  )
}
