export type DemoRole = 'RECEPTION' | 'PERSONNEL' | 'ADMIN_DEMO';

export interface AuthUser {
  id: number;
  identifiant: string;
  nomComplet: string;
  role: DemoRole;
  personnelId: number | null;
  fonction?: string;
  bureau?: string;
  disponibiliteOperationnelle?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export const ROLE_LABELS: Record<DemoRole, string> = {
  RECEPTION: 'Réception',
  PERSONNEL: 'Personnel',
  ADMIN_DEMO: 'Administration démo',
};
