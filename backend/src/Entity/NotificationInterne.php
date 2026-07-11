<?php

namespace App\Entity;

use App\Enum\ActeurType;
use App\Enum\StatutNotification;
use App\Enum\TypeNotification;
use App\Repository\NotificationInterneRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificationInterneRepository::class)]
#[ORM\Table(name: 'notification_interne')]
#[ORM\Index(columns: ['statut'], name: 'idx_notif_statut')]
#[ORM\Index(columns: ['visite_id'], name: 'idx_notif_visite')]
class NotificationInterne
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'string', enumType: TypeNotification::class)]
    private TypeNotification $type;

    #[ORM\Column(type: 'text')]
    private string $message;

    #[ORM\Column(type: 'string', length: 20, enumType: StatutNotification::class)]
    private StatutNotification $statut = StatutNotification::ENVOYEE;

    #[ORM\Column(type: 'string', enumType: ActeurType::class)]
    private ActeurType $emetteurType;

    #[ORM\Column(type: 'string', enumType: ActeurType::class)]
    private ActeurType $destinataireType;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?RendezVous $rendezVous = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Visite $visite = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $readAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $treatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getType(): TypeNotification
    {
        return $this->type;
    }

    public function setType(TypeNotification $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function setMessage(string $message): static
    {
        $this->message = $message;

        return $this;
    }

    public function getStatut(): StatutNotification
    {
        return $this->statut;
    }

    public function setStatut(StatutNotification $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getEmetteurType(): ActeurType
    {
        return $this->emetteurType;
    }

    public function setEmetteurType(ActeurType $emetteurType): static
    {
        $this->emetteurType = $emetteurType;

        return $this;
    }

    public function getDestinataireType(): ActeurType
    {
        return $this->destinataireType;
    }

    public function setDestinataireType(ActeurType $destinataireType): static
    {
        $this->destinataireType = $destinataireType;

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

    public function getReadAt(): ?\DateTimeImmutable
    {
        return $this->readAt;
    }

    public function setReadAt(?\DateTimeImmutable $readAt): static
    {
        $this->readAt = $readAt;

        return $this;
    }

    public function getTreatedAt(): ?\DateTimeImmutable
    {
        return $this->treatedAt;
    }

    public function setTreatedAt(?\DateTimeImmutable $treatedAt): static
    {
        $this->treatedAt = $treatedAt;

        return $this;
    }
}
