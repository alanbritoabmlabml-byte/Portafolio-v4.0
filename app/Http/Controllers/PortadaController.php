<?php

namespace App\Http\Controllers;

use App\Services\RepositorioPortafolio;
use Illuminate\View\View;

class PortadaController extends Controller
{
    public function __construct(private readonly RepositorioPortafolio $repositorio) {}

    public function __invoke(): View
    {
        return view('portada', [
            'resumen' => $this->repositorio->hayDatos() ? $this->repositorio->resumen() : null,
        ]);
    }
}
