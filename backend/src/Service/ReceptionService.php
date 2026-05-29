<?php

namespace App\Service;

use App\DTO\DecisionVisiteDto;
use App\DTO\OrienterVisiteDto;
use App\DTO\OuvrirVisiteDto;
use App\Entity\RendezVous;
use App\Entity\Visite;
use App\Enum\ActeurType;
use App\Enum\DecisionReception;
use App\Enum\StatutRendezVous;
use App\Enum\StatutVisite;
use App\Enum\TypeActionHistorique;
use App\Enum\TypeNotification;
use App\Exception\MetierException;
use App\Repository\PersonnelRepository;
use App\Repository\ReceptionRepository;
use App\Repository\RendezVousRepository;
use App\Repository\UsagerVisiteurRepository;
use App\Repository\VisiteRepository;
use App\Util\ReferenceGenerator;
use Doctrine\ORM\EntityManagerInterface;

class ReceptionService
{
    public function __construct(
        private EntityManagerInterface $em,
        private RendezVousRepository $rendezVousRepository,
        private ReceptionRepository $receptionRepository,
        private UsagerVisiteurRepository $usagerRepository,
        private VisiteRepository $visiteRepository,
        private PersonnelRepository $personnelRepository,
        private RendezVousService $rendezVousService,
        private VisiteService $visiteService,
        private HistoriqueService $historique,
        private NotificationService $notification,
    ) {
    }

    /** @return RendezVous[] */
    public function getRendezVousDuJour(): array
    {
        return $this->rendezVousRepository->findDuJour(new \DateTimeImmutable('today'));
    }

    /** @return RendezVous[] */
    public function rechercher(string $query): array
    {
        return $this->rendezVousRepository->search($query, new \DateTimeImmutable('today'));
    }

    public function findVisiteActiveAujourdhui(string $query): ?Visite
    {
        $query = trim($query);
        if ($query === '') {
            return null;
        }

        if (preg_match('/^0\d{9}$/', $query)) {
            return $this->visiteRepository->findOuverteAujourdhuiParTelephone($query);
        }

        return null;
    }

    public function enregistrerArrivee(int $rendezVousId): RendezVous
    {
        $rdv = $this->rendezVousService->getOrFail($rendezVousId);
        $this->rendezVousService->assertModifiable($rdv);

        if ($rdv->getStatut() !== StatutRendezVous::CONFIRME) {
            throw new MetierException('Seul un rendez-vous confirmé peut recevoir une arrivée.');
        }

        $rdv->setStatut(StatutRendezVous::ARRIVE);

        $this->historique->enregistrer(
            TypeActionHistorique::ARRIVEE_ENREGISTREE,
            'Arrivée enregistrée à la réception — ' . $rdv->getReference(),
            ActeurType::RECEPTION,
            null,
            $rdv,
        );

        return $rdv;
    }

    public function ouvrirVisite(OuvrirVisiteDto $dto): Visite
    {
        return $this->em->wrapInTransaction(function () use ($dto) {
            $usager = $this->usagerRepository->find($dto->usagerId);
            if (!$usager) {
                throw new MetierException('Usager introuvable.');
            }

            if ($this->visiteRepository->hasVisiteOuverteAujourdhui($usager)) {
                throw new MetierException('Une visite est déjà ouverte pour cet usager aujourd\'hui.');
            }

            $reception = $this->receptionRepository->find($dto->receptionId)
                ?? $this->receptionRepository->findActive();
            if (!$reception) {
                throw new MetierException('Réception introuvable.');
            }

            $visite = new Visite();
            $visite->setReference(ReferenceGenerator::visite());
            $visite->setUsager($usager);
            $visite->setReception($reception);
            $visite->setStatut(StatutVisite::OUVERTE);
            $visite->setHeureArrivee(new \DateTimeImmutable());

            $today = new \DateTimeImmutable('today');
            if ($dto->rendezVousIds) {
                foreach ($dto->rendezVousIds as $rdvId) {
                    $rdv = $this->rendezVousService->getOrFail((int) $rdvId);
                    if ($rdv->getDateRendezVous()->format('Y-m-d') !== $today->format('Y-m-d')) {
                        throw new MetierException('Seuls les rendez-vous du jour peuvent être liés.');
                    }
                    if ($rdv->getUsager()->getId() !== $usager->getId()) {
                        throw new MetierException('Le rendez-vous ne correspond pas à cet usager.');
                    }
                    $visite->addRendezVous($rdv);
                }
            } else {
                $rdvs = $this->rendezVousRepository->findDuJour($today);
                foreach ($rdvs as $rdv) {
                    if ($rdv->getUsager()->getId() === $usager->getId()
                        && in_array($rdv->getStatut(), [StatutRendezVous::ARRIVE, StatutRendezVous::CONFIRME], true)) {
                        $visite->addRendezVous($rdv);
                    }
                }
            }

            $this->em->persist($visite);

            $this->historique->enregistrer(
                TypeActionHistorique::VISITE_OUVERTE,
                'Visite ouverte — réf. ' . $visite->getReference(),
                ActeurType::RECEPTION,
                $reception->getId(),
                null,
                $visite,
            );

            $this->notification->envoyer(
                TypeNotification::ARRIVEE_USAGER,
                sprintf('Usager %s %s — visite %s ouverte.', $usager->getPrenom(), $usager->getNom(), $visite->getReference()),
                ActeurType::RECEPTION,
                ActeurType::RECEPTION,
                null,
                $visite,
            );

            return $visite;
        });
    }

