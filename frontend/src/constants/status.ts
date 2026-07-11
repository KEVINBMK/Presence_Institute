import type { DisponibilitePersonnel, StatutRendezVous, StatutVisite } from '../types/api';

export const STATUT_RDV_LABELS: Record<StatutRendezVous, string> = {
  DEMANDE: 'À planifier',
  CONFIRME: 'Confirmé',
  ARRIVE: 'Arrivé',
  EN_COURS: 'En entretien',
  TERMINE: 'Entretien terminé',
  REPORTE: 'Reporté',
  ANNULE: 'Annulé',
  NON_PRESENTE: 'Absent',
};

export const STATUT_VISITE_LABELS: Record<StatutVisite, string> = {
  OUVERTE: 'Visite ouverte',
  EN_ATTENTE: 'En attente',
  ORIENTEE: 'Orienté',
  EN_COURS: 'En prise en charge',
  TERMINEE: 'Visite terminée',
  SUSPENDUE: 'Suspendue',
};

export const DISPONIBILITE_LABELS: Record<DisponibilitePersonnel, string> = {
  DISPONIBLE: 'Disponible',
  OCCUPE: 'Occupé',
  NON_DISPONIBLE_POUR_RECEPTION: 'Indisponible pour recevoir',
};

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'copper';

export function statutRdvTone(statut: StatutRendezVous): StatusTone {
  switch (statut) {
    case 'CONFIRME':
      return 'info';
    case 'ARRIVE':
    case 'EN_COURS':
      return 'warning';
    case 'TERMINE':
      return 'success';
    case 'ANNULE':
    case 'NON_PRESENTE':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function statutVisiteTone(statut: StatutVisite): StatusTone {
  switch (statut) {
    case 'EN_COURS':
      return 'warning';
    case 'TERMINEE':
      return 'success';
    case 'EN_ATTENTE':
      return 'copper';
    default:
      return 'neutral';
  }
}
