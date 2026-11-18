# Números y códigos de error

Cada error lleva **dos cosas**: el número HTTP (qué tipo de problema es) y un `code` estable (una palabra en inglés que la app puede usar sin interpretar el texto). El texto `error` es corto y fijo: nunca incluye datos del servidor ni de terceros.

```json
{ "error": "daily limit reached, try again tomorrow", "code": "daily_limit_reached" }
```

## Funciones (`market`, `worldstate`, `build-analysis`)
| HTTP | `code` | Cuándo |
|---|---|---|
| 200 | | Todo bien |
| 400 | `bad_request`, `bad_slug` | Cuerpo que no es JSON válido; slug con caracteres no permitidos |
| 401 | `login_required` | Falta sesión, la sesión no vale o la cuenta es anónima |
| 403 | `origin_not_allowed` | Un sitio web que no es el tuyo intenta usar la función |
| 404 | `not_found` | El artículo no existe en warframe.market |
| 405 | `method_not_allowed` | Método incorrecto; la respuesta trae la cabecera `Allow` |
| 413 | `payload_too_large` | La petición pasa el tope (40 KB; la IA además 20 KB de datos de la build) |
| 415 | `unsupported_media_type` | `build-analysis` recibió algo que no declara `application/json` |
| 422 | `invalid_build` | El JSON es válido pero la build no es un objeto |
| 429 | `rate_limited`, `daily_limit_reached` | Demasiadas peticiones (trae `Retry-After`); cuota diaria de la IA agotada |
| 502 | `upstream_error`, `upstream_unreachable` | El servicio de terceros falló o no responde |
| 503 | `service_unavailable` | La IA no está configurada o no se puede comprobar la cuota (falla cerrado) |
| 504 | `upstream_timeout` | El servicio de terceros tardó demasiado |

## Base de datos (funciones SQL llamadas con `rpc`)
Usan el mecanismo de PostgREST `PTnnn`: el número después de `PT` es el HTTP que recibe la app.
| HTTP | `code` | Dónde |
|---|---|---|
| 400 | `PT400` | `request_account_deletion`, `erase_my_account`: el correo escrito no coincide |
| 401 | `PT401` | Todas las funciones de cuenta y `admin_stats`: no hay sesión |
| 403 | `PT403` | `admin_stats`: la cuenta no es administradora |
| 401/403 | (permiso denegado) | Un desconocido intenta tocar una tabla o función cerrada |

`restore_account` no da error si no hay nada que restaurar: devuelve `false` (la app lo muestra como «no se pudo restaurar»).

## Cómo los muestra la app
La app nunca enseña el texto del servidor. Traduce por número: 401 «inicia sesión», 429 «has usado los análisis de hoy / inténtalo en un momento», 503 «el servicio no está disponible», y el resto «no se pudo completar» (en los 9 idiomas).
