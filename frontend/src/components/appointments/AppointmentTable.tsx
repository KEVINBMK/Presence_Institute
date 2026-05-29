import { STATUT_RDV_LABELS, statutRdvTone } from '../../constants/status';
import type { RendezVous } from '../../types/api';
import { fullName } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';
import { AppointmentCard } from './AppointmentCard';

interface AppointmentTableProps {
  items: RendezVous[];
  onSelect?: (rdv: RendezVous) => void;
  selectedId?: number;
}

export function AppointmentTable({ items, onSelect, selectedId }: AppointmentTableProps) {
  return (
    <>
      {/* Desktop / tablette large : tableau */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-anthracite-muted">
              <th className="px-3 py-2 font-semibold">Référence</th>
              <th className="px-3 py-2 font-semibold">Usager</th>
              <th className="px-3 py-2 font-semibold">Bureau</th>
              <th className="px-3 py-2 font-semibold">Horaire</th>
              <th className="px-3 py-2 font-semibold">Téléphone</th>
              <th className="px-3 py-2 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.map((rdv) => (
              <tr
                key={rdv.id}
                onClick={() => onSelect?.(rdv)}
                className={`border-b border-border/80 transition-colors ${
                  onSelect ? 'cursor-pointer hover:bg-ivory' : ''
                } ${selectedId === rdv.id ? 'bg-institution/5' : ''}`}
              >
                <td className="px-3 py-3 font-mono text-xs">{rdv.reference}</td>
                <td className="px-3 py-3 font-medium">{fullName(rdv.usager.prenom, rdv.usager.nom)}</td>
                <td className="px-3 py-3 text-anthracite-muted">{rdv.bureau.nom}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {rdv.heureDebut && rdv.heureFin
                    ? `${rdv.heureDebut} — ${rdv.heureFin}`
                    : '—'}
                </td>
                <td className="px-3 py-3">{rdv.usager.telephone}</td>
                <td className="px-3 py-3">
                  <StatusBadge
                    label={STATUT_RDV_LABELS[rdv.statut]}
                    tone={statutRdvTone(rdv.statut)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablette : cartes */}
      <div className="grid gap-3 lg:hidden">
        {items.map((rdv) => (
          <AppointmentCard
            key={rdv.id}
            rdv={rdv}
            onSelect={onSelect ? () => onSelect(rdv) : undefined}
            selected={selectedId === rdv.id}
          />
        ))}
      </div>
    </>
  );
}
