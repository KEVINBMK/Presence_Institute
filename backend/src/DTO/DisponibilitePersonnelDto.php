<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class DisponibilitePersonnelDto
{
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['DISPONIBLE', 'OCCUPE', 'NON_DISPONIBLE_POUR_RECEPTION'])]
    public string $disponibiliteOperationnelle = 'DISPONIBLE';

    public ?string $motifNonReception = null;
}
