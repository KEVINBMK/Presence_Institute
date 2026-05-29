import { STATUT_VISITE_LABELS, statutVisiteTone } from '../../constants/status';
import type { Visite } from '../../types/api';
import { fullName, formatTime } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';

interface VisitCardProps {
  visite: Visite;
}

export function VisitCard({ visite }: VisitCardProps) {
  const rdv = visite.rendezVous[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-anthracite-muted">Visite active</p>
          <p className="font-mono text-lg font-semibold text-institution">{visite.reference}</p>
        </div>
        <StatusBadge
          label={STATUT_VISITE_LABELS[visite.statut]}
          tone={statutVisiteTone(visite.statut)}
        />
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-anthracite-muted">Usager</dt>
          <dd className="font-medium">
            {fullName(visite.usager.prenom, visite.usager.nom)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-anthracite-muted">Téléphone</dt>
          <dd>{visite.usager.telephone}</dd>
        </div>
        {rdv && (
          <>
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Bureau</dt>
              <dd>{rdv.bureau.nom}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Rendez-vous</dt>
              <dd className="font-mono text-xs">{rdv.reference}</dd>
            </div>
          </>
        )}
        {visite.heureArrivee && (
          <div>
            <dt className="text-xs uppercase text-anthracite-muted">Arrivée</dt>
            <dd>{formatTime(visite.heureArrivee)}</dd>
          </div>
        )}
        {visite.decisionReception && (
          <div>
            <dt className="text-xs uppercase text-anthracite-muted">Décision</dt>
            <dd className="font-medium text-copper">{visite.decisionReception}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
