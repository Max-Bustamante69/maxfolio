import { useId } from 'react'
import { POR, type Por } from './datos'
import { useC } from './useC'

/** Selector de disposición (Por rubro · Por tecnología · Por año): radios nativos con aspecto de enlace en la cabecera y de chip en la hoja;
 *  el activo lleva el trazo de lápiz. Lo comparten la Lectura y la Mesa, así que la reagrupación es la misma en las dos. */
export function Disposicion({ por, onChange, variante = 'hoja' }: { por: Por; onChange: (p: Por) => void; variante?: 'cab' | 'hoja' }) {
  const { t } = useC()
  const nombre = useId()
  return (
    <fieldset className={`c-radios c-radios--${variante}`}>
      <legend className="c-sr">{t.por.aria}</legend>
      {POR.map((p) => (
        <label key={p} className="c-chip">
          <input type="radio" name={nombre} value={p} checked={por === p} onChange={() => onChange(p)} />
          <span>{t.por[p]}</span>
        </label>
      ))}
    </fieldset>
  )
}
