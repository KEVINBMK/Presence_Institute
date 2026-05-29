<?php

namespace App\DataFixtures\Support;

use App\DataFixtures\FixtureContext;
use App\Entity\HistoriqueAction;
use App\Entity\NotificationInterne;
use App\Entity\Personnel;
use App\Entity\RendezVous;
use App\Entity\Visite;
use App\Enum\ActeurType;
use App\Enum\StatutNotification;
use App\Enum\StatutRendezVous;
use App\Enum\TypeActionHistorique;
use App\Enum\TypeNotification;

/** Historiques et notifications liés à des événements métier réels. */
final class FixtureEventRecorder
{
    public function __construct(
        private FixtureContext $ctx,
    ) {
    }

    public function rendezVousCree(RendezVous $rdv): void
    {
        $this->historique(
            TypeActionHistorique::RENDEZ_VOUS_CREE,
            'Rendez-vous créé depuis le portail usager — ' . $rdv->getReference(),
            ActeurType::USAGER,
            $rdv->getUsager()->getId(),
            $rdv,
        );
    }

    public function rendezVousConfirme(RendezVous $rdv): void
    {
        if ($rdv->getStatut() === StatutRendezVous::DEMANDE) {
            return;
        }
        $this->historique(
            TypeActionHistorique::RENDEZ_VOUS_CONFIRME,
            'Rendez-vous confirmé après vérification du créneau.',
            ActeurType::SYSTEME,
            null,
            $rdv,
        );
    }

    public function arriveeEnregistree(RendezVous $rdv, ?Visite $visite = null): void
    {
        $this->historique(
            TypeActionHistorique::ARRIVEE_ENREGISTREE,
            'Arrivée enregistrée par la réception C2I.',
            ActeurType::RECEPTION,
            $visite?->getReception()->getId(),
            $rdv,
            $visite,
        );
        $this->notification(
            TypeNotification::ARRIVEE_USAGER,
            sprintf('Arrivée %s %s — %s', $rdv->getUsager()->getPrenom(), $rdv->getUsager()->getNom(), $rdv->getReference()),
            ActeurType::RECEPTION,
            null,
            $visite,
        );
    }

    public function visiteOuverte(Visite $visite): void
    {
        $this->historique(
            TypeActionHistorique::VISITE_OUVERTE,
            'Visite ouverte après vérification de la référence — ' . $visite->getReference(),
            ActeurType::RECEPTION,
            $visite->getReception()->getId(),
            null,
            $visite,
        );
    }

    public function orientation(Visite $visite, RendezVous $rdv): void
    {
        $this->historique(
            TypeActionHistorique::ORIENTATION_EFFECTUEE,
            'Usager orienté vers le ' . $rdv->getBureau()->getNom() . '.',
            ActeurType::RECEPTION,
            $visite->getReception()->getId(),
            $rdv,
            $visite,
        );
    }

    public function priseEnChargeDemarree(RendezVous $rdv, Personnel $personnel): void
    {
        $this->historique(
            TypeActionHistorique::PRISE_EN_CHARGE_DEMARREE,
            'Prise en charge démarrée par le personnel.',
            ActeurType::PERSONNEL,
            $personnel->getId(),
            $rdv,
        );
    }

    public function priseEnChargeCloturee(RendezVous $rdv, Personnel $personnel, Visite $visite): void
    {
        if ($rdv->getStatut() !== StatutRendezVous::TERMINE) {
            return;
        }

        $this->historique(
            TypeActionHistorique::PRISE_EN_CHARGE_CLOTUREE,
            'Prise en charge clôturée par le personnel.',
            ActeurType::PERSONNEL,
            $personnel->getId(),
            $rdv,
        );
        $this->historique(
            TypeActionHistorique::NOTIFICATION_RECEPTION,
            'Notification envoyée à la réception pour décision.',
            ActeurType::PERSONNEL,
            $personnel->getId(),
            $rdv,
            $visite,
        );
        $this->notification(
            TypeNotification::FIN_PRISE_EN_CHARGE,
            sprintf(
                'Prise en charge terminée (%s). La réception décide de la suite.',
                $rdv->getReference(),
            ),
            ActeurType::PERSONNEL,
            $rdv,
            $visite,
        );
    }

