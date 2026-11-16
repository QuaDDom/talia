# Demo para TALIA · Pasión x la Bici

Propuesta de página web para **TALIA Pasión x la Bici**, bicicletería de Talia Aguirre en Liniers 587, Resistencia,
Chaco. Taller oficial Shimano, servicio oficial RockShox y distribuidor oficial de Specialized y SRAM.

## La idea

Una página propia, tomando lo que hacen bien las webs de las grandes marcas de bicis, pero con la identidad de TALIA:

- **Specialized y Santa Cruz**: inicio negro a pantalla completa, con la bici como protagonista y titulares grandes.
- **Canyon**: fichas con los datos técnicos de cada bici y una guía de talles por altura.
- **Rapha**: la historia contada como una nota de revista, y el club de salidas como parte de la marca.
- **VanMoof**: movimiento ligado al scroll (la galería del local avanza de costado al bajar).

Lo propio de TALIA: la paleta sale de su propio material. Verde petróleo (#0d2b2f, el cuadro de la Epic 8 que
venden) para las secciones oscuras, hueso (#ece8df) para las claras y el verde menta de los interruptores de su
publicación de horarios (#7cd6a8) para todo lo que se puede tocar. Además, el talle sobre un dorsal de carrera, números
en tipografía monoespaciada como una planilla de tiempos, y el interruptor de abierto/cerrado del horario.

Tipografías: Archivo (titulares condensados y textos) y JetBrains Mono (datos), de Google Fonts. Scroll suave con Lenis.
La bici 3D usa three.js desde unpkg.

## Qué tiene

- **Bici en 3D en el inicio** (`assets/bike3d.js`, three.js 0.160): una doble suspensión de cross country armada con
  formas simples, en los colores de la marca y con TAL1A en el tubo diagonal. Se arma pieza por pieza al abrir la
  página (como una vista despiezada del taller), se gira arrastrando y, al bajar, se pone de perfil y las ruedas giran.
  Es una ilustración, no un modelo real de Specialized. Si el navegador no tiene WebGL, se ve la foto de la Chisel.
- **Bicis**: Chisel, Epic 8 Comp y Riprock 20 con sus datos, filtro por tipo, y "Consultar" arma el mensaje de
  WhatsApp con el modelo (y la altura, si usaron la guía de talles).
- **Guía de talles**: una barra con la altura que muestra el talle orientativo de cuadro y lo manda por WhatsApp.
- **Taller**: Shimano, RockShox, Specialized y SRAM, y un formulario para pedir turno (servicio, tipo de bici y día).
- **Historia**: Talia, la selección argentina, 2016, el reconocimiento de 2021 y los 10 años.
- **Club TALIA**: invitación a las salidas por WhatsApp.
- **El local**: galería de fotos, reseñas de Google, horario con "abierto ahora" en hora argentina, mapa.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página. |
| `assets/styles.css`, `assets/app.js` | Estilos, catálogo, guía de talles, turnos, horario y animaciones. |
| `assets/bike3d.js` | La bici 3D del inicio. |
| `assets/fotos/` | Fotos de su Instagram y de su ficha de Google Maps, recortadas. |
| `assets/logo-*.svg`, `talia-*.svg`, `badge.svg`, `favicon.svg` | El logo redibujado en vector. |
| `tools/capturas.mjs` | Genera las imágenes de `capturas/` para mandarle al cliente. |
| `tools/mockup.html`, `tools/navegador.html`, `tools/logo.html` | Marcos de celular, navegador y la hoja del logo. |
| `tools/build_logo.py` | Vuelve a generar los SVG del logo. |
| `capturas/` | Las imágenes para mandar. El mensaje (`mensaje-para-talia.txt`) queda solo en la compu: el repo es público. |

## De dónde sale cada dato (real)

- **Nombre, dirección, teléfono, reseñas (4,9 con 77 opiniones) y accesibilidad**: su ficha de Google Maps.
- **Horario** (lunes a viernes de 16:30 a 20:30, sábados de 9 a 13, domingo cerrado): su publicación de horarios y la
  del Día de la Madre, octubre de 2026.
- **WhatsApp 3731 53-8155**: Google Maps y todas sus publicaciones.
- **Taller oficial Shimano, distribuidor oficial Specialized y SRAM, "Club TALIA"**: la bio de @talia.pasion.x.la.bici.
- **Servicio oficial RockShox y "10 años rodando juntos" (2016 – 2026)**: su publicación de agosto de 2026.
- **Mauro y la capacitación de Shimano**: su reel de septiembre de 2026.
- **Bicis y datos técnicos**: Chisel (publicación de octubre de 2025), Epic 8 Comp y Riprock 20 (promoción del 12 al 15
  de noviembre de 2026). "Desarmado completo" sale de una foto del taller en Google.
- **Historia de Talia**: nota de Noticias del Paraná del 30/03/2021 (Las Breñas, selección argentina, competencias en
  Europa, abrió en 2016 en Resistencia, empezó vendiendo su bici, reconocimiento del Mes de la Mujer).
- **Reseñas**: frases reales de Google. "La dueña es muy divina…" y "Leí que tenía muy buenas reseñas…" son las que
  Google destaca en el resumen, sin nombre.
- **Fotos**: `chisel`, `epic-8-comp`, `riprock-20` y `rockshox` son de su Instagram, recortadas para sacar los textos y
  precios. `local`, `interior-1`, `interior-2`, `cascos`, `bici-roja` y `repuestos` son de la ficha de Google Maps.
- **Logo**: el cartel del frente del local y su foto de perfil.

La web **talia.ar** (que figura en algunos directorios) ya no funciona: el dominio no existe (16/11/2026). En algunos
directorios viejos figura la dirección anterior, Av. Sarmiento 485.

## Qué es de ejemplo o hay que confirmar

- **La guía de talles**: rangos orientativos de cuadro de montaña (XS hasta 1,59 m, S, M, L, XL desde 1,86 m). Cada
  marca y modelo tiene su tabla; hay que ajustarla con ellos.
- **La lista de servicios del taller** (service general, desarmado completo, suspensión RockShox, frenos y cambios,
  otro arreglo) y los tipos de bici del formulario.
- **Las descripciones cortas de cada bici** y los textos de la página.
- **Las salidas del club**: no se publican días ni recorridos, así que la página invita a escribir.
- **Los precios**: no se muestran porque cambian con cada promoción. "Consultar" pide precio y cuotas por WhatsApp.
- **Las fotos**: Instagram las sirve a 512 × 640 px. Para publicar conviene pedir los originales.
- **El horario**: Google decía "abre a las 5 p. m."; la página usa el de sus publicaciones (16:30).

## Logo

El original es TAL1A (la I dibujada como un 1) en una sans geométrica muy gruesa, con PASIÓN X LA BICI debajo en
mayúsculas chicas y espaciadas. Está armado en Montserrat Black y SemiBold (licencia SIL Open Font), la tipografía
libre más parecida, convertida a curvas.

- `logo-blanco.svg`, `logo-negro.svg`: completo.
- `talia-blanco.svg`, `talia-negro.svg`: solo la palabra, para el encabezado.
- `badge.svg`: el círculo negro, como su foto de perfil. `favicon.svg`: el 1.

Para regenerarlo: `python tools/build_logo.py Montserrat-Black.ttf Montserrat-SemiBold.ttf assets` (necesita `fontTools`).

## Deploy en Vercel

Es un sitio estático: en Vercel se importa el repo con el preset **Other**, sin comando de build y con la raíz como
directorio de salida. `.vercelignore` deja afuera `capturas/`, `tools/` y este README. `vercel.json` agrega `noindex`
para que Google no indexe la demo; cuando sea la web real, se saca ese encabezado.

## Capturas

```bash
python -m http.server 8795 --directory .
node tools/capturas.mjs
```

Parámetros de la página para las capturas:

- `?captura`: sin la franja de demo, sin animaciones y con la firma.
- `&desde=ID`: muestra la página desde ese elemento, debajo del encabezado. `&aire=40px` es el espacio arriba.
- `&zoom=0.8`, `&ocultar=.wa-float,.captura-mark`.
- `altura=176` (guía de talles), `filtro=montana|ninos`, turno: `servicio=0..4`, `tipo=0..3`, `dia=0..5`.
