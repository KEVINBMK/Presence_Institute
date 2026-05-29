# Configuration MySQL — Atelier rendez-vous

## 1. Vérifier que MySQL tourne

- **XAMPP** : démarrer le module **MySQL** dans le panneau de contrôle.
- **Laragon** : **Start All**.
- **MySQL seul** : service Windows `MySQL80` (ou équivalent) démarré.

Test rapide : ouvrir **phpMyAdmin** (`http://localhost/phpmyadmin`) ou **HeidiSQL**.

## 2. Créer la base de données

### Option A — phpMyAdmin

1. Onglet **Bases de données**.
2. Nom : `atelier_rendez_vous`.
3. Interclassement : `utf8mb4_unicode_ci`.
4. **Créer**.

### Option B — Ligne de commande (si `mysql` est dans le PATH)

```sql
CREATE DATABASE atelier_rendez_vous CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Option C — Symfony (après avoir configuré `.env.local`)

```powershell
cd backend
php bin/console doctrine:database:create
```

> Doctrine peut créer la base **si** l’utilisateur MySQL a le droit `CREATE DATABASE`.

## 3. Configurer les identifiants Symfony (secrets locaux)

Le **vrai mot de passe MySQL** ne doit figurer **que** dans `backend/.env.local` sur votre machine.

1. Copier le modèle (fichier partageable, sans secret) :

```powershell
cd backend
copy .env.local.example .env.local
```

2. Ouvrir `backend/.env.local` et remplacer `<YOUR_PASSWORD>` par votre mot de passe local dans `DATABASE_URL`.

3. **Ne jamais** committer, zipper ni envoyer `.env.local` (Git, mail, clé USB partagée).

| Situation | Exemple (placeholders) |
|-----------|-------------------------|
| root sans mot de passe (XAMPP classique) | `mysql://root:@127.0.0.1:3306/atelier_rendez_vous?serverVersion=8.0.32&charset=utf8mb4` |
| root avec mot de passe | `mysql://root:<YOUR_PASSWORD>@127.0.0.1:3306/atelier_rendez_vous?serverVersion=8.0.32&charset=utf8mb4` |

**Caractères spéciaux dans le mot de passe** (`?`, `!`, `@`, `#`, `%`, etc.) : les encoder dans l’URL (`?` → `%3F`, `!` → `%21`) et dans le fichier `.env` doubler chaque `%` : `%%3F`, `%%21` (sinon Symfony lit `%3F` comme variable).

**APP_SECRET** : valeur de développement dans `.env.local.example` (`atelier_rdv_dev_secret_change_me`). À changer en production.

> Le fichier `.env` du projet contient des valeurs par défaut sans secret ; **`.env.local` les remplace** localement et est ignoré par Git (voir `.gitignore`).

Si `.env.local` a déjà été ajouté à Git par erreur (ne supprime pas le fichier local) :

```powershell
git rm --cached backend/.env.local
```

## 4. Créer les tables et les données de test

```powershell
cd backend
php bin/console doctrine:migrations:migrate
```

### Jeu DEMO (soutenance / Postman — **recommandé**)

Structure institutionnelle + scénarios **A à F** stables :

```powershell
php bin/console doctrine:fixtures:load --group=demo --no-interaction
```

### Jeu DEMO + volume (recherche, pagination, perfs)

```powershell
php bin/console doctrine:fixtures:load --group=demo --group=volume --no-interaction
```

Ou sans filtre de groupe (charge tout) :

```powershell
php bin/console doctrine:fixtures:load --no-interaction
```

> Le **volume** sert aux listes et statistiques ; le **DEMO** est la source de vérité pour le parcours métier.

### Téléphones scénarios DEMO

| Scénario | Téléphone | Référence RDV |
|----------|-----------|---------------|
| A — Parcours complet | `0890000001` | `RDV-2026-000001` |
| B — 2 RDV même jour | `0890000002` | `000002`, `000003` |
| C — Personnel indisponible | `0890000003` | `RDV-2026-000004` |
| D — Retard | `0890000004` | `RDV-2026-000005` |
| E — Non présenté | `0890000005` | `RDV-2026-000006` |
| F — Annulation | `0890000006` | `RDV-2026-000007` |

Visites DEMO : `VIS-2026-000001` (A), `VIS-2026-000002` (B), `VIS-2026-000003` (C), `VIS-2026-000004` (D).

Voir aussi `backend/DATA-FIXTURES.md` et **`backend/MVP-DEMO.md`** (guide soutenance complet).

## 5. Lancer l’API

```powershell
php -S 127.0.0.1:8000 -t public
```

> Utilisez `127.0.0.1` (et non seulement `localhost`) pour que **Postman** et le navigateur se connectent de la même façon.

Test : `http://127.0.0.1:8000/api/bureaux`

**Attention** : `http://127.0.0.1:8000/` (sans `/api/...`) renvoie **404** — c’est normal, il n’y a pas de page d’accueil.

## 6. Postman

1. **Import** → `postman/Atelier-API.postman_collection.json`
2. **Import** → `postman/Atelier-local.postman_environment.json`
3. Choisir l’environnement **Atelier — Local**
4. **Run** le dossier **Scénario DEMO — Données fixtures A–F** (après fixtures `--group=demo`)

### Endpoints prioritaires (DEMO)

| Ordre | Méthode | Route |
|-------|---------|-------|
| 1 | GET | `/api/reception/recherche?query=0890000001` |
| 2 | GET | `/api/rendez-vous/reference/RDV-2026-000001` |
| 3 | GET | `/api/reception/rendez-vous-du-jour` |
| 4 | GET | `/api/reception/notifications` |
| 5 | PATCH | `/api/personnel/{id}/disponibilite` — corps : `disponibiliteOperationnelle`, `motifNonReception` |
| 6 | GET | `/api/visites/reference/VIS-2026-000001/historique` |

Champs personnel (plus d’anciens noms `disponibilite` / `INDISPONIBLE`) :

```json
{
  "disponibiliteOperationnelle": "NON_DISPONIBLE_POUR_RECEPTION",
  "motifNonReception": "Créneau non disponible"
}
```

## Limites connues du MVP

Voir aussi `MVP-DEMO.md`.

1. **Créneaux API en pas de 30 minutes** — réservation et affichage ; les fixtures DEMO peuvent avoir 15/45/60 min, le blocage BDD utilise le chevauchement réel.
2. **Volume = statistiques / recherche** — pas un parcours métier exemplaire (`--group=volume` optionnel).
3. **Jeu DEMO = référence soutenance** — `--group=demo`, téléphones `0890000001`–`0890000006`, RDV `RDV-2026-000001` à `000007`.
4. **Visite ouverte « aujourd’hui »** — basé sur `createdAt` de la visite, pas la date des RDV (amélioration future).
5. **Scénario 5 Postman COMPLET** — hors fixtures DEMO, non prioritaire pour la soutenance.

## Dépannage

| Erreur | Cause probable | Action |
|--------|----------------|--------|
| `Access denied for user 'root'@'localhost'` | Mauvais mot de passe dans `DATABASE_URL` | Corriger `.env.local` |
| `Connection refused` | MySQL arrêté | Démarrer MySQL (XAMPP/Laragon) |
| `Unknown database` | Base non créée | Créer `atelier_rendez_vous` (étape 2) |
