export type StatutRendezVous =
  | 'DEMANDE'
  | 'CONFIRME'
  | 'ARRIVE'
  | 'EN_COURS'
  | 'TERMINE'
  | 'REPORTE'
  | 'ANNULE'
  | 'NON_PRESENTE';

export type StatutVisite =
  | 'OUVERTE'
  | 'EN_ATTENTE'
  | 'ORIENTEE'
  | 'EN_COURS'
  | 'TERMINEE'
  | 'SUSPENDUE';

export type DisponibilitePersonnel =
  | 'DISPONIBLE'
  | 'OCCUPE'
  | 'NON_DISPONIBLE_POUR_RECEPTION';

export type TypeNotification =
  | 'ARRIVEE_USAGER'
  | 'FIN_PRISE_EN_CHARGE'
  | 'PERSONNEL_NON_DISPONIBLE'
  | 'DECISION_RECEPTION';

export type TypeUsager =
  | 'CITOYEN'
  | 'AGENT_PUBLIC'
  | 'PARTENAIRE_TECHNIQUE'
  | 'FOURNISSEUR'
  | 'STAGIAIRE'
  | 'REPRESENTANT_EXTERNE'
  | 'VISITEUR_INSTITUTIONNEL';

export const TYPE_USAGER_OPTIONS: { value: TypeUsager; label: string }[] = [
  { value: 'CITOYEN', label: 'Citoyen' },
  { value: 'AGENT_PUBLIC', label: 'Agent public' },
  { value: 'PARTENAIRE_TECHNIQUE', label: 'Partenaire technique' },
  { value: 'FOURNISSEUR', label: 'Fournisseur' },
  { value: 'STAGIAIRE', label: 'Stagiaire' },
  { value: 'REPRESENTANT_EXTERNE', label: 'Représentant externe' },
  { value: 'VISITEUR_INSTITUTIONNEL', label: 'Visiteur institutionnel' },
];

export interface Usager {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  typeUsager: TypeUsager;
}

export interface Bureau {
  id: number;
  nom: string;
  localisation: string;
  description: string;
  heureOuverture: string;
  heureFermeture: string;
  actif: boolean;
}

export interface Personnel {
  id: number;
  nom: string;
  prenom: string;
  fonction: string;
  disponibiliteOperationnelle: DisponibilitePersonnel;
  motifNonReception: string | null;
  bureauId: number;
  actif: boolean;
  bureau?: Bureau;
}

export interface RendezVous {
  id: number;
  reference: string;
  dateRendezVous: string;
  heureDebut: string | null;
  heureFin: string | null;
  motif: string;
  fonctionSouhaitee?: string | null;
  statut: StatutRendezVous;
  usager?: Usager;
  bureau: Bureau;
  personnel?: Personnel | null;
  createdAt: string;
  updatedAt: string;
}

export interface Visite {
  id: number;
  reference: string;
  statut: StatutVisite;
  heureArrivee: string | null;
  heureSortie: string | null;
  decisionReception: string | null;
  usager: Usager;
  reception: { id: number; nomSite: string; service: string };
  rendezVous: RendezVous[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  type: TypeNotification;
  message: string;
  statut: string;
  emetteurType: string;
  destinataireType: string;
  rendezVousId: number | null;
  visiteId: number | null;
  createdAt: string;
  readAt: string | null;
  treatedAt: string | null;
}

export interface HistoriqueAction {
  id: number;
  typeAction: string;
  description: string;
  auteurType: string;
  auteurId: number | null;
  rendezVousId: number | null;
  visiteId: number | null;
  createdAt: string;
}

export interface Creneau {
  heureDebut: string;
  heureFin: string;
  disponible: boolean;
  personnelId: number | null;
}

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string };
