/** Erreur métier ou réseau renvoyée par la couche HTTP (contrat API Symfony). */
export class ApiClientError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}
