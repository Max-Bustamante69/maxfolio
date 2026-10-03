# Activos 3D de Plató · fuentes, autores y licencias

Actualizado el 2026-10-03 (ronda 10).

## El teléfono: modelo propio, procedural

El teléfono de la ficha **no es un modelo descargado**: lo construye `src/themes/plato/escena/telefono.ts` con geometría de three.js. No hay GLB en el sitio y no hay créditos que dar.

Antes de construirlo se buscó un modelo real con licencia abierta (poly.pizza, sin iniciar sesión; 25 candidatos con la palabra «phone»). Se descargaron y se abrieron en un visor propio los nueve que podían pasar por teléfono:

| Modelo | Autor | Licencia | Triángulos | Por qué no |
|---|---|---|---|---|
| Smartphone | smallbigsquare | CC0 | 182 | una caja con textura de paleta; sin bisel ni cámara |
| Phone | Quaternius | CC0 | 224 | tres colores planos, sin UV ni pantalla separada |
| Smart phone | Rendercore | CC-BY | 7 947 | trae su propia orientación rota (exportado de FBX), cuerpo azul eléctrico, cámara plana y piezas sueltas (tarjeta SIM); la malla de pantalla no es un plano limpio |
| NotchPhone | Sal Blrm | CC-BY | 1 392 | silueta con muesca de un teléfono de marca; pantalla de colores de muestra |
| Modern Cell Phone | Bouggles | CC-BY | 60 | un bloque de 60 triángulos |
| Red Smartphone | Michael Mok | CC-BY | 508 | sin UV |
| Phone (×2) | Alex Safayan, jeremy | CC-BY | 728 y 148 | de dibujos animados, sin pantalla utilizable |
| Phone | Zsky | CC-BY | 220 | resultó ser una cabina telefónica |

Ninguno daba lo que pidió Max (un teléfono real, con esquinas de pantalla, cristal con reflejo, botones y cámara) y todos eran de estilo low poly. Decisión: construirlo con las proporciones de uno actual.

Medidas del modelo (mm, escaladas a la escena): 71,5 × 146,6 × 8,25; radio exterior de 11,8; pantalla de 65,0 × 140,7 (390:844, sin estirar); cristal frontal con clearcoat; marco biselado de titanio oscuro; botones de acción, volumen y encendido; USB-C y altavoces; trasera esmerilada con isla de cámara de tres lentes, flash y micrófono; píldora frontal genérica. Sin logotipo ni marca.

## Entorno de estudio (HDRI)

- `studio_small_09_512.hdr`: **Poly Haven**, `studio_small_09` (https://polyhaven.com/a/studio_small_09). Autor: Sergej Majboroda. Licencia **CC0 1.0** (dominio público; sin atribución obligatoria).
- Se descargó la versión de 1k (1024 × 512) y se reescaló a **512 × 256** con un filtro de caja y se volvió a codificar como RGBE con RLE (413 KB). Se convierte a PMREM una sola vez en el navegador y se libera.

## Capturas de las tiendas

Las imágenes de `public/v5/plato/tex/` y `public/v5/plato/scroll/` son capturas de las tiendas que Max construyó, hechas por él el 2026-10-03 desde sus URL públicas con un iPhone (iOS 18) de emulación, sin burbujas de chat, popups ni avisos de cookies. No llevan licencia de terceros.
