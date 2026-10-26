# FarmFrame v0.94 — Auditoría de la versión

Fecha: 2026-10-14 · Punto de partida: v0.84 (zip entregado por ti) · Estado: **mejoras reales y probadas con herramientas parciales; todavía sin probar en navegador ni con las herramientas oficiales desde la v0.85.**

> Regla de esta auditoría: separo siempre **lo que se ejecutó de verdad**, **lo que solo revisé yo con herramientas sustitutas** y **lo que nadie ha probado**. Si algo no está en la primera categoría, no es una garantía.

---

## 1. Resumen en 10 líneas

1. Auditoría inicial de la v0.84 y corrección de defectos de **seguridad de datos** (fuga entre cuentas, escrituras concurrentes) y de **confiabilidad** (datos de edad desconocida mostrados como frescos, caché indistinguible de red).
2. Se añadieron **puertas automáticas** que antes no existían: integridad de datos, matriz de funciones, cobertura de armas con códigos de salida, y un medidor de traducción con candado.
3. El **buscador** pasó de entender solo inglés/español a entender **9 idiomas** (antes borraba por completo el cirílico, chino y japonés).
4. Se corrigió el **error de imágenes cruzadas** (Jade mostraba una paleta de colores): causa y arreglo verificados en el código.
5. Se arreglaron las **cajas de Rotations** que estiraban toda la fila al expandirse, y se pesaron las **imágenes** (8,5 MB → 0,4 MB).
6. La **imagen del Home** rota entre Warframes Prime sin Vault y Warframes nuevos.
7. Se creó el **sistema multilenguaje** (9 idiomas, banderas en SVG arriba, carga bajo demanda, plurales por idioma).
8. Traducción: **34 de 77 pantallas** completas, 820 claves × 9 idiomas, y las frases que genera la lógica del programa (Asesor, Farm Now, Plan).
9. **Falta mucho**: 43 pantallas (463 cadenas), 9 módulos de lógica, los textos largos de datos y la **revisión por nativos** (nadie nativo ha leído nada).
10. **Hallazgo de esta auditoría (no corregido):** el buscador incluye los 8 diccionarios completos y eso engorda el módulo de búsqueda (ver §6, riesgo R1).

---

## 2. Qué se hizo, versión por versión

| Versión | Qué cambió | Estado de verificación |
|---|---|---|
| **0.85** | Auditoría de la v0.84. **D1** cambio de cuenta: los datos de la cuenta A ya no se suben a la B (`syncGuard`). **D2** dato sin marca de tiempo ya no es "FRESH". **D3** la caché se marca (`Rec.via`) y se dice en pantalla. **D4** un "fallback" inexistente en el registro de fuentes. **D5** escrituras concurrentes: `syncPush` solo escribe si la nube no cambió desde que este dispositivo la vio (usa `updated_at`, sin SQL nuevo). Matriz de funciones, pruebas de integridad, script de cobertura con códigos 0/1/2 | **En tu PC**: typecheck real OK, vitest 265/265, build OK, `npm audit` de producción = 2 avisos moderados de React Router. **Sin probar**: D1 y D5 contra Supabase real |
| **0.86** | Cajas de Rotations (ya no estiran la fila). Buscador: "necesito créditos", "lore de X". Imagen del Home que rota (`heroFrames`) | Solo mi ejecutor + capturas de una página simulada |
| **0.87** | 9 retratos PNG → WebP (8,5 MB → 0,4 MB). Línea "Retrieved" con fecha y "desde la caché" | Comparación visual lado a lado; resto como arriba |
| **0.88** | Más español natural en el buscador (compro, saco, cuánto cuesta…). Etiqueta accesible en Builds. Casos límite de probabilidades fijados con pruebas | Ejecutor |
| **0.89** | **Sistema de idiomas**: 9 idiomas, banderas SVG arriba, diccionarios por archivo cargados solo al elegirlos, recuerda la elección | Ejecutor + captura de la barra |
| **0.90** | **Buscador en 9 idiomas** (`multilang.ts`, normalización Unicode). Pantallas de error, 404, bienvenida, Invasiones, Baro. Medidor de cobertura + candado en las pruebas | Ejecutor |
| **0.91** | Tracking, Fissures, Relics, etiquetas de fichas. **Plurales por idioma** (`tp`, ruso con 3 formas). Medidor más honesto | Ejecutor |
| **0.92** | **Error de imágenes cruzadas (Jade)** corregido. Rotations, Builds, tarjetas del buscador, Asesor. **Frases de la lógica** traducidas (`t()` dentro de `src/lib`) | Ejecutor |
| **0.93** | Farm Plan, Roadmap, Planner, menús de sección | Ejecutor |
| **0.94** | Página de Cuenta y mensajes de error de acceso | Ejecutor |

