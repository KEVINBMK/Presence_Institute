<?php

namespace App\Repository;

use App\Entity\UsagerVisiteur;
use App\Entity\Visite;
use App\Enum\StatutVisite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Visite> */
class VisiteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Visite::class);
    }

    public function findByReference(string $reference): ?Visite
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.reference = :ref')
            ->setParameter('ref', $reference)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findOneWithDetails(int $id): ?Visite
    {
        return $this->createQueryBuilder('v')
            ->leftJoin('v.usager', 'u')->addSelect('u')
            ->leftJoin('v.reception', 'rec')->addSelect('rec')
            ->leftJoin('v.rendezVousLiens', 'l')->addSelect('l')
            ->leftJoin('l.rendezVous', 'r')->addSelect('r')
            ->leftJoin('r.bureau', 'b')->addSelect('b')
            ->leftJoin('r.personnel', 'p')->addSelect('p')
            ->andWhere('v.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function hasVisiteOuverteAujourdhui(UsagerVisiteur $usager): bool
    {
        return (int) $this->createQueryBuilder('v')
            ->select('COUNT(v.id)')
            ->andWhere('v.usager = :usager')
            ->andWhere('v.statut NOT IN (:terminals)')
            ->andWhere('v.createdAt >= :start')
            ->andWhere('v.createdAt < :end')
            ->setParameter('usager', $usager)
            ->setParameter('terminals', [StatutVisite::TERMINEE])
            ->setParameter('start', new \DateTimeImmutable('today'))
            ->setParameter('end', new \DateTimeImmutable('tomorrow'))
            ->getQuery()
            ->getSingleScalarResult() > 0;
    }

    public function findOuverteAujourdhuiParTelephone(string $telephone): ?Visite
    {
        return $this->createQueryBuilder('v')
            ->innerJoin('v.usager', 'u')->addSelect('u')
            ->leftJoin('v.reception', 'rec')->addSelect('rec')
            ->leftJoin('v.rendezVousLiens', 'l')->addSelect('l')
            ->leftJoin('l.rendezVous', 'r')->addSelect('r')
            ->leftJoin('r.bureau', 'b')->addSelect('b')
            ->leftJoin('r.personnel', 'p')->addSelect('p')
            ->andWhere('u.telephone = :tel')
            ->andWhere('v.statut NOT IN (:terminals)')
            ->andWhere('v.createdAt >= :start')
            ->andWhere('v.createdAt < :end')
            ->setParameter('tel', $telephone)
            ->setParameter('terminals', [StatutVisite::TERMINEE])
            ->setParameter('start', new \DateTimeImmutable('today'))
            ->setParameter('end', new \DateTimeImmutable('tomorrow'))
            ->orderBy('v.id', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
