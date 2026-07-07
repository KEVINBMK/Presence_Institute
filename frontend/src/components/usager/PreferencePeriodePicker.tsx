export type PeriodeSouhaitee = 'MATIN' | 'APRES_MIDI' | null;

interface PreferencePeriodePickerProps {
  value: PeriodeSouhaitee;
  onChange: (value: PeriodeSouhaitee) => void;
}

export function PreferencePeriodePicker({ value, onChange }: PreferencePeriodePickerProps) {
  const options: { id: PeriodeSouhaitee; label: string; hint: string }[] = [
    { id: null, label: 'Indifférent', hint: 'Toute la journée ouverte' },
    { id: 'MATIN', label: 'Matin', hint: 'Avant 12 h' },
    { id: 'APRES_MIDI', label: 'Après-midi', hint: 'À partir de 12 h' },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Période souhaitée (optionnel)</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt.id)}
              className={`min-h-11 rounded-[6px] border px-3 py-2 text-left text-sm transition-colors ${
                selected
                  ? 'border-institution bg-institution text-ivory'
                  : 'border-border bg-surface text-anthracite hover:border-institution/40'
              }`}
            >
              <span className="block font-semibold">{opt.label}</span>
              <span className={`block text-xs ${selected ? 'text-ivory/80' : 'text-anthracite-muted'}`}>
                {opt.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
