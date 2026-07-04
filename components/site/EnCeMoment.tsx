import { SectionLabel } from "@/components/SectionLabel";
import { GoldRule } from "@/components/GoldRule";
import { Reveal } from "@/components/Reveal";
import { evenements as evenementsParDefaut, type Evenement } from "@/data/evenements";
import { evenementsAVenir } from "@/lib/evenements";
import { dateLongueFr } from "@/lib/creneaux";
import styles from "./EnCeMoment.module.css";

type EnCeMomentProps = {
  /** Injectable en test — par défaut, les événements de data/evenements.ts. */
  liste?: readonly Evenement[];
};

/* Section rendue côté serveur : la liste est filtrée à la génération de la
   page (revalidée quotidiennement). Sans événement à venir, rien ne s'affiche. */
export function EnCeMoment({ liste = evenementsParDefaut }: EnCeMomentProps) {
  const aVenir = evenementsAVenir(liste);
  if (aVenir.length === 0) return null;

  return (
    <section id="en-ce-moment" className={styles.section}>
      <div className="u-container u-narrow">
        <Reveal>
          <div className={styles.head}>
            <SectionLabel onDark>En ce moment</SectionLabel>
            <h2 className={styles.title}>Les soirs qui comptent</h2>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <GoldRule className={styles.rule} draw />
        </Reveal>

        <div className={styles.grid}>
          {aVenir.map((evt, i) => (
            <Reveal key={evt.id} delay={i * 90}>
              <article className={styles.card}>
                <p className={styles.quand}>
                  {evt.date ? (
                    <>
                      {dateLongueFr(evt.date)}
                      {evt.heure ? ` · ${evt.heure.replace(":", "h")}` : ""}
                    </>
                  ) : (
                    evt.recurrence
                  )}
                </p>
                <h3 className={styles.cardTitle}>{evt.titre}</h3>
                <p className={styles.cardText}>{evt.description}</p>
                {evt.lien && (
                  <a className={styles.lien} href={evt.lien.url}>
                    {evt.lien.label}
                  </a>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
