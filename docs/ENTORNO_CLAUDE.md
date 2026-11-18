# Qué puede y qué no puede hacer Claude en este proyecto

Medido el 2026-11-10 en el entorno de Claude (chat). Sirve para saber a quién le toca cada cosa y qué esperar de lo que se entrega.

## El entorno
- Ubuntu 24.04, 1 CPU, 4 GB de RAM, unos 10 GB libres. Cada comando dura como máximo 5 minutos (lo largo se lanza en segundo plano y se consulta un registro).
- **Sin red desde el sandbox**: no resuelve ningún dominio (ni npm, ni GitHub, ni Supabase, ni las fuentes de datos). `npm install` no funciona.
- Instalado: Node 22, Python 3.12, TypeScript 6, **esbuild 0.28**, **React 19.2** (el proyecto usa 18), tsx, **Playwright 1.63 con Chromium** (solo Chromium: sin Safari/WebKit ni Firefox), ImageMagick, ffmpeg, LibreOffice, pandoc, Tesseract (OCR), Java 21, gcc, y en Python pandas, numpy, matplotlib, OpenCV, Pillow, openpyxl, python-docx, python-pptx, reportlab, BeautifulSoup.
- **No instalado**: vite, vitest, react-router-dom, @supabase/supabase-js, @types/react, Deno.
- Fuera del sandbox, en el chat: búsqueda web y lectura de páginas (solo direcciones que tú des o que salgan en una búsqueda), búsqueda de imágenes, memoria, documentos.

## Lo que se puede hacer aquí sin red (carpeta `tools/offline/`)
| Comando | Qué hace | Límite |
|---|---|---|
| `npm run test:offline` | Ejecuta **todas** las pruebas (78 archivos, 403 pruebas) con un sustituto de vitest y esbuild | No es vitest: la referencia sigue siendo `npm test` |
| `npm run render:offline` | **Compila la app real y la abre en Chromium** a 320, 390, 768 y 1280 px en 15 pantallas con datos de prueba; avisa de desbordes horizontales, errores y pantallas de fallo, y guarda capturas. `npm run render:offline -- sweep 320,768,1280` recorre **todas** las rutas (41). Tarda unos 4 minutos por cada dos anchos: se lanza en segundo plano | Datos **sintéticos** (`fixtures.mjs`); React 19 en vez de 18; solo Chromium; sin red real |
| `npm run typecheck:offline` | Tipos con React, router y Supabase declarados como `any` | Débil: no ve errores de tipos de React; la referencia es `npm run typecheck` |

Los sustitutos (`vite-lite.mjs`, `shims/`) imitan `import.meta.glob`, `import.meta.env`, `react-router-dom` (solo lo que usa FarmFrame), `@supabase/supabase-js` (sin sesión) y las fuentes. Si el proyecto empieza a usar otra función de esos paquetes, el sustituto fallará y habrá que ampliarlo.

## Reparto
**Lo hace Claude y lo verifica aquí:** código TypeScript/React/CSS, traducciones a los 9 idiomas (con la auditoría de claves), pruebas, CHANGELOG, auditoría y guías, diseño en Chromium a varios anchos, detección de desbordes y errores de ejecución, imágenes y documentos (Word, Excel, PowerPoint, PDF), OCR de capturas, consulta de documentación pública.

**Lo hace Claude pero no puede verificar del todo:**
- Código que depende de datos reales (la forma exacta de los JSON de la comunidad; p. ej. `stancePolarity` está confirmado en el modelo de armas cuerpo a cuerpo, el nombre `aura` en los Warframes no).
- Funciones de Supabase (Deno), workflows de GitHub (solo se valida que el YAML sea correcto), SQL.
- Diferencias de React 18 frente a 19, Safari/iOS, Firefox, teclado en pantalla, rendimiento en un móvil real.
- Traducciones: son correctas para entenderse, pero no están revisadas por hablantes nativos.

**Fuera de su alcance (te toca a ti o requiere desbloquear algo):**
- `npm ci`, `npm test`, `npm run build` reales y el despliegue a GitHub Pages.
- Crear o restaurar el proyecto de Supabase, desplegar funciones, cuentas e inicio de sesión reales, sincronización real.
- Subir a GitHub y ejecutar los workflows.
- Comprobar datos contra el juego o contra las fuentes en vivo.
- Probar en tus dispositivos (tacto, Safari, rendimiento).
- Revisión de traducciones por nativos.
- Import from Image (necesita OCR o visión en el navegador, es decir, una dependencia nueva y red para instalarla) y los huecos de Riven/Archon Shards (necesitan datos que no hay).

## Cómo desbloquear más
1. **Activar la red del sandbox** (ajustes de red del entorno), al menos para npm, GitHub (raw y API) y Supabase: permitiría `npm ci`, el `vitest` y el `vite build` reales, y datos reales en las pruebas visuales.
2. **Subir datos reales** (por ejemplo `Mods.json` y `Warframes.json` de la comunidad): se convierten en las fixtures y las pruebas visuales dejan de ser sintéticas.
3. **Pegar la salida** de los comandos que yo no puedo ejecutar, con el texto de los errores.
4. **Capturas desde tu móvil** de lo que se ve mal: lo reproduzco en Chromium a ese ancho.
