import { useEffect, useRef, useState } from 'react';
import type { HistoriqueAction, Notification, RendezVous, Visite } from '../../types/api';
import { fullName } from '../../utils/format';
import { messageFonctionNonDisponible } from '../../utils/rendezVousDisplay';
import {
  getPrimaryAction,
  getSecondaryActions,
  prochaineActionLabel,
  statutRdvHumain,
  type QuickActionId,
  type ReceptionQuickActionContext,
} from '../../utils/receptionQuickActions';
import { HistoriqueList } from '../historique/HistoriqueList';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { statutRdvTone } from '../../constants/status';

export interface ReceptionActionPanelProps {
  selectedRdv: RendezVous;
  visiteActive: Visite | null;
  visiteClosedMessage: string | null;
  isRdvDuJour: boolean;
  dossierNotifs: Notification[];
  historique: HistoriqueAction[];
  historiqueOpen: boolean;
  onToggleHistorique: () => void;
  actionLoading: boolean;
  actionError: string | null;
  notifActionId: number | null;
  onAction: (actionId: QuickActionId) => void;
  onDecision: (decision: QuickActionId) => void;
  onClose: () => void;
  onNotificationLue: (id: number) => void;
  onNotificationTraitee: (id: number) => void;
}

function visiteMatchesRdv(visite: Visite | null, rdv: RendezVous): boolean {
  if (!visite || visite.statut === 'TERMINEE') {
    return false;
  }
  return visite.rendezVous.some((item) => item.id === rdv.id) || visite.usager.id === rdv.usager?.id;
}

