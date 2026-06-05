/**
 * Contrat HTTP — l’application ne dépend pas de fetch directement.
 * Implémentations possibles : FetchHttpClient, AxiosHttpClient, MockHttpClient…
 */
export interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}
