# src/three — piezas 3D del estudio obsidiana (opt-in)

Infraestructura para llevar al portafolio las piezas 3D aprobadas (Blender/Cycles → póster + GLB + gemela R3F medida).
**Todo va detrás de `?3d=1`.** Sin ese parámetro (ni el interruptor persistente que activa) el sitio es el de siempre:
mismo DOM (salvo ruido de animación), CSS idéntico byte a byte (mismo hash que `main`), cero peticiones nuevas. Lo único que
viaja en el JS inicial es el interruptor (`flag3d.ts`) y los `if` de las páginas: medido contra `origin/main`, `main.js`
crece **+0,8 kB gzip (+0,5 %)** y cada ruta carga entre +1,0 y +2,0 kB gzip de JS de sitio en total.

## Interruptor

- `?3d=1` activa y guarda `maxfolio:3d=1` en localStorage (sigue activo en todas las rutas y visitas). `?3d=0` lo apaga y lo borra.
  Vive en `flag3d.ts` (`modo3dActivo()` + `lazySiFlag()`, ~0,3 kB): es lo único de `src/three` que toca el chunk inicial. `modo3d.ts`
  (laboratorio y `forzar`) solo lo importa `arrancar`. Las secciones cargan sus vistas 3D con `lazySiFlag` (`null` sin el flag, decidido
  al primer uso y con la anotación PURE): un `flag ? lazy(...) : null` a nivel de módulo es un efecto secundario y arrastraba
  `ShopifyWork.js` a `/menu`.
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
| `realce` | Solo `monograma-mb` con `acento="apple"` sobre negro. Más luz de estudio (1 = el estudio tal cual): multiplica espejo, contornos y tira superior de la gemela y deja el pie del espejo donde estaba, así la cara sigue muriendo en negro y solo sube su parte alta y los filos. El póster pasa a `apple-oscuro` (captura de la gemela con ese realce, `scripts/poster-realce.mjs`) para que el relevo póster → 3D no salte. |
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
  Los bucles lentos piden cuadros temporizados (monograma y anillos 30 fps, pulso del relieve 5 fps a 30 s y 15 fps a 1 s).
  `pedirCuadro` deja UN temporizador pendiente por cadencia: el `useFrame` de todas las piezas corre en cada cuadro y antes cada
  cuadro sembraba un temporizador nuevo que sembraba otro, así que los bucles se multiplicaban y no se apagaban.
  Medido en la cabecera quieta (dibujos por segundo, GPU real): Luxury y Brutalist **20 → 0** a los ~12 s (el monograma flota 8 s
  sin puntero, se asienta en la pose del póster y deja de pedir cuadros; el puntero lo despierta); Apple 20 → 5 (solo el pulso del
  relieve); Terminal 13 (pulso de 1 s). Antes: 60 por segundo sin fin.
- **Scroll rápido = póster**: el Canvas fijo va ~20 ms (1,2 cuadros) por detrás del DOM (medido: 34 px a 1750 px/s). `Escena3D`
  mide la velocidad del scroll de la página; por encima de 700 px/s las piezas enseñan su póster (que es DOM y va pegado a su
  texto) y ocultan la vista (`<View visible={false}>`), y 150 ms después de parar vuelve el 3D. La pose del póster y la del 3D
  coinciden, así que no hay salto. El marco CSS de Productos hace lo mismo con `data-estado3d`.
- **Primer cuadro = póster**: `dt` acotado a 1/30 s en todas las gemelas (con `demand` el primer cuadro traía todo el tiempo ocioso
  y la órbita saltaba hasta 18° por segundo de inactividad) y el monograma cuenta su fase desde que se monta, no desde que se creó
  el Canvas. Diferencia con el póster en el primer cuadro dibujado (0-255): órbita 32,6 → 3,1; monograma 9,9 → 3,4.
