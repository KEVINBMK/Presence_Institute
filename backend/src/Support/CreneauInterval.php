<?php

namespace App\Support;

/** Utilitaires pour chevauchement de créneaux [heureDebut, heureFin[. */
final class CreneauInterval
{
    public static function toMinutes(\DateTimeInterface $time): int
    {
        return (int) $time->format('H') * 60 + (int) $time->format('i');
    }

    public static function overlapsMinutes(int $startA, int $endA, int $startB, int $endB): bool
    {
        return $startA < $endB && $endA > $startB;
    }

    public static function overlaps(
        \DateTimeInterface $debutA,
        \DateTimeInterface $finA,
        \DateTimeInterface $debutB,
        \DateTimeInterface $finB,
    ): bool {
        return self::overlapsMinutes(
            self::toMinutes($debutA),
            self::toMinutes($finA),
            self::toMinutes($debutB),
            self::toMinutes($finB),
        );
    }
}
