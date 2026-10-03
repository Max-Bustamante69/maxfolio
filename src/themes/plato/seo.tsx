import { useLayoutEffect } from 'react'

// Plató es el tema INDEXABLE (el que ven los rastreadores): cada vista lleva su título, su descripción, su canonical exacto y sus og:url / og:title.
// React 19 sube estas etiquetas al <head>. El index.html trae las suyas (descripción, og:title, og:description, twitter:*): mientras Plató está
// montado se apartan para que no haya dos descripciones, dos títulos sociales ni dos <title>, y se devuelven al salir del tema.
export const ORIGEN = 'https://www.maxfolio.dev'
const APARTAR = 'title, meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[property="og:url"], meta[name="twitter:title"], meta[name="twitter:description"]'

/** Aparta las etiquetas estáticas del index.html mientras Plató está montado (una vez, desde la raíz del tema). */
export function useCabeceraLimpia() {
  useLayoutEffect(() => {
    const apartadas = Array.from(document.head.querySelectorAll<HTMLElement>(APARTAR)).filter((el) => !el.hasAttribute('data-pl-seo'))
    const marcas = apartadas.map((el) => ({ el, siguiente: el.nextSibling }))
    apartadas.forEach((el) => el.remove())
    return () => {
      marcas.forEach(({ el, siguiente }) => document.head.insertBefore(el, siguiente && siguiente.parentNode === document.head ? siguiente : null))
    }
  }, [])
}

/** Las etiquetas de una vista. `ruta` es el camino absoluto del sitio (p. ej. /plato/obra/nos-cafe). */
export function Seo({ ruta, titulo, descripcion, indexar = true }: { ruta: string; titulo: string; descripcion: string; indexar?: boolean }) {
  const url = ORIGEN + ruta
  return (
    <>
      <title data-pl-seo="">{titulo}</title>
      <meta name="description" content={descripcion} data-pl-seo="" />
      {indexar ? <link rel="canonical" href={url} data-pl-seo="" /> : <meta name="robots" content="noindex" data-pl-seo="" />}
      <meta property="og:url" content={url} data-pl-seo="" />
      <meta property="og:title" content={titulo} data-pl-seo="" />
      <meta property="og:description" content={descripcion} data-pl-seo="" />
      <meta name="twitter:title" content={titulo} data-pl-seo="" />
      <meta name="twitter:description" content={descripcion} data-pl-seo="" />
    </>
  )
}
