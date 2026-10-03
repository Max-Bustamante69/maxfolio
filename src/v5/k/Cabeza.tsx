/** Título y noindex de cada vista (React 19 los lleva al <head>). */
export function Cabeza({ titulo }: { titulo: string }) {
  return (
    <>
      <title>{titulo}</title>
      <meta name="robots" content="noindex" />
    </>
  )
}

/** Un titular en frases: cada frase es una línea que entra por separado y la última pierde el punto final. */
export function frases(texto: string, sinPunto: (s: string) => string): string[] {
  const f = texto.split(/(?<=[.。])\s*/).map((s) => s.trim()).filter(Boolean)
  return f.map((s, i) => (i === f.length - 1 ? sinPunto(s) : s))
}
