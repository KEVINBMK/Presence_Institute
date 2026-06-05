import type { RendezVous, StatutRendezVous, Visite } from '../types/api';
import { toLocalDateString } from './format';

export type QuickActionId =
  | 'voir_demande'
  | 'marquer_a_traiter'
  | 'enregistrer_arrivee'
  | 'ouvrir_visite'
  | 'orienter'
  | 'attendre_personnel'
  | 'voir_message'
  | 'decider_suite'
  | 'attendre'
  | 'cloturer'
  | 'reporter'
  | 'reorienter'
  | 'voir_detail';

export interface QuickActionButton {
  id: QuickActionId;
  label: string;
  variant: 'primary' | 'secondary';
}

export interface ReceptionQuickActionContext {
  rdv: RendezVous;
  visiteActive: Visite | null;
  isRdvDuJour: boolean;
  hasPendingNotifications: boolean;
}

export function statutRdvHumain(statut: StatutRendezVous, hasPendingNotifications = false): string {
  switch (statut) {
    case 'DEMANDE':
      return 'Demande à traiter';
    case 'CONFIRME':
      return 'Prévu';
    case 'ARRIVE':
      return 'Arrivé';
    case 'EN_COURS':
      return 'En cours';
    case 'TERMINE':
      return hasPendingNotifications ? 'Terminé — décision attendue' : 'Terminé';
    case 'REPORTE':
      return 'Reporté';
    case 'ANNULE':
      return 'Annulé';
    case 'NON_PRESENTE':
      return 'Non présenté';
    default:
      return statut;
  }
}

export function prochaineActionLabel(ctx: ReceptionQuickActionContext): string {
  const { rdv, visiteActive, isRdvDuJour, hasPendingNotifications } = ctx;

  if (visiteActive && rdv.statut === 'ARRIVE') {
    return 'Orienter l’usager';
  }

  switch (rdv.statut) {
    case 'DEMANDE':
      return 'Demande à traiter';
    case 'CONFIRME':
      return isRdvDuJour ? 'Enregistrer l’arrivée' : 'Arrivée le jour du rendez-vous';
    case 'ARRIVE':
      return visiteActive ? 'Orienter l’usager' : 'Ouvrir la visite';
    case 'EN_COURS':
      return 'Attendre la fin de prise en charge';
    case 'TERMINE':
      return hasPendingNotifications ? 'Décider de la suite' : 'Voir le détail';
    case 'ANNULE':
    case 'NON_PRESENTE':
    case 'REPORTE':
      return 'Voir le détail';
    default:
      return 'Voir le détail';
  }
}

export function getQuickActions(ctx: ReceptionQuickActionContext): QuickActionButton[] {
  const { rdv, visiteActive, isRdvDuJour, hasPendingNotifications } = ctx;
  const actions: QuickActionButton[] = [];

  switch (rdv.statut) {
    case 'DEMANDE':
      actions.push({ id: 'voir_demande', label: 'Voir la demande', variant: 'primary' });
      actions.push({ id: 'marquer_a_traiter', label: 'Marquer à traiter', variant: 'secondary' });
      break;

    case 'CONFIRME':
      if (isRdvDuJour) {
        actions.push({ id: 'enregistrer_arrivee', label: 'Enregistrer l’arrivée', variant: 'primary' });
      } else {
        actions.push({ id: 'voir_detail', label: 'Voir le détail', variant: 'primary' });
      }
      break;

    case 'ARRIVE':
      if (!visiteActive) {
        actions.push({ id: 'ouvrir_visite', label: 'Ouvrir la visite', variant: 'primary' });
      }
      if (visiteActive && rdv.personnel?.id) {
        actions.push({ id: 'orienter', label: 'Orienter', variant: 'primary' });
      }
      break;

    case 'EN_COURS':
      actions.push({ id: 'attendre_personnel', label: 'En attente du personnel', variant: 'secondary' });
      break;

    case 'TERMINE':
      if (hasPendingNotifications) {
        actions.push({ id: 'voir_message', label: 'Voir le message', variant: 'secondary' });
      }
      if (visiteActive) {
        actions.push({ id: 'decider_suite', label: 'Décider de la suite', variant: 'primary' });
        actions.push({ id: 'attendre', label: 'Mettre en attente', variant: 'secondary' });
        actions.push({ id: 'cloturer', label: 'Clôturer la visite', variant: 'secondary' });
      } else {
        actions.push({ id: 'voir_detail', label: 'Voir le détail', variant: 'primary' });
      }
      break;

    case 'ANNULE':
    case 'NON_PRESENTE':
    case 'REPORTE':
      actions.push({ id: 'voir_detail', label: 'Voir le détail', variant: 'primary' });
      break;

    default:
      actions.push({ id: 'voir_detail', label: 'Voir le détail', variant: 'primary' });
  }

  return actions.slice(0, 4);
}

export function isRdvToday(rdv: RendezVous): boolean {
  return rdv.dateRendezVous === toLocalDateString();
}
