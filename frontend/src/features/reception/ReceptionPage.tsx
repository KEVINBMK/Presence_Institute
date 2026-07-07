import { useCallback } from 'react';
import { AppointmentTable } from '../../components/appointments/AppointmentTable';
import { HistoriqueList } from '../../components/historique/HistoriqueList';
import { NotificationPanel } from '../../components/notifications/NotificationPanel';
import { ProchaineActionBanner } from '../../components/reception/ProchaineActionBanner';
import { ReceptionVisitPanel } from '../../components/reception/ReceptionVisitPanel';
import { RemainingRendezVousList } from '../../components/reception/RemainingRendezVousList';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { SectionCard } from '../../components/ui/SectionCard';
import { SkeletonList } from '../../components/ui/Skeleton';
import type { QuickActionId } from '../../utils/receptionQuickActions';
import { renderReceptionBubble } from './renderReceptionBubble';
import { useReceptionPage } from './useReceptionPage';

export function ReceptionPage() {
  const {
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
  } = useReceptionPage();

  const scrollToMessages = useCallback(() => {
    document.getElementById('reception-messages')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

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
          handleDecision('REPORTER');
          break;
        case 'reorienter':
          handleDecision('REORIENTER');
          break;
        case 'voir_message':
          scrollToMessages();
          break;
        case 'voir_demande':
        case 'voir_detail':
        case 'marquer_a_traiter':
        case 'attendre_personnel':
        case 'decider_suite':
          if (visiteActive) {
            scrollToHistorique();
          }
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
      scrollToMessages,
      scrollToHistorique,
      visiteActive,
    ],
  );

  const bubbleCtx = {
    selectedRdv,
    visiteActive,
    isRdvDuJour,
    pendingNotifsCount: pendingNotifs.length,
    actionLoading,
    actionError,
    onQuickAction: handleQuickAction,
    onClose: clearSelection,
    onVoirHistorique: scrollToHistorique,
  };

  const renderBubble = (rdv: Parameters<typeof renderReceptionBubble>[0]) =>
    renderReceptionBubble(rdv, bubbleCtx);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-institution md:text-3xl">
          Accueil — réception
        </h1>
        <p className="mt-2 text-sm text-anthracite-muted md:text-base">
          Cliquez sur un rendez-vous pour agir directement depuis la file. La réception pilote
          chaque étape.
        </p>
        <p className="mt-1 text-xs text-anthracite-muted">
          Actualisation automatique toutes les 30 secondes
          {lastRefreshAt &&
            ` — dernière mise à jour à ${lastRefreshAt.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}`}
          .
        </p>
      </header>

      {selectedRdv && (
        <ProchaineActionBanner
          selectedRdv={selectedRdv}
          visiteActive={visiteActive}
          hasPendingNotifications={pendingNotifs.length > 0}
        />
      )}

      <SectionCard title="Rechercher un usager" accent>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={() => void handleSearch()}
        />
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

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-3 xl:order-1">
          <SectionCard
            title="Messages reçus"
            subtitle={
              notifLoading
                ? 'Chargement…'
                : notifError
                  ? 'Erreur de chargement'
                  : `${pendingNotifs.length} en attente`
            }
          >
            <div id="reception-messages">
              {notifLoading && <SkeletonList rows={2} label="Chargement des messages" />}
              {!notifLoading && notifError && (
                <div className="space-y-2">
                  <p className="text-sm text-danger" role="alert">
                    {notifError}
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => void loadNotifications()}>
                    Réessayer
                  </Button>
                </div>
              )}
              {!notifLoading && !notifError && (
                <NotificationPanel
                  items={pendingNotifs.length ? pendingNotifs : notifications}
                  actionLoadingId={notifActionId}
                  onMarquerLue={(id) => void handleNotificationLue(id)}
                  onMarquerTraitee={(id) => void handleNotificationTraitee(id)}
                />
              )}
            </div>
          </SectionCard>
          <SectionCard title="Historique">
            <div id="reception-historique">
              {visiteActive ? (
                <HistoriqueList items={historique} />
              ) : (
                <p className="text-sm text-anthracite-muted">
                  Ouvrez une visite pour consulter l&apos;historique.
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6 xl:col-span-6 xl:order-2">
          <SectionCard
            title={searchMode ? 'Résultats de recherche' : 'Rendez-vous du jour'}
            subtitle={`${rdvList.length} entrée(s) — ${new Date().toLocaleDateString('fr-FR')}`}
          >
            {listLoading && <SkeletonList rows={4} label="Chargement des rendez-vous" />}
            {listError && (
              <p className="text-sm text-danger" role="alert">
                {listError}
              </p>
            )}
            {!listLoading && !listError && rdvList.length === 0 && (
              <p className="text-sm text-anthracite-muted">Aucun rendez-vous pour cette vue.</p>
            )}
            {!listLoading && rdvList.length > 0 && (
              <AppointmentTable
                items={rdvList}
                selectedId={selectedRdv?.id}
                onSelect={selectRdv}
                showInternalDetails
                showDate={searchMode}
                renderInlineDetails={renderBubble}
              />
            )}
            {searching && (
              <p className="mt-2 text-sm text-anthracite-muted">Recherche en cours…</p>
            )}
          </SectionCard>

          {!searchMode && (
            <SectionCard
              title="Rendez-vous à venir"
              subtitle={`${rdvAVenir.length} sur les 14 prochains jours`}
            >
              {listLoading && <SkeletonList rows={3} label="Chargement des rendez-vous à venir" />}
              {!listLoading && rdvAVenir.length === 0 && (
                <p className="text-sm text-anthracite-muted">
                  Aucun rendez-vous planifié pour les prochains jours.
                </p>
              )}
              {!listLoading && rdvAVenir.length > 0 && (
                <AppointmentTable
                  items={rdvAVenir}
                  selectedId={selectedRdv?.id}
                  onSelect={selectRdv}
                  showInternalDetails
                  showDate
                  renderInlineDetails={renderBubble}
                />
              )}
            </SectionCard>
          )}

          <SectionCard title="Visite en cours" accent>
            <ReceptionVisitPanel
              visiteActive={visiteActive}
              actionLoading={actionLoading}
              actionError={actionError}
              compact
              onOrienter={handleOrienter}
              onAttendre={() => handleDecision('ATTENDRE')}
              onCloturer={handleCloturerVisite}
              onReporter={() => handleDecision('REPORTER')}
              onReorienter={() => handleDecision('REORIENTER')}
            />
          </SectionCard>

          {visiteActive && visiteActive.rendezVous.length > 0 && (
            <SectionCard title="Autres rendez-vous du jour" accent>
              <RemainingRendezVousList items={visiteActive.rendezVous} />
            </SectionCard>
          )}
        </div>

        <div className="hidden xl:col-span-3 xl:order-3 xl:block">
          <SectionCard title="Rappels">
            <ul className="space-y-3 text-sm text-anthracite-muted">
              <li>Cliquez sur un rendez-vous pour voir les actions.</li>
              <li>La réception oriente et décide.</li>
              <li>L&apos;usager ne circule pas seul dans le bâtiment.</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
