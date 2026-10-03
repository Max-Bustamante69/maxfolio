import type { DirectionMeta } from '../data'

export default {
  id: 'reportaje',
  nombre: 'El Reportaje',
  idea: 'La carrera de Max contada como un reportaje de una sola edición: papel cálido, tinta y un único dorado de foco; las tiendas reales como fotografía, y cada cifra con su cargo y su periodo pegados.',
  mecanica:
    'Newsreader a lectura de periódico sobre papel; el titular sube línea a línea y un subrayador dorado marca la frase que importa, el mismo que luego marca lo que se está leyendo. La portada abre con dos tiendas reales en el móvil. Las seis cifras caben en una sola pantalla de tinta, con la mancuerna de Lighthouse que se dibuja al llegar. Los cuatro casos son un escenario fijo cuya captura se descubre de abajo arriba sobre la anterior mientras pasan sus pasos (escenario fijo + pasos, como The Pudding). En la obra, dos tiendas grandes y el resto en rejilla; en el móvil, filas con miniatura. La trayectoria abre con el diagrama de cargos a la vista y la ficha de cada tienda muestra su Lighthouse medido, con su fecha. Al cambiar de vista cae una hoja de papel con el número del capítulo; al abrir un caso su captura cruza hasta la ficha.',
  referentes: [
    'pudding.cool · columna de 650 px, escenario fijo con pasos y un solo acento sobre neutros (medido)',
    'nytimes.com/projects/2012/snow-fall · titular en peso 200, barra de capítulos y columna de lectura (archivo, medido)',
    'nytimes.com/interactive/2012 · relleno con trazo más oscuro, rótulo directo y línea de fuente pegada al gráfico (archivo, medido)',
    'ourworldindata.org · marco título, bajada, gráfico y fuente',
  ],
} satisfies DirectionMeta
