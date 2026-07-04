import type { Metadata } from "next";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { CarteSection } from "@/components/site/CarteSection";
import { CocktailsSection } from "@/components/site/CocktailsSection";
import { CartesImprimees } from "@/components/site/CartesImprimees";
import { site } from "@/data/site";
import styles from "./carte.module.css";

export const metadata: Metadata = {
  title: "La carte — tapas à partager, planches & cocktails",
  description:
    "La carte de Derrière l'Abbaye, bar à tapas & cocktails à Saint-Victor (Marseille) : petites assiettes à partager, froides et chaudes, planches de caractère, cocktails classiques et long drinks. À deux pas du Vieux-Port.",
  alternates: { canonical: "/carte" },
  openGraph: {
    type: "website",
    title: "La carte — tapas à partager, planches & cocktails",
    description:
      "Tapas à partager, planches de caractère et cocktails qui sentent le sud — la carte de Derrière l'Abbaye, juste derrière l'Abbaye Saint-Victor à Marseille.",
    url: `${site.url}/carte`,
  },
};

/* Données structurées de la page : la page elle-même (rattachée au Menu et au
   bar décrits dans le JSON-LD global du layout) et le fil d'Ariane. */
function PageJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${site.url}/carte`,
        url: `${site.url}/carte`,
        name: "La carte — tapas à partager, planches & cocktails",
        inLanguage: "fr-FR",
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#bar` },
        mainEntity: { "@id": `${site.url}/#menu` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
          { "@type": "ListItem", position: 2, name: "La carte", item: `${site.url}/carte` },
        ],
      },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function CartePage() {
  return (
    <>
      <PageJsonLd />
      <section className={styles.head}>
        <div className="u-container u-narrow">
          <Reveal>
            <div className={styles.headInner}>
              <SectionLabel>La carte</SectionLabel>
              <h1 className={styles.title}>Tapas, planches &amp; cocktails</h1>
              <p className={styles.lede}>
                Une cuisine du sud pensée pour le partage et un bar qui suit le rythme de la soirée
                : petites assiettes froides et chaudes, planches généreuses, cocktails classiques et
                créations. À accompagner d&apos;un verre, d&apos;une bouteille… ou des deux.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <GoldRule className={styles.rule} draw />
          </Reveal>
        </div>
      </section>

      <CarteSection lienCarteComplete={false} />
      <CocktailsSection />
      <CartesImprimees />

      <section className={styles.reserver}>
        <div className="u-container u-narrow">
          <Reveal variant="scale">
            <div className={styles.reserverInner}>
              <p className={styles.reserverText}>
                Une envie parmi tout ça ? La meilleure façon d&apos;y goûter, c&apos;est encore de
                venir.
              </p>
              <Button href="/reserver" variant="primary">
                Réserver une table
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
