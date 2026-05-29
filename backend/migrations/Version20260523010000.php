<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260523010000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Renommage disponibilité opérationnelle personnel, types usager/historique/notifications';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("UPDATE personnel SET disponibilite = 'NON_DISPONIBLE_POUR_RECEPTION' WHERE disponibilite IN ('INDISPONIBLE', 'ABSENT')");
        $this->addSql('ALTER TABLE personnel CHANGE disponibilite disponibilite_operationnelle VARCHAR(50) NOT NULL');
        $this->addSql('ALTER TABLE personnel CHANGE motif_indisponibilite motif_non_reception VARCHAR(255) DEFAULT NULL');
        $this->addSql("DROP INDEX idx_personnel_disponibilite ON personnel");
        $this->addSql('CREATE INDEX idx_personnel_disponibilite ON personnel (disponibilite_operationnelle)');

        $this->addSql("UPDATE usager_visiteur SET type_usager = 'CITOYEN' WHERE type_usager = 'VISITEUR_EXTERNE'");
        $this->addSql("UPDATE usager_visiteur SET type_usager = 'AGENT_PUBLIC' WHERE type_usager = 'USAGER_INTERNE'");
        $this->addSql("UPDATE usager_visiteur SET type_usager = 'PARTENAIRE_TECHNIQUE' WHERE type_usager = 'AGENT_PARTENAIRE'");
        $this->addSql("UPDATE usager_visiteur SET type_usager = 'REPRESENTANT_EXTERNE' WHERE type_usager = 'AUTRE'");

        $this->addSql("UPDATE historique_action SET type_action = 'RENDEZ_VOUS_CREE' WHERE type_action = 'RDV_CREE'");
        $this->addSql("UPDATE historique_action SET type_action = 'RENDEZ_VOUS_CONFIRME' WHERE type_action = 'RDV_CONFIRME'");
        $this->addSql("UPDATE historique_action SET type_action = 'RENDEZ_VOUS_ANNULE' WHERE type_action = 'RDV_ANNULE'");
        $this->addSql("UPDATE historique_action SET type_action = 'RENDEZ_VOUS_REPORTE' WHERE type_action = 'RDV_REPORTE'");
        $this->addSql("UPDATE historique_action SET type_action = 'USAGER_NON_PRESENTE' WHERE type_action = 'RDV_NON_PRESENTE'");
        $this->addSql("UPDATE historique_action SET type_action = 'ORIENTATION_EFFECTUEE' WHERE type_action = 'ORIENTATION'");
        $this->addSql("UPDATE historique_action SET type_action = 'NOTIFICATION_RECEPTION' WHERE type_action = 'NOTIFICATION_ENVOYEE'");
        $this->addSql("UPDATE historique_action SET type_action = 'DISPONIBILITE_OPERATIONNELLE_CHANGEE' WHERE type_action = 'DISPONIBILITE_CHANGEE'");

        $this->addSql("UPDATE notification_interne SET type = 'PERSONNEL_NON_DISPONIBLE' WHERE type = 'PERSONNEL_INDISPONIBLE'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("UPDATE notification_interne SET type = 'PERSONNEL_INDISPONIBLE' WHERE type = 'PERSONNEL_NON_DISPONIBLE'");

        $this->addSql("UPDATE historique_action SET type_action = 'DISPONIBILITE_CHANGEE' WHERE type_action = 'DISPONIBILITE_OPERATIONNELLE_CHANGEE'");
        $this->addSql("UPDATE historique_action SET type_action = 'NOTIFICATION_ENVOYEE' WHERE type_action = 'NOTIFICATION_RECEPTION'");
        $this->addSql("UPDATE historique_action SET type_action = 'ORIENTATION' WHERE type_action = 'ORIENTATION_EFFECTUEE'");
        $this->addSql("UPDATE historique_action SET type_action = 'RDV_NON_PRESENTE' WHERE type_action = 'USAGER_NON_PRESENTE'");
        $this->addSql("UPDATE historique_action SET type_action = 'RDV_REPORTE' WHERE type_action = 'RENDEZ_VOUS_REPORTE'");
        $this->addSql("UPDATE historique_action SET type_action = 'RDV_ANNULE' WHERE type_action = 'RENDEZ_VOUS_ANNULE'");
        $this->addSql("UPDATE historique_action SET type_action = 'RDV_CONFIRME' WHERE type_action = 'RENDEZ_VOUS_CONFIRME'");
        $this->addSql("UPDATE historique_action SET type_action = 'RDV_CREE' WHERE type_action = 'RENDEZ_VOUS_CREE'");

        $this->addSql("DROP INDEX idx_personnel_disponibilite ON personnel");
        $this->addSql('ALTER TABLE personnel CHANGE disponibilite_operationnelle disponibilite VARCHAR(50) NOT NULL');
        $this->addSql('ALTER TABLE personnel CHANGE motif_non_reception motif_indisponibilite VARCHAR(255) DEFAULT NULL');
        $this->addSql('CREATE INDEX idx_personnel_disponibilite ON personnel (disponibilite)');
    }
}
