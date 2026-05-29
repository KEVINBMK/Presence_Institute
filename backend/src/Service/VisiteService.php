<?php

namespace App\Service;

use App\Entity\Visite;
use App\Enum\StatutVisite;
use App\Exception\MetierException;
use App\Repository\VisiteRepository;
use Doctrine\ORM\EntityManagerInterface;

class VisiteService
{
    public function __construct(
        private EntityManagerInterface $em,
        private VisiteRepository $visiteRepository,
    ) {
    }

    public function getOrFail(int $id): Visite
    {
        $visite = $this->visiteRepository->findOneWithDetails($id);
        if (!$visite) {
            throw new MetierException('Visite introuvable.');
        }

        return $visite;
    }

    public function findByReference(string $reference): ?Visite
    {
        return $this->visiteRepository->findByReference($reference);
    }

    public function assertModifiable(Visite $visite): void
    {
        if ($visite->getStatut()->isTerminal()) {
            throw new MetierException('Cette visite est clôturée et ne peut plus être modifiée.');
        }
    }
}
