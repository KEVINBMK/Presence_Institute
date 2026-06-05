import type { RendezVous, StatutRendezVous, Visite } from '../types/api';

export interface ProchaineAction {
  title: string;
  detail?: string;
}

const RDV_GUIDANCE: Record<StatutRendezVous, ProchaineAction> = {
  DEMANDE: {
    title: 'Demande à traiter',
    detail: 'Aucun horaire n’a encore été fixé.',
  },
  CONFIRME: {
    title: 'Enregistrer l’arrivée',
    detail: 'L’usager est attendu aujourd’hui.',
  },
  ARRIVE: {
    title: 'Ouvrir la visite',
    detail: 'Puis orienter l’usager si besoin.',
  },
  EN_COURS: {
    title: 'Attendre la fin de prise en charge',
    detail: 'Le personnel vous préviendra.',
  },
  TERMINE: {
    title: 'Décider de la suite',
    detail: 'Consultez le message reçu si besoin.',
  },
  REPORTE: {
    title: 'Rendez-vous reporté',
    detail: 'À reprogrammer avec l’usager.',
  },
  ANNULE: {
    title: 'Rendez-vous annulé',
    detail: 'Aucune action d’accueil requise.',
  },
  NON_PRESENTE: {
    title: 'Usager non présenté',
    detail: 'Aucune visite à ouvrir.',
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
        title: 'Visite en cours',
        detail: 'Sélectionnez un rendez-vous dans la file pour agir.',
      };
    }
    return {
      title: 'Sélectionnez un rendez-vous',
      detail: 'Cliquez sur une ligne pour voir les actions.',
    };
  }

  if (selectedRdv.statut === 'TERMINE' && hasPendingNotifications && visiteActive) {
    return {
      title: 'Décider de la suite',
      detail: 'Un message du personnel attend votre décision.',
    };
  }

  if (selectedRdv.statut === 'ARRIVE' && visiteActive) {
    return {
      title: 'Orienter l’usager',
      detail: 'La visite est ouverte.',
    };
  }

  return RDV_GUIDANCE[selectedRdv.statut];
}
