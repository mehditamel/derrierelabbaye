"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { createReservation } from "@/services/reservation";
import styles from "./MobileReserver.module.css";

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
      iso: d.toISOString().slice(0, 10),
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
  const [heure, setHeure] = useState("20:00");
  const [couverts, setCouverts] = useState(2);
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [reference, setReference] = useState("");
  const [erreur, setErreur] = useState("");

  async function valider() {
    setStatus("loading");
    setErreur("");
    try {
      const res = await createReservation({ date, heure, couverts, nom, telephone: tel });
      setReference(res.reference);
      setStatus("done");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className={styles.success}>
        <span className={styles.successIcon}>
          <Check size={28} strokeWidth={1.5} />
        </span>
        <h1 className="app-h" style={{ fontSize: "2rem" }}>
          C'est noté !
        </h1>
        <p className={styles.successText}>
          Votre demande pour <strong>{couverts}</strong> couvert
          {couverts > 1 ? "s" : ""} le <strong>{date}</strong> à{" "}
          <strong>{heure}</strong> est enregistrée.
          <br />
          Référence <strong>{reference}</strong>.
        </p>
        <button className={styles.ghost} onClick={() => setStatus("idle")}>
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
            <span>{couverts}</span>
            <button aria-label="Ajouter" onClick={() => setCouverts((c) => Math.min(20, c + 1))}>
              <Plus size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <span className="app-section-label">Heure</span>
        <div className={styles.heures}>
          {heures.map((h) => (
            <button
              key={h}
              className={`${styles.heure} ${heure === h ? styles.heureActive : ""}`}
              onClick={() => setHeure(h)}
              aria-pressed={heure === h}
            >
              {h}
            </button>
          ))}
        </div>

        <span className="app-section-label">Vos coordonnées</span>
        <input
          className={styles.input}
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          autoComplete="name"
        />
        <input
          className={styles.input}
          placeholder="Téléphone"
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          type="tel"
          autoComplete="tel"
        />

        {status === "error" && <p className={styles.error}>{erreur}</p>}
      </div>

      <div className={styles.sticky}>
        <button
          className={styles.cta}
          onClick={valider}
          disabled={status === "loading" || !nom}
        >
          {status === "loading" ? "Envoi…" : "Demander cette table"}
        </button>
      </div>
    </div>
  );
}
