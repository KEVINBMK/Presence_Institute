<?php

namespace App\Entity;

use App\Repository\BureauRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BureauRepository::class)]
#[ORM\Table(name: 'bureau')]
#[ORM\Index(columns: ['actif'], name: 'idx_bureau_actif')]
class Bureau
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    private string $nom;

    #[ORM\Column(length: 255)]
    private string $localisation;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'time_immutable')]
    private \DateTimeImmutable $heureOuverture;

    #[ORM\Column(type: 'time_immutable')]
    private \DateTimeImmutable $heureFermeture;

    #[ORM\Column]
    private bool $actif = true;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, Personnel> */
    #[ORM\OneToMany(targetEntity: Personnel::class, mappedBy: 'bureau')]
    private Collection $personnels;

    /** @var Collection<int, RendezVous> */
    #[ORM\OneToMany(targetEntity: RendezVous::class, mappedBy: 'bureau')]
    private Collection $rendezVous;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->personnels = new ArrayCollection();
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

    public function getLocalisation(): string
    {
        return $this->localisation;
    }

    public function setLocalisation(string $localisation): static
    {
        $this->localisation = $localisation;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getHeureOuverture(): \DateTimeImmutable
    {
        return $this->heureOuverture;
    }

    public function setHeureOuverture(\DateTimeImmutable $heureOuverture): static
    {
        $this->heureOuverture = $heureOuverture;

        return $this;
    }

    public function getHeureFermeture(): \DateTimeImmutable
    {
        return $this->heureFermeture;
    }

    public function setHeureFermeture(\DateTimeImmutable $heureFermeture): static
    {
        $this->heureFermeture = $heureFermeture;

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

    /** @return Collection<int, Personnel> */
    public function getPersonnels(): Collection
    {
        return $this->personnels;
    }
}
