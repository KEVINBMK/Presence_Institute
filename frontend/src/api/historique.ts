import type { HistoriqueAction } from '../types/api';
import type { HttpClient } from './http/HttpClient';
import { fetchHttpClient } from './http/FetchHttpClient';
import { API_ROUTES } from './routes';

export function createHistoriqueApi(client: HttpClient) {
  return {
    parVisite(visiteId: number): Promise<HistoriqueAction[]> {
      return client.get<HistoriqueAction[]>(API_ROUTES.historique.parVisite(visiteId));
    },
  };
}

export const historiqueApi = createHistoriqueApi(fetchHttpClient);

export const fetchHistoriqueVisite = (visiteId: number) => historiqueApi.parVisite(visiteId);
