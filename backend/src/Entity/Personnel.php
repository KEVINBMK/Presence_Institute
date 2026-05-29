<?php

namespace App\Entity;

use App\Enum\DisponibilitePersonnel;
use App\Repository\PersonnelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PersonnelRepository::class)]
#[ORM\Table(name: 'personnel')]
#[ORM\Index(columns: ['bureau_id'], name: 'idx_personnel_bureau')]
#[ORM\Index(columns: ['disponibilite_operationnelle'], name: 'idx_personnel_disponibilite')]
class Personnel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $nom;

    #[ORM\Column(length: 100)]
    private string $prenom;

    #[ORM\Column(length: 100)]
    private string $fonction;

    #[ORM\Column(name: 'disponibilite_operationnelle', type: 'string', enumType: DisponibilitePersonnel::class)]
    private DisponibilitePersonnel $disponibiliteOperationnelle = DisponibilitePersonnel::DISPONIBLE;

    #[ORM\Column(name: 'motif_non_reception', length: 255, nullable: true)]
    private ?string $motifNonReception = null;

    #[ORM\ManyToOne(inversedBy: 'personnels')]
    #[ORM\JoinColumn(nullable: false)]
    private Bureau $bureau;

    #[ORM\Column]
    private bool $actif = true;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, RendezVous> */
    #[ORM\OneToMany(targetEntity: RendezVous::class, mappedBy: 'personnel')]
    private Collection $rendezVous;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->rendezVous = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;

        return $this;
    }

    public function getFonction(): string
    {
        return $this->fonction;
    }

    public function setFonction(string $fonction): static
    {
        $this->fonction = $fonction;

        return $this;
    }

    public function getDisponibiliteOperationnelle(): DisponibilitePersonnel
    {
        return $this->disponibiliteOperationnelle;
    }

    public function setDisponibiliteOperationnelle(DisponibilitePersonnel $disponibiliteOperationnelle): static
    {
        $this->disponibiliteOperationnelle = $disponibiliteOperationnelle;

        return $this;
    }

    public function getMotifNonReception(): ?string
    {
        return $this->motifNonReception;
    }

    public function setMotifNonReception(?string $motifNonReception): static
    {
        $this->motifNonReception = $motifNonReception;

        return $this;
    }

    public function getBureau(): Bureau
    {
        return $this->bureau;
    }

    public function setBureau(Bureau $bureau): static
    {
        $this->bureau = $bureau;

        return $this;
    }

    public function isActif(): bool
    {
        return $this->actif;
    }

    public function setActif(bool $actif): static
    {
        $this->actif = $actif;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
