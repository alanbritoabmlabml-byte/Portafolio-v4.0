# Portafolio v4.0 · Sistemas y Tableros de Plásticos Carmen

Aplicación **Laravel 12** con la portada de accesos y el **Tablero Gerencial y de
Directorio** del Portafolio de Transformación de Plásticos Carmen S.R.L.

Las iniciativas y las actividades viven en una base de datos y se actualizan desde una
pantalla, sin tocar el código.

**El sitio publicado sale de acá.** GitHub no ejecuta PHP, así que Laravel es la
fuente y `php artisan sitio:exportar` escribe el sitio ya renderizado en la raíz del
repositorio, que es lo que sirve GitHub Pages:

<https://alanbritoabmlabml-byte.github.io/Portafolio-v4.0/>

## Qué hay adentro

| Ruta | Qué es |
|---|---|
| `/` | Portada: pulso del Portafolio, buscador y accesos agrupados por tipo |
| `/tablero` | Tablero Gerencial y de Directorio (cuatro vistas) |
| `/tablero/datos` | El paquete JSON que consume el tablero |
| `/carga` | Subir un export nuevo del Portafolio y reemplazar los datos |
| `/asistencia/` | Tablero de Control de Asistencia v13, servido tal cual desde `public/` |
| `/up` | Chequeo de salud, para el monitoreo del servidor |

### El tablero

Cuatro vistas sobre los mismos datos, con filtros que afectan a toda la página
(área impactada, macroproceso, etapa, prioridad, responsable líder y texto libre;
además se filtra tocando cualquier gráfico):

- **Directorio** — embudo de maduración de la cartera, salud de la planificación,
  curva S de compromisos contra cierres, mapa de calor área × etapa y dispersión de
  avance contra plazo consumido.
- **Gerencial** — actividades por área y estado, origen del trabajo, tipo de elemento
  × estado, antigüedad de lo vencido y concentración por macroproceso.
- **Personas** — carga y tasa de cierre por responsable, y tabla de líderes con las
  iniciativas que siguen sin una sola actividad definida.
- **Explorador** — tablas ordenables con panel lateral de detalle, vista previa
  incrustada de los documentos enlazados y los comentarios de cada registro.

Los gráficos se dibujan en SVG a mano, sin librerías: `public/js/tablero.js` no tiene
dependencias. La paleta de datos está verificada (banda de luminosidad, croma,
separación bajo protanopia y deuteranopia, y contraste) en modo claro y en modo
noche; los estados nunca se distinguen sólo por color, siempre llevan glifo y etiqueta.

## Arquitectura

```
app/
  Models/            Iniciativa · Actividad · Carga
  Services/
    LectorCsv.php    lector tolerante de los export (separador, BOM, acentos)
    Importador.php   CSV → filas de la base, dentro de una transacción
    Portafolio.php   filas → paquete JSON del tablero y cifras de la portada
    RepositorioPortafolio.php   único punto de lectura
  Http/Controllers/  Portada · Tablero · Carga
app/Console/Commands/
  ExportarSitio.php  Laravel → sitio estático (lo que publica Pages)
config/accesos.php   las tarjetas de la portada, como datos
database/
  migrations/        iniciativas · actividades · cargas
  seeders/           siembra desde database/data/*.csv
  data/              el export con el que arranca el sistema
resources/views/     layout + portada, tablero y carga
public/              css, js, img y el tablero de asistencia
index.html           }
tablero/             } el sitio ya renderizado que publica Pages:
css/ js/ img/        } sale de sitio:exportar, NO se edita a mano
asistencia/          }
```

**Los identificadores no son autoincrementales**: son los mismos números que usa el
Portafolio original, para que al recargar un export las filas se reemplacen en su
lugar y «#475» siga significando lo mismo.

**El avance de una iniciativa se calcula desde sus actividades.** El campo `Avance`
del export sólo se usa cuando la iniciativa todavía no tiene ninguna.

## Levantarlo en tu equipo

