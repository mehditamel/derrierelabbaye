import { Jost, Cormorant_Garamond } from "next/font/google";

/* Polices (substituts Google Fonts — cf. README « font substitution »).
   Exposées en variables CSS, consommées dans colors_and_type.css.

   Deux familles seulement : Jost pour le sans-serif, Cormorant Garamond pour
   le serif (titres ET corps de texte). EB Garamond, troisième famille et
   second garamond, a été retirée — elle coûtait 90 Ko de woff2 préchargés sur
   CHAQUE page pour huit usages, alors que Cormorant couvre les deux emplois.
   C'était le plus gros coût fixe du site. */

export const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  // 400/500 servent aussi le corps de texte depuis la fusion des garamonds.
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const fontVariables = `${jost.variable} ${cormorant.variable}`;
