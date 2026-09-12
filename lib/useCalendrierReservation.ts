"use client";

import { useEffect, useState } from "react";
import {
  CRENEAUX_RESERVATION,
  creneauPasse,
  prochaineDateReservable,
  premierCreneauDisponible,
} from "@/lib/creneaux";

/** HTML initial stable, puis horloge de Marseille actualisée à la minute et au retour sur l'onglet. */
export function useCalendrierReservation() {
  const [maintenant, setMaintenant] = useState<Date | null>(null);
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("20:00");

  useEffect(() => {
    const actualiser = () => {
      const instant = new Date();
      setMaintenant(instant);
      setDate((courante) => courante || prochaineDateReservable(instant));
    };
    actualiser();
    const intervalle = window.setInterval(actualiser, 60_000);
    window.addEventListener("focus", actualiser);
    document.addEventListener("visibilitychange", actualiser);
    return () => {
      window.clearInterval(intervalle);
      window.removeEventListener("focus", actualiser);
      document.removeEventListener("visibilitychange", actualiser);
    };
  }, []);

  useEffect(() => {
    if (!maintenant || !date || !creneauPasse(date, heure, maintenant)) return;
    const libre = premierCreneauDisponible(date, CRENEAUX_RESERVATION, maintenant);
    // Synchronisation avec l'horloge externe après un changement de minute.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (libre) setHeure(libre);
  }, [maintenant, date, heure]);

  const disponible = Boolean(
    maintenant && premierCreneauDisponible(date, CRENEAUX_RESERVATION, maintenant)
  );
  return { maintenant, date, setDate, heure, setHeure, disponible };
}
