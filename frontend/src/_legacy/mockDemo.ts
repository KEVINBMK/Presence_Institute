/** @deprecated Archivé — données mock avant branchement API. */
import type {
  Bureau,
  HistoriqueAction,
  Notification,
  RendezVous,
  Visite,
} from '../types/api';

export const mockBureaux: Bureau[] = [
  {
    id: 1,
    nom: 'Bureau Secrétariat',
    localisation: 'Aile A — Rez-de-chaussée',
    description: 'Accueil et orientation',
    heureOuverture: '08:00',
    heureFermeture: '17:00',
    actif: true,
  },
  {
    id: 7,
    nom: 'Bureau Administration des systèmes',
    localisation: 'Aile B — 1er étage',
    description: 'Support informatique',
    heureOuverture: '08:00',
    heureFermeture: '16:30',
    actif: true,
  },
];

export const mockRdvDuJour: RendezVous[] = [
  {
    id: 1,
    reference: 'RDV-2026-000001',
    dateRendezVous: new Date().toISOString().slice(0, 10),
    heureDebut: '09:00',
    heureFin: '09:30',
    motif: 'Suivi de dossier',
    statut: 'TERMINE',
    usager: {
      id: 1,
      nom: 'Mukendi',
      prenom: 'Jean',
      telephone: '0890000001',
      email: 'jean.mukendi@demo.c2i.cd',
      typeUsager: 'CITOYEN',
    },
    bureau: mockBureaux[0],
    personnel: {
      id: 1,
      nom: 'Dupont',
      prenom: 'Alice',
      fonction: 'Agent de secrétariat',
      disponibiliteOperationnelle: 'DISPONIBLE',
      motifNonReception: null,
      bureauId: 1,
      actif: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    reference: 'RDV-2026-000004',
    dateRendezVous: new Date().toISOString().slice(0, 10),
    heureDebut: '14:00',
    heureFin: '14:30',
    motif: 'Dépannage informatique',
    statut: 'ARRIVE',
    usager: {
      id: 3,
      nom: 'Ilunga',
      prenom: 'Paul',
      telephone: '0890000003',
      email: 'paul.ilunga@demo.c2i.cd',
      typeUsager: 'PARTENAIRE_TECHNIQUE',
    },
    bureau: mockBureaux[1],
    personnel: {
      id: 2,
      nom: 'Charrier',
      prenom: 'Margot',
      fonction: 'Technicienne systèmes',
      disponibiliteOperationnelle: 'NON_DISPONIBLE_POUR_RECEPTION',
      motifNonReception: 'Créneau non disponible',
      bureauId: 7,
      actif: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockVisiteActive: Visite = {
  id: 3,
  reference: 'VIS-2026-000003',
  statut: 'EN_ATTENTE',
  heureArrivee: new Date().toISOString(),
  heureSortie: null,
  decisionReception: 'ATTENDRE',
  usager: mockRdvDuJour[1].usager,
  reception: { id: 1, nomSite: 'C2I — Site principal', service: 'Réception centrale' },
  rendezVous: [mockRdvDuJour[1]],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'ARRIVEE_USAGER',
    message: 'Arrivée Paul Ilunga — RDV-2026-000004',
    statut: 'ENVOYEE',
    emetteurType: 'RECEPTION',
    destinataireType: 'RECEPTION',
    rendezVousId: 2,
    visiteId: 3,
    createdAt: new Date().toISOString(),
    readAt: null,
    treatedAt: null,
  },
  {
    id: 2,
    type: 'FIN_PRISE_EN_CHARGE',
    message: 'Prise en charge terminée (RDV-2026-000002). La réception décide de la suite.',
    statut: 'ENVOYEE',
    emetteurType: 'PERSONNEL',
    destinataireType: 'RECEPTION',
    rendezVousId: 2,
    visiteId: 2,
    createdAt: new Date().toISOString(),
    readAt: null,
    treatedAt: null,
  },
];

export const mockHistorique: HistoriqueAction[] = [
  {
    id: 1,
    typeAction: 'VISITE_OUVERTE',
    description: 'Visite ouverte après vérification de la référence',
    auteurType: 'RECEPTION',
    auteurId: 1,
    rendezVousId: null,
    visiteId: 3,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    typeAction: 'ARRIVEE_ENREGISTREE',
    description: 'Arrivée enregistrée par la réception C2I',
    auteurType: 'RECEPTION',
    auteurId: 1,
    rendezVousId: 2,
    visiteId: 3,
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 3,
    typeAction: 'PERSONNEL_NON_DISPONIBLE',
    description: 'Personnel ne peut pas recevoir : Créneau non disponible',
    auteurType: 'PERSONNEL',
    auteurId: 2,
    rendezVousId: 2,
    visiteId: 3,
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
];

export const mockCreneaux = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '14:00',
  '14:30',
  '15:00',
].map((h) => ({
  heureDebut: h,
  heureFin: h.replace(/(\d+):(\d+)/, (_, hh, mm) => {
    const m = parseInt(mm, 10) + 30;
    return m >= 60 ? `${String(parseInt(hh, 10) + 1).padStart(2, '0')}:00` : `${hh}:${String(m).padStart(2, '0')}`;
  }),
  disponible: !['09:00', '14:00'].includes(h),
  personnelId: 1,
}));

export const mockPersonnelRdv = mockRdvDuJour.filter((r) => r.statut === 'ARRIVE' || r.statut === 'EN_COURS');
