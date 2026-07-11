import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '../feedback/ThemeToggle';
import { ROLE_LABELS } from '../../features/auth/authTypes';
import { useAuth } from '../../features/auth/useAuth';
import { Button } from '../ui/Button';

export function InternalLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="paper-pattern-subtle min-h-screen">
      <header className="border-b border-border bg-institution text-ivory">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ivory/70">Espace interne</p>
            <h1 className="font-serif text-xl md:text-2xl">
              {user?.nomComplet ?? 'Compte connecté'}
            </h1>
            {user && (
              <p className="mt-1 text-sm text-ivory/80">
                {ROLE_LABELS[user.role]}
                {user.fonction ? ` — ${user.fonction}` : ''}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle variant="internal" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void logout()}
              className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10"
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
