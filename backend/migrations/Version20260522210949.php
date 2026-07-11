<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260522210949 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        // ENGINE=InnoDB explicite : sur WAMP le moteur par défaut peut être MyISAM,
        // ce qui empêche les clés étrangères (erreur 1824).
        $this->addSql('CREATE TABLE bureau (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(150) NOT NULL, localisation VARCHAR(255) NOT NULL, heure_ouverture TIME NOT NULL, heure_fermeture TIME NOT NULL, actif TINYINT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE historique_action (id INT AUTO_INCREMENT NOT NULL, type_action VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, auteur_type VARCHAR(255) NOT NULL, auteur_id INT DEFAULT NULL, created_at DATETIME NOT NULL, rendez_vous_id INT DEFAULT NULL, visite_id INT DEFAULT NULL, INDEX idx_hist_visite (visite_id), INDEX idx_hist_rdv (rendez_vous_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE notification_interne (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(255) NOT NULL, message LONGTEXT NOT NULL, statut VARCHAR(255) NOT NULL, emetteur_type VARCHAR(255) NOT NULL, destinataire_type VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, read_at DATETIME DEFAULT NULL, treated_at DATETIME DEFAULT NULL, rendez_vous_id INT DEFAULT NULL, visite_id INT DEFAULT NULL, INDEX IDX_35DB1C2B91EF7EAA (rendez_vous_id), INDEX idx_notif_statut (statut), INDEX idx_notif_visite (visite_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE personnel (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, fonction VARCHAR(100) NOT NULL, disponibilite VARCHAR(255) NOT NULL, motif_indisponibilite VARCHAR(255) DEFAULT NULL, actif TINYINT NOT NULL, bureau_id INT NOT NULL, INDEX IDX_A6BCF3DE32516FE2 (bureau_id), INDEX idx_personnel_disponibilite (disponibilite), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE reception (id INT AUTO_INCREMENT NOT NULL, nom_site VARCHAR(150) NOT NULL, statut_service VARCHAR(50) NOT NULL, actif TINYINT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE rendez_vous (id INT AUTO_INCREMENT NOT NULL, reference VARCHAR(30) NOT NULL, date_rendez_vous DATE NOT NULL, heure_debut TIME NOT NULL, heure_fin TIME NOT NULL, motif LONGTEXT NOT NULL, statut VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, usager_id INT NOT NULL, bureau_id INT NOT NULL, personnel_id INT DEFAULT NULL, INDEX idx_rdv_reference (reference), INDEX idx_rdv_date (date_rendez_vous), INDEX idx_rdv_statut (statut), INDEX idx_rdv_usager (usager_id), INDEX idx_rdv_bureau (bureau_id), INDEX idx_rdv_personnel (personnel_id), UNIQUE INDEX uniq_rdv_reference (reference), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE usager_visiteur (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, telephone VARCHAR(20) NOT NULL, email VARCHAR(180) DEFAULT NULL, created_at DATETIME NOT NULL, INDEX idx_usager_telephone (telephone), INDEX idx_usager_nom_prenom (nom, prenom), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE visite (id INT AUTO_INCREMENT NOT NULL, reference VARCHAR(30) NOT NULL, statut VARCHAR(255) NOT NULL, heure_arrivee DATETIME DEFAULT NULL, heure_sortie DATETIME DEFAULT NULL, decision_reception VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, usager_id INT NOT NULL, reception_id INT NOT NULL, INDEX IDX_B09C8CBB7C14DF52 (reception_id), INDEX idx_visite_reference (reference), INDEX idx_visite_statut (statut), INDEX idx_visite_usager (usager_id), UNIQUE INDEX uniq_visite_reference (reference), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE visite_rendez_vous (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, visite_id INT NOT NULL, rendez_vous_id INT NOT NULL, INDEX IDX_D021EABCC1C5DC59 (visite_id), INDEX IDX_D021EABC91EF7EAA (rendez_vous_id), UNIQUE INDEX uniq_visite_rdv (visite_id, rendez_vous_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE historique_action ADD CONSTRAINT FK_8E8E2CCE91EF7EAA FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE historique_action ADD CONSTRAINT FK_8E8E2CCEC1C5DC59 FOREIGN KEY (visite_id) REFERENCES visite (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE notification_interne ADD CONSTRAINT FK_35DB1C2B91EF7EAA FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE notification_interne ADD CONSTRAINT FK_35DB1C2BC1C5DC59 FOREIGN KEY (visite_id) REFERENCES visite (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE personnel ADD CONSTRAINT FK_A6BCF3DE32516FE2 FOREIGN KEY (bureau_id) REFERENCES bureau (id)');
        $this->addSql('ALTER TABLE rendez_vous ADD CONSTRAINT FK_65E8AA0A4F36F0FC FOREIGN KEY (usager_id) REFERENCES usager_visiteur (id)');
        $this->addSql('ALTER TABLE rendez_vous ADD CONSTRAINT FK_65E8AA0A32516FE2 FOREIGN KEY (bureau_id) REFERENCES bureau (id)');
        $this->addSql('ALTER TABLE rendez_vous ADD CONSTRAINT FK_65E8AA0A1C109075 FOREIGN KEY (personnel_id) REFERENCES personnel (id)');
        $this->addSql('ALTER TABLE visite ADD CONSTRAINT FK_B09C8CBB4F36F0FC FOREIGN KEY (usager_id) REFERENCES usager_visiteur (id)');
        $this->addSql('ALTER TABLE visite ADD CONSTRAINT FK_B09C8CBB7C14DF52 FOREIGN KEY (reception_id) REFERENCES reception (id)');
        $this->addSql('ALTER TABLE visite_rendez_vous ADD CONSTRAINT FK_D021EABCC1C5DC59 FOREIGN KEY (visite_id) REFERENCES visite (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE visite_rendez_vous ADD CONSTRAINT FK_D021EABC91EF7EAA FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE historique_action DROP FOREIGN KEY FK_8E8E2CCE91EF7EAA');
        $this->addSql('ALTER TABLE historique_action DROP FOREIGN KEY FK_8E8E2CCEC1C5DC59');
        $this->addSql('ALTER TABLE notification_interne DROP FOREIGN KEY FK_35DB1C2B91EF7EAA');
        $this->addSql('ALTER TABLE notification_interne DROP FOREIGN KEY FK_35DB1C2BC1C5DC59');
        $this->addSql('ALTER TABLE personnel DROP FOREIGN KEY FK_A6BCF3DE32516FE2');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0A4F36F0FC');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0A32516FE2');
        $this->addSql('ALTER TABLE rendez_vous DROP FOREIGN KEY FK_65E8AA0A1C109075');
        $this->addSql('ALTER TABLE visite DROP FOREIGN KEY FK_B09C8CBB4F36F0FC');
        $this->addSql('ALTER TABLE visite DROP FOREIGN KEY FK_B09C8CBB7C14DF52');
        $this->addSql('ALTER TABLE visite_rendez_vous DROP FOREIGN KEY FK_D021EABCC1C5DC59');
        $this->addSql('ALTER TABLE visite_rendez_vous DROP FOREIGN KEY FK_D021EABC91EF7EAA');
        $this->addSql('DROP TABLE bureau');
        $this->addSql('DROP TABLE historique_action');
        $this->addSql('DROP TABLE notification_interne');
        $this->addSql('DROP TABLE personnel');
        $this->addSql('DROP TABLE reception');
        $this->addSql('DROP TABLE rendez_vous');
        $this->addSql('DROP TABLE usager_visiteur');
        $this->addSql('DROP TABLE visite');
        $this->addSql('DROP TABLE visite_rendez_vous');
    }
}
