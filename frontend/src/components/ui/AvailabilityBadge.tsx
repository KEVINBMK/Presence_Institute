import { DISPONIBILITE_LABELS } from '../../constants/status';
import type { DisponibilitePersonnel } from '../../types/api';
import { StatusBadge } from './StatusBadge';
import type { StatusTone } from '../../constants/status';

function dispoTone(d: DisponibilitePersonnel): StatusTone {
  switch (d) {
    case 'DISPONIBLE':
      return 'success';
    case 'OCCUPE':
      return 'warning';
    case 'NON_DISPONIBLE_POUR_RECEPTION':
      return 'danger';
  }
}

interface AvailabilityBadgeProps {
  disponibilite: DisponibilitePersonnel;
  motif?: string | null;
}

export function AvailabilityBadge({ disponibilite, motif }: AvailabilityBadgeProps) {
  return (
    <div className="flex flex-col gap-1">
      <StatusBadge label={DISPONIBILITE_LABELS[disponibilite]} tone={dispoTone(disponibilite)} />
      {motif && (
        <span className="text-xs text-anthracite-muted">{motif}</span>
      )}
    </div>
  );
}
