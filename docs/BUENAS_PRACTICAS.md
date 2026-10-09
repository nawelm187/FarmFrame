# Buenas prácticas: qué se aplica a FarmFrame

Basado en la lista "Buenas Prácticas Web A-Z". FarmFrame es una herramienta gratuita sin tienda, pagos ni panel de cliente, así que esos puntos no aplican.

## Hecho
- **Idioma y viewport**: `lang="en"`, viewport móvil, `theme-color`.
- **Título por página**: se toma del `<h1>` de cada página (`src/usePageTitle.ts`).
- **Teclado**: enlace "Skip to content", foco visible en botones, enlaces y campos, el foco pasa al contenido al cambiar de página.
- **Estructura**: un `<h1>` por página (`PageHead`), `<nav aria-label>`, `<main>`.
- **Movimiento reducido**: `prefers-reduced-motion` desactiva animaciones.
- **Imágenes**: `width`/`height`, `loading="lazy"`, `alt` vacío en decorativas y texto en informativas.
- **Estados**: carga (skeleton), error con reintento, vacío honesto, 404 útil.
- **Errores sin tecnicismos**: pantalla amable; el detalle técnico va plegado en "Technical details".
- **SEO básico**: description, canonical, Open Graph, datos estructurados `WebApplication`, `robots.txt`, `sitemap.xml`.
- **Seguridad**: sin claves secretas en el repo, `.gitignore` con `.env` y `node_modules`, avisos de herramienta no oficial (ver SAFE_BROWSING.md).
- **Mantenimiento**: README corto, CHANGELOG aparte, docs en `docs/`, datos con fuente y fecha, tests de coherencia, CI estricto.
- **Menos dependencias**: solo React, router, Supabase y dos fuentes locales.

## No aplica
Pagos, carrito, panel de cliente, Google Business Profile, WhatsApp, política de envíos, cookies de publicidad (no hay analítica ni publicidad).

## Pendiente
- Pasar `deploy.yml` a estricto cuando `ci.yml` esté en verde en GitHub.
- Cabeceras HTTP de seguridad (CSP, etc.): GitHub Pages no permite configurarlas; se haría al migrar de hosting.
- Revisión de contraste con una herramienta real (Lighthouse) en la web publicada.
- `npm audit` y subida de Vite: probar aparte para no romper el build.
- Sitemap con más URLs: no es útil con rutas `#/`.
