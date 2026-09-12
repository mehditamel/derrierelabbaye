import { Phone, ArrowUpRight } from "lucide-react";
import { ReservationAccess } from "@/components/ReservationAccess";
import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Reveal } from "@/components/Reveal";
import { ReservationForm } from "./ReservationForm";
import { copies, site } from "@/data/site";
import styles from "./ReservationSection.module.css";

export function ReservationSection() {
  if (!site.reservationEnLigne)
    return (
      <section id="reserver" className={styles.poster} aria-labelledby="reservation-titre">
        <div className={styles.orbit} aria-hidden="true">
          <span /> <span />
        </div>
        <div className={["u-container", styles.posterInner].join(" ")}>
          <Reveal className={styles.posterTop}>
            <span className={styles.label}>Réserver une table</span>
            <span className={styles.label}>Saint-Victor · Marseille</span>
          </Reveal>
          <Reveal className={styles.invitation}>
            <h2 id="reservation-titre">
              Ce soir,
              <br />
              <em>on se retrouve&nbsp;?</em>
            </h2>
            <p>
              Un apéro à deux, une soirée entre amis, une grande tablée.
              <br />
              Votre table commence par un appel.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <a href={"tel:" + site.telephone.replace(/\s/g, "")} className={styles.posterCall}>
              <span className={styles.callLabel}>
                <Phone size={19} aria-hidden="true" /> Appeler pour réserver
              </span>
              <span className={styles.phoneLine}>
                <strong>{site.telephoneAffichage}</strong>
                <ArrowUpRight aria-hidden="true" />
              </span>
            </a>
          </Reveal>
          <div className={styles.posterBottom}>
            <p>
              Du mardi au dimanche <strong>18h — 02h</strong>
            </p>
            <p>
              Votre réservation est confirmée directement par téléphone.
              <br />
              Fermé le lundi soir.
            </p>
          </div>
        </div>
      </section>
    );
  return (
    <section id="reserver" className={styles.section}>
      <div className="u-container u-narrow">
        <Reveal>
          <div className={styles.head}>
            <SectionLabel>{copies.reservationSurtitre}</SectionLabel>
            <h2 className={styles.title}>{copies.reservationTitre}</h2>
            <GoldRule className={styles.rule} draw />
            <p className={styles.text}>{copies.reservationTexte}</p>
          </div>
        </Reveal>
        <Reveal delay={120} variant="scale">
          <div className={styles.card}>
            <ReservationAccess>
              <ReservationForm />
            </ReservationAccess>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
