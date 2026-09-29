# public/3d — assets del estudio obsidiana

Solo lo que la web usa. Todo sale del estudio 3D de Digitdeck (Blender 5.2 / Cycles → póster + GLB + gemela R3F
medida). Fichas completas (qué hecho representa cada pieza, fuente del dato, mediciones, desviaciones) en el
estudio: `3d/assets/{p1-monograma-mb,p2-orbita-tiendas,p3-objetos-feature,p4-relieve-medellin,11-dispositivos}/FICHA.md`.
Cómo se consumen: `src/three/LEEME.md`. Los assets se copian tal cual desde `out/` del estudio; si cambia una pieza,
se vuelve a copiar (y a regenerar `scripts/poster-acento.mjs` si cambia el póster de `apple` del monograma).

| Carpeta | Contenido | Peso (transferido) |
|---|---|---|
| `hdri/studio_small_09_512.hdr` | Entorno del estudio a 0.35 (Poly Haven, **CC0**, https://polyhaven.com/a/studio_small_09). El estudio usa la 2k (6.3 MB) y derivó una 1k; aquí va la 512×256 (`scripts/hdri-reducir.mjs`, filtro de caja en luz lineal). Medido con `scripts/qa-3d.mjs`: 2k, 1k y 512 dan la misma paridad con el póster (±0.02 en todas las métricas). | 512 KB |
| `monograma-mb/` | `monograma-mb.opt.glb` (Draco, `--join false --no-simplify`) + pósters AVIF/WebP con alfa: `apple`, `luxury` (Cycles, 1200/2400) y `apple-<skin>` (1200, derivados) | GLB 68 KB · póster 1200: 16 KB avif / 30 KB webp |
| `orbita-tiendas/` | `orbita-tiendas.opt.glb` + póster `reposo` (1200/2400) | GLB 91 KB · póster 30 / 47 KB |
| `objetos-feature/` | `objetos-feature.opt.glb` (8 sub-grupos, un solo GLB) + 8 pósters a 1200 (tarjetas pequeñas) | GLB 160 KB · póster 6-10 / 20-34 KB |
| `relieve-medellin/` | `relieve-medellin.opt.glb` + `relieve-medellin-normal.webp` (curvas de nivel y río) + pósters `recorte` (1200/2400) y `pequena` (600/1200, solo póster) | GLB 342 KB + normal 217 KB · póster 50 / 66 KB |
| `dispositivos/` | `laptop.opt.glb`, `telefono.opt.glb`, capturas de pantalla `captura-{laptop,telefono}.webp` (Factores 2x2, trabajo real) + pósters `laptop`, `telefono`, `pareja` (`pareja` solo póster) | GLB 14 + 5 KB · captura 106 / 53 KB · póster 20-25 / 35-41 KB |
| `../draco/` | Decodificador Draco de three 0.170 (`examples/jsm/libs/draco/gltf`), servido local (Apache-2.0, Google) | wasm 188 KB + wrapper 57 KB (el `.js` de 500 KB es solo el respaldo sin WebAssembly) |

## Qué cambió respecto a `out/` del estudio (y por qué)

- **`monograma-mb.opt.glb` se re-optimizó**: el `.opt.glb` del estudio (`optimize --compress draco --no-simplify`, con
  `join` por defecto) fundía «MB» y «Punto» en una sola malla, y el punto no podía cambiar de color por skin. Aquí:
  `npx @gltf-transform/cli@4.5.1 optimize p1-monograma-mb.glb monograma-mb.opt.glb --compress draco --no-simplify --join false`
  (69.6 KB; sigue habiendo dos nodos, `MB` y `Punto`). Los demás `.opt.glb` ya conservaban sus nodos nombrados y se copian intactos.
- **Pósters `apple-<skin>-1200`** (brutalist, neo, persona, terminal): esas skins solo tienen gemela en tiempo real en el
  estudio (sin render de Cycles). Se derivan del póster de `apple` recoloreando solo el punto (`scripts/poster-acento.mjs`).
  Son una derivación declarada, no un render; el póster exacto queda pendiente en el estudio.
- **Capturas de pantalla** de los dispositivos: los PNG de `logo3d/realtime/public/casos/` pasados a WebP q90 (mismo tamaño en px).
- Los `camara.json` de cada pieza NO están aquí: se importan como módulo desde `src/three/piezas/camaras/` (van dentro del
  chunk de la pieza, sin petición extra).
