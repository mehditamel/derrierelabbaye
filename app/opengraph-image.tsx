import { ImageResponse } from "next/og";
import { site } from "@/data/site";

// Runtime Node par défaut : l'image est pré-générée statiquement au build.
export const alt =
  "Derrière l'Abbaye — bar à tapas & cocktails, Saint-Victor, Marseille";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Charte : noir chaud / crème / or laiton (cf. styles/colors_and_type.css)
const NOIR = "#14110d";
const CREAM = "#f8f3e9";
const CREAM_70 = "rgba(248, 243, 233, 0.72)";
const GOLD = "#a8884c";

/** Carte de partage 1200×630 générée à la volée (Open Graph + Twitter). */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: NOIR,
          color: CREAM,
          fontFamily: "serif",
          padding: 64,
        }}
      >
        {/* Filet doré encadrant la carte */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            border: `1px solid ${GOLD}`,
            opacity: 0.55,
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: GOLD,
          }}
        >
          {site.accroche}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 116,
            fontWeight: 600,
            lineHeight: 1.05,
            marginTop: 24,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          {site.nom}
        </div>

        <div
          style={{
            display: "flex",
            width: 120,
            height: 2,
            backgroundColor: GOLD,
            marginBottom: 28,
          }}
        />

        <div style={{ display: "flex", fontSize: 40, color: CREAM }}>
          {site.baseline}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            marginTop: 28,
            color: CREAM_70,
          }}
        >
          {site.adresse.rue} · {site.adresse.codePostal} {site.adresse.ville} —{" "}
          {site.adresse.quartier}
        </div>
      </div>
    ),
    size
  );
}
