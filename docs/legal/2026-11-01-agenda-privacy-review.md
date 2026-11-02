# Revisión del aviso de privacidad de la agenda

Fecha: 1 de noviembre de 2026, America/Bogota. Documento de auditoría técnica y borrador jurídico, sin privilegio abogado-cliente ni aprobación de abogado. Fuente reescrita, pendiente de integración y publicación.

## Alcance e identidad

Repositorio exacto: [Max-Bustamante69/maxfolio](https://github.com/Max-Bustamante69/maxfolio). La base remota verificada es [main, 411f60f4425d9ebeeb12341507e7d78c7c9937b1](https://github.com/Max-Bustamante69/maxfolio/commit/411f60f4425d9ebeeb12341507e7d78c7c9937b1). No existe una rama remota llamada integrationmain; se interpretó como la integración main indicada en el encargo. No se creó dev. Rama de entrega: codex/legal-maxfolio, en worktree propio; no se cambió ninguna rama compartida.

Se modifica exclusivamente el contenido del [aviso ES/EN](https://github.com/Max-Bustamante69/maxfolio/blob/codex/legal-maxfolio/public/privacidad.html), más este informe y sus evidencias. El responsable sigue siendo Maximiliano Bustamante, Medellín, con el correo que ya figuraba en el aviso. No hay evidencia que permita sustituirlo por Digitdeck. No se consultaron secretos, cuentas privadas de calendario, datos de clientes, Admin ni Drive.

## Verificación del servicio antes de redactar

La apertura con la herramienta web falló, pero no demostró retiro. Una solicitud HTTP independiente verificó:

| Solicitud | Resultado |
| --- | --- |
| [Dominio sin www](https://maxfolio.dev/privacidad.html) | Redirige a www; 200, HTML, servidor Vercel |
| [Aviso publicado](https://www.maxfolio.dev/privacidad.html) | 200; 3.049 bytes; coincide con la fuente de main normalizando saltos de línea |
| [Agenda real, solo GET](https://www.maxfolio.dev/api/agenda) | 200 JSON; ok=true, America/Bogota, 20 minutos, 198 franjas; solo se conservó el conteo |

SHA-256 del HTML publicado anterior: b1e3a617d5bdfac43efe52bc49572c3fc5a0747de36dd488f19e0e606bbc92ad. No se enviaron reservas ni formularios de prueba. GET acredita disponibilidad de la API, no la creación de eventos, la entrega de invitaciones ni la configuración privada de Google.

## Referencia y derecho aplicable

Se contrastó la plantilla completa [General Legal, Privacy GDPR Enhanced](https://github.com/General-Legal/legal-templates/blob/6d6805425eabd41bed86fc1e2ec51612760f716c/templates/privacy-policy-gdpr/template.md), SHA 6d6805425eabd41bed86fc1e2ec51612760f716c, también HEAD al consultar; [licencia CC0](https://github.com/General-Legal/legal-templates/blob/6d6805425eabd41bed86fc1e2ec51612760f716c/LICENSE). Se usó su esquema de datos, finalidades, destinatarios, conservación, derechos y contacto, sin importar cláusulas estadounidenses, GDPR, DPO, SCC ni categorías de datos ajenas al producto. General Legal no revisó esta adaptación.

Fuentes oficiales consultadas en esta revisión:

- [Ley 1581 de 2012, Colombia Compra Eficiente](https://relatoria.colombiacompra.gov.co/normativa/ley-1581-de-2012/), artículos 8 a 16 y 26; contraste con [compilación MinTIC](https://normograma.mintic.gov.co/mintic/compilacion/docs/ley_1581_2012.htm).
- [Decreto 1074, capítulo 25, autorización y temporalidad](https://normativa.colpensiones.gov.co/colpens/docs/decreto_1074_2015_pr025.htm) y [políticas y avisos](https://normativa.colpensiones.gov.co/colpens/docs/decreto_1074_2015_pr026.htm), artículos 2.2.2.25.2.2 a 2.2.2.25.2.8 y 2.2.2.25.3.1 a 2.2.2.25.3.5. La compilación de Colpensiones indica actualización de 2020; se identifica esa limitación, sin presentarla como reforma de 2026.
- [SIC, quejas de datos personales](https://sedeelectronica.sic.gov.co/atencion-y-servicios-a-la-ciudadania/servicios/quejas-datos-personales) y [criterio sobre revocación y supresión](https://sedeelectronica.sic.gov.co/publicaciones/boletin-juridico/concepto/derecho-la-tranquilidad-y-supresion-de-datos-personales-0).
- [Google, privacidad](https://policies.google.com/privacy?hl=es), [Vercel, privacidad](https://vercel.com/legal/privacy-notice) y [Vercel Web Analytics, privacidad](https://vercel.com/docs/analytics/privacy-policy).

La operación colombiana y la identidad declarada justifican partir de Ley 1581. Accesibilidad internacional y traducción inglesa no prueban por sí solas aplicabilidad de GDPR o de leyes estatales de EE. UU.; alcance territorial y público real requieren confirmación si se dirige la oferta a otros mercados. No es una opinión jurídica de vigencia exhaustiva ni una certificación de cumplimiento.

## Correspondencia entre cláusulas, hechos y fundamento

Las rutas siguientes se fijan al SHA base auditado, para no confundir código disponible con configuración activa.

| Cláusula | Evidencia del producto | Fundamento y resultado |
| --- | --- | --- |
| Responsable y contacto | [Aviso anterior](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/public/privacidad.html) | Identidad preservada. No se atribuye responsabilidad a la agencia. |
| Datos y finalidades | [Contrato del formulario](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/src/themes/shared/agenda.ts) y [API](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/api/agenda.ts) | Confirmados nombre, correo, horario, opcionales, origen, UTM y fecha de aceptación; se añaden IP y prevención de abuso. Finalidad y autorización, arts. 4, 9 y 12. |
| Autorización | [Validación consentimientoDatos y descripción del evento](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/api/agenda.ts) | Casilla exigida en código; no se probó POST. La fecha no incluye hash o versión del aviso. La prosa no implementa controles nuevos. |
| Servicios | [Calendar/Meet y runtime](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/api/agenda.ts) y [respaldo Google](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/src/themes/shared/ReservaGoogle.tsx) | Se retira la exclusividad falsa. Google y Vercel tienen evidencia; no se inventan contratos, roles jurídicos ni residencia. |
| Medición | [Eventos](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/api/event.ts), [track](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/src/lib/track.ts), [Analytics](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/src/App.tsx), [cookie](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/ab.config.ts) | El cliente envía eventos propios sin los campos del formulario y monta Analytics; mf_v tiene 90 días en código. Persistencia del ledger y activación de Analytics no verificadas en panel. |
| Conservación | [Creación del evento, sin borrado programado](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/api/agenda.ts) | Se explica conducta real y límite normativo del art. 2.2.2.25.2.8; no se inventa un plazo operativo ni se afirma borrado automático. |
| Derechos y trámite | Canal del aviso previo; Ley 1581, arts. 8, 14, 15 y 16 | Se añaden consulta 10+5 días hábiles, reclamo 15+8, subsanación, desistimiento, traslado, marca de reclamo y SIC. Son obligaciones a operar, no un backend nuevo ni SLA demostrado. |

## Riesgos y condiciones antes de publicar

Evaluación conforme a legal-risk-assessment. Se expresa impacto y evidencia; no se asigna probabilidad ni producto numérico sin datos.

| Hallazgo | Estado y gravedad | Acción necesaria |
| --- | --- | --- |
| Política completa de tratamiento no localizada en el alcance | Pendiente, alta | Confirmar política real y acceso para titulares. Este aviso ampliado no acredita por sí solo la política del art. 2.2.2.25.3.1; faltan dirección y teléfono confirmados y vigencia operativa de la base. No se inventan. |
| Retención efectiva, purga, copias y accesos al calendario | Pendiente, alta | Max debe definir y operar criterios documentados de supresión, conservación legal y tratamiento de copias; comprobar permisos del calendario. El código revisado no los acredita. |
| IP y almacenamiento opcional | Condicional, alta | [La API](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/api/agenda.ts) forma claves con IP; [el helper](https://github.com/Max-Bustamante69/maxfolio/blob/411f60f4425d9ebeeb12341507e7d78c7c9937b1/api/_kv.ts) usa KV externo si se configura y memoria si no. Upstash aparece como integración posible, no como proveedor activo probado. Verificar panel y contratos antes de cerrar destinatarios, transmisiones y retención técnica. |
| Google/Vercel y tratamiento internacional | Pendiente, alta | Confirmar modalidad de cuenta, contratos, encargos/transmisiones y mecanismos aplicables. No se promete residencia colombiana ni se afirma que la casilla sanee cualquier transferencia. |
| Consentimiento, origen y analítica | Confirmado en código; suficiencia jurídica pendiente, alta | Verificar necesidad de UTM, legitimación de cookie/medición y consentimiento cuando corresponda. La casilla de cita no controla Analytics ni los eventos; el texto lo revela y no corrige la conducta. Versionar la prueba de autorización. |
| Respaldo de reservas Google | Confirmado en código; configuración pendiente, media | Inspeccionar campos, aviso y autorización del formulario alojado por Google sin enviar datos ficticios. No se presume equivalente al formulario propio. |
| Atención de titulares | Canal previo confirmado; capacidad operativa pendiente, alta | Confirmar recepción, seguimiento de términos, marca de reclamo y respuesta de Max. No se envió correo a terceros ni se probó el buzón. |

Estos pendientes condicionan publicación y revisión jurídica; no impiden entregar este PR borrador. No se atribuye revisión a un abogado ni a General Legal.

## Validación proporcional

HTML: etiquetas balanceadas, ES/EN con la misma estructura de 7 apartados, 14 párrafos y 2 elementos de lista por idioma, sin scripts ni placeholders. Comparación del bloque CSS contra main: idéntico. Se revisaron manualmente equivalencia de obligaciones, identidad, datos, fechas y términos, y se aplicó unslop. No se añadieron dependencias ni se ejecutaron build, gate completo o pruebas de Apps.

Render estático en mac-mini, Chromium headless, un navegador y páginas secuenciales, con el candado canónico de máquina. Archivos locales antes/después, 390 y 1440 px, claro y oscuro: 8 renders, 0 desbordes horizontales, 0 errores JS. Altura 390: 1.736 a 7.018 px; 1440: 1.370 a 4.531 px, por el contenido añadido. No es prueba del despliegue ni del backend. [Mediciones](https://github.com/Max-Bustamante69/maxfolio/blob/codex/legal-maxfolio/docs/legal/evidence/render-results.json) y [enlaces HTTP](https://github.com/Max-Bustamante69/maxfolio/blob/codex/legal-maxfolio/docs/legal/evidence/link-results.json).

Capturas de [antes móvil](https://github.com/Max-Bustamante69/maxfolio/blob/codex/legal-maxfolio/docs/legal/evidence/before-390-light.png), [después móvil](https://github.com/Max-Bustamante69/maxfolio/blob/codex/legal-maxfolio/docs/legal/evidence/after-390-light.png), [antes escritorio oscuro](https://github.com/Max-Bustamante69/maxfolio/blob/codex/legal-maxfolio/docs/legal/evidence/before-1440-dark.png) y [después escritorio oscuro](https://github.com/Max-Bustamante69/maxfolio/blob/codex/legal-maxfolio/docs/legal/evidence/after-1440-dark.png). Las ocho capturas quedan versionadas y el PR incluye las imágenes dentro del cuerpo.

Se verificaron los destinos públicos con HTTP sin omitir validación TLS. El enlace antiguo de SIC produjo un error de cadena de certificado en Python; se sustituyó por su servicio oficial de quejas accesible. Los mailto conservan el canal anterior y no se probaron enviando mensajes. El texto publicado previo permanece intacto; no se solicitó despliegue ni fusión. Los previews automáticos del proveedor quedan fuera de esta verificación.
