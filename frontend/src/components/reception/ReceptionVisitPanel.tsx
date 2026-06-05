import { useState } from 'react';
import { DecisionActions } from '../visits/DecisionActions';
import { VisitCard } from '../visits/VisitCard';
import type { Visite } from '../../types/api';
import { fullName } from '../../utils/format';
import { STATUT_VISITE_LABELS } from '../../constants/status';

export interface ReceptionVisitPanelProps {
  visiteActive: Visite | null;
  actionLoading: boolean;
  actionError: string | null;
  compact?: boolean;
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
  compact = false,
  onOrienter,
  onAttendre,
  onCloturer,
  onReporter,
  onReorienter,
}: ReceptionVisitPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!visiteActive) {
    return (
      <p className="text-sm text-anthracite-muted">
        Aucune visite ouverte. Sélectionnez un rendez-vous arrivé, puis utilisez la bulle d&apos;action
        pour ouvrir la visite.
      </p>
    );
  }

  if (compact && !expanded) {
    return (
      <>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-anthracite-muted">Visite en cours</p>
            <p className="font-mono text-sm font-semibold text-institution">{visiteActive.reference}</p>
            <p className="mt-1 text-sm font-medium text-anthracite">
              {fullName(visiteActive.usager.prenom, visiteActive.usager.nom)}
            </p>
            <p className="text-xs text-anthracite-muted">
              {STATUT_VISITE_LABELS[visiteActive.statut]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="min-h-11 rounded-[6px] border border-institution px-3 text-sm font-semibold text-institution hover:bg-institution/5"
          >
            Voir détail
          </button>
        </div>
        {actionError && (
          <p
            className="mt-3 rounded-[6px] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {actionError}
          </p>
        )}
      </>
    );
  }

  return (
    <>
      {compact && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mb-3 text-sm font-semibold text-institution hover:underline"
        >
          Réduire
        </button>
      )}
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
