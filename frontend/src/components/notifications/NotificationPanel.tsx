import type { Notification, TypeNotification } from '../../types/api';
import { formatTime } from '../../utils/format';

const typeLabels: Record<TypeNotification, string> = {
  ARRIVEE_USAGER: 'Arrivée',
  FIN_PRISE_EN_CHARGE: 'Prise en charge terminée',
  PERSONNEL_NON_DISPONIBLE: 'Personnel indisponible',
  DECISION_RECEPTION: 'Décision attendue',
};

interface NotificationPanelProps {
  items: Notification[];
}

export function NotificationPanel({ items }: NotificationPanelProps) {
  if (items.length === 0) {
    return <p className="text-sm text-anthracite-muted">Aucun message en attente.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((n) => (
        <li
          key={n.id}
          className="rounded-[6px] border border-border border-l-4 border-l-copper bg-ivory/80 px-3 py-3"
        >
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-copper">
              {typeLabels[n.type]}
            </span>
            <time className="text-xs text-anthracite-muted">{formatTime(n.createdAt)}</time>
          </div>
          <p className="text-sm leading-snug text-anthracite">{n.message}</p>
        </li>
      ))}
    </ul>
  );
}
