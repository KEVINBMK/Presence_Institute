import type { StatusTone } from '../../constants/status';

const toneClasses: Record<StatusTone, string> = {
  neutral: 'bg-ivory-dark text-anthracite border-border',
  success: 'bg-institution/10 text-institution border-institution/30',
  warning: 'bg-copper/15 text-copper border-copper/40',
  danger: 'bg-danger/10 text-danger border-danger/30',
  info: 'bg-info/10 text-info border-info/30',
  copper: 'bg-copper/20 text-anthracite border-copper/50',
};

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

export function StatusBadge({ label, tone = 'neutral', className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${toneClasses[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
