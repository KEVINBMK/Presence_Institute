import type { DisponibilitePersonnel, StatutRendezVous, StatutVisite } from '../types/api';

export const STATUT_RDV_LABELS: Record<StatutRendezVous, string> = {
  DEMANDE: 'DEMANDE',
  CONFIRME: 'CONFIRMÉ',
  ARRIVE: 'ARRIVÉ',
  EN_COURS: 'EN COURS',
  TERMINE: 'TERMINÉ',
  REPORTE: 'REPORTÉ',
  ANNULE: 'ANNULÉ',
  NON_PRESENTE: 'NON PRÉSENTÉ',
};

export const STATUT_VISITE_LABELS: Record<StatutVisite, string> = {
  OUVERTE: 'OUVERTE',
  EN_ATTENTE: 'EN ATTENTE',
  ORIENTEE: 'ORIENTÉE',
  EN_COURS: 'EN COURS',
  TERMINEE: 'CLÔTURÉE',
  SUSPENDUE: 'SUSPENDUE',
};

export const DISPONIBILITE_LABELS: Record<DisponibilitePersonnel, string> = {
  DISPONIBLE: 'Disponible',
  OCCUPE: 'Occupé',
  NON_DISPONIBLE_POUR_RECEPTION: 'Non disponible pour réception',
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
