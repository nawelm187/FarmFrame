# Seguridad de FarmFrame: auditoría del backend (v0.124)

Contrastada con el apunte «Introducción al desarrollo backend» (reglas de oro, autenticación y autorización, inyección SQL, BaaS con RLS, lista «antes de entregar»).

## Resultado de las pruebas reales (15 de noviembre)
Corridas en tu PC y contra tu proyecto de Supabase:
- **Compilación y pruebas con las herramientas reales:** `npm ci`, comprobación de tipos, **80 archivos y 427 pruebas** (las mismas que mi ejecutor sin red) y `vite build`: todo OK.
- **Ataque como desconocido (`security-smoke`): 24 de 26 controles superados.** No se pueden leer ni escribir `user_state`, los informes, la cuota de IA ni ninguna tabla interna; ninguna función de cuenta ni de administración responde a un desconocido (todas dan 401 «permiso denegado»); un informe normal entra (201), uno demasiado grande se rechaza (400); el latido de visitantes funciona (204) y uno malformado se rechaza (400). Esto prueba que **`schema.sql` se ejecutó bien** en tu proyecto.
- **2 fallos, y los dos son «funciones sin actualizar»:** `market` respondió 200 a un sitio extraño (está desplegada la versión antigua, que contestaba `*`) y `worldstate` dio 404 (**nunca se desplegó**). No son agujeros nuevos: son las funciones antiguas. Se arreglan redesplegando los archivos de `supabase/functions/`.
- **`npm audit`:** avisa de React Router (CVE-2026-53666, gravedad media 6,1). Según el aviso oficial solo afecta a las apps que hacen renderizado en servidor con los modos «Framework» o «Data»; **FarmFrame usa el modo declarativo (`HashRouter`) y no tiene renderizado en servidor, así que no le afecta**. La corrección está en la versión 7.18.0 (salto de versión mayor): conviene subirla con calma y probando, no con prisa.
- **Datos reales de la comunidad:** `aura` es un texto en 114 Warframes y **una lista en Jade** (ya estaba contemplado), `stancePolarity` existe en 225 armas cuerpo a cuerpo y puede valer `universal` (corregido en esta versión).
- Lo que **aún no está probado**: la parte con sesión iniciada (restaurar, borrar, `/admin`), `pg_cron` y las funciones desplegadas con el código nuevo.

## Veredicto
La base era sólida: sin secretos en el código, filas protegidas por RLS, nada de `innerHTML` ni `eval`, enlaces externos con `rel`, URLs remotas validadas. Había **tres riesgos reales**, ya corregidos en el código, y varios ajustes que **solo se pueden hacer en el panel de Supabase**. Mientras no ejecutes el SQL nuevo, redespliegues las funciones y hagas esos ajustes, el proyecto nuevo no estará endurecido.

Leyenda: **Ejecutado** = lo corrí aquí con pruebas. **Leído** = lo revisé línea por línea pero no pude ejecutarlo (no hay Postgres ni red). **Manual** = te toca a ti.

