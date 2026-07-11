# Cinq parcours pour la démonstration (réception)

Connectez-vous avec `reception01` / `1234`, puis rechargez les fixtures le jour de la démo.

```powershell
cd backend
C:\wamp64\bin\php\php8.2.13\php.exe bin/console doctrine:fixtures:load --group=demo --no-interaction
```

Dans l’écran Réception, onglet **Aujourd’hui**, vous devez voir plusieurs usagers réels avec un agent de bureau assigné.

## Parcours 1 — Enregistrer une arrivée

| | |
|--|--|
| Usager | Joseph Kalonji |
| Téléphone | 0890000007 |
| Bureau | Secrétariat |
| Agent | Jean Kabila |
| Statut de départ | Confirmé |

Actions : rechercher `Kalonji` ou `0890000007` → Enregistrer l’arrivée → Ouvrir la visite → Orienter.

## Parcours 2 — Ouvrir une visite

| | |
|--|--|
| Usager | Sarah Mwanza |
| Téléphone | 0890000008 |
| Bureau | Assistance aux utilisateurs |
| Agent | Sarah Mavungu |
| Statut de départ | Arrivée enregistrée |

Actions : sélectionner le dossier → Ouvrir la visite → Orienter vers Sarah Mavungu.

## Parcours 3 — Orienter vers le technicien

| | |
|--|--|
| Usager | Daniel Banza |
| Téléphone | 0890000009 |
| Bureau | Maintenance Réseau |
| Agent | Junior Kalala |
| Statut de départ | Visite déjà ouverte |

Actions : sélectionner → Orienter l’usager vers Junior Kalala.

## Parcours 4 — Décider quand l’agent est indisponible

| | |
|--|--|
| Usager | Paul Ilunga |
| Téléphone | 0890000003 |
| Bureau | Administration Système |
| Agent | Alain Kabongo (indisponible) |
| Statut de départ | Arrivé, visite en attente |

Actions : ouvrir les notifications → Décider de la suite (attendre, reporter ou réorienter).

## Parcours 5 — Continuer une visite multi-rendez-vous

| | |
|--|--|
| Usager | Marie Kabongo |
| Téléphone | 0890000002 |
| Bureau | Génie logiciel |
| Agents | Marie Ilunga, Patrick Tshimanga, David Mutombo |
| Statut de départ | Un RDV terminé, un arrivé, un confirmé |

Actions : sélectionner le RDV de 11 h (Patrick) → Orienter → (compte `patrick`) démarrer puis clôturer → revenir en réception → décider et clôturer la visite.

## Bonus visibles le même jour

- Claudine Ngoy (0890000004) : retard, visite en attente
- Eric Tshiala (0890000005) : marqué absent
- Ruth Kasongo (0890000010) : demain, onglet **À venir** (Sécurité / Héritier Lukusa)

## Comptes agents

Voir [COMPTES-DEMO.md](COMPTES-DEMO.md) : `reception01`, `patrick`, `marie`.