Archivos: alrededor de **59 modificados y 40 nuevos** respecto a la v0.84 (conteo aproximado por `diff`). Nuevos importantes: `src/i18n/*` (9 diccionarios + núcleo), `src/LangBar.tsx`, `src/lib/{syncGuard,syncPush,multilang,heroFrames,catLabel,statusKey,featureMatrix}.ts`, `scripts/{measure-coverage,i18n-audit}.mjs` y sus pruebas, `docs/{I18N,FARMFRAME_V084_AUDIT}.md`.

---

## 3. Evidencia: qué se ejecutó y dónde

| Comprobación | Dónde | Resultado |
|---|---|---|
| `npm ci`, `typecheck` real, `vitest` real, `vite build`, `npm audit --omit=dev` | **Tu PC, v0.85** | Todo en verde (265 pruebas); 2 avisos moderados en producción |
| Lo mismo para v0.86 → v0.94 | **Nadie** | **No ejecutado** |
| Pruebas con ejecutor sustituto (no es vitest) | Mi entorno, v0.94 | 71 archivos, **358 pruebas pasan** |
| Typecheck parcial (tsc 6, con tipos simulados de React) | Mi entorno | Sin errores en los módulos puros y diccionarios; **las pantallas solo tienen revisión de sintaxis** |
| Capturas con Chromium y tu CSS real | Páginas simuladas (Rotations, Home, barra de banderas) | Correctas; **no es la app real** |
| Datos del juego frente a una fuente real | Nadie | **Nada verificado** |

**Lección ya aprendida:** mi ejecutor sustituto no era fiel a Vite en un detalle (nombres de archivos de `import.meta.glob`) y por eso una prueba mía falló en tu PC. Sus resultados valen menos que una ejecución real.

---

## 4. Métricas

| Métrica | Valor |
|---|---|
| Claves de traducción | **820** por idioma (más 38 formas plurales extra en ruso) |
| Idiomas | 9: inglés, español, portugués (Brasil), francés, alemán, italiano, ruso, chino simplificado, japonés |
| Pantallas sin texto escrito a mano | **34 de 77** |
| Cadenas que quedan en pantallas | **463 en 43 pantallas** |
| Pruebas | 358 (ejecutor sustituto) |
| Tamaño de un diccionario | inglés ≈ 39 KB (≈ 14 KB comprimido); otros idiomas 15–18 KB comprimidos (estimado desde el código fuente, **no desde un build real**) |

---

## 5. Qué funciona (con su nivel de prueba)

**Probado en tu PC (v0.85):** el proyecto compila, tipa y pasa sus pruebas; sin vulnerabilidades de producción más que React Router 6 (2 moderadas).

**Probado solo por pruebas automáticas mías:**
- Cambio de cuenta no filtra datos; escritura guardada por versión; dato sin fecha = STALE; caché indicada.
- Buscador en 9 idiomas (≈ 60 frases de prueba) y las frases existentes en inglés/español siguen igual.
- Plurales correctos en inglés y ruso; frases de la lógica en 8 idiomas; mensajes de cuenta nombran el botón con su texto real.
- Cada diccionario tiene exactamente las claves del inglés y los mismos marcadores; un archivo "terminado" no puede volver a tener inglés escrito a mano.

**Visto solo en páginas simuladas:** Rotations (caja abierta no estira a las demás), barra de banderas, cabecera del Home.

---

## 6. Riesgos y problemas abiertos (ordenados)

