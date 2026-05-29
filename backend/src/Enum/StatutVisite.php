<?php

namespace App\Enum;

enum StatutVisite: string
{
    case OUVERTE = 'OUVERTE';
    case EN_ATTENTE = 'EN_ATTENTE';
    case ORIENTEE = 'ORIENTEE';
    case EN_COURS = 'EN_COURS';
    case TERMINEE = 'TERMINEE';
    case SUSPENDUE = 'SUSPENDUE';

    public function isTerminal(): bool
    {
        return $this === self::TERMINEE;
    }
}
