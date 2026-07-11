import { useCallback } from 'react';
import { ReceptionActionPanel } from '../../components/reception/ReceptionActionPanel';
import { ReceptionAppointmentList } from '../../components/reception/ReceptionAppointmentList';
import { NotificationPanel } from '../../components/notifications/NotificationPanel';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { SectionCard } from '../../components/ui/SectionCard';
import { SkeletonList } from '../../components/ui/Skeleton';
import type { QuickActionId } from '../../utils/receptionQuickActions';
import { useReceptionPage } from './useReceptionPage';

export function ReceptionPage() {
  const {
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
  } = useReceptionPage();

  const handleQuickAction = useCallback(
    (actionId: QuickActionId) => {
      switch (actionId) {
        case 'enregistrer_arrivee':
          handleArrivee();
          break;
        case 'ouvrir_visite':
          handleOuvrirVisite();
          break;
        case 'orienter':
          handleOrienter();
          break;
        case 'attendre':
          handleDecision('ATTENDRE');
          break;
        case 'cloturer':
          handleCloturerVisite();
          break;
        case 'reporter':
          handleReporterRdv();
          break;
        case 'reorienter':
          handleDecision('REORIENTER');
          break;
        case 'marquer_absent':
          handleMarquerAbsent();
          break;
        case 'voir_message':
          setNotifDrawerOpen(true);
          break;
        default:
          break;
      }
    },
    [
      handleArrivee,
      handleOuvrirVisite,
      handleOrienter,
      handleDecision,
      handleCloturerVisite,
      handleReporterRdv,
      handleMarquerAbsent,
      setNotifDrawerOpen,
    ],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-institution md:text-3xl">Réception</h1>
          <p className="mt-1 text-xs text-anthracite-muted">
            Actualisation automatique toutes les 30 s
            {lastRefreshAt &&
              ` — ${lastRefreshAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setNotifDrawerOpen((v) => !v)}>
          Notifications ({notifError ? '!' : pendingNotifsCount})
        </Button>
      </header>

      {notifDrawerOpen && (
        <SectionCard title="Messages reçus" subtitle={notifError ? undefined : `${pendingNotifsCount} en attente`}>
          {notifLoading && <SkeletonList rows={2} label="Chargement des messages" />}
          {!notifLoading && notifError && (
            <div className="space-y-2">
              <p className="text-sm text-danger" role="alert">
                Impossible de charger les messages.
              </p>
              <Button variant="secondary" size="sm" onClick={() => void loadNotifications()}>
                Réessayer
              </Button>
            </div>
          )}
          {!notifLoading && !notifError && (
            <NotificationPanel
              items={notifications.filter((n) => !n.treatedAt)}
              actionLoadingId={notifActionId}
              onMarquerLue={(id) => void handleNotificationLue(id)}
              onMarquerTraitee={(id) => void handleNotificationTraitee(id)}
            />
          )}
        </SectionCard>
      )}

      <SectionCard title="Rechercher un usager" accent>
        <SearchBar value={query} onChange={setQuery} onSubmit={() => void handleSearch()} />
        {searchMode && (
          <button
            type="button"
            onClick={() => void loadRdvDuJour()}
            className="mt-3 text-sm font-semibold text-institution hover:underline"
          >
            Revenir au registre du jour
          </button>
        )}
      </SectionCard>

      {!searchMode && (
        <div className="flex gap-2 border-b border-border">
          {(
            [
              ['aujourdhui', 'Aujourd’hui'],
              ['avenir', 'À venir'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`min-h-10 border-b-2 px-4 text-sm font-semibold transition-colors ${
                activeTab === id
                  ? 'border-institution text-institution'
                  : 'border-transparent text-anthracite-muted hover:text-anthracite'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 pb-24 lg:grid-cols-12 lg:pb-0">
        {/* Panneau d'action d'abord sur mobile : visible dès la sélection */}
        <div className="order-1 lg:order-2 lg:col-span-5">
          {selectedRdv ? (
            <ReceptionActionPanel
              selectedRdv={selectedRdv}
              visiteActive={visiteActive}
              visiteClosedMessage={visiteClosedMessage}
              isRdvDuJour={isRdvDuJour(selectedRdv)}
              dossierNotifs={dossierNotifs}
              historique={historique}
              historiqueOpen={historiqueOpen}
              onToggleHistorique={() => setHistoriqueOpen((v) => !v)}
              actionLoading={actionLoading}
              actionError={actionError}
              notifActionId={notifActionId}
              onAction={handleQuickAction}
              onDecision={handleQuickAction}
              onClose={clearSelection}
              onNotificationLue={(id) => void handleNotificationLue(id)}
              onNotificationTraitee={(id) => void handleNotificationTraitee(id)}
            />
          ) : (
            <SectionCard title="Action">
              <p className="text-sm text-anthracite-muted">
                Cliquez sur un rendez-vous pour agir.
              </p>
            </SectionCard>
          )}
        </div>

        <div className="order-2 lg:order-1 lg:col-span-7">
          <SectionCard
            title={searchMode ? 'Résultats' : activeTab === 'aujourdhui' ? 'Rendez-vous du jour' : 'Rendez-vous à venir'}
            subtitle={`${displayedList.length} entrée(s)`}
          >
            {listLoading && <SkeletonList rows={4} label="Chargement" />}
            {listError && (
              <p className="text-sm text-danger" role="alert">
                {listError}
              </p>
            )}
            {!listLoading && displayedList.length === 0 && (
              <p className="text-sm text-anthracite-muted">Aucun rendez-vous pour cette vue.</p>
            )}
            {!listLoading && displayedList.length > 0 && (
              <ReceptionAppointmentList
                items={displayedList}
                selectedId={selectedRdv?.id}
                onSelect={selectRdv}
                showDate={activeTab === 'avenir' || searchMode}
              />
            )}
            {searching && <p className="mt-2 text-sm text-anthracite-muted">Recherche…</p>}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
