# Supabase: restaurar o rehacer el proyecto

Qué usa FarmFrame de Supabase: **cuentas y sincronización** (tabla `user_state`), **informes de datos** (`data_reports`), una cuota diaria de la IA (`ai_usage`) el ciclo de vida de las cuentas (borrado recuperable, historial anónimo, visitantes conectados, vista de administrador) y tres **funciones**: `worldstate` (fisuras), `market` (precios) y `build-analysis` (IA con clave externa, opcional y **apagada por defecto**). Nada más. Las decisiones de seguridad están en `docs/SEGURIDAD.md`.

## 0. Antes de rehacer: ¿se puede restaurar?
Según la documentación de Supabase, un proyecto gratis pausado se puede restaurar **hasta 90 días después de la pausa**, con sus datos y configuración: Dashboard, tu organización, el proyecto pausado, **Resume project**. Si el botón aparece, es mucho más rápido: conservas cuentas, progreso y funciones, y solo te falta el paso 6 (que no se vuelva a pausar). Si ya pasaron 90 días, en esa misma pantalla puedes descargar el respaldo y migrarlo, o seguir con los pasos de abajo.

## 1. Crear el proyecto nuevo
1. https://supabase.com/dashboard, **New project**. Plan Free. Elige una región cercana y una contraseña de base de datos (guárdala).
2. Cuando termine, abre **Project Settings** y copia dos datos: la **Project URL** (`https://xxxx.supabase.co`) y la **publishable key** (empieza por `sb_publishable_`). Ambas son públicas por diseño. **Nunca** uses la `service_role` ni una `secret` en este proyecto.

## 2. Crear las tablas
**SQL Editor**, New query, pega todo `supabase/schema.sql` y **Run**. Crea `user_state`, `data_reports` y `ai_usage` con la seguridad por filas, los permisos mínimos y los límites ya puestos (cada persona solo ve lo suyo). Se puede ejecutar de nuevo sin problema.

## 3. Configurar el inicio de sesión
**Authentication**, **URL Configuration**:
- **Site URL**: `https://nawelm187.github.io/FarmFrame/`
- **Redirect URLs**: añade `https://nawelm187.github.io/FarmFrame/**` y, si pruebas en tu PC, `http://localhost:5173/**`.
Sin esto, el enlace del correo no te devuelve a la app. En **Providers** deja **Email** activado. Si dejas activa la confirmación de correo, el registro pedirá confirmar antes de entrar.

## 4. Desplegar las funciones
Sigue `docs/DEPLOY_FUNCTIONS.md`, cambiando el identificador del proyecto por el nuevo:
- `worldstate` y `market`: **sin** verificación de JWT (desactiva "Enforce JWT verification").
- `build-analysis`: **con** verificación de JWT. Necesita el secreto `ANTHROPIC_API_KEY` (**Edge Functions**, **Secrets**); opcionales `AI_DAILY_PER_USER` (por defecto 10) y `AI_DAILY_GLOBAL` (200). Es opcional: sin la clave solo falla el botón de IA. Sin el SQL del paso 2 la IA **se niega a responder** (no hay cuota), a propósito.
- Si usas otro dominio: secreto `ALLOWED_ORIGINS` con tu dirección (varias, separadas por comas).
Prueba abriendo `https://TU-PROYECTO.supabase.co/functions/v1/worldstate`: debe mostrar fisuras en JSON.

## 5. Decirle a la web cuál es el proyecto nuevo
Antes: en el panel, **Database, Extensions**, activa **pg_cron** (purga nocturna de cuentas) y vuelve a ejecutar `schema.sql`. Luego añádete como administrador (una vez, en el SQL Editor): `insert into public.admins (user_id) select id from auth.users where email = 'tu@correo';` y entra en `/admin` en la web.

En GitHub, repo **Settings**, **Secrets and variables**, **Actions**, pestaña **Variables**, crea:
- `SUPABASE_URL` = la Project URL
- `SUPABASE_KEY` = la publishable key
Luego **Actions**, **Deploy**, **Run workflow**. (Desde la v0.116 el despliegue lee esas variables; si no existen, usa el proyecto antiguo que está en `src/lib/config.ts`.)

## 6. Que no se vuelva a pausar
El workflow `Keep Supabase awake` (`.github/workflows/keepalive.yml`) hace una petición a la base de datos cada 2 días usando las mismas dos variables. Ejecútalo una vez a mano (**Actions**, **Keep Supabase awake**, **Run workflow**): debe terminar en verde con `HTTP 200`. Dos avisos: GitHub apaga los workflows programados tras 60 días sin actividad en el repositorio (vuelve a ejecutarlo a mano), y la única garantía total es el plan Pro.

## 6 bis. Ajustes de seguridad en el panel
Siguen la lista de `docs/SEGURIDAD.md` (contraseña mínima de 10, confirmar correo, direcciones permitidas, verificación en dos pasos, límite de gasto en Anthropic). **No actives CAPTCHA todavía**: la app no envía el token y el registro fallaría.

## 7. Comprobar
1. Abre la web, **Data sources**, **Check all now**: Supabase, fisuras y market deben pasar a **OK**.
2. Crea una cuenta o inicia sesión, marca algo y entra desde otro navegador: debe aparecer lo mismo.
3. Ejecuta `node tools/security-smoke.mjs https://TU-PROYECTO.supabase.co TU_CLAVE_PUBLICA` y mándame `reporte-seguridad.txt`: debe decir «All checks passed».
4. Los datos de cuentas del proyecto anterior no pasan solos al nuevo: quien tenga progreso guardado en su navegador lo recupera al iniciar sesión (se sube desde el dispositivo), o desde el archivo exportado en **Profile**.
