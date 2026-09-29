import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

// `--vw`: the layout viewport without the scrollbar, for full-bleed rails (see `.bleed-rail` in index.css).
const setVw = () => document.documentElement.style.setProperty('--vw', `${document.documentElement.clientWidth}px`)
setVw()
addEventListener('resize', setVw, { passive: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// 3D opt-in: sin `?3d=` en la URL ni el interruptor persistente que ese parámetro activa (src/three/modo3d.ts) no se
// pide nada más. Con él, `arrancar` decide si el equipo lo merece y carga three en diferido, tras una pieza visible.
try {
  if (/[?&]3d=/.test(location.search) || localStorage.getItem('maxfolio:3d') === '1') void import('./three/arrancar').then((m) => m.default())
} catch {
  /* almacenamiento bloqueado y sin parámetro: sin 3D */
}
