<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class DecisionVisiteDto
{
    #[Assert\NotBlank]
    #[Assert\Choice(choices: ['CONTINUER', 'ATTENDRE', 'REPORTER', 'CLOTURER', 'REORIENTER', 'VALIDATION_RESPONSABLE'])]
    public string $decision = '';
}
