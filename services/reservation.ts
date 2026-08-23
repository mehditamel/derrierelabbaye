/* =====================================================================
   Service de réservation (côté client).

   Poste la demande à /api/reservations : c'est le serveur qui valide, génère
   la référence et envoie les e-mails. Le navigateur ne connaît aucun secret et
   ne parle à aucun tiers.

   Il n'y a plus de repli simulé silencieux : si la demande n'aboutit pas, une
   erreur est levée et l'interface le dit. Une confirmation affichée signifie
   toujours qu'un e-mail est parti.
   ===================================================================== */

export type ReservationPayload = {
  date: string; // ISO yyyy-mm-dd
  heure: string; // ex. "20:00"
  couverts: number;
  nom: string;
  telephone?: string;
  email?: string;
  message?: string;
  /** Honeypot : doit rester vide (rempli par les robots). */
  societe?: string;
  /** Horodatage de montage du formulaire (contrôle anti-robot). */
  rendu?: number;
};

export type ReservationResult = {
  ok: boolean;
  reference: string;
};

const ERREUR_GENERIQUE =
  "Votre demande n'a pas pu être envoyée. Vérifiez votre connexion ou appelez-nous.";

/** Valide le payload côté client (le serveur revalide de toute façon). */
function validerPayload(payload: ReservationPayload): void {
  if (!payload.date || !payload.heure || !payload.nom || payload.couverts < 1) {
    throw new Error("Informations de réservation incomplètes.");
  }
}

/** Envoie une demande de réservation. Lève une erreur explicite si elle échoue. */
export async function createReservation(payload: ReservationPayload): Promise<ReservationResult> {
  validerPayload(payload);

  let reponse: Response;
  try {
    reponse = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Réseau coupé, requête bloquée : rien n'est parti.
    throw new Error(ERREUR_GENERIQUE);
  }

  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok || !donnees?.ok) {
    throw new Error(donnees?.erreur || ERREUR_GENERIQUE);
  }
  return { ok: true, reference: String(donnees.reference) };
}
