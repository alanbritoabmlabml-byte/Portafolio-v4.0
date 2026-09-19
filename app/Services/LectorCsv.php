<?php

namespace App\Services;

/**
 * Lector de los export del Portafolio de Transformación.
 *
 * Deliberadamente tolerante: el separador puede ser «;» o «,», el archivo
 * puede venir con BOM, y los nombres de columna se buscan sin acentos ni
 * mayúsculas, porque el export ha cambiado de etiquetas más de una vez.
 *
 * No depende de Laravel: se puede probar con PHP a secas.
 */
class LectorCsv
{
    /** Direcciones web dentro de un texto libre. */
    public const URL = '~https?://[^\s<>"\')]+~i';

    /**
     * Convierte el texto de un CSV en filas asociativas.
     *
     * @return array<int, array<string, string>>
     */
    public static function filas(string $texto): array
    {
        $texto = preg_replace('/^\xEF\xBB\xBF/', '', $texto);
        $texto = str_replace("\r\n", "\n", $texto);
        $texto = str_replace("\r", "\n", $texto);

        if (trim($texto) === '') {
            return [];
        }

        $primera = strtok($texto, "\n") ?: '';
        $separador = substr_count($primera, ';') > substr_count($primera, ',') ? ';' : ',';

        $filas = [];
        $campo = '';
        $fila = [];
        $enComillas = false;
        $largo = strlen($texto);

        for ($i = 0; $i < $largo; $i++) {
            $ch = $texto[$i];

            if ($enComillas) {
                if ($ch === '"') {
                    if (($texto[$i + 1] ?? '') === '"') {
                        $campo .= '"';
                        $i++;
                    } else {
                        $enComillas = false;
                    }
                } else {
                    $campo .= $ch;
                }
                continue;
            }

            if ($ch === '"') {
                $enComillas = true;
            } elseif ($ch === $separador) {
                $fila[] = $campo;
                $campo = '';
            } elseif ($ch === "\n") {
                $fila[] = $campo;
                $filas[] = $fila;
                $fila = [];
                $campo = '';
            } else {
                $campo .= $ch;
            }
        }

        if ($campo !== '' || $fila !== []) {
            $fila[] = $campo;
            $filas[] = $fila;
        }

        if ($filas === []) {
            return [];
        }

        $cabecera = array_map('trim', array_shift($filas));
        $salida = [];

        foreach ($filas as $cruda) {
            $tieneAlgo = false;
            foreach ($cruda as $valor) {
                if (trim($valor) !== '') {
                    $tieneAlgo = true;
                    break;
                }
            }
            if (! $tieneAlgo) {
                continue;
            }

            $asociativa = [];
            foreach ($cabecera as $j => $clave) {
                $asociativa[$clave] = trim($cruda[$j] ?? '');
            }
            $salida[] = $asociativa;
        }

        return $salida;
    }

    /** Busca una columna por cualquiera de sus nombres posibles. */
    public static function col(array $fila, array $nombres, string $porDefecto = ''): string
    {
        foreach ($nombres as $buscado) {
            foreach ($fila as $clave => $valor) {
                if (self::plano((string) $clave) === self::plano($buscado)) {
                    return $valor;
                }
            }
        }

        return $porDefecto;
    }

    /** Minúsculas sin acentos, para comparar nombres de columna. */
    public static function plano(string $texto): string
    {
        $texto = strtr($texto, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ñ' => 'n', 'ü' => 'u',
            'Á' => 'a', 'É' => 'e', 'Í' => 'i', 'Ó' => 'o', 'Ú' => 'u', 'Ñ' => 'n', 'Ü' => 'u',
        ]);

        return trim(mb_strtolower($texto));
    }

    /** «08/07/2026» o «2026-07-08» → «2026-07-08»; cualquier otra cosa → null. */
    public static function fecha(string $valor): ?string
    {
        $valor = trim($valor);

        if ($valor === '' || $valor === '—') {
            return null;
        }

        if (preg_match('~^(\d{1,2})/(\d{1,2})/(\d{4})$~', $valor, $m)) {
            return sprintf('%04d-%02d-%02d', $m[3], $m[2], $m[1]);
        }

        if (preg_match('~^(\d{4})-(\d{2})-(\d{2})~', $valor, $m)) {
            return "{$m[1]}-{$m[2]}-{$m[3]}";
        }

        return null;
    }

    /** «40 %» → 40; «—» o vacío → null. */
    public static function porcentaje(string $valor): ?int
    {
        $limpio = str_replace(['%', '—', ' '], '', trim($valor));
        $limpio = str_replace(',', '.', $limpio);

        if ($limpio === '' || ! is_numeric($limpio)) {
            return null;
        }

        return (int) round((float) $limpio);
    }

    /** «Sí» → true; cualquier otra cosa → false. */
    public static function siNo(string $valor): bool
    {
        return in_array(self::plano($valor), ['si', 'sí', 'true', '1', 'x'], true);
    }

    /** @return array<int, string> Direcciones web encontradas en el texto. */
    public static function urls(string ...$textos): array
    {
        $encontradas = [];

        foreach ($textos as $texto) {
            if (preg_match_all(self::URL, $texto, $m)) {
                foreach ($m[0] as $url) {
                    $url = rtrim($url, '.,;:');
                    if (! in_array($url, $encontradas, true)) {
                        $encontradas[] = $url;
                    }
                }
            }
        }

        return $encontradas;
    }

    /**
     * El mismo texto sin las direcciones web.
     *
     * Si no había ninguna dirección, el texto sólo se recorta de espacios: un
     * punto final es parte de la frase y no se toca. Sólo cuando se quitó una
     * dirección se limpian además los separadores que quedaron colgando.
     */
    public static function sinUrls(string $texto): string
    {
        $limpio = preg_replace(self::URL, '', $texto) ?? $texto;

        if ($limpio === $texto) {
            return trim($texto);
        }

        return trim($limpio, " \t\n\r\0\x0B·-—:;,");
    }
}
