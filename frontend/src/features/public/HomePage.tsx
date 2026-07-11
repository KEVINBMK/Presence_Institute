import { Link } from 'react-router-dom';
import { SectionCard } from '../../components/ui/SectionCard';
import { ThemeToggle } from '../../components/feedback/ThemeToggle';

export function HomePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <header className="text-center">
        <h1 className="font-serif text-3xl text-institution md:text-4xl">
          Bienvenue au centre d&apos;accueil
        </h1>
        <p className="mt-3 text-sm text-anthracite-muted md:text-base">
          Prenez rendez-vous, suivez votre demande, ou connectez-vous si vous travaillez ici.
        </p>
        <div className="mt-4 flex justify-center">
          <ThemeToggle />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Usager" accent>
          <p className="text-sm text-anthracite-muted">
            Demander un rendez-vous ou consulter l&apos;avancement de votre demande.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/usager"
              className="min-h-11 rounded-[6px] border border-institution bg-institution px-4 py-2 text-center text-sm font-semibold text-ivory hover:bg-institution-dark"
            >
              Prendre ou suivre un rendez-vous
            </Link>
            <Link
              to="/suivi-rendez-vous"
              className="min-h-11 rounded-[6px] border border-border px-4 py-2 text-center text-sm font-semibold hover:border-institution"
            >
              Suivre une demande existante
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="Personnel">
          <p className="text-sm text-anthracite-muted">
            Accès réservé à la réception et aux agents.
          </p>
          <Link
            to="/connexion"
            className="mt-4 block min-h-11 rounded-[6px] border border-institution/40 bg-institution/5 px-4 py-2 text-center text-sm font-semibold text-institution hover:bg-institution/10"
          >
            Connexion du personnel
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
