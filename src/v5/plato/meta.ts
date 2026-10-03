import type { DirectionMeta } from '../data'

export default {
  id: 'plato',
  nombre: 'Plató',
  idea: 'Un plató de lujo que se recorre: las luces de sala se apagan y se encienden las del plató. Cada tienda es un set (una pantalla real con su cono de luz) y la ficha es un pedestal giratorio. Lo que se lee, se lee en luz de sala; lo que se recorre, a oscuras.',
  mecanica:
    'Sistema de interfaz de lusion.co (una familia, 12 columnas, píldoras con rodillo, marco 3D con marcas «+», cromo re-teñido por obra) y mundo de igloo.inc (cámara que cruza niebla, un objeto por beat, rótulos con línea de guía, pedestal con anillos). El marco del inicio se abre a pantalla completa con el scroll y la cámara entra al plató; la obra es un travelling por 19 sets; la ficha es una grúa hasta el pedestal. Un solo Canvas, póster primero, cero fotogramas en reposo; en móvil y con «Ver como lista» todo es 2D con las mismas cinco vistas.',
  referentes: [
    'lusion.co · sistema de interfaz, marco enmarcado, rodillo de texto, transición tarjeta → proyecto',
    'igloo.inc · cámara por niebla, un objeto por beat, rótulos mono con línea de guía, pedestal con anillos',
    'activetheory.net · lista de intención en mono y DPR interno de 1,5 (lo demás, como contraste)',
    'juliencalot.com · la etiqueta de museo para la ficha de cada obra',
  ],
} satisfies DirectionMeta
