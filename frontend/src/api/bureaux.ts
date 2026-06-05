import type { Bureau } from '../types/api';
import type { HttpClient } from './http/HttpClient';
import { fetchHttpClient } from './http/FetchHttpClient';
import { API_ROUTES } from './routes';

export function createBureauxApi(client: HttpClient) {
  return {
    list(): Promise<Bureau[]> {
      return client.get<Bureau[]>(API_ROUTES.bureaux.list);
    },
  };
}

export const bureauxApi = createBureauxApi(fetchHttpClient);

export const fetchBureaux = () => bureauxApi.list();
