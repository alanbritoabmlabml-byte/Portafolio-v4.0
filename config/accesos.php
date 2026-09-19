<?php

/*
 * Las tarjetas de la portada. Están acá y no incrustadas en la vista para
 * que agregar un acceso sea editar una lista, no tocar HTML.
 *
 * 'ruta' es una ruta con nombre de esta aplicación; 'url' es una dirección
 * externa. Cada tarjeta usa una u otra.
 */

return [

    'tableros' => [
        [
            'titulo' => 'Portafolio · Tablero Gerencial y de Directorio',
            'descripcion' => 'KPIs de la cartera, embudo de maduración, curva S de compromisos contra cierres, mapa de calor por área y etapa, carga por responsable y explorador de iniciativas y actividades con sus documentos y comentarios.',
            'ruta' => 'tablero',
            'imagen' => 'img/tarjetas/power-bi.svg',
            'etiqueta' => 'Nuevo',
            'destacada' => true,
            'dominio' => 'este sitio · /tablero',
            'etiquetas' => ['Directorio', 'Gerencia', 'Seguimiento de proyectos'],
            'secundario' => ['texto' => 'Ver el cronograma', 'url' => 'https://portafolio.plasticoscarmen.com'],
            'buscar' => 'portafolio transformación iniciativas actividades kpi gerencial directorio embudo métricas avance cumplimiento',
        ],
        [
            'titulo' => 'Control de Asistencia · Tablero de Gestión',
            'descripcion' => 'Vistas de Gerencia, RR.HH. y Planta con indicadores de asistencia, puntualidad, permanencia, salida anticipada y horas extra, con filtrado cruzado en todos los gráficos y perfiles de jornada configurables.',
            'url' => '/asistencia/',
            'imagen' => 'img/tarjetas/asistencia.svg',
            'etiqueta' => 'v13',
            'dominio' => 'este sitio · /asistencia',
            'etiquetas' => ['RR.HH.', 'Planta', '7 secciones'],
            'buscar' => 'control de asistencia tablero gestión rrhh gerencia planta atrasos faltas horas extra puntualidad permanencia',
        ],
    ],

    'sistemas' => [
        [
            'titulo' => 'Portafolio de Transformación',
            'descripcion' => 'Registro y seguimiento de iniciativas y actividades, con cronograma, responsables y porcentajes de avance.',
            'url' => 'https://portafolio.plasticoscarmen.com',
            'imagen' => 'img/tarjetas/portafolio.svg',
            'dominio' => 'portafolio.plasticoscarmen.com',
            'externo' => true,
            'buscar' => 'portafolio de transformación iniciativas actividades gantt cronograma laravel',
        ],
        [
            'titulo' => 'Portafolio de Reportes BI',
            'descripcion' => 'Menú de accesos y tableros de Power BI por departamento y área, con permisos por usuario y favoritos.',
            'url' => 'https://portafolio-reportes-bi.onrender.com',
            'imagen' => 'img/tarjetas/power-bi.svg',
            'dominio' => 'portafolio-reportes-bi.onrender.com',
            'externo' => true,
            'buscar' => 'portafolio de reportes bi power bi tableros departamentos áreas permisos',
        ],
    ],

    'sitios' => [
        [
            'titulo' => 'Sitio web Plásticos Carmen',
            'descripcion' => 'Página pública de la empresa: línea de productos, plantas y contacto comercial.',
            'url' => 'https://www.plasticoscarmen.com',
            'imagen' => 'img/tarjetas/web-pc.svg',
            'dominio' => 'plasticoscarmen.com',
            'externo' => true,
            'accion' => 'Visitar',
            'buscar' => 'sitio web plásticos carmen página pública productos plantas contacto',
        ],
        [
            'titulo' => 'Materia Prima S.R.L.',
            'descripcion' => 'Sitio comercial de la distribuidora de insumos y materias primas del grupo.',
            'url' => 'https://www.materiaprima.com.bo',
            'imagen' => 'img/tarjetas/materia-prima.svg',
            'dominio' => 'materiaprima.com.bo',
            'externo' => true,
            'accion' => 'Visitar',
            'buscar' => 'materia prima distribuidores insumos cotizador proformas',
        ],
        [
            'titulo' => 'Microsoft 365',
            'descripcion' => 'Correo, Teams, SharePoint y archivos de la empresa. Entra con tu cuenta @plasticoscarmen.com.',
            'url' => 'https://www.microsoft365.com',
            'imagen' => 'img/tarjetas/microsoft-365.svg',
            'dominio' => 'microsoft365.com',
            'externo' => true,
            'buscar' => 'microsoft 365 outlook teams sharepoint correo office archivos agenda',
        ],
        [
            'titulo' => 'SharePoint · Dirección',
            'descripcion' => 'Documentos, actas e informes del Directorio y de la Gerencia General.',
            'url' => 'https://plasticoscarmenbo.sharepoint.com',
            'imagen' => 'img/tarjetas/sharepoint-direccion.svg',
            'dominio' => 'plasticoscarmenbo.sharepoint.com',
            'externo' => true,
            'buscar' => 'sharepoint dirección directorio documentos actas informes gerencia',
        ],
        [
            'titulo' => 'SharePoint · Sistemas',
            'descripcion' => 'Documentación del Departamento de IT, informes semanales y respaldo de los desarrollos.',
            'url' => 'https://plasticoscarmenbo.sharepoint.com',
            'imagen' => 'img/tarjetas/sharepoint-sistemas.svg',
            'dominio' => 'plasticoscarmenbo.sharepoint.com',
            'externo' => true,
            'buscar' => 'sharepoint sistemas ti informes semanales bitácora documentación',
        ],
        [
            'titulo' => 'Red de distribuidores',
            'descripcion' => 'Dónde encontrar los productos de Plásticos Carmen en todo el país.',
            'url' => 'https://www.plasticoscarmen.com',
            'imagen' => 'img/tarjetas/distribuidores.svg',
            'dominio' => 'plasticoscarmen.com',
            'externo' => true,
            'accion' => 'Visitar',
            'buscar' => 'distribuidores red comercial mapa puntos de venta',
        ],
    ],

];
