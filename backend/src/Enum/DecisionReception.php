<?php

namespace App\Enum;

enum DecisionReception: string
{
    case CONTINUER = 'CONTINUER';
    case ATTENDRE = 'ATTENDRE';
    case REPORTER = 'REPORTER';
    case CLOTURER = 'CLOTURER';
    case REORIENTER = 'REORIENTER';
    case VALIDATION_RESPONSABLE = 'VALIDATION_RESPONSABLE';
}
