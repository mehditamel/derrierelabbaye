import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Reveal } from "@/components/Reveal";
import { faq } from "@/data/site";
import styles from "./Faq.module.css";

export function Faq() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-titre">
      <div className="u-container u-narrow">
        <div className={styles.head}>
          <SectionLabel>Bon à savoir</SectionLabel>
          <h2 id="faq-titre" className={styles.title}>
            Questions fréquentes
          </h2>
          <Reveal delay={60}>
            <GoldRule className={styles.rule} draw />
          </Reveal>
        </div>

        <Reveal delay={100}>
          <ul className={styles.list}>
            {faq.map((item) => (
              <li key={item.question} className={styles.item}>
                <details className={styles.details}>
                  <summary className={styles.summary}>
                    <span>{item.question}</span>
                    <span className={styles.marker} aria-hidden="true" />
                  </summary>
                  <p className={styles.answer}>{item.reponse}</p>
                </details>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
