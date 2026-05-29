/** @deprecated Archivé — ancien parcours choix de créneau côté usager. */
import type { Creneau } from '../types/api';

interface TimeSlotPickerProps {
  slots: Creneau[];
  selected: string | null;
  onSelect: (heureDebut: string) => void;
}

export function TimeSlotPicker({ slots, selected, onSelect }: TimeSlotPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {slots.map((slot) => {
        const isSelected = selected === slot.heureDebut;
        const disabled = !slot.disponible;
        return (
          <button
            key={slot.heureDebut}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(slot.heureDebut)}
            className={`min-h-11 rounded-[6px] border px-2 py-2 text-sm font-medium transition-colors ${
              disabled
                ? 'cursor-not-allowed border-border bg-ivory-dark/50 text-anthracite-muted line-through'
                : isSelected
                  ? 'border-institution bg-institution text-ivory'
                  : 'border-border bg-surface text-anthracite hover:border-institution hover:bg-institution/5'
            }`}
          >
            {slot.heureDebut}
            <span className="block text-xs font-normal opacity-80">— {slot.heureFin}</span>
          </button>
        );
      })}
    </div>
  );
}
