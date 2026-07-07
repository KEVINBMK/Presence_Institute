# Atelier — Gestion rendez-vous (C2I)

Application institutionnelle : **demande** de RDV (planification automatique), réception, personnel, décision réception. L’usager ne choisit pas librement son créneau final.

## Cloner le dépôt

```powershell
git clone https://github.com/KEVINBMK/Presence_Institute.git
cd Presence_Institute
```

Les fichiers **`.env.local`**, **`backend/.env`** et **`frontend/.env`** ne sont pas versionnés (secrets locaux). Utilisez les fichiers **`.env.example`** / **`.env.local.example`**.

## Démarrage rapide

1. **MySQL** — voir [backend/SETUP-MYSQL.md](backend/SETUP-MYSQL.md)
2. **Secrets locaux** (obligatoire) :

```powershell
cd backend
copy .env.example .env
copy .env.local.example .env.local
cd ..\frontend
copy .env.example .env
```

Éditer `backend/.env.local` : remplacer `<YOUR_PASSWORD>` par votre mot de passe MySQL. **Ne jamais commiter** `.env.local`, `.env` ni `frontend/.env`.

3. **Backend** :

```powershell
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console doctrine:fixtures:load --group=demo --no-interaction
php -S 127.0.0.1:8000 -t public
```

> **Important — tables vides ?** Les rendez-vous du jeu DEMO sont datés du **jour où les fixtures sont chargées** (`today`). Si les fixtures ont été chargées un autre jour, l'écran Réception « Rendez-vous du jour » sera vide. **Rechargez les fixtures le jour de la démonstration** avec la commande `doctrine:fixtures:load --group=demo` ci-dessus (attention : cela purge et recrée les données).

4. **Tests** — [backend/MVP-DEMO.md](backend/MVP-DEMO.md) et dossier Postman **Scénario DEMO — Données fixtures A–F**.

## Documentation

| Fichier | Contenu |
|---------|---------|
| [`docs/PARCOURS-MVP.md`](docs/PARCOURS-MVP.md) | **Parcours MVP**, 5 modules métier, User Story Mapping, limites |
| `backend/SETUP-MYSQL.md` | MySQL, `.env.local`, sécurité des secrets |
| `backend/MVP-DEMO.md` | Soutenance, scénarios A–F |
| `backend/DATA-FIXTURES.md` | Jeux `demo` / `volume` |
| `postman/` | Collection et environnement API |

## Frontend React

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Voir [frontend/README.md](frontend/README.md).

## Partage du projet (ZIP, Git)

- **Inclure** : code, `.env.local.example`, documentation, Postman.
- **Exclure** : `backend/.env.local`, `vendor/`, `var/`, `node_modules/`.
