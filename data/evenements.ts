/* =====================================================================
   Derrière l'Abbaye — Événements & actualités (« En ce moment »)

   Ce fichier alimente à la fois l'affichage (site + PWA) et le JSON-LD
   schema.org/Event envoyé à Google. Tout ce qui y figure est donc annoncé
   publiquement comme un événement réel : n'y mettre que du programmé.
   ===================================================================== */

export type Evenement = {
  /** Slug stable : clé React et @id dans le JSON-LD. */
  id: string;
  titre: string;
  description: string;
  /** "yyyy-mm-dd" — événement daté (retiré de l'affichage une fois passé). */
  date?: string;
  /** "19:00" — facultatif, avec `date`. */
  heure?: string;
  /** Rendez-vous récurrent (ex. « Tous les jeudis ») — exclusif de `date`. */
  recurrence?: string;
  lien?: { label: string; url: string };
};

/**
 * Événements réellement programmés par l'établissement.
 *
 * Tableau vide = section masquée partout (site, PWA) et aucun `Event` émis dans
 * le JSON-LD. C'est l'état correct tant que rien n'est programmé : mieux vaut
 * ne rien annoncer qu'annoncer une soirée qui n'aura pas lieu.
 *
 * ⚑ À renseigner par l'établissement. Les identifiants commençant par
 * « demo- » sont refusés par lib/__tests__/site.test.ts.
 */
export const evenements: Evenement[] = [];
