/** Extrait un prix unique d'une chaîne ("7 €" → "7", "3,50 €" → "3.50").
 *  Renvoie null si zéro ou plusieurs nombres (ex. fourchette "12 – 15 €") :
 *  schema.org attend un prix unique, on préfère ne rien émettre qu'un prix faux. */
export function parseSinglePrice(raw?: string): string | null {
  if (!raw) return null;
  const matches = raw.match(/\d+(?:[.,]\d+)?/g);
  if (!matches || matches.length !== 1) return null;
  return matches[0].replace(",", ".");
}
