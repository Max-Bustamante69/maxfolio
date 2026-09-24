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
