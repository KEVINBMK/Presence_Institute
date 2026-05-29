import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/usager', label: 'Usager' },
  { to: '/reception', label: 'Réception', end: false },
  { to: '/personnel', label: 'Personnel' },
] as const;

export function AppLayout() {
  return (
    <div className="paper-pattern-subtle min-h-screen">
      <header className="border-b border-border bg-institution text-ivory">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ivory/70">
              Centre d&apos;accueil — C2I
            </p>
            <h1 className="font-serif text-xl md:text-2xl">Atelier — Rendez-vous &amp; visites</h1>
          </div>
          <nav
            className="flex flex-wrap gap-1 rounded-[6px] border border-ivory/20 bg-institution-dark/40 p-1"
            aria-label="Navigation principale"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `min-h-10 rounded-[4px] px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-ivory text-institution'
                      : 'text-ivory/90 hover:bg-ivory/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface/80 px-4 py-4 text-center text-xs text-anthracite-muted">
        <p>MVP institutionnel — la réception reste le centre de contrôle</p>
        <p className="mt-1">
          Mode démonstration : Usager, Réception et Personnel accessibles sans authentification.
        </p>
      </footer>
    </div>
  );
}
