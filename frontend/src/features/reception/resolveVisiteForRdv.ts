import { fetchVisiteActive } from '../../api/reception';
import type { RendezVous, Visite } from '../../types/api';

const VISITE_TERMINEE = 'TERMINEE';

/** Visite active liée au rendez-vous sélectionné, ou null si aucune correspondance. */
export async function resolveVisiteForRdv(rdv: RendezVous): Promise<Visite | null> {
  const phone = rdv.usager?.telephone?.trim();
  if (!phone) {
    return null;
  }

  const visite = await fetchVisiteActive(phone);
  if (!visite || visite.statut === VISITE_TERMINEE) {
    return null;
  }

  const lieAuRdv =
    visite.rendezVous.some((item) => item.id === rdv.id) ||
    visite.usager.id === rdv.usager?.id;

  return lieAuRdv ? visite : null;
}
