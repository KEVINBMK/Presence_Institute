<?php

namespace App\Entity;

use App\Enum\DecisionReception;
use App\Enum\StatutVisite;
use App\Repository\VisiteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: VisiteRepository::class)]
#[ORM\Table(name: 'visites')]
#[ORM\Index(columns: ['reference'], name: 'idx_visites_reference')]
#[ORM\Index(columns: ['statut'], name: 'idx_visites_statut')]
#[ORM\Index(columns: ['usager_id'], name: 'idx_visites_usager')]
#[ORM\Index(columns: ['reception_id'], name: 'idx_visites_reception')]
#[ORM\UniqueConstraint(name: 'uniq_visites_reference', columns: ['reference'])]
class Visite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 30, unique: true)]
    private string $reference;

    #[ORM\ManyToOne(inversedBy: 'visites')]
    #[ORM\JoinColumn(nullable: false)]
    private UsagerVisiteur $usager;

    #[ORM\ManyToOne(inversedBy: 'visites')]
    #[ORM\JoinColumn(nullable: false)]
    private Reception $reception;

    #[ORM\Column(type: 'string', enumType: StatutVisite::class)]
    private StatutVisite $statut = StatutVisite::OUVERTE;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $heureArrivee = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $heureSortie = null;

    #[ORM\Column(type: 'string', enumType: DecisionReception::class, nullable: true)]
    private ?DecisionReception $decisionReception = null;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column]
    private \DateTimeImmutable $updatedAt;

    /** @var Collection<int, VisiteRendezVous> */
    #[ORM\OneToMany(targetEntity: VisiteRendezVous::class, mappedBy: 'visite', cascade: ['persist'])]
    private Collection $rendezVousLiens;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->rendezVousLiens = new ArrayCollection();
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

    public function getUsager(): UsagerVisiteur
    {
        return $this->usager;
    }

    public function setUsager(UsagerVisiteur $usager): static
    {
        $this->usager = $usager;

        return $this;
    }

    public function getReception(): Reception
    {
        return $this->reception;
    }

    public function setReception(Reception $reception): static
    {
        $this->reception = $reception;

        return $this;
    }

    public function getStatut(): StatutVisite
    {
        return $this->statut;
    }

    public function setStatut(StatutVisite $statut): static
    {
        $this->statut = $statut;
        $this->touch();

        return $this;
    }

    public function getHeureArrivee(): ?\DateTimeImmutable
    {
        return $this->heureArrivee;
    }

    public function setHeureArrivee(?\DateTimeImmutable $heureArrivee): static
    {
        $this->heureArrivee = $heureArrivee;

        return $this;
    }

    public function getHeureSortie(): ?\DateTimeImmutable
    {
        return $this->heureSortie;
    }

    public function setHeureSortie(?\DateTimeImmutable $heureSortie): static
    {
        $this->heureSortie = $heureSortie;

        return $this;
    }

    public function getDecisionReception(): ?DecisionReception
    {
        return $this->decisionReception;
    }

    public function setDecisionReception(?DecisionReception $decisionReception): static
    {
        $this->decisionReception = $decisionReception;
        $this->touch();

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

    /** @return Collection<int, VisiteRendezVous> */
    public function getRendezVousLiens(): Collection
    {
        return $this->rendezVousLiens;
    }

    public function addRendezVous(RendezVous $rendezVous): void
    {
        foreach ($this->rendezVousLiens as $lien) {
            if ($lien->getRendezVous() === $rendezVous) {
                return;
            }
        }
        $lien = new VisiteRendezVous();
        $lien->setVisite($this);
        $lien->setRendezVous($rendezVous);
        $this->rendezVousLiens->add($lien);
    }

    public function touch(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}
