<?php

namespace App\Support;

/** Correspondance souple entre fonction souhaitée (usager) et fonction interne du personnel. */
final class PersonnelFonctionMatcher
{
    public static function correspond(string $fonctionPersonnel, string $fonctionSouhaitee): bool
    {
        $interne = self::normalize($fonctionPersonnel);
        $souhaite = self::normalize($fonctionSouhaitee);

        if ($interne === '' || $souhaite === '') {
            return false;
        }

        if (str_contains($interne, $souhaite) || str_contains($souhaite, $interne)) {
            return true;
        }

        foreach (self::tokens($souhaite) as $token) {
            if (strlen($token) >= 4 && str_contains($interne, $token)) {
                return true;
            }
        }

        foreach (self::synonymes($souhaite) as $synonyme) {
            if (str_contains($interne, $synonyme)) {
                return true;
            }
        }

        return false;
    }

    /** @return list<string> */
    private static function synonymes(string $souhaite): array
    {
        $found = [];
        $map = [
            'assistant' => ['assistant', 'assistante', 'accueil', 'secretaire', 'helpdesk'],
            'chef' => ['chef'],
            'technicien' => ['technicien', 'technique', 'reseau', 'maintenance'],
            'administrateur' => ['administrateur', 'administration', 'systeme'],
            'developpeur' => ['developpeur', 'developpeuse', 'logiciel', 'analyste'],
            'securite' => ['securite', 'security'],
            'agent' => ['agent'],
            'responsable' => ['responsable', 'chef', 'projet'],
        ];

        foreach ($map as $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($souhaite, $keyword)) {
                    $found = array_merge($found, $keywords);
                }
            }
        }

        return array_values(array_unique($found));
    }

    /** @return list<string> */
    private static function tokens(string $value): array
    {
        $parts = preg_split('/\s+/', $value) ?: [];

        return array_values(array_filter($parts, static fn (string $p) => strlen($p) >= 3));
    }

    private static function normalize(string $value): string
    {
        $value = mb_strtolower(trim($value));
        $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
        $value = preg_replace('/[^a-z0-9\s]/', ' ', $value) ?? $value;

        return trim(preg_replace('/\s+/', ' ', $value) ?? $value);
    }
}
