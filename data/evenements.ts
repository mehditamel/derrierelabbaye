/* =====================================================================
   Derrière l'Abbaye — Événements & actualités (« En ce moment »)
   ⚑ À REMPLACER : contenu de DÉMONSTRATION, comme les placeholders de
   data/site.ts. Renseigner ici les vraies soirées / annonces du bar ;
   vider le tableau masque simplement la section (site + PWA).
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

export const evenements: Evenement[] = [
  /* ⚑ À REMPLACER — exemples de démonstration */
  {
    id: "jeudis-vinyle",
    titre: "Les jeudis vinyle",
    description:
      "Un invité, une platine, une sélection — soul, jazz et musiques du sud jusqu'à la fermeture.",
    recurrence: "Tous les jeudis, dès 19h00",
  },
  {
    id: "soiree-vigneron-2027-03-18",
    titre: "Soirée vigneron — Côtes-de-Provence",
    description:
      "Un domaine invité au comptoir : dégustation commentée de trois cuvées, accordées à nos planches.",
    date: "2027-03-18",
    heure: "19:00",
  },
  {
    id: "fete-navettes-2027-02-02",
    titre: "Chandeleur à Saint-Victor",
    description:
      "Le quartier célèbre les navettes de l'Abbaye : pour l'occasion, apéro prolongé et navettes maison au comptoir.",
    date: "2027-02-02",
    heure: "17:00",
  },
];
