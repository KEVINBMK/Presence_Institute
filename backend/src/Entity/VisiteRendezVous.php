<?php

namespace App\Entity;

use App\Repository\VisiteRendezVousRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: VisiteRendezVousRepository::class)]
#[ORM\Table(name: 'visite_rendez_vous')]
#[ORM\UniqueConstraint(name: 'uniq_visite_rdv', columns: ['visite_id', 'rendez_vous_id'])]
class VisiteRendezVous
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'rendezVousLiens')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Visite $visite;

    #[ORM\ManyToOne(inversedBy: 'visiteLiens')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private RendezVous $rendezVous;

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

    public function getVisite(): Visite
    {
        return $this->visite;
    }

    public function setVisite(Visite $visite): static
    {
        $this->visite = $visite;

        return $this;
    }

    public function getRendezVous(): RendezVous
    {
        return $this->rendezVous;
    }

    public function setRendezVous(RendezVous $rendezVous): static
    {
        $this->rendezVous = $rendezVous;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
