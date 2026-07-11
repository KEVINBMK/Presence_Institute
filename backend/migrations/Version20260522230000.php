<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260522230000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Index de performance pour créneaux et recherche';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE INDEX idx_rdv_bureau_date_statut ON rendez_vous (bureau_id, date_rendez_vous, statut(20))');
        $this->addSql('CREATE INDEX idx_rdv_personnel_date_debut ON rendez_vous (personnel_id, date_rendez_vous, heure_debut)');
        $this->addSql('CREATE INDEX idx_visite_usager_created ON visite (usager_id, created_at)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_rdv_bureau_date_statut ON rendez_vous');
        $this->addSql('DROP INDEX idx_rdv_personnel_date_debut ON rendez_vous');
        $this->addSql('DROP INDEX idx_visite_usager_created ON visite');
    }
}
