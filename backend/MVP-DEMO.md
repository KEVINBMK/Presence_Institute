# MVP — Démonstration DEMO (A–F)

Document de référence pour la **soutenance** et les tests **Postman**. Le jeu **demo** est la source de vérité métier ; le volume sert uniquement à la recherche et aux statistiques.

---

## Prérequis

- MySQL configuré via `backend/.env.local` (copie de `.env.local.example`, mot de passe **uniquement** en local — voir `SETUP-MYSQL.md`).

## Commandes à lancer

```powershell
cd backend

# 1. Migrations (une fois)
php bin/console doctrine:migrations:migrate --no-interaction

# 2. Données DEMO uniquement (soutenance)
php bin/console doctrine:fixtures:load --group=demo --no-interaction

# 3. API
php -S 127.0.0.1:8000 -t public
```

Postman : importer `postman/Atelier-API.postman_collection.json` + `postman/Atelier-local.postman_environment.json`, puis **Run** le dossier **Scénario DEMO — Données fixtures A–F**.

Optionnel (volume, non requis pour la soutenance) :

```powershell
php bin/console doctrine:fixtures:load --group=demo --group=volume --no-interaction
```

---

## Ordre exact des tests Postman (dossier DEMO)

| # | Requête Postman | Méthode | Route |
|---|-----------------|---------|-------|
| 1 | A.1 Rechercher usager | GET | `/api/reception/recherche?query=0890000001` |
| 2 | A.2 RDV par référence | GET | `/api/rendez-vous/reference/RDV-2026-000001` |
| 3 | A.3 Historique visite A | GET | `/api/visites/reference/VIS-2026-000001/historique` |
| 4 | B.1 Rechercher 0890000002 | GET | `/api/reception/recherche?query=0890000002` |
| 5 | B.2 Notifications | GET | `/api/reception/notifications` |
| 6 | C.1 Rechercher 0890000003 | GET | `/api/reception/recherche?query=0890000003` |
| 7 | C.2 Disponibilité personnel | PATCH | `/api/personnel/{personnelId}/disponibilite` |
| 8 | D — Retard | GET | `/api/reception/recherche?query=0890000004` |
| 9 | E — Non présenté | GET | `/api/rendez-vous/reference/RDV-2026-000007` |
| 10 | F — Annulation | GET | `/api/rendez-vous/reference/RDV-2026-000008` |

Contrôle rapide avant la démo : `GET http://127.0.0.1:8000/api/bureaux` → HTTP 200.

---

## Scénarios A–F — résultats attendus

| Scénario | Téléphone | RDV (réf.) | Visite | Résultat attendu |
|----------|-----------|------------|--------|------------------|
| **A** Parcours complet | `0890000001` | `RDV-2026-000001` | `VIS-2026-000001` | RDV `TERMINE` ; historique contient `VISITE_OUVERTE`, `PRISE_EN_CHARGE_CLOTUREE`, `NOTIFICATION_RECEPTION`, `VISITE_CLOTUREE` |
| **B** 3 RDV même bureau (Génie) | `0890000002` | `000002`–`000004` | `VIS-2026-000002` | 3 RDV même bureau, personnels distincts ; `000002` `TERMINE` ; `000003` `ARRIVE` ; `000004` `CONFIRME` ; notification `FIN_PRISE_EN_CHARGE` |
| **C** Personnel indisponible | `0890000003` | `RDV-2026-000005` | `VIS-2026-000003` | RDV `ARRIVE` ; visite `EN_ATTENTE` ; PATCH dispo → `NON_DISPONIBLE_POUR_RECEPTION` |
| **D** Retard | `0890000004` | `RDV-2026-000006` | `VIS-2026-000004` | RDV `ARRIVE` ; visite `EN_ATTENTE` ; recherche retourne le RDV du jour |
| **E** Non présenté | `0890000005` | `RDV-2026-000007` | — | RDV `NON_PRESENTE` ; **aucune** visite ouverte |
| **F** Annulation | `0890000006` | `RDV-2026-000008` | — | RDV `ANNULE` ; pas de visite |

---

## Endpoints backend validés (MVP DEMO)

