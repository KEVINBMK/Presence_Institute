import type { Personnel } from '../../types/api';
import { fullName } from '../../utils/format';

interface PersonnelSelectorProps {
  personnels: Personnel[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading?: boolean;
}

export function PersonnelSelector({
  personnels,
  selectedId,
  onSelect,
  loading,
}: PersonnelSelectorProps) {
  if (loading) {
    return <p className="text-sm text-anthracite-muted">Chargement des personnels de démonstration…</p>;
  }

  if (personnels.length === 0) {
    return (
      <p className="text-sm text-anthracite-muted">
        Aucun personnel actif. Chargez les fixtures <code className="text-xs">--group=demo</code>.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium md:hidden">
        Choisir le personnel
        <select
          value={selectedId ?? ''}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="mt-1 min-h-11 w-full rounded-[6px] border border-border bg-surface px-3 text-anthracite"
        >
          <option value="" disabled>
            Sélectionner…
          </option>
          {personnels.map((p) => (
            <option key={p.id} value={p.id}>
              {fullName(p.prenom, p.nom)} — {p.bureau?.nom ?? 'Bureau'}
            </option>
          ))}
        </select>
      </label>

      <div className="hidden gap-2 md:grid md:grid-cols-2 xl:grid-cols-3">
        {personnels.map((p) => {
          const selected = selectedId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`rounded-[6px] border px-4 py-3 text-left transition-colors ${
                selected
                  ? 'border-institution bg-institution/10 ring-1 ring-institution'
                  : 'border-border bg-surface hover:border-institution/50'
              }`}
            >
              <p className="font-semibold text-anthracite">{fullName(p.prenom, p.nom)}</p>
              <p className="mt-1 text-xs text-anthracite-muted">{p.fonction}</p>
              <p className="mt-1 text-xs text-copper">{p.bureau?.nom}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
