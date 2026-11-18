# Marcos de cartas de mods (opcional)

Si dejas imágenes en esta carpeta, las cartas de mods las usan como marco, **por calidad**. Para una calidad sin imagen se sigue usando el marco dibujado con CSS, así que puedes empezar con una sola.

## Nombres de archivo (el formato puede ser png, webp, svg, jpg)
La calidad se lee del nombre, en minúsculas y sin importar el resto: `common.png`, `uncommon.png`, `rare.png`, `legendary.png`, `amalgam.png`, `archon.png`, `riven.png`, `other.png`. Pueden llevar más texto (`marco_rare_v2.png` sirve como `rare`).
- Un archivo cuyo nombre incluya `primed` se usa para los mods Primed.
- Un archivo llamado `default` o `fallback` se usa para cualquier calidad sin imagen propia.

## Cómo debe ser la imagen
**Modo `overlay` (por defecto):** una imagen con el **centro transparente** que cubre toda la carta, con la misma proporción que la carta del juego. Se estira sobre la carta, así que si la proporción no es la de la carta se deformará. Es lo más simple si tienes el marco completo.

**Modo `slice` (recomendado):** una imagen con el centro transparente que se corta en 9 partes: las esquinas no se deforman y los lados se estiran. Funciona en cualquier tamaño de carta. Hace falta decir cuántos píxeles miden las esquinas (`slice`).

## Configuración (opcional): `config.json`
```json
{ "mode": "slice", "slice": 48, "width": 14, "tiers": { "rare": { "slice": 52 } } }
```
- `mode`: `"overlay"` o `"slice"`.
- `slice`: píxeles de la esquina de la imagen (solo `slice`). Entre 1 y 500.
- `width`: grosor del marco en pantalla, en píxeles; el arte de la carta queda dentro. Entre 0 y 60. En las cartas pequeñas del editor se reduce solo.
- `tiers`: cambios para una calidad concreta (`common`, `uncommon`, `rare`, `legendary`, `amalgam`, `archon`, `riven`, `other`, `primed`).
Un archivo roto o valores raros se ignoran y se usan los de por defecto.

## Importante: de dónde salen las imágenes
Usa solo imágenes que tengas derecho a usar. La política de contenido de Digital Extremes permite usar «Warframe assets» en creaciones de fans **sin fines comerciales** y **sin sus logotipos**; cómo obtener las imágenes (por ejemplo, extraerlas de los archivos del juego) depende de sus Términos de Uso, que no se han verificado aquí. Ante la duda, pregúntales por el formulario de contacto de su política (`warframe.com/contentpolicy`). Ver `docs/LEGAL_Y_PRIVACIDAD.md`.

Después de añadir o cambiar imágenes, vuelve a compilar (`npm run build` o reinicia `npm run dev`).
