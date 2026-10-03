import type { DirectionMeta } from '../data'

export default {
  id: 'a',
  nombre: 'El Libro',
  idea: 'La home es el índice: cada obra es una línea de un libro de entregas y la línea se abre en su ficha sin salir de la página.',
  mecanica:
    'Libro mayor tipográfico sobre papel amarillo y tinta cálida: una fila por obra que se despliega en línea al toque (papel sobre tinta), filtros en la URL con contador y ninguna imagen antes del primer despliegue. Movimiento «imprimir y cortar» con GSAP: una cabeza de impresión descubre el nombre, una cortina de tinta cambia de página y el nombre y la banda de tinta de la fila viajan a la ficha.',
  referentes: [
    'mschf.com · catálogo como libro mayor de texto monoespaciado',
    'robotsguide.com · lista filtrada con contador y orden',
    'robotsguide.com · ficha de datos y galería',
    'a24films.com · títulos enormes con el año como dato menor',
    'newmuseum.org · un solo contraste extremo de escala',
    'gregorylalle.com · numerales y marca de la fila activa',
    'cornersnewyork.co · etiqueta grande y filas con filete',
    'departuremono.com · tabla en texto de ancho fijo con fila resaltada',
    'tinycomputer.co · entradas con fecha como prueba de vida',
    'edoardolunardi.dev · datos entre corchetes en mono',
  ],
} satisfies DirectionMeta
