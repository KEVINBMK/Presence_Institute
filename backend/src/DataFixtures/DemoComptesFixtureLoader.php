<?php

namespace App\DataFixtures;

use App\Entity\CompteInterneDemo;
use App\Enum\DemoRole;

/** Comptes internes de démonstration — authentification simulée par session. */
final class DemoComptesFixtureLoader
{
    public function load(FixtureContext $ctx): void
    {
        $reception = $ctx->receptions[0] ?? null;
        if (!$reception) {
            throw new \RuntimeException('Réception requise pour les comptes DEMO.');
        }

        $requiredKeys = [
            'patrick_tshimanga',
            'marie_ilunga',
            'jean_kabila',
            'david_mutombo',
            'alain_kabongo',
            'junior_kalala',
        ];

        foreach ($requiredKeys as $key) {
            if (!isset($ctx->demoPersonnelsByKey[$key])) {
                throw new \RuntimeException('Personnel DEMO introuvable : ' . $key);
            }
        }

        $codeHash = password_hash('1234', PASSWORD_DEFAULT);

        $comptes = [
            ['reception01', DemoRole::RECEPTION, null, $reception],
            ['patrick', DemoRole::PERSONNEL, $ctx->demoPersonnelsByKey['patrick_tshimanga'], null],
            ['marie', DemoRole::PERSONNEL, $ctx->demoPersonnelsByKey['marie_ilunga'], null],
            ['jean', DemoRole::PERSONNEL, $ctx->demoPersonnelsByKey['jean_kabila'], null],
            ['david', DemoRole::PERSONNEL, $ctx->demoPersonnelsByKey['david_mutombo'], null],
            ['alain', DemoRole::PERSONNEL, $ctx->demoPersonnelsByKey['alain_kabongo'], null],
            ['junior', DemoRole::PERSONNEL, $ctx->demoPersonnelsByKey['junior_kalala'], null],
        ];

        foreach ($comptes as [$identifiant, $role, $personnel, $receptionEntity]) {
            $compte = new CompteInterneDemo();
            $compte->setIdentifiant($identifiant);
            $compte->setCodeHash($codeHash);
            $compte->setRole($role);
            $compte->setPersonnel($personnel);
            $compte->setReception($receptionEntity);
            $compte->setActif(true);
            $ctx->em->persist($compte);
        }

        $ctx->em->flush();
    }
}
