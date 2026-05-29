import { apiGet, apiPatch } from './client';
import type { Notification } from '../types/api';

export function fetchNotificationsReception(): Promise<Notification[]> {
  return apiGet<Notification[]>('/api/reception/notifications');
}

export function marquerNotificationLue(id: number): Promise<Notification> {
  return apiPatch<Notification>(`/api/notifications/${id}/lire`);
}

export function marquerNotificationTraitee(id: number): Promise<Notification> {
  return apiPatch<Notification>(`/api/notifications/${id}/traiter`);
}
