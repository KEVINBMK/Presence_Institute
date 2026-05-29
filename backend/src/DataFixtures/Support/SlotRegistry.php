<?php

namespace App\DataFixtures\Support;

use App\Entity\Bureau;
use App\Entity\Personnel;

/** Réservation de créneaux avec détection de chevauchement [heureDebut, heureFin[ par personnel. */
final class SlotRegistry
{
    /** @var array<string, list<array{0: int, 1: int}>> clé personnelId|date → intervalles en minutes */
    private array $intervals = [];

    public function overlaps(?Personnel $personnel, string $dateYmd, string $heureDebut, string $heureFin): bool
    {
        if (!$personnel) {
            return false;
        }

        $key = $this->intervalKey($personnel->getId(), $dateYmd);
        $start = self::toMinutes(self::timeImmutable($heureDebut));
        $end = self::toMinutes(self::timeImmutable($heureFin));

        foreach ($this->intervals[$key] ?? [] as [$occupiedStart, $occupiedEnd]) {
            if ($start < $occupiedEnd && $end > $occupiedStart) {
                return true;
            }
        }

        return false;
    }

    public function reserve(?Personnel $personnel, string $dateYmd, string $heureDebut, string $heureFin): void
    {
        if (!$personnel) {
            return;
        }

        $key = $this->intervalKey($personnel->getId(), $dateYmd);
        $this->intervals[$key][] = [
            self::toMinutes(self::timeImmutable($heureDebut)),
            self::toMinutes(self::timeImmutable($heureFin)),
        ];
    }

    /**
     * @param Personnel[] $candidats
     * @return array{personnel: Personnel, heureDebut: string, heureFin: string}|null
     */
    public function pickPersonnelAndSlot(
        Bureau $bureau,
        array $candidats,
        string $dateYmd,
        int $durationMinutes,
    ): ?array {
        $slots = self::slotsForBureau($bureau, $durationMinutes);
        shuffle($slots);

        foreach ($slots as $heureDebut) {
            $heureFin = self::addMinutes($heureDebut, $durationMinutes);
            foreach ($candidats as $personnel) {
                if ($this->overlaps($personnel, $dateYmd, $heureDebut, $heureFin)) {
                    continue;
                }
                $this->reserve($personnel, $dateYmd, $heureDebut, $heureFin);

                return [
                    'personnel' => $personnel,
                    'heureDebut' => $heureDebut,
                    'heureFin' => $heureFin,
                ];
            }
        }

        return null;
    }

    /** @return array{heureDebut: string, heureFin: string} */
    public function pickSlotWithoutPersonnel(Bureau $bureau, int $durationMinutes, \Faker\Generator $faker): array
    {
        $slots = self::slotsForBureau($bureau, $durationMinutes);
        $heureDebut = $faker->randomElement($slots);
        $heureFin = self::addMinutes($heureDebut, $durationMinutes);

        return ['heureDebut' => $heureDebut, 'heureFin' => $heureFin];
    }

    /** @return string[] */
    public static function slotsForBureau(Bureau $bureau, int $durationMinutes): array
    {
        $start = self::toMinutes($bureau->getHeureOuverture());
        $end = self::toMinutes($bureau->getHeureFermeture()) - $durationMinutes;
        $slots = [];
        for ($m = $start; $m <= $end; $m += 15) {
            $slots[] = self::fromMinutes($m);
        }

        return $slots;
    }

    public static function timeImmutable(string $hhmm): \DateTimeImmutable
    {
        return \DateTimeImmutable::createFromFormat('H:i', $hhmm) ?: new \DateTimeImmutable('08:00');
    }

    public static function addMinutes(string $hhmm, int $minutes): string
    {
        return self::fromMinutes(self::toMinutes(self::timeImmutable($hhmm)) + $minutes);
    }

    private function intervalKey(int $personnelId, string $dateYmd): string
    {
        return $personnelId . '|' . $dateYmd;
    }

    private static function toMinutes(\DateTimeImmutable $t): int
    {
        return (int) $t->format('H') * 60 + (int) $t->format('i');
    }

    private static function fromMinutes(int $m): string
    {
        return sprintf('%02d:%02d', intdiv($m, 60), $m % 60);
    }
}
