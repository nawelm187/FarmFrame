# Auditoría v0.66 y roadmap (estado tras v0.67)

Resumen de lo verificado contra el código del zip y de lo que queda. Fuente de la lista de huecos: `FarmFrame_v0.66_Auditoria_y_Master_Prompt.md`.

## Qué se pudo verificar
- Lectura del código: `src/lib`, `src/data`, `supabase/` (3 funciones + `schema.sql`), workflows, README, CHANGELOG.
- Lógica sin pantallas (`src/lib`, `src/data`): `tsc --strict` sin errores propios (solo faltan módulos que el entorno de revisión no tiene: react, supabase, vite).
- Tests: 49 de los 50 archivos `*.test.ts` compilados y ejecutados con un runner mínimo propio, **179 de 179 pasan**. Queda fuera `deeplinks.test.ts` (usa `import.meta.glob` de Vite). No es el `vitest` real: confirma la lógica, no sustituye a `npm test`.
- **No se pudo ejecutar** `npm ci`, `npm test` ni `npm run build` en el entorno de revisión (sin acceso al registro de npm). Ejecútalos en tu PC antes de subir: `npm ci && npm run typecheck && npm test && npm run build`.

## Hecho en v0.67
| Área | Cambio |
|---|---|
| Búsqueda (E) | Nuevas intenciones: "what can I farm right now", "which syndicate/vendor sells X", "prerequisite/unlock X", "what changed in the latest update" + test |
| Seguridad (P0/P1) | `market`, `worldstate`, `build-analysis`: timeout de 8 s (40 s la IA); `market` ya no reenvía cuerpos de error del upstream y rechaza JSON inválido; `build-analysis` limita orígenes (secret `ALLOWED_ORIGINS`) y tamaño de petición |
| Datos (contratos) | `cleanGoals`, `cleanOwned`, `cleanCounts`, `cleanReqs`: lo leído de localStorage o de la nube se valida en ejecución; entradas dañadas se descartan en vez de romper Roadmap/Farm Plan. Tests en `goals.test.ts` |
| Integridad de reliquias | `relicIssues()` en `exact.ts`: cada refinamiento debe tener 6 recompensas que sumen 100 (±1). Conectada a la página Relics (aviso si una tabla descargada no cuadra; **sin probar en navegador**). También marca la tabla `relics` como SCHEMA DRIFT en Data Sources y en el aviso de confianza del Advisor (vía `detectDrift`) |
| Probabilidades | `eff()` en `drops.ts` devuelve null si falta la probabilidad de botín del enemigo (antes mostraba la de su tabla como si fuera la total); las pantallas ya muestran "—" para null. Test nuevo |
| Coherencia | Changelog ordenado, versión alineada en `version.ts`, `package.json` y lockfile |

## Pendiente, por prioridad
**P1 (núcleo de farmeo)**
- Reliquias exactas con probabilidad por refinamiento (A): ya existe (`relicsForPart`, `refinement`); falta comprobar fissures  activas ligadas a la reliquia exacta, no solo al tier.
- Farm Now: explicar qué objetivo avanza cada oportunidad y separar "puedes hacerlo ya" de "requiere desbloquear X" (B).
- Roadmap como grafo de requisitos (C): `tree.ts` ya suma recursos compartidos y limita la profundidad; falta explicar bloqueos por quest/MR/sindicato; build → faltantes → Roadmap para arcanes, adaptadores, shards (D).
- Estados de frescura: añadir `INFERRED` y `UNKNOWN` a `Status` en `src/lib/data.ts` y mostrarlos en la UI.

**P2 (cobertura)**: quests y prerrequisitos como datos tipados, vendors/ofertas unificados (`Vendor/Offer/Currency/Rotation`), Incarnon Genesis, adversarios (Kuva/Sisters/Coda), Focus y Operator, escalado de enemigos con fórmula verificada.

**P3 (calidad)**: Playwright (smoke + móvil), axe, Lighthouse, MSW para fallos de API, `npm audit` revisado a mano (sin `--force`), prueba de RLS con Supabase CLI.

**Ya implementado (verificado en código)**: Farm Now con relics exactas, objetivos que avanza y por qué (`farmNow.ts`); probabilidad por refinamiento (`exact.ts`); build → requisitos → Roadmap (`reqs.ts`); registro de fuentes ampliado con el catálogo (ver el documento de cobertura de fuentes).

**Conocido y aceptado**: `data_reports` admite inserciones públicas (sin lectura); tiene límites de longitud pero no limitación de frecuencia. Con CORS `*` en `market` y `worldstate` solo se sirven datos públicos de solo lectura.

## Datos manuales con caducidad
Sindicatos (`syndicateWiki.ts`), Acrithis, Nightwave y Railjack son manuales: llevan fuente y fecha. Revisar tras cada update grande (44.x en la fecha de la auditoría).
