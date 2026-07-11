<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

final class RetrouverReferenceDto
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 20)]
    public string $telephone = '';

    #[Assert\Length(max: 100)]
    public ?string $nom = null;

    #[Assert\Length(max: 10)]
    public ?string $dateApproximative = null;
}
