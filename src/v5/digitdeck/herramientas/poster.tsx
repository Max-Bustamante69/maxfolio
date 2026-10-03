// Página de herramienta (solo en desarrollo; no entra al build): dibuja el MB en su pose de reposo sobre un fondo liso
// para que posters.mjs saque el póster con transparencia. ?yaw=<grados>&capa=todo|letras|perla&bg=<color css>
import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import MBEscena from '../mb/MBEscena'
import type { Capa } from '../mb/tipos'

const q = new URLSearchParams(location.search)
document.body.style.cssText = `margin:0;background:${q.get('bg') ?? 'black'}`

function Caja() {
  const [listo, setListo] = useState(false)
  return (
    <div style={{ position: 'relative', width: 1200, height: 900, margin: '40px auto 0' }} data-mb={listo ? '3d' : 'cargando'}>
      <MBEscena yaw={Number(q.get('yaw') ?? 0)} capa={(q.get('capa') ?? 'todo') as Capa} animar={false} interactiva={false} alDibujar={() => setListo(true)} />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Caja />)
