<?php

namespace App\Support;

/**
 * Liste fermée des fonctions proposées à l’usager (MVP).
 * Doit rester alignée avec frontend/src/constants/fonctionsSouhaitees.ts
 */
final class FonctionsSouhaitees
{
    /** @var list<string> */
    public const OPTIONS = [
        'Agent de secrétariat',
        'Chef de bureau',
        'Développeur',
        'Analyste logiciel',
        'Chef de projet logiciel',
        'Administrateur système',
        'Assistante technique',
        'Technicien réseau',
        'Assistante utilisateurs',
        'Agent sécurité informatique',
    ];

    public static function estAutorisee(?string $valeur): bool
    {
        if ($valeur === null || trim($valeur) === '') {
            return true;
        }

        return in_array(trim($valeur), self::OPTIONS, true);
    }

    /** @return list<string|null> */
    public static function choices(): array
    {
        return array_merge([null, ''], self::OPTIONS);
    }
}
