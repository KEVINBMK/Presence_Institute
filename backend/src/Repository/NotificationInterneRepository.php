<?php

namespace App\Repository;

use App\Entity\NotificationInterne;
use App\Enum\ActeurType;
use App\Enum\StatutNotification;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<NotificationInterne> */
class NotificationInterneRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, NotificationInterne::class);
    }

    /** @return NotificationInterne[] */
    public function findATraiterReception(int $limit = 50): array
    {
        return $this->createQueryBuilder('n')
            ->andWhere('n.destinataireType = :dest')
            ->andWhere('n.statut != :traitee')
            ->setParameter('dest', ActeurType::RECEPTION)
            ->setParameter('traitee', StatutNotification::TRAITEE)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
