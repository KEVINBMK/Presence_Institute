<?php

namespace App\Service;

use App\DTO\DisponibilitePersonnelDto;
use App\Entity\Personnel;
use App\Entity\RendezVous;
use App\Enum\ActeurType;
use App\Enum\DisponibilitePersonnel;
use App\Enum\StatutRendezVous;
use App\Enum\TypeActionHistorique;
use App\Enum\TypeNotification;
use App\Exception\MetierException;
use App\Repository\PersonnelRepository;
use App\Repository\RendezVousRepository;
use Doctrine\ORM\EntityManagerInterface;

class PersonnelService
{
    public function __construct(
        private EntityManagerInterface $em,
        private PersonnelRepository $personnelRepository,
        private RendezVousRepository $rendezVousRepository,
        private RendezVousService $rendezVousService,
        private HistoriqueService $historique,
        private NotificationService $notification,
    ) {
    }

    public function getOrFail(int $id): Personnel
    {
        $personnel = $this->personnelRepository->findOneWithBureau($id);
        if (!$personnel || !$personnel->isActif()) {
            throw new MetierException('Personnel introuvable.');
        }

        return $personnel;
    }

    /** @return Personnel[] */
    public function listActifs(): array
    {
        return $this->personnelRepository->findActifsOrdered();
    }

    /** @return RendezVous[] */
    public function getRendezVousAssignes(int $personnelId): array
    {
        $personnel = $this->getOrFail($personnelId);

        return $this->rendezVousRepository->findByPersonnel($personnel);
    }

    public function changerDisponibilite(int $personnelId, DisponibilitePersonnelDto $dto): Personnel
    {
        $personnel = $this->getOrFail($personnelId);
        $dispo = DisponibilitePersonnel::from($dto->disponibiliteOperationnelle);
        $personnel->setDisponibiliteOperationnelle($dispo);
        $personnel->setMotifNonReception($dto->motifNonReception);

        $this->historique->enregistrer(
            TypeActionHistorique::DISPONIBILITE_OPERATIONNELLE_CHANGEE,
            sprintf('Disponibilité opérationnelle : %s', $dispo->value),
            ActeurType::PERSONNEL,
            $personnel->getId(),
        );

        if ($dispo === DisponibilitePersonnel::NON_DISPONIBLE_POUR_RECEPTION) {
            $this->notification->envoyer(
                TypeNotification::PERSONNEL_NON_DISPONIBLE,
                sprintf('%s %s ne peut pas recevoir : %s', $personnel->getPrenom(), $personnel->getNom(), $dto->motifNonReception ?? $dispo->value),
                ActeurType::PERSONNEL,
                ActeurType::RECEPTION,
            );
        }

        return $personnel;
    }

    public function demarrerPriseEnCharge(int $personnelId, int $rendezVousId): RendezVous
    {
        $this->getOrFail($personnelId);
        $rdv = $this->rendezVousService->getOrFail($rendezVousId);
        $this->rendezVousService->assertModifiable($rdv);
        $this->rendezVousService->assertAppartientAuPersonnel($rdv, $personnelId);

        if ($rdv->getStatut() !== StatutRendezVous::ARRIVE) {
            throw new MetierException('La prise en charge ne peut démarrer qu\'après enregistrement de l\'arrivée à la réception.');
        }

        $rdv->setStatut(StatutRendezVous::EN_COURS);
        $rdv->getPersonnel()->setDisponibiliteOperationnelle(DisponibilitePersonnel::OCCUPE);

        $this->historique->enregistrer(
            TypeActionHistorique::PRISE_EN_CHARGE_DEMARREE,
            'Prise en charge démarrée — ' . $rdv->getReference(),
            ActeurType::PERSONNEL,
            $personnelId,
            $rdv,
        );

        return $rdv;
    }

    public function cloturerPriseEnCharge(int $personnelId, int $rendezVousId): RendezVous
    {
        $this->getOrFail($personnelId);
        $rdv = $this->rendezVousService->getOrFail($rendezVousId);
        $this->rendezVousService->assertModifiable($rdv);
        $this->rendezVousService->assertAppartientAuPersonnel($rdv, $personnelId);

        if ($rdv->getStatut() !== StatutRendezVous::EN_COURS) {
            throw new MetierException('Seul un rendez-vous en cours peut être clôturé.');
        }

        $rdv->setStatut(StatutRendezVous::TERMINE);
        $rdv->getPersonnel()->setDisponibiliteOperationnelle(DisponibilitePersonnel::DISPONIBLE);

        $this->historique->enregistrer(
            TypeActionHistorique::PRISE_EN_CHARGE_CLOTUREE,
            'Prise en charge clôturée — ' . $rdv->getReference(),
            ActeurType::PERSONNEL,
            $personnelId,
            $rdv,
        );

        $this->notification->envoyer(
            TypeNotification::FIN_PRISE_EN_CHARGE,
            sprintf(
                'Prise en charge terminée pour %s %s (%s). La réception décide de la suite.',
                $rdv->getUsager()->getPrenom(),
                $rdv->getUsager()->getNom(),
                $rdv->getReference(),
            ),
            ActeurType::PERSONNEL,
            ActeurType::RECEPTION,
            $rdv,
        );

        return $rdv;
    }
}
