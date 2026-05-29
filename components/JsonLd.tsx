import { site } from "@/data/site";

/** Données structurées schema.org (BarOrPub) pour le SEO local. */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: site.nom,
    description:
      "Apéro marseillais — bar à tapas & cocktails, juste derrière l'Abbaye Saint-Victor.",
    url: site.url,
    image: `${site.url}/enseigne.jpeg`,
    logo: `${site.url}/logo-noir.png`,
    telephone: site.telephone,
    email: site.email,
    priceRange: site.gammeDePrix,
    servesCuisine: ["Tapas", "Méditerranéenne", "Cocktails"],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.adresse.rue,
      postalCode: site.adresse.codePostal,
      addressLocality: site.adresse.ville,
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.adresse.geo.lat,
      longitude: site.adresse.geo.lng,
    },
    openingHoursSpecification: site.horairesSchema.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.jours,
      opens: h.ouvre,
      closes: h.ferme,
    })),
    sameAs: site.reseaux.map((r) => r.url),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
