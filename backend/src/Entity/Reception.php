<?php

namespace App\Entity;

use App\Repository\ReceptionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ReceptionRepository::class)]
#[ORM\Table(name: 'reception')]
class Reception
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    private string $nomSite;

    #[ORM\Column(length: 100)]
    private string $service = 'Secrétariat / Accueil';

    #[ORM\Column(length: 50)]
    private string $statutService = 'OUVERT';

    #[ORM\Column]
    private bool $actif = true;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, Visite> */
    #[ORM\OneToMany(targetEntity: Visite::class, mappedBy: 'reception')]
    private Collection $visites;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->visites = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNomSite(): string
    {
        return $this->nomSite;
    }

    public function setNomSite(string $nomSite): static
    {
        $this->nomSite = $nomSite;

        return $this;
    }

    public function getService(): string
    {
        return $this->service;
    }

    public function setService(string $service): static
    {
        $this->service = $service;

        return $this;
    }

    public function getStatutService(): string
    {
        return $this->statutService;
    }

    public function setStatutService(string $statutService): static
    {
        $this->statutService = $statutService;

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

    /** @return Collection<int, Visite> */
    public function getVisites(): Collection
    {
        return $this->visites;
    }
}
