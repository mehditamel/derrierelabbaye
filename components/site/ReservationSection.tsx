import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { ReservationForm } from "./ReservationForm";
import { copies } from "@/data/site";
import styles from "./ReservationSection.module.css";

export function ReservationSection() {
  return (
    <section id="reserver" className={styles.section}>
      <div className="u-container u-narrow">
        <div className={styles.head}>
          <SectionLabel>{copies.reservationSurtitre}</SectionLabel>
          <h2 className={styles.title}>{copies.reservationTitre}</h2>
          <GoldRule className={styles.rule} />
          <p className={styles.text}>{copies.reservationTexte}</p>
        </div>
        <div className={styles.card}>
          <ReservationForm />
        </div>
      </div>
    </section>
  );
}
