# Pruebas de esta noche (en este orden)

## 0 ter. Asistente (con los datos reales, en el celular)
Abre `/assistant` y prueba: «mods for rhino», «que mods uso en saryn», «mods for zzz» (debe decir que no encuentra ese Warframe) y, después de «what do i need for ash prime», «and where do i get it». Anota qué Warframe y qué respuesta ves si algo se ve raro (por ejemplo, mods que no son de ese Warframe o grupos vacíos): con datos reales puede aparecer algún caso que mis datos de prueba no tienen.

## 0 bis. Marcos de las cartas (cuando tengas imágenes)
Lee `src/assets/modframes/LEEME.md`. Prueba con **una sola** imagen (por ejemplo `rare.png`), recompila y mira Explorar, Mods en el celular. Si el marco queda deformado o el arte se sale, cambia `mode` a `slice` y ajusta `slice` y `width`. Mándame una captura y el `config.json` si quieres que lo afine.

## 0. Lo primero que falta (resultado del 15 de noviembre)
1. **Redesplegar las funciones** en el panel de Supabase (Edge Functions, abrir cada una, pegar el código y Deploy): `supabase/functions/market/index.ts` (JWT **desactivado**), `supabase/functions/worldstate/index.ts` (JWT **desactivado**, hoy no está desplegada) y `supabase/functions/build-analysis/index.ts` (JWT **activado**). Luego repite `node tools/security-smoke.mjs <url> <clave>`: debe decir «All checks passed».
2. **Antes de publicar la web**, crea en GitHub las variables `SUPABASE_URL` y `SUPABASE_KEY` (Settings, Secrets and variables, Actions, Variables). Desde la v0.124 la dirección ya no está en el código: sin las variables, la web publicada no se conecta a la nube.
3. El informe de seguridad dejó una fila de prueba en la tabla `data_reports` (categoría `security-smoke`). Puedes borrarla desde Table Editor.

## 1. En la PC: dos comandos, dos archivos
Desde la carpeta del proyecto, con internet:
```
node tools/report.mjs
node tools/check-data.mjs
```
- `report.mjs` instala, revisa tipos, corre las pruebas y compila. Escribe **reporte-farmframe.txt**.
- `check-data.mjs` lee los datos reales de la comunidad y escribe **reporte-datos.txt** (confirma, entre otras cosas, el campo `aura` de los Warframes y `stancePolarity` de las armas cuerpo a cuerpo).

**Mándame los dos archivos.** Con eso sé si compila y si los datos reales coinciden con lo que asumí.

## 2. Subir a GitHub
Sube el contenido del zip. Si todavía no creaste las variables `SUPABASE_URL` y `SUPABASE_KEY`, espera a tener el proyecto de Supabase (ver `SUPABASE_DESDE_CERO.md`): sin ellas la web usa el proyecto antiguo, que está pausado.

## 3. En el celular, con la web publicada (pantalla angosta)
Para cada punto, «OK» o «falla» más captura:
1. **Explorar → Mods:** 2 columnas de cartas, filtros de polaridad y calidad, orden por coste. Toca **Compare** en 3 mods y mira la tabla.
2. **Planear → Builds → una build:** cabecera de capacidad, 8 huecos en 4 columnas, huecos especiales, polaridades nativas como chips.
3. Toca un hueco vacío: se abre la hoja de mods. Elige uno y comprueba rango −/+, polaridad, Owned, Remove, **Auto polarize** y **Reset polarities**.
4. Pon una polaridad en el Aura: ¿sube el contador de Forma solo si no es la nativa?
5. **Copy build code** y pégalo en «Import a build code» de la lista de builds.
6. **Seguimiento:** favoritos con el botón a la derecha. **Where to farm** en una parte (p. ej. Ash Prime Blueprint): debe mostrar reliquias, no una página vacía.
7. Cambia a español y comprueba los avisos de la build (un mod repetido, un rango pasado).
8. Barra de idiomas en una sola fila.

## 4. Seguridad (cuando tengas el proyecto de Supabase)
1. Ejecuta `supabase/schema.sql` en el SQL Editor y redespliega las 4 funciones (`SUPABASE_DESDE_CERO.md`). Si el SQL da un error, mándame el texto exacto.
2. `node tools/security-smoke.mjs https://TU-PROYECTO.supabase.co TU_CLAVE_PUBLICA` y mándame `reporte-seguridad.txt`.
3. Haz los ajustes del panel de `docs/SEGURIDAD.md` (sección «Lo que solo se puede hacer en el panel»).
4. En la web publicada, abre la consola del navegador (F12) en dos o tres pantallas y dime si aparece algún error que diga «Content Security Policy» o «Refused to».

## 4 bis. Cuentas y panel (con el proyecto ya creado)
1. Activa `pg_cron` (Database, Extensions), vuelve a ejecutar `schema.sql` y añádete a `admins` (instrucciones en `SUPABASE_DESDE_CERO.md`).
2. Crea una cuenta de prueba. En Perfil: «Programar borrado (30 días)». Debe cerrar la sesión. Vuelve a entrar: debe aparecer el aviso con «Restaurar mi cuenta». Restáurala y comprueba que la sincronización vuelve.
3. Crea otra cuenta de prueba y usa «Borrar ya, para siempre»: al intentar entrar con ella debe decir que no existe.
4. Entra en `/admin` con tu cuenta: deben verse «En línea ahora» (al menos 1), cuentas y el historial. Con otra cuenta debe decir que no es administrador.
5. Prueba el Asistente (`/assistant`) en el celular con las preguntas de ejemplo.
6. Si algo da error, anota el **número** (401, 403, 429…) y la pantalla: ver `docs/ERRORES.md`.

## 5. Supabase (cuando lo tengas)
Sigue `SUPABASE_DESDE_CERO.md`. Después, en **Data sources → Check all now**, Supabase, fisuras y market deben quedar en OK. Prueba la sincronización con dos dispositivos.
