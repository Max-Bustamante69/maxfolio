// Encuadre del MB: el póster y el lienzo miden 1200×576 (25:12), no los 1200×900 (4:3) del estudio original.
// El monograma ocupa el 49 % central de la altura del encuadre 4:3 (y de 0,257 a 0,743); el 51 % restante era alfa 0, pero era
// CAJA: apilado sobre el titular a 1440 la caja de 936×702 cubría la frase entera. Se conserva el 64 % central (0,18–0,82), de modo
// que cada píxel del póster es el mismo que antes (misma distancia focal en píxeles) y el 3D vivo sigue casando con él.
export const POSTER_W = 1200
export const POSTER_H = 576
/** Fracción de la altura del encuadre original (900 px) que se conserva, centrada. */
export const FRACCION_ALTO = POSTER_H / 900

/** Campo de visión vertical equivalente: recortar la altura sin cambiar la focal en píxeles = tan(fov'/2) = tan(fov/2)·fracción. */
export const fovRecortado = (fovVerticalDeg: number) => (2 * Math.atan(Math.tan((fovVerticalDeg * Math.PI) / 360) * FRACCION_ALTO) * 180) / Math.PI