| # | Prioridad | Riesgo | Por qué importa | Qué haría |
|---|---|---|---|---|
| **R1** | P1 | **El buscador importa los 8 diccionarios completos** (`multilang.ts`) solo para leer ~29 nombres de páginas. Con 820 claves, la suma de los 8 diccionarios es de **unos 120 KB comprimidos** (estimado desde el código fuente) que irían al módulo de búsqueda | Un usuario que abre Ctrl K descarga mucho más de lo necesario. Lo introduje yo y creció con cada tanda | Generar un archivo pequeño con solo las claves de menú (script + prueba de sincronía). **Hallazgo de esta auditoría; no corregido.** Medir con un `vite build` real |
| **R2** | P1 | **Nada desde la v0.85 se ha probado en navegador ni con typecheck real** | Las pantallas editadas (≈ 30 archivos `.tsx`) solo tienen revisión de sintaxis; un error de tipos o un fallo visual pasaría desapercibido | Ejecutar la lista de la guía de pruebas (`FarmFrame_Pruebas_PC.md`) |
| **R3** | P1 | **Sincronización (D1, D5) sin probar contra Supabase real**. La comparación `updated_at = valor` depende de cómo viaja la marca de tiempo; si falla, saldría un error "version check failed" | Es el riesgo de integridad de datos personales | Probar dos navegadores y cambio de cuenta (guía, §6) |
| **R4** | P1 | **Traducciones no revisadas por nativos.** Ya encontré errores míos: una doble negación en ruso, formas plurales rusas ausentes en cuatro frases, y dos claves mal marcadas | Cualquier idioma puede tener errores de gramática, tono o términos del juego | Revisión por hablantes; cada archivo es `clave: "texto"` |
| **R5** | P1 | **Imágenes cruzadas: puede haber más casos** además de Jade. El error de prioridad afectaba a cualquier nombre presente en el catálogo y en el índice extra | El usuario lo vio en la web real | Lista de nombres que aún salgan mal (guía, §6h) |
| **R6** | P2 | Dependencia de datos no verificados: `releaseDate` y `vaulted` del catálogo (imagen del Home); `pct()` asume fracciones; `eff()` redondea a 0 chances ínfimas | Etiquetas o cifras pueden ser engañosas | Revisar el JSON real del catálogo |
| **R7** | P2 | Faltan límites en SQL (D6: tamaño de `user_state`) y el límite de reportes es solo del navegador (D7) | Abuso posible, bajo | SQL opcional ya propuesto, sin aplicar |
| **R8** | P2 | 6 vulnerabilidades solo de desarrollo y 2 moderadas de React Router 6 en producción | Bajo para la web publicada | Subir a React Router 7 como tarea aparte |
| **R9** | P2 | El contraste de algunos pares de colores queda por debajo de 4,5:1 (rojo y turquesa oscuro sobre las superficies más claras) | Accesibilidad | Comprobar cuáles se usan |

---

## 6.1 Errores míos descubiertos durante el trabajo (para que sepas qué vigilar)

- Cifras que di y luego corregí: "679 cadenas" (eran 997 cuando el escáner mejoró) y "241 pruebas" (eran 238).
- Dije que un archivo "estaba traducido" mientras el escáner no veía frases con plantillas; ahora las ve.
- Mi herramienta de añadir claves **escribía antes de validar**; ya valida primero.
- Una prueba mía de la matriz falló en tu PC (formato de claves de Vite).
- Cambié el icono de daño de las fichas para que no dependa del texto en inglés; **debes comprobarlo** en una página de arma.

---

## 7. Lo que falta HACER AHORA (próximas tandas)

### 7.1 Pantallas (43, con cadenas pendientes)
Helminth (48), Part (32), Guides (28), Mastery (26), Syndicates (24), Patches (23), Lore (22), Resources (19), ReportIssue (18), Farm (17), Alerts (15), SetPrice (14), PartSearch (14), OppList (13), Entity (12), Methods (12), BuildAI (11), Finder (11), Sources (11), ModPrice (10), Enemies (9), KDrives (9), MarketCheck (8), Descendia (7), Explore (6), SetFarm (6) y 17 más pequeñas (1–5 cadenas cada una).

### 7.2 Lógica con frases en inglés (`src/lib`)
`build.ts` (avisos de capacidad), `part.ts`, `drops.ts`, `vendor.ts`, `descendia.ts`, `resources.ts`, `trade.ts`, `probe.ts`, `lore.ts` (≈ 49 frases) y `sources.ts` (≈ 89 descripciones del registro de fuentes). Método ya probado: `t("clave", {vars})` dentro de la función, con el texto inglés idéntico, así las pruebas existentes siguen valiendo.

