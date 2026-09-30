# work3d — piezas 3D de la sección Trabajo (solo con `?3d=1`)

Dos módulos que `ShopifyWork.tsx` y `Products.tsx` cargan en diferido (`lazy`) únicamente si `modo3dActivo()`. Sin el flag no se
piden, no se renderizan y el DOM de la sección es el de siempre (medido: mismo HTML de filas y productos, capturas idénticas
a 1440 y 390).

## `ObjetosFeature.tsx` — objetos-hecho en las filas de tiendas (p3)

- 1-2 objetos por fila (2 desde 1280 px, 1 por debajo), elegidos con la MISMA taxonomía `FEATURES` que ya filtra la lista
  (`featuresDe` en ShopifyWork); con un filtro activo, su objeto va primero. Sin coincidencia = hueco vacío (los nombres siguen alineados).
- Tamaño: el objeto mide ~90 px (caja de 152 px; el póster tiene un 20 % de margen transparente por lado) o ~76 px en móvil.
- **Póster por defecto.** El 3D solo se monta en la fila con el puntero encima (mouse, tras 120 ms de intención), con foco de teclado
  (`:focus-visible`) o la que abre la órbita de habilidades (`resaltada`). Máximo `MAX_VIVAS = 3` filas en 3D a la vez; la última
  que se deja sigue viva y quieta (pose = póster) para que al irse el puntero no parpadee. Táctil, reduced-motion, gama baja
  o sin WebGL2: siempre póster.
- El clic en el objeto abre la hoja del caso (igual que el nombre). El bloque es decorativo (`aria-hidden`); el `title` lleva la
  etiqueta del chip de filtro.

## `Dispositivos3D.tsx` — laptop + teléfono con la captura real (asset 11)

- Solo pestaña «Apps y plataforma», productos con `gallery: true`. La pantalla es una textura: `capturaLaptop` =
  `/gallery/<id>/home-desktop.webp` (1200x750 = 1440:900) y `capturaTelefono` = `/gallery/<id>/home-mobile.webp` (780x1688 =
  390:844), ya con el aspecto exacto que exige la ficha. Cambiar de producto solo cambia la URL (sin remontar; las capturas de los otros
  productos se precargan en reposo).
- El póster de Cycles de estos dos objetos lleva Factores 2x2 pintado en la pantalla: se oculta siempre. El «póster» de la zona es el
  marco CSS de siempre con la captura real del producto (queda debajo y se retira cuando el 3D ya dibuja, `data-estado3d="3d"`).
  Reduced-motion, gama baja o sin WebGL2: layout idéntico al de hoy.
- Las cajas se recortan (laptop 1.25:1, teléfono 0.62:1) porque la cámara, no el póster, decide el encuadre; el teléfono se solapa
  con la esquina de la laptop como en `pareja`.

## Notas de integración

- `ShopifyWork` construía `StoreRow` como componente dentro del render, así que cada re-render (el preview de hover lo provoca al
  entrar/salir de una fila) desmontaba y reconstruía TODAS las filas. Ahora se llama como función con `<li key>` estable: mismo DOM,
  y las piezas 3D sobreviven al hover.
- Sin clases Tailwind nuevas (CSS idéntico byte a byte) y sin tocar `src/three`.
