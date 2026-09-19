<?php

namespace App\Http\Controllers;

use App\Services\Importador;
use App\Services\RepositorioPortafolio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

/**
 * Carga de un export nuevo del Portafolio.
 *
 * No hay usuarios en este sistema, así que la pantalla se protege con una
 * clave compartida que vive en el entorno (PORTAFOLIO_CLAVE_CARGA). Si esa
 * variable queda vacía, la pantalla queda abierta: es una decisión que se
 * toma al desplegar, y el aviso está a la vista en la propia pantalla.
 */
class CargaController extends Controller
{
    public function __construct(private readonly RepositorioPortafolio $repositorio) {}

    public function formulario(Request $peticion): View
    {
        return view('carga', [
            'exigeClave' => $this->claveExigida() !== null,
            'autorizado' => $this->autorizado($peticion),
            'ultima' => $this->repositorio->ultimaCarga(),
        ]);
    }

    public function guardar(Request $peticion): RedirectResponse
    {
        if (! $this->autorizado($peticion)) {
            throw ValidationException::withMessages([
                'clave' => 'La clave no coincide.',
            ]);
        }

        $peticion->validate([
            'iniciativas' => ['required', 'file', 'mimetypes:text/plain,text/csv,application/csv,application/vnd.ms-excel', 'max:20480'],
            'actividades' => ['required', 'file', 'mimetypes:text/plain,text/csv,application/csv,application/vnd.ms-excel', 'max:20480'],
        ], [], [
            'iniciativas' => 'archivo de iniciativas',
            'actividades' => 'archivo de actividades',
        ]);

        $resultado = Importador::reemplazar(
            file_get_contents($peticion->file('iniciativas')->getRealPath()),
            file_get_contents($peticion->file('actividades')->getRealPath()),
            'Export cargado desde '.$peticion->file('iniciativas')->getClientOriginalName()
        );

        if ($resultado['iniciativas'] === 0) {
            return back()->withErrors([
                'iniciativas' => 'No se reconoció ninguna iniciativa en ese archivo. ¿Es el export del Portafolio?',
            ]);
        }

        $aviso = "Se cargaron {$resultado['iniciativas']} iniciativas y {$resultado['actividades']} actividades.";

        if ($resultado['huerfanas'] > 0) {
            $aviso .= " {$resultado['huerfanas']} actividades apuntaban a una iniciativa que no vino en el export y quedaron sueltas.";
        }

        return redirect()->route('carga')->with('aviso', $aviso);
    }

    private function claveExigida(): ?string
    {
        $clave = (string) config('portafolio.clave_carga', '');

        return $clave === '' ? null : $clave;
    }

    private function autorizado(Request $peticion): bool
    {
        $exigida = $this->claveExigida();

        if ($exigida === null) {
            return true;
        }

        $dada = (string) ($peticion->input('clave') ?? $peticion->session()->get('clave_carga', ''));

        if ($dada !== '' && hash_equals($exigida, $dada)) {
            $peticion->session()->put('clave_carga', $dada);

            return true;
        }

        return false;
    }
}
