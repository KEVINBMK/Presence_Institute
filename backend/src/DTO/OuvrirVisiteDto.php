<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class OuvrirVisiteDto
{
    #[Assert\Positive]
    public int $usagerId = 0;

    #[Assert\Positive]
    public int $receptionId = 1;

    /** @var int[] */
    public array $rendezVousIds = [];
}
