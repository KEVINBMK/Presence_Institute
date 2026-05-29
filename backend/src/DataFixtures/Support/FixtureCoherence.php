<?php

namespace App\DataFixtures\Support;

use App\Entity\RendezVous;
use App\Entity\Visite;
use App\Enum\StatutRendezVous;
use App\Enum\StatutVisite;

/** Règles de cohérence statuts visite ↔ rendez-vous (MVP réception centrale). */
final class FixtureCoherence
{
    public const DEMO_PHONES = [
        '0890000001',
        '0890000002',
        '0890000003',
        '0890000004',
        '0890000005',
        '0890000006',
    ];

    public static function isDemoPhone(string $telephone): bool
    {
        return in_array($telephone, self::DEMO_PHONES, true);
    }

    public static function visiteIsOpen(StatutVisite $statut): bool
    {
        return $statut !== StatutVisite::TERMINEE;
    }

    public static function canOpenVisiteForRdvs(array $rdvs): bool
    {
        if ($rdvs === []) {
            return false;
        }

        foreach ($rdvs as $rdv) {
            if (in_array($rdv->getStatut(), [StatutRendezVous::ANNULE, StatutRendezVous::NON_PRESENTE], true)) {
                return false;
            }
        }

        return true;
    }

    /** @param RendezVous[] $rdvs */
    public static function applyVisiteToRendezVous(Visite $visite, array $rdvs): void
    {
        if ($rdvs === []) {
            return;
        }

        match ($visite->getStatut()) {
            StatutVisite::TERMINEE => self::setAll($rdvs, StatutRendezVous::TERMINE),
            StatutVisite::EN_COURS => self::applyEnCours($rdvs),
            StatutVisite::ORIENTEE, StatutVisite::OUVERTE => self::applyArriveOrConfirme($rdvs),
            StatutVisite::EN_ATTENTE, StatutVisite::SUSPENDUE => self::applyArriveOrConfirme($rdvs),
        };
    }

    /** @param RendezVous[] $rdvs */
    private static function applyEnCours(array $rdvs): void
    {
        $first = true;
        foreach ($rdvs as $rdv) {
            if ($rdv->getStatut()->isTerminal()) {
                continue;
            }
            if ($first) {
                $rdv->setStatut(StatutRendezVous::EN_COURS);
                $first = false;
            } else {
                $rdv->setStatut(StatutRendezVous::ARRIVE);
            }
        }
    }

    /** @param RendezVous[] $rdvs */
    private static function applyArriveOrConfirme(array $rdvs): void
    {
        $arriveSet = false;
        foreach ($rdvs as $i => $rdv) {
            if ($rdv->getStatut()->isTerminal()) {
                continue;
            }
            if (!$arriveSet) {
                $rdv->setStatut(StatutRendezVous::ARRIVE);
                $arriveSet = true;
            } elseif ($rdv->getStatut() === StatutRendezVous::DEMANDE) {
                $rdv->setStatut(StatutRendezVous::CONFIRME);
            }
        }
    }

    /** @param RendezVous[] $rdvs */
    private static function setAll(array $rdvs, StatutRendezVous $statut): void
    {
        foreach ($rdvs as $rdv) {
            if (!$rdv->getStatut()->isTerminal() || $statut === StatutRendezVous::TERMINE) {
                $rdv->setStatut($statut);
            }
        }
    }

    /** Statuts autorisés en génération volume (sans visite encore). */
    public static function volumeRdvStatutsPool(): array
    {
        return [
            StatutRendezVous::CONFIRME,
            StatutRendezVous::DEMANDE,
            StatutRendezVous::REPORTE,
            StatutRendezVous::ANNULE,
            StatutRendezVous::NON_PRESENTE,
        ];
    }
}