export function ReceptionActionPanel({
  selectedRdv,
  visiteActive,
  visiteClosedMessage,
  isRdvDuJour,
  dossierNotifs,
  historique,
  historiqueOpen,
  onToggleHistorique,
  actionLoading,
  actionError,
  notifActionId,
  onAction,
  onDecision,
  onClose,
  onNotificationLue,
  onNotificationTraitee,
}: ReceptionActionPanelProps) {
  const [showSecondary, setShowSecondary] = useState(false);
  const [showDecisions, setShowDecisions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  const matches = visiteMatchesRdv(visiteActive, selectedRdv);
  const ctx: ReceptionQuickActionContext = {
    rdv: selectedRdv,
    visiteActive: matches ? visiteActive : null,
    isRdvDuJour,
    hasDossierNotifications: dossierNotifs.length > 0,
    visiteMatchesRdv: matches,
  };

  const primary = getPrimaryAction(ctx);
  const secondary = getSecondaryActions(ctx);
  const statutLabel = statutRdvHumain(selectedRdv.statut, dossierNotifs.length > 0);
  const alerteFonction = messageFonctionNonDisponible(selectedRdv);
  const usagerNom = selectedRdv.usager
    ? fullName(selectedRdv.usager.prenom, selectedRdv.usager.nom)
    : '—';
  const agentNom = selectedRdv.personnel
    ? fullName(selectedRdv.personnel.prenom, selectedRdv.personnel.nom)
    : null;

  const horaire =
    selectedRdv.heureDebut && selectedRdv.heureFin
      ? `${selectedRdv.heureDebut} – ${selectedRdv.heureFin}`
      : 'Horaire à confirmer';

  // Dès qu’un dossier est choisi : remonter le panneau (surtout sur mobile).
  useEffect(() => {
    setShowDecisions(false);
    setShowSecondary(false);
    setShowDetails(false);
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedRdv.id]);

  const handlePrimary = () => {
    if (!primary) return;
    if (primary.id === 'decider_suite') {
      setShowDecisions(true);
      return;
    }
    onAction(primary.id);
  };

  const decisionButtons: { id: QuickActionId; label: string }[] = [
    { id: 'orienter', label: 'Orienter' },
    { id: 'attendre', label: 'Mettre en attente' },
    { id: 'cloturer', label: 'Clôturer la visite' },
    { id: 'reporter', label: 'Reporter' },
    { id: 'reorienter', label: 'Réorienter' },
  ];

  const primaryBlock = !visiteClosedMessage && (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-institution">{prochaineActionLabel(ctx)}</p>
      {actionError && (
        <p className="text-sm text-danger" role="alert">
          {actionError}
        </p>
      )}
      {!showDecisions && primary && (
        <Button
          className="min-h-14 w-full text-base"
          disabled={actionLoading}
          onClick={handlePrimary}
        >
          {primary.label}
        </Button>
      )}
      {showDecisions && (
        <div className="space-y-2">
          {decisionButtons.map((d) => (
            <Button
              key={d.id}
              variant={d.id === 'orienter' ? 'primary' : 'secondary'}
              className="min-h-12 w-full"
              disabled={actionLoading}
              onClick={() => onDecision(d.id)}
            >
              {d.label}
            </Button>
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
    </div>
  );

  return (
    <>
      <section
        ref={panelRef}
        id="reception-action-panel"
        className="rounded-[6px] border border-institution/25 bg-surface p-4 shadow-sm lg:sticky lg:top-4 lg:z-10"
        aria-label="Panneau d'action"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="font-serif text-lg font-semibold text-anthracite">{usagerNom}</p>
            <p className="text-sm text-anthracite-muted">
              {horaire} · {selectedRdv.bureau.nom}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-anthracite-muted hover:text-institution"
          >
            Fermer
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge label={statutLabel} tone={statutRdvTone(selectedRdv.statut)} />
          {agentNom && (
            <span className="text-sm text-anthracite">
              Vers {agentNom}
            </span>
          )}
        </div>

        {visiteClosedMessage && (
          <p className="mb-3 rounded-[6px] border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            {visiteClosedMessage}
          </p>
        )}

        {/* Bouton principal en haut : un clic, sans scroller */}
        <div className="mb-3">{primaryBlock}</div>

        {alerteFonction && (
          <p className="mb-3 rounded-[6px] border border-copper/40 bg-copper/10 px-2 py-1.5 text-xs text-copper">
            {alerteFonction}
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="mb-2 text-sm font-semibold text-institution hover:underline"
        >
          {showDetails ? 'Masquer le détail' : 'Voir le détail'}
        </button>

        {showDetails && (
          <dl className="mb-3 space-y-1 border-t border-border pt-3 text-sm">
            <div>
              <dt className="text-xs text-anthracite-muted">Téléphone</dt>
              <dd>{selectedRdv.usager?.telephone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-anthracite-muted">Référence</dt>
              <dd className="font-mono text-xs">{selectedRdv.reference}</dd>
            </div>
            {selectedRdv.fonctionSouhaitee && (
              <div>
                <dt className="text-xs text-anthracite-muted">Fonction recherchée</dt>
                <dd>{selectedRdv.fonctionSouhaitee}</dd>
              </div>
            )}
            {selectedRdv.personnel && (
              <div>
                <dt className="text-xs text-anthracite-muted">Personnel assigné</dt>
                <dd>
                  {agentNom} · {selectedRdv.personnel.fonction}
                </dd>
              </div>
            )}
          </dl>
        )}

        {secondary.length > 0 && !showDecisions && !visiteClosedMessage && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowSecondary((v) => !v)}
              className="text-sm font-semibold text-institution hover:underline"
            >
              {showSecondary ? 'Masquer les autres actions' : 'Autres actions'}
            </button>
            {showSecondary && (
              <div className="mt-2 flex flex-col gap-2">
                {secondary.map((action) => (
                  <Button
                    key={action.id}
                    variant="secondary"
                    disabled={actionLoading}
                    onClick={() => {
                      if (action.id === 'decider_suite') {
                        setShowDecisions(true);
                      } else {
                        onAction(action.id);
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {dossierNotifs.length > 0 && (
          <div className="mb-3 border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold text-anthracite-muted">Messages du dossier</p>
            <NotificationPanel
              items={dossierNotifs}
              actionLoadingId={notifActionId}
              onMarquerLue={onNotificationLue}
              onMarquerTraitee={onNotificationTraitee}
            />
          </div>
        )}

        <button
          type="button"
          onClick={onToggleHistorique}
          className="text-sm font-semibold text-institution hover:underline"
        >
          {historiqueOpen ? 'Masquer l’historique' : 'Voir l’historique'}
        </button>
        {historiqueOpen && (
          <div className="mt-3 border-t border-border pt-3">
            {matches && historique.length > 0 ? (
              <HistoriqueList items={historique} />
            ) : (
              <p className="text-sm text-anthracite-muted">Aucun historique pour ce dossier.</p>
            )}
          </div>
        )}
      </section>

      {/* Barre fixe en bas (mobile) : le flemmard n’a plus qu’à taper */}
      {!visiteClosedMessage && primary && !showDecisions && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
          <p className="mb-1 truncate text-xs text-anthracite-muted">{usagerNom}</p>
          <Button
            className="min-h-12 w-full text-base"
            disabled={actionLoading}
            onClick={handlePrimary}
          >
            {primary.label}
          </Button>
        </div>
      )}
    </>
  );
}
