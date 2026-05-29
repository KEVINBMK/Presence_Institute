import type { ApiError, ApiSuccess } from '../types/api';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export class ApiClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  let json: ApiSuccess<T> | ApiError;
  try {
    json = (await res.json()) as ApiSuccess<T> | ApiError;
  } catch {
    throw new ApiClientError(
      res.ok ? 'Réponse serveur invalide.' : `Erreur de communication (${res.status}).`,
    );
  }

  if (!json.success) {
    throw new ApiClientError(json.error);
  }

  return json.data;
}

export async function apiGet<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { Accept: 'application/json' },
    });
    return parseJson<T>(res);
  } catch (e) {
    if (e instanceof ApiClientError) {
      throw e;
    }
    throw new ApiClientError('Impossible de joindre le serveur. Vérifiez que l’API est démarrée.');
  }
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return parseJson<T>(res);
  } catch (e) {
    if (e instanceof ApiClientError) {
      throw e;
    }
    throw new ApiClientError('Impossible de joindre le serveur.');
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return parseJson<T>(res);
  } catch (e) {
    if (e instanceof ApiClientError) {
      throw e;
    }
    throw new ApiClientError('Impossible de joindre le serveur.');
  }
}
