import { fetchVisiteActive } from '../../api/reception';
import type { RendezVous, Visite } from '../../types/api';

/**
 * Charge la visite active du jour pour une recherche réception.
 * L’API n’accepte que le téléphone : si la requête (nom, référence…) ne suffit pas,
 * on retente avec le téléphone du premier rendez-vous trouvé.
 */
export async function resolveVisiteActiveForSearch(
  query: string,
  results: RendezVous[],
): Promise<Visite | null> {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const direct = await fetchVisiteActive(trimmed);
  if (direct) {
    return direct;
  }

  const phone = results[0]?.usager.telephone?.trim();
  if (phone && phone !== trimmed) {
    return fetchVisiteActive(phone);
  }

  return null;
}
