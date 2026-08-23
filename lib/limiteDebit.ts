/* =====================================================================
   Limite de débit en mémoire, sans dépendance ni infrastructure.

   ⚠️ Portée : la mémoire appartient à une instance de fonction serverless et
   repart à zéro au démarrage à froid. Ce n'est donc pas un quota strict, mais
   un garde-fou contre l'envoi en rafale — proportionné au trafic d'un bar, et
   complété par le honeypot du formulaire. Si du spam passait malgré tout, la
   suite serait un stockage partagé (Vercel KV / Upstash).
   ===================================================================== */

export type FenetreLimite = { max: number; dureeMs: number };

/** 5 demandes par tranche de 10 minutes, 20 par jour. */
export const FENETRES_RESERVATION: FenetreLimite[] = [
  { max: 5, dureeMs: 10 * 60_000 },
  { max: 20, dureeMs: 24 * 60 * 60_000 },
];

const horodatages = new Map<string, number[]>();

/** Purge les clés dont plus aucun passage n'est dans la plus large fenêtre. */
function purger(maintenant: number, plusLongue: number): void {
  for (const [cle, passages] of horodatages) {
    const recents = passages.filter((t) => maintenant - t < plusLongue);
    if (recents.length === 0) horodatages.delete(cle);
    else horodatages.set(cle, recents);
  }
}

/**
 * Enregistre un passage pour `cle` et dit s'il est autorisé.
 * Un passage refusé n'est pas comptabilisé : inutile de pénaliser
 * indéfiniment quelqu'un qui réessaie.
 */
export function autoriser(
  cle: string,
  maintenant: number = Date.now(),
  fenetres: FenetreLimite[] = FENETRES_RESERVATION
): boolean {
  const plusLongue = Math.max(...fenetres.map((f) => f.dureeMs));
  purger(maintenant, plusLongue);

  const passages = horodatages.get(cle) ?? [];
  const depasse = fenetres.some(
    (f) => passages.filter((t) => maintenant - t < f.dureeMs).length >= f.max
  );
  if (depasse) return false;

  horodatages.set(cle, [...passages, maintenant]);
  return true;
}

/** Remet le compteur à zéro — réservé aux tests. */
export function reinitialiserLimites(): void {
  horodatages.clear();
}
