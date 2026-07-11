<?php

namespace App\DataFixtures;

use App\DataFixtures\Support\FixtureCoherence;
use App\DataFixtures\Support\FixtureEventRecorder;
use App\DataFixtures\Support\SlotRegistry;
use App\Entity\Bureau;
use App\Entity\Personnel;
use App\Entity\RendezVous;
use App\Entity\UsagerVisiteur;
use App\Entity\Visite;
use App\Enum\DecisionReception;
use App\Enum\DisponibilitePersonnel;
use App\Enum\StatutRendezVous;
use App\Enum\StatutVisite;
use App\Enum\TypeUsager;
use App\Util\ReferenceGenerator;

/**
 * Jeu DEMO — scénarios A à F avec téléphones et références fixes.
 */
final class DemoFixtureLoader
{
    public function load(FixtureContext $ctx): void
    {
        $events = new FixtureEventRecorder($ctx);
        $today = new \DateTimeImmutable('today');
        $reception = $ctx->receptions[0];

        $bureauSec = $this->bureau($ctx, 'Bureau Secrétariat');
        $bureauGenie = $this->bureau($ctx, 'Bureau Génie Logiciel');
        $bureauAdminSys = $this->bureau($ctx, 'Bureau Administration Système');

        $personnelJean = $this->perso($ctx, 'jean_kabila');
        $personnelMarie = $this->perso($ctx, 'marie_ilunga');
        $personnelPatrick = $this->perso($ctx, 'patrick_tshimanga');
        $personnelDavid = $this->perso($ctx, 'david_mutombo');
        $personnelAlain = $this->perso($ctx, 'alain_kabongo');

        $ctx->rdvSeq = 0;
        $ctx->visSeq = 0;

        // A — Parcours complet
        $usagerA = $this->usager($ctx, 'Mukendi', 'Jean', '0890000001', TypeUsager::CITOYEN);
        $rdvA = $this->rdv($ctx, 1, $usagerA, $bureauSec, $personnelJean, $today, '09:00', '09:30', StatutRendezVous::CONFIRME, 'Suivi de dossier');
        $events->rendezVousCree($rdvA);
        $events->rendezVousConfirme($rdvA);
        $visiteA = $this->visite($ctx, 1, $usagerA, $reception, StatutVisite::TERMINEE, DecisionReception::CLOTURER, [$rdvA], $today->setTime(9, 5));
        $ctx->registerOpenVisite($visiteA, $today->format('Y-m-d'));
        $events->arriveeEnregistree($rdvA, $visiteA);
        $events->visiteOuverte($visiteA);
        $events->orientation($visiteA, $rdvA);
        $events->priseEnChargeDemarree($rdvA, $personnelJean);
        $events->priseEnChargeCloturee($rdvA, $personnelJean, $visiteA);
        $events->decisionReception($visiteA, $rdvA);
        $events->visiteCloturee($visiteA);
        $ctx->demoRefs['rdvScenarioA'] = $rdvA->getReference();
        $ctx->demoRefs['visiteScenarioA'] = $visiteA->getReference();
        $ctx->demoRefs['usagerTelScenarioA'] = '0890000001';

        // B — 3 RDV même jour, même bureau (Génie Logiciel), personnels différents
        $usagerB = $this->usager($ctx, 'Kabongo', 'Marie', '0890000002', TypeUsager::AGENT_PUBLIC);
        $rdvB1 = $this->rdv($ctx, 2, $usagerB, $bureauGenie, $personnelMarie, $today, '10:00', '10:30', StatutRendezVous::TERMINE, 'Évolution application métier');
        $rdvB2 = $this->rdv($ctx, 3, $usagerB, $bureauGenie, $personnelPatrick, $today, '11:00', '11:30', StatutRendezVous::ARRIVE, 'Revue des spécifications', 'Analyste logiciel');
        $rdvB3 = $this->rdv($ctx, 4, $usagerB, $bureauGenie, $personnelDavid, $today, '11:30', '12:00', StatutRendezVous::CONFIRME, 'Point projet logiciel');
        $visiteB = $this->visite($ctx, 2, $usagerB, $reception, StatutVisite::EN_COURS, DecisionReception::CONTINUER, [$rdvB1, $rdvB2, $rdvB3], $today->setTime(10, 3));
        $ctx->registerOpenVisite($visiteB, $today->format('Y-m-d'));
        $events->rendezVousCree($rdvB1);
        $events->rendezVousConfirme($rdvB1);
        $events->rendezVousCree($rdvB2);
        $events->rendezVousConfirme($rdvB2);
        $events->rendezVousCree($rdvB3);
        $events->rendezVousConfirme($rdvB3);
        $events->arriveeEnregistree($rdvB1, $visiteB);
        $events->visiteOuverte($visiteB);
        $events->priseEnChargeDemarree($rdvB1, $personnelMarie);
        $events->priseEnChargeCloturee($rdvB1, $personnelMarie, $visiteB);
        $events->decisionReception($visiteB, $rdvB2);
        $ctx->demoRefs['rdvScenarioB1'] = $rdvB1->getReference();
        $ctx->demoRefs['rdvScenarioB2'] = $rdvB2->getReference();
        $ctx->demoRefs['rdvScenarioB3'] = $rdvB3->getReference();
        $ctx->demoRefs['visiteScenarioB'] = $visiteB->getReference();
        $ctx->demoRefs['usagerTelScenarioB'] = '0890000002';

        // C — Personnel non disponible pour réception
        $usagerC = $this->usager($ctx, 'Ilunga', 'Paul', '0890000003', TypeUsager::PARTENAIRE_TECHNIQUE);
        $personnelAlain->setDisponibiliteOperationnelle(DisponibilitePersonnel::NON_DISPONIBLE_POUR_RECEPTION);
        $personnelAlain->setMotifNonReception('Créneau non disponible');
        $rdvC = $this->rdv($ctx, 5, $usagerC, $bureauAdminSys, $personnelAlain, $today, '14:00', '14:30', StatutRendezVous::ARRIVE, 'Dépannage informatique', 'Administrateur système');
        $visiteC = $this->visite($ctx, 3, $usagerC, $reception, StatutVisite::EN_ATTENTE, DecisionReception::ATTENDRE, [$rdvC], $today->setTime(14, 8));
        $ctx->registerOpenVisite($visiteC, $today->format('Y-m-d'));
        $events->rendezVousCree($rdvC);
        $events->rendezVousConfirme($rdvC);
        $events->arriveeEnregistree($rdvC, $visiteC);
        $events->visiteOuverte($visiteC);
        $events->personnelNonDisponible($personnelAlain, $rdvC, $visiteC);
        $events->decisionReception($visiteC, $rdvC);
        $ctx->demoRefs['rdvScenarioC'] = $rdvC->getReference();
        $ctx->demoRefs['visiteScenarioC'] = $visiteC->getReference();
        $ctx->demoRefs['usagerTelScenarioC'] = '0890000003';

        // D — Retard
        $usagerD = $this->usager($ctx, 'Ngoy', 'Claudine', '0890000004', TypeUsager::FOURNISSEUR);
        $rdvD = $this->rdv($ctx, 6, $usagerD, $bureauSec, $personnelJean, $today, '08:30', '09:00', StatutRendezVous::ARRIVE, 'Dépôt de document');
        $visiteD = $this->visite($ctx, 4, $usagerD, $reception, StatutVisite::EN_ATTENTE, DecisionReception::ATTENDRE, [$rdvD], $today->setTime(8, 55));
        $ctx->registerOpenVisite($visiteD, $today->format('Y-m-d'));
        $events->rendezVousCree($rdvD);
        $events->rendezVousConfirme($rdvD);
        $events->arriveeEnregistree($rdvD, $visiteD);
        $events->visiteOuverte($visiteD);
        $events->decisionReception($visiteD, $rdvD);
        $ctx->demoRefs['rdvScenarioD'] = $rdvD->getReference();
        $ctx->demoRefs['visiteScenarioD'] = $visiteD->getReference();
        $ctx->demoRefs['usagerTelScenarioD'] = '0890000004';

        // E — Non présenté (pas de visite)
        $usagerE = $this->usager($ctx, 'Tshiala', 'Eric', '0890000005', TypeUsager::STAGIAIRE);
        $rdvE = $this->rdv($ctx, 7, $usagerE, $bureauSec, $personnelJean, $today, '15:00', '15:30', StatutRendezVous::NON_PRESENTE, 'Demande d\'information administrative');
        $events->rendezVousCree($rdvE);
        $events->rendezVousConfirme($rdvE);
        $events->usagerNonPresente($rdvE);
        $ctx->demoRefs['rdvScenarioE'] = $rdvE->getReference();
        $ctx->demoRefs['usagerTelScenarioE'] = '0890000005';

        // F — Annulation (pas de visite)
        $usagerF = $this->usager($ctx, 'Mutombo', 'Grace', '0890000006', TypeUsager::VISITEUR_INSTITUTIONNEL);
        $rdvF = $this->rdv($ctx, 8, $usagerF, $bureauSec, null, $today->modify('+2 days'), '10:00', '10:30', StatutRendezVous::ANNULE, 'Réunion avec un bureau technique');
        $events->rendezVousCree($rdvF);
        $events->rendezVousAnnule($rdvF);
        $ctx->demoRefs['rdvScenarioF'] = $rdvF->getReference();
        $ctx->demoRefs['usagerTelScenarioF'] = '0890000006';

        // G — Parcours réception 1 : arrivée à enregistrer (Secrétariat / Jean Kabila)
        $usagerG = $this->usager($ctx, 'Kalonji', 'Joseph', '0890000007', TypeUsager::CITOYEN);
        $rdvG = $this->rdv($ctx, 9, $usagerG, $bureauSec, $personnelJean, $today, '09:30', '10:00', StatutRendezVous::CONFIRME, 'Retrait d\'attestation', 'Agent de secrétariat');
        $events->rendezVousCree($rdvG);
        $events->rendezVousConfirme($rdvG);
        $ctx->demoRefs['rdvScenarioG'] = $rdvG->getReference();
        $ctx->demoRefs['usagerTelScenarioG'] = '0890000007';

        // H — Parcours réception 2 : visite à ouvrir (Assistance / Sarah Mavungu)
        $personnelSarah = $this->perso($ctx, 'sarah_mavungu');
        $bureauHelp = $this->bureau($ctx, 'Bureau Assistance aux utilisateurs');
        $usagerH = $this->usager($ctx, 'Mwanza', 'Sarah', '0890000008', TypeUsager::AGENT_PUBLIC);
        $rdvH = $this->rdv($ctx, 10, $usagerH, $bureauHelp, $personnelSarah, $today, '10:30', '11:00', StatutRendezVous::ARRIVE, 'Problème de compte messagerie', 'Assistante utilisateurs');
        $events->rendezVousCree($rdvH);
        $events->rendezVousConfirme($rdvH);
        $events->arriveeEnregistree($rdvH, null);
        $ctx->demoRefs['rdvScenarioH'] = $rdvH->getReference();
        $ctx->demoRefs['usagerTelScenarioH'] = '0890000008';

        // I — Parcours réception 3 : orientation vers le réseau (Junior Kalala)
        $personnelJunior = $this->perso($ctx, 'junior_kalala');
        $bureauReseau = $this->bureau($ctx, 'Bureau Maintenance Réseau');
        $usagerI = $this->usager($ctx, 'Banza', 'Daniel', '0890000009', TypeUsager::PARTENAIRE_TECHNIQUE);
        $rdvI = $this->rdv($ctx, 11, $usagerI, $bureauReseau, $personnelJunior, $today, '13:00', '13:30', StatutRendezVous::ARRIVE, 'Coupure réseau bâtiment B', 'Technicien réseau');
        $visiteI = $this->visite($ctx, 5, $usagerI, $reception, StatutVisite::OUVERTE, null, [$rdvI], $today->setTime(12, 55));
        $ctx->registerOpenVisite($visiteI, $today->format('Y-m-d'));
        $events->rendezVousCree($rdvI);
        $events->rendezVousConfirme($rdvI);
        $events->arriveeEnregistree($rdvI, $visiteI);
        $events->visiteOuverte($visiteI);
        $ctx->demoRefs['rdvScenarioI'] = $rdvI->getReference();
        $ctx->demoRefs['visiteScenarioI'] = $visiteI->getReference();
        $ctx->demoRefs['usagerTelScenarioI'] = '0890000009';

        // J — Parcours réception 4 : à venir demain (Sécurité / Héritier Lukusa)
        $personnelHeritier = $this->perso($ctx, 'heritier_lukusa');
        $bureauSecu = $this->bureau($ctx, 'Bureau Sécurité');
        $usagerJ = $this->usager($ctx, 'Kasongo', 'Ruth', '0890000010', TypeUsager::VISITEUR_INSTITUTIONNEL);
        $rdvJ = $this->rdv($ctx, 12, $usagerJ, $bureauSecu, $personnelHeritier, $today->modify('+1 day'), '09:00', '09:30', StatutRendezVous::CONFIRME, 'Demande de badge temporaire', 'Agent sécurité informatique');
        $events->rendezVousCree($rdvJ);
        $events->rendezVousConfirme($rdvJ);
        $ctx->demoRefs['rdvScenarioJ'] = $rdvJ->getReference();
        $ctx->demoRefs['usagerTelScenarioJ'] = '0890000010';

        $ctx->rdvSeq = 12;
        $ctx->visSeq = 5;
        $ctx->em->flush();
    }

