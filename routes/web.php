<?php

use App\Http\Controllers\CargaController;
use App\Http\Controllers\PortadaController;
use App\Http\Controllers\TableroController;
use Illuminate\Support\Facades\Route;

Route::get('/', PortadaController::class)->name('portada');

Route::get('/tablero', [TableroController::class, 'index'])->name('tablero');
Route::get('/tablero/datos', [TableroController::class, 'datos'])->name('tablero.datos');

Route::get('/carga', [CargaController::class, 'formulario'])->name('carga');
Route::post('/carga', [CargaController::class, 'guardar'])->name('carga.guardar');
