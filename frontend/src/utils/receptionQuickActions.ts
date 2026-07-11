import type { RendezVous, StatutRendezVous, Visite } from '../types/api';
import { toLocalDateString } from './format';

export type QuickActionId =
  | 'enregistrer_arrivee'
  | 'ouvrir_visite'
  | 'orienter'
  | 'attendre'
  | 'cloturer'
  | 'reporter'
  | 'reorienter'
  | 'marquer_absent'
  | 'decider_suite'
  | 'voir_message';

export interface QuickActionButton {
  id: QuickActionId;
  label: string;
  variant: 'primary' | 'secondary';
}

export interface ReceptionQuickActionContext {
  rdv: RendezVous;
  visiteActive: Visite | null;
  isRdvDuJour: boolean;
  hasDossierNotifications: boolean;
  visiteMatchesRdv: boolean;
}

export function statutRdvHumain(statut: StatutRendezVous, hasDossierNotifications = false): string {
  switch (statut) {
    case 'DEMANDE':
      return 'À planifier';
    case 'CONFIRME':
      return 'Confirmé';
    case 'ARRIVE':
      return 'Arrivée enregistrée';
    case 'EN_COURS':
      return 'En entretien';
    case 'TERMINE':
      return hasDossierNotifications ? 'Entretien terminé, décision attendue' : 'Entretien terminé';
    case 'REPORTE':
      return 'Reporté';
    case 'ANNULE':
      return 'Annulé';
    case 'NON_PRESENTE':
      return 'Absent';
    default:
      return statut;
  }
}

export function prochaineActionLabel(ctx: ReceptionQuickActionContext): string {
  const { rdv, visiteActive, isRdvDuJour, hasDossierNotifications, visiteMatchesRdv } = ctx;

  if (ctx.visiteActive?.statut === 'TERMINEE') {
    return 'Visite clôturée';
  }

  switch (rdv.statut) {
    case 'DEMANDE':
      return 'Planifier ou traiter la demande';
    case 'CONFIRME':
      return isRdvDuJour ? 'Enregistrer l’arrivée' : 'Arrivée le jour du rendez-vous';
    case 'ARRIVE':
      return visiteMatchesRdv && visiteActive ? 'Orienter l’usager' : 'Ouvrir la visite';
    case 'EN_COURS':
      return 'Attendre la fin de prise en charge';
    case 'TERMINE':
      return hasDossierNotifications ? 'Décider de la suite' : 'Clôturer ou archiver';
    default:
      return 'Consulter le dossier';
  }
}

export function getPrimaryAction(ctx: ReceptionQuickActionContext): QuickActionButton | null {
  return getQuickActions(ctx).find((a) => a.variant === 'primary') ?? null;
}

export function getSecondaryActions(ctx: ReceptionQuickActionContext): QuickActionButton[] {
  return getQuickActions(ctx).filter((a) => a.variant === 'secondary');
}

export function getQuickActions(ctx: ReceptionQuickActionContext): QuickActionButton[] {
  const { rdv, visiteActive, isRdvDuJour, hasDossierNotifications, visiteMatchesRdv } = ctx;

  if (visiteActive?.statut === 'TERMINEE') {
    return [];
  }

  const actions: QuickActionButton[] = [];

  switch (rdv.statut) {
    case 'CONFIRME':
      if (isRdvDuJour) {
        actions.push({ id: 'enregistrer_arrivee', label: 'Enregistrer l’arrivée', variant: 'primary' });
        actions.push({ id: 'marquer_absent', label: 'Marquer absent', variant: 'secondary' });
        actions.push({ id: 'reporter', label: 'Reporter', variant: 'secondary' });
      }
      break;

    case 'ARRIVE':
      if (!visiteMatchesRdv || !visiteActive) {
        actions.push({ id: 'ouvrir_visite', label: 'Ouvrir la visite', variant: 'primary' });
      } else if (rdv.personnel?.id) {
        actions.push({ id: 'orienter', label: 'Orienter vers l’agent', variant: 'primary' });
      }
      actions.push({ id: 'reporter', label: 'Reporter', variant: 'secondary' });
      break;

    case 'TERMINE':
      if (hasDossierNotifications && visiteMatchesRdv && visiteActive) {
        actions.push({ id: 'decider_suite', label: 'Décider de la suite', variant: 'primary' });
        actions.push({ id: 'voir_message', label: 'Voir le message', variant: 'secondary' });
      }
      if (visiteMatchesRdv && visiteActive) {
        actions.push({ id: 'cloturer', label: 'Clôturer la visite', variant: 'secondary' });
      }
      break;

    default:
      break;
  }

  return actions;
}

export function isRdvToday(rdv: RendezVous): boolean {
  return rdv.dateRendezVous === toLocalDateString();
}
