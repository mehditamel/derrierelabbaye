import type { Metadata } from "next";
import { SectionLabel } from "@/components/SectionLabel";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ReservationSection } from "@/components/site/ReservationSection";
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
        <div className={styles.halo} aria-hidden="true" />
        <div className="u-container">
          <div className={styles.headInner}>
            <Reveal>
              <SectionLabel onDark>La carte · Tapas, planches &amp; cocktails</SectionLabel>
              <h1 className={styles.title}>
                À&nbsp;partager.
                <br />
                <em>À&nbsp;savourer.</em>
              </h1>
            </Reveal>
            <Reveal delay={120} className={styles.headSide}>
              <p className={styles.lede}>
                Des petites assiettes qui circulent. Des cocktails que l&apos;on prend le temps de
                choisir. Composez votre soirée, on s&apos;occupe du reste.
              </p>
              <a href={"tel:" + site.telephone.replace(/\s/g, "")} className={styles.call}>
                <span>Réserver par téléphone</span>
                <strong>
                  {site.telephoneAffichage} <ArrowUpRight size={20} aria-hidden="true" />
                </strong>
              </a>
            </Reveal>
          </div>
          <nav className={styles.shortcuts} aria-label="Explorer la carte">
            <a href="#la-carte">
              <span>01</span>
              <strong>Les tapas</strong>
              <ArrowDown size={20} aria-hidden="true" />
            </a>
            <a href="#cocktails">
              <span>02</span>
              <strong>Les boissons</strong>
              <ArrowDown size={20} aria-hidden="true" />
            </a>
            <a href="#cartes-imprimees">
              <span>03</span>
              <strong>La carte imprimée</strong>
              <ArrowDown size={20} aria-hidden="true" />
            </a>
          </nav>
        </div>
      </section>

      <CarteSection lienCarteComplete={false} />
      <CocktailsSection />
      <CartesImprimees />

      <ReservationSection />
    </>
  );
}
