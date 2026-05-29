# Notes développement — Backend

## Optimisations performance

- **Créneaux** : 1 requête SQL pour tous les créneaux occupés du bureau (au lieu de ~16 requêtes).
- **Doctrine dev** : cache métadonnées/requêtes, `profiling_collect_backtrace` désactivé.
- **Index** : `(bureau_id, date, statut)`, `(personnel_id, date, heure_debut)`, `(usager_id, created_at)` sur visite.
- **Eager loading** : `findByReference`, `findOneWithRelations` évitent le N+1.
- **Notifications** : limitées à 50 ; recherche RDV limitée à 50.

## Corrections métier (dev)

- Transaction sur création RDV et ouverture visite.
- Vérification créneau réellement libre à la création.
- Annulation : téléphone obligatoire dans le body JSON.
- Personnel : routes `/{personnelId}/rendez-vous/{id}/demarrer|cloturer` + vérif assignation.
- Prise en charge : uniquement après statut `ARRIVE`.
- Une seule visite non clôturée par usager et par jour.
- Décision `REPORTER` → RDV liés passent en `REPORTE`.
- Références plus longues (8 octets aléatoires).
- Erreurs API toujours en JSON (`ApiExceptionSubscriber`).

## Postman

Réimporter `postman/Atelier-API.postman_collection.json` après mise à jour.

## Scripts

- `scripts/test-http-rdv.php` — smoke test POST demande usager (`dateSouhaitee`, sans `heureDebut`).
