# La IA de FarmFrame: qué hay, qué se puede y qué no

## Qué hay hoy (v0.128): el Asistente local
Página `/assistant` (y el buscador Ctrl+K, que usa el mismo motor). **No es un modelo de lenguaje y no llama a ninguna IA externa**: entiende la pregunta (intención: dónde farmear, qué necesito, qué hacer ahora, qué cambió, historia), la busca en **un solo índice de todo lo que FarmFrame sabe** (páginas, Warframes, armas, mods, reliquias, recursos, objetos, vendedores, enemigos y métodos de farmeo), tolera errores de ortografía y compone la respuesta con tarjetas y enlaces.
- **Instantáneo, gratis y privado**: corre en el navegador; lo que escribes no sale de ahí (las últimas 8 preguntas se guardan solo en el dispositivo).
- **No inventa**: cada respuesta sale de datos que se muestran con su fuente (ver «Data sources»).
- **Mods por Warframe (v0.128)**: «mods for rhino», «best mods for ash prime», «qué mods uso en rhino», «mods de atlas». Responde con los mods hechos para ese Warframe y los generales agrupados por lo que mejoran (salud, escudos, armadura, energía, eficiencia, fuerza, duración, alcance, velocidad). Es un **agrupamiento, no un ranking**. Todavía no para armas.
- **Preguntas de seguimiento (v0.128)**: tras una respuesta, «and where do I get it?» o «¿y dónde lo consigo?» usan el tema anterior, y la página muestra cómo la entendió («Understood as…»).
- **Límites**: entiende inglés y español; reconoce patrones de pregunta, no cualquier frase; solo recuerda el tema de la última respuesta; no redacta texto libre. Ejemplos que aún fallan: «fissures right now» (lo corrige mal) y «mods for soma prime» (armas).

## «Una IA potente, propia, sin pagar una API de otra empresa»
Entrenar un modelo de lenguaje potente **desde cero** no es viable: cuesta millones de dólares en GPU, y exige cantidades enormes de datos. Lo realista es combinar un modelo **abierto y pequeño** con **tus datos** (recuperación de información: el modelo redacta, los datos los pone FarmFrame). Hay cuatro caminos:

| Camino | Coste | Calidad | Privacidad / seguridad | Estado |
|---|---|---|---|---|
| **A. Asistente local con reglas y búsqueda** (hoy) | 0 | Exacta en lo que cubre, nula fuera | Máxima: nada sale del navegador | **Hecho**, hay que ampliarlo |
| **B. Modelo abierto pequeño dentro del navegador** (WebGPU; modelos de 0,5 a 3 mil millones de parámetros) | 0 de servidor | Media: redacta bien con los datos delante, razona poco | Alta (corre en el dispositivo) | Opcional futuro. Descarga cientos de MB a GB, necesita WebGPU (no todos los móviles), y obliga a ampliar la CSP. **No lo pude probar aquí** (sin red ni GPU) |
| **C. Modelo abierto en un servidor propio** | Alquiler de GPU (mensual) o CPU lenta | Mejor que B | Tú operas el servidor y respondes de su seguridad | Solo si hay presupuesto y demanda |
| **D. API de otra empresa** | Por uso (o nivel gratuito con límites) | La mejor | Tus datos salen a un tercero; clave en tu servidor | La función `build-analysis` existe pero está **apagada por defecto**, justo porque no quieres esto |

**Recomendación:** seguir con A y hacerlo mucho mejor (es lo que ya funciona, es gratis y seguro). Valorar B como «modo avanzado opcional» cuando haya datos reales y un móvil de prueba.

## «Que vea la web de pie a cabeza»
El índice ya recorre las páginas y los datos cargados. Lo que falta para que «vea todo»:
1. Más cobertura: guías, builds del propio usuario (solo en su dispositivo), estado actual del mundo (fisuras, alertas, Baro) como respuestas.
2. **Herramientas**: que el asistente pueda llamar a las funciones de la web (buscador de farmeo, evaluador de builds, plan de farmeo) y no solo buscar texto. Es el salto de «buscador» a «asistente».
3. **Preguntas de builds**: «mods para Rhino» ya está; faltan las armas, «cómo subo la armadura» y comparar dos mods por pregunta (el comparador existe como pantalla).
4. **Contexto de conversación**: el seguimiento con pronombres ya está; falta recordar más de un tema.
5. **Evaluación**: un conjunto de preguntas con la respuesta esperada que se ejecuta en cada versión (`tools/offline/render.mjs` registra respuestas con `ASK_OUT`; las preguntas de referencia están en `tools/offline/assistant-queries.txt`), para medir mejoras y detectar regresiones.
6. Pulgares arriba/abajo anónimos para descubrir qué preguntas fallan.

## Reglas que no se rompen
- **No se entrena con datos de usuarios** (builds, correos, preguntas) sin consentimiento explícito y separado. Por defecto, no.
- Lo que el usuario escribe en el asistente no se envía al servidor.
- Toda respuesta debe poder señalar su fuente.
