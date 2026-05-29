<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260523020000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Contrainte téléphone usager unique + index composite créneaux rendez-vous';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE UNIQUE INDEX uniq_usager_telephone ON usager_visiteur (telephone)');
        $this->addSql('CREATE INDEX idx_rdv_bureau_date_personnel_debut ON rendez_vous (bureau_id, date_rendez_vous, personnel_id, heure_debut)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_rdv_bureau_date_personnel_debut ON rendez_vous');
        $this->addSql('DROP INDEX uniq_usager_telephone ON usager_visiteur');
    }
}
