<?php

namespace App\Repository;

use App\Entity\HistoriqueAction;
use App\Entity\Visite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<HistoriqueAction> */
class HistoriqueActionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, HistoriqueAction::class);
    }

    /** Historiques liés à la visite ou aux RDV rattachés (prise en charge, etc.). */
    public function findByVisite(Visite $visite): array
    {
        $rdvs = array_map(
            static fn ($lien) => $lien->getRendezVous(),
            $visite->getRendezVousLiens()->toArray(),
        );
        $qb = $this->createQueryBuilder('h')
            ->orderBy('h.createdAt', 'ASC');

        if ($rdvs === []) {
            $qb->andWhere('h.visite = :visite')->setParameter('visite', $visite);
        } else {
            $qb->andWhere('h.visite = :visite OR h.rendezVous IN (:rdvs)')
                ->setParameter('visite', $visite)
                ->setParameter('rdvs', $rdvs);
        }

        return $qb->getQuery()->getResult();
    }
}
