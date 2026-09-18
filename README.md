# Sistemas y Tableros · Plásticos Carmen

Sitio estático publicado con GitHub Pages por el Departamento de IT de
**Plásticos Carmen S.R.L.**

- **Portada** (`index.html`) — plataforma de acceso: pulso del Portafolio en vivo,
  buscador, y los tableros, sistemas y sitios agrupados por tipo.
- **Tablero Gerencial y de Directorio** (`portafolio/index.html`) — métricas y KPIs
  del Portafolio de Transformación.
- **Tablero de Control de Asistencia v13** (`asistencia/index.html`) — tablero
  de gestión autocontenido, sin dependencias externas.

## Tablero Gerencial y de Directorio

Cuatro vistas sobre los mismos datos, con filtros que afectan a todo el tablero
(área impactada, macroproceso, etapa, prioridad, responsable líder y texto libre;
además se filtra tocando cualquier gráfico):

| Vista | Qué responde |
|---|---|
| **Directorio** | Embudo de maduración de la cartera, salud de la planificación, curva S de compromisos contra cierres, mapa de calor área × etapa y dispersión de avance contra plazo consumido. |
| **Gerencial** | Actividades por área y estado, origen del trabajo, tipo de elemento × estado, antigüedad de lo vencido y concentración por macroproceso. |
| **Personas** | Carga y tasa de cierre por responsable, y tabla de líderes con las iniciativas que siguen sin una sola actividad definida. |
| **Explorador** | Tablas ordenables de iniciativas y actividades, con panel lateral de detalle. |

### Enlaces y comentarios

En las tablas y en el panel lateral, cada registro muestra dos marcas:

- **Clip** — el registro trae una dirección web. Al tocarlo se abre el panel
  lateral con la **vista previa incrustada** del documento. Los enlaces de
  SharePoint, OneDrive, Google Drive, Office y YouTube se convierten solos a su
  forma incrustable; si el sitio no permite mostrarse dentro de otra página, el
  panel cae a una tarjeta con el nombre, el dominio y los botones de abrir y copiar.
- **Campana** — el registro trae comentario (actividades) o resultado esperado
  (iniciativas).

El export actual del Portafolio **no trae una columna propia de enlace**: las
direcciones se detectan dentro del texto de «Comentarios» y «Resultado esperado».
Si más adelante se agrega una columna `Enlace` (o `Link`, `Documento`, `URL`), el
tablero la toma sin cambios en el código.

### Datos

El tablero trae una **instantánea** del export en `portafolio/datos.js`, así que se
ve al instante sin cargar nada. Con **«Cargar export»** cualquier usuario puede
abrir un CSV más reciente desde su equipo: se procesa en su navegador y reemplaza
la instantánea sólo para él. Nada se sube a ningún servidor.

Formatos aceptados: los dos CSV que exporta el Portafolio (iniciativas y
actividades), separados por `;` o `,`, en UTF-8. Se pueden cargar los dos a la vez.

Para regenerar la instantánea, reemplaza `portafolio/datos.js` y
`portafolio/resumen.js` (este último alimenta las cifras de la portada).

### Colores

La paleta de datos está verificada con el validador de paletas (banda de
luminosidad, croma, separación bajo protanopia y deuteranopia, y contraste contra
el fondo) en modo claro y en modo noche. Los estados nunca se distinguen sólo por
color: siempre llevan glifo y etiqueta.

## Tablero de Control de Asistencia

Se publica **sin datos**. El export lo carga cada usuario desde su equipo y queda
guardado sólo en su navegador (IndexedDB, con respaldo en `localStorage`).

Formato esperado: export ancho del Control de Asistencia, separado por `;`, con
las columnas `CI`, `Nombre`, `Departamento` y una columna por fecha
(`aaaa-mm-dd` o `dd/mm/aaaa`).

Para quitar los datos guardados: **Configuración → Quitar datos**.

En `asistencia/index.html`, la variable `API_URL` (cerca del inicio del script)
acepta el endpoint que devuelve ese mismo CSV. Si responde, el tablero se carga
solo y no pide el archivo.

## Estructura

```
index.html              portada (plataforma de accesos)
portafolio/index.html   tablero gerencial y de directorio
portafolio/tablero.css  capa de estilos del tablero
portafolio/tablero.js   cálculo y dibujo, sin dependencias
portafolio/datos.js     instantánea del export del Portafolio
portafolio/resumen.js   cifras de cabecera para la portada
asistencia/index.html   tablero de Control de Asistencia v13
css/                    marca.css · base.css · tema.css · sitio.css · menu.css
img/                    logotipos, favicons e ilustraciones de las tarjetas
js/portal.js            tema, saludo, pulso y buscador de la portada
.nojekyll               GitHub Pages sirve los archivos tal cual
```

`css/menu.css` ya no lo usa ninguna página: la portada nueva define sus propias
tarjetas en `css/sitio.css`. Se deja en el repositorio por si alguna página
antigua sigue enlazándolo.

## Publicación

GitHub Pages, rama `main`, carpeta raíz (`/`).
