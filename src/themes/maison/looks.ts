// Generado por estilo/maison/recortes3.mjs: un recorte 4:5 de la fotografía ORIGINAL de cada tienda (nunca de una captura de pantalla),
// a su resolución nativa y sin reescalar hacia arriba. fx/fy = el punto de interés (%): el marco, que recorta según su proporción, lo mantiene a la vista.
export interface Look { w: number; h: number; fx: number; fy: number }
export const LOOKS: Record<string, Look> = {
  "the-gummy-box": { w: 839, h: 1049, fx: 50, fy: 40 },
  "nalua": { w: 1200, h: 1500, fx: 50, fy: 38 },
  "luxe-shine": { w: 1200, h: 1500, fx: 50, fy: 52 },
  "nos-cafe": { w: 1120, h: 1400, fx: 50, fy: 50 },
  "millennio": { w: 691, h: 864, fx: 50, fy: 50 },
  "mindfuel": { w: 905, h: 1131, fx: 40, fy: 50 },
  "sebum": { w: 640, h: 800, fx: 50, fy: 50 },
  "valdo-cafe": { w: 1003, h: 1254, fx: 50, fy: 50 },
  "factores-2x2": { w: 640, h: 800, fx: 50, fy: 50 },
  "pixxiesx": { w: 767, h: 959, fx: 50, fy: 50 },
  "saint-theory": { w: 1200, h: 1500, fx: 50, fy: 50 },
  "peluna": { w: 720, h: 900, fx: 55, fy: 50 },
  "en-amor-a-dos": { w: 1140, h: 1425, fx: 50, fy: 50 },
  "unik": { w: 1000, h: 1250, fx: 50, fy: 50 },
  "origen-vital": { w: 1003, h: 1254, fx: 50, fy: 50 },
  "para-machos": { w: 896, h: 1120, fx: 50, fy: 50 },
  "tierramont": { w: 900, h: 1125, fx: 50, fy: 40 },
  "alma-de-aviador": { w: 1003, h: 1254, fx: 50, fy: 50 },
}
export const lookSrc = (slug: string) => `/v5/maison/looks/${slug}.webp`
