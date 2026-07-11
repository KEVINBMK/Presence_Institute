import type { RendezVous } from '../../types/api';
import { STATUT_RDV_LABELS, statutRdvTone } from '../../constants/status';
import { fullName } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';

interface ReceptionAppointmentListProps {
  items: RendezVous[];
  selectedId?: number;
  onSelect?: (rdv: RendezVous) => void;
  showDate?: boolean;
}

export function ReceptionAppointmentList({
  items,
  selectedId,
  onSelect,
  showDate = false,
}: ReceptionAppointmentListProps) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-anthracite-muted">
              <th className="px-3 py-2">Heure</th>
              {showDate && <th className="px-3 py-2">Date</th>}
              <th className="px-3 py-2">Usager</th>
              <th className="px-3 py-2">Bureau</th>
              <th className="px-3 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.map((rdv) => (
              <tr
                key={rdv.id}
                onClick={() => onSelect?.(rdv)}
                className={`border-b border-border/80 ${
                  onSelect ? 'cursor-pointer hover:bg-ivory' : ''
                } ${selectedId === rdv.id ? 'bg-institution/5 ring-1 ring-inset ring-institution/20' : ''}`}
              >
                <td className="px-3 py-3 whitespace-nowrap">
                  {rdv.heureDebut && rdv.heureFin ? `${rdv.heureDebut}` : '—'}
                </td>
                {showDate && <td className="px-3 py-3">{rdv.dateRendezVous}</td>}
                <td className="px-3 py-3 font-medium">
                  {rdv.usager ? fullName(rdv.usager.prenom, rdv.usager.nom) : '—'}
                </td>
                <td className="px-3 py-3 text-anthracite-muted">{rdv.bureau.nom}</td>
                <td className="px-3 py-3">
                  <StatusBadge label={STATUT_RDV_LABELS[rdv.statut]} tone={statutRdvTone(rdv.statut)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2 md:hidden">
        {items.map((rdv) => (
          <button
            key={rdv.id}
            type="button"
            onClick={() => onSelect?.(rdv)}
            className={`rounded-[6px] border p-3 text-left ${
              selectedId === rdv.id ? 'border-institution bg-institution/5' : 'border-border bg-surface'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">
                {rdv.heureDebut ?? '—'} — {rdv.usager ? fullName(rdv.usager.prenom, rdv.usager.nom) : '—'}
              </span>
              <StatusBadge label={STATUT_RDV_LABELS[rdv.statut]} tone={statutRdvTone(rdv.statut)} />
            </div>
            <p className="mt-1 text-xs text-anthracite-muted">{rdv.bureau.nom}</p>
          </button>
        ))}
      </div>
    </>
  );
}
