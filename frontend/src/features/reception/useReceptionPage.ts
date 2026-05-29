import { useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '../../api/client';
import { fetchHistoriqueVisite } from '../../api/historique';
import { fetchNotificationsReception } from '../../api/notifications';
import {
  cloturerVisite,
  decisionVisite,
  enregistrerArrivee,
  fetchRendezVousDuJour,
  fetchVisite,
  orienterVisite,
  ouvrirVisite,
  rechercheReception,
} from '../../api/reception';
import type { HistoriqueAction, Notification, RendezVous, Visite } from '../../types/api';
import { resolveVisiteActiveForSearch } from './resolveVisiteActiveForSearch';

export function useReceptionPage() {
  const [rdvList, setRdvList] = useState<RendezVous[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [visiteActive, setVisiteActive] = useState<Visite | null>(null);
  const [historique, setHistorique] = useState<HistoriqueAction[]>([]);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadRdvDuJour = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await fetchRendezVousDuJour();
      setRdvList(data);
      setSearchMode(false);
    } catch (e) {
      setRdvList([]);
      setListError(e instanceof ApiClientError ? e.message : 'Impossible de charger les rendez-vous.');
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      setNotifications(await fetchNotificationsReception());
    } catch {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRdvDuJour();
    void loadNotifications();
  }, [loadRdvDuJour, loadNotifications]);

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

  const runAction = useCallback(
    async (fn: () => Promise<void>) => {
      setActionLoading(true);
      setActionError(null);
      try {
        await fn();
        await loadRdvDuJour();
        await loadNotifications();
      } catch (e) {
        setActionError(e instanceof ApiClientError ? e.message : 'Action impossible.');
      } finally {
        setActionLoading(false);
      }
    },
    [loadRdvDuJour, loadNotifications],
  );

  const handleArrivee = useCallback(() => {
    if (!selectedRdv) return;
    void runAction(async () => {
      const rdv = await enregistrerArrivee(selectedRdv.id);
      setSelectedRdv(rdv);
    });
  }, [selectedRdv, runAction]);

  const handleOuvrirVisite = useCallback(() => {
    if (!selectedRdv) return;
    void runAction(async () => {
      const visite = await ouvrirVisite({
        usagerId: selectedRdv.usager.id,
        rendezVousIds: [selectedRdv.id],
      });
      setVisiteActive(visite);
      await refreshVisite(visite.id);
    });
  }, [selectedRdv, runAction, refreshVisite]);

  const handleOrienter = useCallback(() => {
    if (!visiteActive || !selectedRdv?.personnel?.id) return;
    void runAction(async () => {
      await orienterVisite(visiteActive.id, {
        personnelId: selectedRdv.personnel!.id,
        rendezVousId: selectedRdv.id,
      });
      await refreshVisite(visiteActive.id);
    });
  }, [visiteActive, selectedRdv, runAction, refreshVisite]);

  const handleDecision = useCallback(
    (decision: string) => {
      if (!visiteActive) return;
      void runAction(async () => {
        await decisionVisite(visiteActive.id, decision);
        await refreshVisite(visiteActive.id);
      });
    },
    [visiteActive, runAction, refreshVisite],
  );

  const handleCloturerVisite = useCallback(() => {
    if (!visiteActive) return;
    void runAction(async () => {
      await cloturerVisite(visiteActive.id);
      setVisiteActive(null);
      setHistorique([]);
    });
  }, [visiteActive, runAction]);

  const selectRdv = useCallback((r: RendezVous) => {
    setSelectedRdv(r);
    setActionError(null);
  }, []);

  const pendingNotifs = notifications.filter((n) => !n.treatedAt);

  return {
    rdvList,
    listLoading,
    listError,
    searchMode,
    notifications,
    notifLoading,
    query,
    setQuery,
    searching,
    selectedRdv,
    visiteActive,
    historique,
    actionLoading,
    actionError,
    pendingNotifs,
    loadRdvDuJour,
    handleSearch,
    handleArrivee,
    handleOuvrirVisite,
    handleOrienter,
    handleDecision,
    handleCloturerVisite,
    selectRdv,
  };
}
