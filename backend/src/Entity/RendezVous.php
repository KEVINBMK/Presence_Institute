<?php

namespace App\Entity;

use App\Enum\StatutRendezVous;
use App\Repository\RendezVousRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RendezVousRepository::class)]
#[ORM\Table(name: 'rendez_vous')]
#[ORM\Index(columns: ['reference'], name: 'idx_rdv_reference')]
#[ORM\Index(columns: ['date_rendez_vous'], name: 'idx_rdv_date')]
#[ORM\Index(columns: ['statut'], name: 'idx_rdv_statut')]
#[ORM\Index(columns: ['usager_id'], name: 'idx_rdv_usager')]
#[ORM\Index(columns: ['bureau_id'], name: 'idx_rdv_bureau')]
#[ORM\Index(columns: ['personnel_id'], name: 'idx_rdv_personnel')]
#[ORM\Index(columns: ['bureau_id', 'date_rendez_vous', 'personnel_id', 'heure_debut'], name: 'idx_rdv_bureau_date_personnel_debut')]
#[ORM\UniqueConstraint(name: 'uniq_rdv_reference', columns: ['reference'])]
class RendezVous
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 30, unique: true)]
    private string $reference;

    #[ORM\Column(type: 'date_immutable')]
    private \DateTimeImmutable $dateRendezVous;

    #[ORM\Column(type: 'time_immutable', nullable: true)]
    private ?\DateTimeImmutable $heureDebut = null;

    #[ORM\Column(type: 'time_immutable', nullable: true)]
    private ?\DateTimeImmutable $heureFin = null;

    #[ORM\Column(type: 'text')]
    private string $motif;

    #[ORM\Column(type: 'string', enumType: StatutRendezVous::class)]
    private StatutRendezVous $statut = StatutRendezVous::DEMANDE;

    #[ORM\ManyToOne(inversedBy: 'rendezVous')]
    #[ORM\JoinColumn(nullable: false)]
    private UsagerVisiteur $usager;

    #[ORM\ManyToOne(inversedBy: 'rendezVous')]
    #[ORM\JoinColumn(nullable: false)]
    private Bureau $bureau;

    #[ORM\ManyToOne(inversedBy: 'rendezVous')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Personnel $personnel = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    /** @var Collection<int, VisiteRendezVous> */
    #[ORM\OneToMany(targetEntity: VisiteRendezVous::class, mappedBy: 'rendezVous')]
    private Collection $visiteLiens;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->visiteLiens = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getReference(): string
    {
        return $this->reference;
    }

    public function setReference(string $reference): static
    {
        $this->reference = $reference;

        return $this;
    }

    public function getDateRendezVous(): \DateTimeImmutable
    {
        return $this->dateRendezVous;
    }

    public function setDateRendezVous(\DateTimeImmutable $dateRendezVous): static
    {
        $this->dateRendezVous = $dateRendezVous;

        return $this;
    }

    public function getHeureDebut(): ?\DateTimeImmutable
    {
        return $this->heureDebut;
    }

    public function setHeureDebut(?\DateTimeImmutable $heureDebut): static
    {
        $this->heureDebut = $heureDebut;

        return $this;
    }

    public function getHeureFin(): ?\DateTimeImmutable
    {
        return $this->heureFin;
    }

    public function setHeureFin(?\DateTimeImmutable $heureFin): static
    {
        $this->heureFin = $heureFin;

        return $this;
    }

    public function aCreneauAttribue(): bool
    {
        return $this->heureDebut !== null && $this->heureFin !== null;
    }

    public function getMotif(): string
    {
        return $this->motif;
    }

    public function setMotif(string $motif): static
    {
        $this->motif = $motif;

        return $this;
    }

    public function getStatut(): StatutRendezVous
    {
        return $this->statut;
    }

    public function setStatut(StatutRendezVous $statut): static
    {
        $this->statut = $statut;
        $this->touch();

        return $this;
    }

    public function getUsager(): UsagerVisiteur
    {
        return $this->usager;
    }

    public function setUsager(UsagerVisiteur $usager): static
    {
        $this->usager = $usager;

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

    public function getPersonnel(): ?Personnel
    {
        return $this->personnel;
    }

    public function setPersonnel(?Personnel $personnel): static
    {
        $this->personnel = $personnel;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function touch(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}
