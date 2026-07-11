import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiClientError } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { SectionCard } from '../../components/ui/SectionCard';
import { useAuth } from './useAuth';

const inputClass =
  'mt-1 min-h-11 w-full rounded-[6px] border border-border bg-surface px-3 text-anthracite';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [identifiant, setIdentifiant] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    const target =
      from ??
      (user.role === 'RECEPTION' ? '/reception' : user.role === 'PERSONNEL' ? '/personnel' : '/');
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const connected = await login(identifiant.trim(), code);
      const target =
        from ??
        (connected.role === 'RECEPTION'
          ? '/reception'
          : connected.role === 'PERSONNEL'
            ? '/personnel'
            : '/');
      navigate(target, { replace: true });
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-institution md:text-3xl">Connexion du personnel</h1>
        <p className="mt-2 text-sm text-anthracite-muted">
          Accès réservé à la réception et au personnel.
        </p>
      </header>

      <SectionCard title="Identifiants" accent>
        <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <label className="block text-sm font-medium">
            Identifiant
            <input
              required
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              className={inputClass}
              autoComplete="username"
              disabled={submitting}
              placeholder="Ex. reception01"
            />
          </label>
          <label className="block text-sm font-medium">
            Code
            <input
              required
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
              disabled={submitting}
            />
          </label>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>

        <details className="mt-4 rounded-[6px] border border-copper/30 bg-copper/5 px-3 py-2 text-xs text-anthracite-muted">
          <summary className="cursor-pointer font-semibold text-copper">
            Démonstration universitaire
          </summary>
          <p className="mt-2">
            Comptes : <code>reception01</code>, <code>patrick</code>, <code>marie</code>,{' '}
            <code>jean</code>, <code>david</code>, <code>alain</code>, <code>junior</code>.
            Code commun : <code>1234</code>. Détail dans <code>docs/COMPTES-DEMO.md</code>.
          </p>
        </details>
      </SectionCard>

      <p className="text-sm text-anthracite-muted">
        <Link to="/" className="font-semibold text-institution hover:underline">
          Retour à l&apos;accueil public
        </Link>
      </p>
    </div>
  );
}
