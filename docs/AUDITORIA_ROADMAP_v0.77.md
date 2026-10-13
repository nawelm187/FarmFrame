# FarmFrame — Auditoría del roadmap (estado en v0.77)

Fecha: 2026-10-12. Escrita sobre el código del zip `FarmFrame-v0.77` y las pruebas que pude correr fuera de tu PC.

## 0. Cómo leer este documento

- **Completo**: existe en el código, tiene tests o está escrito con fuente y fecha. No significa "probado en tu navegador".
- **Parcial**: hay una parte hecha y una parte que falta; se dice cuál.
- **Falta**: no existe todavía.
- **Propuesta**: idea mía, no estaba en tu roadmap. Está marcada como tal.

### Lo que NO está verificado (importante)
1. **Desde v0.67 no se ha corrido `npm run typecheck`, `npm test` ni `npm run build` en una máquina real.** Tu última corrida fue con v0.67 (un test falló por el formato numérico y se corrigió). Desde entonces hay 10 versiones (v0.68 a v0.77) revisadas solo con esbuild (sintaxis), `tsc` parcial y un shim de vitest. Los archivos `.tsx` no se pudieron tipar de verdad aquí (no hay `react` ni `vite`).
2. **Nada de lo visual se ha visto en un navegador:** etiquetas Ready/Check/Needs, tarjetas de la búsqueda, página Farming Methods, velocidad de las imágenes.
3. **Los métodos de farmeo se leyeron con un resumidor** (WebFetch devuelve resúmenes de un modelo pequeño, a veces cortados). Cada método lo dice en su campo `confidence`.
4. **No se pudo leer** los foros de Warframe, Reddit ni GitHub raw desde el servidor de trabajo.
5. **Cobertura real de armas, disposición de Rivens e Incarnon: sin medir.** El script `scripts/measure-coverage.mjs` existe y espera que lo corras tú.

---

## 1. Resumen en una tabla

| Área | Completo | Parcial | Falta |
|---|---|---|---|
| Núcleo de farmeo (P1) | 3 | 2 | 2 |
| Cobertura de datos (P2) | 2 | 5 | 7 |
| Calidad y pruebas (P3) | 0 | 1 | 6 |
| Búsqueda inteligente | funciona en inglés con "farm" | falla en español y con "how/como" (sección 4) | 8 mejoras listadas |
| Métodos de farmeo | 25 métodos | tablas de Aya y Endo truncadas | 10 recursos (sección 6) |

---

## 2. Roadmap original, punto por punto

### P1 — Núcleo de farmeo

| Ítem | Estado | Detalle |
|---|---|---|
| Reliquias exactas con probabilidad por refinamiento | **Completo** | `exact.ts` (`relicsForPart`, `refinement`). Existía antes de v0.67. |
| Fisuras activas ligadas a la reliquia exacta (no solo al tier) | **Completo** (v0.72) | `farmNow.ts`: `plays` ("abre Lith G1 en tal nodo") y `nodes` (todas las fisuras del tier con su estado). 2 tests. Sin ver en pantalla. |
| Farm Now: qué meta avanza cada oportunidad | **Completo** (anterior) | `farmNow.ts` ya devolvía `goals`, `advances` y `why`. |
| Farm Now: "puedes hacerlo ya" vs "requiere desbloquear X" | **Parcial** (v0.71) | `unlock.ts`: etiquetas Ready / Check / Needs. **Límite:** sale del checklist de Mastery y de las reliquias que marcaste, no del juego. No sabe quests, Mastery Rank ni sindicatos. |
| Identificadores compartidos (búsqueda, Farm Plan, Roadmap, Tracking) | **Parcial** (v0.73) | `refs.ts` define `ref`, `refOf`, `sameName`; la búsqueda y Tracking ya lo usan. **Falta migrar** Farm Plan, Roadmap, Part, Farm y Relics (siguen comparando `toLowerCase() ===`). |
| Estados de frescura `INFERRED` / `UNKNOWN` / `CACHED` | **Falta** | Hoy `Status` en `data.ts` no los tiene. |
| Roadmap como grafo de requisitos | **Falta** | `tree.ts` suma recursos compartidos; no explica bloqueos por quest, MR o sindicato. Build → faltantes → Roadmap para arcanes, adaptadores y shards: falta. |

