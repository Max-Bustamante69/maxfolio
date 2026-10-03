// <title>, noindex y la precarga de las fuentes del h1 (Anton) y de las etiquetas, botones y barras (Rajdhani 700). React 19 los eleva al <head>.
export function Cabeza({ titulo }: { titulo: string }) {
  return (
    <>
      <title>{titulo}</title>
      <meta name="robots" content="noindex" />
      <link rel="preload" as="font" type="font/woff2" crossOrigin="" href="/fonts/persona/anton-latin.woff2" />
      <link rel="preload" as="font" type="font/woff2" crossOrigin="" href="/fonts/persona/rajdhani-700-latin.woff2" />
    </>
  )
}
