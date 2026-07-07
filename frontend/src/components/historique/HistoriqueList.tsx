import type { HistoriqueAction } from '../../types/api';
import { formatTime } from '../../utils/format';

interface HistoriqueListProps {
  items: HistoriqueAction[];
}

export function HistoriqueList({ items }: HistoriqueListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-anthracite-muted">
        Aucune action enregistrée pour cette visite pour le moment.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-border pl-4">
      {items.map((h) => (
        <li key={h.id} className="mb-4 last:mb-0">
          <span className="absolute -left-[5px] mt-1.5 h-2 w-2 rounded-full bg-institution" />
          <p className="text-xs font-semibold uppercase tracking-wide text-institution">
            {h.typeAction.replace(/_/g, ' ')}
          </p>
          <p className="mt-0.5 text-sm text-anthracite">{h.description}</p>
          <time className="mt-1 block text-xs text-anthracite-muted">
            {formatTime(h.createdAt)}
          </time>
        </li>
      ))}
    </ol>
  );
}
