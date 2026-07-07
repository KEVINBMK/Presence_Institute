# Frontend Atelier — React + Vite

Interfaces **Usager**, **Réception** et **Personnel** (MVP institutionnel).

## Démarrage

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Ouvrir http://127.0.0.1:5173 — API Symfony sur http://127.0.0.1:8000.

## Tests

```powershell
npm test          # exécution unique (Vitest)
npm run test:watch
```

## Étape actuelle

- **Fait** : 3 écrans branchés sur l’API (Usager, Réception, Personnel) + écran « Suivre mon rendez-vous » par référence.
- **Fait** : bandeau « Prochaine action » (Réception), microcopy alignée MVP — voir [`docs/PARCOURS-MVP.md`](../docs/PARCOURS-MVP.md).
- **Fait** : toasts de succès/erreur (`ToastProvider`), skeletons de chargement, actualisation automatique de l’écran Réception (30 s), notifications « Marquer comme lu / traité ».
- Mode **démonstration** : pas d’authentification ; le sélecteur Personnel simule l’utilisateur connecté.
- Anciens mocks / `TimeSlotPicker` : archivés dans `src/_legacy/` (non utilisés).

## Structure

Voir rapport dans la documentation projet ou `src/` :

- `components/` — UI réutilisable
- `features/` — pages par rôle
- `api/` — clients HTTP (`bureaux`, `rendezVous`, `reception`, `personnel`, …)
