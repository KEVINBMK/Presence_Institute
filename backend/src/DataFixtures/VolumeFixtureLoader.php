<?php

namespace App\DataFixtures;

use App\DataFixtures\Support\FixtureCoherence;
use App\DataFixtures\Support\SlotRegistry;
use App\DataFixtures\Support\VolumeHistoriqueSynthesizer;
use App\Entity\RendezVous;
use App\Entity\UsagerVisiteur;
use App\Entity\Visite;
use App\Enum\DecisionReception;
use App\Enum\StatutRendezVous;
use App\Enum\StatutVisite;
use App\Enum\TypeUsager;
use App\Util\ReferenceGenerator;

/** Volume aléatoire (~1000 lignes) — chargé après le jeu DEMO. */
final class VolumeFixtureLoader
{
    private const MOTIFS_RDV = [
        'Demande d\'information administrative',
        'Suivi de dossier',
        'Assistance technique',
        'Problème d\'accès au système',
        'Dépôt de document',
        'Réunion avec un bureau technique',
        'Orientation vers un service',
        'Mise à jour d\'informations',
        'Consultation administrative',
        'Dépannage informatique',
        'Vérification d\'un dossier transmis',
        'Demande d\'appui technique',
    ];

    /** @var array<string, int> */
    private const POIDS_STATUT_RDV = [
        'CONFIRME' => 50,
        'DEMANDE' => 18,
        'REPORTE' => 8,
        'ANNULE' => 4,
        'NON_PRESENTE' => 3,
    ];

    /** @var array<string, int> */
    private const POIDS_STATUT_VISITE = [
        'OUVERTE' => 25,
        'EN_ATTENTE' => 20,
        'ORIENTEE' => 20,
        'EN_COURS' => 15,
        'TERMINEE' => 15,
        'SUSPENDUE' => 5,
    ];

    public function load(FixtureContext $ctx): void
    {
        $this->createUsagers($ctx);
        $eligible = $this->createRendezVous($ctx);
        $this->createVisites($ctx, $eligible);
        (new VolumeHistoriqueSynthesizer())->synthesize($ctx);
        $ctx->em->flush();
    }

    private function createUsagers(FixtureContext $ctx): void
    {
        $faker = $ctx->faker;
        $types = TypeUsager::cases();
        $target = max(0, 350 - count($ctx->usagers));

        for ($i = 0; $i < $target; ++$i) {
            $u = new UsagerVisiteur();
            $u->setNom($faker->lastName());
            $u->setPrenom($faker->firstName());
            $u->setTelephone($this->volumePhone($i));
            $u->setEmail($faker->boolean(70) ? $faker->safeEmail() : null);
            $u->setTypeUsager($faker->randomElement($types));
            $ctx->em->persist($u);
            $ctx->usagers[] = $u;
            $ctx->flushBatch();
        }
        $ctx->em->flush();
    }

    /** @return RendezVous[] RDV éligibles à une visite (CONFIRME, date passée ou aujourd'hui) */
    private function createRendezVous(FixtureContext $ctx): array
    {
        $faker = $ctx->faker;
        $today = new \DateTimeImmutable('today');
        $durations = [15, 30, 45, 60];
        $eligible = [];

        for ($n = 0; $n < 500; ++$n) {
            $bureau = $faker->randomElement($ctx->bureaux);
            $usager = $faker->randomElement($ctx->usagers);
            if (FixtureCoherence::isDemoPhone($usager->getTelephone())) {
                continue;
            }

            ++$ctx->rdvSeq;

            $statut = StatutRendezVous::from($this->weightedPick(self::POIDS_STATUT_RDV));
            $duration = $faker->randomElement($durations);
            $date = $this->randomRdvDate($faker, $today);
            $dateYmd = $date->format('Y-m-d');
            $bureauId = $bureau->getId();
            $candidats = $ctx->personnelsByBureauId[$bureauId] ?? [];

            $personnel = null;
            $heureDebut = '08:00';
            $heureFin = '08:30';
            $slotReserved = false;
            $needsReserve = in_array($statut, [StatutRendezVous::CONFIRME, StatutRendezVous::REPORTE], true);

            if ($needsReserve && $candidats !== []) {
                $pick = $ctx->slots->pickPersonnelAndSlot($bureau, $candidats, $dateYmd, $duration);
                if ($pick) {
                    $personnel = $pick['personnel'];
                    $heureDebut = $pick['heureDebut'];
                    $heureFin = $pick['heureFin'];
                    $slotReserved = true;
                }
            }

            if (!$slotReserved) {
                $slot = $ctx->slots->pickSlotWithoutPersonnel($bureau, $duration, $faker);
                $heureDebut = $slot['heureDebut'];
                $heureFin = $slot['heureFin'];
                if ($needsReserve && $candidats !== [] && !$personnel) {
                    $personnel = $faker->randomElement($candidats);
                }
                if ($personnel && $needsReserve && !$ctx->slots->overlaps($personnel, $dateYmd, $heureDebut, $heureFin)) {
                    $ctx->slots->reserve($personnel, $dateYmd, $heureDebut, $heureFin);
                    $slotReserved = true;
                }
            }

            $rdv = new RendezVous();
            $rdv->setReference(ReferenceGenerator::rendezVousSequential($ctx->rdvSeq));
            $rdv->setDateRendezVous($date);
            $rdv->setHeureDebut(SlotRegistry::timeImmutable($heureDebut));
            $rdv->setHeureFin(SlotRegistry::timeImmutable($heureFin));
            $rdv->setMotif($faker->randomElement(self::MOTIFS_RDV));
            $rdv->setStatut($statut);
            $rdv->setUsager($usager);
            $rdv->setBureau($bureau);
            $rdv->setPersonnel($personnel);

            $ctx->em->persist($rdv);
            $ctx->rendezVous[] = $rdv;
            if ($statut === StatutRendezVous::CONFIRME && $date <= $today) {
                $eligible[] = $rdv;
            }

            $ctx->flushBatch();
        }

        $ctx->em->flush();

        return $eligible;
    }

