import type { PeriodeSouhaitee } from '../components/usager/PreferencePeriodePicker';
import type { RendezVous, RendezVousUsager, TypeUsager } from '../types/api';
import type { HttpClient } from './http/HttpClient';
import { fetchHttpClient } from './http/FetchHttpClient';
import { API_ROUTES } from './routes';

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
  fonctionSouhaitee?: string | null;
}

function buildCreateBody(payload: CreateRendezVousPayload): Record<string, unknown> {
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

  const fonction = payload.fonctionSouhaitee?.trim();
  if (fonction) {
    body.fonctionSouhaitee = fonction;
  }

  return body;
}

export function createRendezVousApi(client: HttpClient) {
  return {
    /** Demande usager — le serveur attribue le créneau (pas de heureDebut côté client). */
    create(payload: CreateRendezVousPayload): Promise<RendezVous> {
      return client.post<RendezVous>(API_ROUTES.rendezVous.create, buildCreateBody(payload));
    },

    /** Suivi usager par référence (vue publique, sans données internes). */
    byReference(reference: string): Promise<RendezVousUsager> {
      return client.get<RendezVousUsager>(
        API_ROUTES.rendezVous.byReference(reference.trim().toUpperCase()),
      );
    },
  };
}

export const rendezVousApi = createRendezVousApi(fetchHttpClient);

export const createRendezVous = (payload: CreateRendezVousPayload) =>
  rendezVousApi.create(payload);

export const fetchRendezVousByReference = (reference: string) =>
  rendezVousApi.byReference(reference);