| Domaine | Endpoints |
|---------|-----------|
| Usager / RDV | `POST /api/rendez-vous`, `GET /api/rendez-vous/reference/{ref}`, `PATCH /api/rendez-vous/{id}/annuler` |
| Bureaux / créneaux | `GET /api/bureaux`, `GET /api/bureaux/{id}/creneaux?date=` |
| Réception | `GET /api/reception/recherche`, `GET /api/reception/rendez-vous-du-jour`, `POST .../arrivee`, `POST /api/reception/visites`, `GET/PATCH /api/reception/visites/{id}`, `PATCH .../orienter`, `PATCH .../decision`, `PATCH .../cloturer` |
| Personnel | `GET /api/personnel`, `GET /api/personnel/{id}/rendez-vous`, `PATCH /api/personnel/{id}/disponibilite`, `PATCH .../demarrer`, `PATCH .../cloturer` |
| Notifications | `GET /api/reception/notifications`, `PATCH .../notifications/{id}/lue`, `.../traitee` |
| Historique | `GET /api/visites/{id}/historique`, `GET /api/visites/reference/{ref}/historique` |

---

## Règle de planification institutionnelle

Dans le MVP, **l’usager ne choisit pas librement son créneau final**. Il soumet une demande de rendez-vous en indiquant le bureau concerné, le motif et une **date souhaitée** (et éventuellement une **période** : matin / après-midi). Le système vérifie ensuite les horaires du bureau, les conflits de créneaux et la disponibilité opérationnelle du personnel afin d’attribuer un créneau valide.

- Si un créneau est trouvé → statut **CONFIRME** (`heureDebut`, `heureFin`, `personnel` attribués par le système).
- Sinon → statut **DEMANDE** (à traiter par la réception ; heures éventuellement nulles).

Le jeu **DEMO A–F** représente des rendez-vous **déjà planifiés** par le système (données de démonstration), pas le formulaire usager en direct.

### Statuts par cycle de vie

| Cycle | Statuts |
|-------|---------|
| Planification | `DEMANDE`, `CONFIRME` |
| Accueil | `ARRIVE` |
| Traitement | `EN_COURS`, `TERMINE` |
| Exceptions | `REPORTE`, `ANNULE`, `NON_PRESENTE` |

### POST `/api/rendez-vous` (demande usager)

Corps : `nom`, `prenom`, `telephone`, `email?`, `typeUsager`, `bureauId`, `dateSouhaitee` (alias `date`), `periodeSouhaitee?` (`MATIN` \| `APRES_MIDI`), `motif`.  
**Sans** `heureDebut` côté usager.

`GET /api/bureaux/{id}/creneaux` reste disponible pour la **réception / consultation interne**, pas comme choix final usager.

---

## Limites connues du MVP

1. **Créneaux API en pas de 30 minutes** — La planification automatique utilise des slots de 30 min. Les fixtures peuvent avoir des RDV de 15, 45 ou 60 min ; le blocage en base utilise le chevauchement réel `[debut, fin[`.
2. **Volume = tests statistiques, pas parcours métier parfait** — Le groupe `volume` complète les listes et la pagination ; il ne doit pas être présenté comme un enchaînement métier exemplaire.
3. **Jeu DEMO = référence principale** — Soutenance, Postman et validation fonctionnelle : `--group=demo` + scénarios A–F.
4. **Visite ouverte « aujourd’hui »** — `hasVisiteOuverteAujourdhui` se base sur `createdAt` (jour calendaire), pas sur la date des RDV liés. Amélioration future possible.
5. **Scénario 5 Postman COMPLET** — Parcours dynamique hors fixtures DEMO ; non prioritaire pour la soutenance.

---

## Prêt pour React (après validation DEMO)

| Prêt | Élément |
|------|---------|
| Oui | API JSON stable, CORS, erreurs métier |
| Oui | Jeu DEMO reproductible (`doctrine:fixtures:load --group=demo`) |
| Oui | Contrat champs : `disponibiliteOperationnelle`, `motifNonReception`, types usager |
| Oui | Parcours documenté : demande → réception → personnel → décision réception |
| À faire côté front | Écrans usager (demande RDV), réception, personnel ; consommation des routes ci-dessus |
| Hors MVP front | RH, SaaS, circulation automatique de l’usager |

Ne démarrer le front React qu’après un **Run vert** du dossier Postman DEMO sur une base rechargée avec `--group=demo`.
