@extends('layouts.app')

@section('titulo', 'Actualizar los datos del Portafolio')
@section('noindex', true)
@section('clase-body', 'pagina-portal')
@section('encabezado', 'Actualizar los datos')
@section('bajada', 'Reemplaza el contenido del tablero con un export más reciente del Portafolio')

@push('estilos')
  <link rel="stylesheet" href="{{ asset('css/sitio.css') }}">
  <link rel="stylesheet" href="{{ asset('css/tablero.css') }}">
@endpush

@section('acciones')
  <a class="btn btn--fantasma btn--sm" href="{{ route('tablero') }}">Volver al tablero</a>
@endsection

@section('contenido')
<main id="contenido">
<div class="envoltura" style="max-width:760px">

  <section class="seccion">

    @if (session('aviso'))
      <div class="alerta" role="status" style="margin-bottom:18px">{{ session('aviso') }}</div>
    @endif

    @if ($errors->any())
      <div class="alerta alerta--error" role="alert" style="margin-bottom:18px">
        <ul style="margin:0;padding-left:18px">
          @foreach ($errors->all() as $error)
            <li>{{ $error }}</li>
          @endforeach
        </ul>
      </div>
    @endif

    <header class="seccion-cabecera">
      <h2>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M12 16V4M8 8l4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>
        Cargar un export del Portafolio
      </h2>
      <p>Sube los dos CSV que exporta el Portafolio de Transformación: uno de iniciativas y
        otro de actividades. <strong>Reemplazan por completo</strong> lo que hay hoy en el
        tablero; no se mezclan con los datos anteriores.</p>
    </header>

    @if ($ultima)
      <p class="ayuda" style="margin-bottom:18px">
        Última carga: <strong>{{ $ultima->origen }}</strong> —
        {{ $ultima->iniciativas }} iniciativas y {{ $ultima->actividades }} actividades,
        el {{ $ultima->created_at->translatedFormat('d \d\e F \d\e Y \a \l\a\s H:i') }}.
      </p>
    @endif

    @if ($exigeClave && ! $autorizado)

      <form method="POST" action="{{ route('carga.guardar') }}" class="panel" style="display:block">
        @csrf
        <p style="font-size:13px;color:var(--texto-suave);line-height:1.6;margin-bottom:14px">
          Esta pantalla está protegida. Escribe la clave de carga para continuar.
        </p>
        <div class="campo">
          <label for="clave">Clave de carga</label>
          <input type="password" name="clave" id="clave" autocomplete="off" required autofocus>
        </div>
        <div style="margin-top:16px">
          <button type="submit" class="btn btn--primario">Continuar</button>
        </div>
      </form>

    @else

      @if (! $exigeClave)
        <div class="alerta" style="margin-bottom:18px">
          Esta pantalla está abierta: cualquiera con el enlace puede reemplazar los datos.
          Para protegerla, define <code>PORTAFOLIO_CLAVE_CARGA</code> en el entorno del servidor.
        </div>
      @endif

      <form method="POST" action="{{ route('carga.guardar') }}" enctype="multipart/form-data" class="panel" style="display:block">
        @csrf

        <div class="campo" style="margin-bottom:16px">
          <label for="iniciativas">Archivo de iniciativas (CSV)</label>
          <input type="file" name="iniciativas" id="iniciativas" accept=".csv,text/csv" required>
        </div>

        <div class="campo" style="margin-bottom:16px">
          <label for="actividades">Archivo de actividades (CSV)</label>
          <input type="file" name="actividades" id="actividades" accept=".csv,text/csv" required>
        </div>

        <input type="hidden" name="clave" value="{{ $exigeClave ? session('clave_carga') : '' }}">

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
          <button type="submit" class="btn btn--primario">Reemplazar los datos</button>
          <a class="btn btn--fantasma" href="{{ route('tablero') }}">Cancelar</a>
        </div>
      </form>

      <div class="alerta" style="margin-top:20px">
        <strong>Sobre la permanencia de lo que cargues.</strong>
        Si el sistema corre sobre SQLite en un disco que se reinicia, la base se
        reconstruye desde los CSV del repositorio al arrancar y se pierde lo cargado acá.
        Sobre MySQL, o con un disco persistente, queda fijo. Para dejar un export como
        punto de partida, reemplaza <code>database/data/*.csv</code> en el repositorio.
      </div>

      <div class="ayuda" style="margin-top:20px">
        <p style="margin-bottom:8px"><strong>Qué espera cada archivo</strong></p>
        <p style="margin-bottom:6px"><em>Iniciativas:</em> columnas ID, Nombre, Pilar, Estado, Etapa,
          Impacto, Avance, Fecha inicio, Fecha fin planificada, Tipo de elemento, Área impactada,
          Macroproceso, Complejidad, Prioridad, Responsable líder, Equipo responsable,
          Requiere capacitación, Impacto económico, Resultado esperado, Registró y Creado.</p>
        <p><em>Actividades:</em> columnas ID, Actividad, Iniciativa, Origen, Responsable, Área,
          Fecha compromiso, Estado, Prioridad, Avance, Vencida, Comentarios, Registró y Creado.</p>
        <p style="margin-top:8px">Separador «;» o «,», en UTF-8. Si alguna columna falta, esa
          información queda vacía y el resto se carga igual. Si agregas una columna
          <code>Enlace</code>, el tablero la usa para el documento adjunto.</p>
      </div>

    @endif

  </section>

  <footer class="pie-marca">
    <span>Departamento de IT · Plásticos Carmen S.R.L.</span>
  </footer>

</div>
</main>
@endsection
