import { useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '../../api/client';
import {
  changerDisponibilite,
  cloturerPriseEnCharge,
  demarrerPriseEnCharge,
  fetchPersonnelsDemo,
  fetchRendezVousPersonnel,
  getStoredPersonnelId,
  storePersonnelId,
} from '../../api/personnel';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { AppointmentTable } from '../../components/appointments/AppointmentTable';
import { PersonnelSelector } from '../../components/personnel/PersonnelSelector';
import { AvailabilityBadge } from '../../components/ui/AvailabilityBadge';
import { Button } from '../../components/ui/Button';
import { SectionCard } from '../../components/ui/SectionCard';
import { SkeletonList } from '../../components/ui/Skeleton';
import type { Personnel, RendezVous } from '../../types/api';
import { fullName } from '../../utils/format';

export function PersonnelPage() {
  const [personnels, setPersonnels] = useState<Personnel[]>([]);
  const [personnelsLoading, setPersonnelsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [rdvList, setRdvList] = useState<RendezVous[]>([]);
  const [rdvLoading, setRdvLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRdvId, setSelectedRdvId] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      setPersonnelsLoading(true);
      try {
        const list = await fetchPersonnelsDemo();
        setPersonnels(list);
        const stored = getStoredPersonnelId();
        const initial =
          stored && list.some((p) => p.id === stored) ? stored : list[0]?.id ?? null;
        setSelectedId(initial);
      } catch (e) {
        setError(
          e instanceof ApiClientError ? e.message : 'Impossible de charger la liste du personnel.',
        );
      } finally {
        setPersonnelsLoading(false);
      }
    })();
  }, []);

  const loadRdv = useCallback(async (personnelId: number) => {
    setRdvLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const rdvs = await fetchRendezVousPersonnel(personnelId);
      setRdvList(rdvs);
      const fromList = personnels.find((p) => p.id === personnelId);
      const fromRdv = rdvs[0]?.personnel;
      setPersonnel(
        fromList
          ? { ...fromList, ...(fromRdv ?? {}), bureau: fromList.bureau ?? fromRdv?.bureau }
          : fromRdv ?? null,
      );
    } catch (e) {
      setRdvList([]);
      setPersonnel(personnels.find((p) => p.id === personnelId) ?? null);
      setError(e instanceof ApiClientError ? e.message : 'Chargement des rendez-vous impossible.');
    } finally {
      setRdvLoading(false);
    }
  }, [personnels]);

  useEffect(() => {
    if (selectedId) {
      storePersonnelId(selectedId);
      void loadRdv(selectedId);
    }
  }, [selectedId, loadRdv]);

  const handleSelectPersonnel = (id: number) => {
    setSelectedId(id);
    setSelectedRdvId(null);
    setActionError(null);
  };

  const runRdvAction = async (rdvId: number, fn: () => Promise<RendezVous>, success: string) => {
    if (!selectedId) return;
    setActionLoading(rdvId);
    setActionError(null);
    setSuccessMessage(null);
    try {
      await fn();
      await loadRdv(selectedId);
      setSuccessMessage(success);
    } catch (e) {
      setActionError(e instanceof ApiClientError ? e.message : 'Action impossible.');
    } finally {
      setActionLoading(null);
    }
  };

  const setDispo = async (dispo: Personnel['disponibiliteOperationnelle'], motif?: string) => {
    if (!selectedId) return;
    setActionLoading(-1);
    setActionError(null);
    setSuccessMessage(null);
    try {
      const p = await changerDisponibilite(selectedId, {
        disponibiliteOperationnelle: dispo,
        motifNonReception: motif ?? null,
      });
      setPersonnel((prev) => (prev ? { ...prev, ...p } : p));
      setSuccessMessage(
        dispo === 'DISPONIBLE' ? 'Vous êtes marqué disponible pour la réception.' : 'Statut mis à jour.',
      );
    } catch (e) {
      setActionError(e instanceof ApiClientError ? e.message : 'Mise à jour impossible.');
    } finally {
      setActionLoading(null);
    }
  };

  const canDemarrer = (statut: RendezVous['statut']) => statut === 'ARRIVE';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-institution md:text-3xl">
          Interface personnel
        </h1>
        <p className="mt-2 text-sm text-anthracite-muted md:text-base">
          Le choix du personnel simule l&apos;utilisateur connecté (MVP sans authentification).
        </p>
      </header>

      <div className="rounded-[6px] border border-institution/25 bg-institution/5 px-4 py-3 text-sm text-anthracite">
        Le personnel clôture la prise en charge ; <strong>la réception décide de la suite</strong>.
        Après clôture, la réception est notifiée. Le personnel ne décide pas de l&apos;orientation ni
        de la circulation de l&apos;usager.
      </div>

      <SectionCard title="Choisir le personnel" accent>
        <PersonnelSelector
          personnels={personnels}
          selectedId={selectedId}
          onSelect={handleSelectPersonnel}
          loading={personnelsLoading}
        />
      </SectionCard>

      {personnel && (
        <SectionCard
          title={fullName(personnel.prenom, personnel.nom)}
          subtitle={`${personnel.fonction} — ${personnel.bureau?.nom ?? 'Bureau'}`}
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <AvailabilityBadge
              disponibilite={personnel.disponibiliteOperationnelle}
              motif={personnel.motifNonReception}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={actionLoading !== null}
              onClick={() =>
                void setDispo('NON_DISPONIBLE_POUR_RECEPTION', 'Déjà en prise en charge')
              }
              className="min-h-11 rounded-[6px] border border-border bg-surface px-4 text-sm font-semibold hover:border-institution disabled:opacity-50"
            >
              Non disponible pour réception
            </button>
            <button
              type="button"
              disabled={actionLoading !== null}
              onClick={() => void setDispo('DISPONIBLE')}
              className="min-h-11 rounded-[6px] border border-institution/30 bg-institution/5 px-4 text-sm font-semibold text-institution disabled:opacity-50"
            >
              Disponible
            </button>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Rendez-vous assignés aujourd&apos;hui">
        {rdvLoading && <SkeletonList rows={3} label="Chargement des rendez-vous" />}
        {!rdvLoading && !selectedId && (
          <p className="text-sm text-anthracite-muted">Choisissez un personnel ci-dessus.</p>
        )}
        {!rdvLoading && selectedId && rdvList.length === 0 && (
          <p className="text-sm text-anthracite-muted">Aucun rendez-vous assigné aujourd&apos;hui.</p>
        )}
        {!rdvLoading && rdvList.length > 0 && (
          <>
            {/* Desktop : tableau sélectionnable, les actions s'affichent sous la ligne cliquée. */}
            <div className="hidden lg:block">
              <p className="mb-2 text-xs text-anthracite-muted">
                Cliquez sur une ligne pour afficher les actions.
              </p>
              <AppointmentTable
                items={rdvList}
                showInternalDetails
                selectedId={selectedRdvId ?? undefined}
                onSelect={(rdv) =>
                  setSelectedRdvId((current) => (current === rdv.id ? null : rdv.id))
                }
                renderInlineDetails={(rdv) => (
                  <RdvActions
                    rdv={rdv}
                    loading={actionLoading === rdv.id}
                    canDemarrer={canDemarrer(rdv.statut)}
                    onDemarrer={() =>
                      void runRdvAction(rdv.id, () => demarrerPriseEnCharge(selectedId!, rdv.id), '')
                    }
                    onCloturer={() =>
                      void runRdvAction(
                        rdv.id,
                        () => cloturerPriseEnCharge(selectedId!, rdv.id),
                        'Prise en charge clôturée. Réception notifiée.',
                      )
                    }
                  />
                )}
              />
            </div>
            {/* Mobile / tablette : cartes avec actions directes. */}
            <div className="space-y-4 lg:hidden">
              {rdvList.map((rdv) => (
                <RdvRow
                  key={rdv.id}
                  rdv={rdv}
                  loading={actionLoading === rdv.id}
                  canDemarrer={canDemarrer(rdv.statut)}
                  onDemarrer={() =>
                    void runRdvAction(rdv.id, () => demarrerPriseEnCharge(selectedId!, rdv.id), '')
                  }
                  onCloturer={() =>
                    void runRdvAction(
                      rdv.id,
                      () => cloturerPriseEnCharge(selectedId!, rdv.id),
                      'Prise en charge clôturée. Réception notifiée.',
                    )
                  }
                />
              ))}
            </div>
          </>
        )}
        {successMessage && (
          <p className="mt-4 rounded-[6px] border border-institution/30 bg-institution/10 px-3 py-2 text-sm text-institution" role="status">
            {successMessage}
          </p>
        )}
        {actionError && (
          <p className="mt-4 text-sm text-danger" role="alert">
            {actionError}
          </p>
        )}
        {error && !personnelsLoading && (
          <p className="mt-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </SectionCard>
    </div>
  );
}

interface RdvActionsProps {
  rdv: RendezVous;
  loading: boolean;
  canDemarrer: boolean;
  onDemarrer: () => void;
  onCloturer: () => void;
}

/** Boutons de prise en charge, partagés entre le tableau desktop et les cartes mobiles. */
function RdvActions({ rdv, loading, canDemarrer, onDemarrer, onCloturer }: RdvActionsProps) {
  if (rdv.statut === 'TERMINE') {
    return (
      <p className="text-sm font-medium text-institution">
        Prise en charge clôturée — réception notifiée.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button disabled={loading || !canDemarrer} onClick={onDemarrer}>
        Démarrer la prise en charge
      </Button>
      <Button variant="accent" disabled={loading || rdv.statut !== 'EN_COURS'} onClick={onCloturer}>
        Clôturer et notifier la réception
      </Button>
    </div>
  );
}

function RdvRow(props: RdvActionsProps) {
  return (
    <div className="space-y-3 rounded-[6px] border border-border bg-ivory/40 p-4">
      <AppointmentCard rdv={props.rdv} />
      <RdvActions {...props} />
    </div>
  );
}
