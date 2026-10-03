import type { DirectionMeta } from '../data'

export default {
  id: 'persona',
  nombre: 'Persona',
  idea: 'Réplica del estilo Arcade del portafolio anterior con el contenido del vivo: el inicio es un menú de juego, cada pantalla entra con un barrido diagonal y los títulos son notas de rescate pegadas letra a letra (con un hueco mínimo entre vecinas para que siempre se lean).',
  mecanica:
    'Menú de juego con selector que se desliza (↑↓ ↵ responden al llegar, ⎋ vuelve), golpe y ráfaga de esquirlas al confirmar y, un instante después, el barrido diagonal; letras de nota de rescate, paneles rasgados que se asientan al verse, el filtro de la obra en la URL y la captura que viaja del índice a su ficha con Flip. El índice de cargos lleva el mismo selector azul siguiendo la lectura. Contenido: seis cifras con su fuente, el caso completo de The Gummy Box, los cinco pasos con lo que se recibe, cargos con logros y cifras del CV, «Cinco años», habilidades por grupo, las tres formas de empezar que calzan el formulario y la FAQ.',
  referentes: ['Portafolio anterior de Max (Persona / Arcade en /arcade)', 'Menús de juego de acción (selector inclinado, ráfaga al confirmar)', 'Cómic de tinta y trama de puntos'],
} satisfies DirectionMeta
