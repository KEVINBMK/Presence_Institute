<?php

namespace App\Enum;

/** Disponibilité opérationnelle : capacité à recevoir un usager (hors logique RH). */
enum DisponibilitePersonnel: string
{
    case DISPONIBLE = 'DISPONIBLE';
    case OCCUPE = 'OCCUPE';
    case NON_DISPONIBLE_POUR_RECEPTION = 'NON_DISPONIBLE_POUR_RECEPTION';

    public function peutRecevoirRendezVous(): bool
    {
        return $this === self::DISPONIBLE;
    }
}
