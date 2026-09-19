@extends('layouts.app')

@section('titulo', 'Sistemas y Tableros · Plásticos Carmen')
@section('descripcion', 'Plataforma de acceso a los sistemas, tableros y sitios del Departamento de IT de Plásticos Carmen S.R.L.')
@section('clase-body', 'pagina-portal')

@push('estilos')
  <link rel="stylesheet" href="{{ asset('css/sitio.css') }}">
@endpush

@section('nav')
  <nav class="nav-secciones" aria-label="Secciones de la portada">
    <a href="#tableros">Tableros</a>
    <a href="#sistemas">Sistemas</a>
    <a href="#sitios">Sitios y servicios</a>
  </nav>
@endsection

@section('contenido')
<main id="contenido">
<div class="envoltura">

  <section class="portada">
    <div class="portada-texto">
      <p class="portada-fecha" id="fecha"></p>
      <h2 id="saludo">Bienvenido</h2>
      <p class="portada-bajada">Un solo punto de entrada a lo que construye el Departamento de IT:
        los tableros de gestión, los sistemas internos y los sitios de la empresa.</p>
    </div>

    @if ($resumen)
      <aside class="pulso" aria-labelledby="pulso-tit">
        <p class="pulso-cab" id="pulso-tit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M3 12h4l3 7 4-16 3 9h4"/></svg>
          Pulso de la transformación
        </p>
        <div class="pulso-rejilla">
          <div class="pulso-dato">
            <b>{{ number_format($resumen['iniciativas'], 0, ',', '.') }}</b>
            <span>iniciativas en cartera</span>
          </div>
          <div class="pulso-dato">
            <b>{{ number_format($resumen['actividades'], 0, ',', '.') }}</b>
            <span>actividades registradas</span>
          </div>
          <div class="pulso-dato">
            <b>{{ $resumen['actividades'] > 0 ? round(100 * $resumen['actCerradas'] / $resumen['actividades']) : 0 }} %</b>
            <span>actividades cerradas</span>
          </div>
          <div class="pulso-dato">
            <b>{{ $resumen['avanceMedio'] }} %</b>
            <span>avance medio de las que están en marcha</span>
          </div>
        </div>
        <div class="pulso-pie">
          <span>Datos al {{ \Illuminate\Support\Carbon::parse($resumen['fecha'])->translatedFormat('d \d\e F \d\e Y') }}</span>
          <a class="btn btn--fantasma btn--sm" href="{{ route('tablero') }}">Ver el tablero completo
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="m9 6 6 6-6 6"/></svg>
          </a>
        </div>
      </aside>
    @endif
  </section>

  <div class="buscador" role="search">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input type="search" id="buscar-tarjetas" placeholder="Buscar un tablero, un sistema o un sitio…" autocomplete="off" aria-label="Buscar en la portada">
    <span class="buscador-atajo" aria-hidden="true">/</span>
  </div>
  <p class="sin-resultados" id="sin-resultados" hidden>Nada coincide con la búsqueda.</p>

  @php
    $secciones = [
      'tableros' => [
        'titulo' => 'Tableros de gestión',
        'texto' => 'Los datos se procesan en el servidor y se dibujan en tu navegador.',
        'icono' => '<rect x="3" y="3" width="8" height="10" rx="1.5"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="15" width="8" height="6" rx="1.5"/>',
        'rejilla' => 'rejilla--tableros',
      ],
      'sistemas' => [
        'titulo' => 'Sistemas propios',
        'texto' => 'Desarrollados por el Departamento de IT. Piden usuario y contraseña propios; si olvidaste el tuyo, TI lo restablece.',
        'icono' => '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/>',
        'rejilla' => '',
      ],
      'sitios' => [
        'titulo' => 'Sitios y servicios',
        'texto' => 'La presencia pública de la empresa y la plataforma de trabajo diaria.',
        'icono' => '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
        'rejilla' => '',
      ],
    ];
  @endphp

  @foreach ($secciones as $clave => $s)
    <section class="seccion" id="{{ $clave }}">
      <header class="seccion-cabecera">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono">{!! $s['icono'] !!}</svg>
          {{ $s['titulo'] }}
          <span class="cuenta" data-cuenta="{{ $clave }}">0</span>
        </h2>
        <p>{{ $s['texto'] }}</p>
      </header>

      <div class="rejilla {{ $s['rejilla'] }}">
        @foreach (config('accesos.'.$clave, []) as $t)
          @include('partials.tarjeta', ['t' => $t])
        @endforeach
      </div>
    </section>
  @endforeach

  <footer class="pie-marca">
    <span>Copyright © {{ date('Y') }} Plásticos Carmen. Todos los derechos reservados.
      Desarrollado por el Departamento de IT.</span>
    <span class="version">Laravel {{ \Illuminate\Foundation\Application::VERSION }} · versión 4.0</span>
  </footer>

</div>
</main>
@endsection

@push('guiones')
  <script src="{{ asset('js/portal.js') }}"></script>
@endpush
