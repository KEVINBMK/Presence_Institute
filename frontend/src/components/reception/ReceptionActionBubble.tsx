import { useState } from 'react';
import type { RendezVous, Visite } from '../../types/api';
import { formatDateFr, fullName } from '../../utils/format';
import { messageFonctionNonDisponible } from '../../utils/rendezVousDisplay';
import {
  getQuickActions,
  prochaineActionLabel,
  statutRdvHumain,
  type QuickActionId,
  type ReceptionQuickActionContext,
} from '../../utils/receptionQuickActions';
import { StatusBadge } from '../ui/StatusBadge';
import { statutRdvTone } from '../../constants/status';

export interface ReceptionActionBubbleProps {
  rdv: RendezVous;
  visiteActive: Visite | null;
  isRdvDuJour: boolean;
  hasPendingNotifications: boolean;
  actionLoading?: boolean;
  actionError?: string | null;
  onAction: (actionId: QuickActionId) => void;
  onClose: () => void;
  onVoirHistorique?: () => void;
}

const btnPrimary =
  'min-h-11 w-full rounded-[6px] border border-institution bg-institution px-4 text-sm font-semibold text-ivory transition-colors hover:bg-institution/90 disabled:opacity-50';
const btnSecondary =
  'min-h-11 w-full rounded-[6px] border border-border bg-surface px-4 text-sm font-semibold text-anthracite transition-colors hover:border-institution/40 disabled:opacity-50';

export function ReceptionActionBubble({
  rdv,
  visiteActive,
  isRdvDuJour,
  hasPendingNotifications,
  actionLoading = false,
  actionError,
  onAction,
  onClose,
  onVoirHistorique,
}: ReceptionActionBubbleProps) {
  const [showDecisions, setShowDecisions] = useState(false);

  const ctx: ReceptionQuickActionContext = {
    rdv,
    visiteActive,
    isRdvDuJour,
    hasPendingNotifications,
  };

  const prochaineAction = prochaineActionLabel(ctx);
  const actions = getQuickActions(ctx);
  const alerteFonction = messageFonctionNonDisponible(rdv);
  const statutLabel = statutRdvHumain(rdv.statut, hasPendingNotifications);

  const horaire =
    rdv.heureDebut && rdv.heureFin ? `${rdv.heureDebut} — ${rdv.heureFin}` : 'Horaire à confirmer';

  const handleClick = (id: QuickActionId) => {
    if (id === 'decider_suite') {
      setShowDecisions(true);
      return;
    }
    onAction(id);
  };

  const decisionButtons: { id: QuickActionId; label: string }[] = [
    { id: 'orienter', label: 'Orienter' },
    { id: 'attendre', label: 'Mettre en attente' },
    { id: 'cloturer', label: 'Clôturer la visite' },
    { id: 'reporter', label: 'Reporter' },
    { id: 'reorienter', label: 'Réorienter' },
  ];

  return (
    <div
      className="relative rounded-[6px] border border-institution/25 bg-ivory p-4 shadow-sm"
      role="region"
      aria-label="Actions rapides"
    >
      <div
        className="absolute -top-2 left-6 h-3 w-3 rotate-45 border-l border-t border-institution/25 bg-ivory"
        aria-hidden
      />

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-anthracite-muted">{rdv.reference}</p>
          <p className="mt-0.5 font-serif text-base font-semibold text-anthracite">
            {rdv.usager ? fullName(rdv.usager.prenom, rdv.usager.nom) : '—'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-[6px] px-2 py-1 text-xs font-semibold text-anthracite-muted hover:bg-institution/10 hover:text-institution"
          aria-label="Fermer"
        >
          Fermer
        </button>
      </div>

      <dl className="mb-3 grid gap-1.5 text-sm text-anthracite">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="sr-only">Téléphone</dt>
          <dd>{rdv.usager?.telephone ?? '—'}</dd>
          <span className="text-anthracite-muted">·</span>
          <dt className="sr-only">Bureau</dt>
          <dd>{rdv.bureau.nom}</dd>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={statutLabel} tone={statutRdvTone(rdv.statut)} />
          {!isRdvDuJour && (
            <span className="text-xs text-anthracite-muted">{formatDateFr(rdv.dateRendezVous)}</span>
          )}
          <span className="text-xs text-anthracite-muted">{horaire}</span>
        </div>
        {rdv.fonctionSouhaitee && (
          <div>
            <dt className="text-xs text-anthracite-muted">Personne recherchée</dt>
            <dd>{rdv.fonctionSouhaitee}</dd>
          </div>
        )}
        {rdv.personnel && (
          <div>
            <dt className="text-xs text-anthracite-muted">Personnel assigné</dt>
            <dd>
              {fullName(rdv.personnel.prenom, rdv.personnel.nom)} — {rdv.personnel.fonction}
            </dd>
          </div>
        )}
      </dl>

      {alerteFonction && (
        <p className="mb-3 rounded-[6px] border border-copper/40 bg-copper/10 px-2 py-1.5 text-xs text-copper">
          {alerteFonction}
        </p>
      )}

      <p className="mb-3 text-sm">
        <span className="font-semibold text-institution">Action suivante : </span>
        <span className="text-anthracite">{prochaineAction}</span>
      </p>

      {actionError && (
        <p className="mb-3 rounded-[6px] border border-danger/30 bg-danger/10 px-2 py-1.5 text-xs text-danger" role="alert">
          {actionError}
        </p>
      )}

      {!showDecisions ? (
        <div className="flex flex-col gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={actionLoading}
              onClick={() => handleClick(action.id)}
              className={action.variant === 'primary' ? btnPrimary : btnSecondary}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-anthracite-muted">
            Décision attendue
          </p>
          {decisionButtons.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={actionLoading}
              onClick={() => onAction(d.id)}
              className={d.id === 'orienter' ? btnPrimary : btnSecondary}
            >
              {d.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowDecisions(false)}
            className="text-sm font-semibold text-institution hover:underline"
          >
            Retour
          </button>
        </div>
      )}

      {onVoirHistorique && visiteActive && (
        <button
          type="button"
          onClick={onVoirHistorique}
          className="mt-3 text-sm font-semibold text-institution hover:underline"
        >
          Voir l’historique
        </button>
      )}
    </div>
  );
}
