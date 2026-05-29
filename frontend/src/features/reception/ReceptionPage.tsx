import { AppointmentTable } from '../../components/appointments/AppointmentTable';
import { HistoriqueList } from '../../components/historique/HistoriqueList';
import { NotificationPanel } from '../../components/notifications/NotificationPanel';
import { ProchaineActionBanner } from '../../components/reception/ProchaineActionBanner';
import { ReceptionVisitPanel } from '../../components/reception/ReceptionVisitPanel';
import { RemainingRendezVousList } from '../../components/reception/RemainingRendezVousList';
import { SearchBar } from '../../components/ui/SearchBar';
import { SectionCard } from '../../components/ui/SectionCard';
import { useReceptionPage } from './useReceptionPage';

export function ReceptionPage() {
  const {
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
  } = useReceptionPage();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-institution md:text-3xl">
          Tableau de contrôle de la réception
        </h1>
        <p className="mt-2 text-sm text-anthracite-muted md:text-base">
          Recherche, suivi des rendez-vous du jour, notifications et décisions. La réception pilote
          chaque étape — l&apos;usager ne circule pas seul.
        </p>
        <p className="mt-2 text-xs text-anthracite-muted">
          Mode démonstration MVP : les trois espaces sont accessibles sans authentification.
        </p>
      </header>

      <ProchaineActionBanner
        selectedRdv={selectedRdv}
        visiteActive={visiteActive}
        hasPendingNotifications={pendingNotifs.length > 0}
      />

      <SectionCard title="Recherche" accent>
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
            title="Notifications"
            subtitle={
              notifLoading
                ? 'Chargement…'
                : `${pendingNotifs.length} en attente`
            }
          >
            {notifLoading ? (
              <p className="text-sm text-anthracite-muted">Chargement…</p>
            ) : (
              <NotificationPanel items={pendingNotifs.length ? pendingNotifs : notifications} />
            )}
          </SectionCard>
          <SectionCard title="Historique récent">
            {visiteActive ? (
              <HistoriqueList items={historique} />
            ) : (
              <p className="text-sm text-anthracite-muted">Ouvrez une visite pour afficher l&apos;historique.</p>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6 xl:col-span-6 xl:order-2">
          <SectionCard
            title={searchMode ? 'Résultats de recherche' : 'Rendez-vous du jour'}
            subtitle={`${rdvList.length} entrée(s) — ${new Date().toLocaleDateString('fr-FR')}`}
          >
            {listLoading && <p className="text-sm text-anthracite-muted">Chargement…</p>}
            {listError && (
              <p className="text-sm text-danger" role="alert">
                {listError}
              </p>
            )}
            {!listLoading && !listError && rdvList.length === 0 && (
              <p className="text-sm text-anthracite-muted">Aucun rendez-vous pour cette vue.</p>
            )}
            {!listLoading && rdvList.length > 0 && (
              <>
                <AppointmentTable
                  items={rdvList}
                  selectedId={selectedRdv?.id}
                  onSelect={selectRdv}
                />
                {selectedRdv && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {selectedRdv.statut === 'CONFIRME' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleArrivee}
                        className="min-h-11 rounded-[6px] border border-institution bg-institution px-4 text-sm font-semibold text-ivory disabled:opacity-50"
                      >
                        Enregistrer l&apos;arrivée
                      </button>
                    )}
                    {selectedRdv.statut === 'ARRIVE' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleOuvrirVisite}
                        className="min-h-11 rounded-[6px] border border-copper bg-copper/10 px-4 text-sm font-semibold disabled:opacity-50"
                      >
                        Ouvrir la visite
                      </button>
                    )}
                    <span className="self-center text-xs text-anthracite-muted">
                      {selectedRdv.reference} — {selectedRdv.statut}
                    </span>
                  </div>
                )}
              </>
            )}
            {searching && (
              <p className="mt-2 text-sm text-anthracite-muted">Recherche en cours…</p>
            )}
          </SectionCard>

          <SectionCard title="Visite active" accent>
            <ReceptionVisitPanel
              visiteActive={visiteActive}
              actionLoading={actionLoading}
              actionError={actionError}
              onOrienter={handleOrienter}
              onAttendre={() => handleDecision('ATTENDRE')}
              onCloturer={handleCloturerVisite}
              onReporter={() => handleDecision('REPORTER')}
              onReorienter={() => handleDecision('REORIENTER')}
            />
          </SectionCard>

          {visiteActive && visiteActive.rendezVous.length > 0 && (
            <SectionCard title="Rendez-vous restants" accent>
              <p className="mb-4 text-sm text-anthracite-muted">
                L&apos;usager peut avoir plusieurs rendez-vous le même jour, y compris dans le même
                bureau avec des personnels différents. La réception décide de la suite — pas de passage
                automatique.
              </p>
              <RemainingRendezVousList items={visiteActive.rendezVous} />
            </SectionCard>
          )}
        </div>

        <div className="hidden xl:col-span-3 xl:order-3 xl:block">
          <SectionCard title="Aide décision">
            <ul className="space-y-3 text-sm text-anthracite-muted">
              <li>La réception oriente et décide — l&apos;usager ne circule pas seul.</li>
              <li>Le personnel notifie en fin de prise en charge.</li>
              <li>Pas de clôture automatique sans action explicite.</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