    /** @param RendezVous[] $eligible */
    private function createVisites(FixtureContext $ctx, array $eligible): void
    {
        $faker = $ctx->faker;
        $today = new \DateTimeImmutable('today');
        shuffle($eligible);

        $created = 0;
        $target = 120;
        $multi2 = (int) round($target * 0.20);
        $multi3 = (int) round($target * 0.05);

        /** @var array<string, RendezVous[]> */
        $byUsagerDate = [];
        foreach ($eligible as $rdv) {
            $key = $rdv->getUsager()->getId() . '|' . $rdv->getDateRendezVous()->format('Y-m-d');
            $byUsagerDate[$key][] = $rdv;
        }

        foreach ($byUsagerDate as $key => $rdvs) {
            if ($created >= $target) {
                break;
            }

            $usager = $rdvs[0]->getUsager();
            if (FixtureCoherence::isDemoPhone($usager->getTelephone())) {
                continue;
            }

            $dateYmd = $rdvs[0]->getDateRendezVous()->format('Y-m-d');
            if ($ctx->hasOpenVisite($usager, $dateYmd)) {
                continue;
            }

            if (!FixtureCoherence::canOpenVisiteForRdvs($rdvs)) {
                continue;
            }

            if ($faker->boolean(65) === false) {
                continue;
            }

            $nbRdv = 1;
            if ($created < $multi3 && count($rdvs) >= 3) {
                $nbRdv = 3;
            } elseif ($created < $multi2 + $multi3 && count($rdvs) >= 2) {
                $nbRdv = 2;
            }
            $toLink = array_slice($rdvs, 0, $nbRdv);

            ++$ctx->visSeq;
            $statutVisite = StatutVisite::from($this->weightedPick(self::POIDS_STATUT_VISITE));
            $reception = $faker->randomElement($ctx->receptions);

            $visite = new Visite();
            $visite->setReference(ReferenceGenerator::visiteSequential($ctx->visSeq));
            $visite->setUsager($usager);
            $visite->setReception($reception);
            $visite->setStatut($statutVisite);

            $rdvPrincipal = $toLink[0];
            $arrivee = $rdvPrincipal->getDateRendezVous()->setTime(
                (int) $rdvPrincipal->getHeureDebut()->format('H'),
                (int) $rdvPrincipal->getHeureDebut()->format('i'),
            )->modify('+' . random_int(0, 20) . ' minutes');
            $visite->setHeureArrivee($arrivee);

            $decision = match ($statutVisite) {
                StatutVisite::TERMINEE => DecisionReception::CLOTURER,
                StatutVisite::EN_ATTENTE, StatutVisite::SUSPENDUE => DecisionReception::ATTENDRE,
                StatutVisite::EN_COURS => DecisionReception::CONTINUER,
                StatutVisite::ORIENTEE => DecisionReception::REORIENTER,
                default => null,
            };
            $visite->setDecisionReception($decision);

            if ($statutVisite === StatutVisite::TERMINEE) {
                $visite->setHeureSortie($arrivee->modify('+' . random_int(45, 120) . ' minutes'));
            }

            foreach ($toLink as $rdv) {
                $visite->addRendezVous($rdv);
            }

            FixtureCoherence::applyVisiteToRendezVous($visite, $toLink);
            $ctx->em->persist($visite);
            $ctx->visites[] = $visite;

            if (FixtureCoherence::visiteIsOpen($statutVisite)) {
                $ctx->registerOpenVisite($visite, $dateYmd);
            }

            ++$created;
            $ctx->flushBatch();
        }

        $ctx->em->flush();
    }

    private function randomRdvDate(\Faker\Generator $faker, \DateTimeImmutable $today): \DateTimeImmutable
    {
        $roll = random_int(1, 100);
        if ($roll <= 25) {
            return $today;
        }
        if ($roll <= 85) {
            return $today->modify('-' . random_int(1, 30) . ' days');
        }

        return $today->modify('+' . random_int(1, 14) . ' days');
    }

    private function volumePhone(int $index): string
    {
        return '081' . str_pad((string) (10000000 + $index), 8, '0', STR_PAD_LEFT);
    }

    /** @param array<string, int> $weights */
    private function weightedPick(array $weights): string
    {
        $pool = [];
        foreach ($weights as $value => $w) {
            for ($i = 0; $i < $w; ++$i) {
                $pool[] = $value;
            }
        }

        return $pool[array_rand($pool)];
    }
}
