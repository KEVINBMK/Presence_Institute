# Scénarios Postman — Atelier

## Prérequis

```powershell
cd backend
php bin/console doctrine:fixtures:load --group=demo --no-interaction
php -S 127.0.0.1:8000 -t public
```

Importer dans Postman :
- `Atelier-API.postman_collection.json`
- `Atelier-local.postman_environment.json`

---

## Scénarios disponibles

| Dossier | Objectif |
|---------|----------|
| **Soumission demande usager** | POST demande — planification auto (`CONFIRME` ou `DEMANDE`) |
| **Scénario 1** | Usager : bureaux → soumettre demande → consulter |
| **Scénario 2** | Réception : arrivée → visite → orientation |
| **Scénario 3** | Personnel : démarrer → clôturer → notification |
| **Scénario 4** | Réception : décisions → historique → clôture visite |
| **Scénario 5 — COMPLET** | Parcours dynamique (1→4) |
| **Scénario 6** | Usager annule un RDV |
| **Scénario DEMO — Données fixtures A–F (prioritaire)** | Soutenance (après `--group=demo`) |
| **Volume / recherche** | Après fixtures volume |

---

## Lancer avec Collection Runner

**Soutenance :** clic droit sur **Scénario DEMO — Données fixtures A–F (prioritaire)** → **Run folder**

1. Environnement : **Atelier — Local**
2. **Delay** : 200 ms (recommandé)
3. **Run**

---

## Variables automatiques

| Variable | Remplie par |
|----------|-------------|
| `today` | Scripts pré-requête |
| `uniquePhone` | Téléphone unique (évite limite 3 RDV/jour) |
| `bureauId` | Liste bureaux |
| `rdvId`, `reference`, `usagerId`, `personnelId` | Création RDV |
| `visiteId` | Ouverture visite |
| `notificationId` | Liste notifications |

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Could not send | API arrêtée → `php -S 127.0.0.1:8000 -t public` |
| Nombre maximum de RDV | Nouveau `uniquePhone` (scénario 1 ou 5) |
| DEMO rouge | `doctrine:fixtures:load --group=demo` |
| C.2 personnel | C.1 enregistre `personnelId` depuis RDV-2026-000004 |