    private function bureau(FixtureContext $ctx, string $nom): Bureau
    {
        foreach ($ctx->bureaux as $bureau) {
            if ($bureau->getNom() === $nom) {
                return $bureau;
            }
        }

        throw new \RuntimeException('Bureau DEMO introuvable : ' . $nom);
    }

    private function perso(FixtureContext $ctx, string $key): Personnel
    {
        if (!isset($ctx->demoPersonnelsByKey[$key])) {
            throw new \RuntimeException('Personnel DEMO introuvable : ' . $key);
        }

        return $ctx->demoPersonnelsByKey[$key];
    }

    private function usager(FixtureContext $ctx, string $nom, string $prenom, string $tel, TypeUsager $type): UsagerVisiteur
    {
        $u = new UsagerVisiteur();
        $u->setNom($nom);
        $u->setPrenom($prenom);
        $u->setTelephone($tel);
        $u->setEmail(strtolower($prenom) . '.' . strtolower($nom) . '@demo.c2i.cd');
        $u->setTypeUsager($type);
        $ctx->em->persist($u);
        $ctx->usagers[] = $u;

        return $u;
    }

    private function rdv(
        FixtureContext $ctx,
        int $numero,
        UsagerVisiteur $usager,
        Bureau $bureau,
        ?Personnel $personnel,
        \DateTimeImmutable $date,
        string $debut,
        string $fin,
        StatutRendezVous $statut,
        string $motif,
        ?string $fonctionSouhaitee = null,
    ): RendezVous {
        $dateYmd = $date->format('Y-m-d');
        if ($personnel) {
            $ctx->slots->reserve($personnel, $dateYmd, $debut, $fin);
        }

        $rdv = new RendezVous();
        $rdv->setReference(ReferenceGenerator::rendezVousSequential($numero));
        $rdv->setDateRendezVous($date);
        $rdv->setHeureDebut(SlotRegistry::timeImmutable($debut));
        $rdv->setHeureFin(SlotRegistry::timeImmutable($fin));
        $rdv->setMotif($motif);
        $rdv->setFonctionSouhaitee($fonctionSouhaitee);
        $rdv->setStatut($statut);
        $rdv->setUsager($usager);
        $rdv->setBureau($bureau);
        $rdv->setPersonnel($personnel);
        $ctx->em->persist($rdv);
        $ctx->rendezVous[] = $rdv;

        return $rdv;
    }

