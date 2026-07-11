<?php

namespace App\DTO;

use App\Support\FonctionsSouhaitees;
use Symfony\Component\Validator\Constraints as Assert;

class CreateRendezVousDto
{
    #[Assert\NotBlank]
    public string $nom = '';

    #[Assert\NotBlank]
    public string $prenom = '';

    #[Assert\NotBlank]
    public string $telephone = '';

    #[Assert\Email]
    public ?string $email = null;

    #[Assert\Positive]
    public int $bureauId = 0;

    /** Date souhaitée (YYYY-MM-DD). */
    public string $dateSouhaitee = '';

    /** Alias temporaire : même sens que dateSouhaitee. */
    public ?string $date = null;

    #[Assert\Choice(choices: ['MATIN', 'APRES_MIDI'])]
    public ?string $periodeSouhaitee = null;

    #[Assert\NotBlank]
    public string $motif = '';

    /** Fonction recherchée — liste fermée (optionnelle). */
    #[Assert\Choice(callback: [FonctionsSouhaitees::class, 'choices'], message: 'Choisissez une fonction dans la liste proposée.')]
    public ?string $fonctionSouhaitee = null;

    #[Assert\Choice(choices: [
        'CITOYEN',
        'AGENT_PUBLIC',
        'PARTENAIRE_TECHNIQUE',
        'FOURNISSEUR',
        'STAGIAIRE',
        'REPRESENTANT_EXTERNE',
        'VISITEUR_INSTITUTIONNEL',
    ])]
    public string $typeUsager = 'CITOYEN';
}
