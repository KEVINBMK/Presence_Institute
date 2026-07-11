import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiClientError } from '../../api/client';
import { fetchHistoriqueVisite } from '../../api/historique';
import {
  fetchNotificationsReception,
  marquerNotificationLue,
  marquerNotificationTraitee,
} from '../../api/notifications';
import {
  cloturerVisite,
  decisionVisite,
  enregistrerArrivee,
  fetchRendezVousAVenir,
  fetchRendezVousDuJour,
  fetchVisite,
  marquerAbsent,
  orienterVisite,
  ouvrirVisite,
  rechercheReception,
  reporterRdv,
} from '../../api/reception';
import { useToast } from '../../components/ui/ToastProvider';
import type { HistoriqueAction, Notification, RendezVous, Visite } from '../../types/api';
import { toLocalDateString } from '../../utils/format';
import { resolveVisiteForRdv } from './resolveVisiteForRdv';

const POLLING_INTERVAL_MS = 30_000;
const VISITE_TERMINEE = 'TERMINEE';

export type ReceptionTab = 'aujourdhui' | 'avenir';

function filterNotifsForDossier(
  notifications: Notification[],
  selectedRdv: RendezVous | null,
  visiteActive: Visite | null,
): Notification[] {
  if (!selectedRdv) {
    return [];
  }
  return notifications.filter(
    (n) =>
      !n.treatedAt &&
      (n.rendezVousId === selectedRdv.id ||
        (visiteActive != null && n.visiteId === visiteActive.id)),
  );
}

function visiteMatchesRdv(visite: Visite | null, rdv: RendezVous | null): boolean {
  if (!visite || !rdv) {
    return false;
  }
  if (visite.statut === VISITE_TERMINEE) {
    return false;
  }
  return visite.rendezVous.some((item) => item.id === rdv.id) || visite.usager.id === rdv.usager?.id;
}

