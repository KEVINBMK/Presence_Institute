<?php

namespace App\Service;

use App\Entity\HistoriqueAction;
use App\Entity\RendezVous;
use App\Entity\Visite;
use App\Enum\ActeurType;
use App\Enum\TypeActionHistorique;
use App\Repository\HistoriqueActionRepository;
use Doctrine\ORM\EntityManagerInterface;

class HistoriqueService
{
    public function __construct(
        private EntityManagerInterface $em,
        private HistoriqueActionRepository $repository,
    ) {
    }

    public function enregistrer(
        TypeActionHistorique $type,
        string $description,
        ActeurType $auteurType,
        ?int $auteurId = null,
        ?RendezVous $rdv = null,
        ?Visite $visite = null,
    ): HistoriqueAction {
        $action = new HistoriqueAction();
        $action->setTypeAction($type);
        $action->setDescription($description);
        $action->setAuteurType($auteurType);
        $action->setAuteurId($auteurId);
        $action->setRendezVous($rdv);
        $action->setVisite($visite);
        $this->em->persist($action);

        return $action;
    }

    /** @return HistoriqueAction[] */
    public function getParVisite(Visite $visite): array
    {
        return $this->repository->findByVisite($visite);
    }
}
