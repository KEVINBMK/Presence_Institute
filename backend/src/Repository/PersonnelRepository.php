<?php

namespace App\Repository;

use App\Entity\Bureau;
use App\Entity\Personnel;
use App\Enum\DisponibilitePersonnel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Personnel> */
class PersonnelRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Personnel::class);
    }

    public function findOneWithBureau(int $id): ?Personnel
    {
        return $this->createQueryBuilder('p')
            ->innerJoin('p.bureau', 'b')->addSelect('b')
            ->andWhere('p.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return Personnel[] */
    public function findActifsOrdered(): array
    {
        return $this->createQueryBuilder('p')
            ->innerJoin('p.bureau', 'b')->addSelect('b')
            ->andWhere('p.actif = true')
            ->orderBy('b.nom', 'ASC')
            ->addOrderBy('p.nom', 'ASC')
            ->addOrderBy('p.prenom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** @return Personnel[] */
    public function findDisponiblesByBureau(Bureau $bureau): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.bureau = :bureau')
            ->andWhere('p.actif = true')
            ->andWhere('p.disponibiliteOperationnelle = :dispo')
            ->setParameter('bureau', $bureau)
            ->setParameter('dispo', DisponibilitePersonnel::DISPONIBLE)
            ->getQuery()
            ->getResult();
    }
}
