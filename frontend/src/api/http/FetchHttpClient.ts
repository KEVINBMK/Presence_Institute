import { apiDelete, apiGet, apiPatch, apiPost } from '../client';
import type { HttpClient } from './HttpClient';

/** Implémentation actuelle : fetch natif via client.ts */
export const fetchHttpClient: HttpClient = {
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
};
