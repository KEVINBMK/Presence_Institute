<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/** RDV en DEMANDE : créneau non encore attribué (heures nullables). */
final class Version20260523030000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rendez-vous DEMANDE : heure_debut et heure_fin nullable';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE rendez_vous CHANGE heure_debut heure_debut TIME DEFAULT NULL');
        $this->addSql('ALTER TABLE rendez_vous CHANGE heure_fin heure_fin TIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE rendez_vous CHANGE heure_debut heure_debut TIME NOT NULL');
        $this->addSql('ALTER TABLE rendez_vous CHANGE heure_fin heure_fin TIME NOT NULL');
    }
}
