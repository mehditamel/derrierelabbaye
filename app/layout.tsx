import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { site, copies } from "@/data/site";
import "@/styles/colors_and_type.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Derrière l'Abbaye — Bar à tapas & cocktails · Marseille",
    template: "%s — Derrière l'Abbaye",
  },
  description:
    "Apéro marseillais, bar à tapas & cocktails au 1 rue de l'Abbaye, quartier Saint-Victor à Marseille. Tapas à partager, planches et cocktails dans une ambiance intimiste.",
  applicationName: site.nom,
  keywords: [
    "bar à tapas Marseille",
    "cocktails Marseille",
    "apéro Saint-Victor",
    "Derrière l'Abbaye",
    "bar Marseille 13007",
    "tapas Saint-Victor",
  ],
  authors: [{ name: site.nom }],
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: site.url,
    siteName: site.nom,
    title: "Derrière l'Abbaye — Bar à tapas & cocktails · Marseille",
    description: copies.heroAccroche,
    // og:image (+ width/height/alt) fourni automatiquement par
    // app/opengraph-image.tsx via son export `size` (1200×630).
  },
  twitter: {
    card: "summary_large_image",
    title: "Derrière l'Abbaye — Bar à tapas & cocktails · Marseille",
    description: copies.heroAccroche,
    // twitter:image fourni automatiquement par app/twitter-image.tsx
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: site.nom,
    statusBarStyle: "black-translucent",
  },
  // Évite l'auto-détection iOS des numéros dans le texte ; les liens tel: restent explicites.
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#14110d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
