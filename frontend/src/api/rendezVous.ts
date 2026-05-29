import { apiPost } from './client';
import type { PeriodeSouhaitee } from '../components/usager/PreferencePeriodePicker';
import type { RendezVous, TypeUsager } from '../types/api';

export interface CreateRendezVousPayload {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
  typeUsager: TypeUsager;
  bureauId: number;
  dateSouhaitee: string;
  periodeSouhaitee?: PeriodeSouhaitee;
  motif: string;
}

/** Demande usager — le serveur attribue le créneau (pas de heureDebut côté client). */
export function createRendezVous(payload: CreateRendezVousPayload): Promise<RendezVous> {
  const body: Record<string, unknown> = {
    nom: payload.nom.trim(),
    prenom: payload.prenom.trim(),
    telephone: payload.telephone.trim(),
    typeUsager: payload.typeUsager,
    bureauId: payload.bureauId,
    dateSouhaitee: payload.dateSouhaitee,
    motif: payload.motif.trim(),
  };

  const email = payload.email?.trim();
  if (email) {
    body.email = email;
  }

  if (payload.periodeSouhaitee) {
    body.periodeSouhaitee = payload.periodeSouhaitee;
  }

  return apiPost<RendezVous>('/api/rendez-vous', body);
}