export function useReceptionPage() {
  const { showToast } = useToast();

  const [rdvList, setRdvList] = useState<RendezVous[]>([]);
  const [rdvAVenir, setRdvAVenir] = useState<RendezVous[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [activeTab, setActiveTab] = useState<ReceptionTab>('aujourdhui');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifActionId, setNotifActionId] = useState<number | null>(null);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [visiteActive, setVisiteActive] = useState<Visite | null>(null);
  const [historique, setHistorique] = useState<HistoriqueAction[]>([]);
  const [historiqueOpen, setHistoriqueOpen] = useState(false);
  const [visiteClosedMessage, setVisiteClosedMessage] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null);

  const skipVisiteRefreshRef = useRef(false);
  const selectedRdvRef = useRef<RendezVous | null>(null);
  const visiteActiveRef = useRef<Visite | null>(null);

  useEffect(() => {
    selectedRdvRef.current = selectedRdv;
  }, [selectedRdv]);

  useEffect(() => {
    visiteActiveRef.current = visiteActive;
  }, [visiteActive]);

  const loadVisiteContext = useCallback(async (rdv: RendezVous | null) => {
    if (!rdv) {
      setVisiteActive(null);
      setHistorique([]);
      return;
    }
    try {
      const visite = await resolveVisiteForRdv(rdv);
      setVisiteActive(visite);
      if (visite) {
        const h = await fetchHistoriqueVisite(visite.id);
        setHistorique(h);
      } else {
        setHistorique([]);
      }
    } catch {
      setVisiteActive(null);
      setHistorique([]);
    }
  }, []);

  const loadRegistre = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const [duJour, aVenir] = await Promise.all([
        fetchRendezVousDuJour(),
        fetchRendezVousAVenir(),
      ]);
      setRdvList(duJour);
      setRdvAVenir(aVenir);
      setSearchMode(false);
      setLastRefreshAt(new Date());
    } catch (e) {
      setRdvList([]);
      setRdvAVenir([]);
      setListError(e instanceof ApiClientError ? e.message : 'Impossible de charger les rendez-vous.');
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadRdvDuJour = loadRegistre;

  const loadNotifications = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setNotifLoading(true);
    }
    try {
      setNotifications(await fetchNotificationsReception());
      setNotifError(null);
    } catch (e) {
      setNotifError(
        e instanceof ApiClientError ? e.message : 'Impossible de charger les messages reçus.',
      );
    } finally {
      if (!options?.silent) {
        setNotifLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadRegistre();
    void loadNotifications();
  }, [loadRegistre, loadNotifications]);

  const isRdvDuJour = useCallback(
    (rdv: RendezVous) => rdv.dateRendezVous === toLocalDateString(),
    [],
  );

  const refreshVisite = useCallback(async (visiteId: number) => {
    const v = await fetchVisite(visiteId);
    if (v.statut === VISITE_TERMINEE) {
      setVisiteActive(null);
      setHistorique([]);
      return;
    }
    setVisiteActive(v);
    setHistorique(await fetchHistoriqueVisite(visiteId));
  }, []);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) {
      void loadRdvDuJour();
      return;
    }
    setSearching(true);
    setActionError(null);
    try {
      const results = await rechercheReception(q);
      setRdvList(results);
      setSearchMode(true);
      setActiveTab('aujourdhui');
      const first = results[0] ?? null;
      setSelectedRdv(first);
      setVisiteClosedMessage(null);
      if (first) {
        await loadVisiteContext(first);
      } else {
        setVisiteActive(null);
        setHistorique([]);
      }
    } catch (e) {
      setListError(e instanceof ApiClientError ? e.message : 'Recherche impossible.');
    } finally {
      setSearching(false);
    }
  }, [query, loadRdvDuJour, loadVisiteContext]);

  const syncSelectedAfterRefresh = useCallback(
    async (duJour: RendezVous[], aVenir: RendezVous[]) => {
      const current = selectedRdvRef.current;
      if (!current) {
        return;
      }
      const updated = [...duJour, ...aVenir].find((r) => r.id === current.id) ?? current;
      setSelectedRdv(updated);
      if (!skipVisiteRefreshRef.current) {
        await loadVisiteContext(updated);
      }
    },
    [loadVisiteContext],
  );

  const refreshLists = useCallback(async () => {
    if (searchMode && query.trim()) {
      const results = await rechercheReception(query.trim());
      setRdvList(results);
      const current = selectedRdvRef.current;
      const next = current
        ? (results.find((r) => r.id === current.id) ?? results[0] ?? null)
        : (results[0] ?? null);
      setSelectedRdv(next);
      if (next && !skipVisiteRefreshRef.current) {
        await loadVisiteContext(next);
      }
    } else {
      const [duJour, aVenir] = await Promise.all([
        fetchRendezVousDuJour(),
        fetchRendezVousAVenir(),
      ]);
      setRdvList(duJour);
      setRdvAVenir(aVenir);
      await syncSelectedAfterRefresh(duJour, aVenir);
    }
  }, [searchMode, query, loadVisiteContext, syncSelectedAfterRefresh]);

  const runAction = useCallback(
    async (fn: () => Promise<void>, successMessage?: string, options?: { skipVisiteRefresh?: boolean }) => {
      setActionLoading(true);
      setActionError(null);
      skipVisiteRefreshRef.current = options?.skipVisiteRefresh ?? false;
      try {
        await fn();
        await refreshLists();
        await loadNotifications();
        const visite = visiteActiveRef.current;
        if (visite && !skipVisiteRefreshRef.current) {
          await refreshVisite(visite.id);
        }
        if (successMessage) {
          showToast(successMessage, 'success');
        }
      } catch (e) {
        const message = e instanceof ApiClientError ? e.message : 'L’action n’a pas pu être enregistrée.';
        setActionError(message);
        showToast(message, 'error');
      } finally {
        skipVisiteRefreshRef.current = false;
        setActionLoading(false);
      }
    },
    [refreshLists, loadNotifications, refreshVisite, showToast],
  );

  const handleArrivee = useCallback(() => {
    if (!selectedRdv) return;
    void runAction(async () => {
      const rdv = await enregistrerArrivee(selectedRdv.id);
      setSelectedRdv(rdv);
      selectedRdvRef.current = rdv;
    }, 'Arrivée enregistrée.');
  }, [selectedRdv, runAction]);

  const handleOuvrirVisite = useCallback(() => {
    if (!selectedRdv) return;
    void runAction(async () => {
      if (!selectedRdv.usager?.id) {
        return;
      }
      const visite = await ouvrirVisite({
        usagerId: selectedRdv.usager.id,
        rendezVousIds: [selectedRdv.id],
      });
      setVisiteActive(visite);
      visiteActiveRef.current = visite;
      setVisiteClosedMessage(null);
      await refreshVisite(visite.id);
    }, 'Visite ouverte.');
  }, [selectedRdv, runAction, refreshVisite]);

  const handleOrienter = useCallback(() => {
    const rdv = selectedRdvRef.current;
    const visite = visiteActiveRef.current;
    if (!visite || !rdv?.personnel?.id || !visiteMatchesRdv(visite, rdv)) {
      setActionError('Sélectionnez un dossier cohérent avant d’orienter.');
      return;
    }
    void runAction(async () => {
      await orienterVisite(visite.id, {
        personnelId: rdv.personnel!.id,
        rendezVousId: rdv.id,
      });
      await refreshVisite(visite.id);
    }, 'Usager orienté.');
  }, [runAction, refreshVisite]);

  const handleDecision = useCallback(
    (decision: string) => {
      const visite = visiteActiveRef.current;
      const rdv = selectedRdvRef.current;
      if (!visite || !visiteMatchesRdv(visite, rdv)) {
        setActionError('Aucune visite active pour ce dossier.');
        return;
      }
      const labels: Record<string, string> = {
        ATTENDRE: 'Décision enregistrée.',
        REPORTER: 'Rendez-vous reporté.',
        REORIENTER: 'Usager réorienté.',
        CONTINUER: 'Décision enregistrée.',
      };
      void runAction(async () => {
        await decisionVisite(visite.id, decision);
        await refreshVisite(visite.id);
      }, labels[decision] ?? 'Décision enregistrée.');
    },
    [runAction, refreshVisite],
  );

  const handleCloturerVisite = useCallback(() => {
    const visite = visiteActiveRef.current;
    const rdv = selectedRdvRef.current;
    if (!visite || !visiteMatchesRdv(visite, rdv)) {
      setActionError('Aucune visite active à clôturer pour ce dossier.');
      return;
    }
    void runAction(
      async () => {
        await cloturerVisite(visite.id);
        setVisiteActive(null);
        visiteActiveRef.current = null;
        setHistorique([]);
        setVisiteClosedMessage('Visite clôturée.');
      },
      'Visite clôturée.',
      { skipVisiteRefresh: true },
    );
  }, [runAction]);

  const handleNotificationLue = useCallback(
    async (id: number) => {
      setNotifActionId(id);
      try {
        await marquerNotificationLue(id);
        await loadNotifications({ silent: true });
        showToast('Notification marquée comme lue.', 'success');
      } catch (e) {
        showToast(
          e instanceof ApiClientError ? e.message : 'Impossible de marquer la notification.',
          'error',
        );
      } finally {
        setNotifActionId(null);
      }
    },
    [loadNotifications, showToast],
  );

  const handleNotificationTraitee = useCallback(
    async (id: number) => {
      setNotifActionId(id);
      try {
        await marquerNotificationTraitee(id);
        await loadNotifications({ silent: true });
        showToast('Notification traitée.', 'success');
      } catch (e) {
        showToast(
          e instanceof ApiClientError ? e.message : 'Impossible de traiter la notification.',
          'error',
        );
      } finally {
        setNotifActionId(null);
      }
    },
    [loadNotifications, showToast],
  );

  const handleMarquerAbsent = useCallback(() => {
    if (!selectedRdv) return;
    void runAction(async () => {
      const rdv = await marquerAbsent(selectedRdv.id);
      setSelectedRdv(rdv);
      selectedRdvRef.current = rdv;
    }, 'Usager marqué absent.');
  }, [selectedRdv, runAction]);

  const handleReporterRdv = useCallback(() => {
    if (!selectedRdv) return;
    void runAction(async () => {
      const rdv = await reporterRdv(selectedRdv.id);
      setSelectedRdv(rdv);
      selectedRdvRef.current = rdv;
      setVisiteActive(null);
      visiteActiveRef.current = null;
      setHistorique([]);
    }, 'Rendez-vous reporté.');
  }, [selectedRdv, runAction]);

  const selectRdv = useCallback(
    (r: RendezVous) => {
      setSelectedRdv((current) => {
        const next = current?.id === r.id ? null : r;
        selectedRdvRef.current = next;
        setActionError(null);
        setVisiteClosedMessage(null);
        void loadVisiteContext(next);
        return next;
      });
    },
    [loadVisiteContext],
  );

  const clearSelection = useCallback(() => {
    setSelectedRdv(null);
    selectedRdvRef.current = null;
    setVisiteActive(null);
    visiteActiveRef.current = null;
    setHistorique([]);
    setActionError(null);
    setVisiteClosedMessage(null);
  }, []);

  const pollRef = useRef<() => Promise<void>>(async () => {});
  pollRef.current = async () => {
    if (actionLoading || searching || listLoading || notifActionId !== null) {
      return;
    }
    try {
      await refreshLists();
      await loadNotifications({ silent: true });
      const visite = visiteActiveRef.current;
      if (visite && !skipVisiteRefreshRef.current) {
        await refreshVisite(visite.id);
      }
      setLastRefreshAt(new Date());
    } catch {
      // prochain cycle
    }
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void pollRef.current();
    }, POLLING_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const dossierNotifs = useMemo(
    () => filterNotifsForDossier(notifications, selectedRdv, visiteActive),
    [notifications, selectedRdv, visiteActive],
  );

  const pendingNotifsCount = useMemo(
    () => notifications.filter((n) => !n.treatedAt).length,
    [notifications],
  );

  const displayedList = searchMode
    ? rdvList
    : activeTab === 'aujourdhui'
      ? rdvList
      : rdvAVenir;

  return {
    rdvList,
    rdvAVenir,
    displayedList,
    activeTab,
    setActiveTab,
    listLoading,
    listError,
    searchMode,
    isRdvDuJour,
    notifications,
    dossierNotifs,
    pendingNotifsCount,
    notifLoading,
    notifError,
    notifActionId,
    notifDrawerOpen,
    setNotifDrawerOpen,
    query,
    setQuery,
    searching,
    selectedRdv,
    visiteActive,
    visiteClosedMessage,
    historique,
    historiqueOpen,
    setHistoriqueOpen,
    actionLoading,
    actionError,
    lastRefreshAt,
    loadRdvDuJour,
    loadNotifications,
    handleSearch,
    handleArrivee,
    handleOuvrirVisite,
    handleOrienter,
    handleDecision,
    handleCloturerVisite,
    handleMarquerAbsent,
    handleReporterRdv,
    handleNotificationLue,
    handleNotificationTraitee,
    selectRdv,
    clearSelection,
  };
}