- **three solo si hace falta**: sin `?3d=1` no se pide nada; con él y sin ninguna `<Pieza3D>` en la página solo baja `arrancar`
  (~1.5 kB gzip); three/R3F/drei entran cuando hay una pieza cerca del viewport y el navegador está idle. La sonda WebGL (un
  contexto desechable) espera a esa primera pieza: `/menu` y `/arcade` con el flag no crean ningún contexto.
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
- `dispositivos · pareja` (laptop + teléfono juntos) no tiene GLB conjunto: solo póster (y lleva desenfoque de profundidad en las
  pantallas que la gemela dibuja nítidas). `relieve-medellin · pequena`: solo póster (otra geometría de curvas).
- Cabeceras de caché largas para `/3d/*` y `/draco/*` (`vercel.json`, sin tocar aquí): los nombres no llevan hash.
- El Canvas está por encima del contenido (z-30) y por debajo del nav (z-40): si una skin tiene elementos con z-index entre 30 y 40 que deban tapar una pieza, ajustar `--escena3d-z`.
- Fidelidad póster/3D que sigue abierta (el estudio no retoca luces por pieza): la cara superior del monograma pierde su degradado
  gris (Luxury ~21 % más oscuro en contexto) y los objetos de fila pierden la sombra de contacto del póster (fundido de 140 ms).
- Firma del hero de Apple (`FirmaHero`, `firma-hero.css`): desde 1024 px el trazo mide 240x120 y cuelga de la banda entre el nav y
  la «t» de «Bustamante» (borde superior a 76 px, 20 px bajo el nav; borde derecho 16 px dentro del marco para dejar aire al cursor
  del riel). Es lo mayor que cabe sin tocar el flujo del hero (el cascarón estático de `index.html` no lleva hueco para ella), y la
  caja del póster sigue por debajo del área de texto del titular: LCP y CLS medidos iguales con y sin la firma. En tema oscuro
  lleva `realce` 3 y un pozo de la superficie de las tarjetas (`#1c1c1e`, radial, transparente en el borde) en vez del halo claro,
  que tenía la luminancia de la propia cara y la borraba. Contraste de silueta a 1440 (anillo de 2 px a cada lado del borde, sobre
  el alfa del póster): media de luminancia relativa borde/fondo 0.056/0.050 → 0.117/0.009; razón WCAG mediana por píxel de borde
  1.54 → 2.24; bordes con razón >= 2: 21 % → 58 %, >= 3: 5 % → 36 %. La flotación cabecea el reflejo y la luminancia media de la zona oscila
  entre ~35 y ~94 cada 4 s durante los ~8 s tras cargar o mover el puntero (en claro también: 26-82 sobre los píxeles oscuros) y se
  asienta en ~65 en reposo = el póster. Con 1024-1031 px y 1280-1285 px (hasta 15 px más con barra de desplazamiento clásica) el
  titular parte en dos líneas y queda un hueco a su derecha que la firma no usa.
- Cobertura: firma MB solo en Apple, Luxury y Brutalist. Neo pierde su objeto ambiental con el flag y no gana firma (su panel no
  tiene hueco libre); Terminal conserva su MB en píxeles; Persona (`/arcade`) no tiene ninguna pieza. La órbita no está en Apple
  (Apple no monta `Years`).
- Táctil: el 3D no se descarga hasta que el usuario abre la Órbita o la pestaña Apps y plataforma (~285 kB gzip de JS + ~0,7 MB de
  GLB/HDRI/Draco); decidir si en `(pointer: coarse)` esas dos vistas se quedan en póster.
- Tarjeta «Ahora» de Apple: con el relieve crece 25 px respecto al cascarón estático (CLS 0,006 con el flag); limitar el relieve al
  alto de las 3 filas lo dejaría en 0 a costa de dejarlo en póster.
- Un enlace compartido con `?3d=1` activa el 3D para siempre en ese navegador y solo `?3d=0` lo apaga: no hay control visible.
- Decidir si el 3D pasa a ser el predeterminado (y, entonces, retirar `ScrollObject`, que con el flag ya no se monta en Luxury, Brutalist y Neo).
