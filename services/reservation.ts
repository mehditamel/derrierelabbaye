/* =====================================================================
   Service de réservation.
   Persiste dans Supabase si l'app est configurée (variables d'env présentes) ;
   sinon retombe sur une simulation locale (faux délai). L'UI ne change pas.
   ===================================================================== */

import { getSupabase } from "@/lib/supabase";

export type ReservationPayload = {
  date: string; // ISO yyyy-mm-dd
  heure: string; // ex. "20:00"
  couverts: number;
  nom: string;
  telephone?: string;
  email?: string;
  message?: string;
};

export type ReservationResult = {
  ok: boolean;
  reference: string;
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Génère une référence lisible type « DLA-7F3K ». */
function genererReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffixe = "";
  for (let i = 0; i < 4; i++) {
    suffixe += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `DLA-${suffixe}`;
}

/** Valide le payload côté service (garde commune aux deux modes). */
function validerPayload(payload: ReservationPayload): void {
  if (!payload.date || !payload.heure || !payload.nom || payload.couverts < 1) {
    throw new Error("Informations de réservation incomplètes.");
  }
}

/**
 * Enregistre une demande de réservation.
 * - Si Supabase est configuré : insère la ligne dans `reservations`.
 * - Sinon : simule l'enregistrement (faux délai réseau) — utile en démo,
 *   en preview sans secrets ou en local.
 */
export async function createReservation(payload: ReservationPayload): Promise<ReservationResult> {
  validerPayload(payload);
  const reference = genererReference();
  const supabase = await getSupabase();

  // Repli simulé : aucune configuration back-end.
  if (!supabase) {
    await delay(900);
    return { ok: true, reference };
  }

  const { error } = await supabase.from("reservations").insert({
    reference,
    date: payload.date,
    heure: payload.heure,
    couverts: payload.couverts,
    nom: payload.nom,
    telephone: payload.telephone ?? null,
    email: payload.email ?? null,
    message: payload.message ?? null,
  });

  if (error) {
    throw new Error("La réservation n'a pas pu être enregistrée. Réessayez.");
  }
  return { ok: true, reference };
}
