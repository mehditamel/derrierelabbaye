/* =====================================================================
   Règles de validation d'une réservation — logique pure, partagée par les
   formulaires (client) et par la route app/api/reservations (serveur).

   Module volontairement distinct de useReservationForm.ts : ce dernier est
   marqué "use client" et ne peut donc pas être importé depuis le serveur.
   ===================================================================== */

/** Valide un numéro de téléphone français souple (fixe ou mobile). Vide = valide. */
export function telephoneValide(tel: string): boolean {
  const v = tel.trim();
  if (v === "") return true;
  return /^(?:\+33|0)\s?[1-9](?:[\s.]?\d{2}){4}$/.test(v);
}

/** Valide une adresse e-mail (contrôle volontairement permissif). Vide = valide.
 *  On refuse l'évidemment faux sans prétendre trancher les cas exotiques :
 *  c'est l'envoi qui fait foi. */
export function emailValide(email: string): boolean {
  const v = email.trim();
  if (v === "") return true;
  return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(v);
}