    public function personnelNonDisponible(Personnel $personnel, RendezVous $rdv, Visite $visite): void
    {
        $this->historique(
            TypeActionHistorique::PERSONNEL_NON_DISPONIBLE,
            'Personnel ne peut pas recevoir : ' . ($personnel->getMotifNonReception() ?? 'non disponible'),
            ActeurType::PERSONNEL,
            $personnel->getId(),
            $rdv,
            $visite,
        );
        $this->notification(
            TypeNotification::PERSONNEL_NON_DISPONIBLE,
            sprintf('%s %s — %s', $personnel->getPrenom(), $personnel->getNom(), $personnel->getMotifNonReception() ?? 'indisponible'),
            ActeurType::PERSONNEL,
            $rdv,
            $visite,
        );
    }

    public function decisionReception(Visite $visite, RendezVous $rdv = null): void
    {
        $decision = $visite->getDecisionReception()?->value ?? 'décision';
        $this->historique(
            TypeActionHistorique::DECISION_RECEPTION,
            'Réception décide : ' . $decision,
            ActeurType::RECEPTION,
            $visite->getReception()->getId(),
            $rdv,
            $visite,
        );
        $this->notification(
            TypeNotification::DECISION_RECEPTION,
            'Décision réception enregistrée : ' . $decision,
            ActeurType::RECEPTION,
            $rdv,
            $visite,
        );
    }

    public function visiteCloturee(Visite $visite): void
    {
        $this->historique(
            TypeActionHistorique::VISITE_CLOTUREE,
            'Réception décide de clôturer la visite.',
            ActeurType::RECEPTION,
            $visite->getReception()->getId(),
            null,
            $visite,
        );
    }

    public function usagerNonPresente(RendezVous $rdv): void
    {
        $this->historique(
            TypeActionHistorique::USAGER_NON_PRESENTE,
            'Usager marqué comme non présenté.',
            ActeurType::RECEPTION,
            null,
            $rdv,
        );
    }

    public function rendezVousReporte(RendezVous $rdv): void
    {
        $this->historique(
            TypeActionHistorique::RENDEZ_VOUS_REPORTE,
            'Rendez-vous reporté suite à non-disponibilité opérationnelle du personnel.',
            ActeurType::RECEPTION,
            null,
            $rdv,
        );
    }

    public function rendezVousAnnule(RendezVous $rdv): void
    {
        $this->historique(
            TypeActionHistorique::RENDEZ_VOUS_ANNULE,
            'Rendez-vous annulé — historique conservé.',
            ActeurType::USAGER,
            $rdv->getUsager()->getId(),
            $rdv,
        );
    }

    private function historique(
        TypeActionHistorique $type,
        string $description,
        ActeurType $auteur,
        ?int $auteurId,
        ?RendezVous $rdv = null,
        ?Visite $visite = null,
    ): void {
        $h = new HistoriqueAction();
        $h->setTypeAction($type);
        $h->setDescription($description);
        $h->setAuteurType($auteur);
        $h->setAuteurId($auteurId);
        $h->setRendezVous($rdv);
        $h->setVisite($visite);
        $this->ctx->em->persist($h);
        ++$this->ctx->historiqueCount;
        $this->ctx->flushBatch();
    }

    private function notification(
        TypeNotification $type,
        string $message,
        ActeurType $emetteur,
        ?RendezVous $rdv = null,
        ?Visite $visite = null,
    ): void {
        $n = new NotificationInterne();
        $n->setType($type);
        $n->setMessage($message);
        $n->setEmetteurType($emetteur);
        $n->setDestinataireType(ActeurType::RECEPTION);
        $n->setStatut(StatutNotification::ENVOYEE);
        $n->setRendezVous($rdv);
        $n->setVisite($visite);
        $this->ctx->em->persist($n);
        ++$this->ctx->notificationCount;
        $this->ctx->flushBatch();
    }
}
