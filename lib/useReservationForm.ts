"use client";

import { useCallback, useState } from "react";
import { createReservation, type ReservationPayload } from "@/services/reservation";

export type ReservationStatus = "idle" | "loading" | "done" | "error";

/** Valide un numéro de téléphone français souple (fixe ou mobile). Vide = valide. */
export function telephoneValide(tel: string): boolean {
  const v = tel.trim();
  if (v === "") return true;
  return /^(?:\+33|0)\s?[1-9](?:[\s.]?\d{2}){4}$/.test(v);
}

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