    public function orienterUsager(int $visiteId, OrienterVisiteDto $dto): Visite
    {
        $visite = $this->visiteService->getOrFail($visiteId);
        $this->visiteService->assertModifiable($visite);

        if ($dto->personnelId) {
            $personnel = $this->personnelRepository->find($dto->personnelId);
            if (!$personnel || !$personnel->isActif()) {
                throw new MetierException('Personnel introuvable.');
            }
            if (!$personnel->getDisponibiliteOperationnelle()->peutRecevoirRendezVous()) {
                throw new MetierException('Ce personnel n\'est pas disponible pour une orientation.');
            }
        }

        if ($dto->rendezVousId) {
            $rdv = $this->rendezVousService->getOrFail($dto->rendezVousId);
            $this->rendezVousService->assertModifiable($rdv);
            if ($rdv->getUsager()->getId() !== $visite->getUsager()->getId()) {
                throw new MetierException('Ce rendez-vous n\'appartient pas à l\'usager de la visite.');
            }
            if ($dto->personnelId) {
                $personnel = $this->personnelRepository->find($dto->personnelId);
                $rdv->setPersonnel($personnel);
            }
            $visite->addRendezVous($rdv);
        }

        $visite->setStatut(StatutVisite::ORIENTEE);

        $this->historique->enregistrer(
            TypeActionHistorique::ORIENTATION_EFFECTUEE,
            'Usager orienté par la réception',
            ActeurType::RECEPTION,
            $visite->getReception()->getId(),
            $dto->rendezVousId ? $this->rendezVousService->getOrFail($dto->rendezVousId) : null,
            $visite,
        );

        return $visite;
    }

    public function deciderSuiteVisite(int $visiteId, DecisionVisiteDto $dto): Visite
    {
        $visite = $this->visiteService->getOrFail($visiteId);
        $this->visiteService->assertModifiable($visite);

        $decision = DecisionReception::from($dto->decision);
        $visite->setDecisionReception($decision);

        match ($decision) {
            DecisionReception::CONTINUER => $visite->setStatut(StatutVisite::EN_COURS),
            DecisionReception::ATTENDRE => $visite->setStatut(StatutVisite::EN_ATTENTE),
            DecisionReception::REPORTER => $this->appliquerReport($visite),
            DecisionReception::CLOTURER => $this->cloturerVisiteInterne($visite),
            DecisionReception::REORIENTER => $visite->setStatut(StatutVisite::ORIENTEE),
            DecisionReception::VALIDATION_RESPONSABLE => $visite->setStatut(StatutVisite::EN_ATTENTE),
        };

        $this->historique->enregistrer(
            TypeActionHistorique::DECISION_RECEPTION,
            'Décision réception : ' . $decision->value,
            ActeurType::RECEPTION,
            $visite->getReception()->getId(),
            null,
            $visite,
        );

        $this->notification->envoyer(
            TypeNotification::DECISION_RECEPTION,
            'Décision enregistrée : ' . $decision->value,
            ActeurType::RECEPTION,
            ActeurType::RECEPTION,
            null,
            $visite,
        );

        return $visite;
    }

    public function cloturerVisite(int $visiteId): Visite
    {
        $visite = $this->visiteService->getOrFail($visiteId);
        $this->visiteService->assertModifiable($visite);

        return $this->cloturerVisiteInterne($visite);
    }

    private function appliquerReport(Visite $visite): void
    {
        $visite->setStatut(StatutVisite::SUSPENDUE);
        foreach ($visite->getRendezVousLiens() as $lien) {
            $rdv = $lien->getRendezVous();
            if (!$rdv->getStatut()->isTerminal()) {
                $rdv->setStatut(StatutRendezVous::REPORTE);
            }
        }
    }

    private function cloturerVisiteInterne(Visite $visite): Visite
    {
        $visite->setStatut(StatutVisite::TERMINEE);
        $visite->setHeureSortie(new \DateTimeImmutable());
        $visite->setDecisionReception($visite->getDecisionReception() ?? DecisionReception::CLOTURER);

        foreach ($visite->getRendezVousLiens() as $lien) {
            $rdv = $lien->getRendezVous();
            if (!$rdv->getStatut()->isTerminal()) {
                $rdv->setStatut(StatutRendezVous::TERMINE);
            }
        }

        $this->historique->enregistrer(
            TypeActionHistorique::VISITE_CLOTUREE,
            'Visite clôturée — ' . $visite->getReference(),
            ActeurType::RECEPTION,
            $visite->getReception()->getId(),
            null,
            $visite,
        );

        return $visite;
    }
}
