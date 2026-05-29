<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Adaptation institutionnelle C2I — champs et table visites.
 */
final class Version20260523000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Contexte C2I : type usager, descriptions bureaux, service réception, table visites';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('RENAME TABLE visite TO visites');

        $this->addSql("ALTER TABLE usager_visiteur ADD type_usager VARCHAR(30) NOT NULL DEFAULT 'VISITEUR_EXTERNE'");
        $this->addSql('CREATE INDEX idx_usager_type ON usager_visiteur (type_usager)');

        $this->addSql('ALTER TABLE bureau ADD description LONGTEXT DEFAULT NULL, ADD created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE INDEX idx_bureau_actif ON bureau (actif)');

        $this->addSql("ALTER TABLE reception ADD service VARCHAR(100) NOT NULL DEFAULT 'Secrétariat / Accueil', ADD created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '(DC2Type:datetime_immutable)'");

        $this->addSql('ALTER TABLE personnel ADD created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE INDEX idx_personnel_bureau ON personnel (bureau_id)');

        $this->addSql('CREATE INDEX idx_visites_reception ON visites (reception_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_visites_reception ON visites');
        $this->addSql('DROP INDEX idx_personnel_bureau ON personnel');
        $this->addSql('ALTER TABLE personnel DROP created_at');
        $this->addSql('ALTER TABLE reception DROP service, DROP created_at');
        $this->addSql('DROP INDEX idx_bureau_actif ON bureau');
        $this->addSql('ALTER TABLE bureau DROP description, DROP created_at');
        $this->addSql('DROP INDEX idx_usager_type ON usager_visiteur');
        $this->addSql('ALTER TABLE usager_visiteur DROP type_usager');
        $this->addSql('RENAME TABLE visites TO visite');
    }
}
