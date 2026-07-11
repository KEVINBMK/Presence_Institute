<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

final class SuiviRendezVousDto
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 40)]
    public string $reference = '';

    #[Assert\NotBlank]
    #[Assert\Length(max: 20)]
    public string $telephone = '';
}
