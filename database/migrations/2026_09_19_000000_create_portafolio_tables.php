<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Las dos tablas del Portafolio de Transformación.
 *
 * Los identificadores NO son autoincrementales: son los mismos números que
 * usa el Portafolio original, para que al recargar un export las filas se
 * reemplacen en su lugar y los enlaces «#475» sigan significando lo mismo.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('iniciativas', function (Blueprint $tabla) {
            $tabla->unsignedInteger('id')->primary();
            $tabla->string('nombre', 500);
            $tabla->string('pilar', 120)->nullable();
            $tabla->string('estado', 60)->nullable()->index();
            $tabla->string('etapa', 60)->nullable()->index();
            $tabla->string('impacto', 60)->nullable();
            $tabla->unsignedTinyInteger('avance')->nullable();
            $tabla->date('fecha_inicio')->nullable();
            $tabla->date('fecha_fin')->nullable();
            $tabla->string('tipo', 120)->nullable()->index();
            $tabla->string('area', 120)->nullable()->index();
            $tabla->string('macroproceso', 160)->nullable()->index();
            $tabla->string('complejidad', 60)->nullable();
            $tabla->string('prioridad', 60)->nullable()->index();
            $tabla->string('lider', 160)->nullable()->index();
            $tabla->string('equipo', 300)->nullable();
            $tabla->string('responsable_pc', 160)->nullable();
            $tabla->boolean('requiere_capacitacion')->default(false);
            $tabla->boolean('impacto_economico')->default(false);
            $tabla->text('resultado_esperado')->nullable();
            $tabla->text('enlaces')->nullable();
            $tabla->string('registro', 160)->nullable();
            $tabla->date('creado')->nullable();
            $tabla->timestamps();
        });

        Schema::create('actividades', function (Blueprint $tabla) {
            $tabla->unsignedInteger('id')->primary();
            $tabla->unsignedInteger('iniciativa_id')->nullable()->index();
            $tabla->string('iniciativa_rotulo', 560)->nullable();
            $tabla->text('nombre');
            $tabla->string('origen', 120)->nullable()->index();
            $tabla->string('responsable', 160)->nullable()->index();
            $tabla->string('area', 120)->nullable()->index();
            $tabla->date('fecha_compromiso')->nullable();
            $tabla->string('estado', 60)->nullable()->index();
            $tabla->string('prioridad', 60)->nullable();
            $tabla->unsignedTinyInteger('avance')->nullable();
            $tabla->boolean('vencida')->default(false);
            $tabla->text('comentario')->nullable();
            $tabla->text('enlaces')->nullable();
            $tabla->string('registro', 160)->nullable();
            $tabla->date('creado')->nullable();
            $tabla->timestamps();

            $tabla->foreign('iniciativa_id')
                  ->references('id')->on('iniciativas')
                  ->nullOnDelete();
        });

        /* Una fila por carga: de dónde salieron los datos que se están viendo. */
        Schema::create('cargas', function (Blueprint $tabla) {
            $tabla->id();
            $tabla->string('origen', 200);
            $tabla->unsignedInteger('iniciativas')->default(0);
            $tabla->unsignedInteger('actividades')->default(0);
            $tabla->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actividades');
        Schema::dropIfExists('iniciativas');
        Schema::dropIfExists('cargas');
    }
};
