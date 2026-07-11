import type { ApiError, ApiSuccess } from '../types/api';
import { ApiClientError } from './errors';

export { ApiClientError } from './errors';

/**
 * En développement : URL relative (proxy Vite → Symfony) pour que le cookie de session
 * reste sur la même origine (localhost:5173). Une URL absolue vers :8000 casse la session.
 */
const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? '';
const baseUrl =
  import.meta.env.DEV && /^https?:\/\/(127\.0\.0\.1|localhost):8000\/?$/i.test(configuredApiUrl)
    ? ''
    : configuredApiUrl;

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

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
    throw new ApiClientError(json.error, res.status);
  }

  return json.data;
}

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return parseJson<T>(res);
  } catch (e) {
    if (e instanceof ApiClientError) {
      throw e;
    }
    throw new ApiClientError(
      method === 'GET'
        ? 'Impossible de joindre le serveur. Vérifiez que l’API est démarrée.'
        : 'Impossible de joindre le serveur.',
    );
  }
}

export const apiGet = <T>(path: string): Promise<T> => request<T>('GET', path);

export const apiPost = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>('POST', path, body);

export const apiPatch = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>('PATCH', path, body);

export const apiDelete = <T>(path: string): Promise<T> => request<T>('DELETE', path);
