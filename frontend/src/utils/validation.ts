/**
 * Validation simple du téléphone côté client (le backend garde la validation finale).
 * Retourne un message d'erreur ou null si le numéro est acceptable.
 */
export function validateTelephone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Le numéro de téléphone est obligatoire.';
  }

  // Tolère les séparateurs usuels saisis par les usagers : espaces, points, tirets.
  const digits = trimmed.replace(/[\s.\-()]/g, '');
  if (!/^\+?\d{8,15}$/.test(digits)) {
    return 'Numéro de téléphone invalide : saisissez entre 8 et 15 chiffres (ex. 0890000000).';
  }

  return null;
}
