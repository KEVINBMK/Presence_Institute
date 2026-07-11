interface SkeletonProps {
  className?: string;
}

/** Bloc de chargement animé (remplace les textes « Chargement… »). */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[6px] bg-anthracite/10 ${className}`}
    />
  );
}

interface SkeletonListProps {
  /** Nombre de lignes fantômes affichées. */
  rows?: number;
  label?: string;
}

/** Liste de lignes fantômes pour les tableaux et panneaux en cours de chargement. */
export function SkeletonList({ rows = 3, label = 'Chargement en cours' }: SkeletonListProps) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}
