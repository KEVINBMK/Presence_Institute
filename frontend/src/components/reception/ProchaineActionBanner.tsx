import { getProchaineAction } from '../../utils/receptionGuidance';
import type { RendezVous, Visite } from '../../types/api';

interface ProchaineActionBannerProps {
  selectedRdv: RendezVous | null;
  visiteActive: Visite | null;
  hasPendingNotifications?: boolean;
}

export function ProchaineActionBanner({
  selectedRdv,
  visiteActive,
  hasPendingNotifications = false,
}: ProchaineActionBannerProps) {
  const action = getProchaineAction(selectedRdv, visiteActive, hasPendingNotifications);

  return (
    <div
      className="rounded-[6px] border border-institution/30 bg-institution/10 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-institution">
        Prochaine action — réception
      </p>
      <p className="mt-1 text-base font-semibold text-anthracite">{action.title}</p>
      {action.detail && (
        <p className="mt-1 text-sm text-anthracite-muted">{action.detail}</p>
      )}
      {selectedRdv && (
        <p className="mt-2 font-mono text-xs text-anthracite-muted">
          {selectedRdv.reference} — {selectedRdv.statut}
        </p>
      )}
    </div>
  );
}
