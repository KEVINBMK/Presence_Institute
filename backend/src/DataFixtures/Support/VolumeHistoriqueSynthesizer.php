<?php

namespace App\DataFixtures\Support;

use App\DataFixtures\FixtureContext;
use App\Entity\RendezVous;
use App\Entity\Visite;
use App\Enum\DisponibilitePersonnel;
use App\Enum\StatutRendezVous;
use App\Enum\StatutVisite;

/**
 * Historiques et notifications volume dérivés de l'état réel des RDV et visites (hors DEMO).
 */
final class VolumeHistoriqueSynthesizer
{
    public function synthesize(FixtureContext $ctx): void
    {
        $events = new FixtureEventRecorder($ctx);

        foreach ($ctx->rendezVous as $rdv) {
            if (FixtureCoherence::isDemoPhone($rdv->getUsager()->getTelephone())) {
                continue;
            }
            $this->synthesizeRendezVous($events, $rdv);
        }

        foreach ($ctx->visites as $visite) {
            if (FixtureCoherence::isDemoPhone($visite->getUsager()->getTelephone())) {
                continue;
            }
            $this->synthesizeVisite($events, $visite);
        }

        $ctx->em->flush();
    }

    private function synthesizeRendezVous(FixtureEventRecorder $events, RendezVous $rdv): void
    {
        $events->rendezVousCree($rdv);

        if ($rdv->getStatut() === StatutRendezVous::DEMANDE) {
            return;
        }
        if ($rdv->getStatut() === StatutRendezVous::ANNULE) {
            $events->rendezVousAnnule($rdv);

            return;
        }
        if ($rdv->getStatut() === StatutRendezVous::NON_PRESENTE) {
            $events->rendezVousConfirme($rdv);
            $events->usagerNonPresente($rdv);

            return;
        }
        if ($rdv->getStatut() === StatutRendezVous::REPORTE) {
            $events->rendezVousConfirme($rdv);
            $events->rendezVousReporte($rdv);

            return;
        }
        $events->rendezVousConfirme($rdv);
    }

    private function synthesizeVisite(FixtureEventRecorder $events, Visite $visite): void
    {
        $rdvs = [];
        foreach ($visite->getRendezVousLiens() as $lien) {
            $rdvs[] = $lien->getRendezVous();
        }
        if ($rdvs === [] || !FixtureCoherence::canOpenVisiteForRdvs($rdvs)) {
            return;
        }

        $rdvPrincipal = $rdvs[0];
        $events->arriveeEnregistree($rdvPrincipal, $visite);
        $events->visiteOuverte($visite);

        if ($visite->getStatut() === StatutVisite::ORIENTEE) {
            $events->orientation($visite, $rdvPrincipal);
        }

        $personnel = $rdvPrincipal->getPersonnel();
        if ($personnel
            && $personnel->getDisponibiliteOperationnelle() === DisponibilitePersonnel::NON_DISPONIBLE_POUR_RECEPTION
            && in_array($visite->getStatut(), [StatutVisite::EN_ATTENTE, StatutVisite::SUSPENDUE], true)
        ) {
            $events->personnelNonDisponible($personnel, $rdvPrincipal, $visite);
        }

        if (in_array($visite->getStatut(), [StatutVisite::EN_COURS, StatutVisite::TERMINEE], true) && $personnel) {
            $events->priseEnChargeDemarree($rdvPrincipal, $personnel);
            if ($rdvPrincipal->getStatut() === StatutRendezVous::TERMINE) {
                $events->priseEnChargeCloturee($rdvPrincipal, $personnel, $visite);
            }
        }

        if ($visite->getDecisionReception()) {
            $events->decisionReception($visite, $rdvPrincipal);
        }

        if ($visite->getStatut() === StatutVisite::TERMINEE) {
            $events->visiteCloturee($visite);
        }
    }
}
