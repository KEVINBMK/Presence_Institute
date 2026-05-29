<?php

namespace App\Enum;

enum ActeurType: string
{
    case USAGER = 'USAGER';
    case RECEPTION = 'RECEPTION';
    case PERSONNEL = 'PERSONNEL';
    case SYSTEME = 'SYSTEME';
}
