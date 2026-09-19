<?php

return [
    /*
     * Clave compartida que protege la pantalla /carga. Vacía = pantalla
     * abierta a cualquiera que tenga el enlace.
     */
    'clave_carga' => env('PORTAFOLIO_CLAVE_CARGA', ''),
];
