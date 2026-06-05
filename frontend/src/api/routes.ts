/** Chemins API centralisés — un seul fichier à modifier si le backend évolue. */
export const API_ROUTES = {
  bureaux: {
    list: '/api/bureaux',
    creneaux: (bureauId: number, date: string) =>
      `/api/bureaux/${bureauId}/creneaux?date=${encodeURIComponent(date)}`,
  },
  rendezVous: {
    create: '/api/rendez-vous',
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
    ouvrirVisite: '/api/reception/visites',
    visiteDetail: (id: number) => `/api/reception/visites/${id}`,
    orienterVisite: (visiteId: number) => `/api/reception/visites/${visiteId}/orienter`,
    decisionVisite: (visiteId: number) => `/api/reception/visites/${visiteId}/decision`,
    cloturerVisite: (visiteId: number) => `/api/reception/visites/${visiteId}/cloturer`,
    notifications: '/api/reception/notifications',
  },
  personnel: {
    list: '/api/personnel',
    rendezVous: (personnelId: number) => `/api/personnel/${personnelId}/rendez-vous`,
    disponibilite: (personnelId: number) => `/api/personnel/${personnelId}/disponibilite`,
    demarrer: (personnelId: number, rdvId: number) =>
      `/api/personnel/${personnelId}/rendez-vous/${rdvId}/demarrer`,
    cloturer: (personnelId: number, rdvId: number) =>
      `/api/personnel/${personnelId}/rendez-vous/${rdvId}/cloturer`,
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
