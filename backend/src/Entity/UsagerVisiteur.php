<?php

namespace App\Entity;

use App\Enum\TypeUsager;
use App\Repository\UsagerVisiteurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UsagerVisiteurRepository::class)]
#[ORM\Table(name: 'usager_visiteur')]
#[ORM\UniqueConstraint(name: 'uniq_usager_telephone', columns: ['telephone'])]
#[ORM\Index(columns: ['telephone'], name: 'idx_usager_telephone')]
#[ORM\Index(columns: ['nom', 'prenom'], name: 'idx_usager_nom_prenom')]
#[ORM\Index(columns: ['type_usager'], name: 'idx_usager_type')]
class UsagerVisiteur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $nom;

    #[ORM\Column(length: 100)]
    private string $prenom;

    #[ORM\Column(length: 20)]
    private string $telephone;

    #[ORM\Column(length: 180, nullable: true)]
    private ?string $email = null;

    #[ORM\Column(type: 'string', enumType: TypeUsager::class)]
    private TypeUsager $typeUsager = TypeUsager::CITOYEN;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /** @var Collection<int, RendezVous> */
    #[ORM\OneToMany(targetEntity: RendezVous::class, mappedBy: 'usager')]
    private Collection $rendezVous;

    /** @var Collection<int, Visite> */
    #[ORM\OneToMany(targetEntity: Visite::class, mappedBy: 'usager')]
    private Collection $visites;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->rendezVous = new ArrayCollection();
        $this->visites = new ArrayCollection();
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

    public function getTelephone(): string
    {
        return $this->telephone;
    }

    public function setTelephone(string $telephone): static
    {
        $this->telephone = $telephone;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getTypeUsager(): TypeUsager
    {
        return $this->typeUsager;
    }

    public function setTypeUsager(TypeUsager $typeUsager): static
    {
        $this->typeUsager = $typeUsager;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    /** @return Collection<int, RendezVous> */
    public function getRendezVous(): Collection
    {
        return $this->rendezVous;
    }

    /** @return Collection<int, Visite> */
    public function getVisites(): Collection
    {
        return $this->visites;
    }
}
