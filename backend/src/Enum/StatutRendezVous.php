<?php

namespace App\Enum;

enum StatutRendezVous: string
{
    case DEMANDE = 'DEMANDE';
    case CONFIRME = 'CONFIRME';
    case ARRIVE = 'ARRIVE';
    case EN_COURS = 'EN_COURS';
    case TERMINE = 'TERMINE';
    case REPORTE = 'REPORTE';
    case ANNULE = 'ANNULE';
    case NON_PRESENTE = 'NON_PRESENTE';

    public function isTerminal(): bool
    {
        return in_array($this, [self::TERMINE, self::ANNULE, self::NON_PRESENTE], true);
    }

    public function isModifiable(): bool
    {
        return !$this->isTerminal();
    }
}
