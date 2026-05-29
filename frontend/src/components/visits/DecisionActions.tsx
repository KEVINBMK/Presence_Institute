interface DecisionActionsProps {
  onOrienter?: () => void;
  onAttendre?: () => void;
  onCloturer?: () => void;
  onReporter?: () => void;
  onReorienter?: () => void;
  disabled?: boolean;
}

const btnBase =
  'min-h-11 flex-1 rounded-[6px] border px-4 text-sm font-semibold transition-colors disabled:opacity-50';

export function DecisionActions({
  onOrienter,
  onAttendre,
  onCloturer,
  onReporter,
  onReorienter,
  disabled,
}: DecisionActionsProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-anthracite-muted">
        Décision réception
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          disabled={disabled}
          onClick={onOrienter}
          className={`${btnBase} border-institution bg-institution text-ivory hover:bg-institution-dark`}
        >
          Orienter
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onAttendre}
          className={`${btnBase} border-copper bg-copper/10 text-anthracite hover:bg-copper/20`}
        >
          Attendre
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onCloturer}
          className={`${btnBase} border-border bg-surface text-anthracite hover:border-institution`}
        >
          Clôturer
        </button>
        {onReporter && (
          <button
            type="button"
            disabled={disabled}
            onClick={onReporter}
            className={`${btnBase} border-border bg-ivory text-anthracite hover:border-copper`}
          >
            Reporter
          </button>
        )}
        {onReorienter && (
          <button
            type="button"
            disabled={disabled}
            onClick={onReorienter}
            className={`${btnBase} border-border bg-ivory text-anthracite hover:border-copper`}
          >
            Réorienter
          </button>
        )}
      </div>
    </div>
  );
}
