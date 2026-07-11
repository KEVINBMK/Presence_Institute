<?php

namespace App\Presenter;

use App\Entity\Bureau;
use App\Entity\CompteInterneDemo;
use App\Entity\HistoriqueAction;
use App\Entity\NotificationInterne;
use App\Entity\Personnel;
use App\Entity\RendezVous;
use App\Entity\UsagerVisiteur;
use App\Entity\Visite;

final class ApiPresenter
{
    public static function usager(UsagerVisiteur $u): array
    {
        return [
            'id' => $u->getId(),
            'nom' => $u->getNom(),
            'prenom' => $u->getPrenom(),
            'telephone' => $u->getTelephone(),
            'email' => $u->getEmail(),
            'typeUsager' => $u->getTypeUsager()->value,
        ];
    }

    public static function bureau(Bureau $b): array
    {
        return [
            'id' => $b->getId(),
            'nom' => $b->getNom(),
            'localisation' => $b->getLocalisation(),
            'description' => $b->getDescription(),
            'heureOuverture' => $b->getHeureOuverture()->format('H:i'),
            'heureFermeture' => $b->getHeureFermeture()->format('H:i'),
            'actif' => $b->isActif(),
        ];
    }

    public static function personnel(Personnel $p): array
    {
        return [
            'id' => $p->getId(),
            'nom' => $p->getNom(),
            'prenom' => $p->getPrenom(),
            'fonction' => $p->getFonction(),
            'disponibiliteOperationnelle' => $p->getDisponibiliteOperationnelle()->value,
            'motifNonReception' => $p->getMotifNonReception(),
            'bureauId' => $p->getBureau()->getId(),
            'actif' => $p->isActif(),
        ];
    }

    public static function personnelListe(Personnel $p): array
    {
        return array_merge(self::personnel($p), [
            'bureau' => self::bureau($p->getBureau()),
        ]);
    }

    public static function rendezVous(RendezVous $r): array
    {
        return [
            'id' => $r->getId(),
            'reference' => $r->getReference(),
            'dateRendezVous' => $r->getDateRendezVous()->format('Y-m-d'),
            'heureDebut' => $r->getHeureDebut()?->format('H:i'),
            'heureFin' => $r->getHeureFin()?->format('H:i'),
            'motif' => $r->getMotif(),
            'fonctionSouhaitee' => $r->getFonctionSouhaitee(),
            'statut' => $r->getStatut()->value,
            'usager' => self::usager($r->getUsager()),
            'bureau' => self::bureau($r->getBureau()),
            'personnel' => $r->getPersonnel() ? self::personnel($r->getPersonnel()) : null,
            'createdAt' => $r->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $r->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    /** Vue usager : pas d’informations nominatives ni opérationnelles sur le personnel interne. */
    public static function rendezVousPourUsager(RendezVous $r): array
    {
        return [
            'id' => $r->getId(),
            'reference' => $r->getReference(),
            'dateRendezVous' => $r->getDateRendezVous()->format('Y-m-d'),
            'heureDebut' => $r->getHeureDebut()?->format('H:i'),
            'heureFin' => $r->getHeureFin()?->format('H:i'),
            'statut' => $r->getStatut()->value,
            'fonctionSouhaitee' => $r->getFonctionSouhaitee(),
            'bureau' => self::bureau($r->getBureau()),
        ];
    }

    public static function visite(Visite $v): array
    {
        $rdvs = [];
        foreach ($v->getRendezVousLiens() as $lien) {
            $rdvs[] = self::rendezVous($lien->getRendezVous());
        }

        return [
            'id' => $v->getId(),
            'reference' => $v->getReference(),
            'statut' => $v->getStatut()->value,
            'heureArrivee' => $v->getHeureArrivee()?->format(\DateTimeInterface::ATOM),
            'heureSortie' => $v->getHeureSortie()?->format(\DateTimeInterface::ATOM),
            'decisionReception' => $v->getDecisionReception()?->value,
            'usager' => self::usager($v->getUsager()),
            'reception' => [
                'id' => $v->getReception()->getId(),
                'nomSite' => $v->getReception()->getNomSite(),
                'service' => $v->getReception()->getService(),
            ],
            'rendezVous' => $rdvs,
            'createdAt' => $v->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $v->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    public static function notification(NotificationInterne $n): array
    {
        return [
            'id' => $n->getId(),
            'type' => $n->getType()->value,
            'message' => $n->getMessage(),
            'statut' => $n->getStatut()->value,
            'emetteurType' => $n->getEmetteurType()->value,
            'destinataireType' => $n->getDestinataireType()->value,
            'rendezVousId' => $n->getRendezVous()?->getId(),
            'visiteId' => $n->getVisite()?->getId(),
            'createdAt' => $n->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'readAt' => $n->getReadAt()?->format(\DateTimeInterface::ATOM),
            'treatedAt' => $n->getTreatedAt()?->format(\DateTimeInterface::ATOM),
        ];
    }

    public static function historique(HistoriqueAction $h): array
    {
        return [
            'id' => $h->getId(),
            'typeAction' => $h->getTypeAction()->value,
            'description' => $h->getDescription(),
            'auteurType' => $h->getAuteurType()->value,
            'auteurId' => $h->getAuteurId(),
            'rendezVousId' => $h->getRendezVous()?->getId(),
            'visiteId' => $h->getVisite()?->getId(),
            'createdAt' => $h->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    public static function creneau(string $debut, string $fin, bool $disponible, ?int $personnelId = null): array
    {
        return [
            'heureDebut' => $debut,
            'heureFin' => $fin,
            'disponible' => $disponible,
            'personnelId' => $personnelId,
        ];
    }

    public static function compteDemo(CompteInterneDemo $compte): array
    {
        $payload = [
            'id' => $compte->getId(),
            'identifiant' => $compte->getIdentifiant(),
            'nomComplet' => $compte->getNomComplet(),
            'role' => $compte->getRole()->value,
            'personnelId' => $compte->getPersonnel()?->getId(),
        ];

        if ($compte->getPersonnel()) {
            $p = $compte->getPersonnel();
            $payload['fonction'] = $p->getFonction();
            $payload['bureau'] = $p->getBureau()->getNom();
            $payload['disponibiliteOperationnelle'] = $p->getDisponibiliteOperationnelle()->value;
        }

        return $payload;
    }

    /** Instructions usager selon le statut — sans données internes. */
    public static function suiviUsager(RendezVous $r): array
    {
        $data = self::rendezVousPourUsager($r);
        $data['instructions'] = match ($r->getStatut()->value) {
            'DEMANDE' => 'Votre demande sera traitée par la réception. Conservez votre référence.',
            'CONFIRME' => 'Présentez-vous à la réception à l\'heure indiquée avec votre référence.',
            'ARRIVE', 'EN_COURS' => 'Vous êtes pris en charge. Attendez les instructions de la réception.',
            'TERMINE' => 'Votre visite est terminée. Vous pouvez quitter le site ou attendre la réception.',
            'REPORTE' => 'Votre rendez-vous a été reporté. La réception vous contactera.',
            'ANNULE' => 'Ce rendez-vous a été annulé.',
            'NON_PRESENTE' => 'Vous avez été marqué absent. Contactez la réception pour replanifier.',
            default => 'Consultez la réception pour toute question.',
        };

        return $data;
    }
}
