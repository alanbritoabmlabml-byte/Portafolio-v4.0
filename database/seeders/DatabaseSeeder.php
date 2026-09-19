<?php

namespace Database\Seeders;

use App\Services\Importador;
use Illuminate\Database\Seeder;

/**
 * Carga inicial: los dos CSV que vienen con el proyecto, en database/data.
 *
 * Es la misma ruta de código que usa la pantalla /carga, así que lo que se
 * siembra al desplegar y lo que se sube a mano después pasan por el mismo
 * lector y terminan idénticos.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $carpeta = database_path('data');
        $iniciativas = $carpeta.'/iniciativas.csv';
        $actividades = $carpeta.'/actividades.csv';

        if (! is_file($iniciativas) || ! is_file($actividades)) {
            $this->command?->warn('No hay CSV en database/data: la base queda vacía y se carga desde /carga.');

            return;
        }

        $resultado = Importador::reemplazar(
            file_get_contents($iniciativas),
            file_get_contents($actividades),
            'Export del Portafolio de Transformación'
        );

        $this->command?->info(
            "Sembrado: {$resultado['iniciativas']} iniciativas y {$resultado['actividades']} actividades."
        );
    }
}
