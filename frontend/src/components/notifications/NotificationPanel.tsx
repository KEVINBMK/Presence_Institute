import type { Notification, TypeNotification } from '../../types/api';
import { formatTime } from '../../utils/format';
import { Button } from '../ui/Button';

const typeLabels: Record<TypeNotification, string> = {
  ARRIVEE_USAGER: 'Arrivée',
  FIN_PRISE_EN_CHARGE: 'Prise en charge terminée',
  PERSONNEL_NON_DISPONIBLE: 'Personnel indisponible',
  DECISION_RECEPTION: 'Décision attendue',
};

interface NotificationPanelProps {
  items: Notification[];
  /** Id de la notification dont une action est en cours (désactive ses boutons). */
  actionLoadingId?: number | null;
  onMarquerLue?: (id: number) => void;
  onMarquerTraitee?: (id: number) => void;
}

export function NotificationPanel({
  items,
  actionLoadingId = null,
  onMarquerLue,
  onMarquerTraitee,
}: NotificationPanelProps) {
  if (items.length === 0) {
    return <p className="text-sm text-anthracite-muted">Aucun message en attente.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((n) => {
        const loading = actionLoadingId === n.id;
        return (
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
            {n.readAt && !n.treatedAt && (
              <p className="mt-1 text-xs text-anthracite-muted">Lu — en attente de traitement.</p>
            )}
            {(onMarquerLue || onMarquerTraitee) && !n.treatedAt && (
              <div className="mt-2 flex flex-wrap gap-2">
                {onMarquerLue && !n.readAt && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={loading}
                    onClick={() => onMarquerLue(n.id)}
                  >
                    Marquer comme lu
                  </Button>
                )}
                {onMarquerTraitee && (
                  <Button
                    variant="accent"
                    size="sm"
                    disabled={loading}
                    onClick={() => onMarquerTraitee(n.id)}
                  >
                    Marquer comme traité
                  </Button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
