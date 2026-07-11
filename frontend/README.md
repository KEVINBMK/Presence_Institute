# Frontend — Atelier rendez-vous

Interface React (Vite + TypeScript + Tailwind) pour l’usager public, la réception et le personnel.

## Démarrage

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

En développement, le proxy Vite redirige `/api` vers `http://127.0.0.1:8000` (cookies de session).

## Routes

| Route | Accès |
|-------|--------|
| `/` | Public — accueil |
| `/usager` | Public — demande de rendez-vous |
| `/suivi-rendez-vous` | Public — suivi référence + téléphone |
| `/connexion` | Public — connexion personnel |
| `/reception` | Rôle RECEPTION |
| `/personnel` | Rôle PERSONNEL |

Le MVP utilise une **authentification simulée par session** afin de séparer les espaces Réception et Personnel. Cette couche pourra être remplacée par une authentification de production sans modifier les principales règles métier.

Comptes de démonstration : voir [`docs/COMPTES-DEMO.md`](../docs/COMPTES-DEMO.md).

## Build

```powershell
npm run build
```
