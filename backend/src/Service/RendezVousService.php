<?php

namespace App\Service;

use App\DTO\CreateRendezVousDto;
use App\Entity\RendezVous;
use App\Entity\UsagerVisiteur;
use App\Enum\ActeurType;
use App\Enum\PeriodeSouhaitee;
use App\Enum\StatutRendezVous;
use App\Enum\TypeActionHistorique;
use App\Enum\TypeUsager;
use App\Exception\MetierException;
use App\Repository\BureauRepository;
use App\Repository\PersonnelRepository;
use App\Repository\RendezVousRepository;
use App\Repository\UsagerVisiteurRepository;
use App\Util\ReferenceGenerator;
use Doctrine\ORM\EntityManagerInterface;

class RendezVousService
{
    public function __construct(
        private EntityManagerInterface $em,
        private RendezVousRepository $rendezVousRepository,
        private BureauRepository $bureauRepository,
        private PersonnelRepository $personnelRepository,
        private UsagerVisiteurRepository $usagerRepository,
        private CreneauService $creneauService,
        private HistoriqueService $historique,
    ) {
    }

    public function creerDemande(CreateRendezVousDto $dto): RendezVous
    {
        return $this->em->wrapInTransaction(function () use ($dto) {
            $bureau = $this->bureauRepository->find($dto->bureauId);
            if (!$bureau || !$bureau->isActif()) {
                throw new MetierException('Bureau introuvable ou inactif.');
            }

            $dateStr = $this->resolveDateSouhaitee($dto);
            $date = CreneauService::parseDateCalendaire($dateStr);

            $this->creneauService->validerDateSouhaitee($bureau, $date);

            if ($this->rendezVousRepository->countActifsByTelephoneAndDate($dto->telephone, $date)
                >= $this->creneauService->getMaxRdvParJour()) {
                throw new MetierException('Nombre maximum de rendez-vous actifs atteint pour cette journée.');
            }

            $usager = $this->usagerRepository->findOneByTelephone($dto->telephone);
            if (!$usager) {
                $usager = new UsagerVisiteur();
                $usager->setNom($dto->nom);
                $usager->setPrenom($dto->prenom);
                $usager->setTelephone($dto->telephone);
                $usager->setEmail($dto->email);
                $usager->setTypeUsager(TypeUsager::from($dto->typeUsager));
                $this->em->persist($usager);
                $this->em->flush();
            } else {
                $usager->setNom($dto->nom);
                $usager->setPrenom($dto->prenom);
                $usager->setTypeUsager(TypeUsager::from($dto->typeUsager));
                if ($dto->email) {
                    $usager->setEmail($dto->email);
                }
            }

            $periode = $dto->periodeSouhaitee
                ? PeriodeSouhaitee::from($dto->periodeSouhaitee)
                : null;

            $attribution = $this->creneauService->attribuerPremierCreneauDisponible($bureau, $date, $periode);

            $rdv = new RendezVous();
            $rdv->setReference(ReferenceGenerator::rendezVous());
            $rdv->setDateRendezVous($date);
            $rdv->setMotif($dto->motif);
            $rdv->setUsager($usager);
            $rdv->setBureau($bureau);

            if ($attribution !== null) {
                $rdv->setHeureDebut($attribution['heureDebut']);
                $rdv->setHeureFin($attribution['heureFin']);
                $rdv->setPersonnel($attribution['personnel']);
                $rdv->setStatut(StatutRendezVous::CONFIRME);
            } else {
                $rdv->setHeureDebut(null);
                $rdv->setHeureFin(null);
                $rdv->setPersonnel(null);
                $rdv->setStatut(StatutRendezVous::DEMANDE);
            }

            $this->em->persist($rdv);

            $this->historique->enregistrer(
                TypeActionHistorique::RENDEZ_VOUS_CREE,
                $attribution !== null
                    ? 'Demande de rendez-vous créée et planifiée — réf. ' . $rdv->getReference()
                    : 'Demande de rendez-vous enregistrée — à planifier — réf. ' . $rdv->getReference(),
                ActeurType::USAGER,
                $usager->getId(),
                $rdv,
            );

            if ($attribution !== null) {
                $this->historique->enregistrer(
                    TypeActionHistorique::RENDEZ_VOUS_CONFIRME,
                    'Créneau attribué automatiquement par le système',
                    ActeurType::SYSTEME,
                    null,
                    $rdv,
                );
            }

            return $rdv;
        });
    }

