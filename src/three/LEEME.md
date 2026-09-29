# src/three — piezas 3D del estudio obsidiana (opt-in)

Infraestructura para llevar al portafolio las piezas 3D aprobadas (Blender/Cycles → póster + GLB + gemela R3F medida).
**Todo va detrás de `?3d=1`.** Sin ese parámetro (ni el interruptor persistente que activa) el sitio es el de siempre:
mismo DOM, mismo CSS, mismos chunks; solo una comprobación de ~200 bytes en `main.tsx`.

## Interruptor

- `?3d=1` activa y guarda `maxfolio:3d=1` en localStorage (sigue activo en todas las rutas y visitas). `?3d=0` lo apaga y lo borra.
- `?3d=1&lab` abre el **laboratorio** (`Laboratorio3D.tsx`): las 5 piezas y todas sus variantes, póster de Cycles a la
  izquierda y gemela en tiempo real a la derecha, con los interruptores `interactiva`, `animar`, `progreso` y `seleccionado`.
  `&forzar` se salta las heurísticas de gama baja (no las de accesibilidad ni WebGL2).

## Uso

```tsx
import { Pieza3D } from '../three/Pieza3D'

<Pieza3D slug="monograma-mb" acento="luxury" interactiva prioridad className="w-[420px]" />
<Pieza3D slug="objetos-feature" estado="quiz" className="w-40" />
<Pieza3D slug="orbita-tiendas" progreso={scrollYProgress} interactiva className="w-full max-w-xl" />
<Pieza3D slug="relieve-medellin" animar periodoPulsoMs={30000} className="w-56" />
<Pieza3D slug="dispositivos" estado="telefono" interactiva className="w-64" />
```

| Prop | Qué hace |
|---|---|
| `slug` | `monograma-mb` · `orbita-tiendas` · `objetos-feature` · `relieve-medellin` · `dispositivos` |
| `estado` | Variante. `objetos-feature`: bundles, quiz, subscriptions, reviews, migration, islands, tracking, i18n. `dispositivos`: laptop, telefono, pareja (solo póster). `relieve-medellin`: `pequena` (solo póster). |
| `interactiva` | Parallax/tilt con el puntero; en la órbita de tiendas, la perla sigue a la cuenta bajo el cursor. Captura los eventos de la caja. |
| `animar` | Bucles propios (flotación del monograma, giro de los anillos, pulso de la perla). Por defecto = `interactiva`. Falso = pose idéntica al póster y **cero cuadros dibujados en reposo**. |
| `progreso` | 0..1, número o `MotionValue` (p. ej. `useScroll().scrollYProgress`). Órbita: cuánto se ha abierto la flota. |
| `acento` | Skin activa (`apple` · `luxury` · `brutalist` · `neo` · `persona` · `terminal`): color del punto del monograma y su póster. |
| `seleccionado` | Órbita: slug de la tienda con la perla (controlado desde el DOM). |
| `periodoPulsoMs` | Relieve: cadencia real del reloj que lo acompaña (Apple 30000, Terminal 1000). |
| `captura` | Dispositivos: otra captura con el aspecto EXACTO de la pantalla (390:844 / 1440:900). |
| `prioridad` | Póster con `fetchpriority=high` y sin lazy (pieza de la primera pantalla). |
| `soloPoster` | No monta el 3D aunque pueda. |
| `sinFlag` | `'nada'` (defecto: sin `?3d=1` devuelve `null`) o `'poster'` (pinta el póster también sin el flag). |
| `className` `style` `alt` `sizes` | La caja tiene `aspect-ratio` fijo (el del póster): dale ancho y ya está. `alt` por defecto es una descripción en inglés. |

`Pieza3D` con el 3D apagado devuelve `null`: quien la integre en una página no cambia esa página sin el flag.

## Cómo funciona (y por qué)

```
main.tsx  ──(?3d= o interruptor)──▶ arrancar.ts   capacidad → (laboratorio) → primera pieza cerca → idle → import Escena3D
                                       │
Pieza3D.tsx (puerta, null sin flag) ──▶ Pieza3DImpl.tsx   póster <picture> AVIF/WebP + IntersectionObserver
                                       │                      └─ Vista lazy: <View> drei en la MISMA caja
Escena3D.tsx  UN <Canvas> fixed (root React aparte, fuera de #root)  frameloop="demand"  <View.Port/>
Pieza3DVista.tsx  cámara del asset + gemela (piezas/*.tsx) + EntornoEstudio + aviso «dibujé» → el póster se desvanece
```

