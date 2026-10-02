import { Link } from 'react-router-dom'
import { v5path, type DirectionMeta } from './data'

// Índice privado de las direcciones (sin enlace desde el sitio): una fila por dirección con sus cinco vistas.
const metas = Object.values(import.meta.glob<{ default: DirectionMeta }>('./*/meta.ts', { eager: true }))
  .map((m) => m.default)
  .sort((a, b) => a.id.localeCompare(b.id))

const VIEWS = [
  ['', 'Inicio'],
  ['obra', 'Obra'],
  ['obra/nos-cafe', 'Ficha'],
  ['trayectoria', 'Trayectoria'],
  ['contacto', 'Contacto'],
] as const

export default function Hub() {
  return (
    <main className="v5-root min-h-screen px-4 py-16 md:px-12">
      <meta name="robots" content="noindex" />
      <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Portafolio v5 · direcciones</h1>
      <p className="v5-quiet mt-3 max-w-xl">Prototipos para elegir. Misma paleta y mismo contenido real; cambia la mecánica.</p>
      <ol className="mt-12 divide-y divide-[var(--v5-line)] border-y border-[var(--v5-line)]">
        {metas.map((m) => (
          <li key={m.id} className="grid gap-3 py-6 md:grid-cols-[4rem_1fr_auto] md:items-baseline">
            <span className="font-mono text-sm uppercase">{m.id}</span>
            <div>
              <h2 className="text-xl font-semibold">{m.nombre}</h2>
              <p className="v5-quiet mt-1 max-w-2xl">{m.idea}</p>
            </div>
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {VIEWS.map(([path, label]) => (
                <Link key={path} className="underline underline-offset-4" to={`${v5path(m.id)}${path ? `/${path}` : ''}`}>
                  {label}
                </Link>
              ))}
            </nav>
          </li>
        ))}
      </ol>
    </main>
  )
}
