// Obra: el índice completo con escenario fijo. Filtros por tipo (Todo · Tiendas · Productos · Más).
import { useState } from 'react'
import { SHOT_DATE, useV5, type Obra as ObraT } from '../data'
import { useCopy } from './copy'
import IndiceObra from './IndiceObra'
import { Pagina } from './Pagina'
import { Titulo } from './piezas'

type Filtro = 'todo' | 'tiendas' | 'productos' | 'mas'
const PASA: Record<Filtro, (o: ObraT) => boolean> = {
  todo: () => true,
  tiendas: (o) => o.kind === 'store',
  productos: (o) => o.kind === 'product',
  mas: (o) => o.kind === 'role' || o.kind === 'personal',
}

export default function Obra() {
  const c = useCopy()
  const { obras } = useV5()
  const [filtro, setFiltro] = useState<Filtro>('todo')
  const visibles = obras.filter(PASA[filtro])
  return (
    <Pagina titulo={`${c.obra.titulo} · ${c.marca}`}>
      <header className="dd-cabpag" data-fuera="">
        <Titulo as="h1" className="dd-display" lineas={[c.obra.titulo]} />
        <p className="dd-lede" data-in>{c.obra.lede}</p>
        <div className="dd-filtros" role="group" aria-label={c.obra.filtros} data-in>
          {(['todo', 'tiendas', 'productos', 'mas'] as const).map((f) => (
            <button key={f} type="button" className="dd-chip" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
              {c.obra[f]}
              <span className="dd-chip__n">{obras.filter(PASA[f]).length}</span>
            </button>
          ))}
        </div>
      </header>
      <div className="dd-seccion dd-seccion--indice">
        {visibles.length ? <IndiceObra key={filtro} obras={visibles} /> : <p className="dd-lede">{c.obra.vacio}</p>}
        <p className="dd-micro dd-nota-pie" data-in>{c.obra.fechaCapturas(SHOT_DATE)}</p>
      </div>
    </Pagina>
  )
}