### 7.3 Textos largos en `src/data` (≈ 300 KB de datos, parte prosa)
`guides.ts` (20 KB), `methods.ts` (46 KB), `helminth.ts` (29 KB), `masteryData.ts` (27 KB), `syndicateWiki.ts` (158 KB). Son prosa a traducir idioma por idioma; no se puede automatizar sin riesgo de errores.

### 7.4 Corregir ya
- **R1** (separar los términos de menú del buscador).
- Medir un `vite build` real: tamaños de diccionarios y del módulo de búsqueda.
- Arreglar lo que salga del typecheck real y de las pruebas manuales.

---

## 8. Lo que queda PARA MÁS ADELANTE

1. **Revisión de traducciones por nativos** de los 8 idiomas, con un flujo simple (corregir el archivo y correr las pruebas).
2. **Nombres de objetos en cada idioma**: el catálogo podría traer nombres traducidos (`i18n`); no se ha comprobado y la búsqueda hoy indexa solo nombres en inglés.
3. Dividir los diccionarios por **áreas** (carga bajo demanda por pantalla) cuando crezcan más.
4. Idiomas de derecha a izquierda (árabe, hebreo) y más idiomas (coreano, polaco, turco, ucraniano, etc.).
5. **Instantánea fija del catálogo** con conteos reales para activar el control de cobertura en CI (necesita red).
6. **React Router 7** y subida de las herramientas de desarrollo.
7. Control de concurrencia más fuerte en SQL (columna de versión) y límites de tamaño/uso en el servidor.
8. Datos del juego: no hay fuente estructurada para el **Prime Access actual**, misiones/gates, escalado de enemigos, adversarios, arcanos e Incarnon (evoluciones y Circuit semanal). Hay que elegir y verificar una fuente antes de modelarlos.
9. **Pruebas en navegador automatizadas** (Playwright) en 360, 768 y 1280 px, más axe para accesibilidad.
10. Calculadora de probabilidad tras N intentos, solo cuando lo básico esté estable.

---

## 9. Reglas de diseño que se fijaron (para no romperlas después)

- Los **nombres propios del juego** (Warframes, armas, funciones como Steel Path Honors, Duviri, Archimedea, Sortie, Nightwave) se quedan en inglés, como en el juego.
- Una **sola clave por texto**; nunca juntar trozos de frase en código (el orden cambia según el idioma). Números y nombres entran como `{marcadores}`.
- **Plurales** con `tp()`: `_one` y `_other` (ruso también `_few`, `_many`); una prueba lo exige.
- Listas con `Intl.ListFormat` (coma y "o/y" según el idioma).
- Un título traducido necesita `art="Nombre en inglés"` para no perder su imagen.
- Un archivo solo se añade a la lista de "terminados" cuando el medidor da cero; desde ahí las pruebas lo protegen.
- No se inventan datos del juego: lo que no está en la fuente se dice como "no disponible".

---

## 10. Cómo comprobar todo esto en tu PC

Orden recomendado (el detalle paso a paso está en `FarmFrame_Pruebas_PC.md`):

1. `npm ci && npm run typecheck && npm test && npm run build` y abrir con `npm run preview`.
2. **Cuentas y sincronización** (lo más delicado): cambio de cuenta, invitado que inicia sesión, dos navegadores con la misma cuenta.
3. **Imágenes**: Jade y unas 20 tarjetas más.
4. **Idiomas**: banderas, recarga que recuerda el idioma, pestaña Network (un solo archivo por idioma).
5. **Buscador** con las frases de la tabla (francés, alemán, italiano, portugués, ruso, chino, japonés).
6. **Pantallas traducidas**: Rotations, Builds, Farm Plan, Roadmap, Planner, menús, Cuenta, Tracking, Fisuras, Reliquias.

Cuando tengas resultados, pásame para cada fallo: el paso, lo que esperabas, lo que viste y una captura o el mensaje completo.

---

## 11. Archivos de entrega de esta versión

- `FarmFrame-v0_94.zip` — el proyecto completo (sin `node_modules`).
- `FarmFrame_Auditoria_v0.94.md` — este documento.
- `FarmFrame_Pruebas_PC.md` — guía paso a paso de pruebas.
- `FarmFrame_CHANGELOG.md` — registro de cambios por versión.
- `FarmFrame_I18N.md` — cómo funciona el multilenguaje y cómo continuarlo.
- `FARMFRAME_V084_AUDIT.md` — auditoría técnica detallada (hallazgos D1–D13, cambios por sección).
