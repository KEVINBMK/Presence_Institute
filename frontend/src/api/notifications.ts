import type { Notification } from '../types/api';
import type { HttpClient } from './http/HttpClient';
import { fetchHttpClient } from './http/FetchHttpClient';
import { API_ROUTES } from './routes';

export function createNotificationsApi(client: HttpClient) {
  return {
    listReception(): Promise<Notification[]> {
      return client.get<Notification[]>(API_ROUTES.reception.notifications);
    },

    marquerLue(id: number): Promise<Notification> {
      return client.patch<Notification>(API_ROUTES.notifications.lire(id));
    },

    marquerTraitee(id: number): Promise<Notification> {
      return client.patch<Notification>(API_ROUTES.notifications.traiter(id));
    },
  };
}

export const notificationsApi = createNotificationsApi(fetchHttpClient);

export const fetchNotificationsReception = () => notificationsApi.listReception();
export const marquerNotificationLue = (id: number) => notificationsApi.marquerLue(id);
export const marquerNotificationTraitee = (id: number) => notificationsApi.marquerTraitee(id);
