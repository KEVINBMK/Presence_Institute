<?php

namespace App\Util;

final class ReferenceGenerator
{
    public static function rendezVous(): string
    {
        return 'RDV-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));
    }

    public static function visite(): string
    {
        return 'VIS-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));
    }

    public static function rendezVousSequential(int $numero): string
    {
        return sprintf('RDV-2026-%06d', $numero);
    }

    public static function visiteSequential(int $numero): string
    {
        return sprintf('VIS-2026-%06d', $numero);
    }
}
