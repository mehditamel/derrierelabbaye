import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Reveal } from "@/components/Reveal";
import { copies } from "@/data/site";
import styles from "./LeQuartier.module.css";

export function LeQuartier() {
  return (
    <section id="le-quartier" className={styles.section}>
      <div className="u-container u-narrow">
        <Reveal>
          <div className={styles.head}>
            <SectionLabel>{copies.quartierSurtitre}</SectionLabel>
            <h2 className={styles.title}>{copies.quartierTitre}</h2>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <GoldRule className={styles.rule} draw />
        </Reveal>

        <Reveal delay={120}>
          <p className={styles.text}>{copies.quartierTexte}</p>
        </Reveal>

        <Reveal delay={160}>
          <p className={styles.text}>{copies.quartierTexte2}</p>
        </Reveal>
      </div>
    </section>
  );
}
