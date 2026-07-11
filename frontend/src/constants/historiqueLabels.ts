/** Libellés humains pour l’historique (jamais d’underscores à l’écran). */
export const TYPE_ACTION_LABELS: Record<string, string> = {
  RENDEZ_VOUS_CREE: 'Demande créée',
  RENDEZ_VOUS_CONFIRME: 'Rendez-vous confirmé',
  RENDEZ_VOUS_REPORTE: 'Rendez-vous reporté',
  RENDEZ_VOUS_ANNULE: 'Rendez-vous annulé',
  USAGER_NON_PRESENTE: 'Usager absent',
  ARRIVEE_ENREGISTREE: 'Arrivée enregistrée',
  VISITE_OUVERTE: 'Visite ouverte',
  ORIENTATION_EFFECTUEE: 'Orientation effectuée',
  PRISE_EN_CHARGE_DEMARREE: 'Prise en charge démarrée',
  PRISE_EN_CHARGE_CLOTUREE: 'Prise en charge terminée',
  NOTIFICATION_RECEPTION: 'Message à la réception',
  DECISION_RECEPTION: 'Décision de la réception',
  VISITE_CLOTUREE: 'Visite clôturée',
  PERSONNEL_NON_DISPONIBLE: 'Personnel indisponible',
  DISPONIBILITE_OPERATIONNELLE_CHANGEE: 'Disponibilité mise à jour',
};

export function labelTypeAction(typeAction: string): string {
  return TYPE_ACTION_LABELS[typeAction] ?? typeAction;
}
