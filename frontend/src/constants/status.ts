import type { DisponibilitePersonnel, StatutRendezVous, StatutVisite } from '../types/api';

export const STATUT_RDV_LABELS: Record<StatutRendezVous, string> = {
  DEMANDE: 'Demande à traiter',
  CONFIRME: 'Prévu',
  ARRIVE: 'Arrivé',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  REPORTE: 'Reporté',
  ANNULE: 'Annulé',
  NON_PRESENTE: 'Non présenté',
};

export const STATUT_VISITE_LABELS: Record<StatutVisite, string> = {
  OUVERTE: 'Visite ouverte',
  EN_ATTENTE: 'En attente',
  ORIENTEE: 'Orientée',
  EN_COURS: 'En cours',
  TERMINEE: 'Clôturée',
  SUSPENDUE: 'Suspendue',
};

export const DISPONIBILITE_LABELS: Record<DisponibilitePersonnel, string> = {
  DISPONIBLE: 'Disponible',
  OCCUPE: 'Occupé',
  NON_DISPONIBLE_POUR_RECEPTION: 'Ne peut pas recevoir maintenant',
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