    private function visite(
        FixtureContext $ctx,
        int $numero,
        UsagerVisiteur $usager,
        $reception,
        StatutVisite $statut,
        ?DecisionReception $decision,
        array $rdvs,
        \DateTimeImmutable $heureArrivee,
    ): Visite {
        FixtureCoherence::applyVisiteToRendezVous(
            $v = $this->buildVisite($ctx, $numero, $usager, $reception, $statut, $decision, $rdvs, $heureArrivee),
            $rdvs,
        );

        return $v;
    }

    private function buildVisite(
        FixtureContext $ctx,
        int $numero,
        UsagerVisiteur $usager,
        $reception,
        StatutVisite $statut,
        ?DecisionReception $decision,
        array $rdvs,
        \DateTimeImmutable $heureArrivee,
    ): Visite {
        $v = new Visite();
        $v->setReference(ReferenceGenerator::visiteSequential($numero));
        $v->setUsager($usager);
        $v->setReception($reception);
        $v->setStatut($statut);
        $v->setHeureArrivee($heureArrivee);
        $v->setDecisionReception($decision);
        if ($statut === StatutVisite::TERMINEE) {
            $v->setHeureSortie($heureArrivee->modify('+90 minutes'));
        }
        foreach ($rdvs as $rdv) {
            $v->addRendezVous($rdv);
        }
        $ctx->em->persist($v);
        $ctx->visites[] = $v;

        return $v;
    }
}