### P2 — Cobertura de datos

| Ítem | Estado | Detalle |
|---|---|---|
| Registro de fuentes con confianza A–F | **Completo** | `sources.ts`, 29 fuentes, probado con `sources.test.ts`. Mostrado en Data Sources. |
| Imágenes rápidas (CDN) | **Completo, sin probar en navegador** (v0.68) | `imgHosts.ts`: jsDelivr → cdn.warframestat.us → GitHub raw, con regla de salto. No se confirmó que jsDelivr sirva todas las imágenes. |
| Disposición de Rivens | **Parcial** | `coverage.ts` mide cuántas armas la traen. Sin conectar a ninguna página y sin medir. La fuente oficial semanal no trae disposición. |
| Incarnon Genesis | **Parcial** | `hasIncarnonForm` detecta la forma; no hay página ni catálogo. |
| Prime Resurgence / Varzia | **Falta** | Fuente oficial registrada como planificada; los precios solo en Regal Aya. Falta confirmar la rotación. |
| Texto de las notas de parche | **Falta** | Hoy solo enlaces. El EULA restringe la lectura automática; no se descarga. |
| Kuva Liches, Sisters, Tenet, Coda | **Parcial** | Solo el método de Kuva (Flood/Siphon). No hay página de adversarios. |
| Arcanes, Focus, Operator, shards | **Parcial** | Vosfor tiene método; no hay página de Arcanes ni de Focus. |
| Mods de compañero | **Parcial** | Existe `CompanionMods.tsx`; Prosperous Retriever está en un método. |
| Cosméticos | **Falta** | |
| Quests y prerrequisitos como datos tipados | **Falta** | |
| Vendors/ofertas unificados (`Vendor/Offer/Currency/Rotation`) | **Falta** | Hay datos manuales por sindicato, Palladino y Arbitrations, sin modelo común. |
| Respaldos independientes de Baro/Nightwave | **Falta** | Hoy hay una sola fuente de mundo en vivo (WarframeStat). |
| Escalado de enemigos con fórmula verificada | **Falta** | |

### P3 — Calidad

| Ítem | Estado | Detalle |
|---|---|---|
| `npm audit` | **Falta** | 8 vulnerabilidades (2 críticas). Revisar a mano, nunca `--force`. |
| Playwright (humo + móvil) | **Falta** | |
| axe (accesibilidad) | **Falta** | |
| Lighthouse | **Falta** | Hay una guía de uso; no hay corrida registrada. |
| MSW (simular fallos de API) | **Falta** | |
| Prueba de RLS con Supabase CLI | **Falta** | |
| Tests unitarios | **Parcial** | Unos 230 casos en 58 archivos. Con un shim fuera de tu PC. |

### Datos manuales con caducidad
Sindicatos (`syndicateWiki.ts`), Acrithis, Nightwave y Railjack son manuales. Revisar tras cada update grande.

---

## 3. Lo construido desde v0.67 (para no perderlo de vista)

| Versión | Qué entró |
|---|---|
| v0.67 | Edge Functions endurecidas, validación de datos locales, `relicIssues()`, 5 fuentes nuevas. |
| v0.68 | Imágenes por CDN, bug de reliquias al 0 %, test locale-aware. |
| v0.69 | Buscador inteligente (índice, fuzzy, intents). |
| v0.70 | Tarjeta "I want this" para Warframes y armas. |
| v0.71 | Ready / Check first / Needs. |
| v0.72 | "Abre X en Y" por fisura. |
| v0.73 | Identificadores compartidos. |
| v0.74 | Sección Farming Methods + respuesta de material. |
| v0.75 | Estado `wiki` / `community`; Index con Xoris marcado como no verificado. |
| v0.76 | Orokin Cells, Plastids, Argon; 5 fuentes de comunidad registradas. |
| v0.77 | Void Traces, Vosfor, Gallium, Nitain Extract, Tellurium. |

