# ¿Seguir con Supabase o hacer un backend propio?

**Recomendación: seguir con Supabase** y escribir la lógica de servidor como funciones de borde (TypeScript). Es lo que el apunte propone para este tipo de proyecto, y por la seguridad en concreto.

## Por qué
El apunte dice que un BaaS «conviene: prototipos, CRUD simples, tiempo real» y que se necesita backend propio para «pagos, lógica compleja, datos sensibles, integraciones». FarmFrame hoy es: cuentas, un documento por usuario, informes, y tres funciones pequeñas. Encaja en el primer grupo.

| | Supabase (hoy) | Backend propio (Node, Python…) |
|---|---|---|
| Seguridad | La base de datos, la autenticación y las contraseñas las opera y parchea otro equipo; tú defines RLS y límites | **Tú** parcheas el sistema, el TLS, el firewall, las dependencias y respondes a ataques |
| Coste | Plan gratuito | Un servidor encendido siempre (los planes gratis se duermen o limitan) y tu tiempo |
| Complejidad | Un SQL y tres funciones | Servidor, despliegue, base de datos, copias, monitorización |
| Cuándo gana | | Pagos, procesos largos, IA propia en servidor, reglas muy complejas |

Un solo desarrollador con un backend propio suele terminar **con menos seguridad**, no con más: cada pieza que operas es una superficie que vigilar.

## Qué lenguaje, si llega el momento
- **TypeScript (Node.js con Fastify o NestJS)** si la lógica es web normal: mismo lenguaje que el frontend y que las funciones de hoy.
- **Python (FastAPI)** si el servidor va a ejecutar modelos de IA o procesar datos pesados.
No hay que decidirlo ahora: las funciones actuales se pueden mover más adelante porque cada una es pequeña y tiene su contrato documentado en `ERRORES.md`.

## Señales para cambiar
1. Quieres **cobrar** (pagos): hace falta un servidor que guarde secretos y valide pedidos.
2. Quieres ejecutar **tu propio modelo de IA en un servidor** (ver `ASISTENTE_IA.md`).
3. Las funciones de borde se quedan cortas (tiempo de ejecución, memoria, librerías).
4. Necesitas más control legal sobre dónde viven los datos.
Mientras ninguna se cumpla, cambiar de plataforma añade riesgo sin beneficio.
