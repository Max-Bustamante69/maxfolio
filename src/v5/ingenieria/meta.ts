import type { DirectionMeta } from '../data'

export default {
  id: 'ingenieria',
  nombre: 'Ingeniería',
  idea: 'El portafolio de un CTO como la página de producto de una empresa de ingeniería de primer nivel, con un gesto de identidad propio: el nombre en serif de exhibición y un monograma MB dibujado con las hebras de la cinta. La obra está a la vista desde el primer pantallazo (una tienda real en una ventana de navegador sobre la cinta), una presentación en primera persona dice quién hay detrás, cuatro cifras del CV llevan su cargo y su periodo, una tienda se cuenta completa y una página real de NOS Café se anota para separar lo que es Liquid de lo que es una isla React.',
  mecanica:
    'El nombre sube letra a letra mientras la cinta se dibuja de izquierda a derecha y la ventana con la tienda sube a su sitio, seguida del móvil y de la ficha de Lighthouse. Al bajar, las hebras corren por dentro de las letras del monograma MB (escena pasiva de scroll) y las cuatro cifras se descubren con un barrido; en la página anotada, las zonas se encienden una a una. Al abrir una obra, su captura cruza de la tarjeta a la ficha y, con «‹ Obra», vuelve a su sitio. Todo con transform, opacity y clip-path, y cero fotogramas en reposo.',
  referentes: [
    'stripe.com · Billing: titular libre a la izquierda y ventana de producto con datos reales sobre la cinta',
    'stripe.com · páginas de producto: marco con filetes verticales y titulares de dos tonos',
    'stripe.com · banda de noche con diagrama de puntos y nodos de filete fino',
    'stripe.com · historias de clientes: carril de métricas con barra de acento y «piezas usadas»',
    'stripe.com · cifras grandes con relleno degradado sobre la banda de noche',
    'linear.app · etiquetas mono en mayúsculas y figuras «FIG 0.1»',
    'linear.app · la página editorial en serif de exhibición (el nombre)',
    'maxfolio.dev · el contenido completo del vivo: cifras con fuente, cargos, proceso, FAQ, tiendas y proyectos',
  ],
} satisfies DirectionMeta
