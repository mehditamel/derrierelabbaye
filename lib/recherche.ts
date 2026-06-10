/* =====================================================================
   Recherche dans la carte — fonctions pures, partagées site + app.
   ===================================================================== */

import type { MenuItem, MenuSection } from "@/data/menu";

/** Minuscules, sans accents ni ligatures : « Rôties » → « roties ». */
export function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .toLowerCase()
    .trim();
}

/** L'item correspond-il à la requête (nom + description) ? */
export function correspondItem(item: MenuItem, requete: string): boolean {
  const cible = normaliser(`${item.nom} ${item.description ?? ""}`);
  return cible.includes(normaliser(requete));
}

/**
 * Filtre les sections par requête : items non correspondants retirés,
 * sections vides supprimées. Requête vide → sections inchangées.
 */
export function filtrerSections(
  sections: readonly MenuSection[],
  requete: string
): MenuSection[] {
  if (!requete.trim()) return [...sections];
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => correspondItem(item, requete)),
    }))
    .filter((section) => section.items.length > 0);
}
