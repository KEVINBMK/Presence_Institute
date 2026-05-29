import { DecisionActions } from '../visits/DecisionActions';
import { VisitCard } from '../visits/VisitCard';
import type { Visite } from '../../types/api';

export interface ReceptionVisitPanelProps {
  visiteActive: Visite | null;
  actionLoading: boolean;
  actionError: string | null;
  onOrienter: () => void;
  onAttendre: () => void;
  onCloturer: () => void;
  onReporter: () => void;
  onReorienter: () => void;
}

export function ReceptionVisitPanel({
  visiteActive,
  actionLoading,
  actionError,
  onOrienter,
  onAttendre,
  onCloturer,
  onReporter,
  onReorienter,
}: ReceptionVisitPanelProps) {
  return (
    <>
      {visiteActive ? (
        <>
          <VisitCard visite={visiteActive} />
          <div className="mt-6 border-t border-border pt-6">
            <DecisionActions
              disabled={actionLoading}
              onOrienter={onOrienter}
              onAttendre={onAttendre}
              onCloturer={onCloturer}
              onReporter={onReporter}
              onReorienter={onReorienter}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-anthracite-muted">
          Sélectionnez un rendez-vous, enregistrez l&apos;arrivée puis ouvrez une visite pour activer les
          décisions.
        </p>
      )}
      {actionError && (
        <p
          className="mt-4 rounded-[6px] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {actionError}
        </p>
      )}
    </>
  );
}
