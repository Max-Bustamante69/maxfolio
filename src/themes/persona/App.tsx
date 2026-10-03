import { useMemo, useRef } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useV5, v5path } from '../data'
import Contacto from './Contacto'
import Ficha from './Ficha'
import Inicio from './Inicio'
import Obra from './Obra'
import Trayectoria from './Trayectoria'
import { Cromo, useBarrido } from './Shell'
import { copyFor } from './copy'
import { ID, PersonaCtx } from './contexto'
import './tokens.css'
import './persona.css'

// «Persona»: réplica del estilo Arcade del portafolio anterior sobre las cinco vistas de la v5.
// Rutas reales: /v5/persona · /obra · /obra/:slug · /trayectoria · /contacto (el enrutador de la v5 descubre este archivo).
export default function PersonaApp() {
  const v5 = useV5()
  const barrido = useRef<HTMLDivElement>(null)
  const ir = useBarrido(barrido)
  const valor = useMemo(() => ({ v5, c: copyFor(v5.locale), ir }), [v5, ir])
  return (
    <PersonaCtx.Provider value={valor}>
      <div className="v5-root v5-persona">
        <Cromo barrido={barrido}>
          <Routes>
            <Route index element={<Inicio />} />
            <Route path="obra" element={<Obra />} />
            <Route path="obra/:slug" element={<Ficha />} />
            <Route path="trayectoria" element={<Trayectoria />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="*" element={<Navigate to={v5path(ID)} replace />} />
          </Routes>
        </Cromo>
      </div>
    </PersonaCtx.Provider>
  )
}
