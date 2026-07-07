import { useCallback, useEffect, useRef, useState } from 'react';
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
  orienterVisite,
  ouvrirVisite,
  rechercheReception,
} from '../../api/reception';
import { useToast } from '../../components/ui/ToastProvider';
import type { HistoriqueAction, Notification, RendezVous, Visite } from '../../types/api';
import { toLocalDateString } from '../../utils/format';
import { resolveVisiteActiveForSearch } from './resolveVisiteActiveForSearch';

/** Rafraîchissement automatique de l'écran réception (notifications + registre). */
const POLLING_INTERVAL_MS = 30_000;

export function useReceptionPage() {
  const { showToast } = useToast();

  const [rdvList, setRdvList] = useState<RendezVous[]>([]);
  const [rdvAVenir, setRdvAVenir] = useState<RendezVous[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifActionId, setNotifActionId] = useState<number | null>(null);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [visiteActive, setVisiteActive] = useState<Visite | null>(null);
  const [historique, setHistorique] = useState<HistoriqueAction[]>([]);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null);

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
      // On garde la liste courante : une panne réseau ne doit pas faire
      // croire qu'il n'y a aucun message en attente.
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
    setVisiteActive(v);
    const h = await fetchHistoriqueVisite(visiteId);
    setHistorique(h);
  }, []);

  const applyVisiteSearchResult = useCallback(async (q: string, results: RendezVous[]) => {
    const visite = await resolveVisiteActiveForSearch(q, results);
    if (visite) {
      setVisiteActive(visite);
      const h = await fetchHistoriqueVisite(visite.id);
      setHistorique(h);
    } else {
      setVisiteActive(null);
      setHistorique([]);
    }
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
      if (results.length > 0) {
        setSelectedRdv(results[0]);
      }
      await applyVisiteSearchResult(q, results);
    } catch (e) {
      setListError(e instanceof ApiClientError ? e.message : 'Recherche impossible.');
    } finally {
      setSearching(false);
    }
  }, [query, loadRdvDuJour, applyVisiteSearchResult]);

  const syncSelectedAfterRefresh = useCallback(
    (duJour: RendezVous[], aVenir: RendezVous[]) => {
      setSelectedRdv((current) => {
        if (!current) return null;
        const all = [...duJour, ...aVenir];
        return all.find((r) => r.id === current.id) ?? current;
      });
    },
    [],
  );

  const refreshLists = useCallback(async () => {
    if (searchMode && query.trim()) {
      const results = await rechercheReception(query.trim());
      setRdvList(results);
      setSelectedRdv((current) => {
        if (!current) return results[0] ?? null;
        return results.find((r) => r.id === current.id) ?? results[0] ?? null;
      });
      await applyVisiteSearchResult(query.trim(), results);
    } else {
      const [duJour, aVenir] = await Promise.all([
        fetchRendezVousDuJour(),
        fetchRendezVousAVenir(),
      ]);
      setRdvList(duJour);
      setRdvAVenir(aVenir);
      syncSelectedAfterRefresh(duJour, aVenir);
    }
  }, [searchMode, query, applyVisiteSearchResult, syncSelectedAfterRefresh]);

  const runAction = useCallback(
    async (fn: () => Promise<void>, successMessage?: string) => {
      setActionLoading(true);
      setActionError(null);
      try {
        await fn();
        await refreshLists();
        await loadNotifications();
        if (visiteActive) {
          await refreshVisite(visiteActive.id);
        }
        if (successMessage) {
          showToast(successMessage, 'success');
        }
      } catch (e) {
        const message = e instanceof ApiClientError ? e.message : 'Action impossible.';
        setActionError(message);
        showToast(message, 'error');
      } finally {
        setActionLoading(false);
      }
    },
    [refreshLists, loadNotifications, visiteActive, refreshVisite, showToast],
  );

  const handleArrivee = useCallback(() => {
    if (!selectedRdv) return;
    void runAction(async () => {
      const rdv = await enregistrerArrivee(selectedRdv.id);
      setSelectedRdv(rdv);
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
      await refreshVisite(visite.id);
    }, 'Visite ouverte.');
  }, [selectedRdv, runAction, refreshVisite]);

  const handleOrienter = useCallback(() => {
    if (!visiteActive || !selectedRdv?.personnel?.id) return;
    void runAction(async () => {
      await orienterVisite(visiteActive.id, {
        personnelId: selectedRdv.personnel!.id,
        rendezVousId: selectedRdv.id,
      });
      await refreshVisite(visiteActive.id);
    }, 'Usager orienté vers le personnel.');
  }, [visiteActive, selectedRdv, runAction, refreshVisite]);

  const handleDecision = useCallback(
    (decision: string) => {
      if (!visiteActive) return;
      const labels: Record<string, string> = {
        ATTENDRE: 'Décision enregistrée : usager mis en attente.',
        REPORTER: 'Décision enregistrée : rendez-vous reporté.',
        REORIENTER: 'Décision enregistrée : usager réorienté.',
        CONTINUER: 'Décision enregistrée : la visite continue.',
      };
      void runAction(async () => {
        await decisionVisite(visiteActive.id, decision);
        await refreshVisite(visiteActive.id);
      }, labels[decision] ?? 'Décision enregistrée.');
    },
    [visiteActive, runAction, refreshVisite],
  );

  const handleCloturerVisite = useCallback(() => {
    if (!visiteActive) return;
    void runAction(async () => {
      await cloturerVisite(visiteActive.id);
      setVisiteActive(null);
      setHistorique([]);
    }, 'Visite clôturée.');
  }, [visiteActive, runAction]);

  const handleNotificationLue = useCallback(
    async (id: number) => {
      setNotifActionId(id);
      try {
        await marquerNotificationLue(id);
        await loadNotifications({ silent: true });
        showToast('Notification marquée comme lue.', 'success');
      } catch (e) {
        showToast(
          e instanceof ApiClientError ? e.message : 'Impossible de marquer la notification comme lue.',
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
        showToast('Notification marquée comme traitée.', 'success');
      } catch (e) {
        showToast(
          e instanceof ApiClientError
            ? e.message
            : 'Impossible de marquer la notification comme traitée.',
          'error',
        );
      } finally {
        setNotifActionId(null);
      }
    },
    [loadNotifications, showToast],
  );

  const selectRdv = useCallback((r: RendezVous) => {
    setSelectedRdv((current) => (current?.id === r.id ? null : r));
    setActionError(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRdv(null);
    setActionError(null);
  }, []);

  const scrollToHistorique = useCallback(() => {
    document.getElementById('reception-historique')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  // Rafraîchissement automatique : la réception voit arriver les notifications
  // du personnel et les changements de statut sans recharger la page.
  const pollRef = useRef<() => Promise<void>>(async () => {});
  pollRef.current = async () => {
    if (actionLoading || searching || listLoading || notifActionId !== null) {
      return;
    }
    try {
      await refreshLists();
      await loadNotifications({ silent: true });
      if (visiteActive) {
        await refreshVisite(visiteActive.id);
      }
      setLastRefreshAt(new Date());
    } catch {
      // Échec silencieux : le prochain cycle réessaiera, les erreurs de
      // notifications sont déjà signalées par loadNotifications.
    }
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void pollRef.current();
    }, POLLING_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const pendingNotifs = notifications.filter((n) => !n.treatedAt);

  return {
    rdvList,
    rdvAVenir,
    listLoading,
    listError,
    searchMode,
    isRdvDuJour,
    notifications,
    notifLoading,
    notifError,
    notifActionId,
    query,
    setQuery,
    searching,
    selectedRdv,
    visiteActive,
    historique,
    actionLoading,
    actionError,
    pendingNotifs,
    lastRefreshAt,
    loadRdvDuJour,
    loadNotifications,
    handleSearch,
    handleArrivee,
    handleOuvrirVisite,
    handleOrienter,
    handleDecision,
    handleCloturerVisite,
    handleNotificationLue,
    handleNotificationTraitee,
    selectRdv,
    clearSelection,
    scrollToHistorique,
  };
}
