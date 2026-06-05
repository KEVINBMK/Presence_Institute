import type { HttpClient } from './http/HttpClient';
import { fetchHttpClient } from './http/FetchHttpClient';
import { API_ROUTES } from './routes';
import type { RendezVous, Visite } from '../types/api';

export function createReceptionApi(client: HttpClient) {
  return {
    fetchRendezVousDuJour(): Promise<RendezVous[]> {
      return client.get<RendezVous[]>(API_ROUTES.reception.rendezVousDuJour);
    },

    fetchRendezVousAVenir(jours = 14): Promise<RendezVous[]> {
      return client.get<RendezVous[]>(API_ROUTES.reception.rendezVousAVenir(jours));
    },

    recherche(query: string): Promise<RendezVous[]> {
      return client.get<RendezVous[]>(API_ROUTES.reception.recherche(query));
    },

    fetchVisiteActive(query: string): Promise<Visite | null> {
      return client.get<Visite | null>(API_ROUTES.reception.visiteActive(query));
    },

    enregistrerArrivee(rdvId: number): Promise<RendezVous> {
      return client.post<RendezVous>(API_ROUTES.reception.enregistrerArrivee(rdvId), {});
    },

    ouvrirVisite(payload: {
      usagerId: number;
      receptionId?: number;
      rendezVousIds?: number[];
    }): Promise<Visite> {
      return client.post<Visite>(API_ROUTES.reception.ouvrirVisite, {
        usagerId: payload.usagerId,
        receptionId: payload.receptionId ?? 1,
        rendezVousIds: payload.rendezVousIds ?? [],
      });
    },

    fetchVisite(id: number): Promise<Visite> {
      return client.get<Visite>(API_ROUTES.reception.visiteDetail(id));
    },

    orienterVisite(
      visiteId: number,
      payload: { personnelId?: number; rendezVousId?: number },
    ): Promise<Visite> {
      return client.patch<Visite>(API_ROUTES.reception.orienterVisite(visiteId), payload);
    },

    decisionVisite(visiteId: number, decision: string): Promise<Visite> {
      return client.patch<Visite>(API_ROUTES.reception.decisionVisite(visiteId), { decision });
    },

    cloturerVisite(visiteId: number): Promise<Visite> {
      return client.patch<Visite>(API_ROUTES.reception.cloturerVisite(visiteId));
    },
  };
}

export const receptionApi = createReceptionApi(fetchHttpClient);

/** Alias conservés — les pages existantes n’ont pas besoin de changer d’import. */
export const fetchRendezVousDuJour = () => receptionApi.fetchRendezVousDuJour();
export const fetchRendezVousAVenir = (jours?: number) => receptionApi.fetchRendezVousAVenir(jours);
export const rechercheReception = (query: string) => receptionApi.recherche(query);
export const fetchVisiteActive = (query: string) => receptionApi.fetchVisiteActive(query);
export const enregistrerArrivee = (rdvId: number) => receptionApi.enregistrerArrivee(rdvId);
export const ouvrirVisite = (payload: Parameters<typeof receptionApi.ouvrirVisite>[0]) =>
  receptionApi.ouvrirVisite(payload);
export const fetchVisite = (id: number) => receptionApi.fetchVisite(id);
export const orienterVisite = (
  visiteId: number,
  payload: { personnelId?: number; rendezVousId?: number },
) => receptionApi.orienterVisite(visiteId, payload);
export const decisionVisite = (visiteId: number, decision: string) =>
  receptionApi.decisionVisite(visiteId, decision);
export const cloturerVisite = (visiteId: number) => receptionApi.cloturerVisite(visiteId);
