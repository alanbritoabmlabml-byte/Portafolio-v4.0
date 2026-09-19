<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Actividad extends Model
{
    protected $table = 'actividades';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fecha_compromiso' => 'date',
            'creado' => 'date',
            'avance' => 'integer',
            'vencida' => 'boolean',
            'enlaces' => 'array',
        ];
    }

    public function iniciativa(): BelongsTo
    {
        return $this->belongsTo(Iniciativa::class, 'iniciativa_id');
    }

    /** Días de atraso de una actividad vencida; null si no aplica. */
    public function atraso(?\DateTimeInterface $hoy = null): ?int
    {
        if ($this->estado === 'Cerrado' || ! $this->fecha_compromiso) {
            return null;
        }

        $hoy ??= new \DateTimeImmutable('today');

        return (int) $this->fecha_compromiso->startOfDay()->diffInDays($hoy, false);
    }
}