## Contraste con el apunte
| Regla del apunte | Estado | Detalle |
|---|---|---|
| Nunca confíes en lo que llega del cliente | Cumple | La IA solo recibe hechos que el cliente ya calculó y solo para su propio análisis; cada fila se protege por dueño (RLS). Idioma y tamaño se validan en el servidor. **Ejecutado** |
| Validar todo lo que entra | Mejorado | Antes `user_state` aceptaba cualquier JSON de cualquier tamaño. Ahora: objeto y máximo ~1 MB (`user_state_shape`). La IA exige objeto JSON y topes de tamaño (leídos en streaming, no por `content-length`). `market`: slug estricto. **Ejecutado** (funciones), **Leído** (SQL) |
| Autenticar y autorizar (401 / 403) | Cumple | Funciones privadas exigen sesión (401), rechazan cuentas anónimas, y borrar cuenta exige escribir tu correo. Orígenes no permitidos: 403. **Ejecutado** |
| Permisos en cada endpoint: ¿es tuyo? | Cumple | `user_state`: 4 políticas «own», solo rol `authenticated`. `data_reports`: solo insertar. `ai_usage` y `ai_take`: solo el servidor. las funciones de cuenta (`request_account_deletion`, `restore_account`, `erase_my_account`) actúan siempre sobre `auth.uid()` (el dueño del token), nunca sobre un id enviado, y las destructivas exigen escribir tu correo. **Leído** |
| Secretos en variables de entorno | Cumple | Clave de Anthropic y service role solo en secretos de Supabase. En el repo solo la clave pública (publishable), que es pública por diseño. Búsqueda de claves, tokens y `.env`: nada. |
| Contraseñas con hash | Cumple | Las gestiona Supabase Auth; la app nunca las toca. Mínimo del cliente subido de 6 a 10 (falta el ajuste del servidor, ver abajo). |
| Consultas parametrizadas | Cumple | La app usa la API de Supabase; el SQL nuevo no concatena texto. |
| Códigos HTTP correctos y errores con formato fijo | Cumple | 400/401/403/405/429/502/503 con `{ "error": "…" }` y mensajes fijos; ningún error del origen llega al navegador. **Ejecutado** |
| CORS solo para los orígenes necesarios | Corregido | `market` y `worldstate` respondían `*`. Ahora solo tu sitio y `localhost`. **Ejecutado** |
| Listados paginados | No aplica | No hay endpoints que listen datos de otros. |
| Logs sin datos sensibles | Cumple | Las funciones no registran peticiones. |
| API documentada | Parcial | Este documento y `DEPLOY_FUNCTIONS.md` describen cada función; no hay OpenAPI. |
| BaaS: sin RLS la base queda abierta | Cumple | RLS activada en las tres tablas y permisos mínimos (`revoke` + `grant`). **Leído** |

## Hallazgos y qué se hizo
| Gravedad | Hallazgo | Corrección |
|---|---|---|
| **Alta** | `build-analysis`: cualquier persona podía crear una cuenta gratis y llamar a la IA sin límite, gastando tu saldo de Anthropic. | Cuota diaria por usuario (10) y global (200) en la base (`ai_take`), cambiable con los secretos `AI_DAILY_PER_USER` y `AI_DAILY_GLOBAL`. **Falla cerrado**: si no se puede comprobar la cuota, no se llama a la IA. **Ejecutado** |
| **Media** | `market` y `worldstate`: abiertas al mundo (`*`), sin límite: cualquiera podía usarlas para martillar a terceros a tu nombre o gastar tu cuota de funciones. | Solo orígenes permitidos, límite por dirección (mejor esfuerzo), solo GET, tope de respuesta. **Ejecutado** |
| **Media** | `data_reports`: cualquiera podía inundarla de filas y llenar la base. | Tope de 100 informes por hora en total (disparador con permisos del dueño). **Leído** |
| **Media** | Sin Content Security Policy. Si alguna vez entrara un XSS, podría robar la sesión. | CSP en el `<head>` del build: scripts solo propios (el script de arranque por hash calculado al compilar), conexiones solo a los orígenes que la app usa. Comprobada en Chromium en 41 rutas, y comprobado que **sí detecta** una violación. **Ejecutado** |
| **Media** | Contraseña mínima de 6 caracteres. | 10 en los formularios. Falta el ajuste del servidor (abajo). |
| **Media** | No había forma de borrar la cuenta ni los datos. | Perfil: borrado programado (cuenta cerrada, recuperable 30 días) o inmediato. Se hace con funciones SQL que usan el token de la persona, **sin función de servidor con clave de servicio** (menos superficie de ataque). **Leído** (SQL); la pantalla no se puede probar sin sesión real. |
| Baja | `build-analysis` guardaba el CORS en una variable global (podía mezclar peticiones simultáneas) y limitaba el cuerpo solo por `content-length`. | CORS por petición y lectura del cuerpo con tope. **Ejecutado** |
| Baja | `updated_at` lo ponía el cliente. | Lo pone el servidor (disparador). **Leído** |
| Info | Acciones de GitHub fijadas por etiqueta, sin Dependabot. | `dependabot.yml` semanal y `npm audit` en CI. |

