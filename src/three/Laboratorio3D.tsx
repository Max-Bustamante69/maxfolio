import { useState, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { DISPOSITIVOS, FEATURES } from './catalogo'
import { useEscena3d } from './estado3d'
import { Pieza3D } from './Pieza3D'
import type { Pieza3DProps, SkinId } from './tipos'
import datos from './piezas/camaras/orbita-tiendas.datos.json'

/**
 * `?3d=1&lab`: laboratorio oculto (ni enlace, ni sitemap) con las 5 piezas y todas sus variantes, cada una con su
 * póster de Cycles a la izquierda y la gemela en tiempo real a la derecha, en la misma caja y con la misma pose.
 * Sirve para verificar la paridad póster/3D, el frameloop "demand", el reparto de un solo Canvas entre muchas
 * vistas y los interruptores (`interactiva`, `animar`, `progreso`). Solo estilos en línea: nada de Tailwind aquí,
 * para no añadir utilidades al CSS del sitio.
 */
const SKINS: SkinId[] = ['apple', 'luxury', 'brutalist', 'neo', 'persona', 'terminal']

interface Item {
  titulo: string
  nota?: string
  props: Pieza3DProps
}

const GRUPOS: { titulo: string; items: Item[] }[] = [
  {
    titulo: 'p1 · Monograma MB (acento por skin)',
    items: SKINS.map((acento) => ({
      titulo: `monograma-mb · ${acento}`,
      nota: acento === 'apple' || acento === 'luxury' ? 'póster de Cycles' : 'póster derivado del de apple (punto recoloreado)',
      props: { slug: 'monograma-mb', acento },
    })),
  },
  { titulo: 'p2 · Órbita de las 23 tiendas', items: [{ titulo: 'orbita-tiendas', props: { slug: 'orbita-tiendas' } }] },
  {
    titulo: 'p3 · Objetos-hecho (8 features de ShopifyWork)',
    items: FEATURES.map((estado) => ({ titulo: `objetos-feature · ${estado}`, props: { slug: 'objetos-feature', estado } })),
  },
  {
    titulo: 'p4 · Relieve del Valle de Aburrá',
    items: [
      { titulo: 'relieve-medellin', props: { slug: 'relieve-medellin' } },
      { titulo: 'relieve-medellin · pequena', nota: 'solo póster (otra geometría de curvas)', props: { slug: 'relieve-medellin', estado: 'pequena' } },
    ],
  },
  {
    titulo: '11 · Dispositivos genéricos',
    items: DISPOSITIVOS.map((estado) => ({
      titulo: `dispositivos · ${estado}`,
      nota: estado === 'pareja' ? 'solo póster (no hay GLB conjunto)' : undefined,
      props: { slug: 'dispositivos', estado },
    })),
  },
]

const caja: CSSProperties = { minWidth: 0 }
const etiqueta: CSSProperties = { font: '600 11px/1 ui-monospace, monospace', letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.55, marginBottom: 6 }

function Control({ children }: { children: ReactNode }) {
  return <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 18 }}>{children}</label>
}

export function Laboratorio3D() {
  const [interactiva, setInteractiva] = useState(false)
  const [animar, setAnimar] = useState(false)
  const [progreso, setProgreso] = useState(1)
  const [seleccionado, setSeleccionado] = useState('')
  const { fase, motivo, cerca } = useEscena3d()
  const comun = { interactiva, animar, progreso, seleccionado: seleccionado || undefined, sizes: '340px' }
  return (
    <div style={{ padding: '20px 24px 80px', maxWidth: 1500, margin: '0 auto' }}>
      <h1 style={{ font: '600 20px/1.2 system-ui', margin: '0 0 4px' }}>Laboratorio 3D — estudio obsidiana</h1>
      <p style={{ margin: '0 0 14px', opacity: 0.7, maxWidth: 880 }}>
        Izquierda: póster de Cycles. Derecha: la gemela en tiempo real (un solo Canvas, {cerca} vista{cerca === 1 ? '' : 's'} montada
        {cerca === 1 ? '' : 's'}). Con los interruptores apagados la pose es la del póster.
      </p>
      <div data-lab-estado={fase} style={{ marginBottom: 18, padding: '10px 12px', border: '1px solid #ffffff22', borderRadius: 10 }}>
        <Control><input type="checkbox" checked={interactiva} onChange={(e) => setInteractiva(e.target.checked)} /> interactiva</Control>
        <Control><input type="checkbox" checked={animar} onChange={(e) => setAnimar(e.target.checked)} /> animar</Control>
        <Control>
          progreso (órbita) <input type="range" min={0} max={1} step={0.01} value={progreso} onChange={(e) => setProgreso(Number(e.target.value))} />
          <span style={{ width: 34 }}>{progreso.toFixed(2)}</span>
        </Control>
        <Control>
          seleccionado (órbita)
          <select value={seleccionado} onChange={(e) => setSeleccionado(e.target.value)} style={{ background: '#15161b', color: 'inherit', border: '1px solid #ffffff33', borderRadius: 6 }}>
            <option value="">(bajo el puntero)</option>
            {datos.stores.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </Control>
        <span style={{ opacity: 0.6, marginLeft: 6 }}>escena: {fase}{motivo ? ` (${motivo})` : ''}</span>
      </div>
      {GRUPOS.map((g) => (
        <section key={g.titulo} style={{ marginBottom: 34 }}>
          <h2 style={{ font: '600 15px/1.2 system-ui', margin: '0 0 12px', opacity: 0.9 }}>{g.titulo}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 640px), 1fr))', gap: 16 }}>
            {g.items.map((it) => (
              <div key={it.titulo} data-lab-item={it.titulo} style={{ border: '1px solid #ffffff1a', borderRadius: 12, padding: 12 }}>
                <div style={{ marginBottom: 8, font: '500 13px/1.2 ui-monospace, monospace' }}>
                  {it.titulo}{it.nota ? <span style={{ opacity: 0.55 }}> — {it.nota}</span> : null}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={caja} data-col="poster">
                    <div style={etiqueta}>póster</div>
                    <Pieza3D {...it.props} {...comun} soloPoster />
                  </div>
                  <div style={caja} data-col="3d">
                    <div style={etiqueta}>3D</div>
                    <Pieza3D {...it.props} {...comun} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/** Monta el laboratorio como capa a pantalla completa (por encima del sitio, por debajo del Canvas) y devuelve su contenedor. */
export function montarLab(): HTMLElement {
  const cont = document.createElement('div')
  cont.setAttribute('data-lab3d', '')
  Object.assign(cont.style, {
    position: 'fixed', inset: '0', zIndex: '45', overflow: 'auto', background: '#08090C', color: '#e9e9ef', font: '14px/1.45 system-ui, sans-serif',
  })
  document.body.appendChild(cont)
  document.body.style.overflow = 'hidden'
  createRoot(cont).render(<Laboratorio3D />)
  return cont
}
