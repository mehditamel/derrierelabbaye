/* =====================================================================
   Service de réservation — SIMULÉ (aucun back-end).
   Isolé ici pour brancher une vraie API plus tard sans toucher l'UI.
   ===================================================================== */

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

/**
 * Simule l'enregistrement d'une réservation (faux délai réseau).
 * Remplacer le corps par un appel API réel le moment venu.
 */
export async function createReservation(
  payload: ReservationPayload
): Promise<ReservationResult> {
  await delay(900);
  if (!payload.date || !payload.heure || !payload.nom || payload.couverts < 1) {
    throw new Error("Informations de réservation incomplètes.");
  }
  return { ok: true, reference: genererReference() };
}
