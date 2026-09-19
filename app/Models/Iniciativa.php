<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Iniciativa extends Model
{
    protected $table = 'iniciativas';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'creado' => 'date',
            'avance' => 'integer',
            'requiere_capacitacion' => 'boolean',
            'impacto_economico' => 'boolean',
            'enlaces' => 'array',
        ];
    }

    public function actividades(): HasMany
    {
        return $this->hasMany(Actividad::class, 'iniciativa_id');
    }

    /**
     * El avance de una iniciativa se calcula desde sus actividades. El campo
     * del export sólo se usa cuando todavía no tiene ninguna.
     */
    public function avanceCalculado(?iterable $actividades = null): ?int
    {
        $lista = $actividades ?? $this->actividades;
        $n = is_countable($lista) ? count($lista) : 0;

        if ($n === 0) {
            return $this->avance;
        }

        $suma = 0;
        foreach ($lista as $actividad) {
            $suma += (int) ($actividad->avance ?? 0);
        }

        return (int) round($suma / $n);
    }
}