- **Un solo contexto WebGL** (`View`/`View.Port` de drei): las piezas son huecos del DOM con aspect-ratio fijo; nada de un
  canvas por pieza (límite de ~16 contextos por pestaña, ~8 en Android, y shaders/entorno recompilados en cada uno).
- **Póster primero, cero CLS**: la caja reserva su proporción antes de que cargue nada; el 3D se monta a ≤ 1 pantalla y se
  libera a > 2.5 pantallas. Al dibujar el primer cuadro, el póster se desvanece bajo el 3D (una vista es un recorte del
  Canvas compartido y no admite opacidad propia sin recompilar shaders, por eso se desvanece el póster).
- **`frameloop="demand"`**: no se dibuja nada hasta que algo lo pide (scroll/resize, puntero, `progreso`, animaciones activas).
  Medido: 0 llamadas de dibujo en 2 s con el laboratorio quieto. Los bucles lentos piden cuadros temporizados (anillos 30 fps, pulso 20 fps).
- **three solo si hace falta**: sin `?3d=1` no se pide nada; con él y sin ninguna `<Pieza3D>` en la página solo baja `arrancar`
  (~1.5 kB gzip); three/R3F/drei entran cuando hay una pieza cerca del viewport y el navegador está idle.
- **Póster (sin three) para**: `prefers-reduced-motion` (ni con `&forzar`), sin WebGL2, Save-Data, red 2G/3G, < 4 GB de RAM,
  < 4 núcleos, renderizado por software (SwiftShader/llvmpipe) y contexto WebGL perdido.
- **Draco local**: GLB con Draco, decodificador servido desde `/draco/` (nada de CDN de gstatic).
- **Capas**: el Canvas va en `z-index: var(--escena3d-z, 30)`: por encima del contenido y por debajo del nav (z-40) y los
  modales (z-50+). El nav y los modales tapan las piezas como cualquier otro elemento.
- **Eventos**: `eventSource` es `#root` (o el contenedor del laboratorio); el parallax lo mide el DOM sobre la caja (no R3F),
  el hover sobre las cuentas de la órbita sí es raycast de R3F.
- **`three` aislado** (`vite.config.ts`): R3F arrastra el namespace entero de three (688 kB) y `ScrollObjectScene` (el objeto
  ambiental de luxury/brutalist/neo) usa un subconjunto tree-shakeado (478 kB); compartiendo módulo esas skins habrían pasado
  a 688 kB sin activar nada. En `build`, todo lo que no sea `ScrollObjectScene` resuelve `three` a una copia aislada.
- **Tailwind** ignora `src/three/**` (`!./src/three/**`): solo estilos en línea, así sus strings no generan utilidades en el CSS.

## Fidelidad (medida, no a ojo)

`node scripts/qa-3d.mjs` (Chromium con GPU real: `--ignore-gpu-blocklist --use-gl=angle --use-angle=d3d11`) compara cada
gemela con su póster de Cycles. La gemela del estudio ya tiene sus propias diferencias con Cycles (fichas de cada asset);
las cifras de la integración coinciden con las de las capturas del estudio (p. ej. p3 quiz: Cycles 47.7 / gemela del estudio 58.4 /
aquí 60.4 de luminancia sobre la zona con contenido). Notas: la órbita de tiendas sale más oscura a 340 px de ancho que a
680 px (los anillos son muy finos); una sola resolución de cubemap para todas las vistas (256): mezclar tamaños distintos en un
renderer hace inestable el PMREM de three.

## Pendientes / decisiones abiertas

- Póster exacto de Cycles para brutalist/neo/persona/terminal (hoy derivados del de apple) y de los estados `_p0/_p50` de la órbita.
- `dispositivos · pareja` (laptop + teléfono juntos) no tiene GLB conjunto: solo póster. `relieve-medellin · pequena`: solo póster (otra geometría de curvas).
- Cabeceras de caché largas para `/3d/*` y `/draco/*` (`vercel.json`, sin tocar aquí): los nombres no llevan hash.
- El Canvas está por encima del contenido (z-30) y por debajo del nav (z-40): si una skin tiene elementos con z-index entre 30 y 40 que deban tapar una pieza, ajustar `--escena3d-z`.
- Desfase de un cuadro entre el scroll del DOM y el Canvas fijo (limitación del patrón `View`); medir con scroll rápido en móvil real.
- Decidir si el 3D pasa a ser el predeterminado y qué hace con `ScrollObject` (el estudio propone que el monograma lo sustituya).
