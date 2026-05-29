import type { RendezVous, StatutRendezVous, Visite } from '../types/api';

export interface ProchaineAction {
  title: string;
  detail?: string;
}

const RDV_GUIDANCE: Record<StatutRendezVous, ProchaineAction> = {
  DEMANDE: {
    title: 'Demande à planifier par la réception',
    detail:
      'Aucun créneau n’a encore été attribué. La réception pourra traiter cette demande hors parcours automatique.',
  },
  CONFIRME: {
    title: 'Enregistrer l’arrivée de l’usager',
    detail: 'L’usager est attendu. Validez son arrivée avant d’ouvrir la visite.',
  },
  ARRIVE: {
    title: 'Ouvrir la visite ou orienter l’usager',
    detail: 'La visite n’est pas encore ouverte ou doit être reliée à ce rendez-vous.',
  },
  EN_COURS: {
    title: 'En attente de clôture par le personnel',
    detail: 'Le personnel doit clôturer la prise en charge et notifier la réception.',
  },
  TERMINE: {
    title: 'Traiter la notification et décider de la suite',
    detail:
      'Consultez les rendez-vous restants éventuels, puis décidez : continuer, attendre, reporter ou clôturer.',
  },
  REPORTE: {
    title: 'Rendez-vous à reprogrammer',
    detail: 'La réception gère le report hors attribution automatique d’un nouveau créneau.',
  },
  ANNULE: {
    title: 'Rendez-vous annulé',
    detail: 'Aucune action d’accueil requise pour ce rendez-vous.',
  },
  NON_PRESENTE: {
    title: 'Aucune visite ouverte pour ce rendez-vous',
    detail: 'Usager non présenté — pas de suite d’accueil sur ce créneau.',
  },
};

export function getProchaineAction(
  selectedRdv: RendezVous | null,
  visiteActive: Visite | null,
  hasPendingNotifications = false,
): ProchaineAction {
  if (!selectedRdv) {
    if (visiteActive) {
      return {
        title: 'Visite en cours — sélectionnez un rendez-vous lié',
        detail: 'La réception pilote la suite : orientation et décision.',
      };
    }
    return {
      title: 'Sélectionnez un rendez-vous dans la liste',
      detail: 'La réception reste le centre de contrôle du parcours.',
    };
  }

  if (selectedRdv.statut === 'TERMINE' && hasPendingNotifications && visiteActive) {
    return {
      title: 'Traiter la notification et décider de la suite',
      detail:
        'Une prise en charge vient d’être clôturée. Vérifiez les rendez-vous restants avant de continuer.',
    };
  }

  return RDV_GUIDANCE[selectedRdv.statut];
}
