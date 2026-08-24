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

/**
 * État initial de l'aperçu Fidélité.
 *
 * `points: 0` volontairement : créditer des points à un visiteur qui n'a jamais
 * mis les pieds au bar afficherait un solde — voire un avantage « Acquis » —
 * qu'aucun comptoir n'honorera. L'aperçu doit montrer le mécanisme, pas
 * fabriquer un crédit.
 */
export const demoLoyalty: LoyaltyState = {
  membre: "Aperçu du programme",
  points: 0,
  palier: 50,
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
