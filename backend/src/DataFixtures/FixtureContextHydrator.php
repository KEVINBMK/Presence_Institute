<?php

namespace App\DataFixtures;

use App\DataFixtures\Support\FixtureCoherence;
use App\DataFixtures\Support\SlotRegistry;
use App\Entity\Bureau;
use App\Entity\Personnel;
use App\Entity\Reception;
use App\Entity\RendezVous;
use App\Entity\UsagerVisiteur;
use App\Entity\Visite;
use App\Enum\StatutRendezVous;
/** Réhydrate le contexte après chargement DEMO (pour VolumeFixtures). */
final class FixtureContextHydrator
{
    public static function hydrate(FixtureContext $ctx): void
    {
        $ctx->receptions = $ctx->em->getRepository(Reception::class)->findAll();
        $ctx->bureaux = $ctx->em->getRepository(Bureau::class)->findAll();
        $ctx->personnels = $ctx->em->getRepository(Personnel::class)->findAll();
        $ctx->usagers = $ctx->em->getRepository(UsagerVisiteur::class)->findAll();
        $ctx->rendezVous = $ctx->em->getRepository(RendezVous::class)->findAll();
        $ctx->visites = $ctx->em->getRepository(Visite::class)->findAll();

        $ctx->personnelsByBureauId = [];
        foreach ($ctx->bureaux as $bureau) {
            $ctx->personnelsByBureauId[$bureau->getId()] = array_values(array_filter(
                $ctx->personnels,
                static fn (Personnel $p) => $p->getBureau()->getId() === $bureau->getId(),
            ));
        }

        $ctx->rdvSeq = count($ctx->rendezVous);
        $ctx->visSeq = count($ctx->visites);

        $today = (new \DateTimeImmutable('today'))->format('Y-m-d');
        foreach ($ctx->visites as $visite) {
            if (!FixtureCoherence::visiteIsOpen($visite->getStatut())) {
                continue;
            }
            $dateYmd = $visite->getHeureArrivee()?->format('Y-m-d') ?? $today;
            $ctx->registerOpenVisite($visite, $dateYmd);
        }

        foreach ($ctx->rendezVous as $rdv) {
            if (!$rdv->getPersonnel() || !$rdv->getHeureDebut() || !$rdv->getHeureFin()) {
                continue;
            }
            if (!in_array($rdv->getStatut(), [
                StatutRendezVous::CONFIRME,
                StatutRendezVous::ARRIVE,
                StatutRendezVous::EN_COURS,
                StatutRendezVous::REPORTE,
            ], true)) {
                continue;
            }
            $ctx->slots->reserve(
                $rdv->getPersonnel(),
                $rdv->getDateRendezVous()->format('Y-m-d'),
                $rdv->getHeureDebut()->format('H:i'),
                $rdv->getHeureFin()->format('H:i'),
            );
        }

        $ctx->historiqueCount = (int) $ctx->em->createQueryBuilder()
            ->select('COUNT(h.id)')
            ->from(\App\Entity\HistoriqueAction::class, 'h')
            ->getQuery()
            ->getSingleScalarResult();

        $ctx->notificationCount = (int) $ctx->em->createQueryBuilder()
            ->select('COUNT(n.id)')
            ->from(\App\Entity\NotificationInterne::class, 'n')
            ->getQuery()
            ->getSingleScalarResult();
    }
}
