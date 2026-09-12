import jour from "@/public/photos/abbaye-exterieur.webp";
import nuit from "@/public/photos/abbaye-nuit.webp";

export const photosAbbaye = {
  jour: {
    image: jour,
    alt: "Les tours crénelées et la façade en pierre de l'abbaye Saint-Victor de Marseille, en journée",
    caption: "La pierre, les tours, le ciel de Marseille.",
    author: "Bjs",
    source: "https://commons.wikimedia.org/wiki/File:Marseille-Saint-Victor-bjs180810-01.jpg",
  },
  nuit: {
    image: nuit,
    alt: "L'abbaye Saint-Victor éclairée la nuit, au-dessus des bateaux du Vieux-Port de Marseille",
    caption: "Saint-Victor, à la nuit tombée.",
    author: "Vlad Mandyev",
    source: "https://commons.wikimedia.org/wiki/File:Abbaye_Saint-Victor_1457.jpg",
  },
} as const;

export type PhotoAbbayeId = keyof typeof photosAbbaye;
export const licencePhotosAbbaye = "https://creativecommons.org/licenses/by-sa/4.0/";
