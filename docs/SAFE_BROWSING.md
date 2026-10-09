# Aviso "Sitio peligroso" de Chrome (Google Safe Browsing)

Qué es: Chrome muestra esa pantalla roja cuando Google Safe Browsing marca una URL como posible phishing.
No viene de un error del código ni de GitHub: es una etiqueta de Google sobre `nawelm187.github.io/FarmFrame/`.
Con sitios nuevos, con formulario de login y en un subdominio gratuito (`github.io`) es un falso positivo muy común.

## Qué hay que hacer (en este orden)

1. **Pedir revisión a Google** (esto es lo que realmente quita el aviso):
   - Abrí la pantalla roja, tocá "Mostrar detalles" y usá el enlace **"Cuéntanos"** (reporte de falso positivo), o entrá a
     https://safebrowsing.google.com/safebrowsing/report_error/ y pegá `https://nawelm187.github.io/FarmFrame/`.
   - Escribí algo como: "Herramienta de planificación para Warframe, hecha por un fan, sin pedir credenciales de Warframe. Código público en GitHub."
   - Podés ver el estado en https://transparencyreport.google.com/safe-browsing/search?url=nawelm187.github.io/FarmFrame
2. **Opcional, más rápido si lo tenés:** si verificás el sitio en Google Search Console, el panel "Problemas de seguridad" tiene "Solicitar revisión".
3. **Solución de fondo:** un dominio propio. La reputación de Safe Browsing se aplica por URL/dominio, así que un dominio propio deja de compartirla con `github.io`.
   Cuando lo tengas: Settings > Pages > Custom domain, y en Supabase agregá el dominio en Authentication > URL Configuration.

## Qué cambió en el código (v0.44) para dar menos motivos al detector

- El login ya no muestra un campo de contraseña por defecto: se entra con **enlace por email** (sin contraseña). La contraseña sigue disponible tocando "I already have a password".
- Se quitó el campo de formulario oculto (anti-bot) del reporte de problemas; ahora el anti-bot es por tiempo.
- Aviso visible en el pie: herramienta no oficial, sin relación con Digital Extremes, y que nunca pide el login de Warframe.

## Configuración necesaria en Supabase para el enlace por email

Authentication > URL Configuration:
- **Site URL**: `https://nawelm187.github.io/FarmFrame/`
- **Redirect URLs**: agregá `https://nawelm187.github.io/FarmFrame/` (y tu dominio propio cuando lo uses).
Sin esto, el enlace del email redirige a otra URL. Las cuentas con contraseña que ya creaste siguen funcionando igual.
