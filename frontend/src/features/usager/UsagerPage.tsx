import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBureaux } from '../../api/bureaux';
import { ApiClientError } from '../../api/client';
import { createRendezVous } from '../../api/rendezVous';
import {
  PreferencePeriodePicker,
  type PeriodeSouhaitee,
} from '../../components/usager/PreferencePeriodePicker';
import { SectionCard } from '../../components/ui/SectionCard';
import { useToast } from '../../components/ui/ToastProvider';
import { FONCTIONS_SOUHAITEES_OPTIONS } from '../../constants/fonctionsSouhaitees';
import { toLocalDateString } from '../../utils/format';
import { validateTelephone } from '../../utils/validation';
import type { Bureau, RendezVousUsager, TypeUsager } from '../../types/api';
import { TYPE_USAGER_OPTIONS } from '../../types/api';

const inputClass =
  'mt-1 min-h-11 w-full rounded-[6px] border border-border bg-surface px-3 text-anthracite';

type ConfirmationState = {
  rdv: RendezVousUsager;
  telephone: string;
};


export function UsagerPage() {
  const { showToast } = useToast();
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [bureauxLoading, setBureauxLoading] = useState(true);
  const [bureauxError, setBureauxError] = useState<string | null>(null);

  const [bureauId, setBureauId] = useState<number | ''>('');
  const [dateSouhaitee, setDateSouhaitee] = useState(toLocalDateString);
  const [periodeSouhaitee, setPeriodeSouhaitee] = useState<PeriodeSouhaitee>(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [telephoneError, setTelephoneError] = useState<string | null>(null);
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

  const resetForm = () => {
    setConfirmation(null);
    setSubmitError(null);
    setNom('');
    setPrenom('');
    setTelephone('');
    setTelephoneError(null);
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

    // Le formulaire n'est pas envoyé si le numéro est invalide.
    const phoneError = validateTelephone(telephone);
    setTelephoneError(phoneError);
    if (phoneError) {
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
      setConfirmation({ rdv, telephone: telephone.trim() });
    } catch (err) {
      setSubmitError(
        err instanceof ApiClientError ? err.message : 'Erreur lors de l’envoi de la demande.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    const { rdv, telephone: telConfirme } = confirmation;
    const planifie = rdv.statut === 'CONFIRME';
    const infos = `Référence : ${rdv.reference}\nTéléphone : ${telConfirme}`;

    const copierInfos = async () => {
      try {
        await navigator.clipboard.writeText(infos);
        showToast('Informations copiées.', 'success');
      } catch {
        showToast('Copie impossible — notez les informations affichées.', 'error');
      }
    };

    return (
      <div className="mx-auto max-w-lg">
        <SectionCard title="Votre demande est enregistrée" accent>
          <p className="text-sm text-anthracite-muted">
            {planifie
              ? 'Votre rendez-vous est confirmé.'
              : 'Votre demande est en attente de planification par la réception.'}
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Référence</dt>
              <dd className="font-mono text-lg font-semibold text-institution">{rdv.reference}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-anthracite-muted">Téléphone utilisé</dt>
              <dd>{telConfirme}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-anthracite-muted">
            Conservez ces informations pour suivre votre demande.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copierInfos()}
              className="min-h-10 rounded-[6px] border border-border px-4 text-sm font-semibold hover:border-institution"
            >
              Copier les informations
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-10 rounded-[6px] border border-border px-4 text-sm font-semibold hover:border-institution"
            >
              Imprimer le reçu
            </button>
          </div>
          <Link
            to={`/suivi-rendez-vous?reference=${encodeURIComponent(rdv.reference)}`}
            className="mt-6 block min-h-11 w-full rounded-[6px] border border-institution bg-institution px-4 py-3 text-center text-sm font-semibold text-ivory hover:bg-institution-dark"
          >
            Suivre ma demande
          </Link>
          <button
            type="button"
            onClick={resetForm}
            className="mt-3 min-h-11 w-full rounded-[6px] border border-institution text-sm font-semibold text-institution hover:bg-institution/5"
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
          Votre demande sera planifiée selon les disponibilités du bureau choisi.
          La réception confirmera votre arrivée le jour du rendez-vous.
        </p>
        <p className="mt-2 text-sm">
          Vous avez déjà une référence ?{' '}
          <Link to="/suivi-rendez-vous" className="font-semibold text-institution hover:underline">
            Suivre ma demande
          </Link>
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

      <form className="space-y-8" onSubmit={(e) => void handleSubmit(e)}>
        <SectionCard title="1. Quel service recherchez-vous ?">
          {/* bureau + fonction */}
          {bureauxLoading && <p className="text-sm text-anthracite-muted">Chargement des bureaux…</p>}
          {bureauxError && (
            <div className="space-y-3">
              <p className="text-sm text-danger">{bureauxError}</p>
              <button type="button" onClick={() => void loadBureaux()} className="min-h-11 rounded-[6px] border px-4 text-sm font-semibold">
                Réessayer
              </button>
            </div>
          )}
          {!bureauxLoading && !bureauxError && bureaux.length > 0 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium">
                Bureau
                <select required value={bureauId} onChange={(e) => setBureauId(Number(e.target.value))} className={inputClass} disabled={formDisabled}>
                  {bureaux.map((b) => (
                    <option key={b.id} value={b.id}>{b.nom}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Fonction recherchée{' '}
                <span className="font-normal text-anthracite-muted">(optionnel)</span>
                <select
                  value={fonctionSouhaitee}
                  onChange={(e) => setFonctionSouhaitee(e.target.value)}
                  className={inputClass}
                  disabled={formDisabled}
                >
                  <option value="">Aucune préférence</option>
                  {FONCTIONS_SOUHAITEES_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </SectionCard>

        <SectionCard title="2. Quand souhaitez-vous venir ?">
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Date souhaitée
              <input type="date" required min={toLocalDateString()} value={dateSouhaitee} onChange={(e) => setDateSouhaitee(e.target.value)} className={inputClass} disabled={formDisabled} />
            </label>
            <PreferencePeriodePicker value={periodeSouhaitee} onChange={setPeriodeSouhaitee} />
          </div>
        </SectionCard>

        <SectionCard title="3. Vos coordonnées">
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Nom
              <input required value={nom} onChange={(e) => setNom(e.target.value)} className={inputClass} placeholder="Ex. Kabongo" disabled={formDisabled || submitting} />
            </label>
            <label className="block text-sm font-medium">
              Prénom
              <input required value={prenom} onChange={(e) => setPrenom(e.target.value)} className={inputClass} placeholder="Ex. Marie" disabled={formDisabled || submitting} />
            </label>
            <label className="block text-sm font-medium">
              Téléphone
              <input required type="tel" value={telephone} onChange={(e) => { setTelephone(e.target.value); if (telephoneError) setTelephoneError(validateTelephone(e.target.value)); }} onBlur={() => setTelephoneError(validateTelephone(telephone))} className={`${inputClass} ${telephoneError ? 'border-danger' : ''}`} placeholder="0890000000" disabled={formDisabled || submitting} />
              {telephoneError && <span className="mt-1 block text-xs text-danger">{telephoneError}</span>}
            </label>
            <label className="block text-sm font-medium">
              E-mail <span className="font-normal text-anthracite-muted">(optionnel)</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="nom@exemple.cd" disabled={formDisabled || submitting} />
            </label>
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-institution">Informations supplémentaires</summary>
              <label className="mt-3 block font-medium">
                Type d&apos;usager
                <select value={typeUsager} onChange={(e) => setTypeUsager(e.target.value as TypeUsager)} className={inputClass} disabled={formDisabled || submitting}>
                  {TYPE_USAGER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            </details>
          </div>
        </SectionCard>

        <SectionCard title="4. Motif de la demande">
          <label className="block text-sm font-medium">
            Motif
            <textarea required rows={3} value={motif} onChange={(e) => setMotif(e.target.value)} className="mt-1 w-full rounded-[6px] border border-border bg-surface px-3 py-2" placeholder="Ex. Revue des spécifications du projet" disabled={formDisabled || submitting} />
          </label>
          {submitError && <p className="mt-3 text-sm text-danger">{submitError}</p>}
          <button type="submit" disabled={formDisabled || submitting} className="mt-4 min-h-12 w-full rounded-[6px] border border-institution bg-institution text-base font-semibold text-ivory hover:bg-institution-dark disabled:opacity-50">
            {submitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
          </button>
        </SectionCard>
      </form>
    </div>
  );
}