Las pruebas de las funciones (`scripts/functions.test.mjs`, 19; incluyen el contrato de errores) **fallan en 11 puntos contra las funciones antiguas** y pasan con las nuevas.

## Ciclo de vida de la cuenta (v0.124)
1. **Programar borrado** (`request_account_deletion`): la cuenta se cierra, `user_state` deja de poder leerse o escribirse (las políticas exigen `account_active`) y la sincronización se pausa. Si la persona vuelve a entrar en 30 días, la app le ofrece **restaurar** (`restore_account`).
2. **Borrar ya** (`erase_my_account`): borra la cuenta de Supabase Auth y, en cascada, todo lo suyo. Sin vuelta atrás.
3. **Purga automática** (`purge_due_accounts`, cada noche a las 03:17 con `pg_cron`): borra de verdad las cuentas cuyo plazo venció. **Hay que activar la extensión `pg_cron`** (panel, Database, Extensions) y volver a ejecutar `schema.sql`; sin ella, las cuentas programadas no se purgan (el SQL no falla, simplemente no programa la tarea).
4. **Historial anónimo** (`account_events`): solo fecha y tipo (creada, borrado programado, restaurada, borrada ya, purgada). Nunca quién. Es lo que permite saber cuántos usuarios hubo sin conservar datos de nadie tras borrarse.
5. **Usuarios conectados ahora** (`presence`, `heartbeat`): un identificador aleatorio por pestaña cada minuto. Tope de 5000 filas vivas.
6. **Vista de administrador** (`admin_stats`, página `/admin`): solo quien esté en la tabla `admins`. Para añadirte (una vez, en el SQL Editor): `insert into public.admins (user_id) select id from auth.users where email = 'tu@correo';`. Las cifras se ven solo después de iniciar sesión; el servidor decide, no la página.

**Por qué el historial es anónimo y no «de usuarios históricos»:** guardar el correo o el identificador de cuentas ya borradas para llevar un control es justo lo que las leyes de protección de datos suelen prohibir tras una petición de supresión. Con fechas y tipos tienes los mismos números (altas, bajas, restauraciones) sin ese riesgo. Si necesitas un registro identificable por una obligación legal concreta, consúltalo con un abogado antes.

## Sobre ocultar las APIs
Lo que el navegador llama **no se puede esconder de quien abre las herramientas de desarrollo** (pestaña Red): la dirección del proyecto y la clave pública están ahí aunque no estén en el código fuente ni en la documentación. La seguridad no puede depender de que nadie las vea; por eso las defensas son RLS, permisos mínimos, límites y que no haya ningún secreto en el navegador. Lo que sí se hizo:
- La dirección del proyecto y la clave **ya no están en el código fuente** (`config.ts`): se pasan al compilar desde las variables de GitHub. Sin ellas, la app apunta a una dirección `.invalid` que nunca resuelve y las funciones en la nube fallan cerradas.
- La página pública «Data sources» ya no nombra las funciones del servidor.
- Las claves secretas (Anthropic, service role) solo existen como secretos de Supabase.
- La documentación usa `TU-PROYECTO`, nunca la dirección real.
Lo que no se puede: ocultar la dirección y la clave pública de quien inspecciona su propio navegador, ni borrar la dirección del proyecto antiguo de los archivos que ya descargaste (por eso conviene un proyecto nuevo, que ya es el plan). Un repositorio privado ayudaría a no mostrar el código, pero GitHub Pages desde un repositorio privado depende de tu plan de GitHub.

