import type { DisponibilitePersonnel, Personnel, RendezVous } from '../types/api';
import type { HttpClient } from './http/HttpClient';
import { fetchHttpClient } from './http/FetchHttpClient';
import { API_ROUTES } from './routes';

export function createPersonnelApi(client: HttpClient) {
  return {
    me(): Promise<Personnel> {
      return client.get<Personnel>(API_ROUTES.personnel.me);
    },

    fetchMesRendezVous(): Promise<RendezVous[]> {
      return client.get<RendezVous[]>(API_ROUTES.personnel.mesRendezVous);
    },

    changerDisponibilite(payload: {
      disponibiliteOperationnelle: DisponibilitePersonnel;
      motifNonReception?: string | null;
    }): Promise<Personnel> {
      return client.patch<Personnel>(API_ROUTES.personnel.maDisponibilite, payload);
    },

    demarrerPriseEnCharge(rdvId: number): Promise<RendezVous> {
      return client.patch<RendezVous>(API_ROUTES.personnel.demarrer(rdvId));
    },

    cloturerPriseEnCharge(rdvId: number): Promise<RendezVous> {
      return client.patch<RendezVous>(API_ROUTES.personnel.cloturer(rdvId));
    },
  };
}

export const personnelApi = createPersonnelApi(fetchHttpClient);

export const fetchMonProfil = () => personnelApi.me();
export const fetchMesRendezVous = () => personnelApi.fetchMesRendezVous();
export const changerMaDisponibilite = (
  payload: Parameters<typeof personnelApi.changerDisponibilite>[0],
) => personnelApi.changerDisponibilite(payload);
export const demarrerPriseEnCharge = (rdvId: number) => personnelApi.demarrerPriseEnCharge(rdvId);
export const cloturerPriseEnCharge = (rdvId: number) => personnelApi.cloturerPriseEnCharge(rdvId);