---

## 4. Búsqueda inteligente: lo que todavía no está bien

> **Actualización v0.78:** los 11 fallos de la tabla 4.1 que estaban rotos (todos menos "fastest way to farm credits") se corrigieron y quedaron como frases de prueba en `search.golden.test.ts`. Siguen pendientes: 4.2 puntos 3 (comparar, precio, quién es mejor), 5 (cobertura declarada), 7 y 8. Lo de abajo describe el estado de v0.77.

### 4.1 Fallos medidos (probados con el código de v0.77)

Probé 12 frases con `detectIntent`, `methodsFor` y el índice de métodos:

| Frase | Resultado real | Problema |
|---|---|---|
| `mejor forma de farmear creditos` | intent "method", **0 métodos** | El material se busca por nombre exacto en inglés: "creditos" ≠ "Credits". **Falla en español.** |
| `como conseguir creditos rapido` | idem, 0 métodos | Igual. |
| `how to get orokin cells` | **sin tarjeta** (intent nulo) | "how do I get X" es la forma más natural y hoy no abre la tarjeta de respuesta. |
| `como encuentro gallium` | sin tarjeta | Solo detecta "where/donde/who" o una palabra de farmeo, no "how/como". |
| `best way to get endo fast` | sin tarjeta | "get" cuenta como relleno; el intent no se activa. |
| `que es vosfor` | sin tarjeta | No existe el intent "qué es X" (información). |
| `credit farm xoris` | intent "where" con sujeto `credit farm xoris` | Se abre una tarjeta de fuentes para un "ítem" que no existe, en vez de ir al método. |
| `farm plat` | sujeto `plat`, 0 métodos | Falta sinónimo `plat` → Platinum. |
| `donde farmear aya` | 2 métodos, pero el índice no devuelve ninguno | Los alias están solo en inglés. |
| `kuva lich` | sin resultado | No hay método ni página. |
| `ayatan` | resuelve a un método de Endo | Correcto, pero por casualidad de palabras. |
| `fastest way to farm credits` | correcto (6 métodos) | Funciona. |

Conclusión: **el buscador funciona en inglés con frases con "farm"; falla justo en el caso que tú pusiste de ejemplo ("cómo encuentro este material X")** y falla en español.

### 4.2 Problemas de diseño (por análisis, no medidos)

1. **No hay glosario de sinónimos ni traducción** (créditos/credits, plat/platinum, cells, kuva, "forma"/"way"). Hace falta un léxico de dominio ES↔EN.
2. **La intención se decide con listas de palabras**, sin saber qué tipo de cosa se nombró. Mejor: primero reconocer la entidad (material, Warframe, arma, mod, reliquia) y después decidir la respuesta según su tipo.
3. **Faltan intenciones:** "qué es X", "para qué sirve X", "cuánto cuesta X", "comparar X con Y", "qué necesito para X", "cuál es la mejor Warframe para Y", "cuándo vuelve X" (Baro, Varzia).
4. **Los métodos solo cubren 15 materiales.** Cualquier otro devuelve "no hay método". Hace falta una cobertura declarada y visible.
5. **Los recursos y objetos solo se cargan al escribir 2 letras**, y la tarjeta de ítem espera las tablas de drops; con red lenta, la primera pulsación no muestra nada.
6. **Sin evaluación con datos reales.** Los tiempos medidos (160 ms construir, 6–14 ms buscar) son con 7.500 entradas inventadas. No hay un conjunto de frases con la respuesta esperada que corra en CI.
7. **Sin "¿quisiste decir…?"** ni sugerencias al vaciar resultados, ni historial reciente.
8. **Sin registro de búsquedas sin resultado** (anónimo, opcional) para saber qué le falta a la web.
9. **"Más rápido" significa menos tiradas o mejor chance**, no menos minutos: ninguna fuente midió tiempo.
10. **Respuesta compuesta ausente:** "farmear X para mi meta Y" debería combinar Farm Now + método + dónde.
11. **Accesibilidad de las tarjetas** (`aria-live`, foco) sin probar con lector de pantalla.

