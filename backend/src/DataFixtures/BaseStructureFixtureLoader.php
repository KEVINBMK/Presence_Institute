<?php

namespace App\DataFixtures;

use App\DataFixtures\Support\SlotRegistry;
use App\Entity\Bureau;
use App\Entity\Personnel;
use App\Entity\Reception;
use App\Enum\DisponibilitePersonnel;

/** Réceptions, bureaux MVP (6) et personnel de démonstration (10). */
final class BaseStructureFixtureLoader
{
    public function load(FixtureContext $ctx): void
    {
        $this->createReceptions($ctx);
        $this->createBureaux($ctx);
        $this->createPersonnelsDemo($ctx);
        $ctx->em->flush();
    }

    private function createReceptions(FixtureContext $ctx): void
    {
        foreach (
            [
                ['Réception C2I principale', 'Secrétariat / Accueil institutionnel'],
                ['Réception administrative annexe', 'Accueil annexe — bâtiment B'],
            ] as [$nom, $service]
        ) {
            $r = new Reception();
            $r->setNomSite($nom);
            $r->setService($service);
            $r->setStatutService('OUVERT');
            $r->setActif(true);
            $ctx->em->persist($r);
            $ctx->receptions[] = $r;
        }
    }

    private function createBureaux(FixtureContext $ctx): void
    {
        $defs = [
            ['Bureau Secrétariat', 'Hall principal — Rez-de-chaussée', 'Point d\'entrée et coordination des visites.', '08:00', '16:00'],
            ['Bureau Génie Logiciel', 'Aile technique — 2e étage', 'Applications et évolutions logicielles.', '08:00', '16:00'],
            ['Bureau Administration Système', 'Datacenter — Bâtiment C', 'Serveurs, comptes et incidents système.', '08:00', '16:00'],
            ['Bureau Maintenance Réseau', 'Salle réseau — RDC technique', 'Connectivité et maintenance réseau.', '08:00', '16:00'],
            ['Bureau Assistance aux utilisateurs', 'Helpdesk — Open space', 'Support agents et usagers internes.', '08:30', '15:30'],
            ['Bureau Sécurité', 'Poste de contrôle — Entrée', 'Contrôle d\'accès et habilitations.', '08:00', '16:00'],
        ];

        foreach ($defs as [$nom, $loc, $desc, $ouv, $ferm]) {
            $b = new Bureau();
            $b->setNom($nom);
            $b->setLocalisation($loc);
            $b->setDescription($desc);
            $b->setHeureOuverture(SlotRegistry::timeImmutable($ouv));
            $b->setHeureFermeture(SlotRegistry::timeImmutable($ferm));
            $b->setActif(true);
            $ctx->em->persist($b);
            $ctx->bureaux[] = $b;
        }
    }

    private function createPersonnelsDemo(FixtureContext $ctx): void
    {
        $ctx->em->flush();

        $personnels = [
            ['jean_kabila', 'Bureau Secrétariat', 'Kabila', 'Jean', 'Agent de secrétariat', DisponibilitePersonnel::DISPONIBLE, null],
            ['grace_mbala', 'Bureau Secrétariat', 'Mbala', 'Grâce', 'Chef de bureau', DisponibilitePersonnel::DISPONIBLE, null],
            ['marie_ilunga', 'Bureau Génie Logiciel', 'Ilunga', 'Marie', 'Développeuse', DisponibilitePersonnel::DISPONIBLE, null],
            ['patrick_tshimanga', 'Bureau Génie Logiciel', 'Tshimanga', 'Patrick', 'Analyste logiciel', DisponibilitePersonnel::DISPONIBLE, null],
            ['david_mutombo', 'Bureau Génie Logiciel', 'Mutombo', 'David', 'Chef de projet logiciel', DisponibilitePersonnel::DISPONIBLE, null],
            ['alain_kabongo', 'Bureau Administration Système', 'Kabongo', 'Alain', 'Administrateur système', DisponibilitePersonnel::DISPONIBLE, null],
            ['chantal_mbuyi', 'Bureau Administration Système', 'Mbuyi', 'Chantal', 'Assistante technique', DisponibilitePersonnel::DISPONIBLE, null],
            ['junior_kalala', 'Bureau Maintenance Réseau', 'Kalala', 'Junior', 'Technicien réseau', DisponibilitePersonnel::DISPONIBLE, null],
            ['sarah_mavungu', 'Bureau Assistance aux utilisateurs', 'Mavungu', 'Sarah', 'Assistante utilisateurs', DisponibilitePersonnel::DISPONIBLE, null],
            ['heritier_lukusa', 'Bureau Sécurité', 'Lukusa', 'Héritier', 'Agent sécurité informatique', DisponibilitePersonnel::DISPONIBLE, null],
        ];

        foreach ($personnels as [$key, $bureauNom, $nom, $prenom, $fonction, $dispo, $motif]) {
            $bureau = $this->findBureauByNom($ctx, $bureauNom);
            $p = new Personnel();
            $p->setNom($nom);
            $p->setPrenom($prenom);
            $p->setFonction($fonction);
            $p->setDisponibiliteOperationnelle($dispo);
            $p->setMotifNonReception($motif);
            $p->setBureau($bureau);
            $p->setActif(true);
            $ctx->em->persist($p);
            $ctx->personnels[] = $p;
            $ctx->demoPersonnelsByKey[$key] = $p;
            $ctx->personnelsByBureauId[$bureau->getId()][] = $p;
        }
    }

    private function findBureauByNom(FixtureContext $ctx, string $nom): Bureau
    {
        foreach ($ctx->bureaux as $bureau) {
            if ($bureau->getNom() === $nom) {
                return $bureau;
            }
        }

        throw new \RuntimeException('Bureau introuvable dans les fixtures : ' . $nom);
    }
}
