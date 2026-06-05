/** Erreur métier ou réseau renvoyée par la couche HTTP (contrat API Symfony). */
export class ApiClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiClientError';
  }
}