### 4.3 Qué construir (en orden)
1. Léxico ES↔EN + sinónimos (≈300 términos de dominio) aplicado antes de buscar.
2. Reconocimiento de entidad con `refs.ts` y respuesta por tipo de entidad.
3. Intenciones nuevas: info, uso, precio, comparar, requisitos, "cómo consigo".
4. Archivo `search.golden.json` con ≥150 frases en ES y EN y su resultado esperado, ejecutado en `npm test`.
5. Cobertura visible: "Tengo métodos para: …" y aviso cuando falta.
6. Tarjeta de ítem que no espere a las tablas para mostrar lo que ya sabe (nombre, tipo).
7. "¿Quisiste decir?" y recientes.
8. Registro opcional de búsquedas sin resultado en Supabase (con consentimiento y sin datos personales).

---

## 5. Lo que añadiría a la web

### 5.1 Secciones nuevas (propuestas)

| Sección | Qué contiene | Por qué |
|---|---|---|
| **Resources hub** (una página por moneda/recurso) | Para cada recurso (Credits, Endo, Platinum, Aya, Steel Essence, Vosfor, Void Traces, Kuva…): qué es, tope de almacenamiento, para qué sirve, mejores fuentes, métodos, precio de mercado. | Es lo que más se busca y hoy está repartido entre Resources, Finder y Methods. |
| **Calendario de eventos** | Cuenta atrás de Baro, Varzia, Teshin, Archon Hunt, Archimedea, Nightwave, Circuit, eventos. | El mundo en vivo ya se carga; falta juntarlo. |
| **Progresión y quests** | Orden de quests, qué desbloquea cada una, Junctions, MR requeridos. | Es la base de "requiere desbloquear X" (hoy es solo un aviso). |
| **Rivens** | Disposición, comparador, precios (cuando haya fuente verificada). | Falta la fuente. |
| **Incarnon** | Genesis, evoluciones, cómo desbloquear. | Detección hecha; falta el catálogo. |
| **Arcanes** | Lista, dónde se consiguen, cuánto Vosfor dan, coste de colección. | Vosfor ya está en Methods. |
| **Adversarios** | Kuva Lich, Sisters, Tenet y Coda; Requiem; Parazon. | |
| **Focus y Operator** | Escuelas, lentes, Amp. | La wiki tiene una guía de Amp. |
| **Colección de Warframes y armas** | Checklist de lo que tienes, con "me falta". | La wiki tiene "Warframe Collection Checklist". |
| **Glosario** | Términos del juego y siglas (EHP, SP, MR, Forma, Reactant…). Ayuda a la búsqueda y a novatos. | |
| **Changelog dentro de la web** | `CHANGELOG.md` en una página. | Ya existe el archivo. |

### 5.2 Herramientas (propuestas)
- **Calculadora de costo de mejora de mods** (Endo) y de Forma.
- **Planificador de refinamiento de reliquias** (Void Traces).
- **Comparador de armas y de Warframes.**
- **Calculadora de daño** (ya hay `calc.ts`; falta página dedicada).
- **Alertas** (aviso al abrir cuando aparece algo de tu lista), si se acepta guardar la preferencia.

### 5.3 Secciones más específicas o profesionales
1. **Farming Methods por recurso, no una lista plana** (filtros por nivel, por prerrequisito, por Warframe necesaria).
2. **Ficha de método con "Qué necesito", "Cómo lo hago", "Qué no me dice la fuente".** Ya está en la mitad; falta "Qué necesito" en formato tabla.
3. **Sección "Comunidad" separada** para estrategias no verificadas, con su aviso, fecha y enlace.
4. **Página "Calidad de datos"** (hoy Data Sources): por cada sección, cuántos datos son manuales, cuál fue el último chequeo y qué fuente falló.
5. **Modo principiante / veterano** que cambia el orden de lo mostrado.

