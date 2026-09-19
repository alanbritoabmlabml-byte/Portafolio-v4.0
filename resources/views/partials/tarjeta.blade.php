{{--
  Una tarjeta de acceso de la portada.
  $t viene de config/accesos.php; 'ruta' apunta adentro, 'url' afuera.
--}}
@php
    $destino = isset($t['ruta']) ? route($t['ruta']) : ($t['url'] ?? '#');
    $externo = ($t['externo'] ?? false) === true;
    $accion = $t['accion'] ?? ($externo ? 'Ingresar' : 'Entrar');
@endphp

<article class="tarjeta" data-tarjeta data-buscar="{{ $t['buscar'] ?? '' }}">
  <a class="tarjeta-vista tarjeta-enlace" href="{{ $destino }}"
     @if ($externo) target="_blank" rel="noopener" @endif
     aria-label="Abrir {{ $t['titulo'] }}">
    @isset($t['etiqueta'])
      <span class="tarjeta-etiqueta @if(($t['etiqueta'] ?? '') === 'Nuevo') tarjeta-etiqueta--nuevo @endif">{{ $t['etiqueta'] }}</span>
    @endisset
    <img src="{{ asset($t['imagen']) }}" width="320" height="150" alt="" loading="lazy">
  </a>

  <div class="tarjeta-cuerpo">
    <h3>{{ $t['titulo'] }}</h3>
    <p>{{ $t['descripcion'] }}</p>

    @if (! empty($t['etiquetas']))
      <div class="tarjeta-etiquetas">
        @foreach ($t['etiquetas'] as $e)
          <span class="etiqueta">{{ $e }}</span>
        @endforeach
      </div>
    @endif

    <small class="tarjeta-dominio">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/></svg>
      {{ $t['dominio'] }}
    </small>
  </div>

  <div class="tarjeta-acciones">
    <a class="btn btn--primario" href="{{ $destino }}" @if ($externo) target="_blank" rel="noopener" @endif>
      {{ $accion }}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icono"><path d="m9 6 6 6-6 6"/></svg>
    </a>
    @isset($t['secundario'])
      <a class="btn btn--fantasma" href="{{ $t['secundario']['url'] }}" target="_blank" rel="noopener">{{ $t['secundario']['texto'] }}</a>
    @endisset
  </div>
</article>
