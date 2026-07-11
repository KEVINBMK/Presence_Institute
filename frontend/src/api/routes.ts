/** Chemins API centralisés — un seul fichier à modifier si le backend évolue. */
export const API_ROUTES = {
  auth: {
    login: '/api/auth/login',
    me: '/api/auth/me',
    logout: '/api/auth/logout',
  },
  bureaux: {
    list: '/api/bureaux',
    creneaux: (bureauId: number, date: string) =>
      `/api/bureaux/${bureauId}/creneaux?date=${encodeURIComponent(date)}`,
  },
  rendezVous: {
    create: '/api/rendez-vous',
    suivi: '/api/rendez-vous/suivi',
    retrouverReference: '/api/rendez-vous/retrouver-reference',
    byReference: (reference: string) => `/api/rendez-vous/reference/${reference}`,
    annuler: (id: number) => `/api/rendez-vous/${id}/annuler`,
  },
  reception: {
    rendezVousDuJour: '/api/reception/rendez-vous-du-jour',
    rendezVousAVenir: (jours: number) => `/api/reception/rendez-vous-a-venir?jours=${jours}`,
    recherche: (query: string) =>
      `/api/reception/recherche?query=${encodeURIComponent(query.trim())}`,
    visiteActive: (query: string) =>
      `/api/reception/visites/active?query=${encodeURIComponent(query.trim())}`,
    enregistrerArrivee: (rdvId: number) => `/api/reception/rendez-vous/${rdvId}/arrivee`,
    reporterRdv: (rdvId: number) => `/api/reception/rendez-vous/${rdvId}/reporter`,
    marquerAbsent: (rdvId: number) => `/api/reception/rendez-vous/${rdvId}/non-presente`,
    ouvrirVisite: '/api/reception/visites',
    visiteDetail: (id: number) => `/api/reception/visites/${id}`,
    orienterVisite: (visiteId: number) => `/api/reception/visites/${visiteId}/orienter`,
    decisionVisite: (visiteId: number) => `/api/reception/visites/${visiteId}/decision`,
    cloturerVisite: (visiteId: number) => `/api/reception/visites/${visiteId}/cloturer`,
    notifications: '/api/reception/notifications',
  },
  personnel: {
    me: '/api/personnel/me',
    mesRendezVous: '/api/personnel/me/rendez-vous',
    maDisponibilite: '/api/personnel/me/disponibilite',
    demarrer: (rdvId: number) => `/api/personnel/me/rendez-vous/${rdvId}/demarrer`,
    cloturer: (rdvId: number) => `/api/personnel/me/rendez-vous/${rdvId}/cloturer`,
  },
  notifications: {
    lire: (id: number) => `/api/notifications/${id}/lire`,
    traiter: (id: number) => `/api/notifications/${id}/traiter`,
  },
  historique: {
    parVisite: (visiteId: number) => `/api/visites/${visiteId}/historique`,
    parReference: (reference: string) => `/api/visites/reference/${reference}/historique`,
  },
} as const;
