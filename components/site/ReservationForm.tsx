"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CalendarPlus, Check, Share2 } from "lucide-react";
import { Button } from "@/components/Button";
import { emailValide, telephoneValide, useReservationForm } from "@/lib/useReservationForm";
import { useRecapReservation, type RecapReservation } from "@/lib/useRecapReservation";
import {
  CRENEAUX_RESERVATION,
  creneauPasse,
  dateLongueFr,
  isoLocal,
  premierCreneauDisponible,
} from "@/lib/creneaux";
import styles from "./ReservationForm.module.css";

const heures = CRENEAUX_RESERVATION;

export function ReservationForm() {
  const [date, setDate] = useState("");
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [heure, setHeure] = useState("20:00");
  const [couverts, setCouverts] = useState(2);
  const [fieldErrors, setFieldErrors] = useState<{
    nom?: string;
    telephone?: string;
    email?: string;
  }>({});
  const [recap, setRecap] = useState<RecapReservation | null>(null);
  const { status, reference, erreur, submit, reset, statusLabel } = useReservationForm();
  const successRef = useRef<HTMLHeadingElement>(null);
  // Instant de montage : un envoi quasi instantané trahit un robot (cf. la route).
  const rendu = useRef(0);
  const { copie, partager, ajouterAuCalendrier, reinitialiser } = useRecapReservation(
    recap,
    reference
  );

  const erreurNom = (nom: string) =>
    nom.trim() ? undefined : "Indiquez un nom pour la réservation.";
  const erreurTelephone = (tel: string) =>
    telephoneValide(tel) ? undefined : "Ce numéro semble incomplet — format 06 12 34 56 78.";
  const erreurEmail = (mail: string) =>
    emailValide(mail) ? undefined : "Cette adresse semble incomplète — format vous@exemple.fr.";

  // La date du jour est posée au montage : le HTML pré-rendu ne fige ainsi
  // ni la date de build, ni le fuseau du serveur (UTC ≠ heure de Marseille).
  useEffect(() => {
    const d = new Date();
    // volontaire : ni la date du jour ni le fuseau réel n'existent au rendu serveur.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMaintenant(d);
    setDate((prev) => prev || isoLocal(d));
    rendu.current = d.getTime();
  }, []);

  // Si l'heure choisie est passée (changement de date, retour sur l'onglet…),
  // on avance au premier créneau encore ouvert.
  useEffect(() => {
    if (!maintenant || !date) return;
    if (creneauPasse(date, heure, maintenant)) {
      const libre = premierCreneauDisponible(date, heures, maintenant);
      // Correction d'un état devenu invalide avec le temps qui passe : elle dépend
      // de l'horloge, donc impossible à dériver pendant le rendu.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (libre) setHeure(libre);
    }
  }, [maintenant, date, heure]);

  const soireePassee = Boolean(
    maintenant && date && !premierCreneauDisponible(date, heures, maintenant)
  );

  useEffect(() => {
    if (status === "done") successRef.current?.focus();
  }, [status]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nom = String(form.get("nom") || "");
    const telephone = String(form.get("telephone") || "");
    const email = String(form.get("email") || "");
    const erreurs = {
      nom: erreurNom(nom),
      telephone: erreurTelephone(telephone),
      email: erreurEmail(email),
    };
    if (erreurs.nom || erreurs.telephone || erreurs.email) {
      setFieldErrors(erreurs);
      return;
    }
    setRecap({ date, heure, couverts });
    await submit({
      date,
      heure,
      couverts,
      nom,
      telephone,
      email,
      message: String(form.get("message") || ""),
      societe: String(form.get("societe") || ""),
      rendu: rendu.current,
    });
  }

  if (status === "done") {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon}>
          <Check size={26} strokeWidth={1.5} />
        </span>
        <h3 ref={successRef} tabIndex={-1} className={styles.successTitle}>
          Demande envoyée
        </h3>
        <p className={styles.successText}>
          {recap ? (
            <>
              Merci. Votre demande pour <strong>{recap.couverts}</strong> couvert
              {recap.couverts > 1 ? "s" : ""} le <strong>{dateLongueFr(recap.date)}</strong> à{" "}
              <strong>{recap.heure}</strong> a bien été prise en compte.
            </>
          ) : (
            <>Merci. Votre demande de réservation a bien été prise en compte.</>
          )}{" "}
          Votre référence : <strong>{reference}</strong>. Nous revenons vers vous pour la confirmer.
        </p>
        <div className={styles.successActions}>
          {recap && (
            <Button variant="ghost" onClick={ajouterAuCalendrier}>
              <CalendarPlus size={16} aria-hidden="true" />
              Ajouter au calendrier
            </Button>
          )}
          {recap && (
            <Button variant="ghost" onClick={partager}>
              {copie ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <Share2 size={16} aria-hidden="true" />
              )}
              {copie ? "Récapitulatif copié" : "Partager"}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              reinitialiser();
              reset();
            }}
          >
            Nouvelle demande
          </Button>
        </div>
        <p className="u-visually-hidden" role="status">
          {copie ? "Récapitulatif copié dans le presse-papiers." : ""}
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {/* Verrouille tous les champs pendant l'envoi */}
      <fieldset className={styles.fields} disabled={status === "loading"}>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>
              Date
              <span className={styles.req} aria-hidden="true">
                {" "}
                *
              </span>
            </span>
            <input
              type="date"
              name="date"
              required
              min={maintenant ? isoLocal(maintenant) : undefined}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.input}
            />
          </label>

          <div className={styles.field} role="group" aria-labelledby="couverts-label">
            <span className={styles.label} id="couverts-label">
              Couverts
            </span>
            <div className={styles.stepper}>
              <button
                type="button"
                aria-label="Retirer un couvert"
                disabled={couverts <= 1}
                onClick={() => setCouverts((c) => Math.max(1, c - 1))}
              >
                −
              </button>
              <span aria-live="polite">
                {couverts}
                <span className="u-visually-hidden"> couverts</span>
              </span>
              <button
                type="button"
                aria-label="Ajouter un couvert"
                disabled={couverts >= 20}
                onClick={() => setCouverts((c) => Math.min(20, c + 1))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <fieldset className={styles.fieldset}>
          <legend className={styles.label}>Heure</legend>
          <div className={styles.heures}>
            {heures.map((h) => {
              const passe = Boolean(maintenant && date && creneauPasse(date, h, maintenant));
              return (
                <button
                  type="button"
                  key={h}
                  disabled={passe}
                  className={`${styles.heure} ${heure === h ? styles.heureActive : ""} ${
                    passe ? styles.heureOff : ""
                  }`}
                  aria-pressed={heure === h}
                  onClick={() => setHeure(h)}
                >
                  {h}
                </button>
              );
            })}
          </div>
          {soireePassee && (
            <p className={styles.aide}>Plus de créneaux ce soir — choisissez un autre jour.</p>
          )}
        </fieldset>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>
              Nom
              <span className={styles.req} aria-hidden="true">
                {" "}
                *
              </span>
            </span>
            <input
              type="text"
              name="nom"
              required
              autoComplete="name"
              placeholder="Votre nom"
              className={`${styles.input} ${fieldErrors.nom ? styles.inputError : ""}`}
              aria-invalid={fieldErrors.nom ? true : undefined}
              aria-describedby={fieldErrors.nom ? "nom-err" : undefined}
              onBlur={(e) => setFieldErrors((f) => ({ ...f, nom: erreurNom(e.target.value) }))}
              onChange={() => setFieldErrors((f) => (f.nom ? { ...f, nom: undefined } : f))}
            />
            {fieldErrors.nom && (
              <span id="nom-err" role="alert" className={styles.fieldError}>
                {fieldErrors.nom}
              </span>
            )}
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Téléphone (facultatif)</span>
            <input
              type="tel"
              name="telephone"
              autoComplete="tel"
              inputMode="tel"
              placeholder="06 12 34 56 78"
              className={`${styles.input} ${fieldErrors.telephone ? styles.inputError : ""}`}
              aria-invalid={fieldErrors.telephone ? true : undefined}
              aria-describedby={`tel-aide${fieldErrors.telephone ? " tel-err" : ""}`}
              onBlur={(e) =>
                setFieldErrors((f) => ({
                  ...f,
                  telephone: erreurTelephone(e.target.value),
                }))
              }
              onChange={() =>
                setFieldErrors((f) => (f.telephone ? { ...f, telephone: undefined } : f))
              }
            />
            {fieldErrors.telephone && (
              <span id="tel-err" role="alert" className={styles.fieldError}>
                {fieldErrors.telephone}
              </span>
            )}
            <span id="tel-aide" className={styles.aide}>
              Pour confirmer la table de vive voix.
            </span>
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>E-mail (facultatif)</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="vous@exemple.fr"
            className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={`email-aide${fieldErrors.email ? " email-err" : ""}`}
            onBlur={(e) => setFieldErrors((f) => ({ ...f, email: erreurEmail(e.target.value) }))}
            onChange={() => setFieldErrors((f) => (f.email ? { ...f, email: undefined } : f))}
          />
          {fieldErrors.email && (
            <span id="email-err" role="alert" className={styles.fieldError}>
              {fieldErrors.email}
            </span>
          )}
          <span id="email-aide" className={styles.aide}>
            Pour recevoir un accusé de réception.
          </span>
        </label>

        {/* Piège à robots : invisible, non focalisable, ignoré des lecteurs
            d'écran. Un envoi avec ce champ rempli est écarté côté serveur. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="societe">Société</label>
          <input id="societe" type="text" name="societe" tabIndex={-1} autoComplete="off" />
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Message (facultatif)</span>
          <textarea
            name="message"
            rows={3}
            placeholder="Allergies, grande tablée, occasion à fêter…"
            className={styles.input}
          />
        </label>
      </fieldset>

      {status === "error" && (
        <p className={styles.error} role="alert">
          <AlertCircle size={18} strokeWidth={1.5} aria-hidden="true" />
          <span>{erreur}</span>
        </p>
      )}

      {/* Annonce polie de l'état d'envoi pour les lecteurs d'écran. */}
      <p className="u-visually-hidden" role="status" aria-live="polite">
        {statusLabel}
      </p>

      <div className={styles.actions}>
        <p className={styles.mention}>* champ requis · demande sous réserve de confirmation</p>
        <Button
          type="submit"
          variant="primary"
          disabled={status === "loading"}
          aria-busy={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Envoi…
            </>
          ) : (
            "Envoyer la demande"
          )}
        </Button>
      </div>
    </form>
  );
}
