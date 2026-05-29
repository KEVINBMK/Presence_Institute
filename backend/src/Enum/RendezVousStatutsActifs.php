<?php

namespace App\Enum;

/** Statuts bloquant un créneau personnel ou comptés comme RDV actifs usager. */
final class RendezVousStatutsActifs
{
    public const POUR_CRENEAU = [
        StatutRendezVous::CONFIRME,
        StatutRendezVous::ARRIVE,
        StatutRendezVous::EN_COURS,
    ];

    public const POUR_LIMITE_USAGER = [
        StatutRendezVous::DEMANDE,
        StatutRendezVous::CONFIRME,
        StatutRendezVous::ARRIVE,
    ];
}
