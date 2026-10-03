// Iconos de la dirección. WhatsApp sale VERBATIM del set de redes de la casa (packages/components/SocialIcons, normalizado
// al 75 % con su <g>): nunca otro glifo ni uno dibujado. El color lo pone el contenedor (fill="currentColor").
const WHATSAPP_SVG =
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(3.0000 3.0000) scale(0.7500)"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.07 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.8h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.79 9.79 0 0 1-1.5-5.23c0-5.41 4.41-9.81 9.83-9.81a9.76 9.76 0 0 1 6.94 2.88 9.73 9.73 0 0 1 2.87 6.94c0 5.41-4.41 9.82-9.83 9.82ZM20.5 3.49A11.72 11.72 0 0 0 12.05 0C5.54 0 .25 5.29.25 11.79c0 2.08.54 4.11 1.58 5.9L.15 24l6.45-1.69a11.79 11.79 0 0 0 5.45 1.39h.01c6.5 0 11.79-5.29 11.79-11.79 0-3.15-1.23-6.11-3.46-8.34Z" fill="currentColor"/></g></svg>'

export function IconoWhatsApp({ size = 24 }: { size?: number }) {
  return <span aria-hidden="true" style={{ display: 'inline-flex', width: size, height: size, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: WHATSAPP_SVG }} />
}

/** Pausa / reproducción: dos trazos o un triángulo en currentColor (el botón de la cinta es un icono, no texto). */
export function IconoPausa({ pausado }: { pausado: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      {pausado ? <path d="M5 3.2v11.6L14.5 9z" fill="currentColor" /> : <path d="M4.5 3h3v12h-3zM10.5 3h3v12h-3z" fill="currentColor" />}
    </svg>
  )
}
