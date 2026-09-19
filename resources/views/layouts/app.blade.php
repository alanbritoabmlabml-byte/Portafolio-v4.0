<!DOCTYPE html>
<html lang="es" data-tema-pref="sistema">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>@yield('titulo', config('app.name'))</title>
<meta name="description" content="@yield('descripcion', 'Sistemas y tableros del Departamento de IT de Plásticos Carmen S.R.L.')">
@hasSection('noindex')<meta name="robots" content="noindex">@endif

{{-- El tema se resuelve ANTES de pintar para que no haya parpadeo blanco. --}}
<script>
(function () {
  var raiz = document.documentElement, pref = 'sistema';
  try { pref = localStorage.getItem('pc-tema') || 'sistema'; } catch (e) {}
  raiz.dataset.temaPref = pref;
  var oscuro = pref === 'oscuro' ||
    (pref === 'sistema' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  raiz.dataset.tema = oscuro ? 'oscuro' : 'claro';
})();
</script>

<link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="{{ asset('img/favicon-32x32.png') }}">
<link rel="apple-touch-icon" href="{{ asset('img/apple-touch-icon.png') }}">
<meta name="theme-color" content="#063381">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<link rel="stylesheet" href="{{ asset('css/marca.css') }}">
<link rel="stylesheet" href="{{ asset('css/base.css') }}">
<link rel="stylesheet" href="{{ asset('css/tema.css') }}">
@stack('estilos')
</head>
<body class="@yield('clase-body')">

<a class="btn btn--primario sr" href="#contenido">Saltar al contenido</a>

<header class="barra-sup">
  <a class="marca" href="{{ route('portada') }}" aria-label="Sistemas y Tableros, ir al inicio">
    <img class="logo-marca" src="{{ asset('img/logo-pc.png') }}" width="46" height="34" alt="Plásticos Carmen">
    <div class="nombre">Plásticos<br>Carmen</div>
  </a>
  <div class="divisor"></div>
  <div class="titulo">
    <h1>@yield('encabezado', 'Sistemas y Tableros')</h1>
    <p>@yield('bajada', 'Departamento de IT · Plásticos Carmen S.R.L.')</p>
  </div>

  @yield('nav')

  <div class="sesion">
    @yield('acciones')
    <button type="button" class="btn btn--fantasma btn--icono btn-tema" id="btnTema"
            title="Apariencia" aria-label="Cambiar apariencia">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono icono-sol"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono icono-luna"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>
      <span class="punto-sistema" aria-hidden="true"></span>
    </button>
  </div>
</header>

@yield('contenido')

@stack('guiones')
</body>
</html>
