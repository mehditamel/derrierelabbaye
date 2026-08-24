"use client";

import { useCallback, useState } from "react";
import { createReservation, type ReservationPayload } from "@/services/reservation";
import {
  contactJoignable,
  emailValide,
  MESSAGE_CONTACT_MANQUANT,
  telephoneValide,
} from "@/lib/validationReservation";

// Réexport : les formulaires importent déjà ces règles depuis ce module.
export { contactJoignable, emailValide, MESSAGE_CONTACT_MANQUANT, telephoneValide };

export type ReservationStatus = "idle" | "loading" | "done" | "error";

/**
 * Machine d'état partagée par les formulaires de réservation (site + mobile).
 * Isole l'appel `createReservation` pour ne pas dupliquer la logique d'UI.
 */
export function useReservationForm() {
  const [status, setStatus] = useState<ReservationStatus>("idle");
  const [reference, setReference] = useState("");
  const [erreur, setErreur] = useState("");

  const submit = useCallback(async (payload: ReservationPayload) => {
    if (!telephoneValide(payload.telephone ?? "")) {
      setErreur("Le numéro de téléphone semble incorrect.");
      setStatus("error");
      return;
    }
    if (!emailValide(payload.email ?? "")) {
      setErreur("L'adresse e-mail semble incorrecte.");
      setStatus("error");
      return;
    }
    if (!contactJoignable(payload.telephone ?? "", payload.email ?? "")) {
      setErreur(MESSAGE_CONTACT_MANQUANT);
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErreur("");
    try {
      const res = await createReservation(payload);
      setReference(res.reference);
      setStatus("done");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setErreur("");
  }, []);

  // Libellé annoncé poliment aux lecteurs d'écran pendant l'envoi.
  // (L'erreur a déjà role="alert" et le succès role="status" : on n'annonce
  //  ici que l'état transitoire « en cours » pour ne pas dédoubler la lecture.)
  const statusLabel = status === "loading" ? "Envoi de votre demande en cours…" : "";

  return { status, reference, erreur, submit, reset, statusLabel };
}
