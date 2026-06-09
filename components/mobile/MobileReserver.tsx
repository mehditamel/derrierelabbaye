"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { useReservationForm } from "@/lib/useReservationForm";
import { useOnline } from "@/lib/usePwa";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { haptic } from "@/lib/haptic";
import {
  creneauPasse,
  isoLocal,
  premierCreneauDisponible,
} from "@/lib/creneaux";
import styles from "./MobileReserver.module.css";

type Contact = { nom: string; tel: string; email: string };

const heures = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

function prochainsJours(n: number) {
  const jours = [];
  const fmtJour = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
  const fmtNum = new Intl.DateTimeFormat("fr-FR", { day: "2-digit" });
  const fmtMois = new Intl.DateTimeFormat("fr-FR", { month: "short" });
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    jours.push({
      iso: isoLocal(d),
      jour: fmtJour.format(d).replace(".", ""),
      num: fmtNum.format(d),
      mois: fmtMois.format(d).replace(".", ""),
    });
  }
  return jours;
}

export function MobileReserver() {
  const jours = useMemo(() => prochainsJours(14), []);
  const [date, setDate] = useState(jours[0].iso);
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [heure, setHeure] = useState("20:00");
  const [couverts, setCouverts] = useState(2);

  // Posé au montage pour que le HTML pré-rendu reste neutre (pas de créneau
  // grisé selon l'horloge du serveur) — l'état réel arrive côté client.
  useEffect(() => {
    setMaintenant(new Date());
  }, []);

  // Avance au premier créneau ouvert si l'heure choisie est passée.
  useEffect(() => {
    if (!maintenant) return;
    if (creneauPasse(date, heure, maintenant)) {
      const libre = premierCreneauDisponible(date, heures, maintenant);
      if (libre) setHeure(libre);
    }
  }, [maintenant, date, heure]);
  const { value: contact, set: setContact } = useLocalStorage<Contact>(
    "dla-reservation-contact",
    { nom: "", tel: "", email: "" }
  );
  const { status, reference, erreur, submit, reset } = useReservationForm();
  const online = useOnline();
  const successRef = useRef<HTMLHeadingElement>(null);

  const soireePassee = Boolean(
    maintenant && !premierCreneauDisponible(date, heures, maintenant)
  );

  useEffect(() => {
    if (status === "done") {
      haptic([18, 50, 30]);
      successRef.current?.focus();
    }
  }, [status]);

  function valider() {
    submit({
      date,
      heure,
      couverts,
      nom: contact.nom,
      telephone: contact.tel,
      email: contact.email,
    });
  }

  if (status === "done") {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon}>
          <Check size={28} strokeWidth={1.5} />
        </span>
        <h1 ref={successRef} tabIndex={-1} className="app-h" style={{ fontSize: "2rem" }}>
          C'est noté !
        </h1>
        <p className={styles.successText}>
          Votre demande pour <strong>{couverts}</strong> couvert
          {couverts > 1 ? "s" : ""} le <strong>{date}</strong> à{" "}
          <strong>{heure}</strong> est enregistrée.
          <br />
          Référence <strong>{reference}</strong>.
        </p>
        <button className={styles.ghost} onClick={reset}>
          Nouvelle demande
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className="app-h" style={{ fontSize: "1.9rem" }}>
          Réserver
        </h1>
        <p className={styles.sub}>Choisissez votre créneau</p>
      </div>

      <div className="app-pad">
        <span className="app-section-label">Date</span>
        <div className={styles.dates}>
          {jours.map((j) => (
            <button
              key={j.iso}
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

        <div className={styles.coupleRow}>
          <span className="app-section-label">Couverts</span>
          <div className={styles.stepper}>
            <button aria-label="Retirer" onClick={() => setCouverts((c) => Math.max(1, c - 1))}>
              <Minus size={18} strokeWidth={1.5} />
            </button>
            <span aria-live="polite">{couverts}</span>
            <button aria-label="Ajouter" onClick={() => setCouverts((c) => Math.min(20, c + 1))}>
              <Plus size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <span className="app-section-label">Heure</span>
        <div className={styles.heures}>
          {heures.map((h) => {
            const passe = Boolean(maintenant && creneauPasse(date, h, maintenant));
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
        {soireePassee && (
          <p className={styles.aide}>
            Plus de créneaux ce soir — choisissez un autre jour.
          </p>
        )}

        <span className="app-section-label">Vos coordonnées</span>
        <input
          className={styles.input}
          placeholder="Nom"
          value={contact.nom}
          onChange={(e) => setContact((c) => ({ ...c, nom: e.target.value }))}
          autoComplete="name"
        />
        <input
          className={styles.input}
          placeholder="Téléphone"
          value={contact.tel}
          onChange={(e) => setContact((c) => ({ ...c, tel: e.target.value }))}
          type="tel"
          autoComplete="tel"
        />
        <input
          className={styles.input}
          placeholder="E-mail (facultatif)"
          value={contact.email}
          onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
          type="email"
          autoComplete="email"
        />

        {status === "error" && (
          <p className={styles.error} role="alert">
            {erreur}
          </p>
        )}
      </div>

      <div className={styles.sticky}>
        <button
          className={styles.cta}
          onClick={valider}
          disabled={status === "loading" || !contact.nom.trim() || !online || soireePassee}
          aria-busy={status === "loading"}
        >
          {!online
            ? "Hors connexion"
            : status === "loading"
            ? "Envoi…"
            : "Demander cette table"}
        </button>
      </div>
    </div>
  );
}
