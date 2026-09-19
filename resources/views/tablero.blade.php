@extends('layouts.app')

@section('titulo', 'Tablero Gerencial · Portafolio de Transformación — Plásticos Carmen')
@section('descripcion', 'Tablero gerencial y de directorio del Portafolio de Transformación: KPIs, embudo de maduración, cumplimiento por área y responsable, y explorador de iniciativas y actividades.')
@section('noindex', true)
@section('clase-body', 'pagina-tablero')
@section('encabezado', 'Tablero Gerencial y de Directorio')
@section('bajada', 'Portafolio de Transformación · métricas de cumplimiento de iniciativas y actividades')

@push('estilos')
  <link rel="stylesheet" href="{{ asset('css/tablero.css') }}">
@endpush

@section('acciones')
  <a class="btn btn--fantasma btn--sm" href="https://portafolio.plasticoscarmen.com" target="_blank" rel="noopener">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M3 12h7M3 7h12M3 17h9"/><path d="M14 4h6v6M20 4l-7 7"/></svg>
    Cronograma
  </a>
  <a class="btn btn--fantasma btn--sm" href="{{ route('carga') }}">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M12 16V4M8 8l4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>
    Actualizar datos
  </a>
@endsection

@section('contenido')
<main class="tablero" id="contenido">

  <div class="vacio" id="cargando">
    <div class="girando" aria-hidden="true"></div>
    <p>Cargando los datos del Portafolio…</p>
  </div>

  <!-- Pestañas de vista -->
  <div class="vistas" role="tablist" aria-label="Vistas del tablero">
    <button type="button" role="tab" id="tab-directorio" aria-controls="v-directorio" aria-selected="true" data-vista="directorio">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M3 21V9l7-5 7 5v12"/><path d="M9 21v-6h4v6M21 21H3"/></svg>
      Directorio
    </button>
    <button type="button" role="tab" id="tab-gerencial" aria-controls="v-gerencial" aria-selected="false" data-vista="gerencial">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
      Gerencial
    </button>
    <button type="button" role="tab" id="tab-personas" aria-controls="v-personas" aria-selected="false" data-vista="personas">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16.5 5.2a3.2 3.2 0 0 1 0 5.6M18 20a6 6 0 0 0-2.5-4.9"/></svg>
      Personas
    </button>
    <button type="button" role="tab" id="tab-explorador" aria-controls="v-explorador" aria-selected="false" data-vista="explorador">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      Explorador <span class="cuenta" id="cuentaExplorador">0</span>
    </button>
  </div>

  <!-- Filtros: una sola fila, afectan a TODA la página.
       En teléfono se pliegan para no comerse la primera pantalla. -->
  <details class="caja-filtros" id="cajaFiltros">
    <summary>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>
      <span>Filtros</span>
      <span class="cuenta-filtros" id="cuentaFiltros" hidden>0</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono flecha"><path d="m6 9 6 6 6-6"/></svg>
    </summary>
  <form class="filtros" id="filtros" role="search" aria-label="Filtros del tablero">
    <div class="filtro filtro--buscar">
      <label for="f-texto">Buscar</label>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="search" id="f-texto" placeholder="Iniciativa, actividad, responsable…" autocomplete="off">
    </div>
    <div class="filtro"><label for="f-area">Área impactada</label><select id="f-area"></select></div>
    <div class="filtro"><label for="f-macro">Macroproceso</label><select id="f-macro"></select></div>
    <div class="filtro"><label for="f-etapa">Etapa</label><select id="f-etapa"></select></div>
    <div class="filtro"><label for="f-prio">Prioridad</label><select id="f-prio"></select></div>
    <div class="filtro"><label for="f-lider">Responsable líder</label><select id="f-lider"></select></div>
    <div class="filtros-acciones">
      <button type="button" class="btn btn--fantasma btn--sm" id="btnLimpiar">Limpiar</button>
    </div>
  </form>
  </details>

  <div class="cintillo" id="cintillo" aria-live="polite"></div>

  <!-- ====================== VISTA · DIRECTORIO ====================== -->
  <section id="v-directorio" role="tabpanel" aria-labelledby="tab-directorio">

    <div class="kpis" id="kpisDirectorio"></div>

    <div class="rejilla-paneles">

      <section class="panel panel--dostercios">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M3 4h18l-7 8v7l-4 2v-9z"/></svg>
            Embudo de maduración de la cartera
          </h3>
          <p>Cuántas iniciativas sobreviven a cada etapa del ciclo. Donde la barra se angosta de golpe está el cuello de botella.</p>
          <div class="lectura" id="lecturaEmbudo"></div>
        </div>
        <div class="panel-cuerpo"><div id="embudo" class="embudo"></div></div>
      </section>

      <section class="panel panel--tercio">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M9 11.5 11 14l4.5-5"/><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z"/></svg>
            Salud de la planificación
          </h3>
          <p>Una iniciativa sin actividades ni fechas no se puede seguir: existe en la lista, no en la ejecución.</p>
        </div>
        <div class="panel-cuerpo"><div id="salud"></div></div>
      </section>

      <section class="panel panel--ancho">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M3 17c4 0 5-9 9-9s5 6 9 6"/><path d="M3 21h18"/></svg>
            Curva S · compromisos contra cierres
          </h3>
          <p>Acumulado de actividades comprometidas frente a las efectivamente cerradas, semana a semana. La brecha entre las dos líneas es la deuda de ejecución.</p>
          <div class="lectura" id="lecturaCurva"></div>
        </div>
        <div class="panel-cuerpo">
          <div class="desliz"><div id="curvaS"></div></div>
          <div class="leyenda" id="leyendaCurva"></div>
          <p class="pista-desliz"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="m9 6-6 6 6 6M15 6l6 6-6 6"/></svg> Desliza para ver todas las semanas</p>
        </div>
      </section>

      <section class="panel panel--dostercios">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
            Mapa de calor · área impactada × etapa
          </h3>
          <p>Dónde está parada la cartera de cada área. Toca una celda para filtrar todo el tablero por esa combinación.</p>
        </div>
        <div class="panel-cuerpo"><div class="calor-envoltura" id="calor"></div><div class="leyenda" id="leyendaCalor"></div></div>
      </section>

      <section class="panel panel--tercio">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            Avance real contra tiempo consumido
          </h3>
          <p>Cada punto es una iniciativa con fechas. Bajo la diagonal va atrasada; sobre ella, adelantada.</p>
        </div>
        <div class="panel-cuerpo"><div id="dispersion"></div><div class="leyenda" id="leyendaDisp"></div></div>
      </section>

    </div>
  </section>

  <!-- ====================== VISTA · GERENCIAL ====================== -->
  <section id="v-gerencial" role="tabpanel" aria-labelledby="tab-gerencial" hidden>

    <div class="kpis" id="kpisGerencial"></div>

    <div class="rejilla-paneles">

      <section class="panel panel--dostercios">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
            Actividades por área · composición por estado
          </h3>
          <p>Volumen de trabajo de cada área y en qué estado está. El rojo a la izquierda es lo que ya venció.</p>
        </div>
        <div class="panel-cuerpo"><div id="barrasArea"></div><div class="leyenda" id="leyendaEstados"></div></div>
      </section>

      <section class="panel panel--tercio">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M12 3v18M3 12h18" opacity=".35"/><circle cx="12" cy="12" r="9"/></svg>
            De dónde nace el trabajo
          </h3>
          <p>Origen de las actividades registradas. Si casi todo nace en campo, el comité está documentando poco.</p>
        </div>
        <div class="panel-cuerpo"><div id="origen"></div></div>
      </section>

      <section class="panel panel--dostercios">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            Tipo de elemento × estado de la iniciativa
          </h3>
          <p>Qué clase de entregables avanzan y cuáles se quedan en el papel.</p>
        </div>
        <div class="panel-cuerpo"><div id="barrasTipo"></div><div class="leyenda" id="leyendaEstadosIni"></div></div>
      </section>

      <section class="panel panel--tercio">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
            Antigüedad de lo vencido
          </h3>
          <p>Hace cuánto venció cada actividad abierta. Más de 30 días sin cerrar rara vez se recupera solo.</p>
        </div>
        <div class="panel-cuerpo"><div id="antiguedad"></div></div>
      </section>

      <section class="panel panel--ancho">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M3 12h4l3 7 4-16 3 9h4"/></svg>
            Macroprocesos · dónde se concentra la transformación
          </h3>
          <p>Iniciativas por macroproceso, con el avance medio de cada uno sobre la misma escala.</p>
        </div>
        <div class="panel-cuerpo"><div id="macro"></div></div>
      </section>

    </div>
  </section>

  <!-- ====================== VISTA · PERSONAS ====================== -->
  <section id="v-personas" role="tabpanel" aria-labelledby="tab-personas" hidden>

    <div class="kpis" id="kpisPersonas"></div>

    <div class="rejilla-paneles">

      <section class="panel panel--ancho">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16.5 5.2a3.2 3.2 0 0 1 0 5.6M18 20a6 6 0 0 0-2.5-4.9"/></svg>
            Carga y cumplimiento por responsable
          </h3>
          <p>Cuántas actividades lleva cada persona y cómo se reparten. La cifra de la derecha es su tasa de cierre.</p>
          <div class="lectura" id="lecturaPersonas"></div>
        </div>
        <div class="panel-cuerpo"><div id="personas"></div><div class="leyenda" id="leyendaEstadosP"></div></div>
      </section>

      <section class="panel panel--ancho">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M20 7H4M20 12H4M14 17H4"/></svg>
            Líderes de iniciativa
          </h3>
          <p>Iniciativas a cargo de cada líder, su avance medio y cuántas siguen sin una sola actividad definida.</p>
        </div>
        <div class="panel-cuerpo"><div class="tabla-envoltura" id="lideres"></div></div>
      </section>

    </div>
  </section>

  <!-- ====================== VISTA · EXPLORADOR ====================== -->
  <section id="v-explorador" role="tabpanel" aria-labelledby="tab-explorador" hidden>
    <div class="rejilla-paneles">
      <section class="panel panel--ancho">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
            Iniciativas
          </h3>
          <p>Toca una fila para ver su detalle, sus actividades y sus documentos. El clip 📎 marca un enlace y la campana un comentario.</p>
        </div>
        <div class="panel-cuerpo"><div class="tabla-envoltura" id="tablaIniciativas"></div></div>
      </section>
      <section class="panel panel--ancho">
        <div class="panel-cab">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M9 11.5 11 14l4.5-5"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>
            Actividades
          </h3>
          <p>Las actividades que cumplen los filtros actuales, ordenadas por fecha de compromiso.</p>
        </div>
        <div class="panel-cuerpo"><div class="tabla-envoltura" id="tablaActividades"></div></div>
      </section>
    </div>
  </section>

  <footer class="pie-tablero">
    <span id="pieFuente">{{ $fuente }}</span>
    <span>Departamento de IT · Plásticos Carmen S.R.L. — los datos se procesan en tu navegador; nada se envía a ningún servidor.</span>
  </footer>

</main>

<!-- Panel lateral de detalle -->
<div class="velo" id="velo"></div>
<aside class="cajon" id="cajon" role="dialog" aria-modal="true" aria-labelledby="cajonTitulo" aria-hidden="true">
  <div class="cajon-asa" aria-hidden="true"></div>
  <header class="cajon-cab">
    <div class="tit">
      <h3 id="cajonTitulo">Detalle</h3>
      <p id="cajonSub"></p>
    </div>
    <button type="button" class="cajon-cerrar" id="cajonCerrar" aria-label="Cerrar el panel">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" class="icono"><path d="M6 6l12 12M18 6 6 18"/></svg>
    </button>
  </header>
  <div class="cajon-cuerpo" id="cajonCuerpo"></div>
</aside>

<div class="globo" id="globo" role="status" aria-live="off"></div>
@endsection

@push('guiones')
  <script>
    window.PC_TABLERO = { datos: @json(route('tablero.datos')) };
  </script>
  <script src="{{ asset('js/tablero.js') }}"></script>
@endpush
