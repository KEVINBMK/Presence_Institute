/** Fonctions proposées à l’usager (liste fermée — pas de saisie libre). */
export const FONCTIONS_SOUHAITEES_OPTIONS = [
  'Agent de secrétariat',
  'Chef de bureau',
  'Développeur',
  'Analyste logiciel',
  'Chef de projet logiciel',
  'Administrateur système',
  'Assistante technique',
  'Technicien réseau',
  'Assistante utilisateurs',
  'Agent sécurité informatique',
] as const;

export type FonctionSouhaiteeOption = (typeof FONCTIONS_SOUHAITEES_OPTIONS)[number];

/** @deprecated Utiliser FONCTIONS_SOUHAITEES_OPTIONS */
export const FONCTIONS_SOUHAITEES_SUGGESTIONS = FONCTIONS_SOUHAITEES_OPTIONS;