## Lo que solo se puede hacer en el panel (Manual)
1. **Ejecutar `supabase/schema.sql`** (se puede repetir sin problema), activar `pg_cron`, añadirte a `admins` y **redesplegar las 3 funciones** (`market`, `worldstate`, `build-analysis`) (`SUPABASE_DESDE_CERO.md`).
2. **Authentication, método Email:** longitud mínima de contraseña 10 y exigir mayúsculas, minúsculas y números; confirmar correo activado. Los nombres exactos pueden variar según la versión del panel.
3. **Authentication, URL Configuration:** Site URL y Redirect URLs solo con tu sitio.
4. **Secretos de la función IA:** `ANTHROPIC_API_KEY` (obligatorio), `AI_DAILY_PER_USER`, `AI_DAILY_GLOBAL`, `ALLOWED_ORIGINS` si usas otro dominio.
5. **Límite de gasto en la consola de Anthropic.** Es tu última defensa si algo falla.
6. **Activar la verificación en dos pasos** en GitHub, Supabase y Anthropic. Una cuenta del propietario robada anula todo lo demás.
7. **Authentication, Attack Protection:** la protección contra contraseñas filtradas es de pago. **CAPTCHA: no la actives todavía**: la app aún no envía el token, y el registro dejaría de funcionar. Si quieres, se implementa después (requiere una clave de Turnstile o hCaptcha y ampliar la CSP).
8. **Security Advisor** (panel de Supabase): ejecútalo después del SQL y revisa que no marque tablas sin RLS.
9. **Ejecutar `node tools/security-smoke.mjs <url> <clave>`**: ataca tu proyecto como un desconocido y escribe `reporte-seguridad.txt`. Mándamelo.

## Límites que no se pueden resolver en este alojamiento
- GitHub Pages no permite cabeceras HTTP propias: no hay `frame-ancestors` (cualquiera puede enmarcar el sitio; impacto bajo, no hay acciones sensibles de un clic) ni cabeceras como `Permissions-Policy`. **Se resuelve alojando el sitio en Cloudflare Pages (plan gratuito)**, que lee `public/_headers` (ya incluido). Pasos y límites verificados en `docs/CLOUDFLARE_PAGES.md`. Es opcional.
- El límite por dirección de `market` y `worldstate` vive en la memoria de cada instancia: frena una avalancha, no es una garantía.
- La sesión de Supabase vive en `localStorage` (es lo normal). La CSP y la ausencia de `innerHTML` son la defensa; un XSS futuro sería grave.
- No pude ejecutar el SQL ni probar contra Supabase real: eso es lo primero que hay que verificar.

## Datos personales
| Dato | Dónde | Cómo se borra |
|---|---|---|
| Correo y contraseña (hash) | Supabase Auth | Perfil: borrado programado (30 días) o inmediato |
| Builds, objetivos, seguimiento, favoritos, Maestría | `user_state` (una fila) y el navegador | Se borra con la cuenta; el navegador, al limpiar los datos del sitio |
| Informes de datos (categoría, ruta de la página, nota de hasta 500 caracteres) | `data_reports`, sin identificar a la persona | Desde el panel |
| Visitas conectadas (id aleatorio por pestaña, sin cuenta ni IP) | `presence`, se limpia a los 10 minutos; solo el máximo diario queda | Automático |
| Visita a datos públicos | GitHub, jsDelivr, warframestat.us y wiki.warframe.com ven la dirección IP del visitante | Inevitable al pedirles datos; no se envía nada personal |

No hay analítica, anuncios ni rastreadores. La app no pide el inicio de sesión de Warframe.

## Si algo se filtra
- **Clave de Anthropic:** revócala en su consola, crea otra y `supabase secrets set ANTHROPIC_API_KEY=…`.
- **Service role:** rota las claves del proyecto (Project Settings, API Keys) y vuelve a desplegar las funciones.
- **Clave pública (publishable):** no es secreta; la protección es RLS. Si la rotas, actualiza `SUPABASE_KEY` en las variables de GitHub.
- **Cuenta de GitHub:** cambia la contraseña, revoca sesiones y tokens, revisa los últimos commits y los secretos de Actions.
