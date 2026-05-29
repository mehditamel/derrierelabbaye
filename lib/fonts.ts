import { Jost, Cormorant_Garamond, EB_Garamond } from "next/font/google";

/* Polices (substituts Google Fonts — cf. README « font substitution »).
   Exposées en variables CSS, consommées dans colors_and_type.css. */

export const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

export const fontVariables = `${jost.variable} ${cormorant.variable} ${ebGaramond.variable}`;
