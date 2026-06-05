import { ReceptionActionBubble } from '../../components/reception/ReceptionActionBubble';
import type { RendezVous, Visite } from '../../types/api';
import type { QuickActionId } from '../../utils/receptionQuickActions';

export interface ReceptionBubbleContext {
  selectedRdv: RendezVous | null;
  visiteActive: Visite | null;
  isRdvDuJour: (rdv: RendezVous) => boolean;
  pendingNotifsCount: number;
  actionLoading: boolean;
  actionError: string | null;
  onQuickAction: (actionId: QuickActionId) => void;
  onClose: () => void;
  onVoirHistorique: () => void;
}

export function renderReceptionBubble(rdv: RendezVous, ctx: ReceptionBubbleContext) {
  return (
    <ReceptionActionBubble
      rdv={rdv}
      visiteActive={ctx.visiteActive}
      isRdvDuJour={ctx.isRdvDuJour(rdv)}
      hasPendingNotifications={ctx.pendingNotifsCount > 0}
      actionLoading={ctx.actionLoading}
      actionError={ctx.selectedRdv?.id === rdv.id ? ctx.actionError : null}
      onAction={ctx.onQuickAction}
      onClose={ctx.onClose}
      onVoirHistorique={ctx.visiteActive ? ctx.onVoirHistorique : undefined}
    />
  );
}
