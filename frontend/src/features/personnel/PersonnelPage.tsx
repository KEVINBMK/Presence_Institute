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
import { SectionCard } from '../../components/ui/SectionCard';
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
        {rdvLoading && <p className="text-sm text-anthracite-muted">Chargement…</p>}
        {!rdvLoading && !selectedId && (
          <p className="text-sm text-anthracite-muted">Choisissez un personnel ci-dessus.</p>
        )}
        {!rdvLoading && selectedId && rdvList.length === 0 && (
          <p className="text-sm text-anthracite-muted">Aucun rendez-vous assigné aujourd&apos;hui.</p>
        )}
        {!rdvLoading && rdvList.length > 0 && (
          <>
            <div className="hidden md:block">
              <AppointmentTable items={rdvList} />
            </div>
            <div className="mt-4 space-y-4">
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

function RdvRow({
  rdv,
  loading,
  canDemarrer,
  onDemarrer,
  onCloturer,
}: {
  rdv: RendezVous;
  loading: boolean;
  canDemarrer: boolean;
  onDemarrer: () => void;
  onCloturer: () => void;
}) {
  const termine = rdv.statut === 'TERMINE';

  return (
    <div className="space-y-3 rounded-[6px] border border-border bg-ivory/40 p-4">
      <AppointmentCard rdv={rdv} />
      {termine ? (
        <p className="text-sm font-medium text-institution">Prise en charge clôturée — réception notifiée.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || !canDemarrer}
            onClick={onDemarrer}
            className="min-h-11 rounded-[6px] border border-institution bg-institution px-4 text-sm font-semibold text-ivory disabled:opacity-50"
          >
            Démarrer la prise en charge
          </button>
          <button
            type="button"
            disabled={loading || rdv.statut !== 'EN_COURS'}
            onClick={onCloturer}
            className="min-h-11 rounded-[6px] border border-copper bg-copper/10 px-4 text-sm font-semibold disabled:opacity-50"
          >
            Clôturer et notifier la réception
          </button>
        </div>
      )}
    </div>
  );
}
