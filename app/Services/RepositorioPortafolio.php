<?php

namespace App\Services;

use App\Models\Carga;
use Illuminate\Support\Facades\DB;

/**
 * Único punto por donde el resto de la aplicación lee el Portafolio.
 *
 * Se usa el constructor de consultas y no Eloquent a propósito: son 500 y
 * pico de filas que se serializan enteras en cada carga del tablero, y
 * hidratar modelos para luego volverlos a aplanar no aporta nada.
 */
class RepositorioPortafolio
{
    /** @return array<int, array<string, mixed>> */
    public function iniciativas(): array
    {
        return DB::table('iniciativas')->orderBy('id')->get()
            ->map(fn ($f) => (array) $f)->all();
    }

    /** @return array<int, array<string, mixed>> */
    public function actividades(): array
    {
        return DB::table('actividades')->orderBy('id')->get()
            ->map(fn ($f) => (array) $f)->all();
    }

    /** El paquete completo que consume el tablero en el navegador. */
    public function paquete(): array
    {
        return Portafolio::paquete($this->iniciativas(), $this->actividades(), $this->fuente());
    }

    /** Cifras de cabecera para la portada. */
    public function resumen(): array
    {
        $carga = $this->ultimaCarga();

        return Portafolio::resumen(
            $this->iniciativas(),
            $this->actividades(),
            $carga?->created_at?->format('Y-m-d')
        );
    }

    public function ultimaCarga(): ?Carga
    {
        return Carga::query()->latest('id')->first();
    }

    public function fuente(): string
    {
        $carga = $this->ultimaCarga();

        if (! $carga) {
            return 'Sin datos cargados todavía';
        }

        return $carga->origen.' · '.$carga->created_at->translatedFormat('d/m/Y');
    }

    public function hayDatos(): bool
    {
        return DB::table('iniciativas')->exists();
    }
}
