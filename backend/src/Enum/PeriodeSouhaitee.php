<?php

namespace App\Enum;

enum PeriodeSouhaitee: string
{
    case MATIN = 'MATIN';
    case APRES_MIDI = 'APRES_MIDI';

    /** Créneau dont le début est strictement avant midi. */
    public function accepteHeureDebutMinutes(int $minutesDepuisMinuit): bool
    {
        return match ($this) {
            self::MATIN => $minutesDepuisMinuit < 12 * 60,
            self::APRES_MIDI => $minutesDepuisMinuit >= 12 * 60,
        };
    }
}
