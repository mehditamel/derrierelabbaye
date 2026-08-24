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

/** Message unique, repris mot pour mot par les formulaires et par la route :
 *  le visiteur doit lire la même phrase quel que soit l'endroit où la règle
 *  est appliquée. */
export const MESSAGE_CONTACT_MANQUANT =
  "Laissez un téléphone ou un e-mail : sans l'un des deux, nous ne pouvons pas confirmer votre table.";

/** Vrai si la demande laisse au moins un moyen de rappel.
 *
 *  Les deux champs sont facultatifs pris séparément — beaucoup de clients ne
 *  donnent qu'un numéro, d'autres qu'une adresse. Mais aucun des deux, c'est une
 *  demande morte : sans base de données, la boîte mail du bar est le registre, et
 *  une ligne sans contact ne peut être ni confirmée, ni rappelée en cas
 *  d'imprévu — pendant que la table, elle, reste bloquée. */
export function contactJoignable(telephone: string, email: string): boolean {
  return telephone.trim() !== "" || email.trim() !== "";
}
