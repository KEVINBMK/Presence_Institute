import { STATUT_RDV_LABELS, statutRdvTone } from '../../constants/status';
import type { RendezVous } from '../../types/api';
import { fullName } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';

interface AppointmentCardProps {
  rdv: RendezVous;
  onSelect?: () => void;
  selected?: boolean;
}

export function AppointmentCard({ rdv, onSelect, selected }: AppointmentCardProps) {
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
        {fullName(rdv.usager.prenom, rdv.usager.nom)}
      </p>
      <p className="mt-1 text-sm text-anthracite-muted">{rdv.bureau.nom}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <span>
          {rdv.heureDebut && rdv.heureFin
            ? `${rdv.heureDebut} — ${rdv.heureFin}`
            : 'Créneau à planifier'}
        </span>
        <span>{rdv.usager.telephone}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-anthracite-muted">{rdv.motif}</p>
    </article>
  );
}