Necesitas PHP 8.2 o superior y Composer. En Windows, doble clic a
`iniciar-local.bat` hace todo lo de abajo y abre el navegador.

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve
```

Queda en <http://localhost:8000>. Por defecto usa SQLite: no hace falta instalar
ningún servidor de base de datos.

## Desplegar

Este proyecto es PHP: necesita un servidor que ejecute PHP 8.2 o superior.
**GitHub Pages no sirve** — entrega archivos tal cual y no ejecuta nada. El código
vive en GitHub; ejecutarlo es tarea de un servidor.

### En el servidor de Plásticos Carmen (MySQL)

Es el camino natural: ahí ya vive `portafolio.plasticoscarmen.com`.

```bash
git clone <este repositorio>
cd portafolio-v4
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
```

En `.env`:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tablero.plasticoscarmen.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=portafolio_v4
DB_USERNAME=...
DB_PASSWORD=...

PORTAFOLIO_CLAVE_CARGA=una-clave-para-entrar-a-/carga
```

Después:

```bash
php artisan migrate --seed
php artisan config:cache && php artisan route:cache && php artisan view:cache
chmod -R 775 storage bootstrap/cache
```

El *document root* del sitio apunta a `public/`, nunca a la raíz del proyecto.
Con Apache alcanza el `.htaccess` que ya viene; con nginx, la regla habitual
`try_files $uri $uri/ /index.php?$query_string`.

### Con Docker

El `Dockerfile` levanta todo con SQLite y sin configuración: sirve para probarlo en
cualquier equipo y para desplegarlo en cualquier hosting que acepte contenedores.

```bash
docker build -t portafolio-v4 .
docker run -p 8000:8000 portafolio-v4
```

Ojo con un detalle: en un disco efímero (contenedores que se reinician sin volumen
persistente) la base se reconstruye desde `database/data/*.csv` en cada arranque y se
pierde lo que se haya subido por `/carga`. Para dejar un export fijo, reemplaza esos
dos CSV en el repositorio; para que la carga persista, usa MySQL o monta un volumen.

## Actualizar los datos y republicar

El sitio publicado es estático: se regenera y se sube. Son tres pasos, y en Windows
los tres los hace `exportar-sitio.bat` de un doble clic.

1. **Cargar el export nuevo.** Levanta el proyecto (`iniciar-local.bat`), entra a
   `/carga` y sube los dos CSV que exporta el Portafolio de Transformación.
   La alternativa sin levantar nada: reemplaza `database/data/iniciativas.csv` y
   `database/data/actividades.csv` y corre `php artisan migrate:fresh --seed`.
2. **Regenerar el sitio.** `php artisan sitio:exportar` reescribe los archivos publicados.
3. **Publicar.** `git add -A && git commit -m "Actualizar el sitio publicado" && git push`.
   Pages se actualiza sola en un par de minutos.

Los dos CSV **reemplazan por completo** lo que hay; no se mezclan. Una actividad cuya
iniciativa no vino en el export no se descarta: queda suelta y se ve igual en el
explorador.

El lector acepta separador `;` o `,`, con o sin BOM, y busca las columnas sin
distinguir acentos ni mayúsculas. Si falta una columna, esa información queda vacía y
el resto se carga igual.

### Las dos caras del proyecto

| | Laravel (el proyecto) | Sitio publicado (los archivos de la raíz) |
|---|---|---|
| Dónde corre | tu equipo o un servidor con PHP | GitHub Pages |
| Datos | base de datos, en vivo | `tablero/datos.json`, congelado en la última exportación |
| Pantalla de carga | sí, en `/carga` | no: se actualiza exportando |
| Para qué sirve | trabajar, cargar exports, desarrollar | que cualquiera vea el tablero con un enlace |

### Enlaces y comentarios

El export del Portafolio **no trae una columna propia de enlace**: las direcciones se
detectan dentro del texto de «Comentarios» y «Resultado esperado». Si más adelante se
agrega una columna `Enlace` (o `Link`, `Documento`, `URL`), el lector la toma sin
cambios en el código.

En el tablero, el clip marca un documento enlazado y la campana un comentario. El clip
abre el panel lateral con la vista previa incrustada; los enlaces de SharePoint,
OneDrive, Google Drive, Office y YouTube se convierten solos a su forma incrustable, y
si el sitio no permite mostrarse dentro de otra página, el panel cae a una tarjeta con
el nombre, el dominio y los botones de abrir y copiar.

---

Departamento de IT · Plásticos Carmen S.R.L.
