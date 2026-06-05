import { STATUT_RDV_LABELS, statutRdvTone } from '../../constants/status';
import type { RendezVous } from '../../types/api';
import { formatDateFr, fullName } from '../../utils/format';
import { messageFonctionNonDisponible } from '../../utils/rendezVousDisplay';
import { StatusBadge } from '../ui/StatusBadge';

interface AppointmentCardProps {
  rdv: RendezVous;
  onSelect?: () => void;
  selected?: boolean;
  /** Réception / personnel : affiche personnel assigné et alertes internes. */
  showInternalDetails?: boolean;
  showDate?: boolean;
}

export function AppointmentCard({
  rdv,
  onSelect,
  selected,
  showInternalDetails = false,
  showDate = false,
}: AppointmentCardProps) {
  const alerteFonction = showInternalDetails ? messageFonctionNonDisponible(rdv) : null;

  return (
    <article
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect?.()}
      className={`rounded-[6px] border bg-surface p-4 transition-colors ${
        selected ? 'border-institution ring-1 ring-institution' : 'border-border hover:border-institution/40'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <span className="font-mono text-xs text-anthracite-muted">{rdv.reference}</span>
        <StatusBadge label={STATUT_RDV_LABELS[rdv.statut]} tone={statutRdvTone(rdv.statut)} />
      </div>
      <p className="font-serif text-base text-anthracite">
        {rdv.usager ? fullName(rdv.usager.prenom, rdv.usager.nom) : '—'}
      </p>
      <p className="mt-1 text-sm text-anthracite-muted">{rdv.bureau.nom}</p>
      {showDate && (
        <p className="mt-1 text-sm font-medium text-institution">{formatDateFr(rdv.dateRendezVous)}</p>
      )}
      {rdv.fonctionSouhaitee && (
        <p className="mt-2 text-sm text-anthracite">
          <span className="text-xs uppercase text-anthracite-muted">Fonction souhaitée — </span>
          {rdv.fonctionSouhaitee}
        </p>
      )}
      {alerteFonction && (
        <p className="mt-2 rounded-[6px] border border-copper/40 bg-copper/10 px-2 py-1 text-xs font-medium text-copper">
          {alerteFonction}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <span>
          {rdv.heureDebut && rdv.heureFin
            ? `${rdv.heureDebut} — ${rdv.heureFin}`
            : 'Horaire à confirmer'}
        </span>
        {rdv.usager && <span>{rdv.usager.telephone}</span>}
      </div>
      {showInternalDetails && rdv.personnel && (
        <p className="mt-2 text-sm text-institution">
          Personnel assigné : {fullName(rdv.personnel.prenom, rdv.personnel.nom)} — {rdv.personnel.fonction}
        </p>
      )}
      {showInternalDetails && (
        <p className="mt-2 line-clamp-2 text-sm text-anthracite-muted">{rdv.motif}</p>
      )}
    </article>
  );
}
