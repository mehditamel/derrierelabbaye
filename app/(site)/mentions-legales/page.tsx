import type { Metadata } from "next";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { site } from "@/data/site";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site de Derrière l'Abbaye — bar à tapas & cocktails derrière l'Abbaye Saint-Victor, quartier Saint-Victor, Marseille.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <section className={styles.page}>
      <div className="u-container u-narrow">
        <div className={styles.head}>
          <SectionLabel>Informations</SectionLabel>
          <h1 className={styles.title}>Mentions légales</h1>
          <GoldRule className={styles.rule} />
          <p className={styles.updated}>Dernière mise à jour : 12 septembre 2026</p>
        </div>

        <div className={styles.prose}>
          <h2>Éditeur du site</h2>
          <p>
            {site.legales.raisonSociale}, {site.legales.formeJuridique}, au capital de{" "}
            {site.legales.capital}.
          </p>
          <p>
            Siège social : {site.legales.siege}. SIRET du siège : {site.legales.siretSiege}.
          </p>
          <p>
            Immatriculation : {site.legales.rcs}. TVA intracommunautaire : {site.legales.tva}.
          </p>
          <p>
            Établissement : {site.adresse.rue}, {site.adresse.codePostal} {site.adresse.ville},{" "}
            {site.adresse.pays}. SIRET : {site.legales.siret}.
          </p>
          <p>
            Contact : <a href={`mailto:${site.email}`}>{site.email}</a> ·{" "}
            <a href={`tel:${site.telephone.replace(/\s/g, "")}`}>{site.telephoneAffichage}</a>
          </p>
          <p>Responsable de la publication : {site.legales.directeurPublication}.</p>

          <h2>Hébergement</h2>
          <p>
            Le site est hébergé par {site.legales.hebergeur.nom} — {site.legales.hebergeur.adresse}.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            Les textes, photographies, logos et éléments graphiques de ce site sont la propriété de{" "}
            {site.nom}, sauf mention contraire. Toute reproduction ou réutilisation sans accord
            préalable est interdite.
          </p>

          <h2>Boissons alcoolisées</h2>
          <p>{site.legal}</p>
          <p>La vente d'alcool aux mineurs est interdite.</p>
        </div>
      </div>
    </section>
  );
}
