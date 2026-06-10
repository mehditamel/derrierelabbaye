/* =====================================================================
   Partage : Web Share API si disponible, sinon copie dans le presse-papiers
   (l'URL si fournie, le texte sinon).
   ===================================================================== */

export type ContenuPartage = {
  title: string;
  text: string;
  url?: string;
};

export async function partagerOuCopier(
  contenu: ContenuPartage
): Promise<"partage" | "copie" | "echec"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(contenu);
    } catch {
      /* partage annulé : ne surtout pas afficher « copié » */
    }
    return "partage";
  }
  try {
    await navigator.clipboard.writeText(contenu.url ?? contenu.text);
    return "copie";
  } catch {
    return "echec";
  }
}
