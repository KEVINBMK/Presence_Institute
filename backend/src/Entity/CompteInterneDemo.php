<?php

namespace App\Entity;

use App\Enum\DemoRole;
use App\Repository\CompteInterneDemoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CompteInterneDemoRepository::class)]
#[ORM\Table(name: 'compte_interne_demo')]
#[ORM\UniqueConstraint(name: 'uniq_compte_identifiant', columns: ['identifiant'])]
class CompteInterneDemo
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private string $identifiant;

    #[ORM\Column(name: 'code_hash', length: 255)]
    private string $codeHash;

    #[ORM\Column(type: 'string', enumType: DemoRole::class)]
    private DemoRole $role;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Personnel $personnel = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Reception $reception = null;

    #[ORM\Column]
    private bool $actif = true;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIdentifiant(): string
    {
        return $this->identifiant;
    }

    public function setIdentifiant(string $identifiant): static
    {
        $this->identifiant = $identifiant;

        return $this;
    }

    public function getCodeHash(): string
    {
        return $this->codeHash;
    }

    public function setCodeHash(string $codeHash): static
    {
        $this->codeHash = $codeHash;

        return $this;
    }

    public function getRole(): DemoRole
    {
        return $this->role;
    }

    public function setRole(DemoRole $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getPersonnel(): ?Personnel
    {
        return $this->personnel;
    }

    public function setPersonnel(?Personnel $personnel): static
    {
        $this->personnel = $personnel;

        return $this;
    }

    public function getReception(): ?Reception
    {
        return $this->reception;
    }

    public function setReception(?Reception $reception): static
    {
        $this->reception = $reception;

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

    public function getNomComplet(): string
    {
        if ($this->personnel) {
            return trim($this->personnel->getPrenom() . ' ' . $this->personnel->getNom());
        }

        if ($this->reception) {
            return $this->reception->getNomSite();
        }

        return $this->identifiant;
    }
}
