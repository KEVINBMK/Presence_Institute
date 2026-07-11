<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Comptes internes de démonstration.
 *
 * Prérequis : les tables référencées (personnel, reception) doivent être InnoDB.
 * Sur certaines installations WAMP, la migration initiale a créé les tables en MyISAM
 * (moteur par défaut), ce qui provoque l'erreur 1824 lors de l'ajout des FK.
 */
final class Version20260711000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Comptes internes de démonstration (authentification simulée) + passage InnoDB des tables liées';
    }

    public function up(Schema $schema): void
    {
        // Convertir les tables métier en InnoDB pour permettre les clés étrangères.
        // Ordre : tables référencées d'abord, puis tables dépendantes.
        $this->addSql('ALTER TABLE bureau ENGINE=InnoDB');
        $this->addSql('ALTER TABLE usager_visiteur ENGINE=InnoDB');
        $this->addSql('ALTER TABLE reception ENGINE=InnoDB');
        $this->addSql('ALTER TABLE personnel ENGINE=InnoDB');
        $this->addSql('ALTER TABLE rendez_vous ENGINE=InnoDB');
        $this->addSql('ALTER TABLE visites ENGINE=InnoDB');
        $this->addSql('ALTER TABLE visite_rendez_vous ENGINE=InnoDB');
        $this->addSql('ALTER TABLE historique_action ENGINE=InnoDB');
        $this->addSql('ALTER TABLE notification_interne ENGINE=InnoDB');

        $this->addSql('CREATE TABLE compte_interne_demo (
            id INT AUTO_INCREMENT NOT NULL,
            personnel_id INT DEFAULT NULL,
            reception_id INT DEFAULT NULL,
            identifiant VARCHAR(50) NOT NULL,
            code_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL,
            actif TINYINT(1) NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            UNIQUE INDEX uniq_compte_identifiant (identifiant),
            INDEX IDX_compte_personnel (personnel_id),
            INDEX IDX_compte_reception (reception_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE compte_interne_demo ADD CONSTRAINT FK_compte_personnel FOREIGN KEY (personnel_id) REFERENCES personnel (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE compte_interne_demo ADD CONSTRAINT FK_compte_reception FOREIGN KEY (reception_id) REFERENCES reception (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE compte_interne_demo DROP FOREIGN KEY FK_compte_personnel');
        $this->addSql('ALTER TABLE compte_interne_demo DROP FOREIGN KEY FK_compte_reception');
        $this->addSql('DROP TABLE compte_interne_demo');
    }
}
