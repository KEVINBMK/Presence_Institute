import { apiGet } from './client';
import type { HistoriqueAction } from '../types/api';

export function fetchHistoriqueVisite(visiteId: number): Promise<HistoriqueAction[]> {
  return apiGet<HistoriqueAction[]>(`/api/visites/${visiteId}/historique`);
}
