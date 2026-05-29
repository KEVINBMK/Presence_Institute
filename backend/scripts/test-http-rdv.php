<?php

/**
 * Smoke test HTTP — POST demande usager (planification automatique).
 * Contrat actuel : dateSouhaitee + periodeSouhaitee optionnelle, sans heureDebut.
 *
 * Usage : php scripts/test-http-rdv.php
 */

require dirname(__DIR__) . '/vendor/autoload.php';

use App\Kernel;
use Symfony\Component\HttpFoundation\Request;

$kernel = new Kernel('dev', true);
$request = Request::create(
    '/api/rendez-vous',
    'POST',
    [],
    [],
    [],
    ['CONTENT_TYPE' => 'application/json'],
    json_encode([
        'nom' => 'HTTP',
        'prenom' => 'Test',
        'telephone' => '06' . random_int(10000000, 99999999),
        'bureauId' => 1,
        'dateSouhaitee' => date('Y-m-d'),
        'periodeSouhaitee' => 'APRES_MIDI',
        'motif' => 'Test HTTP kernel — demande usager',
        'typeUsager' => 'CITOYEN',
    ], JSON_THROW_ON_ERROR),
);

$response = $kernel->handle($request);
echo $response->getStatusCode() . "\n";
echo substr($response->getContent(), 0, 500) . "\n";
$kernel->terminate($request, $response);
