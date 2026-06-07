/* =====================================================================
   Service fidélité — SIMULÉ (état local, aucun back-end).
   ===================================================================== */

export type Avantage = {
  seuil: number;
  titre: string;
  detail: string;
};

export type LoyaltyState = {
  membre: string;
  points: number;
  palier: number; // points pour le prochain avantage
};

export const avantages: Avantage[] = [
  { seuil: 50, titre: "Un cocktail offert", detail: "à votre prochaine visite" },
  { seuil: 120, titre: "Une planche offerte", detail: "charcuterie ou fromages" },
  { seuil: 250, titre: "Apéro pour deux", detail: "deux cocktails + une planche mixte" },
];

/** État de démonstration affiché dans l'écran Fidélité. */
export const demoLoyalty: LoyaltyState = {
  membre: "Membre Derrière l'Abbaye",
  points: 80,
  palier: 120,
};

/** Points crédités par visite (aperçu du programme). */
export const POINTS_PAR_VISITE = 20;

/** Avantage suivant à débloquer selon les points. */
export function prochainAvantage(points: number): Avantage | null {
  return avantages.find((a) => a.seuil > points) ?? null;
}

/** Avantage tout juste franchi entre deux totaux de points (ou null). */
export function avantageFranchi(avant: number, apres: number): Avantage | null {
  return avantages.find((a) => a.seuil > avant && a.seuil <= apres) ?? null;
}
