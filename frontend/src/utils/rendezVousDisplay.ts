import type { RendezVous, StatutRendezVous } from '../types/api';

export function messageFonctionNonDisponible(rdv: RendezVous): string | null {
  if (rdv.statut !== 'DEMANDE' || !rdv.fonctionSouhaitee?.trim()) {
    return null;
  }

  return 'La personne recherchée n’est pas disponible. Cette demande doit être traitée par la réception.';
}

export function labelStatutRdv(statut: StatutRendezVous): string {
  return statut;
}