    private function resolveDateSouhaitee(CreateRendezVousDto $dto): string
    {
        $date = trim($dto->dateSouhaitee);
        if ($date === '' && $dto->date !== null) {
            $date = trim($dto->date);
        }
        if ($date === '') {
            throw new MetierException('La date souhaitée est obligatoire.');
        }

        return $date;
    }

    public function findByReference(string $reference): RendezVous
    {
        $rdv = $this->rendezVousRepository->findByReference($reference);
        if (!$rdv) {
            throw new MetierException('Rendez-vous introuvable.');
        }

        return $rdv;
    }

    public function annuler(int $id, string $telephone): RendezVous
    {
        $rdv = $this->getOrFail($id);
        $this->assertModifiable($rdv);

        if ($rdv->getUsager()->getTelephone() !== $telephone) {
            throw new MetierException('Téléphone incorrect pour ce rendez-vous.');
        }

        if (!in_array($rdv->getStatut(), [StatutRendezVous::DEMANDE, StatutRendezVous::CONFIRME], true)) {
            throw new MetierException('Ce rendez-vous ne peut plus être annulé par l\'usager.');
        }

        $rdv->setStatut(StatutRendezVous::ANNULE);
        $this->historique->enregistrer(
            TypeActionHistorique::RENDEZ_VOUS_ANNULE,
            'Rendez-vous annulé par l\'usager',
            ActeurType::USAGER,
            $rdv->getUsager()->getId(),
            $rdv,
        );

        return $rdv;
    }

    public function getOrFail(int $id): RendezVous
    {
        $rdv = $this->rendezVousRepository->findOneWithRelations($id);
        if (!$rdv) {
            throw new MetierException('Rendez-vous introuvable.');
        }

        return $rdv;
    }

    public function assertModifiable(RendezVous $rdv): void
    {
        if (!$rdv->getStatut()->isModifiable()) {
            throw new MetierException('Ce rendez-vous est terminé et ne peut plus être modifié.');
        }
    }

    public function assertAppartientAuPersonnel(RendezVous $rdv, int $personnelId): void
    {
        if (!$rdv->getPersonnel() || $rdv->getPersonnel()->getId() !== $personnelId) {
            throw new MetierException('Ce rendez-vous n\'est pas assigné à ce membre du personnel.');
        }
    }

    public function reporter(int $id): RendezVous
    {
        $rdv = $this->getOrFail($id);
        $this->assertModifiable($rdv);

        if (!in_array($rdv->getStatut(), [StatutRendezVous::CONFIRME, StatutRendezVous::ARRIVE], true)) {
            throw new MetierException('Ce rendez-vous ne peut pas être reporté dans son état actuel.');
        }

        $rdv->setStatut(StatutRendezVous::REPORTE);
        $this->historique->enregistrer(
            TypeActionHistorique::RENDEZ_VOUS_REPORTE,
            'Rendez-vous reporté par la réception — ' . $rdv->getReference(),
            ActeurType::RECEPTION,
            null,
            $rdv,
        );

        return $rdv;
    }

    public function marquerNonPresente(int $id): RendezVous
    {
        $rdv = $this->getOrFail($id);
        $this->assertModifiable($rdv);

        if ($rdv->getStatut() !== StatutRendezVous::CONFIRME) {
            throw new MetierException('Seul un rendez-vous confirmé peut être marqué non présenté.');
        }

        $rdv->setStatut(StatutRendezVous::NON_PRESENTE);
        $this->historique->enregistrer(
            TypeActionHistorique::USAGER_NON_PRESENTE,
            'Usager non présenté — ' . $rdv->getReference(),
            ActeurType::RECEPTION,
            null,
            $rdv,
        );

        return $rdv;
    }
}