### 5.4 Calidad y confianza
- Insignia de fuente en cada tarjeta (A–F) con enlace.
- Fecha de lectura visible en todo dato manual.
- Prueba de que el sitio funciona sin conexión para lo ya cargado (PWA) — propuesta.
- Idioma: el sitio está en inglés a propósito; el buscador debe entender español sin traducir la interfaz.

---

## 6. Farming Methods (estado)

- **25 métodos:** 23 leídos en la wiki y 2 de comunidad (Index con Xoris; Index en solitario).
- **Materiales con método (15, con 19 nombres de búsqueda):** Credits, Aya, Endo, Kuva, Forma, Orokin Cells, Plastids, Argon Crystals, Steel Essence, Void Traces, Vosfor, Gallium, Nitain Extract, Tellurium, Ayatan Star.
- **Contradicciones de la wiki ya anotadas en los métodos:** Credit Booster en The Index; Tellurium en Archwing/Empyrean; boosters en la fórmula de Void Traces.
- **Tablas truncadas:** Aya y Endo (leídas solo en parte); Plastids (cortada); relics de Forma (cortada).
- **Faltan recursos:** Neurodes, Rubedo, Detonite, Pathos Clamps, Vitus Essence, Entrati Lanthorn, Platino, Rivens, Kuva Lich, Arcanes.
- **Faltan métodos fuertes de comunidad:** los hilos de los foros no se pueden abrir desde el servidor; hace falta que los abras tú y pegues el texto.
- **Sin builds de 0 Forma verificados.** No hay datos de polaridad por compañero en esta sesión.
- **Regla de seguridad del contenido:** solo estrategias de juego normal. Los trucos que dependen de un bug no se publican (pueden parchearse y DE puede sancionar su abuso).

---

## 7. Orden recomendado

1. **Tú, en tu PC (30 min):** `npm ci && npm run typecheck && npm test && npm run build`, y pásame cualquier error. Sin esto, todo lo anterior sigue sin verificar.
2. **Buscador:** léxico ES↔EN + intención "cómo consigo X" + "qué es X" + archivo de frases de prueba. Es el cambio con más impacto y corrige fallos medidos.
3. **Resources hub** (junta Resources, Finder y Methods).
4. **Identificadores compartidos** en Farm Plan y Roadmap, y estados `INFERRED/UNKNOWN/CACHED`.
5. **Datos que ya están medibles:** correr `measure-coverage.mjs`, decidir Rivens e Incarnon con números reales.
6. **Roadmap como grafo de requisitos** con quests y Mastery Rank.
7. **Más métodos:** recursos que faltan y los hilos de foros que pegues.
8. **Calidad:** `npm audit` a mano, Playwright, axe, Lighthouse, MSW, prueba de RLS.

## 8. Lista de comprobación para tu PC

- [ ] `npm ci && npm run typecheck && npm test && npm run build`
- [ ] Ver Home y Roadmap: etiquetas Ready/Check/Needs y "Open X in Y".
- [ ] Ver Farm → Farming Methods: filtros, avisos de comunidad, enlaces a fuente.
- [ ] Buscador: `que farmear ahora`, `fastest way to farm credits`, `donde conseguir forma`, `xoris index`, `vosfor arcanes loid`. Anota las que fallen.
- [ ] Imágenes: ¿cargan más rápido que antes?
- [ ] `node scripts/measure-coverage.mjs` y pegarme la salida.
- [ ] `npm audit` (sin `--force`) y revisar a mano.
- [ ] Abrir los hilos de foros de Warframe (Index con Xoris) y pegarme el texto.
- [ ] Decidir si se fuerza el formato numérico en-US.
