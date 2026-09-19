<?php

namespace App\Services;

use App\Models\Actividad;
use App\Models\Carga;
use App\Models\Iniciativa;
use Illuminate\Support\Facades\DB;

/**
 * Convierte los dos CSV del Portafolio en filas de la base de datos.
 *
 * El mapeo de cada fila es una función pura y estática, así que se puede
 * probar sin levantar Laravel; sólo `reemplazar()` toca la base.
 */
class Importador
{
    /** @return array<string, mixed> */
    public static function mapearIniciativa(array $fila): array
    {
        $resultado = LectorCsv::col($fila, ['Resultado esperado', 'Resultado']);
        $enlaceDirecto = LectorCsv::col($fila, ['Enlace', 'Link', 'Documento', 'URL']);

        $enlaces = LectorCsv::urls($resultado, $enlaceDirecto);
        if ($enlaceDirecto !== '' && preg_match('~^https?://~i', $enlaceDirecto)
            && ! in_array($enlaceDirecto, $enlaces, true)) {
            $enlaces[] = $enlaceDirecto;
        }

        return [
            'id' => (int) LectorCsv::col($fila, ['ID']),
            'nombre' => LectorCsv::col($fila, ['Nombre', 'Iniciativa']),
            'pilar' => LectorCsv::col($fila, ['Pilar']),
            'estado' => LectorCsv::col($fila, ['Estado']),
            'etapa' => LectorCsv::col($fila, ['Etapa']),
            'impacto' => LectorCsv::col($fila, ['Impacto']),
            'avance' => LectorCsv::porcentaje(LectorCsv::col($fila, ['Avance'])),
            'fecha_inicio' => LectorCsv::fecha(LectorCsv::col($fila, ['Fecha inicio', 'Fecha de inicio'])),
            'fecha_fin' => LectorCsv::fecha(LectorCsv::col($fila, ['Fecha fin planificada', 'Fecha fin'])),
            'tipo' => LectorCsv::col($fila, ['Tipo de elemento', 'Tipo']),
            'area' => LectorCsv::col($fila, ['Área impactada', 'Area impactada', 'Área']),
            'macroproceso' => LectorCsv::col($fila, ['Macroproceso']),
            'complejidad' => LectorCsv::col($fila, ['Complejidad']),
            'prioridad' => LectorCsv::col($fila, ['Prioridad']),
            'lider' => LectorCsv::col($fila, ['Responsable líder', 'Responsable lider', 'Responsable']),
            'equipo' => LectorCsv::col($fila, ['Equipo responsable']),
            'responsable_pc' => LectorCsv::col($fila, ['Responsable PC']),
            'requiere_capacitacion' => LectorCsv::siNo(LectorCsv::col($fila, ['Requiere capacitación'])),
            'impacto_economico' => LectorCsv::siNo(LectorCsv::col($fila, ['Impacto económico'])),
            'resultado_esperado' => LectorCsv::sinUrls($resultado),
            'enlaces' => json_encode(array_values($enlaces), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'registro' => LectorCsv::col($fila, ['Registró', 'Registro']),
            'creado' => LectorCsv::fecha(LectorCsv::col($fila, ['Creado'])),
        ];
    }

    /** @return array<string, mixed> */
    public static function mapearActividad(array $fila): array
    {
        $comentario = LectorCsv::col($fila, ['Comentarios', 'Comentario']);
        $nombre = LectorCsv::col($fila, ['Actividad', 'Nombre']);
        $rotulo = LectorCsv::col($fila, ['Iniciativa']);
        $enlaceDirecto = LectorCsv::col($fila, ['Enlace', 'Link', 'Documento', 'URL']);

        $enlaces = LectorCsv::urls($comentario, $nombre, $enlaceDirecto);

        /* El export escribe la iniciativa como «475 · Nombre de la iniciativa». */
        $iniciativaId = null;
        if (preg_match('~^\s*(\d+)~', $rotulo, $m)) {
            $iniciativaId = (int) $m[1];
        }

        return [
            'id' => (int) LectorCsv::col($fila, ['ID']),
            'iniciativa_id' => $iniciativaId,
            'iniciativa_rotulo' => $rotulo,
            'nombre' => LectorCsv::sinUrls($nombre),
            'origen' => LectorCsv::col($fila, ['Origen']),
            'responsable' => LectorCsv::col($fila, ['Responsable']),
            'area' => LectorCsv::col($fila, ['Área', 'Area']),
            'fecha_compromiso' => LectorCsv::fecha(LectorCsv::col($fila, ['Fecha compromiso', 'Fecha de compromiso'])),
            'estado' => LectorCsv::col($fila, ['Estado']),
            'prioridad' => LectorCsv::col($fila, ['Prioridad']),
            'avance' => LectorCsv::porcentaje(LectorCsv::col($fila, ['Avance'])),
            'vencida' => LectorCsv::siNo(LectorCsv::col($fila, ['Vencida'])),
            'comentario' => LectorCsv::sinUrls($comentario),
            'enlaces' => json_encode(array_values($enlaces), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'registro' => LectorCsv::col($fila, ['Registró', 'Registro']),
            'creado' => LectorCsv::fecha(LectorCsv::col($fila, ['Creado'])),
        ];
    }

    /**
     * Reemplaza por completo el contenido de las dos tablas.
     *
     * Todo ocurre dentro de una transacción: si algo falla a mitad de camino,
     * los datos anteriores quedan intactos.
     *
     * @return array{iniciativas:int, actividades:int, huerfanas:int}
     */
    public static function reemplazar(?string $csvIniciativas, ?string $csvActividades, string $origen): array
    {
        $iniciativas = [];
        $actividades = [];

        foreach (LectorCsv::filas((string) $csvIniciativas) as $fila) {
            $mapeada = self::mapearIniciativa($fila);
            if ($mapeada['id'] > 0 && $mapeada['nombre'] !== '') {
                $iniciativas[$mapeada['id']] = $mapeada;
            }
        }

        foreach (LectorCsv::filas((string) $csvActividades) as $fila) {
            $mapeada = self::mapearActividad($fila);
            if ($mapeada['id'] > 0 && $mapeada['nombre'] !== '') {
                $actividades[$mapeada['id']] = $mapeada;
            }
        }

        /* Una actividad cuya iniciativa no vino en el export queda suelta,
           no se descarta: se ve igual en el explorador. */
        $huerfanas = 0;
        foreach ($actividades as $id => $actividad) {
            if ($actividad['iniciativa_id'] !== null && ! isset($iniciativas[$actividad['iniciativa_id']])) {
                $actividades[$id]['iniciativa_id'] = null;
                $huerfanas++;
            }
        }

        $ahora = now();

        DB::transaction(function () use ($iniciativas, $actividades, $origen, $ahora) {
            Actividad::query()->delete();
            Iniciativa::query()->delete();

            foreach (array_chunk($iniciativas, 200) as $lote) {
                Iniciativa::insert(array_map(
                    fn (array $f) => $f + ['created_at' => $ahora, 'updated_at' => $ahora],
                    $lote
                ));
            }

            foreach (array_chunk($actividades, 200) as $lote) {
                Actividad::insert(array_map(
                    fn (array $f) => $f + ['created_at' => $ahora, 'updated_at' => $ahora],
                    $lote
                ));
            }

            Carga::create([
                'origen' => $origen,
                'iniciativas' => count($iniciativas),
                'actividades' => count($actividades),
            ]);
        });

        return [
            'iniciativas' => count($iniciativas),
            'actividades' => count($actividades),
            'huerfanas' => $huerfanas,
        ];
    }
}
