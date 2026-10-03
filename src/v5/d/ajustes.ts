import { createContext, useContext, useRef } from 'react'

/** Los tres interruptores del aparato que afectan a toda la dirección. El idioma vive en LanguageContext. */
export interface Ajustes {
  reducido: boolean
  compacta: boolean
  setReducido: (v: boolean) => void
  setCompacta: (v: boolean) => void
}

export const AjustesCtx = createContext<Ajustes>({ reducido: false, compacta: false, setReducido: () => {}, setCompacta: () => {} })
export const useAjustes = () => useContext(AjustesCtx)

/** ¿Anima esta vista? Se decide al montar: cambiar el interruptor después no repite la entrada (el movimiento que ya corre
 *  se acelera a «instantáneo» desde App). */
export function useAnimaAlMontar() {
  const { reducido } = useAjustes()
  return useRef(!reducido).current
}
