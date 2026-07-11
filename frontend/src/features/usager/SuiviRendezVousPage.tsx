import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClientError } from '../../api/client';
import { retrouverReference, suiviRendezVous, type SuiviRendezVousUsager } from '../../api/rendezVous';
import { Button } from '../../components/ui/Button';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { STATUT_RDV_LABELS, statutRdvTone } from '../../constants/status';
import { formatDateFr } from '../../utils/format';
import { validateTelephone } from '../../utils/validation';

const inputClass =
  'mt-1 min-h-11 w-full rounded-[6px] border border-border bg-surface px-3 text-anthracite';

export function SuiviRendezVousPage() {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('reference') ?? '');
  const [telephone, setTelephone] = useState('');
  const [telephoneError, setTelephoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rdv, setRdv] = useState<SuiviRendezVousUsager | null>(null);

  const [showRetrouver, setShowRetrouver] = useState(false);
  const [retrouverNom, setRetrouverNom] = useState('');
  const [retrouverDate, setRetrouverDate] = useState('');
  const [retrouverMessage, setRetrouverMessage] = useState<string | null>(null);

  const rechercher = async () => {
    const ref = reference.trim();
    const phoneError = validateTelephone(telephone);
    setTelephoneError(phoneError);
    if (!ref) {
      setError('Saisissez votre référence.');
      return;
    }
    if (phoneError) {
      return;
    }
    setLoading(true);
    setError(null);
    setRdv(null);
    try {
      setRdv(await suiviRendezVous({ reference: ref, telephone: telephone.trim() }));
    } catch (e) {
      setError(
        e instanceof ApiClientError
          ? e.message
          : 'Aucune demande trouvée avec ces informations.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetrouver = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneError = validateTelephone(telephone);
    setTelephoneError(phoneError);
    if (phoneError) return;
    setRetrouverMessage(null);
    try {
      const res = await retrouverReference({
        telephone: telephone.trim(),
        nom: retrouverNom.trim() || undefined,
        dateApproximative: retrouverDate || undefined,
      });
      setRetrouverMessage(res.message);
    } catch (err) {
      setRetrouverMessage(
        err instanceof ApiClientError ? err.message : 'Recherche impossible pour le moment.',
      );
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-institution md:text-3xl">Suivre ma demande</h1>
        <p className="mt-2 text-sm text-anthracite-muted">
          Utilisez la référence reçue et le numéro de téléphone indiqué lors de votre demande.
        </p>
      </header>

      <SectionCard title="Consulter ma demande" accent>
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Référence
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={`${inputClass} font-mono`}
              placeholder="RDV-2026-000001"
              disabled={loading}
            />
          </label>
          <label className="block text-sm font-medium">
            Téléphone utilisé lors de la demande
            <input
              type="tel"
              value={telephone}
              onChange={(e) => {
                setTelephone(e.target.value);
                if (telephoneError) setTelephoneError(validateTelephone(e.target.value));
              }}
              onBlur={() => setTelephoneError(validateTelephone(telephone))}
              className={`${inputClass} ${telephoneError ? 'border-danger' : ''}`}
              placeholder="0890000001"
              disabled={loading}
            />
            {telephoneError && <span className="mt-1 block text-xs text-danger">{telephoneError}</span>}
          </label>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="button" disabled={loading} className="w-full" onClick={() => void rechercher()}>
            {loading ? 'Recherche…' : 'Consulter le statut'}
          </Button>
        </div>
      </SectionCard>

      {rdv && (
        <SectionCard title="Votre demande" subtitle={rdv.reference}>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Statut</dt>
              <dd className="mt-1">
                <StatusBadge label={STATUT_RDV_LABELS[rdv.statut]} tone={statutRdvTone(rdv.statut)} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Bureau</dt>
              <dd>{rdv.bureau.nom}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Date</dt>
              <dd>{formatDateFr(rdv.dateRendezVous)}</dd>
            </div>
            {rdv.heureDebut && rdv.heureFin && (
              <div>
                <dt className="text-xs uppercase text-anthracite-muted">Créneau</dt>
                <dd>
                  {rdv.heureDebut} — {rdv.heureFin}
                </dd>
              </div>
            )}
            {rdv.fonctionSouhaitee && (
              <div>
                <dt className="text-xs uppercase text-anthracite-muted">Fonction recherchée</dt>
                <dd>{rdv.fonctionSouhaitee}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 rounded-[6px] border border-institution/20 bg-institution/5 px-3 py-2 text-sm">
            {rdv.instructions}
          </p>
        </SectionCard>
      )}

      <SectionCard title="Je ne retrouve plus ma référence">
        {!showRetrouver ? (
          <button
            type="button"
            onClick={() => setShowRetrouver(true)}
            className="text-sm font-semibold text-institution hover:underline"
          >
            Aide pour retrouver ma référence
          </button>
        ) : (
          <form className="space-y-3" onSubmit={(e) => void handleRetrouver(e)}>
            <label className="block text-sm">
              Nom (optionnel)
              <input
                value={retrouverNom}
                onChange={(e) => setRetrouverNom(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              Date approximative (optionnel)
              <input
                type="date"
                value={retrouverDate}
                onChange={(e) => setRetrouverDate(e.target.value)}
                className={inputClass}
              />
            </label>
            <Button type="submit" variant="secondary">
              Simuler l&apos;envoi de la référence
            </Button>
            {retrouverMessage && (
              <p className="text-sm text-anthracite-muted">{retrouverMessage}</p>
            )}
            <p className="text-xs text-anthracite-muted">
              Référence envoyée par SMS — simulation (aucun SMS réel).
            </p>
          </form>
        )}
      </SectionCard>

      <p className="text-sm text-anthracite-muted">
        <Link to="/usager" className="font-semibold text-institution hover:underline">
          Faire une nouvelle demande
        </Link>
      </p>
    </div>
  );
}
