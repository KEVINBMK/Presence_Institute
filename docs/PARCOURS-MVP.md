# Parcours MVP — Atelier (C2I)

Application institutionnelle de gestion des rendez-vous et des visites.  
**Ce n’est pas** un SaaS, un CRM, une application RH, médicale ou de paiement.

**Principe central :** la réception reste le centre de contrôle. Le système ne fait jamais circuler automatiquement l’usager.

---

## Parcours institutionnel

```
Demande usager
  → Attribution créneau par le système (module Planification)
  → Arrivée à la réception
  → Ouverture visite
  → Orientation
  → Prise en charge personnel
  → Notification réception
  → Décision réception
  → Historique (traçabilité)
```

---

## Cinq modules métier

| # | Module | Rôle |
|---|--------|------|
| 1 | **Usager & demande de RDV** | Soumettre une demande (bureau, motif, date / période) — **sans choisir l’heure finale** |
| 2 | **Planification** | Vérifier horaires, conflits, disponibilité personnel → `CONFIRME` ou `DEMANDE` |
| 3 | **Réception & visite** | Recherche, arrivée, visite, orientation, notifications, décision |
| 4 | **Personnel & prise en charge** | RDV assignés, démarrer / clôturer, notifier — **ne décide pas de la suite** |
| 5 | **Suivi & historique** | Traces des actions (création, visite, orientation, prise en charge, décision, clôture) |

### Modules ↔ interfaces

Le MVP possède **5 modules métier**, mais seulement **3 interfaces visibles** : Usager, Réception et Personnel.  
Les modules **Planification** et **Suivi** sont principalement portés par le **backend**.

| Module métier | Interface / couche |
|---------------|-------------------|
| 1. Usager & demande de RDV | Interface **Usager** + `RendezVousService` |
| 2. Planification | Backend : `CreneauService` + `RendezVousService` |
| 3. Réception & visite | Interface **Réception** + `ReceptionService` |
| 4. Personnel & prise en charge | Interface **Personnel** + `PersonnelService` |
| 5. Suivi & historique | `HistoriqueService` + `NotificationService` + interface Réception |

---

## User Story Mapping officiel

### Module 1 — Usager & demande de rendez-vous

**User story principale :** En tant qu’usager, je veux soumettre une demande de rendez-vous afin d’être reçu par le bureau concerné sans accéder au système interne.

- En tant qu’usager, je veux renseigner mon identité afin que la réception puisse m’identifier.
- En tant qu’usager, je veux choisir le bureau concerné afin d’adresser ma demande au bon service.
- En tant qu’usager, je veux indiquer une date ou période souhaitée afin que le système puisse planifier mon rendez-vous.
- En tant qu’usager, je veux recevoir une référence afin de suivre ou présenter mon rendez-vous à la réception.

**Règle :** l’usager ne choisit pas l’heure finale. Le système attribue le créneau.

### Module 2 — Planification des rendez-vous

**User story principale :** En tant que système, je dois attribuer un créneau disponible afin d’éviter les conflits et de respecter les horaires des bureaux.

- Vérifier les horaires du bureau.
- Éviter les chevauchements de rendez-vous.
- Vérifier la disponibilité opérationnelle du personnel.
- Confirmer le rendez-vous si un créneau est disponible (`CONFIRME`).
- Garder la demande en statut `DEMANDE` si aucun créneau n’est disponible.

### Module 3 — Réception & gestion de la visite

**User story principale :** En tant qu’agent de réception, je veux contrôler l’arrivée et la suite de la visite afin d’éviter une circulation automatique de l’usager.

- Rechercher un usager (téléphone, nom, référence).
- Enregistrer l’arrivée.
- Ouvrir une visite.
- Voir les rendez-vous liés du jour.
- Orienter l’usager.
- Recevoir les notifications du personnel.
- Décider de la suite : continuer, attendre, reporter, réorienter ou clôturer.

### Module 4 — Personnel & prise en charge

**User story principale :** En tant que personnel, je veux prendre en charge un usager puis notifier la réception afin qu’elle décide de la suite.

- Voir mes rendez-vous assignés.
- Signaler ma disponibilité opérationnelle.
- Démarrer une prise en charge.
- Clôturer une prise en charge.
- Notifier la réception après clôture.
- Signaler que je ne peux pas recevoir un usager à ce moment-là.

**Règle :** le personnel ne décide pas de la suite de la visite.

### Module 5 — Suivi, historique & administration simple

**User story principale :** En tant que responsable ou réception, je veux consulter l’historique afin de garder une traçabilité claire des actions.

- Enregistrer les actions importantes (système).
- Consulter l’historique d’une visite (réception).
- Conserver les statuts des rendez-vous.
- Gérer les bureaux et personnels de démonstration (fixtures / admin simple).

---

## Limites MVP (à documenter en soutenance)

### Statut DEMANDE

Le statut **DEMANDE** signifie qu’**aucun créneau n’a encore été attribué**. La demande reste à traiter par la réception, hors parcours automatique de planification côté usager.

> Amélioration future : écran « Planifier une DEMANDE » — **non inclus dans ce MVP**.

### Pas d’authentification

Les espaces **Usager**, **Réception** et **Personnel** sont regroupés dans la même application pour faciliter la **démonstration**.

> En version réelle, l’accès serait séparé par authentification et rôles.

### Interface Personnel sans login

Le **choix du personnel** dans l’interface simule l’utilisateur connecté dans le cadre du MVP (10 agents de démonstration).

---

## Scénario de démo conseillé (5 min)

1. **Usager** — Soumission d’une demande → `CONFIRME` (créneau attribué).
2. **Réception** — Recherche `0890000002` → visite active + rendez-vous restants (même bureau, 3 personnels).
3. **Personnel** — Choisir Patrick Tshimanga → démarrer / clôturer → notification.
4. **Réception** — Notifications → décision de la suite.
5. **Optionnel** — `0890000003` : personnel non disponible pour réception.

---

## Hors périmètre MVP (ne pas ajouter maintenant)

- Authentification complète
- Écran complet de planification `DEMANDE`
- Gros module admin / RH / SaaS / CRM
- Nouveau parcours automatique usager entre personnels
