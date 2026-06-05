import type { DisponibilitePersonnel, Personnel, RendezVous } from '../types/api';
import type { HttpClient } from './http/HttpClient';
import { fetchHttpClient } from './http/FetchHttpClient';
import { API_ROUTES } from './routes';

const STORAGE_KEY = 'atelier_personnel_id';

export function createPersonnelApi(client: HttpClient) {
  return {
    list(): Promise<Personnel[]> {
      return client.get<Personnel[]>(API_ROUTES.personnel.list);
    },

    fetchRendezVous(personnelId: number): Promise<RendezVous[]> {
      return client.get<RendezVous[]>(API_ROUTES.personnel.rendezVous(personnelId));
    },

    changerDisponibilite(
      personnelId: number,
      payload: {
        disponibiliteOperationnelle: DisponibilitePersonnel;
        motifNonReception?: string | null;
      },
    ): Promise<Personnel> {
      return client.patch<Personnel>(API_ROUTES.personnel.disponibilite(personnelId), payload);
    },

    demarrerPriseEnCharge(personnelId: number, rdvId: number): Promise<RendezVous> {
      return client.patch<RendezVous>(API_ROUTES.personnel.demarrer(personnelId, rdvId));
    },

    cloturerPriseEnCharge(personnelId: number, rdvId: number): Promise<RendezVous> {
      return client.patch<RendezVous>(API_ROUTES.personnel.cloturer(personnelId, rdvId));
    },
  };
}

export const personnelApi = createPersonnelApi(fetchHttpClient);

export function getStoredPersonnelId(): number | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function storePersonnelId(id: number): void {
  localStorage.setItem(STORAGE_KEY, String(id));
}

export const fetchPersonnelsDemo = () => personnelApi.list();
export const fetchRendezVousPersonnel = (personnelId: number) =>
  personnelApi.fetchRendezVous(personnelId);
export const changerDisponibilite = (
  personnelId: number,
  payload: Parameters<typeof personnelApi.changerDisponibilite>[1],
) => personnelApi.changerDisponibilite(personnelId, payload);
export const demarrerPriseEnCharge = (personnelId: number, rdvId: number) =>
  personnelApi.demarrerPriseEnCharge(personnelId, rdvId);
export const cloturerPriseEnCharge = (personnelId: number, rdvId: number) =>
  personnelApi.cloturerPriseEnCharge(personnelId, rdvId);
