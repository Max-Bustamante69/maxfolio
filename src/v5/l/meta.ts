import type { DirectionMeta } from '../data'

export default {
  id: 'l',
  nombre: 'Anatomía',
  idea: 'Se entra por la pieza y no por la tienda: anuncio, cabecera, hero, carrusel de producto, reseñas, FAQ y pie. Cada pieza es una tira con el recorte real de esa pieza en cada tienda que la tiene, alineados y con su altura medida: la prueba de oficio de una plantilla compartida, hecha de recortes reales.',
  mecanica:
    '«Alinear y encajar»: al elegir una pieza, los recortes de todas las tiendas pasan de descansar cada uno sobre su suelo a colgar de una misma línea, con una regla de cotas (el alto real medido de cada sección) y, debajo, la piel medida (fuentes y fondo leídos del CSS). El visor de cada recorte navega con flechas dentro de la MISMA pieza, y la ficha de una obra es un comparador de dos tiendas fila por fila.',
  referentes: ['beardbrand.com', 'composites.archi', 'gregorylalle.com', 'johnnypep.com', 'playfolly.com'],
} satisfies DirectionMeta
