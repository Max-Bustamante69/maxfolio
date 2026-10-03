/** Título y noindex de cada vista (React 19 los sube al head). */
export function Cabeza({ titulo }: { titulo: string }) {
  return (
    <>
      <title>{titulo}</title>
      <meta name="robots" content="noindex" />
    </>
  )
}
