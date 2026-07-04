import type { Metadata } from "next";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { site } from "@/data/site";
import styles from "./quartier.module.css";

export const metadata: Metadata = {
  title: "Le quartier Saint-Victor — Abbaye, Vieux-Port & où boire un verre",
  description:
    "Tout sur le quartier Saint-Victor à Marseille : l'Abbaye Saint-Victor, l'un des plus anciens monuments de la ville, le Vieux-Port et le Pharo à deux pas — et Derrière l'Abbaye, le bar à tapas & cocktails niché juste derrière, dans une rue calme.",
  alternates: { canonical: "/quartier-saint-victor" },
  openGraph: {
    type: "article",
    title: "Le quartier Saint-Victor — Abbaye, Vieux-Port & où boire un verre",
    description:
      "L'Abbaye Saint-Victor, le Vieux-Port, le Pharo… et Derrière l'Abbaye, le bar niché dans une rue calme juste derrière le monument.",
    url: `${site.url}/quartier-saint-victor`,
  },
};

/* Données structurées de la page : le monument voisin (TouristAttraction),
   la page elle-même et le fil d'Ariane. Le bar (#bar) est déjà décrit dans
   le JSON-LD global du layout — on s'y rattache par @id. */
function PageJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LandmarksOrHistoricalBuildings",
        name: "Abbaye Saint-Victor de Marseille",
        description:
          "L'une des plus anciennes abbayes de France, fondée au Ve siècle, dans le quartier Saint-Victor à Marseille, à deux pas du Vieux-Port.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Marseille",
          postalCode: "13007",
          addressRegion: "Provence-Alpes-Côte d'Azur",
          addressCountry: "FR",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${site.url}/quartier-saint-victor`,
        url: `${site.url}/quartier-saint-victor`,
        name: "Le quartier Saint-Victor — Abbaye, Vieux-Port & où boire un verre",
        inLanguage: "fr-FR",
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#bar` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Le quartier Saint-Victor",
            item: `${site.url}/quartier-saint-victor`,
          },
        ],
      },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function QuartierSaintVictorPage() {
  return (
    <section className={styles.page}>
      <PageJsonLd />
      <div className="u-container u-narrow">
        <Reveal>
          <div className={styles.head}>
            <SectionLabel>Le quartier</SectionLabel>
            <h1 className={styles.title}>Saint-Victor, et nous juste derrière l&apos;Abbaye</h1>
            <p className={styles.lede}>
              Un des plus vieux coins de Marseille : l&apos;Abbaye Saint-Victor veille sur la rive
              sud du Vieux-Port depuis plus de quinze siècles. Tout autour, des ruelles tranquilles,
              la mer en contrebas, la lumière du soir sur la pierre. Et, dans l&apos;une de ces rues
              calmes, juste derrière le monument : nous.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <GoldRule className={styles.rule} draw />
        </Reveal>

        <Reveal delay={120}>
          <div className={styles.block}>
            <h2 className={styles.blockTitle}>L&apos;Abbaye Saint-Victor</h2>
            <div className={styles.prose}>
              <p>
                Fondée au <strong>Ve siècle</strong> par Jean Cassien, l&apos;Abbaye Saint-Victor
                est l&apos;un des plus anciens lieux de culte chrétien de France. De l&apos;abbaye
                médiévale subsiste une <strong>église fortifiée</strong> aux allures de forteresse,
                ses hautes tours crénelées et ses <strong>cryptes</strong> — un dédale de pierre où
                l&apos;on descend dans le silence des siècles, sous le niveau de la rue.
              </p>
              <p>
                Chaque <strong>2 février</strong>, le quartier s&apos;anime pour la Chandeleur :
                procession aux cierges verts depuis le Vieux-Port et fameuses{" "}
                <strong>navettes</strong>, ces petits biscuits en forme de barque parfumés à la
                fleur d&apos;oranger. Une tradition marseillaise née ici même, à l&apos;ombre de
                l&apos;abbaye.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Flâner autour de Saint-Victor</h2>
            <div className={styles.prose}>
              <p>
                Le quartier est un balcon sur la ville. En contrebas, le <strong>Vieux-Port</strong>{" "}
                et ses pointus, à une dizaine de minutes à pied par les quais. À deux pas, le{" "}
                <strong>jardin du Pharo</strong> et son panorama sur la passe et le large. Plus
                haut, la <strong>Bonne Mère</strong> — Notre-Dame-de-la-Garde — veille sur Marseille
                ; au loin, le <strong>MuCEM</strong> et le Fort Saint-Jean ferment l&apos;entrée du
                port.
              </p>
              <p>
                C&apos;est un Marseille à hauteur d&apos;homme : on visite l&apos;abbaye, on grimpe
                vers la basilique, on traîne sur les quais au coucher du soleil. Et quand vient
                l&apos;heure de l&apos;apéro, on redescend vers la rue calme, juste derrière le
                monument.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} variant="scale">
          <div className={styles.venue}>
            <SectionLabel>Où boire un verre</SectionLabel>
            <h2 className={styles.blockTitle}>Derrière l&apos;Abbaye</h2>
            <p className={styles.venueText}>
              Une devanture en acier corten, une lumière chaude, des bouteilles qui scintillent dans
              la pénombre : c&apos;est l&apos;apéro marseillais dans une rue tranquille de
              Saint-Victor. Tapas à partager, planches de caractère et cocktails qui sentent le sud
              — l&apos;adresse idéale pour prolonger la visite, à l&apos;abri de la foule du
              Vieux-Port.
            </p>
            <div className={styles.cta}>
              <Button href="/reserver" variant="primary">
                Réserver une table
              </Button>
              <Button href="/carte" variant="ghost">
                Voir la carte
              </Button>
              <Button href={site.adresse.directionsUrl} variant="ghost">
                Itinéraire
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
