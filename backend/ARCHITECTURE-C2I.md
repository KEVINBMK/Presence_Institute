# Architecture — Application web institutionnelle (C2I / Ministère du Budget)

## Plan d’implémentation (étapes courtes)

| Étape | Contenu | Statut |
|-------|---------|--------|
| 1 | Architecture Symfony + dossiers (`Entity`, `Service`, `Controller/Api`, `Enum`, `DTO`, `DataFixtures`) | Fait |
| 2 | Entités métier + enums + relations Doctrine | **En cours** |
| 3 | Migrations MySQL + index + clés étrangères | Étape 3 |
| 4 | Fixtures institutionnelles C2I | Étape 4 |
| 5 | Services métier (règles réception / personnel) | Déjà partiellement fait |
| 6 | API REST + Postman | Déjà fait |
| 7 | Frontend React (3 portails) | À venir |

## Schéma des relations

```
UsagerVisiteur ──1,N──> RendezVous ──N,1──> Bureau
       │                    │
       │                    └──N,1──> Personnel
       │
       └──1,N──> Visite ──N,1──> Reception
                    │
                    └──N,N──> RendezVous (via VisiteRendezVous)
```

## Règle métier centrale

La **réception / secrétariat** (entité `Reception`) contrôle l’entrée physique.  
Le **personnel** clôture et notifie ; il ne décide pas de la suite.  
L’**usager** ne circule pas automatiquement entre bureaux.

## Règle de planification institutionnelle

L’usager soumet une **demande** (bureau, motif, date / période souhaitée). Le **système** attribue le premier créneau disponible (horaires bureau, chevauchements, personnel opérationnel). L’usager ne choisit pas librement `heureDebut` / `heureFin`. Sans créneau : statut `DEMANDE` ; avec créneau : `CONFIRME`.

## Fichiers par couche

| Couche | Rôle |
|--------|------|
| `Entity/` | Tables MySQL (usager, bureau, personnel, rendez-vous, visite, réception, liaison, historique, notification) |
| `Enum/` | Statuts RDV, visite, disponibilité, type usager |
| `Repository/` | Requêtes optimisées (jour, créneaux, recherche) |
| `Service/` | Règles métier (jamais dans les controllers) |
| `Controller/Api/` | Routes REST JSON |
| `DataFixtures/` | Jeu de test C2I |
