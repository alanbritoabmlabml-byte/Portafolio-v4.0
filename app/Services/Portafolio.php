<?php

namespace App\Services;

/**
 * Traduce las filas de la base de datos al paquete que consume el tablero
 * en el navegador, y calcula las cifras de cabecera de la portada.
 *
 * Las claves cortas («ini», «fin», «macro», «resp»…) no son capricho: son
 * el contrato con public/js/tablero.js, y el paquete viaja entero en cada
 * carga del tablero, así que cada carácter cuenta.
 *
 * Funciones puras sobre arreglos: se prueban sin base de datos.
 */
class Portafolio
{
    /**
     * @param  array<int, array<string, mixed>>  $iniciativas
     * @param  array<int, array<string, mixed>>  $actividades
     * @return array<string, mixed>
     */
    public static function paquete(array $iniciativas, array $actividades, string $fuente): array
    {
        return [
            'generado' => date('Y-m-d'),
            'fuente' => $fuente,
            'iniciativas' => array_map(self::iniciativa(...), $iniciativas),
            'actividades' => array_map(self::actividad(...), $actividades),
        ];
    }

    /** @return array<string, mixed> */
    public static function iniciativa(array $f): array
    {
        return [
            'id' => (int) $f['id'],
            'nombre' => (string) ($f['nombre'] ?? ''),
            'pilar' => (string) ($f['pilar'] ?? ''),
            'estado' => (string) ($f['estado'] ?? ''),
            'etapa' => (string) ($f['etapa'] ?? ''),
            'impacto' => (string) ($f['impacto'] ?? ''),
            'avance' => self::entero($f['avance'] ?? null),
            'ini' => self::soloFecha($f['fecha_inicio'] ?? null),
            'fin' => self::soloFecha($f['fecha_fin'] ?? null),
            'tipo' => (string) ($f['tipo'] ?? ''),
            'area' => (string) ($f['area'] ?? ''),
            'macro' => (string) ($f['macroproceso'] ?? ''),
            'compl' => (string) ($f['complejidad'] ?? ''),
            'prio' => (string) ($f['prioridad'] ?? ''),
            'lider' => (string) ($f['lider'] ?? ''),
            'equipo' => (string) ($f['equipo'] ?? ''),
            'pc' => (string) ($f['responsable_pc'] ?? ''),
            'cap' => (bool) ($f['requiere_capacitacion'] ?? false),
            'eco' => (bool) ($f['impacto_economico'] ?? false),
            'nota' => (string) ($f['resultado_esperado'] ?? ''),
            'enlaces' => self::lista($f['enlaces'] ?? null),
            'creado' => self::soloFecha($f['creado'] ?? null),
            'registro' => (string) ($f['registro'] ?? ''),
        ];
    }

    /** @return array<string, mixed> */
    public static function actividad(array $f): array
    {
        return [
            'id' => (int) $f['id'],
            'nombre' => (string) ($f['nombre'] ?? ''),
            'iniRaw' => (string) ($f['iniciativa_rotulo'] ?? ''),
            'iniId' => isset($f['iniciativa_id']) && $f['iniciativa_id'] !== null
                ? (int) $f['iniciativa_id']
                : null,
            'origen' => (string) ($f['origen'] ?? ''),
            'resp' => (string) ($f['responsable'] ?? ''),
            'area' => (string) ($f['area'] ?? ''),
            'compromiso' => self::soloFecha($f['fecha_compromiso'] ?? null),
            'estado' => (string) ($f['estado'] ?? ''),
            'prio' => (string) ($f['prioridad'] ?? ''),
            'avance' => self::entero($f['avance'] ?? null),
            'vencida' => (bool) ($f['vencida'] ?? false),
            'comentario' => (string) ($f['comentario'] ?? ''),
            'enlaces' => self::lista($f['enlaces'] ?? null),
            'creado' => self::soloFecha($f['creado'] ?? null),
            'registro' => (string) ($f['registro'] ?? ''),
        ];
    }

    /**
     * Cifras de cabecera de la portada. Se calculan en el servidor para que
     * la portada no tenga que descargar el paquete completo del tablero.
     *
     * @param  array<int, array<string, mixed>>  $iniciativas
     * @param  array<int, array<string, mixed>>  $actividades
     * @return array<string, mixed>
     */
    public static function resumen(array $iniciativas, array $actividades, ?string $fecha = null): array
    {
        $porIniciativa = [];
        foreach ($actividades as $a) {
            $id = $a['iniciativa_id'] ?? null;
            if ($id !== null) {
                $porIniciativa[(int) $id][] = $a;
            }
        }

        $conPlan = 0;
        $avances = [];

        foreach ($iniciativas as $i) {
            $suyas = $porIniciativa[(int) $i['id']] ?? [];

            if ($suyas !== []) {
                $conPlan++;
                $suma = 0;
                foreach ($suyas as $a) {
                    $suma += (int) ($a['avance'] ?? 0);
                }
                $avances[] = $suma / count($suyas);
            } elseif (($i['avance'] ?? null) !== null) {
                $avances[] = (float) $i['avance'];
            }
        }

        $cerradas = 0;
        $vencidas = 0;
        foreach ($actividades as $a) {
            if (($a['estado'] ?? '') === 'Cerrado') {
                $cerradas++;
            }
            if (($a['estado'] ?? '') === 'Vencido') {
                $vencidas++;
            }
        }

        $iniCerradas = 0;
        $areas = [];
        foreach ($iniciativas as $i) {
            if (($i['etapa'] ?? '') === 'Cerrado') {
                $iniCerradas++;
            }
            if (($i['area'] ?? '') !== '') {
                $areas[$i['area']] = true;
            }
        }

        $responsables = [];
        foreach ($actividades as $a) {
            if (($a['responsable'] ?? '') !== '') {
                $responsables[$a['responsable']] = true;
            }
        }

        return [
            'fecha' => $fecha ?? date('Y-m-d'),
            'iniciativas' => count($iniciativas),
            'actividades' => count($actividades),
            'conPlan' => $conPlan,
            'cerradasIni' => $iniCerradas,
            'actCerradas' => $cerradas,
            'actVencidas' => $vencidas,
            'avanceMedio' => $avances === [] ? 0 : (int) round(array_sum($avances) / count($avances)),
            'areas' => count($areas),
            'responsables' => count($responsables),
        ];
    }

    private static function entero(mixed $valor): ?int
    {
        return $valor === null || $valor === '' ? null : (int) $valor;
    }

    /** Las fechas viajan como «aaaa-mm-dd» pelado, sin hora ni zona. */
    private static function soloFecha(mixed $valor): ?string
    {
        if ($valor === null || $valor === '') {
            return null;
        }

        if ($valor instanceof \DateTimeInterface) {
            return $valor->format('Y-m-d');
        }

        return substr((string) $valor, 0, 10);
    }

    /** @return array<int, string> */
    private static function lista(mixed $valor): array
    {
        if (is_array($valor)) {
            return array_values($valor);
        }

        if (is_string($valor) && $valor !== '') {
            $decodificado = json_decode($valor, true);
            if (is_array($decodificado)) {
                return array_values($decodificado);
            }
        }

        return [];
    }
}
