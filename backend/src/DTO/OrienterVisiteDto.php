<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class OrienterVisiteDto
{
    #[Assert\Positive]
    public ?int $personnelId = null;

    #[Assert\Positive]
    public ?int $bureauId = null;

    #[Assert\Positive]
    public ?int $rendezVousId = null;
}
