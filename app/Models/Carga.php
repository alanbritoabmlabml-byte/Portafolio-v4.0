<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carga extends Model
{
    protected $table = 'cargas';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'iniciativas' => 'integer',
            'actividades' => 'integer',
        ];
    }
}
