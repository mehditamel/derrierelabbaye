"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CalendarPlus, Check, Minus, Plus, Share2 } from "lucide-react";
import {
  contactJoignable,
  emailValide,
  telephoneValide,
  useReservationForm,
} from "@/lib/useReservationForm";
import { useRecapReservation } from "@/lib/useRecapReservation";
import { useOnline } from "@/lib/usePwa";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { haptic } from "@/lib/haptic";
import {
  CRENEAUX_RESERVATION,
  creneauPasse,
  dateLongueFr,
  isoAParis,
  ajouterJours,
  jourReservable,
} from "@/lib/creneaux";
import { useCalendrierReservation } from "@/lib/useCalendrierReservation";
import { site } from "@/data/site";
import styles from "./MobileReserver.module.css";

type Contact = { nom: string; tel: string; email: string };

/* Garde de forme sur la valeur relue dans localStorage. Sans elle, une entrée
   corrompue ou héritée d'une version antérieure fait lever `contact.nom.trim()`
   à chaque rendu de cet écran — et la valeur étant relue à chaque montage,
   l'utilisateur ne peut plus réserver du tout depuis l'app. */
function estContact(v: unknown): v is Contact {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return typeof c.nom === "string" && typeof c.tel === "string" && typeof c.email === "string";
}

const heures = CRENEAUX_RESERVATION;

function prochainsJours(n: number, debut: string) {
  const jours = [];
  const fmtJour = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
  const fmtNum = new Intl.DateTimeFormat("fr-FR", { day: "2-digit" });
  const fmtMois = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  for (let i = 0; i < n; i++) {
    const iso = ajouterJours(debut, i);
    const d = new Date(`${iso}T12:00:00`);
    jours.push({
      iso,
      jour: fmtJour.format(d).replace(".", ""),
      num: fmtNum.format(d),
      mois: fmtMois.format(d).replace(".", ""),
    });
  }
  return jours;
}

