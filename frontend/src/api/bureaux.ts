import { apiGet } from './client';
import type { Bureau } from '../types/api';

export function fetchBureaux(): Promise<Bureau[]> {
  return apiGet<Bureau[]>('/api/bureaux');
}
