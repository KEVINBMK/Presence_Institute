import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  accent?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  children,
  className = '',
  accent = false,
}: SectionCardProps) {
  return (
    <section
      className={`rounded-[6px] border border-border bg-surface ${accent ? 'border-l-4 border-l-institution' : ''} ${className}`}
    >
      <header className="border-b border-border px-4 py-3 md:px-6 md:py-4">
        <h2 className="font-serif text-lg text-institution md:text-xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-anthracite-muted">{subtitle}</p>}
      </header>
      <div className="px-4 py-4 md:px-6 md:py-5">{children}</div>
    </section>
  );
}
