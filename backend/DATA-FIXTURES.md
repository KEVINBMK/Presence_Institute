# Données de test — Atelier C2I

> Prérequis : `backend/.env.local` configuré (voir `SETUP-MYSQL.md`). Ne pas partager ce fichier.

## Planification (règle MVP)

L’usager **ne choisit pas** le créneau final via l’API : il soumet une demande (`POST /api/rendez-vous`).  
Les scénarios **DEMO A–F** chargent des RDV **déjà planifiés** (créneaux fixés en fixtures) pour la soutenance réception / personnel.

## Groupes Doctrine

| Commande | Contenu |
|----------|---------|
| `php bin/console doctrine:fixtures:load --group=demo --no-interaction` | Structure (6 bureaux, 10 personnels) + scénarios A–F |
| `php bin/console doctrine:fixtures:load --group=demo --group=volume --no-interaction` | DEMO + volume (~1000 lignes utiles) |

## Bureaux MVP (6)

1. Bureau Secrétariat  
2. Bureau Génie Logiciel  
3. Bureau Administration Système  
4. Bureau Maintenance Réseau  
5. Bureau Assistance aux utilisateurs  
6. Bureau Sécurité  

## Personnels de démonstration (10)

| # | Nom | Fonction | Bureau |
|---|-----|----------|--------|
| 1 | Jean Kabila | Agent de secrétariat | Secrétariat |
| 2 | Grâce Mbala | Chef de bureau | Secrétariat |
| 3 | Marie Ilunga | Développeuse | Génie Logiciel |
| 4 | Patrick Tshimanga | Analyste logiciel | Génie Logiciel |
| 5 | David Mutombo | Chef de projet logiciel | Génie Logiciel |
| 6 | Alain Kabongo | Administrateur système | Administration Système |
| 7 | Chantal Mbuyi | Assistante technique | Administration Système |
| 8 | Junior Kalala | Technicien réseau | Maintenance Réseau |
| 9 | Sarah Mavungu | Assistante utilisateurs | Assistance aux utilisateurs |
| 10 | Héritier Lukusa | Agent sécurité informatique | Sécurité |

## Téléphones scénarios (DEMO)

| Variable Postman | Téléphone | Scénario |
|------------------|-----------|----------|
| usagerTelScenarioA | 0890000001 | Parcours complet |
| usagerTelScenarioB | 0890000002 | 3 RDV même jour — **même bureau Génie Logiciel** |
| usagerTelScenarioC | 0890000003 | Personnel non disponible |
| usagerTelScenarioD | 0890000004 | Retard |
| usagerTelScenarioE | 0890000005 | Non présenté |
| usagerTelScenarioF | 0890000006 | Annulation |

## Références DEMO (RDV)

| Scénario | RDV | Visite |
|----------|-----|--------|
| A | RDV-2026-000001 | VIS-2026-000001 |
| B | 000002, 000003, 000004 (Génie Logiciel) | VIS-2026-000002 |
| C | RDV-2026-000005 | VIS-2026-000003 |
| D | RDV-2026-000006 | VIS-2026-000004 |
| E | RDV-2026-000007 | — |
| F | RDV-2026-000008 | — |

Le volume continue la numérotation à partir de 9.

## Scénario B — plusieurs RDV même bureau

- Usager : **Kabongo Marie** — `0890000002`  
- Bureau : **Bureau Génie Logiciel** (les 3 RDV)  
- RDV-2026-000002 — Marie Ilunga — **TERMINE** (prise en charge clôturée, notification réception)  
- RDV-2026-000003 — Patrick Tshimanga — **ARRIVE**  
- RDV-2026-000004 — David Mutombo — **CONFIRME**  
- Visite : **EN_COURS** — la réception décide de la suite (pas de passage automatique)

## Règles appliquées

- Créneaux : chevauchement `[heureDebut, heureFin[` par personnel.
- Une seule visite non terminée par usager et par jour.
- Historiques / notifications issus d’événements métier (`FixtureEventRecorder`).
- Disponibilité : `disponibiliteOperationnelle` + `motifNonReception` uniquement (hors RH).
