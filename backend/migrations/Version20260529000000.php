<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260529000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rendez-vous : fonction souhaitée par l’usager (sans choix nominatif du personnel)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE rendez_vous ADD fonction_souhaitee VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE rendez_vous DROP fonction_souhaitee');
    }
}
