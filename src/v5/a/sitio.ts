import { useState } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Dónde estaba el lector. Al dejar una vista por un enlace propio se recuerdan su posición y sus filas abiertas; Atrás y
// «← Libro» lo devuelven al mismo sitio y con las mismas filas abiertas. Llegar por un enlace normal empieza arriba y cerrado.
// Solo sessionStorage (con try/catch: sin él, simplemente se llega arriba) y nada de lazos: se escribe al salir.
export type Sitio = { y: number; abiertas: string[] }

const llave = (url: string) => `v5-a-sitio:${url}`
const VOLVER = 'v5-a-volver'
const aqui = () => location.pathname + location.search

let abiertasAhora: Iterable<string> = []
/** Las filas abiertas de la vista montada (las publica useDespliegue y se vacían al desmontar). */
export const publicarAbiertas = (filas: Iterable<string>) => { abiertasAhora = filas }

export function recordarSitio() {
  try {
    sessionStorage.setItem(llave(aqui()), JSON.stringify({ y: Math.round(scrollY), abiertas: [...abiertasAhora] } satisfies Sitio))
  } catch {
    /* sin almacenamiento: se llega arriba */
  }
}

function leer(url: string): Sitio | null {
  try {
    return JSON.parse(sessionStorage.getItem(llave(url)) ?? 'null')
  } catch {
    return null
  }
}

/** Lo recordado de esta vista, SOLO si se llega por Atrás/Adelante o por «← Libro» (state.sitio); si no, null. Se fija al montar. */
export function useSitio(): Sitio | null {
  const { pathname, search, state } = useLocation()
  const tipo = useNavigationType()
  const [sitio] = useState(() => (tipo === 'POP' || state?.sitio ? leer(pathname + search) : null))
  return sitio
}

/** De qué vista del libro se abrió una ficha (con sus filtros): «← Libro» vuelve ahí y no a un índice en blanco. */
export function recordarVolver(slug: string) {
  try {
    sessionStorage.setItem(VOLVER, JSON.stringify({ slug, url: aqui() }))
  } catch {
    /* sin almacenamiento: «← Libro» va al índice */
  }
}
/** La ficha de la que se vino y la vista del libro de la que se abrió (null si no se recuerda). */
export function leerVolver(): { slug: string; url: string } | null {
  try {
    return JSON.parse(sessionStorage.getItem(VOLVER) ?? 'null')
  } catch {
    return null
  }
}
