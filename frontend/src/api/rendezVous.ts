import type { PeriodeSouhaitee } from '../components/usager/PreferencePeriodePicker';
import type { RendezVousUsager, TypeUsager } from '../types/api';
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

export interface SuiviRendezVousPayload {
  reference: string;
  telephone: string;
}

export interface RetrouverReferencePayload {
  telephone: string;
  nom?: string;
  dateApproximative?: string;
}

export interface SuiviRendezVousUsager extends RendezVousUsager {
  instructions: string;
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
    create(payload: CreateRendezVousPayload): Promise<RendezVousUsager> {
      return client.post<RendezVousUsager>(API_ROUTES.rendezVous.create, buildCreateBody(payload));
    },

    suivi(payload: SuiviRendezVousPayload): Promise<SuiviRendezVousUsager> {
      return client.post<SuiviRendezVousUsager>(API_ROUTES.rendezVous.suivi, {
        reference: payload.reference.trim(),
        telephone: payload.telephone.trim(),
      });
    },

    retrouverReference(payload: RetrouverReferencePayload): Promise<{ message: string; smsSimule?: boolean }> {
      return client.post(API_ROUTES.rendezVous.retrouverReference, payload);
    },
  };
}

export const rendezVousApi = createRendezVousApi(fetchHttpClient);

export const createRendezVous = (payload: CreateRendezVousPayload) =>
  rendezVousApi.create(payload);

export const suiviRendezVous = (payload: SuiviRendezVousPayload) => rendezVousApi.suivi(payload);

export const retrouverReference = (payload: RetrouverReferencePayload) =>
  rendezVousApi.retrouverReference(payload);
