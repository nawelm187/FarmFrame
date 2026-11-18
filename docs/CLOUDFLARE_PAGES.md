# Cabeceras de seguridad: Cloudflare Pages (opcional)

## La respuesta corta
Sí se resuelve y **es gratis**, pero no «poniendo Cloudflare delante de GitHub Pages» (eso normalmente exige un dominio propio, que se paga). Lo más sencillo es **alojar el sitio en Cloudflare Pages**, que lee un archivo `_headers` y añade las cabeceras que GitHub Pages no deja: `frame-ancestors`, `Permissions-Policy`, HSTS y caché. El archivo ya está en `public/_headers`.

## Qué dice su documentación (verificado)
- Cloudflare Pages permite personalizar las cabeceras de respuesta con un archivo `_headers`, y su guía cita `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy` y `X-Content-Type-Options`.
- Límites del plan **gratuito**: 500 compilaciones al mes, compilación de hasta 20 minutos, 20.000 archivos por sitio, 25 MiB por archivo, y hasta 100 reglas en `_headers` (2.000 caracteres por línea). FarmFrame cabe de sobra.
- Las cabeceras de `_headers` no se aplican a las respuestas de «Pages Functions»; FarmFrame no usa ninguna.
- Cloudflare está impulsando también «Workers Static Assets» para sitios estáticos; Pages sigue documentado. **No verifiqué** los límites de tráfico del plan gratuito ni cómo funcionan hoy las reglas de cabeceras de dominios propios: confírmalo en su panel antes de depender de ello.

## Qué ganas y qué no
Ganas: nadie puede incrustar tu web en otra página (clickjacking), el navegador bloquea funciones que no usas (cámara, micrófono, geolocalización…), HSTS y mejor caché. **No cambia nada del resto**: el contenido, la base de datos y las claves siguen igual. El riesgo que tapa era de impacto bajo; es una mejora, no una urgencia.

## Cómo mudarlo (unos 15 minutos)
1. **Antes:** en Perfil, exporta tus datos. Los datos locales (`localStorage`) pertenecen a cada dirección web: en una dirección nueva empezarás vacío, salvo que inicies sesión (sincroniza) o importes el archivo.
2. En Cloudflare (cuenta gratuita): *Workers & Pages*, crear proyecto de Pages, conectar el repositorio de GitHub.
3. Configuración de compilación: comando `npm run build`, carpeta de salida `dist`. Variables de entorno: `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` (los mismos valores que las variables de GitHub) y `NODE_VERSION` = `22`.
4. Cuando termine, tendrás una dirección `https://TU-PROYECTO.pages.dev`.
5. **Actualiza las listas de direcciones permitidas**, o la web nueva no podrá usar el servidor: en Supabase, *Authentication, URL Configuration* (Site URL y Redirect URLs) y el secreto `ALLOWED_ORIGINS` de las funciones (añade la dirección nueva, separada por comas).
6. Comprueba las cabeceras: en el navegador, F12, pestaña Red, selecciona el documento y mira que aparezcan `x-frame-options: DENY` y `permissions-policy`. Y prueba `node tools/security-smoke.mjs <url> <clave> https://TU-PROYECTO.pages.dev`.
7. Puedes dejar GitHub Pages como copia de respaldo o apagarlo.

## Alternativa
Si ya tienes (o quieres comprar) un dominio propio, puedes ponerlo en Cloudflare y mantener GitHub Pages detrás; las reglas de cabeceras se configuran entonces en el panel de Cloudflare en vez de en `_headers`. Es más pasos y un coste anual de dominio: para este proyecto no lo recomiendo.
