interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Téléphone ou référence RDV / VIS…',
  onSubmit,
}: SearchBarProps) {
  return (
    <form
      className="flex w-full flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <label className="sr-only" htmlFor="reception-search">
        Rechercher
      </label>
      <input
        id="reception-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 flex-1 rounded-[6px] border border-border bg-surface px-4 text-base text-anthracite placeholder:text-anthracite-muted"
      />
      <button
        type="submit"
        className="min-h-11 shrink-0 rounded-[6px] border border-institution bg-institution px-6 text-sm font-semibold text-ivory transition-colors hover:bg-institution-dark"
      >
        Rechercher
      </button>
    </form>
  );
}
