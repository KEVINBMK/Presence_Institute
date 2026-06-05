import { Fragment, type ReactNode } from 'react';
import { STATUT_RDV_LABELS, statutRdvTone } from '../../constants/status';
import type { RendezVous } from '../../types/api';
import { formatDateFr, fullName } from '../../utils/format';
import { messageFonctionNonDisponible } from '../../utils/rendezVousDisplay';
import { StatusBadge } from '../ui/StatusBadge';
import { AppointmentCard } from './AppointmentCard';

interface AppointmentTableProps {
  items: RendezVous[];
  onSelect?: (rdv: RendezVous) => void;
  selectedId?: number;
  showInternalDetails?: boolean;
  showDate?: boolean;
  /** Bulle ou panneau affiché sous la ligne / carte sélectionnée */
  renderInlineDetails?: (rdv: RendezVous) => ReactNode;
}

export function AppointmentTable({
  items,
  onSelect,
  selectedId,
  showInternalDetails = false,
  showDate = false,
  renderInlineDetails,
}: AppointmentTableProps) {
  const colCount =
    5 +
    (showDate ? 1 : 0) +
    (showInternalDetails ? 2 : 0);

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-anthracite-muted">
              <th className="px-3 py-2 font-semibold">Référence</th>
              {showDate && <th className="px-3 py-2 font-semibold">Date</th>}
              <th className="px-3 py-2 font-semibold">Usager</th>
              <th className="px-3 py-2 font-semibold">Bureau</th>
              {showInternalDetails && (
                <th className="px-3 py-2 font-semibold">Fonction souhaitée</th>
              )}
              <th className="px-3 py-2 font-semibold">Horaire</th>
              {showInternalDetails && (
                <th className="px-3 py-2 font-semibold">Personnel assigné</th>
              )}
              <th className="px-3 py-2 font-semibold">Téléphone</th>
              <th className="px-3 py-2 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.map((rdv) => (
              <Fragment key={rdv.id}>
                <tr
                  onClick={() => onSelect?.(rdv)}
                  className={`border-b border-border/80 transition-colors ${
                    onSelect ? 'cursor-pointer hover:bg-ivory' : ''
                  } ${selectedId === rdv.id ? 'bg-institution/5 ring-1 ring-inset ring-institution/20' : ''}`}
                >
                  <td className="px-3 py-3 font-mono text-xs">{rdv.reference}</td>
                  {showDate && (
                    <td className="px-3 py-3 whitespace-nowrap text-anthracite-muted">
                      {formatDateFr(rdv.dateRendezVous)}
                    </td>
                  )}
                  <td className="px-3 py-3 font-medium">
                    {rdv.usager ? fullName(rdv.usager.prenom, rdv.usager.nom) : '—'}
                  </td>
                  <td className="px-3 py-3 text-anthracite-muted">{rdv.bureau.nom}</td>
                  {showInternalDetails && (
                    <td className="px-3 py-3 text-anthracite-muted">
                      {rdv.fonctionSouhaitee ?? '—'}
                      {messageFonctionNonDisponible(rdv) && (
                        <span className="mt-1 block text-xs text-copper">{messageFonctionNonDisponible(rdv)}</span>
                      )}
                    </td>
                  )}
                  <td className="px-3 py-3 whitespace-nowrap">
                    {rdv.heureDebut && rdv.heureFin
                      ? `${rdv.heureDebut} — ${rdv.heureFin}`
                      : '—'}
                  </td>
                  {showInternalDetails && (
                    <td className="px-3 py-3 text-sm">
                      {rdv.personnel
                        ? `${fullName(rdv.personnel.prenom, rdv.personnel.nom)} — ${rdv.personnel.fonction}`
                        : '—'}
                    </td>
                  )}
                  <td className="px-3 py-3">{rdv.usager?.telephone ?? '—'}</td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      label={STATUT_RDV_LABELS[rdv.statut]}
                      tone={statutRdvTone(rdv.statut)}
                    />
                  </td>
                </tr>
                {selectedId === rdv.id && renderInlineDetails && (
                  <tr className="border-b border-border/80 bg-ivory/50">
                    <td colSpan={colCount} className="px-3 py-3">
                      <div className="ml-auto w-full max-w-[420px]">{renderInlineDetails(rdv)}</div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {items.map((rdv) => (
          <div key={rdv.id}>
            <AppointmentCard
              rdv={rdv}
              onSelect={onSelect ? () => onSelect(rdv) : undefined}
              selected={selectedId === rdv.id}
              showInternalDetails={showInternalDetails}
              showDate={showDate}
            />
            {selectedId === rdv.id && renderInlineDetails && (
              <div className="mt-2">{renderInlineDetails(rdv)}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
