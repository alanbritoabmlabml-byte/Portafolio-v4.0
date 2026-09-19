<?php

namespace App\Http\Controllers;

use App\Services\RepositorioPortafolio;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class TableroController extends Controller
{
    public function __construct(private readonly RepositorioPortafolio $repositorio) {}

    public function index(): View
    {
        return view('tablero', [
            'fuente' => $this->repositorio->fuente(),
            'hayDatos' => $this->repositorio->hayDatos(),
        ]);
    }

    /** El paquete de datos que pide el tablero al cargarse. */
    public function datos(): JsonResponse
    {
        return response()
            ->json($this->repositorio->paquete())
            ->header('Cache-Control', 'no-store');
    }
}
