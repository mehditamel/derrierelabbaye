import { site } from "@/data/site";
import { cuisine, barSections, boissonsDouces } from "@/data/menu";
import type { MenuSection } from "@/data/menu";

/* Valeurs encore en placeholder dans data/site.ts : on évite de les émettre
   dans les données structurées pour ne pas exposer de fausses infos à Google. */
const PLACEHOLDER_TEL = "+33 4 00 00 00 00";
const PLACEHOLDER_SOCIALS = new Set([
  "https://www.instagram.com/",
  "https://www.facebook.com/",
]);

/** Extrait un prix unique d'une chaîne ("7€"→"7", "3,50€"→"3.50").
 *  Renvoie null si zéro ou plusieurs nombres (ex. fourchette "12€ – 15€"). */
function parseSinglePrice(raw?: string): string | null {
  if (!raw) return null;
  const matches = raw.match(/\d+(?:[.,]\d+)?/g);
  if (!matches || matches.length !== 1) return null;
  return matches[0].replace(",", ".");
}

function menuSectionToSchema(section: MenuSection) {
  return {
    "@type": "MenuSection",
    name: section.titre,
    hasMenuItem: section.items.map((item) => {
      const price = parseSinglePrice(item.prix ?? section.surtitre);
      return {
        "@type": "MenuItem",
        name: item.nom,
        ...(item.description ? { description: item.description } : {}),
        ...(price
          ? { offers: { "@type": "Offer", price, priceCurrency: "EUR" } }
          : {}),
      };
    }),
  };
}

/** Données structurées schema.org (@graph) pour le SEO local + rich results. */
export function JsonLd() {
  const telephone =
    site.telephone === PLACEHOLDER_TEL ? undefined : site.telephone;
  const sameAs = site.reseaux
    .map((r) => r.url)
    .filter((u) => !PLACEHOLDER_SOCIALS.has(u));

  const bar = {
    "@type": "BarOrPub",
    "@id": `${site.url}/#bar`,
    name: site.nom,
    description:
      "Apéro marseillais — bar à tapas & cocktails, juste derrière l'Abbaye Saint-Victor.",
    url: site.url,
    image: `${site.url}/enseigne.jpeg`,
    logo: `${site.url}/logo-noir.png`,
    ...(telephone ? { telephone } : {}),
    email: site.email,
    priceRange: site.gammeDePrix,
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card",
    servesCuisine: ["Tapas", "Méditerranéenne", "Cocktails"],
    acceptsReservations: `${site.url}/reserver`,
    areaServed: site.adresse.ville,
    hasMap: site.adresse.mapsUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.adresse.rue,
      postalCode: site.adresse.codePostal,
      addressLocality: site.adresse.ville,
      addressRegion: "Provence-Alpes-Côte d'Azur",
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
    hasMenu: { "@id": `${site.url}/#menu` },
    ...(sameAs.length ? { sameAs } : {}),
  };

  const menu = {
    "@type": "Menu",
    "@id": `${site.url}/#menu`,
    name: "La carte — Derrière l'Abbaye",
    inLanguage: "fr-FR",
    hasMenuSection: [...cuisine, ...barSections, ...boissonsDouces].map(
      menuSectionToSchema
    ),
  };

  const website = {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.nom,
    inLanguage: "fr-FR",
    publisher: { "@id": `${site.url}/#bar` },
  };

  const data = {
    "@context": "https://schema.org",
    "@graph": [bar, menu, website],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
