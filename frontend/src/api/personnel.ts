import { apiGet, apiPatch } from './client';
import type { DisponibilitePersonnel, Personnel, RendezVous } from '../types/api';

const STORAGE_KEY = 'atelier_personnel_id';

export function fetchPersonnelsDemo(): Promise<Personnel[]> {
  return apiGet<Personnel[]>('/api/personnel');
}

export function getStoredPersonnelId(): number | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function storePersonnelId(id: number): void {
  localStorage.setItem(STORAGE_KEY, String(id));
}

export function fetchRendezVousPersonnel(personnelId: number): Promise<RendezVous[]> {
  return apiGet<RendezVous[]>(`/api/personnel/${personnelId}/rendez-vous`);
}

export function changerDisponibilite(
  personnelId: number,
  payload: {
    disponibiliteOperationnelle: DisponibilitePersonnel;
    motifNonReception?: string | null;
  },
): Promise<Personnel> {
  return apiPatch<Personnel>(`/api/personnel/${personnelId}/disponibilite`, payload);
}

export function demarrerPriseEnCharge(personnelId: number, rdvId: number): Promise<RendezVous> {
  return apiPatch<RendezVous>(`/api/personnel/${personnelId}/rendez-vous/${rdvId}/demarrer`);
}

export function cloturerPriseEnCharge(personnelId: number, rdvId: number): Promise<RendezVous> {
  return apiPatch<RendezVous>(`/api/personnel/${personnelId}/rendez-vous/${rdvId}/cloturer`);
}
