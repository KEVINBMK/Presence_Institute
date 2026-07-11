import type { AuthUser } from '../features/auth/authTypes';
import type { HttpClient } from './http/HttpClient';
import { fetchHttpClient } from './http/FetchHttpClient';
import { API_ROUTES } from './routes';

export function createAuthApi(client: HttpClient) {
  return {
    login(identifiant: string, code: string): Promise<AuthUser> {
      return client.post<AuthUser>(API_ROUTES.auth.login, { identifiant, code });
    },
    /** null = pas de session (réponse 200, sans exception serveur). */
    me(): Promise<AuthUser | null> {
      return client.get<AuthUser | null>(API_ROUTES.auth.me);
    },
    logout(): Promise<{ message: string }> {
      return client.post<{ message: string }>(API_ROUTES.auth.logout);
    },
  };
}

export const authApi = createAuthApi(fetchHttpClient);

export const login = (identifiant: string, code: string) => authApi.login(identifiant, code);
export const fetchMe = () => authApi.me();
export const logout = () => authApi.logout();
