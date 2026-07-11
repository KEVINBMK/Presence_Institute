import { STATUT_RDV_LABELS, statutRdvTone } from '../../constants/status';
import type { RendezVous } from '../../types/api';
import { fullName } from '../../utils/format';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface PersonnelAppointmentCardProps {
  rdv: RendezVous;
  loading: boolean;
  onDemarrer: () => void;
  onCloturer: () => void;
}

export function PersonnelAppointmentCard({
  rdv,
  loading,
  onDemarrer,
  onCloturer,
}: PersonnelAppointmentCardProps) {
  const horaire = rdv.heureDebut && rdv.heureFin ? rdv.heureDebut : 'Horaire à confirmer';
  const visiteur = rdv.usager ? fullName(rdv.usager.prenom, rdv.usager.nom) : '—';

  if (rdv.statut === 'TERMINE') {
    return (
      <article className="rounded-[6px] border border-border bg-surface p-4">
        <p className="text-sm font-medium text-institution">Prise en charge clôturée</p>
        <p className="mt-1 text-sm text-anthracite-muted">La réception a été informée.</p>
      </article>
    );
  }

  return (
    <article className="rounded-[6px] border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-anthracite">
            {horaire} — {visiteur}
          </p>
          <p className="mt-1 text-sm text-anthracite-muted">Motif : {rdv.motif}</p>
        </div>
        <StatusBadge label={STATUT_RDV_LABELS[rdv.statut]} tone={statutRdvTone(rdv.statut)} />
      </div>

      {rdv.statut === 'EN_COURS' ? (
        <Button variant="accent" className="mt-4 w-full sm:w-auto" disabled={loading} onClick={onCloturer}>
          Clôturer et notifier la réception
        </Button>
      ) : (
        <Button className="mt-4 w-full sm:w-auto" disabled={loading || rdv.statut !== 'ARRIVE'} onClick={onDemarrer}>
          Démarrer la prise en charge
        </Button>
      )}
    </article>
  );
}
