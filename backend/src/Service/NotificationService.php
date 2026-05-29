<?php

namespace App\Service;

use App\Entity\NotificationInterne;
use App\Entity\RendezVous;
use App\Entity\Visite;
use App\Enum\ActeurType;
use App\Enum\StatutNotification;
use App\Enum\TypeActionHistorique;
use App\Enum\TypeNotification;
use App\Exception\MetierException;
use App\Repository\NotificationInterneRepository;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $em,
        private NotificationInterneRepository $repository,
        private HistoriqueService $historique,
    ) {
    }

    public function envoyer(
        TypeNotification $type,
        string $message,
        ActeurType $emetteur,
        ActeurType $destinataire,
        ?RendezVous $rdv = null,
        ?Visite $visite = null,
    ): NotificationInterne {
        $notif = new NotificationInterne();
        $notif->setType($type);
        $notif->setMessage($message);
        $notif->setEmetteurType($emetteur);
        $notif->setDestinataireType($destinataire);
        $notif->setRendezVous($rdv);
        $notif->setVisite($visite);
        $this->em->persist($notif);

        $this->historique->enregistrer(
            TypeActionHistorique::NOTIFICATION_RECEPTION,
            $message,
            ActeurType::SYSTEME,
            null,
            $rdv,
            $visite,
        );

        return $notif;
    }

    /** @return NotificationInterne[] */
    public function listerPourReception(): array
    {
        return $this->repository->findATraiterReception();
    }

    public function marquerLue(int $id): NotificationInterne
    {
        $notif = $this->getOrFail($id);
        $notif->setStatut(StatutNotification::LUE);
        $notif->setReadAt(new \DateTimeImmutable());

        return $notif;
    }

    public function marquerTraitee(int $id): NotificationInterne
    {
        $notif = $this->getOrFail($id);
        $notif->setStatut(StatutNotification::TRAITEE);
        $notif->setTreatedAt(new \DateTimeImmutable());
        if (!$notif->getReadAt()) {
            $notif->setReadAt(new \DateTimeImmutable());
        }

        return $notif;
    }

    private function getOrFail(int $id): NotificationInterne
    {
        $notif = $this->repository->find($id);
        if (!$notif) {
            throw new MetierException('Notification introuvable.');
        }

        return $notif;
    }
}
