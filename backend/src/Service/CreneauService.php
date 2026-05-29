<?php

namespace App\Service;

use App\Entity\Bureau;
use App\Entity\Personnel;
use App\Enum\PeriodeSouhaitee;
use App\Exception\MetierException;
use App\Repository\PersonnelRepository;
use App\Repository\RendezVousRepository;
use App\Support\CreneauInterval;

class CreneauService
{
    private const DUREE_MINUTES = 30;
    private const MAX_RDV_PAR_JOUR = 3;

    public function __construct(
        private PersonnelRepository $personnelRepository,
        private RendezVousRepository $rendezVousRepository,
    ) {
    }

    /** @return array<int, array{heureDebut: string, heureFin: string, disponible: bool, personnelId: ?int}> */
    public function getCreneauxDisponibles(Bureau $bureau, \DateTimeImmutable $date): array
    {
        $personnels = $this->personnelRepository->findDisponiblesByBureau($bureau);
        $intervals = $this->rendezVousRepository->findOccupiedIntervalsByBureau($bureau, $date);

        $now = new \DateTimeImmutable();
        $isToday = $date->format('Y-m-d') === (new \DateTimeImmutable('today'))->format('Y-m-d');

        $creneaux = [];
        $debut = $this->mergeDateTime($date, $bureau->getHeureOuverture());
        $finBureau = $this->mergeDateTime($date, $bureau->getHeureFermeture());
        $current = $debut;

        while ($current < $finBureau) {
            $slotFin = $current->modify('+' . self::DUREE_MINUTES . ' minutes');
            if ($slotFin > $finBureau) {
                break;
            }

            if ($isToday && $current < $now) {
                $current = $slotFin;
                continue;
            }

            $slotDebut = $current;
            $heureDebut = $current->format('H:i');
            $heureFin = $slotFin->format('H:i');
            $slotStart = CreneauInterval::toMinutes($slotDebut);
            $slotEnd = CreneauInterval::toMinutes($slotFin);

            $personnelId = null;
            $disponible = false;

            foreach ($personnels as $personnel) {
                if ($this->personnelLibrePourIntervalle($personnel->getId(), $intervals, $slotStart, $slotEnd)) {
                    $personnelId = $personnel->getId();
                    $disponible = true;
                    break;
                }
            }

            $creneaux[] = [
                'heureDebut' => $heureDebut,
                'heureFin' => $heureFin,
                'disponible' => $disponible,
                'personnelId' => $personnelId,
            ];

            $current = $slotFin;
        }

        return $creneaux;
    }

    /**
     * Attribue le premier créneau libre du jour (ordre chronologique).
     *
     * @return array{personnel: Personnel, heureDebut: \DateTimeImmutable, heureFin: \DateTimeImmutable}|null
     */
    public function attribuerPremierCreneauDisponible(
        Bureau $bureau,
        \DateTimeImmutable $date,
        ?PeriodeSouhaitee $periodeSouhaitee = null,
    ): ?array {
        foreach ($this->getCreneauxDisponibles($bureau, $date) as $creneau) {
            if (!$creneau['disponible'] || $creneau['personnelId'] === null) {
                continue;
            }

            $heureDebut = \DateTimeImmutable::createFromFormat('H:i', $creneau['heureDebut']);
            if (!$heureDebut) {
                continue;
            }

            if ($periodeSouhaitee !== null
                && !$periodeSouhaitee->accepteHeureDebutMinutes(CreneauInterval::toMinutes($heureDebut))) {
                continue;
            }

            $heureFin = \DateTimeImmutable::createFromFormat('H:i', $creneau['heureFin']);
            if (!$heureFin) {
                continue;
            }

            $personnel = $this->personnelRepository->find($creneau['personnelId']);
            if (!$personnel) {
                continue;
            }

            return [
                'personnel' => $personnel,
                'heureDebut' => $heureDebut,
                'heureFin' => $heureFin,
            ];
        }

        return null;
    }

