import { useCallback, useEffect, useState } from 'react';
import { fetchBureaux } from '../../api/bureaux';
import { ApiClientError } from '../../api/client';
import { createRendezVous } from '../../api/rendezVous';
import {
  PreferencePeriodePicker,
  type PeriodeSouhaitee,
} from '../../components/usager/PreferencePeriodePicker';
import { SectionCard } from '../../components/ui/SectionCard';
import { FONCTIONS_SOUHAITEES_SUGGESTIONS } from '../../constants/fonctionsSouhaitees';
import { STATUT_RDV_LABELS } from '../../constants/status';
import type { Bureau, RendezVous, TypeUsager } from '../../types/api';
import { TYPE_USAGER_OPTIONS } from '../../types/api';
import { formatDateFr, toLocalDateString } from '../../utils/format';

const inputClass =
  'mt-1 min-h-11 w-full rounded-[6px] border border-border bg-surface px-3 text-anthracite';

type ConfirmationState = {
  rdv: RendezVous;
};


export function UsagerPage() {
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [bureauxLoading, setBureauxLoading] = useState(true);
  const [bureauxError, setBureauxError] = useState<string | null>(null);

  const [bureauId, setBureauId] = useState<number | ''>('');
  const [dateSouhaitee, setDateSouhaitee] = useState(toLocalDateString);
  const [periodeSouhaitee, setPeriodeSouhaitee] = useState<PeriodeSouhaitee>(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [typeUsager, setTypeUsager] = useState<TypeUsager>('CITOYEN');
  const [motif, setMotif] = useState('');
  const [fonctionSouhaitee, setFonctionSouhaitee] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);

  const loadBureaux = useCallback(async () => {
    setBureauxLoading(true);
    setBureauxError(null);
    try {
      const list = await fetchBureaux();
      setBureaux(list);
      if (list.length > 0) {
        setBureauId((current) => (current === '' ? list[0].id : current));
      }
    } catch (e) {
      setBureaux([]);
      setBureauxError(
        e instanceof ApiClientError ? e.message : 'Impossible de charger les bureaux.',
      );
    } finally {
      setBureauxLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBureaux();
  }, [loadBureaux]);

  const selectedBureau = bureaux.find((b) => b.id === bureauId);

  const resetForm = () => {
    setConfirmation(null);
    setSubmitError(null);
    setNom('');
    setPrenom('');
    setTelephone('');
    setEmail('');
    setMotif('');
    setFonctionSouhaitee('');
    setTypeUsager('CITOYEN');
    setPeriodeSouhaitee(null);
    setDateSouhaitee(toLocalDateString());
    if (bureaux.length > 0) {
      setBureauId(bureaux[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bureauId === '' || submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const rdv = await createRendezVous({
        nom,
        prenom,
        telephone,
        email: email.trim() || null,
        typeUsager,
        bureauId,
        dateSouhaitee,
        periodeSouhaitee,
        motif,
        fonctionSouhaitee: fonctionSouhaitee.trim() || null,
      });
      setConfirmation({ rdv });
    } catch (err) {
      setSubmitError(
        err instanceof ApiClientError ? err.message : 'Erreur lors de l’envoi de la demande.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    const { rdv } = confirmation;
    const planifie = rdv.statut === 'CONFIRME';

    return (
      <div className="mx-auto max-w-lg">
        <SectionCard
          title={planifie ? 'Rendez-vous planifié' : 'Demande enregistrée'}
          accent
        >
          <p className="text-sm text-anthracite-muted">
            {planifie
              ? 'Votre rendez-vous a été planifié.'
              : 'Votre demande est enregistrée et sera traitée par la réception.'}
          </p>
          {!planifie && (
            <p className="mt-3 rounded-[6px] border border-copper/30 bg-copper/5 px-3 py-2 text-sm text-anthracite">
              Le statut <strong>DEMANDE</strong> signifie qu&apos;aucun créneau n&apos;a encore été
              attribué. La réception pourra traiter cette demande hors parcours automatique.
            </p>
          )}
          <p className="mt-4 font-mono text-2xl font-semibold text-institution">{rdv.reference}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Statut</dt>
              <dd>{STATUT_RDV_LABELS[rdv.statut]}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Bureau</dt>
              <dd>{rdv.bureau.nom}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Date</dt>
              <dd>{formatDateFr(rdv.dateRendezVous)}</dd>
            </div>
            {planifie && rdv.heureDebut && rdv.heureFin && (
              <div>
                <dt className="text-xs uppercase text-anthracite-muted">Créneau attribué</dt>
                <dd>
                  {rdv.heureDebut} — {rdv.heureFin}
                </dd>
              </div>
            )}
            {rdv.fonctionSouhaitee && (
              <div>
                <dt className="text-xs uppercase text-anthracite-muted">Fonction souhaitée</dt>
                <dd>{rdv.fonctionSouhaitee}</dd>
              </div>
            )}
          </dl>
          <button
            type="button"
            onClick={resetForm}
            className="mt-6 min-h-11 w-full rounded-[6px] border border-institution text-sm font-semibold text-institution hover:bg-institution/5"
          >
            Nouvelle demande
          </button>
        </SectionCard>
      </div>
    );
  }

  const formDisabled = bureauxLoading || bureaux.length === 0 || bureauId === '';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl text-institution md:text-3xl">Prendre rendez-vous</h1>
        <p className="mt-2 max-w-2xl text-sm text-anthracite-muted md:text-base">
          Votre demande sera planifiée automatiquement selon les disponibilités institutionnelles.
          La réception confirmera votre arrivée le jour du rendez-vous.
        </p>
      </header>

      <div className="space-y-3">
        <div className="rounded-[6px] border border-copper/30 bg-copper/10 px-4 py-3 text-sm text-anthracite">
          <strong className="font-semibold">Vous ne choisissez pas l&apos;heure finale.</strong> Le
          système attribue un créneau selon les disponibilités du bureau (horaires d&apos;ouverture,
          conflits et personnel disponible).
        </div>
        <div className="rounded-[6px] border border-institution/25 bg-institution/5 px-4 py-3 text-sm text-anthracite">
          Les noms du personnel ne sont pas affichés. La réception orientera votre demande vers la
          personne concernée.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <SectionCard
          title="Bureau et préférences"
          subtitle={selectedBureau?.localisation ?? 'Chargement…'}
        >
          {bureauxLoading && (
            <p className="text-sm text-anthracite-muted">Chargement des bureaux…</p>
          )}

          {bureauxError && (
            <div className="space-y-3">
              <p className="text-sm text-danger" role="alert">
                {bureauxError}
              </p>
              <button
                type="button"
                onClick={() => void loadBureaux()}
                className="min-h-11 rounded-[6px] border border-border px-4 text-sm font-semibold hover:border-institution"
              >
                Réessayer
              </button>
            </div>
          )}

          {!bureauxLoading && !bureauxError && bureaux.length === 0 && (
            <p className="text-sm text-anthracite-muted">Aucun bureau actif disponible.</p>
          )}

          {!bureauxLoading && !bureauxError && bureaux.length > 0 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium">
                Bureau
                <select
                  required
                  value={bureauId}
                  onChange={(e) => setBureauId(Number(e.target.value))}
                  className={inputClass}
                  disabled={formDisabled}
                >
                  {bureaux.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nom}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Date souhaitée
                <input
                  type="date"
                  required
                  min={toLocalDateString()}
                  value={dateSouhaitee}
                  onChange={(e) => setDateSouhaitee(e.target.value)}
                  className={inputClass}
                  disabled={formDisabled}
                />
              </label>
              <PreferencePeriodePicker
                value={periodeSouhaitee}
                onChange={setPeriodeSouhaitee}
              />
              <label className="block text-sm font-medium">
                Fonction ou personne recherchée{' '}
                <span className="font-normal text-anthracite-muted">(optionnel)</span>
                <input
                  type="text"
                  list="fonctions-souhaitees"
                  value={fonctionSouhaitee}
                  onChange={(e) => setFonctionSouhaitee(e.target.value)}
                  className={inputClass}
                  placeholder="Ex. assistant du bureau, technicien, responsable…"
                  disabled={formDisabled}
                />
                <datalist id="fonctions-souhaitees">
                  {FONCTIONS_SOUHAITEES_SUGGESTIONS.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </label>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Vos coordonnées">
          <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <label className="block text-sm font-medium">
              Nom
              <input
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className={inputClass}
                disabled={formDisabled || submitting}
              />
            </label>
            <label className="block text-sm font-medium">
              Prénom
              <input
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className={inputClass}
                disabled={formDisabled || submitting}
              />
            </label>
            <label className="block text-sm font-medium">
              Téléphone
              <input
                required
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className={inputClass}
                placeholder="0890000000"
                disabled={formDisabled || submitting}
              />
            </label>
            <label className="block text-sm font-medium">
              E-mail <span className="font-normal text-anthracite-muted">(optionnel)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="nom@exemple.cd"
                disabled={formDisabled || submitting}
              />
            </label>
            <label className="block text-sm font-medium">
              Type d&apos;usager
              <select
                required
                value={typeUsager}
                onChange={(e) => setTypeUsager(e.target.value as TypeUsager)}
                className={inputClass}
                disabled={formDisabled || submitting}
              >
                {TYPE_USAGER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Motif
              <textarea
                required
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="mt-1 w-full rounded-[6px] border border-border bg-surface px-3 py-2 disabled:opacity-60"
                placeholder="Objet de la visite"
                disabled={formDisabled || submitting}
              />
            </label>

            {submitError && (
              <p className="rounded-[6px] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={formDisabled || submitting}
              className="min-h-12 w-full rounded-[6px] border border-institution bg-institution text-base font-semibold text-ivory hover:bg-institution-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Envoi en cours…' : 'Soumettre la demande'}
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
