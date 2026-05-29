import type { Metadata } from "next";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { ReservationForm } from "@/components/site/ReservationForm";
import { copies, site } from "@/data/site";
import styles from "./reserver.module.css";

export const metadata: Metadata = {
  title: "Réserver une table",
  description:
    "Réservez votre table chez Derrière l'Abbaye — bar à tapas & cocktails, Saint-Victor, Marseille.",
  alternates: { canonical: "/reserver" },
};

export default function ReserverPage() {
  return (
    <section className={styles.page}>
      <div className="u-container u-narrow">
        <div className={styles.head}>
          <SectionLabel>{copies.reservationSurtitre}</SectionLabel>
          <h1 className={styles.title}>{copies.reservationTitre}</h1>
          <GoldRule className={styles.rule} />
          <p className={styles.text}>{copies.reservationTexte}</p>
          <p className={styles.address}>
            {site.adresse.rue} · {site.adresse.codePostal} {site.adresse.ville}
          </p>
        </div>
        <div className={styles.card}>
          <ReservationForm />
        </div>
      </div>
    </section>
  );
}
