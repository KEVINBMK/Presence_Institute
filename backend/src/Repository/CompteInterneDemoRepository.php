<?php

namespace App\Repository;

use App\Entity\CompteInterneDemo;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CompteInterneDemo>
 */
class CompteInterneDemoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CompteInterneDemo::class);
    }

    public function findOneByIdentifiant(string $identifiant): ?CompteInterneDemo
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.personnel', 'p')->addSelect('p')
            ->leftJoin('p.bureau', 'b')->addSelect('b')
            ->leftJoin('c.reception', 'r')->addSelect('r')
            ->andWhere('c.identifiant = :identifiant')
            ->setParameter('identifiant', $identifiant)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findOneWithRelations(int $id): ?CompteInterneDemo
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.personnel', 'p')->addSelect('p')
            ->leftJoin('p.bureau', 'b')->addSelect('b')
            ->leftJoin('c.reception', 'r')->addSelect('r')
            ->andWhere('c.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
