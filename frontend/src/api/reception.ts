import { apiGet, apiPatch, apiPost } from './client';
import type { RendezVous, Visite } from '../types/api';

export function fetchRendezVousDuJour(): Promise<RendezVous[]> {
  return apiGet<RendezVous[]>('/api/reception/rendez-vous-du-jour');
}

export function rechercheReception(query: string): Promise<RendezVous[]> {
  return apiGet<RendezVous[]>(`/api/reception/recherche?query=${encodeURIComponent(query.trim())}`);
}

export function fetchVisiteActive(query: string): Promise<Visite | null> {
  return apiGet<Visite | null>(
    `/api/reception/visites/active?query=${encodeURIComponent(query.trim())}`,
  );
}

export function enregistrerArrivee(rdvId: number): Promise<RendezVous> {
  return apiPost<RendezVous>(`/api/reception/rendez-vous/${rdvId}/arrivee`, {});
}

export function ouvrirVisite(payload: {
  usagerId: number;
  receptionId?: number;
  rendezVousIds?: number[];
}): Promise<Visite> {
  return apiPost<Visite>('/api/reception/visites', {
    usagerId: payload.usagerId,
    receptionId: payload.receptionId ?? 1,
    rendezVousIds: payload.rendezVousIds ?? [],
  });
}

export function fetchVisite(id: number): Promise<Visite> {
  return apiGet<Visite>(`/api/reception/visites/${id}`);
}

export function orienterVisite(
  visiteId: number,
  payload: { personnelId?: number; rendezVousId?: number },
): Promise<Visite> {
  return apiPatch<Visite>(`/api/reception/visites/${visiteId}/orienter`, payload);
}

export function decisionVisite(visiteId: number, decision: string): Promise<Visite> {
  return apiPatch<Visite>(`/api/reception/visites/${visiteId}/decision`, { decision });
}

export function cloturerVisite(visiteId: number): Promise<Visite> {
  return apiPatch<Visite>(`/api/reception/visites/${visiteId}/cloturer`);
}
