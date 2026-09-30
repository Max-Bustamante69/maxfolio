# work3d — piezas 3D de la sección Trabajo (solo con `?3d=1`)

Dos módulos que `ShopifyWork.tsx` y `Products.tsx` cargan en diferido con `lazySiFlag` (`src/three/flag3d.ts`) únicamente si el
flag está activo. Sin él no se piden, no se renderizan y el DOM de la sección es el de siempre (medido: mismo HTML de filas y
productos, capturas idénticas a 1440 y 390, CSS idéntico byte a byte, cero peticiones nuevas).

## `ObjetosFeature.tsx` — un objeto-hecho por fila de tienda (p3)

- **Un** objeto por fila, el de la primera característica que coincide con la MISMA taxonomía `FEATURES` que ya filtra la lista
  (`featuresDe` en ShopifyWork); con un filtro activo, el de ese filtro. Sin coincidencia = hueco vacío (los nombres siguen alineados).
- **Solo desde 1280 px.** El objeto (~64 px, caja de 108 px porque el póster tiene un 20 % de margen transparente por lado) dice
  «hay una característica»; el nombre y la cifra siguen empezando en el margen. Por debajo (móvil, tableta) el componente no pinta
  nada y no se pide ni su póster: eso arregla el texto recortado de Terminal a 320-360 px (antes la columna de objetos se
  restaba a un layout mono que no encoge) y los +2 MB en móvil. La versión anterior ponía 1-2 losas de ~90 px por fila en
  todos los anchos: empujaba el nombre 219 px a la derecha y los mismos pares se repetían como una columna de cuadros negros.
- **Póster por defecto.** El 3D solo se monta en la fila con el puntero encima (mouse, tras 120 ms de intención), con foco de
  teclado (`:focus-visible`) o la que abre la órbita de habilidades (`resaltada`). Máximo `MAX_VIVAS = 3` filas en 3D a la vez; la
  última que se deja sigue viva y quieta (pose = póster) para que al irse el puntero no parpadee. Táctil, reduced-motion, gama
  baja o sin WebGL2: siempre póster. El póster se desvanece en 140 ms (`--fundido-3d`).
- El clic en el objeto abre la hoja del caso (igual que el nombre). El bloque es decorativo (`aria-hidden`); el `title` lleva la
  etiqueta del chip de filtro.

## `Dispositivos3D.tsx` — laptop + teléfono con la captura real (asset 11)

- Solo pestaña «Apps y plataforma», productos con `gallery: true`. La pantalla es una textura: `capturaLaptop` =
  `/gallery/<id>/home-desktop.webp` (1200x750 = 1440:900) y `capturaTelefono` = `/gallery/<id>/home-mobile.webp` (780x1688 =
  390:844), ya con el aspecto exacto que exige la ficha. Cambiar de producto solo cambia la URL (sin remontar; las capturas de los otros
  productos se precargan en reposo, salvo en táctil).
- El póster de Cycles de estos dos objetos lleva Factores 2x2 pintado en la pantalla: se oculta siempre. El «póster» de la zona es el
  marco CSS de siempre con la captura real del producto (queda debajo y se retira cuando el 3D ya dibuja, `data-estado3d="3d"`; con
  scroll rápido el 3D se oculta y vuelve el marco al instante). Reduced-motion, gama baja o sin WebGL2: layout idéntico al de hoy.
- Las cajas se recortan (laptop 1.25:1, teléfono 0.62:1) porque la cámara, no el póster, decide el encuadre; el teléfono se solapa
  con la esquina de la laptop como en `pareja`.

## Notas de integración

- `ShopifyWork` construía `StoreRow` como componente dentro del render, así que cada re-render (el preview de hover lo provoca al
  entrar/salir de una fila) desmontaba y reconstruía TODAS las filas. Ahora se llama como función con `<li key>` estable: mismo DOM,
  y las piezas 3D sobreviven al hover.
- Sin clases Tailwind nuevas (`main.css` con el mismo hash que `origin/main`) y sin estilos globales: el CSS de cada pieza va en
  un `<style href precedence>` (React 19 lo sube al `<head>`) que solo existe con el flag.
