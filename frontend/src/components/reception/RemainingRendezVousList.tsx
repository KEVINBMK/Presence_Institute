import { STATUT_RDV_LABELS, statutRdvTone } from '../../constants/status';
import type { RendezVous } from '../../types/api';
import { fullName } from '../../utils/format';
import { messageFonctionNonDisponible } from '../../utils/rendezVousDisplay';
import { StatusBadge } from '../ui/StatusBadge';

const TERMINAUX = new Set(['TERMINE', 'ANNULE', 'NON_PRESENTE']);

interface RemainingRendezVousListProps {
  items: RendezVous[];
}

export function RemainingRendezVousList({ items }: RemainingRendezVousListProps) {
  const remaining = items.filter((r) => !TERMINAUX.has(r.statut));

  if (remaining.length === 0) {
    return (
      <p className="text-sm text-anthracite-muted">
        Aucun rendez-vous restant à traiter pour cette visite.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {remaining.map((rdv) => {
        const alerte = messageFonctionNonDisponible(rdv);

        return (
          <li
            key={rdv.id}
            className="rounded-[6px] border border-copper/40 bg-copper/5 px-4 py-3 text-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span className="font-mono text-xs text-institution">{rdv.reference}</span>
              <StatusBadge
                label={STATUT_RDV_LABELS[rdv.statut]}
                tone={statutRdvTone(rdv.statut)}
              />
            </div>
            <dl className="mt-2 grid gap-1 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-anthracite-muted">Bureau</dt>
                <dd>{rdv.bureau.nom}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-anthracite-muted">Fonction souhaitée</dt>
                <dd>{rdv.fonctionSouhaitee ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-anthracite-muted">Personnel assigné</dt>
                <dd>
                  {rdv.personnel
                    ? fullName(rdv.personnel.prenom, rdv.personnel.nom)
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-anthracite-muted">Créneau</dt>
                <dd>
                  {rdv.heureDebut && rdv.heureFin
                    ? `${rdv.heureDebut} — ${rdv.heureFin}`
                    : 'À planifier'}
                </dd>
              </div>
            </dl>
            {alerte && (
              <p className="mt-2 text-xs font-medium text-copper">{alerte}</p>
            )}
            <p className="mt-2 text-xs text-anthracite-muted">
              La réception oriente ou décide — pas de passage automatique au personnel suivant.
            </p>
          </li>
        );
      })}
    </ul>
  );
}
