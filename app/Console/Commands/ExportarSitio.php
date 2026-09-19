<?php

namespace App\Console\Commands;

use App\Services\RepositorioPortafolio;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\View;

/**
 * Genera la versión estática del sitio en la raíz del repositorio, que es lo
 * que publica GitHub Pages.
 *
 * GitHub no ejecuta PHP: sirve archivos tal cual. Así que Laravel se usa como
 * fuente —modelos, base de datos, vistas Blade— y de ahí sale un sitio de
 * archivos planos. El tablero sigue funcionando igual porque sus datos viajan
 * en un JSON que aquí se escribe a disco en vez de responderse por ruta.
 *
 *   php artisan sitio:exportar
 *
 * Después: commit de docs/ y push. Pages publica sola.
 */
class ExportarSitio extends Command
{
    protected $signature = 'sitio:exportar {--destino=. : Carpeta de salida, relativa a la raíz del proyecto}';

    protected $description = 'Genera la versión estática que publica GitHub Pages';

    public function handle(RepositorioPortafolio $repositorio): int
    {
        $destino = base_path($this->option('destino'));

        if (! $repositorio->hayDatos()) {
            $this->error('No hay datos cargados. Corre primero: php artisan migrate --seed');

            return self::FAILURE;
        }

        $this->info('Exportando a '.$destino);

        File::ensureDirectoryExists($destino);
        File::ensureDirectoryExists($destino.'/tablero');

        /* 1 · Los archivos que se sirven tal cual */
        foreach (['css', 'js', 'img', 'asistencia'] as $carpeta) {
            $origen = public_path($carpeta);
            if (File::isDirectory($origen)) {
                File::copyDirectory($origen, $destino.'/'.$carpeta);
                $this->line("  · {$carpeta}/");
            }
        }
        if (File::exists(public_path('favicon.ico'))) {
            File::copy(public_path('favicon.ico'), $destino.'/favicon.ico');
        }

        /* Sin esto, Pages pasa el sitio por Jekyll y se come lo que empieza
           con guion bajo. */
        File::put($destino.'/.nojekyll', '');

        /* 2 · Los datos del tablero, como archivo */
        File::put(
            $destino.'/tablero/datos.json',
            json_encode($repositorio->paquete(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
        $this->line('  · tablero/datos.json');

        /* Las cifras de la portada también viajan como archivo. */
        File::put(
            $destino.'/tablero/resumen.js',
            "/* Cifras de cabecera del Portafolio, para la portada. Generado por sitio:exportar. */\n"
            ."window.PC_RESUMEN = ".json_encode($repositorio->resumen(), JSON_UNESCAPED_UNICODE).";\n"
        );
        $this->line('  · tablero/resumen.js');

        /* 3 · Las dos páginas, renderizadas desde las mismas vistas Blade */
        File::put($destino.'/index.html', $this->pagina('portada', [
            'resumen' => $repositorio->resumen(),
        ], profundidad: 0));
        $this->line('  · index.html');

        File::put($destino.'/tablero/index.html', $this->pagina('tablero', [
            'fuente' => $repositorio->fuente(),
            'hayDatos' => true,
        ], profundidad: 1));
        $this->line('  · tablero/index.html');

        $this->newLine();
        $this->info('Listo. Ahora: git add -A && git commit -m "Actualizar el sitio publicado" && git push');

        return self::SUCCESS;
    }

    /**
     * Renderiza una vista y convierte sus direcciones absolutas en relativas,
     * para que el sitio funcione bajo cualquier subcarpeta — que es justo lo
     * que hace Pages con /Portafolio-v4.0/.
     */
    private function pagina(string $vista, array $datos, int $profundidad): string
    {
        $html = View::make($vista, $datos)->render();

        $base = rtrim(config('app.url'), '/');
        $prefijo = $profundidad === 0 ? '' : str_repeat('../', $profundidad);

        /* asset('css/x.css') → http://host/css/x.css → css/x.css o ../css/x.css */
        $html = str_replace($base.'/', $prefijo, $html);

        /* Las rutas con nombre quedan como carpetas del sitio estático. */
        $html = str_replace(
            [$prefijo.'tablero/datos', 'href="'.$prefijo.'tablero"', 'href="'.$prefijo.'carga"'],
            [$prefijo.'tablero/datos.json', 'href="'.$prefijo.'tablero/"', 'href="'.$prefijo.'"'],
            $html
        );

        /* En el sitio estático no hay pantalla de carga: se actualiza
           corriendo el proyecto en local y volviendo a exportar. */
        $html = preg_replace(
            '~<a class="btn btn--fantasma btn--sm" href="[^"]*">\s*<svg[^>]*>.*?</svg>\s*Actualizar datos\s*</a>~s',
            '',
            $html
        ) ?? $html;

        return $html;
    }
}
