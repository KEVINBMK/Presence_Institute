<?php

namespace App\Repository;

use App\Entity\Bureau;
use App\Entity\Personnel;
use App\Entity\RendezVous;
use App\Entity\UsagerVisiteur;
use App\Enum\RendezVousStatutsActifs;
use App\Enum\StatutRendezVous;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<RendezVous> */
class RendezVousRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RendezVous::class);
    }

    public function findByReference(string $reference): ?RendezVous
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.usager', 'u')->addSelect('u')
            ->leftJoin('r.bureau', 'b')->addSelect('b')
            ->leftJoin('r.personnel', 'p')->addSelect('p')
            ->andWhere('r.reference = :ref')
            ->setParameter('ref', $reference)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findOneWithRelations(int $id): ?RendezVous
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.usager', 'u')->addSelect('u')
            ->leftJoin('r.bureau', 'b')->addSelect('b')
            ->leftJoin('r.personnel', 'p')->addSelect('p')
            ->andWhere('r.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return RendezVous[] */
    public function findDuJour(\DateTimeImmutable $date): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.usager', 'u')->addSelect('u')
            ->leftJoin('r.bureau', 'b')->addSelect('b')
            ->leftJoin('r.personnel', 'p')->addSelect('p')
            ->andWhere('r.dateRendezVous = :date')
            ->setParameter('date', $date)
            ->orderBy('r.heureDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** @return RendezVous[] */
    public function search(string $query): array
    {
        $q = '%' . mb_strtolower($query) . '%';

        return $this->createQueryBuilder('r')
            ->leftJoin('r.usager', 'u')->addSelect('u')
            ->leftJoin('r.bureau', 'b')->addSelect('b')
            ->leftJoin('r.personnel', 'p')->addSelect('p')
            ->andWhere(
                'LOWER(r.reference) LIKE :q OR LOWER(u.nom) LIKE :q OR LOWER(u.prenom) LIKE :q OR u.telephone LIKE :tel'
            )
            ->setParameter('q', $q)
            ->setParameter('tel', '%' . $query . '%')
            ->orderBy('r.dateRendezVous', 'ASC')
            ->addOrderBy('r.heureDebut', 'ASC')
            ->setMaxResults(50)
            ->getQuery()
            ->getResult();
    }

    /**
     * Rendez-vous planifiés après aujourd'hui (réception — anticipation).
     *
     * @return RendezVous[]
     */
    public function findAVenir(\DateTimeImmutable $after, \DateTimeImmutable $until): array
    {
        return $this->createQueryBuilder('r')
            ->leftJoin('r.usager', 'u')->addSelect('u')
            ->leftJoin('r.bureau', 'b')->addSelect('b')
            ->leftJoin('r.personnel', 'p')->addSelect('p')
            ->andWhere('r.dateRendezVous > :after')
            ->andWhere('r.dateRendezVous <= :until')
            ->andWhere('r.statut IN (:statuts)')
            ->setParameter('after', $after)
            ->setParameter('until', $until)
            ->setParameter('statuts', [StatutRendezVous::DEMANDE, StatutRendezVous::CONFIRME])
            ->orderBy('r.dateRendezVous', 'ASC')
            ->addOrderBy('r.heureDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function countActifsUsagerDate(UsagerVisiteur $usager, \DateTimeImmutable $date): int
    {
        return $this->countActifsByTelephoneAndDate($usager->getTelephone(), $date);
    }

    public function countActifsByTelephoneAndDate(string $telephone, \DateTimeImmutable $date): int
    {
        return (int) $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->innerJoin('r.usager', 'u')
            ->andWhere('u.telephone = :tel')
            ->andWhere('r.dateRendezVous = :date')
            ->andWhere('r.statut IN (:statuts)')
            ->setParameter('tel', $telephone)
            ->setParameter('date', $date)
            ->setParameter('statuts', RendezVousStatutsActifs::POUR_LIMITE_USAGER)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Intervalles occupés par personnel pour un bureau et une date.
     *
     * @return array<int, list<array{0: int, 1: int}>> minutes [début, fin[
     */
    public function findOccupiedIntervalsByBureau(Bureau $bureau, \DateTimeImmutable $date): array
    {
        $rows = $this->createQueryBuilder('r')
            ->select('IDENTITY(r.personnel) AS personnelId', 'r.heureDebut AS heureDebut', 'r.heureFin AS heureFin')
            ->andWhere('r.bureau = :bureau')
            ->andWhere('r.dateRendezVous = :date')
            ->andWhere('r.personnel IS NOT NULL')
            ->andWhere('r.statut IN (:statuts)')
            ->setParameter('bureau', $bureau)
            ->setParameter('date', $date)
            ->setParameter('statuts', RendezVousStatutsActifs::POUR_CRENEAU)
            ->getQuery()
            ->getArrayResult();

        $intervals = [];
        foreach ($rows as $row) {
            $pid = (int) $row['personnelId'];
            $debut = $row['heureDebut'] instanceof \DateTimeInterface
                ? $row['heureDebut']
                : \DateTimeImmutable::createFromFormat('H:i:s', (string) $row['heureDebut']);
            $fin = $row['heureFin'] instanceof \DateTimeInterface
                ? $row['heureFin']
                : \DateTimeImmutable::createFromFormat('H:i:s', (string) $row['heureFin']);
            if (!$debut || !$fin) {
                continue;
            }
            $intervals[$pid][] = [
                (int) $debut->format('H') * 60 + (int) $debut->format('i'),
                (int) $fin->format('H') * 60 + (int) $fin->format('i'),
            ];
        }

        return $intervals;
    }

    public function personnelCreneauOccupe(
        Personnel $personnel,
        \DateTimeImmutable $date,
        \DateTimeImmutable $heureDebut,
        \DateTimeImmutable $heureFin,
        ?int $excludeId = null,
    ): bool {
        $qb = $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->andWhere('r.personnel = :personnel')
            ->andWhere('r.dateRendezVous = :date')
            ->andWhere('r.heureDebut < :fin')
            ->andWhere('r.heureFin > :debut')
            ->andWhere('r.statut IN (:statuts)')
            ->setParameter('personnel', $personnel)
            ->setParameter('date', $date)
            ->setParameter('debut', $heureDebut)
            ->setParameter('fin', $heureFin)
            ->setParameter('statuts', RendezVousStatutsActifs::POUR_CRENEAU);

        if ($excludeId) {
            $qb->andWhere('r.id != :exclude')->setParameter('exclude', $excludeId);
        }

        return (int) $qb->getQuery()->getSingleScalarResult() > 0;
    }

    /** @return RendezVous[] */
    public function findByPersonnel(Personnel $personnel, ?\DateTimeImmutable $date = null): array
    {
        $date ??= new \DateTimeImmutable('today');

        return $this->createQueryBuilder('r')
            ->leftJoin('r.usager', 'u')->addSelect('u')
            ->leftJoin('r.bureau', 'b')->addSelect('b')
            ->leftJoin('r.personnel', 'p')->addSelect('p')
            ->andWhere('r.personnel = :personnel')
            ->andWhere('r.dateRendezVous = :today')
            ->andWhere('r.statut IN (:statuts)')
            ->setParameter('personnel', $personnel)
            ->setParameter('today', $date)
            ->setParameter('statuts', [
                ...RendezVousStatutsActifs::POUR_CRENEAU,
                StatutRendezVous::TERMINE,
            ])
            ->orderBy('r.heureDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