export function MobileReserver() {
  const { date, setDate, maintenant, heure, setHeure, disponible } = useCalendrierReservation();
  const debut = maintenant ? isoAParis(maintenant) : "";
  const jours = useMemo(() => (debut ? prochainsJours(14, debut) : []), [debut]);
  const [couverts, setCouverts] = useState(2);

  const { value: contact, set: setContact } = useLocalStorage<Contact>(
    "dla-reservation-contact",
    { nom: "", tel: "", email: "" },
    estContact
  );
  const [nomErreur, setNomErreur] = useState("");
  const [telErreur, setTelErreur] = useState("");
  const [emailErreur, setEmailErreur] = useState("");
  // Piège à robots : reste vide chez un humain (champ hors écran et hors tabulation).
  const [societe, setSociete] = useState("");
  const { status, reference, erreur, submit, reset, statusLabel } = useReservationForm();
  const online = useOnline();
  const successRef = useRef<HTMLHeadingElement>(null);
  // Instant de montage : un envoi quasi instantané trahit un robot (cf. la route).
  const rendu = useRef(0);
  useEffect(() => {
    rendu.current = Date.now();
  }, []);
  // L'écran mobile partage la réservation « vivante » (pas de snapshot figé).
  const { copie, partager, ajouterAuCalendrier, reinitialiser } = useRecapReservation(
    { date, heure, couverts },
    reference
  );

  /* Sans téléphone ni e-mail, la demande arriverait au bar sans personne à
     joindre : le bouton attend l'un des deux, comme il attend déjà le nom. */
  const joignable = contactJoignable(contact.tel, contact.email);

  useEffect(() => {
    if (status === "done") {
      haptic([18, 50, 30]);
      successRef.current?.focus();
    }
  }, [status]);

  function valider() {
    if (!disponible || status === "loading") return;
    if (!telephoneValide(contact.tel)) {
      setTelErreur("Ce numéro semble incomplet — format 06 12 34 56 78.");
      return;
    }
    if (!emailValide(contact.email)) {
      setEmailErreur("Cette adresse semble incomplète — format vous@exemple.fr.");
      return;
    }
    submit({
      date,
      heure,
      couverts,
      nom: contact.nom,
      telephone: contact.tel,
      email: contact.email,
      societe,
      rendu: rendu.current,
    });
  }

  if (status === "done") {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon}>
          <Check size={28} strokeWidth={1.5} />
        </span>
        <h1 ref={successRef} tabIndex={-1} className="app-h" style={{ fontSize: "2rem" }}>
          Demande envoyée
        </h1>
        <p className={styles.successText}>
          Votre demande pour <strong>{couverts}</strong> couvert
          {couverts > 1 ? "s" : ""} le <strong>{dateLongueFr(date)}</strong> à{" "}
          <strong>{heure}</strong> est enregistrée.
          <br />
          Référence <strong>{reference}</strong>. Votre table sera réservée après confirmation du
          bar.
        </p>
        <div className={styles.successActions}>
          <button
            className={styles.successAction}
            onClick={() => {
              haptic();
              ajouterAuCalendrier();
            }}
          >
            <CalendarPlus size={16} aria-hidden="true" />
            Ajouter au calendrier
          </button>
          <button
            className={styles.successAction}
            onClick={() => {
              haptic();
              void partager();
            }}
          >
            {copie ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Share2 size={16} aria-hidden="true" />
            )}
            {copie ? "Récapitulatif copié" : "Partager"}
          </button>
          <button
            className={styles.ghost}
            onClick={() => {
              reinitialiser();
              reset();
            }}
          >
            Nouvelle demande
          </button>
        </div>
        <p className="u-visually-hidden" role="status">
          {copie ? "Récapitulatif copié dans le presse-papiers." : ""}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className="app-h app-h1">Réserver</h1>
        <p className={styles.sub}>Choisissez votre créneau</p>
      </div>

      <fieldset className={`app-pad ${styles.groupe}`} disabled={status === "loading"}>
        <fieldset className={styles.groupe}>
          <legend className="app-section-label">Date</legend>
          <div className={styles.dates}>
            {jours.map((j) => (
              <button
                key={j.iso}
                disabled={!jourReservable(j.iso)}
                aria-label={`${dateLongueFr(j.iso)}${!jourReservable(j.iso) ? " — fermé" : ""}`}
                className={`${styles.dateChip} ${date === j.iso ? styles.dateActive : ""}`}
                onClick={() => setDate(j.iso)}
                aria-pressed={date === j.iso}
              >
                <span className={styles.dateJour}>{j.jour}</span>
                <span className={styles.dateNum}>{j.num}</span>
                <span className={styles.dateMois}>{j.mois}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className={styles.coupleRow}>
          <span className="app-section-label">Couverts</span>
          <div className={styles.stepper}>
            <button
              aria-label="Retirer un couvert"
              disabled={couverts <= 1}
              onClick={() => {
                haptic(8);
                setCouverts((c) => Math.max(1, c - 1));
              }}
            >
              <Minus size={18} strokeWidth={1.5} />
            </button>
            <span aria-live="polite">
              {couverts}
              <span className="u-visually-hidden"> couverts</span>
            </span>
            <button
              aria-label="Ajouter un couvert"
              disabled={couverts >= 20}
              onClick={() => {
                haptic(8);
                setCouverts((c) => Math.min(20, c + 1));
              }}
            >
              <Plus size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <fieldset className={styles.groupe}>
          <legend className="app-section-label">Heure</legend>
          <div className={styles.heures}>
            {heures.map((h) => {
              const passe =
                !date ||
                !jourReservable(date) ||
                Boolean(maintenant && creneauPasse(date, h, maintenant));
              return (
                <button
                  key={h}
                  disabled={passe}
                  className={`${styles.heure} ${heure === h ? styles.heureActive : ""} ${
                    passe ? styles.heureOff : ""
                  }`}
                  onClick={() => setHeure(h)}
                  aria-pressed={heure === h}
                >
                  {h}
                </button>
              );
            })}
          </div>
          {date && !disponible && (
            <p className={styles.aide}>Plus de créneaux ce soir — choisissez un autre jour.</p>
          )}
        </fieldset>

        <span className="app-section-label">Vos coordonnées</span>
        <label className={styles.champ}>
          <span className={styles.champLabel}>
            Nom <span aria-hidden="true">*</span>
          </span>
          <input
            className={`${styles.input} ${nomErreur ? styles.inputError : ""}`}
            placeholder="Votre nom"
            value={contact.nom}
            onChange={(e) => {
              setNomErreur("");
              setContact((c) => ({ ...c, nom: e.target.value }));
            }}
            onBlur={(e) =>
              setNomErreur(e.target.value.trim() ? "" : "Indiquez un nom pour la réservation.")
            }
            aria-invalid={nomErreur ? true : undefined}
            aria-describedby={nomErreur ? "m-nom-err" : undefined}
            maxLength={80}
            autoComplete="name"
          />
        </label>
        {nomErreur && (
          <span id="m-nom-err" role="alert" className={styles.fieldError}>
            {nomErreur}
          </span>
        )}
        <label className={styles.champ}>
          <span className={styles.champLabel}>Téléphone</span>
          <input
            className={`${styles.input} ${telErreur ? styles.inputError : ""}`}
            placeholder="06 12 34 56 78"
            value={contact.tel}
            onChange={(e) => {
              setTelErreur("");
              setContact((c) => ({ ...c, tel: e.target.value }));
            }}
            onBlur={(e) =>
              setTelErreur(
                telephoneValide(e.target.value)
                  ? ""
                  : "Ce numéro semble incomplet — format 06 12 34 56 78."
              )
            }
            aria-invalid={telErreur ? true : undefined}
            aria-describedby={telErreur ? "m-tel-err" : undefined}
            type="tel"
            inputMode="tel"
            maxLength={30}
            autoComplete="tel"
          />
        </label>
        {telErreur && (
          <span id="m-tel-err" role="alert" className={styles.fieldError}>
            {telErreur}
          </span>
        )}
        <label className={styles.champ}>
          <span className={styles.champLabel}>E-mail</span>
          <input
            className={styles.input}
            placeholder="vous@exemple.fr"
            value={contact.email}
            onChange={(e) => {
              setContact((c) => ({ ...c, email: e.target.value }));
              setEmailErreur("");
            }}
            type="email"
            maxLength={120}
            autoComplete="email"
            inputMode="email"
            aria-invalid={emailErreur ? true : undefined}
            aria-describedby={emailErreur ? "m-email-err" : undefined}
          />
        </label>
        {emailErreur && (
          <span id="m-email-err" role="alert" className={styles.fieldError}>
            {emailErreur}
          </span>
        )}
        <p className={styles.aide}>
          Téléphone ou e-mail, au moins l&apos;un des deux : c&apos;est ainsi que nous confirmons la
          table.
        </p>

        {/* Piège à robots : hors écran, hors tabulation, ignoré des lecteurs
            d'écran. Un envoi avec ce champ rempli est écarté côté serveur. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="m-societe">Société</label>
          <input
            id="m-societe"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={societe}
            onChange={(e) => setSociete(e.target.value)}
          />
        </div>

        {status === "error" && (
          <p className={styles.error} role="alert">
            <AlertCircle size={18} strokeWidth={1.5} aria-hidden="true" />
            <span>
              {erreur} <a href={`tel:${site.telephone.replace(/\s/g, "")}`}>Appeler le bar</a>
            </span>
          </p>
        )}

        {/* Annonce polie de l'état d'envoi pour les lecteurs d'écran. */}
        <p className="u-visually-hidden" role="status" aria-live="polite">
          {statusLabel}
        </p>
      </fieldset>

      <div className={styles.sticky}>
        <p className={styles.ctaHint}>
          Demande sous réserve de confirmation. <a href="/confidentialite">Vos données</a>
        </p>
        <button
          className={styles.cta}
          onClick={valider}
          disabled={
            status === "loading" || !contact.nom.trim() || !joignable || !online || !disponible
          }
          aria-busy={status === "loading"}
        >
          {!online ? (
            "Hors connexion"
          ) : status === "loading" ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Envoi…
            </>
          ) : (
            "Demander cette table"
          )}
        </button>
        {!contact.nom.trim() ? (
          <p className={styles.ctaHint}>Indiquez votre nom pour envoyer la demande.</p>
        ) : (
          !joignable && (
            <p className={styles.ctaHint}>
              Laissez un téléphone ou un e-mail pour envoyer la demande.
            </p>
          )
        )}
      </div>
    </div>
  );
}
