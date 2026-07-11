import { useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '../../api/client';
import {
  changerMaDisponibilite,
  cloturerPriseEnCharge,
  demarrerPriseEnCharge,
  fetchMesRendezVous,
  fetchMonProfil,
} from '../../api/personnel';
import { PersonnelAppointmentCard } from '../../components/personnel/PersonnelAppointmentCard';
import { AvailabilityBadge } from '../../components/ui/AvailabilityBadge';
import { SectionCard } from '../../components/ui/SectionCard';
import { SkeletonList } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/ToastProvider';
import type { DisponibilitePersonnel, Personnel, RendezVous } from '../../types/api';
import { fullName } from '../../utils/format';

const DISPO_OPTIONS: { value: DisponibilitePersonnel; label: string }[] = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'OCCUPE', label: 'Occupé' },
  { value: 'NON_DISPONIBLE_POUR_RECEPTION', label: 'Indisponible pour recevoir' },
];

export function usePersonnelPage() {
  const { showToast } = useToast();
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [rdvList, setRdvList] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profil, rdvs] = await Promise.all([fetchMonProfil(), fetchMesRendezVous()]);
      setPersonnel(profil);
      setRdvList(rdvs);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setDispo = async (dispo: DisponibilitePersonnel) => {
    setActionLoading(-1);
    try {
      const p = await changerMaDisponibilite({
        disponibiliteOperationnelle: dispo,
        motifNonReception: dispo === 'NON_DISPONIBLE_POUR_RECEPTION' ? 'Indisponible' : null,
      });
      setPersonnel((prev) => (prev ? { ...prev, ...p } : p));
      showToast('Disponibilité mise à jour.', 'success');
    } catch (e) {
      showToast(e instanceof ApiClientError ? e.message : 'Mise à jour impossible.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const runRdvAction = async (rdvId: number, fn: () => Promise<RendezVous>, success: string) => {
    setActionLoading(rdvId);
    try {
      await fn();
      await load();
      showToast(success, 'success');
    } catch (e) {
      showToast(e instanceof ApiClientError ? e.message : 'L’action n’a pas pu être enregistrée.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return {
    personnel,
    rdvList,
    loading,
    error,
    actionLoading,
    load,
    setDispo,
    runRdvAction,
    demarrer: (rdvId: number) =>
      runRdvAction(rdvId, () => demarrerPriseEnCharge(rdvId), 'Prise en charge démarrée.'),
    cloturer: (rdvId: number) =>
      runRdvAction(
        rdvId,
        () => cloturerPriseEnCharge(rdvId),
        'Prise en charge clôturée. La réception a été informée.',
      ),
  };
}

export function PersonnelPage() {
  const { personnel, rdvList, loading, error, actionLoading, setDispo, demarrer, cloturer } =
    usePersonnelPage();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-institution md:text-3xl">Mon espace personnel</h1>
        <p className="mt-2 text-sm text-anthracite-muted">
          Consultez vos rendez-vous assignés et gérez votre disponibilité.
        </p>
      </header>

      {personnel && (
        <SectionCard
          title={fullName(personnel.prenom, personnel.nom)}
          subtitle={`${personnel.fonction} — ${personnel.bureau?.nom ?? 'Bureau'}`}
          accent
        >
          <AvailabilityBadge
            disponibilite={personnel.disponibiliteOperationnelle}
            motif={personnel.motifNonReception}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {DISPO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={actionLoading !== null}
                onClick={() => void setDispo(opt.value)}
                className={`min-h-10 rounded-[6px] border px-3 text-sm font-semibold disabled:opacity-50 ${
                  personnel.disponibiliteOperationnelle === opt.value
                    ? 'border-institution bg-institution/10 text-institution'
                    : 'border-border hover:border-institution'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Mes rendez-vous du jour">
        {loading && <SkeletonList rows={3} label="Chargement" />}
        {!loading && rdvList.length === 0 && (
          <p className="text-sm text-anthracite-muted">Aucun rendez-vous assigné aujourd&apos;hui.</p>
        )}
        <div className="space-y-3">
          {rdvList.map((rdv) => (
            <PersonnelAppointmentCard
              key={rdv.id}
              rdv={rdv}
              loading={actionLoading === rdv.id}
              onDemarrer={() => void demarrer(rdv.id)}
              onCloturer={() => void cloturer(rdv.id)}
            />
          ))}
        </div>
        {error && (
          <p className="mt-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </SectionCard>
    </div>
  );
}
