# Aspectos legales y de privacidad

**Esto no es asesoría legal.** Es un inventario de riesgos y de lo ya verificado para que lo revises con un abogado de tu país (las leyes de protección de datos, de menores y de consumo cambian según dónde vivas tú y dónde vivan tus usuarios).

## 1. Datos y contenidos de terceros
| Origen | Qué se sabe (verificado) | Qué hace FarmFrame | Qué falta |
|---|---|---|---|
| **Digital Extremes (Warframe)**, imágenes, nombres, datos del juego | Su política de contenido (última actualización 16 de julio de 2020, `warframe.com/contentpolicy`) exige: uso **no comercial**; **no cobrar** por acceder o poseer la creación; los anuncios pasivos están permitidos; dejar claro que no hay vínculo con DE; **no usar logotipos de Warframe ni de DE sin permiso escrito**; no usar creaciones de otros fans sin permiso; todo sujeto a sus Términos de Uso | Gratis, sin cobro; aviso «no afiliado ni respaldado por Digital Extremes» en cada pantalla | Comprobar que el sitio no use logotipos oficiales (el nombre «FarmFrame» y su «F» son propios). Las **donaciones** no se mencionan en lo que leí: pregúntales si piensas aceptarlas |
| **warframe.market** | Su API documentada admite unos **3 peticiones por segundo**; pasarse puede bloquear por Cloudflare (lo citan las librerías que la usan) | Función `market`: caché de 5 minutos, tope global de 2 por segundo, solo bajo demanda | **No pude leer sus términos completos**: confirma si exigen atribución o permiso para uso en otra web |
| **WFCD warframe-items / warframestat.us** | Datos de la comunidad sobre contenido que pertenece a DE | Se leen como fuente de datos, con la procedencia visible en «Data sources» | Revisar la licencia de cada repositorio y si piden atribución (no la verifiqué) |
| **wiki.warframe.com** | La app pide miniaturas por su API | Solo miniaturas por la API, enlace a la fuente | Las wikis suelen ser CC BY-SA y las imágenes pueden tener otra licencia (no lo verifiqué): confirmar antes de ampliar el uso |
| **Informes de otros jugadores / datos personales de terceros** | | **No se guardan.** No hay listados de otros usuarios ni mensajes entre usuarios | Si algún día se añaden comunidad, chat o rankings, hace falta moderación, términos y canal de denuncias |

Regla de prudencia: **si un dato no es tuyo, se muestra con su fuente y no se guarda ni se redistribuye**.

## 2. Datos personales de tus usuarios
Qué guardas: correo (Supabase Auth), el estado sincronizado (`user_state`), informes anónimos, y contadores de visitas anónimos (identificador aleatorio por pestaña, sin cuenta, sin IP, sin cookie; no se envía con «No rastrear» activado).

Lo que normalmente exige la ley (varía por país; en la UE el RGPD, en otros lugares leyes propias):
- **Política de privacidad y términos** visibles antes de registrarse: qué datos, para qué, cuánto tiempo, quién los trata (Supabase como encargado, y su región), cómo ejercer los derechos. **Pendiente**: la web aún no los tiene. Hay un borrador en `docs/POLITICA_PRIVACIDAD_BORRADOR.md`.
- **Derechos**: acceso (el usuario ya puede exportar sus datos), rectificación, **supresión**. Supresión: hay dos caminos en Perfil, programada (recuperable 30 días) o inmediata. Importante: tras cumplirse el plazo se borra **de verdad**, y el historial que queda es **anónimo** (fecha y tipo de evento, nunca quién). Conservar datos identificables de una cuenta ya borrada para «llevar el control» es justo lo que la ley suele prohibir.
- **Seguridad y brechas**: medidas razonables (ver `SEGURIDAD.md`) y aviso a los afectados y a la autoridad en los plazos de tu país (en la UE, 72 horas desde que lo sabes).
- **Menores**: Warframe lo juega mucha gente joven. Define una edad mínima (13 o 16 años según el país) y decláralo al registrarse.
- **Transferencias internacionales**: elige la región de Supabase pensando en dónde están tus usuarios.
- **Entrenar una IA con datos de usuarios** (ver `ASISTENTE_IA.md`): solo con consentimiento explícito y separado; por defecto, no.

## 3. Cosas que NO deben pasar
- Exponer correos, builds o progreso de una persona a otra (RLS lo impide; el script `security-smoke` lo comprueba).
- Guardar contraseñas del juego o pedir el inicio de sesión de Warframe (la web lo dice y no lo hace).
- Cobrar por acceso o funciones de la web mientras uses assets de DE.
