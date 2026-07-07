import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClientError } from '../../api/client';
import { fetchRendezVousByReference } from '../../api/rendezVous';
import { Button } from '../../components/ui/Button';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { STATUT_RDV_LABELS, statutRdvTone } from '../../constants/status';
import type { RendezVousUsager } from '../../types/api';
import { formatDateFr } from '../../utils/format';

const inputClass =
  'mt-1 min-h-11 w-full rounded-[6px] border border-border bg-surface px-3 font-mono text-anthracite';

/** Suivi public d'un rendez-vous par référence — aucune donnée interne n'est affichée. */
export function SuiviRendezVousPage() {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('reference') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rdv, setRdv] = useState<RendezVousUsager | null>(null);

  const rechercher = async (ref: string) => {
    const value = ref.trim();
    if (!value) {
      setError('Saisissez votre référence (ex. RDV-20260707-A1B2C3D4).');
      return;
    }
    setLoading(true);
    setError(null);
    setRdv(null);
    try {
      setRdv(await fetchRendezVousByReference(value));
    } catch (e) {
      setError(
        e instanceof ApiClientError
          ? e.message
          : 'Rendez-vous introuvable. Vérifiez la référence saisie.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Référence transmise depuis l'écran de confirmation : recherche immédiate au montage.
  useEffect(() => {
    const initial = searchParams.get('reference');
    if (initial) {
      void rechercher(initial);
    }
    // Volontairement exécuté une seule fois au montage.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-institution md:text-3xl">Suivre mon rendez-vous</h1>
        <p className="mt-2 text-sm text-anthracite-muted md:text-base">
          Saisissez la référence reçue lors de votre demande pour consulter le statut de votre
          rendez-vous.
        </p>
      </header>

      <SectionCard title="Référence du rendez-vous" accent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void rechercher(reference);
          }}
        >
          <label className="block text-sm font-medium">
            Référence
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={inputClass}
              placeholder="RDV-20260707-A1B2C3D4"
              autoComplete="off"
              disabled={loading}
            />
          </label>

          {error && (
            <p
              className="rounded-[6px] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Recherche en cours…' : 'Consulter le statut'}
          </Button>
        </form>
      </SectionCard>

      {rdv && (
        <SectionCard title="Votre rendez-vous" subtitle={rdv.reference}>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Statut</dt>
              <dd className="mt-1">
                <StatusBadge label={STATUT_RDV_LABELS[rdv.statut]} tone={statutRdvTone(rdv.statut)} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Bureau</dt>
              <dd>
                {rdv.bureau.nom} — {rdv.bureau.localisation}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Date</dt>
              <dd>{formatDateFr(rdv.dateRendezVous)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Créneau</dt>
              <dd>
                {rdv.heureDebut && rdv.heureFin
                  ? `${rdv.heureDebut} — ${rdv.heureFin}`
                  : 'En attente d’attribution par la réception.'}
              </dd>
            </div>
          </dl>
          {rdv.statut === 'DEMANDE' && (
            <p className="mt-4 rounded-[6px] border border-copper/30 bg-copper/5 px-3 py-2 text-sm text-anthracite">
              Aucun créneau n&apos;a encore été attribué. Votre demande sera traitée par la
              réception.
            </p>
          )}
        </SectionCard>
      )}

      <p className="text-sm text-anthracite-muted">
        Pas encore de rendez-vous ?{' '}
        <Link to="/usager" className="font-semibold text-institution hover:underline">
          Faire une demande
        </Link>
      </p>
    </div>
  );
}
