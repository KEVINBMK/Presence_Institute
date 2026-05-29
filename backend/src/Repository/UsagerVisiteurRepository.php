<?php

namespace App\Repository;

use App\Entity\UsagerVisiteur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<UsagerVisiteur> */
class UsagerVisiteurRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UsagerVisiteur::class);
    }

    public function findOneByTelephone(string $telephone): ?UsagerVisiteur
    {
        return $this->findOneBy(['telephone' => $telephone]);
    }
}
