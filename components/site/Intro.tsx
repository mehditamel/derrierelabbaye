import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Reveal } from "@/components/Reveal";
import { copies, reperes } from "@/data/site";
import styles from "./Intro.module.css";

export function Intro() {
  return (
    <section id="le-lieu" className={styles.section}>
      <div className="u-container u-narrow">
        <Reveal>
          <div className={styles.head}>
            <SectionLabel>{copies.introSurtitre}</SectionLabel>
            <h2 className={styles.title}>{copies.introTitre}</h2>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <GoldRule className={styles.rule} draw />
        </Reveal>

        <Reveal delay={120}>
          <p className={styles.text}>{copies.introTexte}</p>
        </Reveal>

        <Reveal delay={160}>
          <ul className={styles.stats}>
            {reperes.map((r) => (
              <li key={r.valeur} className={styles.stat}>
                <span className={styles.statValue}>{r.valeur}</span>
                <span className={styles.statLabel}>{r.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
