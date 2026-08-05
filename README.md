# Francesc Borras Lleida - Portfolio

Portfolio personal de Francesc Borràs, Game & Level Designer. Web estática, sin frameworks ni build system, pensada para publicarse directamente en GitHub Pages.

## Concepto de diseño

La web está construida como si fuera un documento de diseño vivo: la sensación de hojear una GDD/LDD real, con el modelo EDPV (Exposición, Demostración, Práctica, Validación) usado tanto como motivo narrativo como visual (la curva animada de la portada). El proceso de diseño completo, con justificación de cada decisión, está documentado como caso de estudio en `proyectos/este-portfolio.html`.

## Estructura del repositorio

```
/
├── index.html                     Home: hero, método, proyectos, experiencia
├── proyectos/
│   ├── lyra.html                  Caso de estudio: Lyra
│   ├── tumble-up.html             Caso de estudio: Tumble Up
│   ├── chrono-fish.html           Caso de estudio: Chrono Fish
│   └── este-portfolio.html        Caso de estudio meta: esta misma web
├── css/
│   └── style.css                  Sistema de diseño completo (tokens, componentes)
├── js/
│   └── main.js                    Nav móvil, scroll reveals, count-up, curva animada
├── assets/
│   ├── favicon.svg
│   └── Francesc_Borras_Lleida_CV.pdf
├── robots.txt
├── sitemap.xml
└── .gitignore
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo (por ejemplo `francescborraslleida.github.io` para dominio raíz, o cualquier nombre para publicarlo bajo `/nombre-repo/`).
2. Sube todo el contenido de esta carpeta a la rama `main`.
3. En GitHub → Settings → Pages, selecciona la rama `main` y la carpeta raíz (`/`).
4. Espera 1-2 minutos a que se despliegue.

**Importante:** las URLs `canonical`, Open Graph y `sitemap.xml` usan `https://frankystyle.github.io/` como marcador de posición. Sustitúyelo por tu URL real de GitHub Pages antes de publicar (búsqueda y reemplazo global en todos los `.html` y en `sitemap.xml`).

## Imágenes de proyectos

Las capturas y gifs de Lyra, Tumble Up y Chrono Fish se sirven directamente desde itch.io (`img.itch.zone`), donde ya están alojados y optimizados por el propio itch.io. Si prefieres alojarlas tú mismo, descárgalas y colócalas en una carpeta `images/` o `gifs/`, actualizando las rutas `src` correspondientes.

## Fuentes tipográficas

Space Grotesk, Inter y JetBrains Mono se cargan desde Google Fonts. Si necesitas la web 100% autoalojada (sin peticiones externas), descarga los `.woff2` de cada familia y sirve desde una carpeta `fonts/` con `@font-face` en `css/style.css`.

## Mantenimiento

- Para añadir un nuevo proyecto destacado: copia el patrón `<article class="project-feature">` de `index.html` y crea una nueva página en `proyectos/` siguiendo la estructura de `lyra.html`.
- Para añadir un proyecto secundario: añade una `.side-card` dentro de `.side-grid` en `index.html`.
- Todas las animaciones respetan `prefers-reduced-motion`; no es necesario ningún ajuste adicional al añadir contenido.
