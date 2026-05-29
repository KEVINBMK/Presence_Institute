<?php

require dirname(__DIR__) . '/vendor/autoload.php';

use App\DTO\CreateRendezVousDto;
use App\Kernel;

$kernel = new Kernel('dev', true);
$kernel->boot();
$container = $kernel->getContainer();

$dto = new CreateRendezVousDto();
$dto->nom = 'CLI';
$dto->prenom = 'Test';
$dto->telephone = '06' . random_int(10000000, 99999999);
$dto->bureauId = 1;
$dto->dateSouhaitee = date('Y-m-d');
$dto->motif = 'Test CLI';

try {
    $svc = $container->get(\App\Service\RendezVousService::class);
    $rdv = $svc->creerDemande($dto);
    $container->get('doctrine')->getManager()->flush();
    echo "OK id={$rdv->getId()} ref={$rdv->getReference()} statut={$rdv->getStatut()->value}\n";
} catch (Throwable $e) {
    echo 'ERR: ' . $e->getMessage() . "\n";
}
