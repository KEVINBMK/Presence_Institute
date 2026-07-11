<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Rattrapage : clés étrangères métier manquantes (tables étaient MyISAM)
 * + alignement des index avec le mapping Doctrine.
 *
 * Idempotente par rapport à un état partiel éventuel de Version20260711010000.
 */
final class Version20260711010000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rattrapage InnoDB : clés étrangères métier manquantes + alignement index';
    }

    public function up(Schema $schema): void
    {
        // Index compte_interne_demo (noms générés par Doctrine)
        $this->addSql('ALTER TABLE compte_interne_demo RENAME INDEX IDX_compte_personnel TO IDX_69702FBC1C109075');
        $this->addSql('ALTER TABLE compte_interne_demo RENAME INDEX IDX_compte_reception TO IDX_69702FBC7C14DF52');

        // Index usager : l'unique uniq_usager_telephone suffit (index simple redondant)
        $this->addSql('DROP INDEX idx_usager_telephone ON usager_visiteur');

        // Index visites obsolètes / renommage
        $this->addSql('DROP INDEX idx_visite_usager_created ON visites');
        $this->addSql('DROP INDEX IDX_B09C8CBB7C14DF52 ON visites');
        $this->addSql('ALTER TABLE visites RENAME INDEX idx_visite_reference TO idx_visites_reference');
        $this->addSql('ALTER TABLE visites RENAME INDEX idx_visite_statut TO idx_visites_statut');
        $this->addSql('ALTER TABLE visites RENAME INDEX idx_visite_usager TO idx_visites_usager');
        $this->addSql('ALTER TABLE visites RENAME INDEX uniq_visite_reference TO uniq_visites_reference');

        // Clés étrangères métier (jamais matérialisées sous MyISAM)
        $this->addSql('ALTER TABLE personnel ADD CONSTRAINT FK_A6BCF3DE32516FE2 FOREIGN KEY (bureau_id) REFERENCES bureau (id)');
        $this->addSql('ALTER TABLE rendez_vous ADD CONSTRAINT FK_65E8AA0A4F36F0FC FOREIGN KEY (usager_id) REFERENCES usager_visiteur (id)');
        $this->addSql('ALTER TABLE rendez_vous ADD CONSTRAINT FK_65E8AA0A32516FE2 FOREIGN KEY (bureau_id) REFERENCES bureau (id)');
        $this->addSql('ALTER TABLE rendez_vous ADD CONSTRAINT FK_65E8AA0A1C109075 FOREIGN KEY (personnel_id) REFERENCES personnel (id)');
        $this->addSql('ALTER TABLE visites ADD CONSTRAINT FK_470D39834F36F0FC FOREIGN KEY (usager_id) REFERENCES usager_visiteur (id)');
        $this->addSql('ALTER TABLE visites ADD CONSTRAINT FK_470D39837C14DF52 FOREIGN KEY (reception_id) REFERENCES reception (id)');
        $this->addSql('ALTER TABLE visite_rendez_vous ADD CONSTRAINT FK_D021EABCC1C5DC59 FOREIGN KEY (visite_id) REFERENCES visites (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE visite_rendez_vous ADD CONSTRAINT FK_D021EABC91EF7EAA FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE historique_action ADD CONSTRAINT FK_8E8E2CCE91EF7EAA FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE historique_action ADD CONSTRAINT FK_8E8E2CCEC1C5DC59 FOREIGN KEY (visite_id) REFERENCES visites (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE notification_interne ADD CONSTRAINT FK_35DB1C2B91EF7EAA FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE notification_interne ADD CONSTRAINT FK_35DB1C2BC1C5DC59 FOREIGN KEY (visite_id) REFERENCES visites (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE historique_action DROP FOREIGN KEY FK_8E8E2CCE91EF7EAA');
        $this->addSql('ALTER TABLE historique_action DROP FOREIGN KEY FK_8E8E2CCEC1C5DC59');
        $this->addSql('ALTER TABLE notification_interne DROP FOREIGN KEY FK_35DB1C2B91EF7EAA');
        $this->addSql('ALTER TABLE notification_interne DROP FOREIGN KEY FK_35DB1C2BC1C5DC59');
        $this->addSql('ALTER TABLE visite_rendez_vous DROP FOREIGN KEY FK_D021EABCC1C5DC59');
        $this->addSql('ALTER TABLE visite_rendez_vous DROP FOREIGN KEY FK_D021EABC91EF7EAA');
        $this->addSql('ALTER TABLE visites DROP FOREIGN KEY FK_470D39834F36F0FC');
        $this->addSql('ALTER TABLE visites DROP FOREIGN KEY FK_470D39837C14DF52');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0A4F36F0FC');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0A32516FE2');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0A1C109075');
        $this->addSql('ALTER TABLE personnel DROP FOREIGN KEY FK_A6BCF3DE32516FE2');
    }
}
