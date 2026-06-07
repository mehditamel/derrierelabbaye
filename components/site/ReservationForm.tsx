"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/Button";
import { useReservationForm } from "@/lib/useReservationForm";
import styles from "./ReservationForm.module.css";

const heures = [
  "18:00", "18:30", "19:00", "19:30", "20:00",
  "20:30", "21:00", "21:30", "22:00", "22:30",
];

function aujourdHui(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReservationForm() {
  const [heure, setHeure] = useState("20:00");
  const [couverts, setCouverts] = useState(2);
  const { status, reference, erreur, submit, reset } = useReservationForm();
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === "done") successRef.current?.focus();
  }, [status]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await submit({
      date: String(form.get("date") || ""),
      heure,
      couverts,
      nom: String(form.get("nom") || ""),
      telephone: String(form.get("telephone") || ""),
      message: String(form.get("message") || ""),
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
          Merci. Votre demande de réservation a bien été prise en compte.
          Votre référence : <strong>{reference}</strong>.
          Nous revenons vers vous pour la confirmer.
        </p>
        <Button variant="ghost" onClick={reset}>
          Nouvelle demande
        </Button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Date</span>
          <input
            type="date"
            name="date"
            required
            min={aujourdHui()}
            defaultValue={aujourdHui()}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Couverts</span>
          <div className={styles.stepper}>
            <button
              type="button"
              aria-label="Retirer un couvert"
              onClick={() => setCouverts((c) => Math.max(1, c - 1))}
            >
              −
            </button>
            <span aria-live="polite">{couverts}</span>
            <button
              type="button"
              aria-label="Ajouter un couvert"
              onClick={() => setCouverts((c) => Math.min(20, c + 1))}
            >
              +
            </button>
          </div>
        </label>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Heure</legend>
        <div className={styles.heures}>
          {heures.map((h) => (
            <button
              type="button"
              key={h}
              className={`${styles.heure} ${heure === h ? styles.heureActive : ""}`}
              aria-pressed={heure === h}
              onClick={() => setHeure(h)}
            >
              {h}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Nom</span>
          <input type="text" name="nom" required autoComplete="name" className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Téléphone</span>
          <input type="tel" name="telephone" autoComplete="tel" className={styles.input} />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Message (facultatif)</span>
        <textarea name="message" rows={3} className={styles.input} />
      </label>

      {status === "error" && (
        <p className={styles.error} role="alert">
          {erreur}
        </p>
      )}

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          disabled={status === "loading"}
          aria-busy={status === "loading"}
        >
          {status === "loading" ? "Envoi…" : "Envoyer la demande"}
        </Button>
      </div>
    </form>
  );
}
