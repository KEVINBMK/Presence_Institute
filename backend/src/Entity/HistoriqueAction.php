<?php

namespace App\Entity;

use App\Enum\ActeurType;
use App\Enum\TypeActionHistorique;
use App\Repository\HistoriqueActionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: HistoriqueActionRepository::class)]
#[ORM\Table(name: 'historique_action')]
#[ORM\Index(columns: ['visite_id'], name: 'idx_hist_visite')]
#[ORM\Index(columns: ['rendez_vous_id'], name: 'idx_hist_rdv')]
class HistoriqueAction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string', enumType: TypeActionHistorique::class)]
    private TypeActionHistorique $typeAction;

    #[ORM\Column(type: 'text')]
    private string $description;

    #[ORM\Column(type: 'string', enumType: ActeurType::class)]
    private ActeurType $auteurType;

    #[ORM\Column(nullable: true)]
    private ?int $auteurId = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?RendezVous $rendezVous = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Visite $visite = null;

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

    public function getTypeAction(): TypeActionHistorique
    {
        return $this->typeAction;
    }

    public function setTypeAction(TypeActionHistorique $typeAction): static
    {
        $this->typeAction = $typeAction;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getAuteurType(): ActeurType
    {
        return $this->auteurType;
    }

    public function setAuteurType(ActeurType $auteurType): static
    {
        $this->auteurType = $auteurType;

        return $this;
    }

    public function getAuteurId(): ?int
    {
        return $this->auteurId;
    }

    public function setAuteurId(?int $auteurId): static
    {
        $this->auteurId = $auteurId;

        return $this;
    }

    public function getRendezVous(): ?RendezVous
    {
        return $this->rendezVous;
    }

    public function setRendezVous(?RendezVous $rendezVous): static
    {
        $this->rendezVous = $rendezVous;

        return $this;
    }

    public function getVisite(): ?Visite
    {
        return $this->visite;
    }

    public function setVisite(?Visite $visite): static
    {
        $this->visite = $visite;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