    public function assertCreneauDisponible(
        Bureau $bureau,
        \DateTimeImmutable $date,
        \DateTimeImmutable $heureDebut,
        \DateTimeImmutable $heureFin,
        ?Personnel $personnelPrefered = null,
    ): Personnel {
        $personnels = $this->personnelRepository->findDisponiblesByBureau($bureau);

        if ($personnelPrefered) {
            if ($personnelPrefered->getDisponibiliteOperationnelle()->peutRecevoirRendezVous()
                && !$this->rendezVousRepository->personnelCreneauOccupe($personnelPrefered, $date, $heureDebut, $heureFin)) {
                return $personnelPrefered;
            }
        }

        foreach ($personnels as $personnel) {
            if (!$this->rendezVousRepository->personnelCreneauOccupe($personnel, $date, $heureDebut, $heureFin)) {
                return $personnel;
            }
        }

        throw new MetierException('Ce créneau n\'est plus disponible.');
    }

    public function validerCreneauDansHorairesBureau(
        Bureau $bureau,
        \DateTimeImmutable $date,
        \DateTimeImmutable $heureDebut,
        \DateTimeImmutable $heureFin,
    ): void {
        $ouverture = $this->mergeDateTime($date, $bureau->getHeureOuverture());
        $fermeture = $this->mergeDateTime($date, $bureau->getHeureFermeture());
        $debut = $this->mergeDateTime($date, $heureDebut);
        $fin = $this->mergeDateTime($date, $heureFin);

        if ($debut < $ouverture || $fin > $fermeture) {
            throw new MetierException('Le créneau est hors des heures d\'ouverture du bureau.');
        }
    }

    public function getMaxRdvParJour(): int
    {
        return self::MAX_RDV_PAR_JOUR;
    }

    /** Parse une date calendaire AAAA-MM-JJ (fuseau serveur, sans décalage UTC). */
    public static function parseDateCalendaire(string $dateStr): \DateTimeImmutable
    {
        $dateStr = trim($dateStr);
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $dateStr);
        if (!$date || $date->format('Y-m-d') !== $dateStr) {
            throw new MetierException('Format de date invalide (attendu : AAAA-MM-JJ).');
        }

        return $date;
    }

    /**
     * Date souhaitée : pas dans le passé ; plus de demande « aujourd'hui » après fermeture du bureau.
     */
    public function validerDateSouhaitee(Bureau $bureau, \DateTimeImmutable $date): void
    {
        $todayStr = (new \DateTimeImmutable('today'))->format('Y-m-d');
        $dateStr = $date->format('Y-m-d');

        if ($dateStr < $todayStr) {
            throw new MetierException('La date souhaitée ne peut pas être dans le passé.');
        }

        $now = new \DateTimeImmutable();
        if ($dateStr !== $todayStr) {
            return;
        }

        $fermeture = $this->mergeDateTime($date, $bureau->getHeureFermeture());
        if ($now >= $fermeture) {
            throw new MetierException(
                'Les demandes pour aujourd\'hui ne sont plus acceptées (bureau fermé). Choisissez une date ultérieure.',
            );
        }

        $ouverture = $this->mergeDateTime($date, $bureau->getHeureOuverture());
        if ($now < $ouverture) {
            return;
        }
    }

    /**
     * @param array<int, list<array{0: int, 1: int}>> $intervals
     */
    private function personnelLibrePourIntervalle(int $personnelId, array $intervals, int $slotStart, int $slotEnd): bool
    {
        foreach ($intervals[$personnelId] ?? [] as [$occupiedStart, $occupiedEnd]) {
            if (CreneauInterval::overlapsMinutes($slotStart, $slotEnd, $occupiedStart, $occupiedEnd)) {
                return false;
            }
        }

        return true;
    }

    private function mergeDateTime(\DateTimeImmutable $date, \DateTimeImmutable $time): \DateTimeImmutable
    {
        return new \DateTimeImmutable(
            $date->format('Y-m-d') . ' ' . $time->format('H:i:s'),
            $date->getTimezone(),
        );
    }
}
