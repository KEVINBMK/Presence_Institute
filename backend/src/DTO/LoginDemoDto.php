<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

final class LoginDemoDto
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 50)]
    public string $identifiant = '';

    #[Assert\NotBlank]
    #[Assert\Length(max: 32)]
    public string $code = '';
}
