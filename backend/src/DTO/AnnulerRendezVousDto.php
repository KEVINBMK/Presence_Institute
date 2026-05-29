<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class AnnulerRendezVousDto
{
    #[Assert\NotBlank]
    public string $telephone = '';
}
